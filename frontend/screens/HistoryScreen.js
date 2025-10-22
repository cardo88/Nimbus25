import React, { useState, useEffect } from 'react';
import { SafeAreaView, View, Text, FlatList, TouchableOpacity, Alert } from 'react-native';
import styles from '../styles/History';
const ENDPOINT_URL = 'https://tu-backend.com/api/cache'; // Reemplaza por la URL real

export default function HistoryScreen({ navigation }) {
  const [items, setItems] = useState([]);


  const load = async () => {
    try {
      const res = await fetch(ENDPOINT_URL);
      if (!res.ok) throw new Error('Error al obtener historial');
      const data = await res.json();
      setItems(Array.isArray(data) ? data : []);
    } catch (e) {
      console.warn('Failed to load history', e);
      setItems([]);
    }
  };

  useEffect(() => { load(); }, []);


  // Las funciones de borrar y limpiar historial deberían llamar al backend si se requiere
  const clearAll = () => {
    Alert.alert('Confirmar', 'Borrar todo el historial?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Borrar', style: 'destructive', onPress: async () => {
        try {
          await fetch(ENDPOINT_URL, { method: 'DELETE' });
          setItems([]);
        } catch (e) {
          console.warn('Failed to clear history', e);
        }
      } }
    ]);
  };

  const deleteItem = async (itemToDelete) => {
    try {
      await fetch(`${ENDPOINT_URL}/${itemToDelete.id}`, { method: 'DELETE' });
      setItems(items.filter(i => i.id !== itemToDelete.id));
    } catch (e) {
      console.warn('Failed to delete history item', e);
    }
  };

  const onSelect = (item) => {
    Alert.alert(
      'Usar búsqueda guardada',
      item.label || 'Sin etiqueta',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Ir al mapa', style: 'default', onPress: () => {
            navigation.navigate('Home', { focusLocation: { lat: item.lat, lon: item.lon, label: item.label } });
          } },
      ]
    );
  };

  const render = ({ item }) => (
    <View style={styles.row}>
      <TouchableOpacity style={styles.rowInner} onPress={() => onSelect(item)}>
        <View style={{ flex: 1 }}>
          <Text style={styles.label}>{item.label}</Text>
          <Text style={styles.sub}>{item.lat?.toFixed?.(4) || ''} {item.lon?.toFixed?.(4) || ''} • {new Date(item.ts).toLocaleString()}</Text>
        </View>
      </TouchableOpacity>
      <TouchableOpacity style={styles.deleteBtn} onPress={() => deleteItem(item)}>
        <Text style={styles.deleteIcon}>❌</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Historial</Text>
        <TouchableOpacity onPress={clearAll}><Text style={styles.clear}>Borrar todo</Text></TouchableOpacity>
      </View>
      <FlatList data={items} keyExtractor={(i,idx)=> (i.id || idx).toString()} renderItem={render} ListEmptyComponent={() => <Text style={styles.empty}>No hay historial</Text>} />
    </SafeAreaView>
  );
}
