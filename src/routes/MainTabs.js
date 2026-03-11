import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs"; // Importa el tab navigator
import { Ionicons } from "@expo/vector-icons";// Importa los iconos de Ionicons
import { StyleSheet } from 'react-native';// Importa los estilos de React Native

// Importa las paginas de navegación 
import UsersStack from "../routes/UsersStack";
import ChallengesStack from "../routes/ChallengesStack";
import MaterialsStack from "../routes/MaterialsStack";
import ChallengesScreen from '../screens/challenges/ChallengesScreen';
import MaterialsScreen from '../screens/materials/MaterialsScreen';
import UserPanel from '../screens/users/UserPanel';

const Tab = createBottomTabNavigator(); // Crea el tab navigator

const MainTabs = ({ setIsLoggedIn, userEmail, userImage }) => { // Componente principal de las pestañas
  const isAdmin = userEmail === "admin@admin.com"; //
  
  return ( // Renderiza el tab navigator
    <Tab.Navigator 
      screenOptions={({ route }) => ({
        tabBarIcon: ({ color, size }) => {
          let iconName;
          if (route.name === "Usuarios") iconName = "person";
          else if (route.name === "Challenges") iconName = "flag";
          else if (route.name === "Materiales") iconName = "leaf";
          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: "#22c55e",
        tabBarInactiveTintColor: "#555",
        tabBarStyle: styles.tabBar,
        tabBarLabelStyle: styles.tabBarLabel,
        headerShown: false,
      })}
    >
      {isAdmin && (
        <Tab.Screen name="Usuarios">
          {(props) => (
            <UsersStack
              {...props}
              setIsLoggedIn={setIsLoggedIn}
              userEmail={userEmail}
              userImage={userImage}
            />
          )}
        </Tab.Screen>
      )}
        <Tab.Screen name="Challenges">
          {(props) => 
            <ChallengesStack 
              {...props} setIsLoggedIn={setIsLoggedIn}
              userEmail={userEmail}
              userImage={userImage} 
            />}
      </Tab.Screen>
        <Tab.Screen name="Materiales">
          {(props) => 
            <MaterialsStack
              {...props} setIsLoggedIn={setIsLoggedIn}
              userEmail={userEmail} 
              userImage={userImage} 
            />}
        </Tab.Screen>
        <Tab.Screen name="Panel"
          options={{
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="person-circle" size={size} color={color} />
            ),
          }}
        >
          {(props) => (
            <UserPanel
              {...props}
              setIsLoggedIn={setIsLoggedIn}
            />
          )}
        </Tab.Screen>
    </Tab.Navigator>
  );
};

const styles = StyleSheet.create({ // Estilos para el tab navigator
  tabBar: {
    backgroundColor: '#f8fafc',
    borderTopWidth: 0,
    height: 64,
    paddingBottom: 8,
    paddingTop: 8,
    shadowColor: '#000',
    shadowOpacity: 0.10,
    shadowRadius: 8,
    elevation: 8,
  },
  tabBarLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 4,
    color: '#222',
  },
});

export default MainTabs;
