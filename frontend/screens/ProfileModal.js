import React from 'react';
import { Modal, View, Text, TouchableOpacity } from 'react-native';
import { TouchableWithoutFeedback } from 'react-native';
import styles from '../styles/ProfileModal';

export default function ProfileModal({ visible, onClose, onSelect, navigation }) {
  return (
    <Modal visible={visible} transparent animationType="slide">
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.backdrop}>
          <TouchableWithoutFeedback>
            <View style={styles.sheet}>
              <Text style={styles.title}>Configuración</Text>
              <TouchableOpacity style={styles.item} onPress={() => { onClose(); navigation?.navigate?.('History'); }}>
                <Text style={styles.itemText}>Historial</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.item} onPress={() => { onClose(); navigation?.navigate?.('Profile'); }}>
                <Text style={styles.itemText}>Usuario</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.item} onPress={() => { onSelect && onSelect('logout'); onClose && onClose(); }}>
                <Text style={[styles.itemText, { color: '#E53935' }]}>Cerrar sesión</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
                <Text style={styles.closeText}>Cerrar</Text>
              </TouchableOpacity>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}
