import React, { useState, useEffect } from 'react'; // Importa React y hooks necesarios
import {
  View, Text, TextInput, Button, Image, StyleSheet, TouchableOpacity, ScrollView, SafeAreaView
} from 'react-native'; // Importa componentes de React Native
import { Picker } from '@react-native-picker/picker';// Importa el selector de React Native
import * as ImagePicker from 'expo-image-picker'; // Importa el selector de imágenes de Expo
import * as Location from 'expo-location';// Importa la ubicación de Expo
import AsyncStorage from '@react-native-async-storage/async-storage';// Importa AsyncStorage para almacenamiento local
import AppModal from '../../components/AppModal';// Importa el componente AppModal para mostrar diálogos modales
import { Ionicons } from '@expo/vector-icons';// Importa iconos de Ionicons

const ParticipateChallenge = ({ navigation, setIsLoggedIn, userEmail: propUserEmail }) => { // Componente para participar en un reto
  
  // Estados para manejar la imagen de usuario, iniciales, email y errores
  const [challenges, setChallenges] = useState([]);
  const [selectedChallengeId, setSelectedChallengeId] = useState('');
  const [image, setImage] = useState(null);
  const [location, setLocation] = useState(null);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);

  // Estados para manejar el modal
  const [modalVisible, setModalVisible] = useState(false);
  const [modalType, setModalType] = useState('info');
  const [modalTitle, setModalTitle] = useState('');
  const [modalMessage, setModalMessage] = useState('');
  const [modalCallback, setModalCallback] = useState(null);

  // Estados para manejar la imagen de usuario, iniciales, email y errores
  const [userPhoto, setUserPhoto] = useState(null);
  const [userInitial, setUserInitial] = useState('U');
  const [imageError, setImageError] = useState(false);
  const [userEmail, setUserEmail] = useState(propUserEmail || null);

  const isAdmin = userEmail === 'admin@admin.com';// Verifica si el usuario es administrador

  useEffect(() => { // Efecto para cargar la información del usuario al montar el componente
    const fetchUser = async () => {// Intenta obtener la información del usuario desde AsyncStorage
      try {// Si se proporciona un email, lo usa; si no, intenta obtenerlo del almacenamiento
        let email = propUserEmail;
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
        setUserEmail(email);
      } catch (e) {// Maneja cualquier error al obtener los datos del usuario
        setUserPhoto(null);
        setUserInitial('U');
      }
    };
    fetchUser();
  }, [propUserEmail]);

  useEffect(() => {// Efecto para cargar los retos al montar el componente
    loadChallenges();
  }, [userEmail]);

  const loadChallenges = async () => {// Función para cargar los retos desde AsyncStorage
    try {// Intenta obtener los retos almacenados
      const data = await AsyncStorage.getItem('challenges');
      let retos = data ? JSON.parse(data) : [];
      // Si quieres filtrar por usuario, hazlo aquí, pero por defecto mostrar todos
      setChallenges(retos);
    } catch (error) {// Maneja cualquier error al cargar los retos
      setChallenges([]);
    }
  };

  const showModal = (type, title, message, callback) => {// Muestra el modal con el tipo, título y mensaje
    setModalType(type);
    setModalTitle(title);
    setModalMessage(message);
    setModalVisible(true);
    setModalCallback(() => callback || null);
  };

  const handleModalClose = () => {// Cierra el modal y ejecuta el callback si existe
    setModalVisible(false);
    if (modalCallback) {// Si hay un callback, lo ejecuta
      modalCallback();
      setModalCallback(null);
    }
  };

  // Cambiar getLocation para solicitar permisos solo al enviar
  const getLocation = async () => {
    try {// Solicita permisos de ubicación
      const { status } = await Location.requestForegroundPermissionsAsync();// Solicita permisos de ubicación
      if (status !== 'granted') {//
        showModal('error', 'Permiso necesario', 'Debes conceder el permiso de ubicación para participar en el reto.');
        setLocation(null);
        return null;
      }
      const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Highest });// Obtiene la ubicación actual con la mayor precisión
      setLocation(loc.coords);
      return loc.coords;
    } catch (e) {// Maneja cualquier error al obtener la ubicación
      showModal('error', 'Error', 'No se pudo obtener la ubicación actual.');
      setLocation(null);
      return null;
    }
  };

  const pickImage = async () => {// Función para seleccionar una imagen de la galería
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 1,
    });

    // Compatibilidad con versiones nuevas de expo-image-picker
    if (!result.canceled && result.assets && result.assets.length > 0) {// Si se selecciona una imagen y hay assets disponibles
      setImage(result.assets[0].uri);
    } else if (result.uri) {// Si se selecciona una imagen y hay una URI disponible
      setImage(result.uri);
    }
  };

  // Utilidad para calcular distancia entre dos puntos (Haversine)
  function getDistanceFromLatLonInKm(lat1, lon1, lat2, lon2) {
    const R = 6371; // Radio de la tierra en km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a =
      0.5 - Math.cos(dLat)/2 +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      (1 - Math.cos(dLon))/2;
    return R * 2 * Math.asin(Math.sqrt(a));
  }

  const handleSubmit = async () => {// Función para manejar el envío del formulario de participación
    if (!selectedChallengeId || !image) {// Verifica que se haya seleccionado un reto y una imagen
      showModal('warning', 'Faltan datos', 'Selecciona un reto y sube una imagen.');
      return;
    }
    setLoading(true);
    const coords = await getLocation();// Obtiene la ubicación actual del usuario
    if (!coords) {// Si no se pudo obtener la ubicación, muestra un mensaje y no continúa
      setLoading(false);
      return; // No continuar si no hay ubicación
    }
    setLocation(coords);
    const selectedChallenge = challenges.find(c => c.id === selectedChallengeId);// Encuentra el reto seleccionado por su ID
    
    // Validar distancia si el reto tiene ubicación
    if (selectedChallenge && selectedChallenge.location) {
      const dist = getDistanceFromLatLonInKm(
        coords.latitude,
        coords.longitude,
        selectedChallenge.location.latitude,
        selectedChallenge.location.longitude
      );
      if (dist > 10) {// Si la distancia es mayor a 10 km, muestra un mensaje de error
        setLoading(false);
        showModal('error', 'Fuera de rango', 'Debes estar a menos de 10 km del lugar donde fue registrado el reto para participar.');
        return;
      }
    }

    // Obtener el usuario logueado
    const user = await AsyncStorage.getItem('user');
    let userEmail = '';
    if (user) {// Si hay datos del usuario, los parsea
      const userObj = JSON.parse(user);
      userEmail = userObj.email;
    }

    const participation = {// Crea el objeto de participación
      challengeId: selectedChallengeId,
      challengeName: selectedChallenge?.nombre,
      image,
      location,
      comment,
      status: 'Pendiente',
      date: new Date().toISOString(),
      userEmail // Guardar el email del usuario en la participación
    };

    try {// Intenta guardar la participación en AsyncStorage
      const stored = await AsyncStorage.getItem('participations');
      const existing = stored ? JSON.parse(stored) : [];
      existing.push(participation);
      await AsyncStorage.setItem('participations', JSON.stringify(existing));
      showModal('success', '¡Éxito!', 'Participación registrada.', () => navigation.goBack());
    } catch (error) {// Maneja cualquier error al guardar la participación
      showModal('error', 'Error', 'Error al guardar participación.');
    }

    setLoading(false);
  };

  return (// Renderiza la pantalla de participación en un reto
    <SafeAreaView style={styles.container}>
      <AppModal
        visible={modalVisible}
        type={modalType}
        title={modalTitle}
        message={modalMessage}
        onClose={handleModalClose}
      />
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Participar en Reto</Text>
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
      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        <Text style={styles.title}>Selecciona un reto para participar</Text>
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={selectedChallengeId}
            onValueChange={(itemValue) => setSelectedChallengeId(itemValue)}
            style={styles.picker}
            itemStyle={styles.pickerItem}
          >
            <Picker.Item label="-- Selecciona un reto --" value="" />
            {challenges.length === 0 && (
              <Picker.Item label="No hay retos disponibles" value="none" enabled={false} />
            )}
            {challenges.map((challenge) => (
              <Picker.Item key={challenge.id} label={`${challenge.nombre} (${challenge.categoria || 'Sin categoría'})`} value={challenge.id} />
            ))}
          </Picker>
        </View>
        <TouchableOpacity style={styles.imageButton} onPress={pickImage} accessibilityLabel="Seleccionar imagen">
          <Text style={styles.imageButtonText}>{image ? 'Cambiar Imagen' : 'Seleccionar Imagen'}</Text>
        </TouchableOpacity>
        {image && (
          <View style={styles.imagePreviewContainer}>
            <Image source={{ uri: image }} style={styles.image} />
            <Text style={styles.imagePreviewText}>Imagen seleccionada</Text>
          </View>
        )}
        <TextInput
          placeholder="Comentario (opcional)"
          style={styles.input}
          value={comment}
          onChangeText={setComment}
          placeholderTextColor="#888"
          multiline
          numberOfLines={2}
          accessibilityLabel="Comentario"
        />
        <TouchableOpacity
          style={[styles.submitButton, loading && styles.submitButtonDisabled]}
          onPress={handleSubmit}
          disabled={loading}
          accessibilityLabel="Enviar participación"
        >
          <Text style={styles.submitButtonText}>{loading ? 'Enviando...' : 'Enviar Participación'}</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

export default ParticipateChallenge;

const styles = StyleSheet.create({ // Estilos para la pantalla de participación en un reto
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
  scrollContent: {
    padding: 20,
    backgroundColor: '#fff',
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    minHeight: 600,
  },
  title: {
    color: '#111827',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 18,
    textAlign: 'center',
  },
  pickerContainer: {
    backgroundColor: '#f1f5f9',
    borderRadius: 8,
    marginBottom: 18,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    overflow: 'hidden',
  },
  picker: {
    height: 48,
    color: '#111827',
  },
  pickerItem: {
    fontSize: 16,
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
  submitButton: {
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
  submitButtonDisabled: {
    backgroundColor: '#a7f3d0',
  },
  submitButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 18,
    letterSpacing: 1,
  },
});