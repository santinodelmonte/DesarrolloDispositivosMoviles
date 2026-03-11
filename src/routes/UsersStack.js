import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack'; // Importa el stack de navegación nativo

// Importa las pantallas de los usuarios
import UsersScreen from '../screens/users/UsersScreen';
import RegisterUser from '../screens/users/RegisterUser';
import UpdateUser from '../screens/users/UpdateUser';
import ViewUser from '../screens/users/ViewUser';
import ViewAllUsers from '../screens/users/ViewAllUsers';

const Stack = createNativeStackNavigator(); // Crea el stack de navegación

const UsersStack = ({ setIsLoggedIn, userEmail, userImage }) => { // Componente para el stack de navegación de usuarios
  const isAdmin = userEmail === "admin@admin.com";// Verifica si el usuario es administrador
 
  return (// Renderiza el stack de navegación
    <Stack.Navigator 
      initialRouteName="UsersScreen"
      screenOptions={{
        headerStyle: { backgroundColor: '#f8fafc', shadowColor: '#000', elevation: 8 },
        headerTintColor: '#22c55e',
        headerTitleStyle: { fontWeight: 'bold', fontSize: 22, letterSpacing: 1 },
      }}
    >
      <Stack.Screen
        name="UsersScreen"
        options={{ headerShown: false }}
      >
        {props => <UsersScreen {...props} setIsLoggedIn={setIsLoggedIn} userEmail={userEmail} userImage={userImage} />}
      </Stack.Screen>
      {isAdmin && <Stack.Screen name="RegisterUser" component={RegisterUser} options={{ title: "Registrar Usuario" }} />}
      <Stack.Screen name="ViewAllUsers" component={ViewAllUsers} options={{ title: "Visualización de Usuarios" }} />
      <Stack.Screen name="ViewUser" component={ViewUser} options={{ title: "Detalles del Usuario" }} />
      <Stack.Screen name="UpdateUser" component={UpdateUser} options={{ title: "Actualizar Usuario" }} />
    </Stack.Navigator>
  );
};

export default UsersStack;
