import React, { useEffect, useState } from 'react'; // Importa los hooks de React
import { View, Text, Image, StyleSheet, Button, SafeAreaView, ScrollView, TextInput, TouchableOpacity } from 'react-native'; // Import necessary components from React Native
import AsyncStorage from '@react-native-async-storage/async-storage'; // Importa AsyncStorage for local storage
import AppModal from '../../components/AppModal';// Importa componente modal personalizado

const ViewChallengeParticipation = ({ route, navigation }) => { // Componente para ver la participación de un usuario en un reto
  
  const { participationId, challengeId, userEmail } = route.params; // Obtiene los parámetros de la ruta
  // Estados para manejar la participación, puntos, si es admin, carga y puntaje máximo
  const [participation, setParticipation] = useState(null);
  const [points, setPoints] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [maxPoints, setMaxPoints] = useState(0);

    // Estados para manejar el modal
  const [modalVisible, setModalVisible] = useState(false);
  const [modalType, setModalType] = useState('success');
  const [modalTitle, setModalTitle] = useState('');
  const [modalMessage, setModalMessage] = useState('');
  const [modalCallback, setModalCallback] = useState(null);

  useEffect(() => { // Efecto para cargar la participación y el puntaje máximo al montar el componente
    const fetchParticipation = async () => {// Cargar la participación desde AsyncStorage
      const stored = await AsyncStorage.getItem('participations');
      const participations = stored ? JSON.parse(stored) : [];
      const part = participations.find((p, idx) => idx === participationId && p.challengeId === challengeId); // Buscar la participación por id y challengeId
      setParticipation(part);

      // Buscar el puntaje máximo del challenge
      const challengesRaw = await AsyncStorage.getItem('challenges');
      const challenges = challengesRaw ? JSON.parse(challengesRaw) : [];
      const challenge = challenges.find(c => c.id === challengeId);
      setMaxPoints(challenge?.puntaje || 0);
      setLoading(false);
    };
    fetchParticipation();
    setIsAdmin(userEmail === 'admin@admin.com'); // Determinar si es admin por el email
  }, []);

  const showModal = (type, title, message, callback) => { // Función para mostrar el modal con tipo, título y mensaje
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

  const handleAssignPoints = async () => {// Asigna puntos a la participación
    const parsedPoints = parseInt(points);
    if (isNaN(parsedPoints) || parsedPoints < 0 || parsedPoints > maxPoints) { // Validar que los puntos sean un número válido
      showModal('warning', 'Puntaje inválido', `El puntaje debe ser un número entre 0 y ${maxPoints}`);
      return;
    }
    const stored = await AsyncStorage.getItem('participations');
    const participations = stored ? JSON.parse(stored) : [];
    // Buscar la participación por id y challengeId
    const idx = participations.findIndex((p, i) => i === participationId && p.challengeId === challengeId); // Buscar la participación por id y challengeId
    if (idx !== -1) { // Si se encuentra la participación
      participations[idx].assignedPoints = parsedPoints;
      participations[idx].status = 'Aprobado';
      await AsyncStorage.setItem('participations', JSON.stringify(participations));
      showModal('success', '¡Éxito!', 'Puntaje asignado correctamente.', () => navigation.goBack());
    } else {// Si no se encuentra la participación
      showModal('error', 'Error', 'No se encontró la participación.');
    }
  };

  const handleReject = async () => { // Maneja el rechazo de una participación
    const stored = await AsyncStorage.getItem('participations');
    const participations = stored ? JSON.parse(stored) : [];

    // Buscar la participación por id y challengeId
    const idx = participations.findIndex((p, i) => i === participationId && p.challengeId === challengeId);
    if (idx !== -1) {// Si se encuentra la participación
      participations[idx].status = 'Rechazado';
      await AsyncStorage.setItem('participations', JSON.stringify(participations));
      showModal('success', 'Participación rechazada', 'La participación fue rechazada correctamente.', () => navigation.goBack());
    } else {// Si no se encuentra la participación
      showModal('error', 'Error', 'No se encontró la participación.');
    }
  };

  if (loading || !participation) return <Text style={{margin: 20}}>Cargando...</Text>; // Muestra un mensaje de carga mientras se obtienen los datos

  return (// Renderiza la vista de la participación
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.card}>
          <Text style={styles.title}>Participación de usuario</Text>
          <Text style={styles.label}>Usuario: {participation.userEmail || 'Desconocido'}</Text>
          <Text style={styles.label}>Comentario: {participation.comment || 'Sin comentario'}</Text>
          <Text style={styles.label}>Estado: {participation.status}</Text>
          {participation.image && (
            <Image source={{ uri: participation.image }} style={styles.image} />
          )}
          <Text style={styles.label}>Ubicación: {participation.location ? `${participation.location.latitude}, ${participation.location.longitude}` : 'No registrada'}</Text>
          {isAdmin && (
            <View style={styles.adminSection}>
              <Text style={styles.label}>Asignar puntaje (máx: {maxPoints}):</Text>
              <TextInput
                style={styles.input}
                value={points}
                onChangeText={setPoints}
                keyboardType="numeric"
                placeholder={`0 - ${maxPoints}`}
                placeholderTextColor="#94a3b8"
              />
              <TouchableOpacity style={styles.button} onPress={handleAssignPoints}>
                <Text style={styles.buttonText}>Asignar Puntaje</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.button, styles.rejectButton]} onPress={handleReject}>
                <Text style={styles.buttonText}>Rechazar Participación</Text>
              </TouchableOpacity>
            </View>
          )}
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
  content: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: 26,
    marginVertical: 18,
    width: '100%',
    maxWidth: 420,
    shadowColor: '#22c55e',
    shadowOpacity: 0.12,
    shadowRadius: 10,
    elevation: 4,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  title: { fontSize: 24, fontWeight: 'bold', color: '#22c55e', marginBottom: 18, textAlign: 'center' },
  label: { fontSize: 16, marginBottom: 10, color: '#222' },
  image: { width: '100%', height: 200, borderRadius: 12, marginBottom: 18, backgroundColor: '#f1f5f9' },
  input: { borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 8, padding: 12, marginBottom: 14, backgroundColor: '#f1f5f9', fontSize: 16, color: '#222' },
  adminSection: { marginTop: 24 },
  button: {
    backgroundColor: '#22c55e',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 8,
    shadowColor: '#22c55e',
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 2,
  },
  rejectButton: {
    backgroundColor: '#ef4444',
    shadowColor: '#ef4444',
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 18,
    letterSpacing: 1,
  },
});

export default ViewChallengeParticipation;
