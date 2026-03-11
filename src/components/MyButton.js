import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'; // Importa los componentes necesarios de React Native
import FontAwesome6 from 'react-native-vector-icons/FontAwesome6';// Importa los íconos de FontAwesome6
import { MaterialCommunityIcons } from '@expo/vector-icons'; // Importa los íconos de MaterialCommunityIcons

const MyButton = (props) => { // Componente de botón personalizado

    const IconComponent = props.iconLibrary === "Material" ? MaterialCommunityIcons : FontAwesome6; // Selecciona el componente de ícono según la biblioteca especificada
    
    return ( // Renderiza un botón táctil con estilos personalizados
        <TouchableOpacity
            style={[
                styles.button,
                { backgroundColor: props.btnColor || '#22c55e' },
                props.style
            ]}
            onPress={props.customPress}
            activeOpacity={0.85}
        >
            <View style={styles.view}>
                <IconComponent
                    style={styles.icon}
                    name={props.btnIcon}
                    size={28}
                    color="#fff"
                />
                <Text style={styles.text}>{props.title}</Text>
            </View>
        </TouchableOpacity>
    );
};

export default MyButton;

const styles = StyleSheet.create({ // Estilos para el botón personalizado
    view: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    button: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 14,
        paddingHorizontal: 18,
        marginVertical: 10,
        marginHorizontal: 24,
        borderRadius: 14,
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
        marginLeft: 12,
        letterSpacing: 0.5,
    },
    icon: {
        marginRight: 6,
    },
});