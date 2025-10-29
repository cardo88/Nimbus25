import React, { useState, useEffect } from 'react';
import { SafeAreaView, View, Text, FlatList, TouchableOpacity, Alert } from 'react-native';
import styles from '../styles/History';

const API_BASE = 'http://localhost:8080';
const ENDPOINT_URL = `${API_BASE}/history`;

export default function HistoryScreen({ navigation }) {
  const [items, setItems] = useState([]);

  const load = async () => {
    try {
      const res = await fetch(ENDPOINT_URL);
      if (!res.ok) throw new Error('Error al obtener historial');
      const data = await res.json();
      const hist = Array.isArray(data.history) ? data.history : [];

      const withTs = hist
        .map((it) => {
          const inputs = it.inputs || {};
          const raw = it.timestamp || it.ts || inputs.date || null;
          const ts = raw ? new Date(raw).getTime() : 0;
          const lat = inputs.lat !== undefined ? inputs.lat : it.lat;
          const lon = inputs.lon !== undefined ? inputs.lon : it.lon;
          return { original: it, ts, lat, lon };
        })
        .sort((a, b) => b.ts - a.ts);

      const groups = [];
      const seenCoordsTime = new Set();
      for (const w of withTs) {
        const latVal = w.lat !== undefined && w.lat !== null ? Number(w.lat) : w.original?.inputs?.lat !== undefined ? Number(w.original.inputs.lat) : null;
        const lonVal = w.lon !== undefined && w.lon !== null ? Number(w.lon) : w.original?.inputs?.lon !== undefined ? Number(w.original.inputs.lon) : null;
        const latKey = latVal !== null ? latVal.toFixed(6) : '';
        const lonKey = lonVal !== null ? lonVal.toFixed(6) : '';
        const coordKey = `${latKey}|${lonKey}`;
        const timeWindowKey = Math.round((w.ts || 0) / 5000);
        const groupKey = `${coordKey}::${timeWindowKey}`;
        if (!seenCoordsTime.has(groupKey)) {
          seenCoordsTime.add(groupKey);
          const original = { ...w.original, __coordKey: coordKey };
          groups.push(original);
        }
      }

      const uiItems = groups.slice(0, 50);
      setItems(uiItems);

      const toEnrich = uiItems.filter((it) => !(it.label || it.formattedLabel)).slice(0, 20);
      if (toEnrich.length > 0) {
        const enrichOne = async (it) => {
          const inputs = it.inputs || {};
          const lat = inputs.lat !== undefined ? inputs.lat : it.lat;
          const lon = inputs.lon !== undefined ? inputs.lon : it.lon;
          if (lat === undefined || lon === undefined) return null;
          try {
            const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${encodeURIComponent(lat)}&lon=${encodeURIComponent(lon)}&addressdetails=1`;
            const r = await fetch(url);
            if (!r.ok) return null;
            const j = await r.json();
            let label = j.display_name || '';
            if (j.address) {
              const road = j.address.road || j.address.pedestrian || j.address.footway || '';
              const housenumber = j.address.house_number || '';
              const city = j.address.city || j.address.town || j.address.village || '';
              const state = j.address.county || j.address.state || '';
              const country = j.address.country || '';
              const streetPart = road ? (housenumber ? `${road} ${housenumber}` : road) : '';
              if (streetPart) label = [streetPart, city || state, country].filter(Boolean).join(', ');
              else label = [city || state, country].filter(Boolean).join(', ') || label;
            }
            return { coordKey: it.__coordKey, formattedLabel: label };
          } catch (e) {
            return null;
          }
        };

        await Promise.all(
          toEnrich.map(async (it) => {
            const res = await enrichOne(it);
            if (res && res.formattedLabel) {
              setItems((prev) => prev.map((p) => (p.__coordKey === res.coordKey ? { ...p, formattedLabel: res.formattedLabel } : p)));
            }
          })
        );
      }
    } catch (e) {
      console.warn('Failed to load history', e);
      setItems([]);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const clearAll = () => {
    Alert.alert('Confirmar', 'Borrar todo el historial?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Borrar',
        style: 'destructive',
        onPress: async () => {
          try {
            await fetch(ENDPOINT_URL, { method: 'DELETE' });
            setItems([]);
          } catch (e) {
            console.warn('Failed to clear history', e);
          }
        },
      },
    ]);
  };

  const deleteItem = async (itemToDelete) => {
    try {
      await fetch(`${ENDPOINT_URL}/${itemToDelete.id}`, { method: 'DELETE' });
      setItems(items.filter((i) => i.id !== itemToDelete.id));
    } catch (e) {
      console.warn('Failed to delete history item', e);
    }
  };

  const onSelect = (item) => {
    const inputs = item.inputs || {};
    const lat = inputs.lat !== undefined ? Number(inputs.lat) : item.lat !== undefined ? Number(item.lat) : undefined;
    const lon = inputs.lon !== undefined ? Number(inputs.lon) : item.lon !== undefined ? Number(item.lon) : undefined;
    const label = item.label || item.formattedLabel || (lat !== undefined && lon !== undefined ? `${lat.toFixed(4)}, ${lon.toFixed(4)}` : 'Sin etiqueta');

    Alert.alert('Usar búsqueda guardada', label, [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Ir al mapa',
        style: 'default',
        onPress: () => {
          if (lat === undefined || lon === undefined || isNaN(lat) || isNaN(lon)) {
            Alert.alert('Coordenadas no disponibles', 'El elemento seleccionado no tiene coordenadas válidas para centrar el mapa.');
            return;
          }
          navigation.navigate('Home', { focusLocation: { lat, lon, label } });
        },
      },
    ]);
  };

  const render = ({ item }) => {
    const inputs = item.inputs || {};
    const lat = inputs.lat !== undefined ? inputs.lat : item.lat;
    const lon = inputs.lon !== undefined ? inputs.lon : item.lon;
    const label = item.label || item.formattedLabel || (inputs.lat ? `${lat.toFixed(4)}, ${lon.toFixed(4)}` : 'Sin etiqueta');

    // Fecha
    const rawDate = item.timestamp || item.ts || inputs.date;
    let dateLabel = 'Sin fecha';
    if (rawDate) {
      const d = new Date(rawDate);
      if (!isNaN(d.getTime())) dateLabel = d.toLocaleString();
    }

    // Temperaturas: usar nombres más comunes y simplificar fallbacks
    const tmaxVal = (item.temperature_max !== undefined) ? Number(item.temperature_max) : (item.temp_max !== undefined ? Number(item.temp_max) : (item.temp !== undefined ? Number(item.temp) : null));
    const tminVal = (item.temperature_min !== undefined) ? Number(item.temperature_min) : (item.temp_min !== undefined ? Number(item.temp_min) : null);
    const tmax = !isNaN(tmaxVal) && tmaxVal !== null ? Math.round(tmaxVal) : null;
    const tmin = !isNaN(tminVal) && tminVal !== null ? Math.round(tminVal) : null;

    // Probabilidad / lluvia: 0..1 o 0..100 (simplificado)
    let rainNum = null;
    if (item.probability !== undefined) {
      const p = Number(item.probability);
      if (!isNaN(p)) rainNum = p <= 1 ? Math.round(p * 100) : Math.round(p);
    } else if (item.rain !== undefined) {
      const r = Number(item.rain);
      if (!isNaN(r)) rainNum = Math.round(r);
    } else if (item.prob !== undefined) {
      const r = Number(item.prob);
      if (!isNaN(r)) rainNum = r <= 1 ? Math.round(r * 100) : Math.round(r);
    }

    // Emoji de condición (simple)
    const condRaw = (item.condition || item.weather || '').toString().toLowerCase();
    let condEmoji = '';
    if (condRaw.includes('rain') || condRaw.includes('lluv')) condEmoji = '🌧️';
    else if (condRaw.includes('cloud') || condRaw.includes('nublado')) condEmoji = '☁️';
    else if (condRaw.includes('wind') || condRaw.includes('viento')) condEmoji = '🍃';
    else if (condRaw.includes('sun') || condRaw.includes('sol')) condEmoji = '☀️';

    const showTmaxLarge = tmax != null;
    const showTminSmall = tmin != null && tmax != null;

    const weatherRow = (tmax == null && tmin == null && rainNum == null && !condEmoji) ? null : (
      <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 2 }}>
        <View style={{ flexDirection: 'row', alignItems: 'flex-end', marginRight: 6 }}>
          {showTmaxLarge && (
            <Text style={{ fontSize: 20, lineHeight: 30, fontWeight: '700', color: '#FFFFFF' }}>{`${tmax}°`}</Text>
          )}
          {!showTmaxLarge && tmin != null && (
            <Text style={{ fontSize: 20, lineHeight: 30, fontWeight: '700', color: '#FFFFFF' }}>{`${tmin}°`}</Text>
          )}
          {showTminSmall && (
            <Text style={{ fontSize: 16, marginLeft: 10, color: '#C9D6E3' }}>{`${tmin}°`}</Text>
          )}
        </View>

        {condEmoji ? <Text style={{ fontSize: 18, marginLeft: 2 }}>{condEmoji}</Text> : null}

        {rainNum != null ? (
          <Text style={{ marginLeft: 8, color: '#9EC3FF', fontWeight: '600', fontSize: 14 }}>{`💧${rainNum}%`}</Text>
        ) : null}
      </View>
    );

    return (
      <View style={styles.row}>
        <TouchableOpacity style={styles.rowInner} onPress={() => onSelect(item)}>
          <View style={{ flex: 1 }}>
            <Text style={styles.label}>{label}</Text>
            {weatherRow}
            <Text style={styles.sub}>{(lat !== undefined && lon !== undefined) ? `${lat.toFixed(4)} ${lon.toFixed(4)}` : ''}  {dateLabel}</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity style={styles.deleteBtn} onPress={() => deleteItem(item)}>
          <Text style={styles.deleteIcon}>❌</Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Historial</Text>
        <TouchableOpacity onPress={clearAll}><Text style={styles.clear}>Borrar todo</Text></TouchableOpacity>
      </View>
      <FlatList data={items} keyExtractor={(i, idx) => (i.id || idx).toString()} renderItem={render} ListEmptyComponent={() => <Text style={styles.empty}>No hay historial</Text>} />
    </SafeAreaView>
  );
}