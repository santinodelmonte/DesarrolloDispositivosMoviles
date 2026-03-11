import React, { useState, useEffect } from 'react'; // Importa React y hooks necesarios
import { StyleSheet, View, SafeAreaView, ScrollView, TouchableOpacity, Text, Image } from "react-native"; // Importa componentes de React Native
import AsyncStorage from '@react-native-async-storage/async-storage';// Importa AsyncStorage para manejar almacenamiento local
import { Ionicons } from '@expo/vector-icons';// Importa iconos de Ionicons
import MyButton from "../../components/MyButton";// Importa el componente de botón personalizado

const MaterialsScreen = ({ navigation, setIsLoggedIn, userEmail, userImage }) => { // Componente principal de la pantalla de materiales
  // Estados para manejar la imagen de usuario, iniciales, email y errores
  const [imageError, setImageError] = useState(false);
  const [userPhoto, setUserPhoto] = useState(null);
  const [userInitial, setUserInitial] = useState('U');
  const isAdmin = (userEmail === 'admin@admin.com'); // Verifica si el usuario es administrador

  useEffect(() => {// Efecto para cargar la información del usuario al montar el componente
    const fetchUserPhoto = async () => {// Intenta obtener la información del usuario desde AsyncStorage
        try {// Si se proporciona un email, lo usa; si no, intenta obtenerlo del almacenamiento
            const userRaw = await AsyncStorage.getItem('user');
            if (userRaw) {// Si hay datos del usuario, los parsea
                const user = JSON.parse(userRaw);
                setUserPhoto(user.photo || user.imageUri || null);
                if (user.fullName) setUserInitial(user.fullName[0].toUpperCase());// Usa la primera letra del nombre completo
                else if (user.userName) setUserInitial(user.userName[0].toUpperCase());// Usa la primera letra del nombre de usuario
                else if (user.email) setUserInitial(user.email[0].toUpperCase());// Usa la primera letra del email
                else setUserInitial('U');// Usa 'U' si no hay información disponible
            } else {// Si no hay datos del usuario, establece valores por defecto
                setUserPhoto(null);
                setUserInitial('U');
            }
        } catch (e) {// Maneja cualquier error al obtener los datos del usuario
            setUserPhoto(null);
            setUserInitial('U');
        }
    };
    fetchUserPhoto();
  }, []);

  return (// Renderiza la vista principal del componente
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Materiales</Text>
        <View style={{flexDirection:'row', alignItems:'center'}}>
          {isAdmin ? (
            <Ionicons name="person-circle" size={40} color="#22c55e" style={{marginRight: 12}} accessibilityLabel="Administrador" />
          ) : userPhoto ? (
            <Image source={{ uri: userPhoto }} style={{ width: 40, height: 40, borderRadius: 20, marginRight: 12, borderWidth: 2, borderColor: '#22c55e', backgroundColor: '#e5e7eb' }} accessibilityLabel="Foto de perfil" onError={() => setImageError(true)} />
          ) : (
            <View style={{ width: 40, height: 40, borderRadius: 20, marginRight: 12, backgroundColor: '#e5e7eb', alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: '#22c55e' }}>
              <Text style={{color:'#22c55e', fontWeight:'bold', fontSize:18}}>{userInitial}</Text>
            </View>
          )}
        </View>
      </View>
      <View style={styles.contentContainer}>
        <View style={styles.card}>
          <ScrollView contentContainerStyle={{ paddingBottom: 10 }}>
            <MyButton
              title="Registrar nuevo material"
              btnColor="green"
              btnIcon="add"
              customPress={() => navigation.navigate("CreateMaterial")}
              style={styles.button}
            />
            <MyButton
              title="Ver todos los materiales"
              btnColor="gray"
              btnIcon="list"
              customPress={() => navigation.navigate("ViewAllMaterials")}
              style={styles.button}
            />
          </ScrollView>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#f8fafc',
    paddingHorizontal: 18,
    paddingVertical: 18,
    shadowColor: '#000',
    shadowOpacity: 0.10,
    shadowRadius: 8,
    elevation: 8,
    borderBottomWidth: 0,
  },
  headerTitle: {
    color: '#22c55e',
    fontSize: 22,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  contentContainer: {
    padding: 20,
    backgroundColor: '#fff',
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    minHeight: 600,
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
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 18,
    letterSpacing: 1,
  },
});

export default MaterialsScreen;