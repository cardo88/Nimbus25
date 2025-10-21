import React, { useMemo } from 'react';
import { View, Text, FlatList, TouchableOpacity, Image, SafeAreaView } from 'react-native';
import styles from '../styles';
import { format, addDays, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';

function buildForecastFrom(startDate, count = 5) {
  const days = [];
  for (let i = 0; i < count; i++) {
    const d = addDays(startDate, i);
    days.push({
      id: i + 1,
      date: d,
      dayNumber: format(d, 'dd', { locale: es }),
      weekdayShort: format(d, 'EEE', { locale: es }),
      temp: 18 - i,
      realFeel: 19 - i,
      icon: i === 0 ? '☀️' : (i === 3 ? '🌦️' : '☁️'),
      rain: i === 3 ? 18 : 0,
    });
  }
  return days;
}

export default function ForecastScreen({ navigation, route }) {
  const { selectedDate: selectedDateIso, locationLabel } = route.params || {};
  const baseDate = useMemo(() => {
    try { return selectedDateIso ? parseISO(selectedDateIso) : new Date(); } catch (e) { return new Date(); }
  }, [selectedDateIso]);

  const forecastData = useMemo(() => buildForecastFrom(baseDate, 5), [baseDate]);

  const selectMonkeyForWeather = (temp, rain) => {
    if (rain >= 80) return require('../assets/monkey-lluvia.png');
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
                  <Text style={{ fontSize: 22 }}>{item.icon}</Text>
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
            <Image source={selectMonkeyForWeather(forecastData[0].temp, forecastData[0].rain)} style={styles.monkeyIcon} />
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
