import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import {
  ActivityIndicator, Alert, FlatList, Image, Linking, ScrollView, StyleSheet, Text, TouchableOpacity, View,
} from 'react-native';
import { API_URL } from '../../constants/api';
import { useUser } from '../../contexts/UserContext';
import { useResponsive } from '../../hooks/useResponsive';

interface Service {
  id: number;
  nom: string;
  image: string;
  telephone: string;
}

interface Personne {
  id: number;
  nom: string;
  role: string;
  telephone: string;
  photo: string;
  statut: string;
}

export default function Home() {
  const router = useRouter();
  const { token, logout } = useUser();
  const [services, setServices] = useState<Service[]>([]);
  const [personnes, setPersonnes] = useState<Personne[]>([]);
  const [loading, setLoading] = useState(true);
  const { columnCount } = useResponsive();

  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
  };

  useFocusEffect(
    useCallback(() => {
      fetchData();
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [token])
  );

  const fetchData = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const [resServices, resPersonnes] = await Promise.all([
        fetch(`${API_URL}/api/services/`, { headers }),
        fetch(`${API_URL}/api/personnes/`, { headers }),
      ]);
      const dataServices = await resServices.json();
      const dataPersonnes = await resPersonnes.json();
      setServices(dataServices);
      setPersonnes(dataPersonnes);
    } catch {
      Alert.alert('Erreur', 'Impossible de charger les données');
    } finally {
      setLoading(false);
    }
  };

  const handleAppeler = (telephone: string) => {
    Linking.openURL(`tel:${telephone}`);
  };

  const handleLogout = async () => {
    await logout();
    router.replace('/');
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#7C3AED" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>HomeCareHub</Text>
        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
          <Text style={styles.logoutText}>Déconnexion</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.sectionTitle}>Nos Services</Text>
      {services.length > 0 ? (
        <FlatList
          data={services}
          key={`col-${columnCount}`}
          keyExtractor={(item) => item.id.toString()}
          numColumns={columnCount}
          columnWrapperStyle={columnCount > 1 ? styles.row : undefined}
          scrollEnabled={false}
          renderItem={({ item }) => (
            <View style={[styles.serviceCard, { width: `${100 / columnCount - 2}%` }]}>
              {item.image && <Image source={{ uri: item.image }} style={styles.serviceImage} />}
              <Text style={styles.cardTitle}>{item.nom}</Text>
              {item.telephone && (
                <TouchableOpacity style={styles.appelerBtn} onPress={() => handleAppeler(item.telephone)}>
                  <Text style={styles.appelerText}>Appeler</Text>
                </TouchableOpacity>
              )}
            </View>
          )}
        />
      ) : (
        <Text style={styles.emptyText}>Aucun service disponible</Text>
      )}

      <Text style={styles.sectionTitle}>Personnes autorisées</Text>
      {personnes.length > 0 ? (
        personnes.filter(p => p.statut === 'autorise').map((item) => (
          <View key={item.id} style={styles.personneCard}>
            {item.photo && <Image source={{ uri: item.photo }} style={styles.personnePhoto} />}
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={styles.personneName}>{item.nom}</Text>
              <Text style={styles.personneRole}>{item.role}</Text>
            </View>
            {item.telephone && (
              <TouchableOpacity onPress={() => handleAppeler(item.telephone)}>
                <Text style={{ fontSize: 24 }}>📞</Text>
              </TouchableOpacity>
            )}
          </View>
        ))
      ) : (
        <Text style={styles.emptyText}>Aucune personne autorisée</Text>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0D0D1A', padding: 16 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#0D0D1A' },
  header: { marginTop: 40, marginBottom: 20, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  headerTitle: { fontSize: 24, fontWeight: 'bold', color: '#FFFFFF' },
  logoutBtn: { backgroundColor: '#EF4444', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 },
  logoutText: { color: '#FFFFFF', fontWeight: 'bold' },
  sectionTitle: { fontSize: 18, color: '#FFFFFF', marginVertical: 15 },
  row: { justifyContent: 'flex-start', gap: 8 },
  serviceCard: { backgroundColor: '#13132A', borderRadius: 16, padding: 10, marginBottom: 15 },
  serviceImage: { width: '100%', height: 120, borderRadius: 12 },
  cardTitle: { color: '#FFFFFF', marginVertical: 8, textAlign: 'center' },
  appelerBtn: { backgroundColor: '#7C3AED', borderRadius: 8, padding: 8, alignItems: 'center' },
  appelerText: { color: '#FFFFFF', fontWeight: 'bold' },
  personneCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#13132A', padding: 12, borderRadius: 16, marginBottom: 10 },
  personnePhoto: { width: 50, height: 50, borderRadius: 25 },
  personneName: { color: '#FFFFFF', fontWeight: 'bold' },
  personneRole: { color: '#6B7A99' },
  emptyText: { color: '#6B7A99', textAlign: 'center', marginVertical: 20 },
});
