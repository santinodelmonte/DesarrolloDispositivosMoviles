import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native"; // Importa los componentes necesarios de React Native

const MySingleButton = (props) => { // Componente de botón personalizado
    
    return (// Renderiza un botón táctil con estilos personalizados
        <TouchableOpacity
            style={[styles.button, props.style, props.btnColor ? { backgroundColor: props.btnColor } : {}]}
            onPress={props.customPress}
            activeOpacity={0.85}
        >
            <View>
                <Text style={styles.text}>{props.title}</Text>
            </View>
        </TouchableOpacity>
    );
};

export default MySingleButton;

const styles = StyleSheet.create({ // Estilos para el botón personalizado
    button: {
        alignContent: 'center',
        backgroundColor: '#2563eb',
        color: '#fff',
        paddingVertical: 14,
        paddingHorizontal: 18,
        marginVertical: 10,
        marginHorizontal: 24,
        borderRadius: 14,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOpacity: 0.10,
        shadowRadius: 8,
        elevation: 6,
        minHeight: 48,
    },
    text: {
        color: '#fff',
        fontSize: 17,
        fontWeight: 'bold',
        letterSpacing: 0.5,
    },
});

