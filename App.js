import React, { useState, useEffect } from 'react'; // Importa React y los hooks necesarios
import { NavigationContainer } from '@react-navigation/native'; // Importa el contenedor de navegación
import { createNativeStackNavigator } from '@react-navigation/native-stack'; // Importa el stack de navegación nativo
import AsyncStorage from '@react-native-async-storage/async-storage';// Importa AsyncStorage para manejar almacenamiento local
import MainTabs from './src/routes/MainTabs';// Importa las pestañas principales de la aplicación 
import LoginScreen from './src/screens/users/LoginScreen';// Importa la pantalla de inicio de sesión
import HomeScreen from './src/screens/HomeScreen';// Importa la pantalla de inicio
import RegisterUser from './src/screens/users/RegisterUser';// Importa la pantalla de registro de usuario
import { ActivityIndicator, View, AppState, TouchableWithoutFeedback } from 'react-native'; // Importa componentes de React Native

const Stack = createNativeStackNavigator(); // Crea el stack de navegación

const SESSION_TIMEOUT = 5 * 60 * 1000; // Define el tiempo de sesión en milisegundos (5 minutos)

export default function App() { // Componente principal de la aplicación

  // Estados para manejar el estado de la sesión y la información del usuario
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [userEmail, setUserEmail] = useState(null);
  const [userImage, setUserImage] = useState(null);
  const [lastActive, setLastActive] = useState(Date.now());
  const [appState, setAppState] = useState(AppState.currentState);
  const appStateRef = React.useRef(appState);

  useEffect(() => { // Efecto para manejar el estado de la aplicación
    const checkLogin = async () => {
      const user = await AsyncStorage.getItem('user');
      if (user) {// Si hay un usuario guardado en AsyncStorage
        const userObj = JSON.parse(user);
        setIsLoggedIn(true);
        setUserEmail(userObj.email);
      } else {// Si no hay usuario guardado, se asegura de que el estado esté limpio
        setIsLoggedIn(false);
        setUserEmail(null);
      }
      setIsLoading(false);
    };
    checkLogin();
  }, []);

  // Para actualizar el email al login/logout
  const handleSetIsLoggedIn = async (value) => {
    setIsLoggedIn(value);
    if (value) {// Si el usuario inicia sesión, obtiene el email y la imagen del usuario
      const user = await AsyncStorage.getItem('user');
      if (user) {// Si hay un usuario guardado, lo parsea y actualiza el estado
        const userObj = JSON.parse(user);
        setUserEmail(userObj.email);
        setUserImage(userObj.photo); 
      }
    } else {// Si el usuario cierra sesión, limpia el estado
      setUserEmail(null);
      setUserImage(null);
    }
  };

  useEffect(() => {// Efecto para manejar el timeout de inactividad
    if (!isLoggedIn) return;// Si el usuario no está logueado, no se aplica el timeout
    const interval = setInterval(async () => {
      if (Date.now() - lastActive > SESSION_TIMEOUT) {// Si el tiempo de inactividad supera el timeout
        await AsyncStorage.removeItem('user');
        setIsLoggedIn(false);
        setUserEmail(null);
        setUserImage(null);
      }
    }, 10000); // Verifica cada 10 segundos si el usuario ha estado inactivo por más de 5 minutos
    return () => clearInterval(interval);// Limpia el intervalo al desmontar el componente
  }, [isLoggedIn, lastActive]);

  // Actualiza lastActive en cualquier toque global
  const handleAnyTouch = () => setLastActive(Date.now());

  if (isLoading) {// Si la aplicación está cargando, muestra un indicador de carga
    return (// Indicador de carga mientras se verifica el estado de la sesión
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="green" />
      </View>
    );
  }

  return (// Envuelve la aplicación en un TouchableWithoutFeedback para detectar toques globales
    <TouchableWithoutFeedback onPress={handleAnyTouch} onPressIn={handleAnyTouch}>
      <View style={{ flex: 1 }}>
        <NavigationContainer>
          <Stack.Navigator screenOptions={{ headerShown: false }}>
            {!isLoggedIn ? (
              <>
                <Stack.Screen name="Home" component={HomeScreen} />
                <Stack.Screen name="Login">
                  {(props) => <LoginScreen {...props} setIsLoggedIn={handleSetIsLoggedIn} />}
                </Stack.Screen>
                <Stack.Screen name="RegisterUser" component={RegisterUser} />
              </>
            ) : (
              <Stack.Screen name="MainApp">
                {(props) => (
                  <MainTabs
                    {...props}
                    setIsLoggedIn={handleSetIsLoggedIn}
                    userEmail={userEmail}
                    userImage={userImage}
                  />
                )}
              </Stack.Screen>
            )}
          </Stack.Navigator>
        </NavigationContainer>
      </View>
    </TouchableWithoutFeedback>
  );
}
