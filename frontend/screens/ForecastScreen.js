import React, { useMemo, useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, Image, SafeAreaView, Platform, Modal, Alert } from 'react-native';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import styles from '../styles';
import { format, addDays, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import Constants from 'expo-constants';

function buildForecastFrom(startDate, count = 5) {
  const days = [];
  for (let i = 0; i < count; i++) {
    const d = addDays(startDate, i);
    days.push({
      id: i + 1,
      date: d,
      dayNumber: format(d, 'dd', { locale: es }),
      weekdayShort: format(d, 'EEE', { locale: es }),

      temp: null,
      icon: null,
      rain: null,
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

  const hostFromDebug = Constants.manifest?.debuggerHost?.split(':')[0] ?? null;
  const debuggerHost = Constants.manifest?.debuggerHost ?? Constants.expoConfig?.hostUri;
  const hostIP = debuggerHost?.split(':')[0] ?? 'localhost';

  const BACKEND_URL = `http://${hostIP}:8080`;

  const latParam = route.params?.lat ?? -34.9011;
  const lonParam = route.params?.lon ?? -56.1645;
  const previewTemp = route.params?.previewTemp ?? null;
  const previewRain = route.params?.previewRain ?? null;
  const previewCondition = route.params?.previewCondition ?? null;

  const [forecastData, setForecastData] = useState(() => buildForecastFrom(baseDate, 5));
  const [refresh, setRefresh] = useState(false);
  const [downloadModalVisible, setDownloadModalVisible] = useState(false);

  useEffect(() => {
    const built = buildForecastFrom(baseDate, 5);
    if (previewTemp != null || previewRain != null || previewCondition != null) {
      const first = { ...built[0] };
      if (previewTemp != null) first.temp = previewTemp;
      if (previewCondition != null) first.condition = previewCondition;
      if (previewRain != null) {
        first.rain = previewRain;
        first.probability = typeof previewRain === 'number' ? previewRain / 100 : null;
      }
      built[0] = first;
    }
    setForecastData(built);

    let mounted = true;
    console.log("🌐 BACKEND_URL =", BACKEND_URL);
    const fetchForDay = async (day) => {
      if (day.id === 1 && (previewTemp != null || previewRain != null || previewCondition != null)) return;
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
        setForecastData(prev => {
          return prev.map(d => {
            if (d.id === day.id) {
              return {
                ...d,
                probability: json.probability,
                condition: json.condition,
                // use backend temperatures if present, fallback to previous temp
                temp: json.temperature_max != null ? Math.round(json.temperature_max) : null,
                realFeel: (json.temperature_max != null && json.temperature_min != null)
                  ? Math.round((json.temperature_max + json.temperature_min) / 2)
                  : null,
                rain: json.probability != null ? Math.round(json.probability * 100) : null,
              };
            } else {
              return d;
            }
          });
        });
      } catch (e) {
        console.warn('Probability fetch error', e);
      }
    };

    built.forEach(day => fetchForDay(day));

    return () => { mounted = false; };
  }, [baseDate, latParam, lonParam, refresh]); 

const selectMonkeyForWeather = (temp, rain, condition) => {
  if (condition === 'rainy' || (typeof rain === 'number' && rain >= 80)) return require('../assets/monkey-lluvia.png');
  if (condition === 'windy') return require('../assets/monkey-ventoso.png');
  if (condition === 'sunny') return require('../assets/monkey-calor.png');
  if (condition === 'cloudy') return require('../assets/monkey-normal.png');
  
  if (temp != null) {
    if (temp <= 10) return require('../assets/monkey-frio.png');
    if (temp > 10 && temp <= 15) return require('../assets/monkey-fresco.png');
    if (temp > 15 && temp <= 20) return require('../assets/monkey-normal.png');
    return require('../assets/monkey-calor.png');
  }

  return require('../assets/monkey-normal.png');
};


  const handleDayPress = (item, index) => {
    setRefresh(prev => !prev); // Add this line
    navigation.navigate('Details', { forecastData, selectedIndex: index, locationLabel });
  };

  // Maneja la descarga y compartir (similar a DetailScreen)
  const toCSV = (obj) => {
    const keys = Object.keys(obj);
    const values = keys.map(k => obj[k]);
    return keys.join(',') + '\n' + values.join(',');
  };
  const toJSON = (obj) => JSON.stringify(obj, null, 2);

  const handleDownload = async (format) => {
    try {
      const activeDay = forecastData[0] || {};
      let content = '';
      let ext = '';
      if (format === 'csv') {
        content = toCSV(activeDay);
        ext = 'csv';
      } else {
        content = toJSON(activeDay);
        ext = 'json';
      }
      const fileName = `clima_${format}_${Date.now()}.${ext}`;
      const fileUri = FileSystem.documentDirectory + fileName;
      await FileSystem.writeAsStringAsync(fileUri, content, { encoding: FileSystem.EncodingType.UTF8 });

      if (Platform.OS === 'ios' || Platform.OS === 'android') {
        const shareAvailable = await Sharing.isAvailableAsync();
        if (shareAvailable) {
          await Sharing.shareAsync(fileUri, {
            mimeType: format === 'csv' ? 'text/csv' : 'application/json',
            dialogTitle: 'Guardar archivo de clima',
            UTI: format === 'csv' ? 'public.comma-separated-values-text' : 'public.json'
          });
          Alert.alert('Descarga completa', `Archivo ${fileName} guardado exitosamente.`);
        } else {
          Alert.alert('Error', 'No se puede compartir archivos en este dispositivo.');
        }
      }
    } catch (e) {
      Alert.alert('Error al descargar', e.message);
    }
    setDownloadModalVisible(false);
  };

const getRecommendation = (temp, rain, condition) => {
  if (condition === 'rainy' || (typeof rain === 'number' && rain >= 80)) {
    return 'Lleva paraguas o impermeable, se espera lluvia intensa.';
  }
  //if (condition === 'windy') return 'Hace viento, usa ropa ajustada y protege objetos ligeros.';
  if (condition === 'sunny') {
    if (temp != null && temp > 25) return 'Hace calor, lleva ropa ligera y protege tu piel del sol.';
    return 'Día soleado, puedes salir con ropa cómoda.';
  }
  if (condition === 'cloudy') return 'Día nublado, considera llevar una chaqueta ligera.';
  
  // fallback por temperatura si no hay condición
  if (temp != null) {
    if (temp <= 10) return 'Hace frío, usa abrigo, gorro y guantes.';
    if (temp > 10 && temp <= 15) return 'Temperatura fresca, lleva una chaqueta ligera.';
    if (temp > 15 && temp <= 20) return 'Día templado, ropa cómoda es suficiente.';
    return 'Día cálido, usa ropa ligera y cómoda.';
  }

  // fallback default
  return 'Revisa el clima antes de salir.';
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
          contentContainerStyle={{ paddingBottom: Platform.OS === 'ios' ? 220 : 160 }}
          renderItem={({ item, index }) => (
            <TouchableOpacity style={styles.weatherCard} onPress={() => handleDayPress(item, index)}>
              <View style={{ flexDirection: 'row', alignItems: 'center', width: '100%' }}>
                <View style={{ width: 54, height: 54, borderRadius: 27, backgroundColor: '#0B2A3A', justifyContent: 'center', alignItems: 'center', marginRight: 12, paddingVertical: 4 }}>
                  <Text style={{ color: '#9EC3FF', fontSize: 12 }}>{item.weekdayShort}</Text>
                  <Text style={{ color: '#CFE9FF', fontWeight: '700', fontSize: 16 }}>{item.dayNumber}</Text>
                </View>

                <View style={{ width: 120, alignItems: 'center' }}>
                  <Text style={{ fontSize: 22 }}>
                    { item.condition === 'sunny' ? '☀️' :
                      item.condition === 'rainy' ? '🌧️' :
                      item.condition === 'cloudy' ? '☁️' :
                      item.condition === 'windy' ? '🍃' :
                      (item.condition != null ? item.condition : '') 
                    }
                  </Text>
                </View>

                <View style={{ width: 70, alignItems: 'center' }}>
                  <Text style={{ color: '#FFF', fontSize: 18 }}>{item.temp != null ? item.temp + '°' : '--'}</Text>
                </View>

                <View style={{ width: 120, alignItems: 'center' }}>
                  <Text style={{ color: '#9EC3FF' }}>💧{item.rain != null ? item.rain + '%' : '--'}</Text>
                </View>
              </View>
            </TouchableOpacity>
          )}
          ListFooterComponent={() => (
            <>
              <Text style={[styles.detailDate, { textAlign: 'center' }]}>{format(baseDate, "EEEE, d 'de' MMMM", { locale: es })}</Text>

              <View style={[styles.detailBox, { flexDirection: 'row', alignItems: 'center', marginTop: 8 }]}>
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
                  <Text style={styles.recommendationText}>
                    {getRecommendation(
                      forecastData[0]?.temp ?? 18,
                      forecastData[0]?.rain ?? 0,
                      forecastData[0]?.condition
                    )}
                  </Text>
                </View>
              </View>
            </>
          )}
        />

        <View style={{ position: 'absolute', left: 16, right: 16, bottom: Platform.OS === 'ios' ? 20 : 12, alignItems: 'center' }} pointerEvents="box-none">
          <TouchableOpacity style={[styles.button, { borderRadius: 28, paddingVertical: 14, width: '100%' }]} onPress={() => setDownloadModalVisible(true)}>
            <Text style={[styles.buttonText, { color: '#0F2B3A' }]}>Descargar Clima</Text>
          </TouchableOpacity>
        </View>
        {/* Modal para elegir formato */}
        <Modal
          visible={downloadModalVisible}
          transparent
          animationType="fade"
          onRequestClose={() => setDownloadModalVisible(false)}
        >
          <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', alignItems: 'center' }}>
            <View style={{ backgroundColor: '#fff', borderRadius: 16, padding: 24, minWidth: 220, alignItems: 'center' }}>
              <Text style={{ fontWeight: 'bold', fontSize: 18, marginBottom: 18, color: '#0F2B3A' }}>Elegí el formato</Text>
              <TouchableOpacity style={{ marginBottom: 12, backgroundColor: '#4A90E2', borderRadius: 8, paddingVertical: 10, paddingHorizontal: 24 }} onPress={() => handleDownload('csv')}>
                <Text style={{ color: '#fff', fontWeight: '600' }}>CSV</Text>
              </TouchableOpacity>
              <TouchableOpacity style={{ marginBottom: 8, backgroundColor: '#0F2B3A', borderRadius: 8, paddingVertical: 10, paddingHorizontal: 24 }} onPress={() => handleDownload('json')}>
                <Text style={{ color: '#CFE9FF', fontWeight: '600' }}>JSON</Text>
              </TouchableOpacity>
              <TouchableOpacity style={{ marginTop: 10 }} onPress={() => setDownloadModalVisible(false)}>
                <Text style={{ color: '#4A90E2', fontWeight: '600' }}>Cancelar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </View>
    </SafeAreaView>
  );
}
