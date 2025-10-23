import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Image, SafeAreaView, Alert } from 'react-native';
import styles from '../styles/Profile';

const initialUser = {
  avatar: require('../assets/monkey.png'),
  name: 'Usuario Ejemplo',
  email: 'usuario@email.com',
};

export default function ProfileScreen({ navigation }) {
  const [user, setUser] = useState(initialUser);
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(user.email);

  const handleSave = () => {
    setUser({ ...user, name, email });
    setEditing(false);
    Alert.alert('Guardado', 'Los cambios se guardaron correctamente.');
  };

  const handleLogout = () => {
    Alert.alert('Cerrar sesión', '¿Seguro que deseas salir?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Cerrar sesión', style: 'destructive', onPress: () => {
        navigation.popToTop();
      }},
    ]);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.avatarBox}>
        <Image source={user.avatar} style={styles.avatar} />
      </View>
      <View style={styles.form}>
        <Text style={styles.label}>Nombre</Text>
        <TextInput
          style={styles.input}
          value={name}
          editable={editing}
          onChangeText={setName}
        />
        <Text style={styles.label}>Email</Text>
        <TextInput
          style={styles.input}
          value={email}
          editable={editing}
          onChangeText={setEmail}
          keyboardType="email-address"
        />
        <View style={styles.buttonRow}>
          {editing ? (
            <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
              <Text style={styles.saveText}>Guardar</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity style={styles.editBtn} onPress={() => setEditing(true)}>
              <Text style={styles.editText}>Editar</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
            <Text style={styles.logoutText}>Cerrar sesión</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}
