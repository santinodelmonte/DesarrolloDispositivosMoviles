import React, { useEffect, useState } from 'react'; // Importar React y hooks necesarios
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  SafeAreaView,
  TouchableOpacity,
  Image
} from 'react-native'; // Importar componentes de React Native
import AsyncStorage from '@react-native-async-storage/async-storage'; // Importar AsyncStorage para manejar almacenamiento local
import { useNavigation, useRoute } from '@react-navigation/native';// Importar hooks de navegación
import { Ionicons } from '@expo/vector-icons'; // Importar iconos de Ionicons
 
const ViewAllChallenges = ({ setIsLoggedIn }) => { // Componente principal para ver todos los retos
  // Hooks de navegación y ruta
  const navigation = useNavigation();
  const route = useRoute();
  // Obtener el email del usuario desde los parámetros de la ruta
  const userEmail = route.params?.userEmail;
  const isAdmin = userEmail === 'admin@admin.com'; // Verificar si el usuario es administrador

  // Estados para manejar los retos, participaciones, carga y foto del usuario
  const [challenges, setChallenges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [participations, setParticipations] = useState([]);
  const [userPhoto, setUserPhoto] = useState(null);
  const [userInitial, setUserInitial] = useState('U');

  const loadChallenges = async () => { // Función para cargar los retos desde AsyncStorage
    try { // Cargar los retos y participaciones
      setLoading(true);
      const data = await AsyncStorage.getItem('challenges');
      let parsed = data ? JSON.parse(data) : [];
      let participationsRaw = await AsyncStorage.getItem('participations');
      let participationsList = participationsRaw ? JSON.parse(participationsRaw) : [];
      setParticipations(participationsList);
      parsed = parsed.map(ch => ({
        ...ch,
        categoria: ch.categoria || 'Sin categoría'
      }));
      setChallenges(parsed);
    } catch (error) {// Manejar errores al cargar los retos
      console.error('Error al cargar los retos:', error);
    } finally { // Finalizar la carga
      setLoading(false);
    }
  };

  useEffect(() => { // Efecto para cargar los retos y la foto del usuario al montar el componente
    loadChallenges();
    const fetchUserPhoto = async () => {// Intenta obtener la foto del usuario desde AsyncStorage
      try {// Si hay datos del usuario, los parsea
        const userRaw = await AsyncStorage.getItem('user');
        if (userRaw) {
          const user = JSON.parse(userRaw);
          setUserPhoto(user.photo || user.imageUri || null);
          if (user.fullName) setUserInitial(user.fullName[0].toUpperCase());// Usa la primera letra del nombre completo
          else if (user.userName) setUserInitial(user.userName[0].toUpperCase());// Usa la primera letra del nombre de usuario
          else if (user.email) setUserInitial(user.email[0].toUpperCase());// Usa la primera letra del email
          else setUserInitial('U');// Establece 'U' si no hay datos disponibles
        } else {// Si no hay datos del usuario, establece valores por defecto
          setUserPhoto(null);
          setUserInitial('U');
        }
      } catch (e) {// Manejar cualquier error al obtener los datos del usuario
        setUserPhoto(null);
        setUserInitial('U');
      }
    };
    fetchUserPhoto();
    const unsubscribe = navigation.addListener('focus', () => {// Escucha el evento de enfoque para recargar los retos y la foto del usuario cuando se navega a esta pantalla
      loadChallenges();
      fetchUserPhoto();
    });
    return unsubscribe;
  }, [navigation]);

  const renderItem = ({ item }) => ( // Función para renderizar cada elemento de la lista de retos
    <View style={styles.card}>
      <Text style={styles.cardTitle}>{item.nombre || '-'}</Text>
      {isAdmin && (
        <View style={styles.actionsContainer}>
          <TouchableOpacity style={[styles.actionButton, {backgroundColor:'#22c55e'}]} onPress={() => navigation.navigate('ViewChallenge', { challenge: item })}>
            <Text style={styles.actionButtonText}>Ver</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.actionButton, {backgroundColor:'#22c55e'}]} onPress={() => navigation.navigate('UpdateChallenge', { challenge: item })}>
            <Text style={styles.actionButtonText}>Editar</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.actionButton, {backgroundColor:'#ef4444'}]} onPress={() => navigation.navigate('DeleteChallenge', { challenge: item })}>
            <Text style={styles.actionButtonText}>Eliminar</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );

  return ( // Renderiza la pantalla de retos
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{isAdmin ? 'Todos los Retos' : 'Mis Retos'}</Text>
        <View style={styles.headerRight}>
          {isAdmin ? (
            <Ionicons name="person-circle" size={40} color="#22c55e" style={{marginRight: 12}} accessibilityLabel="Administrador" />
          ) : userPhoto ? (
            <Image
              source={{ uri: userPhoto }}
              style={styles.avatar}
              accessibilityLabel="Foto de perfil"
            />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <Text style={{color:'#22c55e', fontWeight:'bold', fontSize:18}}>{userInitial}</Text>
            </View>
          )}
        </View>
      </View>
      <View>
      </View>
      <View style={{flex:1}}>
        <FlatList
          contentContainerStyle={styles.list}
          data={challenges}
          keyExtractor={(_, index) => index.toString()}
          renderItem={renderItem}
          showsVerticalScrollIndicator={true}
        />
      </View>
    </SafeAreaView>
  );
};

export default ViewAllChallenges;

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
  title: {
    color: '#22c55e',
    fontSize: 22,
    fontWeight: 'bold',
    letterSpacing: 1,
    marginBottom: 8,
  },
  card: {
    backgroundColor: '#f9fafb',
    borderRadius: 18,
    padding: 22,
    marginVertical: 12,
    marginHorizontal: 8,
    shadowColor: '#000',
    shadowOpacity: 0.10,
    shadowRadius: 8,
    elevation: 6,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    alignItems: 'center',
  },
  cardTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#22c55e',
    marginBottom: 10,
    letterSpacing: 1,
    textAlign: 'center',
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 10,
    marginBottom: 8,
  },
  actionButton: {
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 18,
    marginHorizontal: 4,
    alignItems: 'center',
    shadowColor: '#22c55e',
    shadowOpacity: 0.10,
    shadowRadius: 2,
    elevation: 2,
  },
  actionButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
    letterSpacing: 1,
  },
  participationsContainer: {
    width: '100%',
    marginTop: 8,
    backgroundColor: '#f1f5f9',
    borderRadius: 10,
    padding: 10,
  },
  participationCard: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 8,
    marginVertical: 4,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  loading: {
    marginTop: 40,
  },
  list: {
    padding: 16,
  },
  text: {
    color: '#fff',
    fontSize: 16,
    marginBottom: 4,
  },
  empty: {
    color: '#fff',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 32,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
    borderWidth: 2,
    borderColor: '#22c55e',
    backgroundColor: '#e5e7eb',
  },
  avatarPlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
    backgroundColor: '#e5e7eb',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#22c55e',
  },
});
