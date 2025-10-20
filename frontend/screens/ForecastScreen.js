import React, { useMemo, useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, Image, SafeAreaView } from 'react-native';
import styles from '../styles';
import { format, addDays, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import Constants from 'expo-constants'; // <-- added

function buildForecastFrom(startDate, count = 5) {
  const days = [];
  for (let i = 0; i < count; i++) {
    const d = addDays(startDate, i);
    days.push({
      id: i + 1,
      date: d,
      dayNumber: format(d, 'dd', { locale: es }),
      weekdayShort: format(d, 'EEE', { locale: es }),
      // placeholders until backend response replaces them
      temp: 18 - i,
      realFeel: 19 - i,
      icon: i === 0 ? '☀️' : (i === 3 ? '🌦️' : '☁️'),
      rain: i === 3 ? 18 : 0,
      // will be filled from backend:
      probability: null,
      condition: null,
    });
  }
  return days;
}

export default function ForecastScreen({ navigation, route }) {
  const { selectedDate: selectedDateIso, locationLabel } = route.params || {};
  const baseDate = useMemo(() => {
    try { return selectedDateIso ? parseISO(selectedDateIso) : new Date(); } catch (e) { return new Date(); }
  }, [selectedDateIso]);

  // BACKEND_URL resolution for Expo:
  // - If route.params.backendHost provided, use it
  // - else try to extract IP from Expo debuggerHost (works when running via Expo devtools)
  // - fallback to localhost
  const hostFromDebug = Constants.manifest?.debuggerHost?.split(':')[0] ?? null;
  const BACKEND_HOST = route.params?.backendHost ?? hostFromDebug ?? 'localhost';
  const BACKEND_URL = `http://${BACKEND_HOST}:8000`; // ajustar puerto si hace falta

  const latParam = route.params?.lat ?? -34.9011;
  const lonParam = route.params?.lon ?? -56.1645;

  const [forecastData, setForecastData] = useState(() => buildForecastFrom(baseDate, 5));

  // rebuild initial days whenever baseDate changes, then fetch backend probabilities
  useEffect(() => {
    const built = buildForecastFrom(baseDate, 5);
    setForecastData(built);

    let mounted = true;
    const fetchForDay = async (day) => {
      const dateStr = format(day.date, 'yyyy-MM-dd');
      console.log(`[Forecast] attempting POST ${BACKEND_URL}/probability for date ${dateStr}, lat=${latParam}, lon=${lonParam}`);
      try {
        const res = await fetch(`${BACKEND_URL}/probability`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ lat: latParam, lon: lonParam, date: dateStr }),
        });
        console.log(`[Forecast] received HTTP ${res.status} for ${dateStr}`);
        if (!res.ok) {
          const text = await res.text().catch(() => '');
          console.warn(`[Forecast] non-ok response for ${dateStr}: ${res.status} ${text}`);
          throw new Error('Network response was not ok');
        }
        const json = await res.json();
        console.log(`[Forecast] successful response for ${dateStr}:`, json);
        if (!mounted) return;
        setForecastData(prev => prev.map(d => d.id === day.id ? {
          ...d,
          probability: json.probability,
          condition: json.condition,
          // use backend temperatures if present, fallback to previous temp
          temp: json.temperature_max != null ? Math.round(json.temperature_max) : d.temp,
          realFeel: (json.temperature_max != null && json.temperature_min != null)
            ? Math.round((json.temperature_max + json.temperature_min) / 2)
            : d.realFeel,
          rain: json.probability != null ? Math.round(json.probability * 100) : d.rain,
        } : d));
      } catch (e) {
        console.warn('Probability fetch error', e);
      }
    };

    // kick off requests for each built day (no await; parallel)
    built.forEach(day => fetchForDay(day));

    return () => { mounted = false; };
  }, [baseDate, latParam, lonParam]);

  const selectMonkeyForWeather = (temp, rain, condition) => {
    // Prioriza lluvia por condición o probabilidad alta
    if (condition === 'rainy' || (typeof rain === 'number' && rain >= 80)) return require('../assets/monkey-lluvia.png');
    if (temp <= 10) return require('../assets/monkey-frio.png');
    if (temp > 10 && temp <= 15) return require('../assets/monkey-fresco.png');
    if (temp > 15 && temp <= 20) return require('../assets/monkey-normal.png');
    return require('../assets/monkey-calor.png');
  };

  const handleDayPress = (item, index) => {
    navigation.navigate('Details', { forecastData, selectedIndex: index, locationLabel });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={[styles.container, { paddingTop: 12 }]}>
        <View style={{ alignItems: 'center', marginBottom: 8 }}>
          <View style={{ backgroundColor: '#0F3140', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20 }}>
            <Text style={{ color: '#CFE9FF', fontWeight: '600' }}>📍 {locationLabel || 'Montevideo, Uruguay'}</Text>
          </View>
        </View>

        <FlatList
          data={forecastData}
          keyExtractor={(it) => it.id.toString()}
          renderItem={({ item, index }) => (
            <TouchableOpacity style={styles.weatherCard} onPress={() => handleDayPress(item, index)}>
              <View style={{ flexDirection: 'row', alignItems: 'center', width: '100%' }}>
                <View style={{ width: 54, height: 54, borderRadius: 27, backgroundColor: '#0B2A3A', justifyContent: 'center', alignItems: 'center', marginRight: 12, paddingVertical: 4 }}>
                  <Text style={{ color: '#9EC3FF', fontSize: 12 }}>{item.weekdayShort}</Text>
                  <Text style={{ color: '#CFE9FF', fontWeight: '700', fontSize: 16 }}>{item.dayNumber}</Text>
                </View>

                <View style={{ width: 40, alignItems: 'center' }}>
                  <Text style={{ fontSize: 22 }}>
                    {/* if backend provided condition, map a simple icon */}
                    { item.condition === 'sunny' ? '☀️' : item.condition === 'rainy' ? '🌧️' : item.condition === 'cloudy' ? '☁️' : item.icon }
                  </Text>
                </View>

                <View style={{ flex: 1, alignItems: 'center' }}>
                  <Text style={{ color: '#FFF', fontSize: 18 }}>{item.temp}°</Text>
                </View>

                <View style={{ width: 110, alignItems: 'center' }}>
                  <Text style={{ color: '#CFE3FF', fontSize: 12 }}>{item.realFeel}° RealFeel</Text>
                </View>

                <View style={{ width: 50, alignItems: 'center' }}>
                  <Text style={{ color: '#9EC3FF' }}>💧{item.rain}%</Text>
                </View>
              </View>
            </TouchableOpacity>
          )}
        />

        <Text style={[styles.detailDate, { textAlign: 'center' }]}>{format(baseDate, "EEEE, d 'de' MMMM", { locale: es })}</Text>

        <View style={[styles.detailBox, { flexDirection: 'row', alignItems: 'center' }]}>
          <View style={{ width: 120, height: 120, borderRadius: 10, borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)', justifyContent: 'center', alignItems: 'center', marginRight: 12 }}>
            <Image
              source={selectMonkeyForWeather(
                forecastData[0]?.temp ?? 18,
                forecastData[0]?.rain ?? 0,
                forecastData[0]?.condition
              )}
              style={styles.monkeyIcon}
            />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ color: '#CFE9FF', fontWeight: '600', marginBottom: 6 }}>Recomendación:</Text>
            <Text style={styles.recommendationText}>Go out with some warm clothing.
              The day is a bit windy and without solar heat.</Text>
          </View>
        </View>

        <TouchableOpacity style={[styles.button, { borderRadius: 28, paddingVertical: 14, marginTop: 10 }]} onPress={() => { }}>
          <Text style={[styles.buttonText, { color: '#0F2B3A' }]}>Download Weather</Text>
        </TouchableOpacity>

      </View>
    </SafeAreaView>
  );
}
