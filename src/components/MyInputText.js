import React from "react";
import { StyleSheet, TextInput, View } from "react-native"; // Importa los componentes necesarios de React Native

const MyInputText = (props) => { // Componente de entrada de texto personalizado
    
    return (// Renderiza un campo de entrada de texto con estilos personalizados
        <View style={[styles.container, props.style]}>
            <TextInput
                underlineColorAndroid="transparent"
                maxLength={props.maxLength}
                minLength={props.minLength}
                onChangeText={props.onChangeText}
                placeholder={props.placeholder}
                placeholderTextColor="#94a3b8"
                keyboardType={props.keyboardType}
                secureTextEntry={props.secureTextEntry}
                returnKeyType={props.returnKeyType}
                numberOfLines={props.numberOfLines}
                multiline={props.multiline}
                onSubmitEditing={props.onSubmitEditing}
                style={styles.input}
                blurOnSubmit={false}
                value={props.value}
                defaultValue={props.defaultValue}
            />
        </View>
    );
};

export default MyInputText;

const styles = StyleSheet.create({// Estilos para el componente MyInputText
    container: {
        marginHorizontal: 24,
        marginVertical: 8,
        borderRadius: 12,
        backgroundColor: '#f1f5f9',
        shadowColor: '#000',
        shadowOpacity: 0.07,
        shadowRadius: 6,
        elevation: 3,
    },
    input: {
        fontSize: 16,
        color: '#222',
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderRadius: 12,
        backgroundColor: 'transparent',
    },
});