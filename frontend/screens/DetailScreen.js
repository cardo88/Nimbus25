import React, { useState, useMemo, useRef, useEffect } from 'react';
import { View, Text, TouchableOpacity, SafeAreaView, FlatList, Image, Dimensions, Platform, Modal, Alert } from 'react-native';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import styles from '../styles/Detail';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

export default function DetailScreen({ route, navigation }) {
  const { forecastData = [], selectedIndex = 0, locationLabel } = route.params || {};
  const safeIndex = Math.max(0, Math.min(selectedIndex, (forecastData.length || 1) - 1));
  const [activeIndex, setActiveIndex] = useState(safeIndex);
  const [downloadModalVisible, setDownloadModalVisible] = useState(false);
  const listRef = useRef(null);

  useEffect(() => {
    if (!listRef.current || typeof activeIndex !== 'number') return;
    try {
      listRef.current.scrollToIndex({ index: activeIndex, viewPosition: 0.5, animated: true });
    } catch (e) {
      // ignore out-of-range errors
    }
  }, [activeIndex]);

  const screenWidth = Dimensions.get('window').width;
  const horizontalPadding = 24;
  const fixedCount = 5;
  const itemCount = fixedCount;
  const itemWidth = Math.floor((screenWidth - horizontalPadding) / fixedCount);

  const daysForList = (() => {
    const arr = Array.from(forecastData || []);
    if (arr.length >= fixedCount) return arr.slice(0, fixedCount);
    const padded = arr.slice();
    while (padded.length < fixedCount) {
      padded.push({ id: `pad-${padded.length}`, date: null, dayNumber: '', weekdayShort: '', temp: undefined, icon: null, rain: 0 });
    }
    return padded;
  })();

  const selectMonkeyForWeather = (temp, rain) => {
    if (rain >= 80) return require('../assets/monkey-lluvia.png');
    if (temp <= 10) return require('../assets/monkey-frio.png');
    if (temp > 10 && temp <= 15) return require('../assets/monkey-fresco.png');
    if (temp > 15 && temp <= 20) return require('../assets/monkey-normal.png');
    return require('../assets/monkey-calor.png');
  };

  const activeDay = useMemo(() => forecastData[activeIndex] || {}, [forecastData, activeIndex]);

  const renderDayItem = ({ item, index }) => {
    const isActive = index === activeIndex;
    return (
      <TouchableOpacity onPress={() => setActiveIndex(index)} style={{ width: itemWidth, justifyContent: 'center', alignItems: 'center' }}>
        <View style={{ width: 56, height: 56, borderRadius: 28, backgroundColor: isActive ? '#4A90E2' : '#0B2A3A', justifyContent: 'center', alignItems: 'center', marginBottom: 6 }}>
          <Text style={{ color: isActive ? '#fff' : '#9EC3FF', fontSize: 12 }}>{item.weekdayShort}</Text>
          <Text style={{ color: isActive ? '#fff' : '#CFE9FF', fontWeight: '700' }}>{item.dayNumber}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  // Utilidad para exportar a CSV
  const toCSV = (obj) => {
    const keys = Object.keys(obj);
    const values = keys.map(k => obj[k]);
    return keys.join(',') + '\n' + values.join(',');
  };

  // Utilidad para exportar a JSON
  const toJSON = (obj) => JSON.stringify(obj, null, 2);

  // Maneja la descarga y compartir
  const handleDownload = async (format) => {
    try {
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
        // En iOS/Android, shareAsync permite guardar o compartir el archivo
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

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={{ alignItems: 'center', marginVertical: 8 }}>
          <View style={{ backgroundColor: '#0F3140', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20 }}>
            <Text style={{ color: '#CFE9FF', fontWeight: '600' }}>📍 {locationLabel || 'Montevideo, Uruguay'}</Text>
          </View>
        </View>

        <View style={{ height: 96 }}>
          <FlatList
            data={daysForList}
            horizontal
            showsHorizontalScrollIndicator={false}
            keyExtractor={(it) => it.id.toString()}
            renderItem={renderDayItem}
            ref={listRef}
            getItemLayout={(data, index) => ({ length: itemWidth, offset: itemWidth * index, index })}
            contentContainerStyle={{ paddingHorizontal: horizontalPadding / 2, alignItems: 'center' }}
          />
        </View>
        <View style={{ paddingHorizontal: 16 }}>
          <Text style={[styles.detailDate, { textAlign: 'center' }]}>{format(activeDay.date || new Date(), "EEEE, d 'de' MMMM", { locale: es })}</Text>

          <View style={[styles.detailBox, { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 12 }]}> 
            <View style={{ width: 84, alignItems: 'center' }}>
              {activeDay.temp !== undefined ? <Image source={selectMonkeyForWeather(activeDay.temp, activeDay.rain || 0)} style={[styles.monkeyIcon, { width: 84, height: 84 }]} /> : null}
            </View>
            <View style={{ flex: 1, paddingLeft: 12 }}>
              <Text style={{ color: '#CFE9FF', fontWeight: '600', marginBottom: 6 }}>Recomendación:</Text>
              <Text style={styles.recommendationText}>{activeDay.recommendation || 'Sal con algo de ropa fresca'}</Text>
              <Text style={[styles.recommendationText, { marginTop: 6 }]}>{activeDay.recommendation2 || 'El día esta un poco ventoso y con calor solar.'}</Text>
            </View>
          </View>

          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 6 }}>
        <View style={{ flexDirection: 'row', alignItems: 'baseline' }}>
          <Text style={{ color: '#FFF', fontSize: 32, fontWeight: '700', marginRight: 4, lineHeight: 36 }}>{activeDay.temp !== undefined ? `${activeDay.temp}°` : '--'}</Text>
          <View style={{ alignItems: 'baseline', marginLeft: 2 }}>
                  {(() => {
                    const minRaw = activeDay.minTemp ?? activeDay.min ?? (activeDay.temp !== undefined ? Math.max(0, activeDay.temp - 8) : undefined);
                    const minText = (minRaw !== undefined && minRaw !== null) ? `${minRaw}°` : '';
                      return (
                      <View style={{ flexDirection: 'row', alignItems: 'baseline' }}>
                        <Text style={{ color: '#CFE9FF', fontSize: 18, fontWeight: '600', marginRight: 4, lineHeight: 20 }}>{minText}</Text>
                        <Text style={{ fontSize: 32, lineHeight: 32 }}>{activeDay.icon || '☀️'}</Text>
                      </View>
                    );
                  })()}
              </View>
            </View>
          </View>

          <View style={{ height: 140, marginTop: 12, borderRadius: 12, borderWidth: 1, borderColor: 'rgba(255,255,255,0.12)', backgroundColor: 'transparent' }} />

          <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 16 }}>
            <Text style={{ fontSize: 32, color: '#9EC3FF', marginRight: 10 }}>💧</Text>
            <Text style={{ color: '#CFE9FF', fontWeight: '600' }}>{activeDay.rain || 0}%</Text>
            <Text style={{ color: '#CFE9FF', marginLeft: 8 }}>Probabilidad de presipitación</Text>
          </View>

          <View style={{ height: Platform.OS === 'ios' ? 90 : 80 }} />
        </View>
      </View>
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
    </SafeAreaView>
  );
}
