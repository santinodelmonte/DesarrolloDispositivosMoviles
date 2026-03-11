import React, { useState, useEffect } from 'react'; // Importa React y hooks necesarios
import { StyleSheet, View, SafeAreaView, ScrollView, TouchableOpacity, Text, Image } from "react-native"; // Importa componentes de React Native
import AsyncStorage from '@react-native-async-storage/async-storage';// Importa AsyncStorage para manejar almacenamiento local
import { Ionicons } from '@expo/vector-icons';// Importa iconos de Ionicons
import MyButton from "../../components/MyButton";// Importa el componente de botón personalizado

const ChallengesScreen = ({ navigation, setIsLoggedIn, userEmail: propUserEmail, userImage }) => { // Componente principal de la pantalla de retos
  // Estados para manejar la imagen de usuario, iniciales, email y errores
  const [imageError, setImageError] = useState(false);
  const [userPhoto, setUserPhoto] = useState(null);
  const [userInitial, setUserInitial] = useState('U');
  const [userEmail, setUserEmail] = useState(propUserEmail || null);
  const isAdmin = userEmail === 'admin@admin.com'; // Verifica si el usuario es administrador

  useEffect(() => { // Efecto para cargar la información del usuario al montar el componente
    const fetchUser = async () => {// Intenta obtener la información del usuario desde AsyncStorage
      try {// Si se proporciona un email, lo usa; si no, intenta obtenerlo del almacenamiento
        let email = propUserEmail;
        let userRaw = await AsyncStorage.getItem('user');
        if (userRaw) { // Si hay datos del usuario, los parsea
          const user = JSON.parse(userRaw);// Obtiene los datos del usuario
          setUserPhoto(user.photo || user.imageUri || null);
          if (user.fullName) setUserInitial(user.fullName[0].toUpperCase());// Usa la primera letra del nombre completo
          else if (user.userName) setUserInitial(user.userName[0].toUpperCase());
          else if (user.email) setUserInitial(user.email[0].toUpperCase());
          else setUserInitial('U');
          if (!email) email = user.email;// Si no se proporcionó un email, usa el del usuario
        } else {// Si no hay datos del usuario, establece valores por defecto
          setUserPhoto(null);
          setUserInitial('U');
        }
        setUserEmail(email);
      } catch (e) { // Maneja cualquier error al obtener los datos del usuario
        setUserPhoto(null);
        setUserInitial('U');
      }
    };
    fetchUser();// Llama a la función para cargar los datos del usuario
  }, [propUserEmail]);

  return ( // Renderiza la pantalla de retos
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Retos</Text>
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
            {isAdmin && (
              <MyButton
                title="Registrar nuevo reto"
                btnColor="green"
                btnIcon="add"
                customPress={() => navigation.navigate("RegisterChallenge", { userEmail })}
                style={styles.button}
              />
            )}
            <MyButton
              title="Ver todos los retos"
              btnColor="gray"
              btnIcon="list"
              customPress={() => navigation.navigate("ViewAllChallenges", { userEmail })}
              style={styles.button}
            />
            <MyButton
              title="Participar en un reto"
              btnColor="#2563eb"
              btnIcon="flag-checkered"
              customPress={() => navigation.navigate("ParticipateChallenge")}
              style={styles.button}
            />
            <MyButton
              title={isAdmin ? "Ver Participaciones" : "Mis Participaciones"}
              btnColor="#22c55e"
              btnIcon="list-alt"
              customPress={() => navigation.navigate("MyParticipations", { userEmail })}
              style={styles.button}
            />
          </ScrollView>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default ChallengesScreen;

const styles = StyleSheet.create({ // Estilos para la pantalla de retos
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
  card: {
    backgroundColor: '#f1f5f9',
    borderRadius: 12,
    padding: 18,
    marginVertical: 10,
    marginHorizontal: 8,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  button: {
    marginBottom: 12,
  },
});