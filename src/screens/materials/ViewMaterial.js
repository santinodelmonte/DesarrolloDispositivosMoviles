import React, { useEffect, useState } from "react";// Importa React y hooks necesarios
import {
  View,
  StyleSheet,
  Image,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Text
} from "react-native"; // Importa componentes de React Native
import AsyncStorage from "@react-native-async-storage/async-storage";// Importa AsyncStorage para manejar almacenamiento local
import { Ionicons } from '@expo/vector-icons';//  Importa iconos de Ionicons
import MyText from "../../components/MyText";// Importa el componente de texto personalizado
import MySingleButton from "../../components/MySingleButton";// Importa el componente de botón personalizado
import AppModal from '../../components/AppModal';// Importa el componente de modal personalizado

const ViewMaterial = ({ route, navigation }) => {// Componente principal para ver los detalles de un material

// Estados para manejar el material, visibilidad del modal, tipo de modal, título, mensaje y callback del modal
  const [material, setMaterial] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalType, setModalType] = useState('info');
  const [modalTitle, setModalTitle] = useState('');
  const [modalMessage, setModalMessage] = useState('');
  const [modalCallback, setModalCallback] = useState(null);

  // Estados para manejar la foto del usuario, iniciales, error de imagen y email del usuario
  const [userPhoto, setUserPhoto] = useState(null);
  const [userInitial, setUserInitial] = useState('U');
  const [imageError, setImageError] = useState(false);
  const [userEmail, setUserEmail] = useState(null);

  const isAdmin = userEmail === 'admin@admin.com';// Verifica si el usuario es administrador

  const { id } = route.params;// Obtiene el ID del material desde los parámetros de la ruta

  const showModal = (type, title, message, callback) => {// Función para mostrar el modal con tipo, título y mensaje
    setModalType(type);
    setModalTitle(title);
    setModalMessage(message);
    setModalVisible(true);
    setModalCallback(() => callback || null);
  };

  const handleModalClose = () => {// Cierra el modal y ejecuta el callback si existe
    setModalVisible(false);
    if (modalCallback) {// Si hay un callback definido, lo ejecuta
      modalCallback();
      setModalCallback(null);
    }
  };

  useEffect(() => {// Efecto para cargar el material y la foto del usuario al montar el componente
    const getMaterial = async () => {
      try {// Intenta obtener el material desde AsyncStorage
        const stored = await AsyncStorage.getItem("MATERIALES");
        const materials = stored ? JSON.parse(stored) : [];
        const found = materials.find((item) => item.id === id);
        if (found) {// Si se encuentra el material, lo establece en el estado
          setMaterial(found);
        } else {// Si no se encuentra el material, muestra un modal de error
          showModal('error', 'No encontrado', 'Material no encontrado', () => navigation.goBack());
        }
      } catch (error) {// Maneja errores al cargar el material
        showModal('error', 'Error', 'Error al cargar el material.');
      }
    };

    const fetchUserPhoto = async () => {// Intenta obtener la foto del usuario desde AsyncStorage
      try {
        const userRaw = await AsyncStorage.getItem('user');
        if (userRaw) {// Si hay datos del usuario, los parsea
          const user = JSON.parse(userRaw);
          setUserPhoto(user.photo || user.imageUri || null);
          setUserEmail(user.email);
          if (user.fullName) setUserInitial(user.fullName[0].toUpperCase());// Usa la primera letra del nombre completo
          else if (user.userName) setUserInitial(user.userName[0].toUpperCase());// Usa la primera letra del nombre de usuario
          else if (user.email) setUserInitial(user.email[0].toUpperCase());// Usa la primera letra del email
          else setUserInitial('U');// Establece 'U' si no hay datos disponibles
        } else {// Si no hay datos del usuario, establece valores por defecto
          setUserPhoto(null);
          setUserInitial('U');
          setUserEmail(null);
        }
      } catch (e) {// Manejar cualquier error al obtener los datos del usuario
        setUserPhoto(null);
        setUserInitial('U');
        setUserEmail(null);
      }
    };

    getMaterial();
    fetchUserPhoto();
  }, [id]);

  const deleteMaterial = async () => {// Función para eliminar un material
    showModal('warning', 'Eliminar', '¿Estás seguro de que deseas eliminar este material?', async () => {
      try {// Intenta eliminar el material de AsyncStorage
        const stored = await AsyncStorage.getItem("MATERIALES");
        const materials = stored ? JSON.parse(stored) : [];
        const filtered = materials.filter((item) => item.id !== id);
        await AsyncStorage.setItem("MATERIALES", JSON.stringify(filtered));
        showModal('success', 'Eliminado', 'Material eliminado correctamente.', () => navigation.goBack());
      } catch (error) { // Maneja errores al eliminar el material
        showModal('error', 'Error', 'Error al eliminar el material.');
      }
    });
  };

  if (!material) return null;// Si no hay material, no renderiza nada

  return (// Renderiza la vista principal del componente
    <SafeAreaView style={styles.container}>
      <AppModal
        visible={modalVisible}
        type={modalType}
        title={modalTitle}
        message={modalMessage}
        onClose={handleModalClose}
      />
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Detalle del Material</Text>
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
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.card}>
          {material.imagen && (
            <Image source={{ uri: material.imagen }} style={styles.image} />
          )}
          <MyText text={`Nombre: ${material.nombre}`} style={styles.cardTitle} />
          <MyText text={`Categoría: ${material.categoria}`} style={styles.cardText} />

          <MySingleButton
            title="Editar Material"
            customPress={() =>
              navigation.navigate("UpdateMaterial", { id: material.id })
            }
            style={styles.button}
          />

          <MySingleButton
            title="Eliminar Material"
            customPress={deleteMaterial}
            style={styles.button}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({ // Estilos para la pantalla de ver material
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
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 18,
    marginVertical: 10,
    marginHorizontal: 16,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  image: {
    width: 120,
    height: 120,
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 2,
    borderColor: '#22c55e',
    alignSelf: 'center',
  },
  cardTitle: {
    color: '#22c55e',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 6,
    textAlign: 'center',
  },
  cardText: {
    color: '#374151',
    fontSize: 15,
    marginBottom: 4,
    textAlign: 'center',
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

export default ViewMaterial;
