import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, SafeAreaView, ScrollView } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import ParticipationBarChart from '../../components/ParticipationBarChart';

const UserPanel = ({ navigation, setIsLoggedIn }) => {// Componente principal del panel de usuario

    // Estados para manejar el usuario, foto, iniciales, participaciones, puntos totales y retos completados
  const [user, setUser] = useState(null); 
  const [userInitial, setUserInitial] = useState('U'); // 
  const [userPhoto, setUserPhoto] = useState(null); 
  const [participations, setParticipations] = useState([]); 
  const [totalPoints, setTotalPoints] = useState(0); 
  const [completedChallenges, setCompletedChallenges] = useState(0); 

// Estados para manejar el intervalo de estadísticas y las estadísticas semanales

  const [weeklyStats, setWeeklyStats] = useState([]); 
  const [weeklyLabels, setWeeklyLabels] = useState([]); 

  useEffect(() => {// Efecto para cargar el usuario y las estadísticas al montar el componente
    const fetchUser = async () => {// Intenta obtener la información del usuario desde AsyncStorage
      const userRaw = await AsyncStorage.getItem('user');
      if (userRaw) {// Si hay datos del usuario, los parsea
        const userObj = JSON.parse(userRaw);
        setUser(userObj);
        setUserPhoto(userObj.photo || userObj.imageUri || null);
        if (userObj.fullName) setUserInitial(userObj.fullName[0].toUpperCase());// Usa la primera letra del nombre completo
        else if (userObj.userName) setUserInitial(userObj.userName[0].toUpperCase());// Usa la primera letra del nombre de usuario
        else if (userObj.email) setUserInitial(userObj.email[0].toUpperCase());// Usa la primera letra del email
        else setUserInitial('U');// Si no hay datos, usa 'U' como inicial
      }
    };
    fetchUser();
    const fetchStats = async () => {// Función para cargar las estadísticas del usuario
      const userRaw = await AsyncStorage.getItem('user');
      if (!userRaw) return;// Si no hay datos del usuario, no hace nada
      const userObj = JSON.parse(userRaw);
      const participationsRaw = await AsyncStorage.getItem('participations');
      const participationsList = participationsRaw ? JSON.parse(participationsRaw) : [];
      const myParticipations = participationsList.filter(p => p.userEmail === userObj.email);
      setParticipations(myParticipations);

      // Total puntos acumulados y retos completados
      let points = 0;
      let completed = 0;
      myParticipations.forEach(p => {// Recorre las participaciones del usuario
        if (typeof p.assignedPoints === 'number') points += p.assignedPoints;// Suma los puntos asignados
        if (p.status === 'Completado' || p.status === 'completado') completed++;// Cuenta los retos completados
      });
      setTotalPoints(points);
      setCompletedChallenges(completed);
      if (myParticipations.length === 0) {// Si no hay participaciones, no hay estadísticas
        setWeeklyStats([]);
        setWeeklyLabels([]);
        return;
      }
      // Calcular fecha de la primera participación
      const dates = myParticipations.map(p => new Date(p.date)).filter(Boolean);
      const firstDate = new Date(Math.min(...dates));
      const now = new Date();

      // Estadísticas por semana
      const weeks = [];
      const weekLabels = [];
      let current = new Date(firstDate);
      current.setHours(0,0,0,0);
      while (current <= now) {// Recorre cada semana desde la primera participación hasta ahora
        const weekStart = new Date(current);
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekStart.getDate() + 6);
        weekEnd.setHours(23,59,59,999);
        weekLabels.push(`${weekStart.getDate()}/${weekStart.getMonth()+1}`);// Etiqueta de la semana (día/mes)
        weeks.push(myParticipations.filter(p => {
          if (!p.date) return false;// Verifica si la fecha existe
          const d = new Date(p.date);
          return d >= weekStart && d <= weekEnd;// Filtra las participaciones de la semana
        }).length);
        current.setDate(current.getDate() + 7);
      }
      setWeeklyStats(weeks);
      setWeeklyLabels(weekLabels);
    };
    fetchStats();
  }, []);

  const getLevel = (points) => {// Función para determinar el nivel del usuario según los puntos acumulados
    const levelNum = Math.floor(points / 10) + 1;
    let color = '#a3e635';
    if (levelNum >= 5 && levelNum < 10) color = '#4ade80'; // Color para niveles 5-9
    else if (levelNum >= 10 && levelNum < 20) color = '#22d3ee'; // Color para niveles 10-19
    else if (levelNum >= 20 && levelNum < 50) color = '#38bdf8'; // Color para niveles 20-49
    else if (levelNum >= 50) color = '#a78bfa'; // Color para niveles 50 y superiores
    return { level: `Nivel ${levelNum}`, color, levelNum }; // Devuelve el nivel, color y número de nivel
  }; // Niveles según puntos (cada 10 puntos)
  const userLevel = getLevel(totalPoints);
  const nextLevelPoints = userLevel.levelNum * 10;
  const pointsToNext = nextLevelPoints - totalPoints;
  const nextLevelName = `Nivel ${userLevel.levelNum + 1}`;

  const handleLogout = async () => { // Función para manejar el cierre de sesión
    await AsyncStorage.removeItem('user');
    if (setIsLoggedIn) setIsLoggedIn(false);
  };

  if (!user) return null; // Si no hay usuario, no renderiza nada

  return ( // Renderiza el panel de usuario
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={{paddingBottom: 32}}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Panel de Usuario</Text>
          <View style={{flexDirection:'row', alignItems:'center'}}>
            {user.isAdmin ? (
              <Ionicons name="person-circle" size={40} color="#22c55e" style={{marginRight: 12}} accessibilityLabel="Administrador" />
            ) : userPhoto ? (
              <Image source={{ uri: userPhoto }} style={styles.avatar} accessibilityLabel="Foto de perfil" onError={() => setImageError(true)} />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <Text style={{color:'#22c55e', fontWeight:'bold', fontSize:18}}>{userInitial}</Text>
              </View>
            )}
            <TouchableOpacity style={styles.logoutButton} onPress={handleLogout} accessibilityLabel="Cerrar sesión">
              <Text style={styles.logoutText}>Cerrar Sesión</Text>
            </TouchableOpacity>
          </View>
        </View>
        <View style={styles.card}>
          <Text style={styles.label}>Nombre:</Text>
          <Text style={styles.value}>{user.fullName || user.userName || '-'}</Text>
          <Text style={styles.label}>Email:</Text>
          <Text style={styles.value}>{user.email}</Text>
          {user.age && <><Text style={styles.label}>Edad:</Text><Text style={styles.value}>{user.age}</Text></>}
          {user.zone && <><Text style={styles.label}>Zona:</Text><Text style={styles.value}>{user.zone}</Text></>}
          <Text style={styles.label}>Puntos acumulados:</Text>
          <Text style={styles.value}>{totalPoints}</Text>
          <Text style={styles.label}>Retos completados:</Text>
          <Text style={styles.value}>{completedChallenges}</Text>
          <View style={{marginTop: 12, marginBottom: 4, borderTopWidth: 1, borderTopColor: '#e5e7eb', paddingTop: 10}}>
            <Text style={styles.label}>Nivel actual:</Text>
            <Text style={[styles.value, { color: userLevel.color, fontWeight: 'bold', fontSize: 18 }]}>{userLevel.level}</Text>
            <Text style={styles.label}>Próximo nivel:</Text>
            <Text style={styles.value}>{nextLevelName} ({nextLevelPoints} puntos)</Text>
            <Text style={styles.label}>Puntos para el siguiente nivel:</Text>
            <Text style={styles.value}>{pointsToNext > 0 ? pointsToNext : 0}</Text>
          </View>
        </View>
        <View style={styles.card}>
          <Text style={styles.label}>Participación por semana:</Text>
          <ParticipationBarChart
            data={weeklyStats}
            labels={weeklyLabels}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({ // Estilos para el panel de usuario
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
  headerTitle: {
    color: '#22c55e',
    fontSize: 22,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
    borderWidth: 2,
    borderColor: '#22c55e',
    backgroundColor: '#e5e7eb',
  },
  avatarPlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
    backgroundColor: '#e5e7eb',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#22c55e',
  },
  logoutButton: {
    backgroundColor: '#22c55e',
    paddingVertical: 8,
    paddingHorizontal: 18,
    borderRadius: 20,
    elevation: 2,
    marginLeft: 12,
  },
  logoutText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 18,
    margin: 24,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  label: {
    color: '#22c55e',
    fontWeight: 'bold',
    fontSize: 16,
    marginTop: 8,
  },
  value: {
    color: '#222',
    fontSize: 16,
    marginBottom: 4,
  },
});

export default UserPanel;
