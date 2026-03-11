import React, { useState, useEffect } from "react";// Importa React y hooks necesarios
import { StyleSheet, View, SafeAreaView, KeyboardAvoidingView, ScrollView, Text, Image } from "react-native";// Importa componentes de React Native
import AsyncStorage from '@react-native-async-storage/async-storage';// Importa AsyncStorage para manejar almacenamiento local
import { Ionicons } from '@expo/vector-icons';// Importa iconos de Ionicons
import MyText from "../../components/MyText";// Importa el componente de texto personalizado
import MySingleButton from "../../components/MySingleButton";// Importa el componente de botón personalizado
import MyInputText from "../../components/MyInputText";// Importa el componente de entrada de texto personalizado
import AppModal from '../../components/AppModal';// Importa el componente de modal personalizado

const ViewUser = ({ navigation, setIsLoggedIn, route }) => { // Componente principal para ver los detalles de un usuario
    // Estados para manejar el nombre de usuario, datos del usuario, visibilidad del modal,
    const [userName, setUserName] = useState("");
    const [userData, setUserData] = useState(null); 
    const [modalVisible, setModalVisible] = useState(false); 
    const [modalType, setModalType] = useState('info'); 
    const [modalTitle, setModalTitle] = useState(''); 
    const [modalMessage, setModalMessage] = useState(''); 
    const [userPhoto, setUserPhoto] = useState(null); 
    const [userInitial, setUserInitial] = useState('U'); 


    useEffect(() => { // Carga datos del usuario y su foto al montar o cambiar la ruta
        if (route && route.params && route.params.user) {
            setUserData(route.params.user);
            setUserName(route.params.user.fullName || route.params.user.userName || '');
        }
        const fetchUserPhoto = async () => {// Intenta obtener la foto del usuario desde AsyncStorage
            try {
                const userRaw = await AsyncStorage.getItem('user');
                if (userRaw) {// Si hay datos del usuario, los parsea
                    const user = JSON.parse(userRaw);
                    setUserPhoto(user.photo || user.imageUri || null);
                    if (user.fullName) setUserInitial(user.fullName[0].toUpperCase());// Usa la primera letra del nombre completo
                    else if (user.userName) setUserInitial(user.userName[0].toUpperCase());//  Usa la primera letra del nombre de usuario
                    else if (user.email) setUserInitial(user.email[0].toUpperCase());// Usa la primera letra del email
                    else setUserInitial('U');// Si no hay datos, usa 'U' como inicial
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
    const showModal = (type, title, message) => { // Función para mostrar el modal con tipo, título y mensaje
        setModalType(type);
        setModalTitle(title);
        setModalMessage(message);
        setModalVisible(true);
    };

    // Cierra el modal
    const handleModalClose = () => setModalVisible(false); // Función para cerrar el modal

    const getUserData = async () => {// Función para buscar los datos del usuario por nombre
        setUserData(null);
        if(!userName.trim()){// Verifica si el nombre de usuario está vacío
            showModal('warning', 'Campo requerido', 'El nombre de usuario es requerido!');
            return;
        }
        try{// Intenta obtener los datos del usuario desde AsyncStorage
            const user = await AsyncStorage.getItem(userName);
            if(user){// Si se encuentra el usuario, lo parsea y establece en el estado
                setUserData(JSON.parse(user));
            }else{// Si no se encuentra el usuario, muestra un modal de error
                showModal('error', 'No encontrado', 'El usuario no existe');
            }
        }catch(error){// Si ocurre un error al buscar el usuario
            showModal('error', 'Error', 'Error al buscar usuario');
        }
    };

    // Determina si el usuario es admin
    const isAdmin = userData && userData.role === 'admin';

    return(// Renderiza la vista del usuario
        <SafeAreaView style={styles.container}>
            <AppModal
                visible={modalVisible}
                type={modalType}
                title={modalTitle}
                message={modalMessage}
                onClose={handleModalClose}
            />
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Ver Usuario</Text>
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
            <View style={styles.viewContainer}>
                <View style={styles.generalView}>
                    <ScrollView>
                        <KeyboardAvoidingView style={styles.keyboardView}>
                            {userData ? (
                                <>
                                    <MyText text={`Nombre: ${userData.fullName || userData.userName || ''}`} style={styles.presenterText} />
                                    <MyText text={`Email: ${userData.email || ''}`} style={styles.presenterText} />
                                    <MyText text={`Edad: ${userData.age || ''}`} style={styles.presenterText} />
                                    <MyText text={`Zona: ${userData.zone || ''}`} style={styles.presenterText} />
                                </>
                            ) : (
                                <>
                                    <MyText text="Filtro de usuario" style={styles.text}/>
                                    <MyInputText
                                        style={styles.inputStyle}
                                        placeholder="Nombre de usuario a buscar"
                                        onChangeText={(text) => setUserName(text)}
                                    />
                                    <MySingleButton title="Buscar" customPress={getUserData}/>
                                </>
                            )}
                        </KeyboardAvoidingView>
                    </ScrollView>
                </View>
            </View>
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
        color: '#22c55e',
        fontSize: 22,
        fontWeight: 'bold',
        letterSpacing: 1,
    },
    viewContainer: {
        flex: 1,
        backgroundColor: 'transparent',
    },
    generalView: {
        flex: 1,
        margin: 16,
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 16,
        shadowColor: '#000',
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 4,
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
    presenterView: {
        marginTop: 16,
    },
    presenterText: {
        color: '#374151',
        fontSize: 16,
        marginBottom: 4,
    },
});

export default ViewUser;

