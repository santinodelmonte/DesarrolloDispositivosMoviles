import React, { useState, useEffect } from "react";// Importa React y hooks necesarios
import {
  View,
  FlatList,
  StyleSheet,
  SafeAreaView,
  Image,
  Text,
  TouchableOpacity
} from "react-native";// Importa componentes de React Native
import AsyncStorage from "@react-native-async-storage/async-storage";// Importa AsyncStorage para manejar almacenamiento local
import { Ionicons } from '@expo/vector-icons';// Importa iconos de Ionicons
import MyText from "../../components/MyText";// Importa el componente de texto personalizado
import MySingleButton from "../../components/MySingleButton";// Importa el componente de botón personalizado
import AppModal from '../../components/AppModal';// Importa el componente de modal personalizado

const ViewAllMaterials = ({ navigation, setIsLoggedIn }) => {// Componente principal para ver todos los materiales
  // Estados para manejar los materiales, visibilidad del modal, tipo de modal, título y mensaje del modal
  const [materials, setMaterials] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalType, setModalType] = useState('info');
  const [modalTitle, setModalTitle] = useState('');
  const [modalMessage, setModalMessage] = useState('');

  // Estados para manejar la foto del usuario, inicial del usuario, error de imagen y email del usuario
  const [userPhoto, setUserPhoto] = useState(null);
  const [userInitial, setUserInitial] = useState('U');
  const [imageError, setImageError] = useState(false);
  const [userEmail, setUserEmail] = useState(null);

  const isAdmin = userEmail === 'admin@admin.com';// Verifica si el usuario es administrador

  const showModal = (type, title, message) => {// Función para mostrar el modal con tipo, título y mensaje
    setModalType(type);
    setModalTitle(title);
    setModalMessage(message);
    setModalVisible(true);
  };

  const handleModalClose = () => setModalVisible(false);// Cierra el modal

  useEffect(() => {// Efecto para cargar los materiales y la foto del usuario al montar el componente
    const fetchMaterials = async () => {// Carga los materiales desde AsyncStorage
      try {// Intenta obtener los materiales almacenados
        const stored = await AsyncStorage.getItem("MATERIALES");
        const parsed = stored ? JSON.parse(stored) : [];
        setMaterials(parsed);
      } catch (error) {// Maneja errores al recuperar los materiales
        showModal('error', 'Error', 'Error al recuperar los materiales.');
      }
    };

    const fetchUserPhoto = async () => {// Intenta obtener la foto del usuario desde AsyncStorage
      try {// Si hay datos del usuario, los parsea
        const userRaw = await AsyncStorage.getItem('user');
        if (userRaw) {// Si hay datos del usuario, los parsea
          const user = JSON.parse(userRaw);
          setUserPhoto(user.photo || user.imageUri || null);
          setUserEmail(user.email);
          if (user.fullName) setUserInitial(user.fullName[0].toUpperCase());// Usa la primera letra del nombre completo
          else if (user.userName) setUserInitial(user.userName[0].toUpperCase());// Usa la primera letra del nombre de usuario
          else if (user.email) setUserInitial(user.email[0].toUpperCase());// Usa la primera letra del email
          else setUserInitial('U');// Si no hay información, establece 'U' como inicial
        } else {// Si no hay datos del usuario, establece valores por defecto
          setUserPhoto(null);
          setUserInitial('U');
          setUserEmail(null);
        }
      } catch (e) {// Maneja cualquier error al obtener los datos del usuario
        setUserPhoto(null);
        setUserInitial('U');
        setUserEmail(null);
      }
    };

    const unsubscribe = navigation.addListener("focus", () => {// Escucha el evento de enfoque para recargar los materiales y la foto del usuario cuando se navega a esta pantalla
      fetchMaterials();
      fetchUserPhoto();
    });
    return unsubscribe;
  }, [navigation]);

  const renderItem = ({ item }) => (// Función para renderizar cada elemento de la lista de materiales
    <View style={styles.cardUX}>
      {item.imagen && (
        <Image source={{ uri: item.imagen }} style={styles.imageUX} />
      )}
      <View style={styles.cardDetailsUX}>
        <View style={styles.cardTitleRowUX}>
          <Ionicons name="leaf" size={22} color="#22c55e" style={{ marginRight: 8 }} />
          <Text style={styles.cardTitleUX}>{item.nombre}</Text>
        </View>
        <Text style={styles.cardCategoryUX}>{item.categoria}</Text>
        <TouchableOpacity style={styles.actionButtonUX} onPress={() => navigation.navigate("ViewMaterial", { id: item.id })}>
          <Text style={styles.actionButtonTextUX}>Ver detalles</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (// Renderiza la pantalla de materiales
    <SafeAreaView style={styles.container}>
      <AppModal
        visible={modalVisible}
        type={modalType}
        title={modalTitle}
        message={modalMessage}
        onClose={handleModalClose}
      />
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Todos los Materiales</Text>
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
      {materials.length === 0 ? (
        <Text style={styles.empty}>Aún no se tiene datos</Text>
      ) : (
        <FlatList
          data={materials}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({// Estilos para la pantalla de materiales
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
    color: '#374151',
    fontSize: 20,
    fontWeight: 'bold',
    flex: 1,
  },
  list: {
    padding: 16,
  },
  cardUX: {
    flexDirection: 'row',
    backgroundColor: '#f9fafb',
    borderRadius: 18,
    padding: 18,
    marginVertical: 10,
    marginHorizontal: 8,
    shadowColor: '#000',
    shadowOpacity: 0.10,
    shadowRadius: 8,
    elevation: 6,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    alignItems: 'center',
  },
  imageUX: {
    width: 70,
    height: 70,
    borderRadius: 12,
    marginRight: 16,
    borderWidth: 2,
    borderColor: '#22c55e',
    backgroundColor: '#e5e7eb',
  },
  cardDetailsUX: {
    flex: 1,
    justifyContent: 'center',
  },
  cardTitleRowUX: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  cardTitleUX: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#22c55e',
    letterSpacing: 1,
  },
  cardCategoryUX: {
    color: '#374151',
    fontSize: 15,
    marginBottom: 8,
  },
  actionButtonUX: {
    backgroundColor: '#22c55e',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 18,
    alignItems: 'center',
    alignSelf: 'flex-start',
    shadowColor: '#22c55e',
    shadowOpacity: 0.10,
    shadowRadius: 2,
    elevation: 2,
  },
  actionButtonTextUX: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 15,
    letterSpacing: 1,
  },
  empty: {
    color: 'white',
    textAlign: 'center',
    marginTop: 40,
    fontSize: 18,
  },
});

export default ViewAllMaterials;
