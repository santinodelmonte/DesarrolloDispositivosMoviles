import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack"; // Importa el stack de navegación nativo

// Importa las pantallas de los materiales
import MaterialsScreen from "../screens/materials/MaterialsScreen";
import CreateMaterial from "../screens/materials/CreateMaterial";
import ViewAllMaterials from "../screens/materials/ViewAllMaterials";
import ViewMaterial from "../screens/materials/ViewMaterial";
import UpdateMaterial from "../screens/materials/UpdateMaterial";
import DeleteMaterial from "../screens/materials/DeleteMaterial";

const Stack = createNativeStackNavigator(); // Crea el stack de navegación

const MaterialsStack = ({ setIsLoggedIn, userEmail, userImage }) => { // Componente para el stack de navegación de materiales
    return (// Renderiza el stack de navegación
    <Stack.Navigator 
      initialRouteName="MaterialsScreen"
      screenOptions={{
        headerStyle: { backgroundColor: '#f8fafc', shadowColor: '#000', elevation: 8 },
        headerTintColor: '#22c55e',
        headerTitleStyle: { fontWeight: 'bold', fontSize: 22, letterSpacing: 1 },
      }}
    >
      <Stack.Screen 
        name="MaterialsScreen" 
        options={{ headerShown: false }}
      >
        {props => <MaterialsScreen {...props} setIsLoggedIn={setIsLoggedIn} userEmail={userEmail} userImage={userImage} />}
      </Stack.Screen>
      <Stack.Screen name="CreateMaterial" component={CreateMaterial} options={{ title: "Registrar Material" }}/>
      <Stack.Screen name="UpdateMaterial" component={UpdateMaterial} options={{ title: "Actualizar Material" }}/>
      <Stack.Screen name="ViewMaterial" component={ViewMaterial} options={{ title: "Detalles del Material" }}/>
      <Stack.Screen name="DeleteMaterial" component={DeleteMaterial} options={{ title: "Eliminar Material" }}/>
      <Stack.Screen name="ViewAllMaterials" component={ViewAllMaterials} options={{ title: "Visualización de Materiales" }}/>
    </Stack.Navigator>
    );
};

export default MaterialsStack;