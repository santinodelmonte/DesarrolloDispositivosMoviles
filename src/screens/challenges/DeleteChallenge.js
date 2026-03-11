import React, { useState } from 'react'; // Importa React y useState
import { View, Text, StyleSheet, SafeAreaView } from 'react-native'; // Importa los componentes necesarios de React Native
import AsyncStorage from '@react-native-async-storage/async-storage'; // Importa AsyncStorage para manejar el almacenamiento local
import AppModal from '../../components/AppModal'; // Importa el componente AppModal para mostrar diálogos modales

const DeleteChallenge = ({ route, navigation }) => { // Componente para eliminar un reto


  const { challenge } = route.params; // Obtiene el reto a eliminar desde los parámetros de la ruta
  const [modalVisible, setModalVisible] = useState(false);// Estado para controlar la visibilidad del modal de confirmación
  const [deleting, setDeleting] = useState(false); // Estado para controlar si se está eliminando el reto

  const handleDelete = async () => { // Función para manejar la eliminación del reto
    setDeleting(true);
    const stored = await AsyncStorage.getItem('challenges'); // Obtiene los retos almacenados en AsyncStorage
    let challenges = stored ? JSON.parse(stored) : [];
    challenges = challenges.filter(c => c.id !== challenge.id);
    await AsyncStorage.setItem('challenges', JSON.stringify(challenges));  // Actualiza el almacenamiento local con los retos restantes
    setDeleting(false);
    navigation.goBack();
  };

  return ( // Renderiza la vista principal del componente
    <SafeAreaView style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>¿Eliminar reto?</Text>
        <Text style={styles.text}>Esta acción no se puede deshacer.</Text>
        <AppModal
          visible={modalVisible}
          type="warning"
          title="Confirmar eliminación"
          message="¿Estás seguro de que deseas eliminar este reto? Esta acción no se puede deshacer."
          confirmText={deleting ? "Eliminando..." : "Eliminar"}
          onClose={() => {
            setModalVisible(false);
            if (!deleting) handleDelete();
          }}
          blockBackdrop={true}
        />
        <View style={{ flexDirection: 'row', gap: 12 }}>
          <Text
            style={{ color: '#ef4444', fontWeight: 'bold', fontSize: 16, marginRight: 24 }}
            onPress={() => setModalVisible(true)}
          >
            Eliminar
          </Text>
          <Text
            style={{ color: '#222', fontWeight: 'bold', fontSize: 16 }}
            onPress={() => navigation.goBack()}
          >
            Cancelar
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({ // Estilos para el componente DeleteChallenge
  container: { flex: 1, backgroundColor: '#f8fafc', justifyContent: 'center', alignItems: 'center' },
  card: { backgroundColor: '#fff', borderRadius: 12, padding: 24, alignItems: 'center', elevation: 2 },
  title: { fontSize: 20, fontWeight: 'bold', color: '#ef4444', marginBottom: 12 },
  text: { fontSize: 16, color: '#222', marginBottom: 16 },
});

export default DeleteChallenge;
