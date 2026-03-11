import React from 'react';// Importa React y los componentes necesarios de React Native
import { View, Text, StyleSheet, SafeAreaView } from 'react-native'; // Importa los componentes necesarios de React Native
import MySingleButton from '../components/MySingleButton';// Importa el componente de botón personalizado

const HomeScreen = ({ navigation }) => { // Componente principal de la pantalla de inicio
  return (// Renderiza la vista de inicio
    <SafeAreaView style={styles.container}>
      <View style={styles.contentContainer}>
        <View style={styles.welcomeCard}>
          <Text style={styles.welcomeTitle}>¡Bienvenido a EcoChallenge!</Text>
          <Text style={styles.welcomeText}>
            La app para desafiarte, aprender y cuidar el planeta. ¡Comienza tu aventura ecológica!
          </Text>
        </View>
        <MySingleButton
          title="Iniciar Sesión"
          customPress={() => navigation.navigate('Login')}
          style={styles.button}
          btnColor="#22c55e"
        />
        <MySingleButton
          title="Registrarse"
          customPress={() => navigation.navigate('RegisterUser')}
          style={styles.button}
          btnColor="#22c55e"
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({ // Estilos para el componente
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  contentContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 12,
  },
  welcomeCard: {
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: 28,
    marginBottom: 32,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.10,
    shadowRadius: 10,
    elevation: 8,
    width: '100%',
  },
  welcomeTitle: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#22c55e',
    marginBottom: 8,
    textAlign: 'center',
    letterSpacing: 1,
  },
  welcomeText: {
    fontSize: 16,
    color: '#334155',
    textAlign: 'center',
    marginBottom: 4,
  },
  button: {
    marginTop: 10,
    width: '100%',
    borderRadius: 14,
    shadowColor: '#000',
    shadowOpacity: 0.10,
    shadowRadius: 8,
    elevation: 6,
  },
});

export default HomeScreen;
