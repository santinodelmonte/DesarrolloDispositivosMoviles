import React, { useState, useEffect } from 'react'; // Importar React y hooks necesarios
import { View, Text, TextInput, Button, StyleSheet, SafeAreaView, ScrollView } from 'react-native'; // Importar componentes de React Native
import AsyncStorage from '@react-native-async-storage/async-storage'; // Importar AsyncStorage para manejar almacenamiento local

const UpdateChallenge = ({ route, navigation }) => { // Componente para actualizar un reto existente
  const { challenge } = route.params;
  const [nombre, setNombre] = useState(challenge.nombre);
  const [descripcion, setDescripcion] = useState(challenge.descripcion);
  const [categoria, setCategoria] = useState(challenge.categoria || '');
  const [puntaje, setPuntaje] = useState(challenge.puntos || challenge.puntaje);
  const [fechaLimite, setFechaLimite] = useState(challenge.fechaLimite);

  const handleUpdate = async () => {  // Función para manejar la actualización del reto
    const stored = await AsyncStorage.getItem('challenges');
    let challenges = stored ? JSON.parse(stored) : [];
    const idx = challenges.findIndex(c => c.id === challenge.id);
    if (idx !== -1) { // Verificar si el reto existe
      challenges[idx] = { // Actualizar el reto con los nuevos valores
        ...challenges[idx],
        nombre,
        descripcion,
        categoria,
        puntaje: puntaje,
        fechaLimite
      };
      await AsyncStorage.setItem('challenges', JSON.stringify(challenges));
      navigation.goBack();
    }
  };

  return ( // Renderizar la pantalla de actualización de reto
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.card}>
          <Text style={styles.title}>Editar Reto</Text>
          <TextInput
            style={styles.input}
            value={nombre}
            onChangeText={setNombre}
            placeholder="Nombre"
            placeholderTextColor="#94a3b8"
          />
          <TextInput
            style={[styles.input, {height: 80}]}
            value={descripcion}
            onChangeText={setDescripcion}
            placeholder="Descripción"
            placeholderTextColor="#94a3b8"
            multiline
          />
          <TextInput
            style={styles.input}
            value={categoria}
            onChangeText={setCategoria}
            placeholder="Categoría"
            placeholderTextColor="#94a3b8"
          />
          <TextInput
            style={styles.input}
            value={puntaje.toString()}
            onChangeText={t => setPuntaje(Number(t))}
            placeholder="Puntaje"
            placeholderTextColor="#94a3b8"
            keyboardType="numeric"
          />
          <TextInput
            style={styles.input}
            value={fechaLimite}
            onChangeText={setFechaLimite}
            placeholder="Fecha Límite (YYYY-MM-DD)"
            placeholderTextColor="#94a3b8"
          />
          <View style={styles.buttonContainer}>
            <Text style={styles.buttonText} onPress={handleUpdate} accessibilityRole="button">
              Guardar Cambios
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({// Estilos para la pantalla de actualización de reto
  container: { flex: 1, backgroundColor: '#f8fafc' },
  scrollContent: { flexGrow: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    width: '100%',
    maxWidth: 400,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    marginTop: 32,
    marginBottom: 32,
  },
  title: { fontSize: 24, fontWeight: 'bold', color: '#22c55e', marginBottom: 20, textAlign: 'center' },
  input: {
    backgroundColor: '#f1f5f9',
    borderRadius: 8,
    padding: 14,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    fontSize: 16,
    color: '#222',
  },
  buttonContainer: {
    backgroundColor: '#22c55e',
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 10,
    shadowColor: '#22c55e',
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 2,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 18,
    letterSpacing: 1,
  },
});

export default UpdateChallenge;
