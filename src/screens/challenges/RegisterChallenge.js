import React, { useState, useEffect } from "react"; // Importar React y hooks necesarios
import {
  View,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Text,
  Image
} from "react-native"; // Importar componentes de React Native
import AsyncStorage from "@react-native-async-storage/async-storage"; // Importar AsyncStorage para almacenamiento local
import MyInputText from "../../components/MyInputText";// Importar componente de entrada de texto personalizado
import MySingleButton from "../../components/MySingleButton";// Importar componente de botón personalizado
import { Picker } from "@react-native-picker/picker";// Importar Picker para seleccionar materiales
import DateTimePicker from "@react-native-community/datetimepicker";// Importar DateTimePicker para seleccionar fechas
import AppModal from '../../components/AppModal';// Importar componente de modal personalizado
import { Ionicons } from '@expo/vector-icons';// Importar iconos de Ionicons
import * as Location from 'expo-location';// Importar ubicación de Expo para obtener la ubicación del usuario

const RegisterChallenge = ({ navigation, setIsLoggedIn, userEmail: propUserEmail, route }) => {// Componente principal para registrar un nuevo reto
  // Estados para manejar los datos del reto
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("Plástico");
  const [points, setPoints] = useState("");
  const [deadline, setDeadline] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [materials, setMaterials] = useState([]);
  const [selectedMaterialId, setSelectedMaterialId] = useState(null);

  // Estados para manejar el modal
  const [modalVisible, setModalVisible] = useState(false);
  const [modalType, setModalType] = useState('info');
  const [modalTitle, setModalTitle] = useState('');
  const [modalMessage, setModalMessage] = useState('');
  const [modalCallback, setModalCallback] = useState(null);
  const [userPhoto, setUserPhoto] = useState(null);
  const [userInitial, setUserInitial] = useState('U');

  // Estados para manejar errores de imagen y ubicación del reto
  const [imageError, setImageError] = useState(false);
  const [challengeLocation, setChallengeLocation] = useState(null);//

  // Permitir obtener userEmail desde props o desde route.params
  let userEmail = propUserEmail;
  if (!userEmail && route && route.params && route.params.userEmail) {
    userEmail = route.params.userEmail;
  }
  const isAdmin = userEmail === 'admin@admin.com'; // Verifica si el usuario es administrador

  // Solo permitir acceso al admin
  if (userEmail !== "admin@admin.com") {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Registrar Reto</Text>
          <View style={{flexDirection:'row', alignItems:'center'}}>
            <View style={{ width: 40, height: 40, borderRadius: 20, marginRight: 12, backgroundColor: '#e5e7eb', alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: '#22c55e' }}>
              <Ionicons name="person-circle" size={40} color="#22c55e" accessibilityLabel="Administrador" />
            </View>
          </View>
        </View>
        <View style={styles.contentContainer}>
          <Text style={{ color: 'red', fontSize: 18, textAlign: 'center', marginTop: 40 }}>
            Solo el administrador puede registrar retos.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  useEffect(() => {// Efecto para cargar los materiales al montar el componente
    const loadMaterials = async () => {// Cargar los materiales desde AsyncStorage
      const stored = await AsyncStorage.getItem("MATERIALES");
      const parsed = stored ? JSON.parse(stored) : [];
      setMaterials(parsed);
      if (parsed.length > 0) {// Si hay materiales, seleccionar el primero por defecto
        setSelectedMaterialId(parsed[0].id);
      }
    };
    loadMaterials();
  }, []);

  useEffect(() => {// Efecto para cargar la información del usuario al montar el componente
    const fetchUser = async () => {
      try {// Intenta obtener la información del usuario desde AsyncStorage
        let email = userEmail;
        let userRaw = await AsyncStorage.getItem('user');
        if (userRaw) {// Si hay datos del usuario, los parsea
          const user = JSON.parse(userRaw);
          setUserPhoto(user.photo || user.imageUri || null);
          if (user.fullName) setUserInitial(user.fullName[0].toUpperCase());
          else if (user.userName) setUserInitial(user.userName[0].toUpperCase());
          else if (user.email) setUserInitial(user.email[0].toUpperCase());
          else setUserInitial('U');
          if (!email) email = user.email;
        } else {// Si no hay datos del usuario, establece valores por defecto
          setUserPhoto(null);
          setUserInitial('U');
        }
        // userEmail is a let, so update if needed
        userEmail = email;
      } catch (e) {// Maneja cualquier error al obtener los datos del usuario
        setUserPhoto(null);
        setUserInitial('U');
      }
    };
    fetchUser();
  }, [propUserEmail, route]);

  const handleDateChange = (event, selectedDate) => {// Manejar el cambio de fecha en el DateTimePicker
    const currentDate = selectedDate || deadline;
    setShowDatePicker(false);
    setDeadline(currentDate);
  };

  const showModal = (type, title, message, callback) => {// Muestra el modal con el tipo, título y mensaje
    setModalType(type);
    setModalTitle(title);
    setModalMessage(message);
    setModalVisible(true);
    setModalCallback(() => callback || null);
  };

  const handleModalClose = () => { // Cierra el modal y ejecuta el callback si existe
    setModalVisible(false);
    if (modalCallback) {
      modalCallback();
      setModalCallback(null);
    }
  };

  const registerChallenge = async () => {// Registra un nuevo reto

    // Validaciones de campos
    if (!name.trim()) {
      showModal('warning', 'Campo obligatorio', 'El nombre del reto es obligatorio.');
      return;
    }
    if (!description.trim()) {
      showModal('warning', 'Campo obligatorio', 'La descripción es obligatoria.');
      return;
    }
    if (!category || category.trim() === '') {
      showModal('warning', 'Campo obligatorio', 'La categoría es obligatoria.');
      return;
    }
    if (!points.trim()) {
      showModal('warning', 'Campo obligatorio', 'El puntaje es obligatorio.');
      return;
    }
    const parsedPoints = parseInt(points);
    if (isNaN(parsedPoints) || parsedPoints <= 0) {
      showModal('error', 'Puntaje inválido', 'El puntaje debe ser un número mayor a 0.');
      return;
    }
    if (!selectedMaterialId) {
      showModal('warning', 'Campo obligatorio', 'Debes seleccionar un material.');
      return;
    }
    if (!deadline || isNaN(deadline.getTime())) {
      showModal('warning', 'Campo obligatorio', 'Debes seleccionar una fecha límite válida.');
      return;
    }


    // Solicitar ubicación al pulsar Registrar reto
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {// Verificar si se tiene permiso de ubicación
      showModal('error', 'Permiso necesario', 'Debes conceder el permiso de ubicación para registrar el reto.');
      return;
    }
    let coords;
    try {// Obtener la ubicación actual del usuario
      const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Highest });
      coords = loc.coords;
      if (!coords || !coords.latitude || !coords.longitude) {// Verificar si se obtuvo una ubicación válida
        showModal('error', 'Ubicación inválida', 'No se pudo obtener una ubicación válida.');
        return;
      }
      setChallengeLocation(coords);
    } catch (e) {// Manejar cualquier error al obtener la ubicación
      showModal('error', 'Error', 'No se pudo obtener la ubicación actual.');
      return;
    }
    const newChallenge = { // Crear un nuevo objeto de reto
      id: Date.now().toString(),
      nombre: name.trim(),
      descripcion: description.trim(),
      categoria: category.trim(),
      materialId: selectedMaterialId,
      puntaje: parsedPoints,
      fechaLimite: deadline.toISOString(),
      location: coords
    };
    try {// Guardar el nuevo reto en AsyncStorage
      const stored = await AsyncStorage.getItem("challenges");
      const challenges = stored ? JSON.parse(stored) : [];
      challenges.push(newChallenge);
      await AsyncStorage.setItem("challenges", JSON.stringify(challenges));
      showModal('success', '¡Éxito!', 'Reto registrado correctamente.', () => navigation.navigate("ChallengesScreen"));
    } catch (error) {// Manejar cualquier error al guardar el reto
      showModal('error', 'Error', 'Error al guardar el reto.');
    }
  };

  return ( // Renderizar la pantalla de registro de reto
    <SafeAreaView style={styles.container}>
      <AppModal
        visible={modalVisible}
        type={modalType}
        title={modalTitle}
        message={modalMessage}
        onClose={handleModalClose}
      />
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Registrar Reto</Text>
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
          <Text style={styles.title}>Registrar Reto</Text>
          <MyInputText
            placeholder="Nombre del reto"
            value={name}
            onChangeText={setName}
            style={styles.input}
          />
          <MyInputText
            placeholder="Descripción"
            value={description}
            onChangeText={setDescription}
            multiline
            style={styles.input}
          />
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={selectedMaterialId}
              onValueChange={(value) => setSelectedMaterialId(value)}
              style={{ width: '100%' }}
            >
              {materials.map((mat) => (
                <Picker.Item
                  key={mat.id}
                  label={`${mat.nombre} (${mat.categoria})`}
                  value={mat.id}
                />
              ))}
            </Picker>
          </View>
          <MyInputText
            placeholder="Puntaje asignado"
            value={points}
            onChangeText={setPoints}
            keyboardType="numeric"
            style={styles.input}
          />
          <TouchableOpacity style={styles.dateButton} onPress={() => setShowDatePicker(true)}>
            <Text style={styles.dateButtonText}>{`Seleccionar fecha límite: ${deadline.toLocaleDateString()}`}</Text>
          </TouchableOpacity>
          {showDatePicker && (
            <DateTimePicker
              value={deadline}
              mode="date"
              display="default"
              onChange={handleDateChange}
            />
          )}
          <MySingleButton
            title="Registrar reto"
            customPress={registerChallenge}
            style={styles.button}
            btnColor="#22c55e"
          />
        </View>
      </View>
    </SafeAreaView>
  );
};

export default RegisterChallenge;

const styles = StyleSheet.create({ // Estilos para la pantalla de registro de reto
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
  contentContainer: {
    padding: 20,
    backgroundColor: '#fff',
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    minHeight: 600,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: 28,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.10,
    shadowRadius: 10,
    elevation: 8,
    width: '100%',
    maxWidth: 500,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#22c55e',
    marginBottom: 18,
    textAlign: 'center',
    letterSpacing: 1,
  },
  pickerContainer: {
    width: '100%',
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 12,
    marginBottom: 14,
    backgroundColor: '#f1f5f9',
    overflow: 'hidden',
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
  dateButton: {
    width: '100%',
    backgroundColor: '#f1f5f9',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#d1d5db',
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginBottom: 14,
    alignItems: 'flex-start',
  },
  dateButtonText: {
    color: '#222',
    fontSize: 16,
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
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#22c55e',
  },
});