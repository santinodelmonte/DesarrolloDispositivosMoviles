import React from 'react';
import { Text, StyleSheet } from 'react-native'; //Importa los componentes necesarios de React Native

const MyText = (props) => { // Componente de texto personalizado
    return <Text style={[styles.text, props.style, props.color ? { color: props.color } : {}]}>{props.text}</Text>
}

export default MyText;

const styles = StyleSheet.create({ // Estilos para el componente MyText
    text: {
        color: '#1e293b',
        fontSize: 16,
        fontWeight: '500',
        letterSpacing: 0.2,
    },
});