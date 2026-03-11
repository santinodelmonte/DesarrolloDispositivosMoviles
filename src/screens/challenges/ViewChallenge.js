import React from 'react';// Importa React y los componentes necesarios de React Native
import { View, Text, StyleSheet, SafeAreaView, ScrollView } from 'react-native';// Importa los componentes necesarios de React Native

const ViewChallenge = ({ route }) => { // Componente para visualizar los detalles de un reto
  const { challenge } = route.params; // Obtiene el reto desde los parámetros de la ruta
  if (!challenge) return null; // Si no hay reto, retorna null para evitar errores
  return (// Renderiza la vista del reto
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>{challenge.nombre}</Text>
        <Text style={styles.label}>Descripción:</Text>
        <Text style={styles.value}>{challenge.descripcion}</Text>
        <Text style={styles.label}>Categoría:</Text>
        <Text style={styles.value}>{challenge.categoria}</Text>
        <Text style={styles.label}>Puntaje:</Text>
        <Text style={styles.value}>{challenge.puntos || challenge.puntaje}</Text>
        <Text style={styles.label}>Fecha límite:</Text>
        <Text style={styles.value}>{new Date(challenge.fechaLimite).toLocaleDateString()}</Text>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({ // Estilos para la vista del reto    
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  content: {
    padding: 24,
  },
  title: {
    color: '#22c55e',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  label: {
    color: '#22c55e',
    fontWeight: 'bold',
    fontSize: 16,
    marginTop: 12,
  },
  value: {
    color: '#222',
    fontSize: 16,
    marginBottom: 4,
  },
});

export default ViewChallenge;
