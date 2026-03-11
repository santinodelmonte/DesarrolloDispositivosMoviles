import React, { useState, useEffect } from "react"; // Importa React y hooks necesarios
import { StyleSheet, View, SafeAreaView, ScrollView, Text, Image } from "react-native"; // Importa componentes de React Native
import AsyncStorage from "@react-native-async-storage/async-storage"; // Importa AsyncStorage para manejar almacenamiento local
import { Ionicons } from '@expo/vector-icons';// Importa iconos de Ionicons
import MyButton from "../../components/MyButton";// Importa el componente de botón personalizado

const UsersScreen = ({ navigation, setIsLoggedIn, userEmail, userImage }) => { // Componente principal de la pantalla de usuarios
    // Estados para manejar la foto del usuario, iniciales y si es admin
    const [userPhoto, setUserPhoto] = useState(null);
    const [userInitial, setUserInitial] = useState('U');
    const isAdmin = userEmail === "admin@admin.com"; 

    useEffect(() => {// Carga la foto y la inicial del usuario logueado al montar
        const fetchUserPhoto = async () => {// Intenta obtener la foto del usuario desde AsyncStorage
            try {
                const userRaw = await AsyncStorage.getItem('user');
                if (userRaw) {// Si hay datos del usuario, los parsea
                    const user = JSON.parse(userRaw);
                    setUserPhoto(user.photo || user.imageUri || null);
                    if (user.fullName) setUserInitial(user.fullName[0].toUpperCase());//    Usa la primera letra del nombre completo
                    else if (user.userName) setUserInitial(user.userName[0].toUpperCase());// Usa la primera letra del nombre de usuario
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
    }, []);

    return (// Renderiza la pantalla de usuarios
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Usuarios</Text>
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
            <View style={styles.contentContainer}>
                <View style={styles.card}>
                    <ScrollView contentContainerStyle={{ paddingBottom: 10 }}>
                        <MyButton
                            title="Registro de Usuarios"
                            btnColor="#22c55e"
                            btnIcon="user-plus"
                            customPress={() => navigation.navigate("RegisterUser")}
                            style={styles.button}
                        />
                        <MyButton
                            title="Ver Todos los Usuarios"
                            btnColor="#0ea5e9"
                            btnIcon="users"
                            customPress={() => navigation.navigate("ViewAllUsers")}
                            style={styles.button}
                        />
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
        paddingHorizontal: 18,
        paddingTop: 36,
        paddingBottom: 18,
        backgroundColor: '#fff',
        borderBottomWidth: 0,
        shadowColor: '#000',
        shadowOpacity: 0.10,
        shadowRadius: 8,
        elevation: 8,
    },
    headerTitle: {
        color: '#22c55e',
        fontSize: 20,
        fontWeight: 'bold',
        letterSpacing: 1,
    },
    contentContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 8,
        paddingTop: 12,
    },
    card: {
        backgroundColor: '#fff',
        borderRadius: 18,
        padding: 20,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOpacity: 0.10,
        shadowRadius: 10,
        elevation: 8,
        width: '100%',
        maxWidth: 500,
        marginHorizontal: 8,
    },
    button: {
        marginTop: 10,
        width: '100%',
        borderRadius: 14,
        shadowColor: '#000',
        shadowOpacity: 0.10,
        shadowRadius: 8,
        elevation: 6,
        alignSelf: 'center',
    },
});

export default UsersScreen;
