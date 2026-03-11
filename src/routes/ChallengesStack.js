import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack"; // Importa el stack de navegación nativo

// Importa las pantallas de los retos
import ChallengesScreen from "../screens/challenges/ChallengesScreen";
import RegisterChallenge from "../screens/challenges/RegisterChallenge";
import ViewAllChallenges from "../screens/challenges/ViewAllChallenges";
import ParticipateChallenge from "../screens/challenges/ParticipateChallenge";
import ViewChallengeParticipation from "../screens/challenges/ViewChallengeParticipation";
import MyParticipations from "../screens/challenges/MyParticipations";
import ViewChallenge from "../screens/challenges/ViewChallenge";
import DeleteChallenge from "../screens/challenges/DeleteChallenge";
import UpdateChallenge from "../screens/challenges/UpdateChallenge";

const Stack = createNativeStackNavigator(); //Crea el stack de navegación

const ChallengesStack = ({ setIsLoggedIn, userEmail, userImage }) => { // Componente para el stack de navegación de retos
    const isAdmin = userEmail === "admin@admin.com"; // Verifica si el usuario es administrador
    
    return (// Renderiza el stack de navegación
    <Stack.Navigator 
      initialRouteName="ChallengesScreen"
      screenOptions={{
        headerStyle: { backgroundColor: '#f8fafc', shadowColor: '#000', elevation: 8 },
        headerTintColor: '#22c55e',
        headerTitleStyle: { fontWeight: 'bold', fontSize: 22, letterSpacing: 1 },
      }}
    >
      <Stack.Screen 
        name="ChallengesScreen" 
        options={{ headerShown: false }}
      >
        {props => <ChallengesScreen {...props} setIsLoggedIn={setIsLoggedIn} userEmail={userEmail} userImage={userImage} />}
      </Stack.Screen>
      {isAdmin && ( // Si el usuario es administrador, muestra la opción de registrar un nuevo reto
        <Stack.Screen name="RegisterChallenge" component={RegisterChallenge} options={{ title: "Registrar Reto" }}/>
      )}
      <Stack.Screen name="ViewAllChallenges" component={ViewAllChallenges} options={{ title: "Visualización de Retos" }}/>
      <Stack.Screen name="ParticipateChallenge" component={ParticipateChallenge} options={{ title: "Participar en Reto" }}/>
      <Stack.Screen name="ViewChallengeParticipation" component={ViewChallengeParticipation} options={{ title: "Participación de Usuario" }}/>
      <Stack.Screen name="MyParticipations" component={MyParticipations} 
        options={{ // Título dinámico basado en si el usuario es administrador o no
          title: isAdmin ? "Participaciones de todos los usuarios" : "Mis Participaciones" 
        }}
      />
      <Stack.Screen name="ViewChallenge" component={ViewChallenge} options={{ title: "Detalle del Reto" }}/>
      <Stack.Screen name="DeleteChallenge" component={DeleteChallenge} options={{ title: "Eliminar Reto" }}/>
      <Stack.Screen name="UpdateChallenge" component={UpdateChallenge} options={{ title: "Editar Reto" }}/>
    </Stack.Navigator>
    );
};

export default ChallengesStack;