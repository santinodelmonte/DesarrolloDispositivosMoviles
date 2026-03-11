import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Modal from 'react-native-modal'; // Modal animado y personalizable
import { Ionicons } from '@expo/vector-icons'; // Íconos para los diferentes tipos de mensaje

// Diccionario de íconos y colores según el tipo de mensaje
const ICONS = {
  success: { name: 'checkmark-circle', color: '#22c55e' }, 
  error: { name: 'close-circle', color: '#ef4444' },  
  warning: { name: 'warning', color: '#f59e42' }, 
  info: { name: 'information-circle', color: '#3b82f6' },
};

// Componente AppModal
const AppModal = ({ visible, type = 'info', title, message, onClose, confirmText = 'OK', blockBackdrop = false }) => {
  // Selecciona el ícono y color según el tipo
  const icon = ICONS[type] || ICONS.info;
  return (
    <Modal
      isVisible={visible} 
      backdropOpacity={0.4}
      onBackdropPress={blockBackdrop ? undefined : onClose} 
    >
      <View style={styles.modalContent}>
        <View style={[styles.iconCircle, { backgroundColor: icon.color + '22', shadowColor: icon.color }]}>
          <Ionicons name={icon.name} size={64} color={icon.color} style={styles.icon} />
        </View>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.message}>{message}</Text>
        <TouchableOpacity style={[styles.button, { backgroundColor: icon.color }]} onPress={onClose}>
          <Text style={styles.buttonText}>{confirmText}</Text>
        </TouchableOpacity>
      </View>
    </Modal>
  );
};

// Estilos del modal y sus elementos
const styles = StyleSheet.create({
  modalContent: {
    backgroundColor: '#fff', 
    borderRadius: 18,
    padding: 28, 
    alignItems: 'center', 
    shadowColor: '#000',
    shadowOpacity: 0.10,
    shadowRadius: 10,
    elevation: 8,
  },
  iconCircle: {
    width: 90,
    height: 90,
    borderRadius: 45,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    shadowOpacity: 0.25,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 10,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#222',
    marginBottom: 8,
    textAlign: 'center',
  },
  message: {
    fontSize: 16,
    color: '#444',
    marginBottom: 18,
    textAlign: 'center',
  },
  button: {
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 32,
    marginTop: 6,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
    textAlign: 'center',
  },
});

export default AppModal;
