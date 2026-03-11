import React, { useState } from "react";// Importa React y useState para manejar el estado
import { View, StyleSheet, ScrollView, SafeAreaView, TouchableOpacity } from "react-native"; // Importa los componentes necesarios de React Native
import AsyncStorage from "@react-native-async-storage/async-storage";// Importa AsyncStorage para manejar el almacenamiento local
import { Ionicons } from '@expo/vector-icons';// Importa iconos de Ionicons
import MyInputText from "../../components/MyInputText";// Importa el componente de entrada de texto personalizado
import MySingleButton from "../../components/MySingleButton";// Importa el componente de botón personalizado
import AppModal from '../../components/AppModal';// Importa el componente de modal personalizado

const DeleteMaterial = ({ navigation }) => {// Componente para eliminar un material
  // Estados para manejar el ID del material, visibilidad del modal y sus propiedades
  const [id, setId] = useState("");
  const [modalVisible, setModalVisible] = useState(false);
  const [modalType, setModalType] = useState('info');
  const [modalTitle, setModalTitle] = useState('');
  const [modalMessage, setModalMessage] = useState('');

  const showModal = (type, title, message) => { // Función para mostrar el modal con tipo, título y mensaje
    setModalType(type);
    setModalTitle(title);
    setModalMessage(message);
    setModalVisible(true);
  };

  const handleModalClose = () => setModalVisible(false); // Cierra el modal

  const deleteMaterial = async () => {// Elimina un material por su ID
    try {// Obtiene los materiales almacenados
      const stored = await AsyncStorage.getItem("MATERIALES");
      const parsed = stored ? JSON.parse(stored) : [];
      const updated = parsed.filter((m) => m.id !== id);
      await AsyncStorage.setItem("MATERIALES", JSON.stringify(updated));
      showModal('success', 'Eliminado', 'Material eliminado si existía.');
      navigation.goBack();
    } catch (error) {// Maneja errores al intentar eliminar
      showModal('error', 'Error', 'Error al intentar eliminar.');
    }
  };

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
        <View style={{ flex: 1 }} />
      </View>
      <ScrollView>
        <MyInputText
          placeholder="ID del material a eliminar"
          onChangeText={setId}
        />
        <MySingleButton title="Eliminar" onPress={deleteMaterial} />
      </ScrollView>
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
  button: {
    backgroundColor: '#ef4444',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 8,
    shadowColor: '#ef4444',
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

export default DeleteMaterial;