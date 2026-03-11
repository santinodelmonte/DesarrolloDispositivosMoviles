import React, { useEffect, useState } from 'react'; // Importa React y hooks necesarios
import { View, Text, FlatList, StyleSheet, ActivityIndicator, SafeAreaView, TouchableOpacity } from 'react-native'; // Importa componentes de React Native
import AsyncStorage from '@react-native-async-storage/async-storage'; // Importa AsyncStorage para manejar almacenamiento local
import { useNavigation } from '@react-navigation/native'; // Importa useNavigation para navegación
import { Picker } from '@react-native-picker/picker'; // Importa Picker para seleccionar filtros
import AppModal from '../../components/AppModal'; // Importa el componente AppModal para mostrar diálogos modales

const MyParticipations = ({ route }) => { // Componente para mostrar las participaciones del usuario

  const navigation = useNavigation();// Obtiene el objeto de navegación
  const userEmail = route?.params?.userEmail;/// Obtiene el email del usuario desde los parámetros de la ruta
  const isAdmin = userEmail === "admin@admin.com";  // Determinar si es admin por el email
  const [participations, setParticipations] = useState([]); // Estado para almacenar las participaciones del usuario
  const [loading, setLoading] = useState(true);// Estado para manejar la carga de datos
  const [statusFilter, setStatusFilter] = useState('Todas');// Estado para manejar el filtro de estado de las participaciones
    // Estados para manejar el modal
  const [modalVisible, setModalVisible] = useState(false);
  const [modalType, setModalType] = useState('info');
  const [modalTitle, setModalTitle] = useState('');
  const [modalMessage, setModalMessage] = useState('');
  const [modalCallback, setModalCallback] = useState(null);

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

  useEffect(() => { // Efecto para cargar las participaciones al montar el componente
    const loadParticipations = async () => { // Función para cargar las participaciones
      setLoading(true);
      const stored = await AsyncStorage.getItem('participations');
      const allParticipations = stored ? JSON.parse(stored) : [];
      let participationsToShow = allParticipations;
      
      const admin = (userEmail === 'admin@admin.com');// Determinar si es admin por el email ACTUALIZADO dentro de la función
      if (!admin) { // Si no es admin, filtrar por el email del usuario
        participationsToShow = allParticipations.filter(p => p.userEmail === userEmail);
      }
      if (statusFilter !== 'Todas') { // Si se ha seleccionado un filtro de estado, aplicar el filtro
        participationsToShow = participationsToShow.filter(p => (p.status || 'Pendiente') === statusFilter);
      }
      setParticipations(participationsToShow);
      setLoading(false);
    };
    loadParticipations();

    const unsubscribe = navigation.addListener('focus', loadParticipations); // Escucha el evento de enfoque para recargar las participaciones cuando se navega a esta pantalla
    return unsubscribe;
  }, [userEmail, statusFilter]);

  const handleDeleteParticipation = async (index) => { // Maneja la eliminación de una participación
    showModal('warning', 'Eliminar participación', '¿Estás seguro de que deseas eliminar esta participación?', async () => {
      const stored = await AsyncStorage.getItem('participations');
      let allParticipations = stored ? JSON.parse(stored) : [];
      allParticipations.splice(index, 1);
      await AsyncStorage.setItem('participations', JSON.stringify(allParticipations)); //
      setParticipations(prev => prev.filter((_, i) => i !== index));
      showModal('success', 'Eliminado', 'La participación fue eliminada correctamente.');
    });
  };

  const renderItem = ({ item, index }) => ( // Renderiza cada participación en la lista
    <View style={styles.card}>
      <TouchableOpacity
        disabled={!isAdmin}
        onPress={() => {
          if (isAdmin) {
            navigation.navigate('ViewChallengeParticipation', {
              participationId: index,
              challengeId: item.challengeId,
              userEmail,
              maxPoints: item.maxPoints || item.puntaje || item.puntos || 0
            });
          }
        }}
      >
        <Text style={styles.cardTitle}>{item.challengeName || 'Reto desconocido'}</Text>
        <Text style={styles.cardText}>Usuario: {item.userEmail || 'Desconocido'}</Text>
        <Text style={styles.cardText}>Comentario: {item.comment || 'Sin comentario'}</Text>
        <Text style={[styles.cardText, item.status === 'Aprobado' ? styles.statusAprobado : item.status === 'Rechazado' ? styles.statusRechazado : null]}>
          Estado: {item.status || 'Pendiente'}
        </Text>
        <Text style={styles.cardText}>Puntaje asignado: {item.assignedPoints !== undefined ? item.assignedPoints : 'No asignado'}</Text>
        <Text style={styles.cardText}>Fecha: {item.date ? new Date(item.date).toLocaleDateString() : 'Sin fecha'}</Text>
        {isAdmin && <Text style={styles.textSmall}>(Toca para asignar puntaje)</Text>}
      </TouchableOpacity>
      {isAdmin && (
        <TouchableOpacity style={styles.deleteButton} onPress={() => handleDeleteParticipation(index)}>
          <Text style={styles.deleteButtonText}>Eliminar</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  return ( // Renderiza la vista principal del componente
    <SafeAreaView style={styles.container}>
      <AppModal
        visible={modalVisible}
        type={modalType}
        title={modalTitle}
        message={modalMessage}
        onClose={handleModalClose}
      />
      <View style={styles.header}>
        <Text style={styles.headerText}>
          {(userEmail === 'admin@admin.com')
            ? 'Participaciones de todos los usuarios'
            : 'Mis Participaciones'}
        </Text>
      </View>
      <View style={styles.filterContainer}>
        <Text style={styles.filterLabel}>Filtrar por estado:</Text>
        <View style={styles.pickerWrapper}>
          <Picker
            selectedValue={statusFilter}
            style={styles.picker}
            onValueChange={setStatusFilter}
            dropdownIconColor="#22c55e"
          >
            <Picker.Item label="Todas" value="Todas" />
            <Picker.Item label="Aprobado" value="Aprobado" />
            <Picker.Item label="Rechazado" value="Rechazado" />
            <Picker.Item label="Pendiente" value="Pendiente" />
          </Picker>
        </View>
      </View>
      {loading ? (
        <ActivityIndicator size="large" color="#22c55e" style={styles.loading} />
      ) : participations.length === 0 ? (
        <Text style={styles.empty}>No hay participaciones.</Text>
      ) : (
        <FlatList
          contentContainerStyle={styles.list}
          data={participations}
          keyExtractor={(_, idx) => idx.toString()}
          renderItem={renderItem}
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({ // Estilos para el componente MyParticipations
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f8fafc',
    paddingHorizontal: 18,
    paddingVertical: 18,
    shadowColor: '#22c55e',
    shadowOpacity: 0.10,
    shadowRadius: 8,
    elevation: 8,
    borderBottomWidth: 0,
  },
  headerText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#22c55e',
    textAlign: 'center',
    letterSpacing: 1,
  },
  filterContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    marginBottom: 10,
    backgroundColor: '#f1f5f9',
    borderRadius: 16,
    padding: 12,
    shadowColor: '#22c55e',
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
  },
  filterLabel: {
    color: '#111827',
    fontWeight: 'bold',
    fontSize: 16,
    marginRight: 8,
  },
  pickerWrapper: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 8,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  picker: {
    flex: 1,
    color: '#111827',
    backgroundColor: 'transparent',
    fontSize: 16,
    height: 40,
  },
  list: { paddingBottom: 32 },
  card: {
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: 22,
    marginVertical: 12,
    marginHorizontal: 16,
    shadowColor: '#22c55e',
    shadowOpacity: 0.12,
    shadowRadius: 10,
    elevation: 4,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  cardTitle: {
    color: '#22c55e',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  cardText: {
    color: '#374151',
    fontSize: 16,
    marginBottom: 4,
  },
  textSmall: { color: '#888', fontSize: 13, marginTop: 4 },
  empty: { color: '#888', fontSize: 17, textAlign: 'center', marginTop: 40 },
  statusAprobado: { color: '#22c55e', fontWeight: 'bold' },
  statusRechazado: { color: '#ef4444', fontWeight: 'bold' },
  deleteButton: {
    marginTop: 12,
    backgroundColor: '#ef4444',
    paddingVertical: 10,
    paddingHorizontal: 26,
    borderRadius: 12,
    alignSelf: 'flex-end',
    shadowColor: '#ef4444',
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 3,
  },
  deleteButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
    letterSpacing: 0.5,
  },
  loading: {
    marginTop: 40,
  },
});

export default MyParticipations;
