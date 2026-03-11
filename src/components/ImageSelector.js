import React from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';// Importa los componentes necesarios de React Native
import * as ImagePicker from 'expo-image-picker'; // Importa el paquete de ImagePicker de Expo

export default function ImageSelector({ imageUri, onSelectImage }) {

    const selectImage = async () => { // Función para seleccionar una imagen


        let result = await ImagePicker.launchImageLibraryAsync({// Solicita permisos para acceder a la galería de imágenes
            mediaTypes: ImagePicker.MediaTypeOptions.Images,// Permite seleccionar solo imágenes
            allowsEditing: true, // Permite editar la imagen seleccionada
            quality: 1, // Calidad de la imagen seleccionada (1 es la mejor calidad)
        });

        // Si el usuario no cancela la selección y hay imágenes seleccionadas
        if (!result.canceled && result.assets && result.assets.length > 0) {
            onSelectImage(result.assets[0].uri);// Llama a la función onSelectImage con la URI de la imagen seleccionada
        }
    };

    return (// Componente que muestra un botón para seleccionar una imagen y la imagen seleccionada
        <View style={{ alignItems: 'center', marginVertical: 10 }}>
            <TouchableOpacity onPress={selectImage}>
                <Text style={{ color: 'blue' }}>Seleccionar Imagen</Text>
            </TouchableOpacity>
            {imageUri && <Image source={{ uri: imageUri }} style={{ width: 100, height: 100, borderRadius: 50, marginTop: 10 }} />}
        </View>
    );
}
