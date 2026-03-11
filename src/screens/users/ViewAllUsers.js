import React, { useState, useEffect } from "react";// Importa React y hooks necesarios
import { StyleSheet, View, SafeAreaView, FlatList, Image, TouchableOpacity, Text } from "react-native"; // Importa componentes de React Native
import AsyncStorage from '@react-native-async-storage/async-storage';// Importa AsyncStorage para manejar almacenamiento local
import AppModal from '../../components/AppModal';// Importa el componente AppModal para mostrar diálogos modales
import { Ionicons } from '@expo/vector-icons';// Importa iconos de Ionicons

const ViewAllUsers = ({ navigation }) => {// Componente principal para ver todos los usuarios registrados
  // Estados para manejar la lista de usuarios, visibilidad del modal, tipo de modal, título, mensaje, callback del modal, foto del usuario y su inicial
  const [users, setUsers] = useState([]);
  const [modalVisible, setModalVisible] = useState(false); 
  const [modalType, setModalType] = useState('info'); 
  const [modalTitle, setModalTitle] = useState(''); 
  const [modalMessage, setModalMessage] = useState('');
  const [modalCallback, setModalCallback] = useState(null);
  const [userPhoto, setUserPhoto] = useState(null);
  const [userInitial, setUserInitial] = useState('U');

  // Muestra el modal con el tipo, título y mensaje
  const showModal = (type, title, message, callback, options = {}) => {
    setModalType(type);
    setModalTitle(title);
    setModalMessage(message);
    setModalVisible(true);
    setModalCallback(() => callback || null);
  };

  // Cierra el modal y ejecuta el callback si existe
  const handleModalClose = () => {
    setModalVisible(false);
    if (modalCallback) {
      modalCallback();
      setModalCallback(null);
    }
  };


  useEffect(() => {// Carga la lista de usuarios y la foto del usuario logueado al montar
    const fetchUsers = async () => {// Carga los usuarios desde AsyncStorage
      try {
        const storedUsers = await AsyncStorage.getItem("users");
        const parsedUsers = storedUsers ? JSON.parse(storedUsers) : [];

        if (parsedUsers.length > 0) {// Si hay usuarios registrados
          setUsers(parsedUsers);
        } else {// Si no hay usuarios registrados
          showModal('info', 'Mensaje', 'No hay usuarios registrados.', () => navigation.navigate("UsersScreen"));
        }
      } catch (error) {// Si ocurre un error al cargar los usuarios
        showModal('error', 'Error', 'Error al cargar los usuarios.');
      }
    };

    fetchUsers();
    const fetchUserPhoto = async () => {// Carga la foto del usuario logueado desde AsyncStorage
      try {// Intenta obtener la foto del usuario logueado
        const userRaw = await AsyncStorage.getItem('user');
        if (userRaw) {// Si hay un usuario logueado
          const user = JSON.parse(userRaw);
          setUserPhoto(user.photo || user.imageUri || null);
          if (user.fullName) setUserInitial(user.fullName[0].toUpperCase());// Si tiene nombre completo, usa la primera letra
          else if (user.userName) setUserInitial(user.userName[0].toUpperCase());// Si tiene nombre de usuario, usa la primera letra
          else if (user.email) setUserInitial(user.email[0].toUpperCase());// Si tiene email, usa la primera letra
          else setUserInitial('U');// Si no tiene ninguno, usa 'U' como inicial
        } else {// Si no hay usuario logueado
          setUserPhoto(null);
          setUserInitial('U');
        }
      } catch (e) {// Si ocurre un error al obtener la foto del usuario
        setUserPhoto(null);
        setUserInitial('U');
      }
    };

    fetchUserPhoto();
  }, []);

  // Navega a la pantalla de detalles del usuario
  const handleViewUser = (user) => {
    navigation.navigate('ViewUser', { user });
  };

  // Navega a la pantalla de edición del usuario
  const handleEditUser = (user) => {
    navigation.navigate('UpdateUser', { user });
  };

  // Elimina un usuario de la lista
  const handleDeleteUser = async (user) => {
    showModal('warning', 'Eliminar usuario', `¿Seguro que deseas eliminar a ${user.fullName}?`, async () => {// Muestra un modal de confirmación para eliminar el usuario
      try {// Intenta eliminar el usuario de AsyncStorage
        const storedUsers = await AsyncStorage.getItem('users');
        let users = storedUsers ? JSON.parse(storedUsers) : [];
        users = users.filter(u => u.email !== user.email);
        await AsyncStorage.setItem('users', JSON.stringify(users));
        setUsers(users);
        showModal('success', 'Eliminado', 'Usuario eliminado correctamente.');
      } catch (error) {// Maneja errores al eliminar el usuario
        showModal('error', 'Error', 'No se pudo eliminar el usuario.');
      }
    }, { blockBackdrop: true });
  };

  const listItemView = (item, index) => ( // Renderiza cada elemento de la lista de usuarios
    <View key={index} style={styles.cardUX}>
      <Image source={{ uri: item.photo }} style={styles.imageUX} />
      <View style={styles.cardContentUX}>
        <Text style={styles.cardTitleUX}>{item.fullName}</Text>
        <Text style={styles.cardTextUX}>{item.email}</Text>
        <Text style={styles.cardTextUX}>Edad: {item.age}</Text>
        <Text style={styles.cardTextUX}>Zona: {item.zone}</Text>
        <View style={styles.actionsContainerUX}>
          <TouchableOpacity style={[styles.actionButtonUX, { backgroundColor: '#3b82f6' }]} onPress={() => handleViewUser(item)}>
            <Text style={styles.actionButtonTextUX}>Ver</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.actionButtonUX, { backgroundColor: '#22c55e' }]} onPress={() => handleEditUser(item)}>
            <Text style={styles.actionButtonTextUX}>Editar</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.actionButtonUX, { backgroundColor: '#ef4444' }]} onPress={() => handleDeleteUser(item)}>
            <Text style={styles.actionButtonTextUX}>Eliminar</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  const isAdmin = true;

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
        <Text style={styles.headerTitle}>Usuarios Registrados</Text>
        <View style={{flexDirection:'row', alignItems:'center'}}>
          {isAdmin ? (
            <Ionicons name="person-circle" size={40} color="#22c55e" style={{marginRight: 12}} accessibilityLabel="Administrador" />
          ) : userPhoto ? (
            <Image source={{ uri: userPhoto }} style={{ width: 40, height: 40, borderRadius: 20, marginRight: 12, borderWidth: 2, borderColor: '#22c55e', backgroundColor: '#e5e7eb' }} accessibilityLabel="Foto de perfil" />
          ) : (
            <View style={{ width: 40, height: 40, borderRadius: 20, marginRight: 12, backgroundColor: '#e5e7eb', alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: '#22c55e' }}>
              <Text style={{color:'#22c55e', fontWeight:'bold', fontSize:18}}>{userInitial}</Text>
            </View>
          )}
        </View>
      </View>
      <FlatList
        contentContainerStyle={styles.list}
        data={users}
        keyExtractor={(_, index) => index.toString()}
        renderItem={({ item, index }) => listItemView(item, index)}
      />
    </SafeAreaView>
  );
};

export default ViewAllUsers;

const styles = StyleSheet.create({ // Estilos para la pantalla de ver todos los usuarios
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
    borderRadius: 35,
    marginRight: 16,
    borderWidth: 2,
    borderColor: '#22c55e',
    backgroundColor: '#e5e7eb',
  },
  cardContentUX: {
    flex: 1,
    justifyContent: 'center',
  },
  cardTitleUX: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#22c55e',
    letterSpacing: 1,
    marginBottom: 2,
  },
  cardTextUX: {
    color: '#374151',
    fontSize: 15,
    marginBottom: 2,
  },
  actionsContainerUX: {
    flexDirection: 'row',
    marginTop: 8,
    gap: 8,
  },
  actionButtonUX: {
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 18,
    alignItems: 'center',
    marginRight: 8,
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
});