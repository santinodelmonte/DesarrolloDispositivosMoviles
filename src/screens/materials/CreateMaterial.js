import React, { useState, useEffect } from "react"; // Importa React y useState
import {
  View,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Image,
  TouchableOpacity,
  Text,
} from "react-native"; // Importa los componentes necesarios de React Native
import AsyncStorage from "@react-native-async-storage/async-storage";// Importa AsyncStorage para almacenamiento local
import { Ionicons } from "@expo/vector-icons";// Importa Ionicons para iconos
import MyInputText from "../../components/MyInputText";// Importa el componente de entrada de texto personalizado
import MySingleButton from "../../components/MySingleButton";// Importa el componente de botón personalizado
import { Picker } from "@react-native-picker/picker";// Importa el componente Picker para seleccionar categorías
import * as ImagePicker from "expo-image-picker";// Importa ImagePicker para seleccionar imágenes
import AppModal from '../../components/AppModal';// Importa el componente de modal personalizado

const CreateMaterial = ({ navigation, setIsLoggedIn }) => {// Componente principal para crear un material
 // Estados para manejar los campos del formulario
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("Plástico");
  const [image, setImage] = useState(null);

  // Estados para manejar el modal
  const [modalVisible, setModalVisible] = useState(false);
  const [modalType, setModalType] = useState('info');
  const [modalTitle, setModalTitle] = useState('');
  const [modalMessage, setModalMessage] = useState('');
  const [modalCallback, setModalCallback] = useState(null);
  const [userPhoto, setUserPhoto] = useState(null);
  const [userInitial, setUserInitial] = useState('U');
  const [imageError, setImageError] = useState(false);
  const [userEmail, setUserEmail] = useState(null);

  // Verifica si el usuario es administrador
  const isAdmin = userEmail === 'admin@admin.com';

  const pickImage = async () => {// Función para seleccionar una imagen de la galería
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 1,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) { // Verifica si se seleccionó una imagen
      setImage(result.assets[0].uri);
    }
  };

  const showModal = (type, title, message, callback) => { // Función para mostrar el modal con tipo, título y mensaje
    setModalType(type);
    setModalTitle(title);
    setModalMessage(message);
    setModalVisible(true);
    setModalCallback(() => callback || null);
  };

  const handleModalClose = () => { // Cierra el modal y ejecuta el callback si existe
    setModalVisible(false);
    if (modalCallback) { // Si hay un callback definido, lo ejecuta
      modalCallback();
      setModalCallback(null);
    }
  };

  const saveMaterial = async () => { // Función para guardar el material
    if (!name.trim() || !description.trim()) { // Verifica que los campos obligatorios no estén vacíos
      showModal('warning', 'Campos obligatorios', 'El nombre y la descripción del material son obligatorios.');
      return;
    }
    if (!image) { // Verifica que se haya seleccionado una imagen
      showModal('warning', 'Imagen requerida', 'Debes seleccionar una imagen del material.');
      return;
    }

    try { // Intenta guardar el material
      const storedMaterials = await AsyncStorage.getItem("MATERIALES");
      const materials = storedMaterials ? JSON.parse(storedMaterials) : [];

      const duplicate = materials.find( // * Busca si ya existe un material con el mismo nombre y categoría */
        (m) =>
          m.nombre.toLowerCase() === name.trim().toLowerCase() &&
          m.categoria === category
      );

      if (duplicate) { // Si ya existe un material con el mismo nombre y categoría, muestra un mensaje de error
        showModal('error', 'Material duplicado', 'Este material ya existe.');
        return;
      }

      const newMaterial = { // Crea un nuevo objeto de material
        id: Date.now().toString(),
        nombre: name.trim(),
        descripcion: description.trim(),
        categoria: category,
        imagen: image,
      };

      materials.push(newMaterial);
      await AsyncStorage.setItem("MATERIALES", JSON.stringify(materials));

      showModal('success', '¡Éxito!', 'Material registrado correctamente.', () => navigation.goBack());
    } catch (error) { // Si ocurre un error al guardar el material, muestra un mensaje de error
      showModal('error', 'Error', 'Error al guardar el material.');
    }
  };

  useEffect(() => { // Efecto para cargar la foto del usuario logueado al montar el componente
    const fetchUserPhoto = async () => { // Función para obtener la foto del usuario desde AsyncStorage
      try {// Obtiene la información del usuario desde AsyncStorage
        const userRaw = await AsyncStorage.getItem('user');
        if (userRaw) {// Si hay datos del usuario, los parsea
          const user = JSON.parse(userRaw);
          setUserPhoto(user.photo || user.imageUri || null);
          setUserEmail(user.email);
          if (user.fullName) setUserInitial(user.fullName[0].toUpperCase());// Si tiene nombre completo, usa la primera letra
          else if (user.userName) setUserInitial(user.userName[0].toUpperCase());// Si tiene nombre de usuario, usa la primera letra
          else if (user.email) setUserInitial(user.email[0].toUpperCase());// Si tiene email, usa la primera letra
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
  }, []);

  return (// Renderiza la vista principal del componente
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Registrar Material</Text>
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
      <ScrollView contentContainerStyle={{ paddingBottom: 20, paddingTop: 24, flexGrow: 1, justifyContent: 'center', alignItems: 'center' }}>
        <View style={styles.card}>
          <MyInputText
            placeholder="Nombre del material"
            onChangeText={setName}
            value={name}
            style={styles.input}
          />
          <MyInputText
            placeholder="Descripción"
            onChangeText={setDescription}
            value={description}
            multiline
            style={styles.input}
          />

          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={category}
              onValueChange={(itemValue) => setCategory(itemValue)}
              style={styles.picker}
            >
              <Picker.Item label="Plástico" value="Plástico" />
              <Picker.Item label="Papel" value="Papel" />
              <Picker.Item label="Vidrio" value="Vidrio" />
              <Picker.Item label="Metal" value="Metal" />
              <Picker.Item label="Electrónicos" value="Electrónicos" />
              <Picker.Item label="Orgánico" value="Orgánico" />
              <Picker.Item label="Otro" value="Otro" />
            </Picker>
          </View>

          <MySingleButton
            title="Seleccionar Imagen"
            customPress={pickImage}
            style={styles.button}
          />
          {image && <Image source={{ uri: image }} style={styles.image} />}

          <MySingleButton
            title="Registrar Material"
            customPress={saveMaterial}
            style={styles.button}
          />
        </View>
      </ScrollView>
      <AppModal
        visible={modalVisible}
        type={modalType}
        title={modalTitle}
        message={modalMessage}
        onClose={handleModalClose}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({ // Estilos para el componente
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
    fontSize: 20,
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

export default CreateMaterial;