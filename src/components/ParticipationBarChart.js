import React, { useState } from 'react';
import { View, Dimensions, StyleSheet, Text } from 'react-native'; // Importa los componentes necesarios de React Native
import { BarChart } from 'react-native-chart-kit'; // Importa el gráfico de barras de react-native-chart-kit

const screenWidth = Dimensions.get('window').width; // Obtiene el ancho de la pantalla del dispositivo

const SimpleParticipationStats = ({ data, labels, intervalType }) => { // Componente para mostrar estadísticas de participación en un gráfico de barras
  
    return ( // Componente que renderiza un gráfico de barras con las estadísticas de participación
    <View style={{ alignItems: 'center', marginVertical: 8 }}>
      <Text style={styles.title}>Estadísticas de participación por {intervalType === 'week' ? 'semana' : 'mes'}</Text>
      <BarChart
        data={{
          labels: labels,
          datasets: [
            {
              data: data,
            },
          ],
        }}
        width={screenWidth - 48}
        height={180}
        yAxisLabel={''}
        chartConfig={{
          backgroundColor: '#fff',
          backgroundGradientFrom: '#f8fafc',
          backgroundGradientTo: '#f8fafc',
          decimalPlaces: 0,
          color: (opacity = 1) => `rgba(34, 197, 94, ${opacity})`,
          labelColor: (opacity = 1) => `rgba(34, 34, 34, ${opacity})`,
          style: { borderRadius: 16 },
          propsForBackgroundLines: { stroke: '#e5e7eb' },
        }}
        style={{ borderRadius: 12 }}
        fromZero
        showValuesOnTopOfBars
        verticalLabelRotation={labels.length > 4 ? 20 : 0}
      />
    </View>
  );
};

const styles = StyleSheet.create({ // Estilos para el componente SimpleParticipationStats
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#22c55e',
    marginBottom: 8,
    alignSelf: 'center',
  },
});

export default SimpleParticipationStats;
