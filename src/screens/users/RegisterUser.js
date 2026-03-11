import React, { useState, useEffect } from "react";// Importa React y hooks necesarios
import { StyleSheet, View, SafeAreaView, ScrollView, KeyboardAvoidingView, TouchableOpacity, Text, Image, Platform } from "react-native";// Importa componentes de React Native
import AsyncStorage from '@react-native-async-storage/async-storage';// Importa AsyncStorage para manejar almacenamiento local
import { Ionicons } from '@expo/vector-icons';// Importa iconos de Ionicons
import MyInputText from "../../components/MyInputText";// Importa el componente de entrada de texto personalizado
import MySingleButton from "../../components/MySingleButton";// Importa el componente de botón personalizado
import ImageSelector from "../../components/ImageSelector";// Importa el componente de selector de imagen
import AppModal from '../../components/AppModal';// Importa el componente de modal personalizado

const RegisterUser = ({ navigation, setIsLoggedIn }) => {// Componente principal para el registro de usuario
    // Estados para los datos del formulario
    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [age, setAge] = useState('');
    const [zone, setZone] = useState('');
    const [photo, setPhoto] = useState(null);
    // Estados para modal
    const [modalVisible, setModalVisible] = useState(false);
    const [modalType, setModalType] = useState('info');
    const [modalTitle, setModalTitle] = useState('');
    const [modalMessage, setModalMessage] = useState('');
    const [modalCallback, setModalCallback] = useState(null);
    // Estados para avatar
    const [userPhoto, setUserPhoto] = useState(null);
    const [userInitial, setUserInitial] = useState('U');
    const isAdmin = email === "admin@admin.com";

    // Limpia los datos del formulario
    const clearData = () => {
        setFullName("");
        setEmail("");
        setAge("");
        setZone("");
        setPhoto(null);
        setPassword("");
    };

    // Muestra el modal
    const showModal = (type, title, message, callback) => {
        setModalType(type);
        setModalTitle(title);
        setModalMessage(message);
        setModalVisible(true);
        setModalCallback(() => callback || null);
    };

    // Cierra el modal y ejecuta callback si existe
    const handleModalClose = () => {
        setModalVisible(false);
        if (modalCallback) {
            modalCallback();
            setModalCallback(null);
        }
    };

    // Lógica de registro
    const registerUser = async () => {
        if (!fullName.trim()) {
            showModal('warning', 'Campo requerido', 'Ingrese su nombre completo');
            return;
        }
        if (!email.trim() || email.indexOf("@") === -1) {
            showModal('warning', 'Campo requerido', 'Ingrese un correo electrónico válido');
            return;
        }
        if (!age.trim() || isNaN(age) || parseInt(age) <= 0) {
            showModal('warning', 'Campo requerido', 'Ingrese una edad válida');
            return;
        }
        if (!zone.trim()) {
            showModal('warning', 'Campo requerido', 'Ingrese su barrio o zona de residencia');
            return;
        }
        if (!photo) {
            showModal('warning', 'Campo requerido', 'Debe seleccionar una foto de perfil');
            return;
        }
        try {// Intenta registrar al usuario
            const newUser = {
                fullName,
                email,
                password,
                age,
                zone,
                photo,
            };
            const storedUsers = await AsyncStorage.getItem("users");
            const users = storedUsers ? JSON.parse(storedUsers) : [];
            users.push(newUser);
            await AsyncStorage.setItem("users", JSON.stringify(users));
            clearData();
            showModal('success', 'Éxito', 'Usuario registrado!!!', () => navigation.navigate("Home"));
        } catch (error) {// Si ocurre un error al registrar el usuario
            showModal('error', 'Error', 'Error al registrar usuario.');
        }
    };

    useEffect(() => {// Efecto para verificar si el usuario ya está logueado
        const checkLogin = async () => {// Intenta obtener los datos del usuario logueado
            const user = await AsyncStorage.getItem('user');
            if (user) {// Si hay un usuario logueado
                const userObj = JSON.parse(user);
                setIsLoggedIn(true);
                setUserPhoto(userObj.photo || userObj.imageUri || null);
                if (userObj.fullName) setUserInitial(userObj.fullName[0].toUpperCase());// Usa la primera letra del nombre completo
                else if (userObj.userName) setUserInitial(userObj.userName[0].toUpperCase());// Usa la primera letra del nombre de usuario
                else if (userObj.email) setUserInitial(userObj.email[0].toUpperCase());// Usa la primera letra del email
                else setUserInitial('U');// Si no hay datos, usa 'U' como inicial
            } else {// Si no hay usuario logueado
                setIsLoggedIn(false);
                setUserPhoto(null);
                setUserInitial('U');
            }
        };
        checkLogin();
    }, []);

    return (// Renderiza la pantalla de registro de usuario
        <SafeAreaView style={styles.safeArea}>
            <KeyboardAvoidingView
                style={{ flex: 1 }}
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            >
                <ScrollView contentContainerStyle={styles.scrollContainer} keyboardShouldPersistTaps="handled">
                    <AppModal
                        visible={modalVisible}
                        type={modalType}
                        title={modalTitle}
                        message={modalMessage}
                        onClose={handleModalClose}
                    />
                    <View style={styles.logoContainer}>
                        <Text style={styles.logoText}>Eco-Challenge</Text>
                    </View>
                    <View style={styles.registerCard}>
                        <Text style={styles.title}>Registro de Usuario</Text>
                        <ImageSelector imageUri={photo} onSelectImage={setPhoto} />
                        <MyInputText
                            placeholder="Nombre Completo"
                            onChangeText={setFullName}
                            style={styles.input}
                            value={fullName}
                        />
                        <MyInputText
                            placeholder="Correo Electrónico"
                            keyboardType="email-address"
                            onChangeText={setEmail}
                            style={styles.input}
                            value={email}
                        />
                        <MyInputText
                            placeholder="Contraseña"
                            onChangeText={setPassword}
                            value={password}
                            style={styles.input}
                            secureTextEntry
                        />
                        <MyInputText
                            placeholder="Edad"
                            keyboardType="numeric"
                            onChangeText={setAge}
                            style={styles.input}
                            value={age}
                        />
                        <MyInputText
                            placeholder="Barrio o Zona de Residencia"
                            onChangeText={setZone}
                            style={styles.input}
                            value={zone}
                        />
                        <MySingleButton
                            title="Registrar Usuario"
                            customPress={registerUser}
                            style={styles.button}
                            btnColor="#22c55e"
                        />
                        <TouchableOpacity onPress={() => navigation.navigate('LoginScreen')} style={styles.linkContainer}>
                            <Text style={styles.linkText}>¿Ya tienes cuenta? <Text style={styles.linkTextBold}>Inicia sesión</Text></Text>
                        </TouchableOpacity>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({// Estilos para la pantalla de registro de usuario
    safeArea: {
        flex: 1,
        backgroundColor: '#f8fafc',
    },
    scrollContainer: {
        flexGrow: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 24,
        backgroundColor: '#f8fafc',
    },
    logoContainer: {
        marginBottom: 18,
        alignItems: 'center',
    },
    logoText: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#22c55e',
        letterSpacing: 2,
        marginBottom: 2,
        textShadowColor: '#d1fae5',
        textShadowOffset: { width: 0, height: 2 },
        textShadowRadius: 6,
    },
    registerCard: {
        backgroundColor: '#fff',
        borderRadius: 18,
        padding: 28,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOpacity: 0.10,
        shadowRadius: 10,
        elevation: 8,
        width: '100%',
        maxWidth: 400,
    },
    title: {
        fontSize: 26,
        fontWeight: 'bold',
        color: '#22c55e',
        marginBottom: 18,
        textAlign: 'center',
        letterSpacing: 1,
    },
    input: {
        borderWidth: 1,
        borderColor: '#d1d5db',
        padding: 14,
        marginVertical: 10,
        borderRadius: 8,
        backgroundColor: '#f9fafb',
        color: '#111827',
        fontSize: 16,
        width: 260,
        shadowColor: '#22c55e',
        shadowOpacity: 0.04,
        shadowRadius: 2,
        elevation: 1,
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
        width: 200,
    },
    linkContainer: {
        marginTop: 8,
    },
    linkText: {
        color: '#64748b',
        fontSize: 15,
        textAlign: 'center',
    },
    linkTextBold: {
        color: '#22c55e',
        fontWeight: 'bold',
    },
});

export default RegisterUser;