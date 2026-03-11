import React, { useState, useEffect } from "react";// Importa React y hooks necesarios
import { StyleSheet, View, SafeAreaView, ScrollView, KeyboardAvoidingView, Text, Image } from "react-native";// Importa componentes de React Native
import AsyncStorage from '@react-native-async-storage/async-storage';// Importa AsyncStorage para manejar almacenamiento local
import MyText from "../../components/MyText";// Importa el componente de texto personalizado
import MyInputText from "../../components/MyInputText";// Importa el componente de entrada de texto personalizado
import MySingleButton from "../../components/MySingleButton";// Importa el componente de botón personalizado
import AppModal from '../../components/AppModal';// Importa el componente de modal personalizado
import ImageSelector from "../../components/ImageSelector";// Importa el componente de selector de imagen
import { Ionicons } from '@expo/vector-icons';// Importa iconos de Ionicons

const UpdateUser = ({ navigation, setIsLoggedIn, route }) => {// Componente principal para actualizar un usuario

    // Estados para manejar los datos del usuario
    const [userNameSearch, setUserNameSearch] = useState(""); 
    const [userName, setUserName] = useState(""); 
    const [userEmail, setEmail] = useState("");
    const [age, setAge] = useState(""); 
    const [zone, setZone] = useState(""); 
    const [photo, setPhoto] = useState(null); 
    const [userPhoto, setUserPhoto] = useState(null); 
    const [userInitial, setUserInitial] = useState('U'); 

// Estados para manejar el modal
    const [modalVisible, setModalVisible] = useState(false); // Estado de visibilidad del modal
    const [modalType, setModalType] = useState('info'); // Tipo de modal
    const [modalTitle, setModalTitle] = useState(''); // Título del modal
    const [modalMessage, setModalMessage] = useState(''); // Mensaje del modal
    const [modalCallback, setModalCallback] = useState(null); // Callback del modal


    useEffect(() => {// Efecto para cargar los datos del usuario al montar el componente
        if (route && route.params && route.params.user) {
            const user = route.params.user;
            setUserName(user.fullName || user.userName || '');
            setEmail(user.email || '');
            setAge(user.age ? String(user.age) : '');
            setZone(user.zone || '');
            setPhoto(user.photo || null);
        }
        const fetchUserPhoto = async () => {// Intenta obtener la foto del usuario desde AsyncStorage
            try {
                const userRaw = await AsyncStorage.getItem('user');
                if (userRaw) {// Si hay datos del usuario, los parsea
                    const user = JSON.parse(userRaw);
                    setUserPhoto(user.photo || user.imageUri || null);
                    if (user.fullName) setUserInitial(user.fullName[0].toUpperCase());// Usa la primera letra del nombre completo
                    else if (user.userName) setUserInitial(user.userName[0].toUpperCase());// Usa la primera letra del nombre de usuario
                    else if (user.email) setUserInitial(user.email[0].toUpperCase());// Usa la primera letra del email
                    else setUserInitial('U');// Establece 'U' como inicial por defecto si no hay datos
                } else {// Si no hay datos del usuario, establece valores por defecto
                    setUserPhoto(null);
                    setUserInitial('U');
                }
            } catch (e) {// Maneja cualquier error al obtener los datos del usuario
                setUserPhoto(null);
                setUserInitial('U');
            }
        };
        fetchUserPhoto();
    }, [route]);

    // Muestra el modal con el tipo, título y mensaje
    const showModal = (type, title, message, callback) => {
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

    const searchUser = async () => {// Función para buscar un usuario por nombre o email
        if(!userNameSearch.trim()){// Verifica si el campo de búsqueda está vacío
            showModal('warning', 'Campo requerido', 'El nombre de usuario es requerido!');
            return;
        }
        try{// Intenta obtener los usuarios almacenados
            const usersRaw = await AsyncStorage.getItem('users');
            const users = usersRaw ? JSON.parse(usersRaw) : [];
            const userData = users.find(u => u.fullName === userNameSearch || u.userName === userNameSearch);
            if(userData){// Si se encuentra el usuario
                setUserName(userData.fullName || userData.userName);
                setEmail(userData.email);
                setAge(userData.age ? String(userData.age) : '');
                setZone(userData.zone || '');
                setPhoto(userData.photo || null);
            }else{// Si no se encuentra el usuario
                showModal('error', 'No encontrado', 'Usuario no encontrado!');
            }
        }catch(error){// Maneja errores al buscar el usuario
            showModal('error', 'Error', 'Error al buscar usuario.');
        }
    };

    const updateUser = async () => {// Función para actualizar los datos del usuario

        // Validaciones de los campos
        if(!userName.trim()){
            showModal('warning', 'Campo requerido', 'El nombre de usuario es requerido!');
            return;
        }
        if(!userEmail.trim()){
            showModal('warning', 'Campo requerido', 'El email es requerido!');
            return;
        }
        if(!age.trim() || isNaN(age) || parseInt(age) <= 0){
            showModal('warning', 'Campo requerido', 'La edad es requerida y debe ser válida!');
            return;
        }
        if(!zone.trim()){
            showModal('warning', 'Campo requerido', 'La zona es requerida!');
            return;
        }
        if(!photo){
            showModal('warning', 'Campo requerido', 'Debe seleccionar una foto de perfil!');
            return;
        }
        try{// Intenta actualizar los datos del usuario en AsyncStorage
            // Obtener los usuarios almacenados
            const usersRaw = await AsyncStorage.getItem('users');
            let users = usersRaw ? JSON.parse(usersRaw) : [];
            const idx = users.findIndex(u => u.email === userEmail);
            const updatedUser = {
                fullName: userName,
                email: userEmail,
                age,
                zone,
                photo
            };
            if(idx !== -1){// Si el usuario ya existe, actualiza sus datos
                users[idx] = { ...users[idx], ...updatedUser };
            }else{// Si no existe, agrega el nuevo usuario
                users.push(updatedUser);
            }
            await AsyncStorage.setItem('users', JSON.stringify(users));
            showModal('success', 'Éxito', 'Usuario actualizado');
        }catch(error){// Maneja errores al actualizar el usuario
            showModal('error', 'Error', 'Error al actualizar el usuario.');
        }
    };

    const isEditingFromList = route && route.params && route.params.user;// Verifica si se está editando desde la lista de usuarios
    const isAdmin = false; 

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
                <Text style={styles.headerTitle}>Actualizar Usuario</Text>
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
            <View style={ styles.viewContainer }>
                <ScrollView>
                    <KeyboardAvoidingView style={styles.keyboardView}>
                        {isEditingFromList ? null : (
                            <>
                                <MyText text="Buscar usuario a actualizar" style={styles.text}/>
                                <MyInputText
                                    style={styles.inputStyle}
                                    placeholder="Nombre de usuario a buscar"
                                    onChangeText={(text) => setUserNameSearch(text)}
                                />
                                <MySingleButton title="Buscar" customPress={searchUser}/>
                            </>
                        )}
                        <MyInputText
                            style={styles.inputStyle}
                            placeholder="Nuevo nombre de usuario"
                            value={userName}
                            onChangeText={(text) => setUserName(text)}
                        />
                        <MyInputText
                            style={styles.inputStyle}
                            placeholder="Nuevo email"
                            value={userEmail}
                            onChangeText={(text) => setEmail(text)}
                        />
                        <MyInputText
                            style={styles.inputStyle}
                            placeholder="Edad"
                            value={age}
                            keyboardType="numeric"
                            onChangeText={setAge}
                        />
                        <MyInputText
                            style={styles.inputStyle}
                            placeholder="Zona/Barrio"
                            value={zone}
                            onChangeText={setZone}
                        />
                        <ImageSelector imageUri={photo} onSelectImage={setPhoto} />
                        <MySingleButton title="Actualizar" customPress={updateUser}/>
                    </KeyboardAvoidingView>
                </ScrollView>
            </View>
        </SafeAreaView>
    );
};

export default UpdateUser;

const styles = StyleSheet.create({// Estilos para el componente
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
  viewContainer: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  keyboardView: {
    flex: 1,
  },
  text: {
    color: '#111827',
    fontSize: 16,
    marginBottom: 8,
  },
  inputStyle: {
    backgroundColor: '#f9fafb',
    color: '#111827',
    borderRadius: 8,
    paddingHorizontal: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#d1d5db',
  },
});
