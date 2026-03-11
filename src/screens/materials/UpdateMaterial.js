import React, { useEffect, useState } from "react"; // Importa React y hooks necesarios
import {
  View,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Image,
  TouchableOpacity,
  Text
} from "react-native";// Importa componentes de React Native
import AsyncStorage from "@react-native-async-storage/async-storage";// Importa AsyncStorage para manejar almacenamiento local
import { Ionicons } from '@expo/vector-icons';// Importa iconos de Ionicons
import MyInputText from "../../components/MyInputText";// Importa el componente de entrada de texto personalizado
import MySingleButton from "../../components/MySingleButton";// Importa el componente de botón personalizado
import { Picker } from "@react-native-picker/picker";// Importa Picker para seleccionar categorías
import * as ImagePicker from "expo-image-picker";// Importa ImagePicker para seleccionar imágenes
import AppModal from '../../components/AppModal';// Importa el componente de modal personalizado

const UpdateMaterial = ({ navigation, route, setIsLoggedIn }) => {// Componente para actualizar un material existente
  
  // Obtiene el ID del material desde los parámetros de la ruta
  const { id } = route.params;

  // Estados para manejar el material, nombre, categoría e imagen
  const [material, setMaterial] = useState(null);
  const [nombre, setNombre] = useState("");
  const [categoria, setCategoria] = useState("Plástico");
  const [imagen, setImagen] = useState(null);

  // Estados para manejar el modal
  const [modalVisible, setModalVisible] = useState(false);
  const [modalType, setModalType] = useState('info');
  const [modalTitle, setModalTitle] = useState('');
  const [modalMessage, setModalMessage] = useState('');
  const [modalCallback, setModalCallback] = useState(null);
  const [userPhoto, setUserPhoto] = useState(null);
  const [userInitial, setUserInitial] = useState('U');
  const [imageError, setImageError] = useState(false);
  // Estado para manejar el email del usuario
  const [userEmail, setUserEmail] = useState(null);
  const isAdmin = userEmail === 'admin@admin.com';// Determina si el usuario es administrador por su email

  useEffect(() => {// Carga el material al montar el componente
    const cargarMaterial = async () => {// Carga el material desde AsyncStorage
      const stored = await AsyncStorage.getItem("MATERIALES");
      const parsed = stored ? JSON.parse(stored) : [];
      const mat = parsed.find((m) => m.id === id);
      if (!mat) {// Si no se encuentra el material, muestra un mensaje de error
        showModal('error', 'Material no encontrado', 'El material que intentas editar no existe.', () => navigation.goBack());
        return;
      }
      setMaterial(mat);
      setNombre(mat.nombre);
      setCategoria(mat.categoria);
      setImagen(mat.imagen || null);
    };
    cargarMaterial();
  }, [id]);

  useEffect(() => {// Carga la foto del usuario al montar el componente
    const fetchUserPhoto = async () => {
      try {// Intenta obtener la foto del usuario desde AsyncStorage
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
      } catch (e) {// Maneja cualquier error al obtener los datos del usuario
        setUserPhoto(null);
        setUserInitial('U');
        setUserEmail(null);
      }
    };
    fetchUserPhoto();
  }, [id]);

  const seleccionarImagen = async () => {// Función para seleccionar una imagen de la galería
    const result = await ImagePicker.launchImageLibraryAsync({// Configura el selector de imágenes
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 1,
    });

    if (!result.canceled && result.assets?.length > 0) {// Verifica si se seleccionó una imagen
      setImagen(result.assets[0].uri);
    }
  };

  const guardarCambios = async () => {// Función para guardar los cambios del material
    const stored = await AsyncStorage.getItem("MATERIALES");
    let parsed = stored ? JSON.parse(stored) : [];
    parsed = parsed.map((m) =>// Actualiza el material con los nuevos datos
      m.id === id ? { ...m, nombre, categoria, imagen } : m
    );
    await AsyncStorage.setItem("MATERIALES", JSON.stringify(parsed));
    showModal('success', 'Éxito', 'Material actualizado correctamente.', () => navigation.goBack());
  };

  const showModal = (type, title, message, callback) => {// Función para mostrar el modal con el tipo, título y mensaje
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

  const handleUpdate = async () => {// Maneja la actualización del material
    if (!nombre.trim() || !categoria.trim()) {// Verifica que los campos obligatorios estén completos
      showModal('warning', 'Campos obligatorios', 'Por favor, completa todos los campos.');
      return;
    }
    guardarCambios();
  };

  if (!material) return null;// Si no hay material cargado, no renderiza nada

  return (// Renderiza la vista del componente
    <SafeAreaView style={styles.container}>
      <AppModal
        visible={modalVisible}
        type={modalType}
        title={modalTitle}
        message={modalMessage}
        onClose={handleModalClose}
      />
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Actualizar Material</Text>
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
      <ScrollView>
        <View style={styles.contentContainer}>
          <MyInputText
            placeholder="Nombre del material"
            value={nombre}
            onChangeText={setNombre}
            style={styles.input}
          />

          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={categoria}
              onValueChange={(itemValue) => setCategoria(itemValue)}
              style={styles.picker}
            >
              <Picker.Item label="Plástico" value="Plástico" />
              <Picker.Item label="Papel" value="Papel" />
              <Picker.Item label="Vidrio" value="Vidrio" />
              <Picker.Item label="Metal" value="Metal" />
              <Picker.Item label="Electrónicos" value="Electrónicos" />
              <Picker.Item label="Orgánico" value="Orgánico" />
            </Picker>
          </View>

          <View style={styles.imagePreviewContainer}>
            {imagen && (
              <Image source={{ uri: imagen }} style={styles.image} />
            )}
            <TouchableOpacity
              style={styles.imageButton}
              onPress={seleccionarImagen}
            >
              <Text style={styles.imageButtonText}>Cambiar imagen</Text>
            </TouchableOpacity>
          </View>

          <MySingleButton
            title="Guardar Cambios"
            customPress={handleUpdate}
            style={styles.button}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({// Estilos para el componente UpdateMaterial
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
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
  },
  contentContainer: {
    padding: 20,
    backgroundColor: '#fff',
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    minHeight: 600,
  },
  input: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    padding: 12,
    marginVertical: 14,
    borderRadius: 8,
    backgroundColor: '#f9fafb',
    color: '#111827',
    fontSize: 16,
  },
  picker: {
    height: 48,
    color: '#111827',
    backgroundColor: '#f1f5f9',
    borderRadius: 8,
    marginBottom: 18,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    overflow: 'hidden',
  },
  imageButton: {
    backgroundColor: '#22c55e',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 10,
  },
  imageButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  imagePreviewContainer: {
    alignItems: 'center',
    marginBottom: 10,
  },
  image: {
    width: 220,
    height: 180,
    borderRadius: 12,
    marginBottom: 6,
    borderWidth: 2,
    borderColor: '#22c55e',
  },
  imagePreviewText: {
    color: '#22c55e',
    fontSize: 14,
    fontWeight: '600',
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

export default UpdateMaterial;
