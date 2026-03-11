import React, { useState } from 'react';// Importa React y useState desde React
import { View, Text, StyleSheet, TextInput, SafeAreaView, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView } from 'react-native'; // Importa los componentes necesarios de React Native
import AsyncStorage from '@react-native-async-storage/async-storage';// Importa AsyncStorage para manejar almacenamiento local
import MySingleButton from '../../components/MySingleButton';// Importa el botón personalizado
import AppModal from '../../components/AppModal';// Importa el componente de modal personalizado

const LoginScreen = ({ navigation, setIsLoggedIn }) => {// Componente principal para la pantalla de inicio de sesión
  // Estados para email y contraseña
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  // Estados para modal
  const [modalVisible, setModalVisible] = useState(false);
  const [modalType, setModalType] = useState('info');
  const [modalTitle, setModalTitle] = useState('');
  const [modalMessage, setModalMessage] = useState('');
  const [modalCallback, setModalCallback] = useState(null);

   const [showPassword, setShowPassword] = useState(false);// Estado para mostrar/ocultar la contraseña

  // Muestra el modal
  const showModal = (type, title, message, callback) => {
    setModalType(type);
    setModalTitle(title);
    setModalMessage(message);
    setModalVisible(true);
    setModalCallback(() => callback || null);
  };

  // Cierra el modal y ejecuta callback si existe
  const handleModalClose = () => {
    setModalVisible(false);
    if (modalCallback) {
      modalCallback();
      setModalCallback(null);
    }
  };

  // Lógica de login
  const handleLogin = async () => {// Maneja el inicio de sesión
    try {// Intenta obtener los usuarios almacenados
      let storedUsers = await AsyncStorage.getItem('users');
      let users = storedUsers ? JSON.parse(storedUsers) : [];
      const adminEmail = 'admin@admin.com';
      const adminPassword = 'admin';
      if (!users.find((u) => u.email === adminEmail)) {// Si no existe el usuario administrador, lo crea
        users.push({ email: adminEmail, password: adminPassword, nombre: 'Administrador', photo: null });
        await AsyncStorage.setItem('users', JSON.stringify(users));
      }
      const userFound = users.find((user) => user.email === email && user.password === password);// Busca el usuario con el email y contraseña proporcionados
      if (userFound) {// Si se encuentra el usuario
        if (!userFound.hasOwnProperty('photo')) {// Si el usuario no tiene la propiedad photo, la establece como null
          userFound.photo = null;
        }
        await AsyncStorage.setItem('user', JSON.stringify(userFound));
        showModal('success', 'Éxito', 'Inicio de sesión exitoso', () => setIsLoggedIn(true));
      } else {// Si no se encuentra el usuario, muestra un mensaje de error
        showModal('error', 'Error', 'Correo o contraseña incorrectos');
      }
    } catch (error) {// Si ocurre un error al intentar iniciar sesión
      showModal('error', 'Error', 'Ocurrió un problema al intentar iniciar sesión');
    }
  };

  return (// Envuelve la pantalla en SafeAreaView para manejar el área segura en dispositivos iOS
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView contentContainerStyle={styles.scrollContainer} keyboardShouldPersistTaps="handled">
          <AppModal
            visible={modalVisible}
            type={modalType}
            title={modalTitle}
            message={modalMessage}
            onClose={handleModalClose}
          />
          <View style={styles.logoContainer}>
            <Text style={styles.logoText}>Eco-Challenge</Text>
          </View>
          <View style={styles.loginCard}>
            <Text style={styles.title}>Iniciar Sesión</Text>
            <TextInput
              style={styles.input}
              placeholder="Correo electrónico"
              onChangeText={setEmail}
              value={email}
              keyboardType="email-address"
              autoCapitalize="none"
              placeholderTextColor="#94a3b8"
              autoFocus
              returnKeyType="next"
            />
            <TextInput
              style={styles.input}
              placeholder="Contraseña"
               secureTextEntry={!showPassword}
              onChangeText={setPassword}
              value={password}
              autoCapitalize="none"
              placeholderTextColor="#94a3b8"
              returnKeyType="done"
            />
            <MySingleButton
              title="Iniciar Sesión"
              customPress={handleLogin}
              style={styles.button}
              btnColor="#22c55e"
            />
            <TouchableOpacity onPress={() => navigation.navigate('RegisterUser')} style={styles.linkContainer}>
              <Text style={styles.linkText}>¿No tienes cuenta? <Text style={styles.linkTextBold}>Regístrate</Text></Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({// Estilos para la pantalla de inicio de sesión
  safeArea: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    backgroundColor: '#f8fafc',
  },
  logoContainer: {
    marginBottom: 18,
    alignItems: 'center',
  },
  logoText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#22c55e',
    letterSpacing: 2,
    marginBottom: 2,
    textShadowColor: '#d1fae5',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 6,
  },
  loginCard: {
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: 28,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.10,
    shadowRadius: 10,
    elevation: 8,
    width: '100%',
    maxWidth: 400,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#22c55e',
    marginBottom: 18,
    textAlign: 'center',
    letterSpacing: 1,
  },
  input: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    padding: 14,
    marginVertical: 10,
    borderRadius: 8,
    backgroundColor: '#f9fafb',
    color: '#111827',
    fontSize: 16,
    width: 260,
    shadowColor: '#22c55e',
    shadowOpacity: 0.04,
    shadowRadius: 2,
    elevation: 1,
  },
  button: {
    backgroundColor: '#22c55e',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 8,
    shadowColor: '#22c55e',
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 2,
    width: 200,
  },
  linkContainer: {
    marginTop: 8,
  },
  linkText: {
    color: '#64748b',
    fontSize: 15,
    textAlign: 'center',
  },
  linkTextBold: {
    color: '#22c55e',
    fontWeight: 'bold',
  },
});

export default LoginScreen;
