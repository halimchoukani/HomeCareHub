import { useState, useCallback } from 'react';
import { useFocusEffect } from 'expo-router';
import {
  View, Text, StyleSheet, FlatList,
  Image, ActivityIndicator, TouchableOpacity,
  ScrollView, Linking, Alert
} from 'react-native';

export default function Home() {
  const [services,  setServices]  = useState([]);
  const [personnes, setPersonnes] = useState([]);
  const [loading,   setLoading]   = useState(true);

  useFocusEffect(
    useCallback(() => {
      fetchData();
    }, [])
  );

  const fetchData = async () => {
    setLoading(true);
    try {
      const [resServices, resPersonnes] = await Promise.all([
        fetch('http://192.168.1.108:8000/api/services/'),
        fetch('http://192.168.1.108:8000/api/personnes/'),
      ]);
      const dataServices  = await resServices.json();
      const dataPersonnes = await resPersonnes.json();
      setServices(dataServices);
      setPersonnes(dataPersonnes);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleAppeler = (telephone) => {
    Alert.alert(
      'Contacter',
      'Comment voulez-vous contacter ?',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: '📞 Appel',
          onPress: () => Linking.openURL(`tel:${telephone}`),
        },
        {
          text: '💬 WhatsApp',
          onPress: () => Linking.openURL(`whatsapp://send?phone=216${telephone}`),
        },
      ]
    );
  };

  const handleSupprimer = (id) => {
    Alert.alert(
      'Supprimer',
      'Voulez-vous vraiment supprimer cette personne ?',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Supprimer',
          style: 'destructive',
          onPress: async () => {
            try {
              const response = await fetch(
                `http://192.168.1.108:8000/api/personnes/${id}/supprimer/`,
                {
                  method: 'DELETE',
                  headers: { 'Content-Type': 'application/json' },
                }
              );
              if (response.ok || response.status === 204) {
                setPersonnes(prev => prev.filter(p => p.id !== id));
              } else {
                Alert.alert('Erreur', 'Impossible de supprimer');
              }
            } catch (e) {
              setPersonnes(prev => prev.filter(p => p.id !== id));
            }
          }
        }
      ]
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#7C3AED" />
        <Text style={styles.loadingText}>Chargement...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.logoCircle}>
          <Text style={styles.logoEmoji}>🏠</Text>
        </View>
        <View>
          <Text style={styles.headerTitle}>HomeCareHub</Text>
          <Text style={styles.headerSub}>Bienvenue dans votre espace</Text>
        </View>
      </View>

      {/* Section Services */}
      <Text style={styles.sectionTitle}>🛎️ Nos Services</Text>
      <FlatList
        data={services}
        keyExtractor={(item) => item.id.toString()}
        numColumns={2}
        columnWrapperStyle={styles.row}
        scrollEnabled={false}
        renderItem={({ item }) => (
          <View style={styles.serviceCard}>
            <Image
              source={{ uri: item.image }}
              style={styles.serviceImage}
              resizeMode="cover"
            />
            <View style={styles.cardContent}>
              <Text style={styles.cardTitle}>{item.nom}</Text>
              <Text style={styles.cardDesc} numberOfLines={2}>
                {item.description}
              </Text>
              <TouchableOpacity
                style={styles.appelerBtn}
                onPress={() => handleAppeler(item.telephone)}
              >
                <Text style={styles.appelerText}>📞 Appeler</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      />

      {/* Section Personnes */}
      <Text style={styles.sectionTitle}>👥 Personnes autorisées</Text>
      {personnes.length === 0 ? (
        <View style={styles.emptyBox}>
          <Text style={styles.emptyText}>Aucune personne ajoutée</Text>
        </View>
      ) : (
        personnes.map((item) => (
          <View key={item.id} style={styles.personneCard}>
            <Image
              source={{ uri: item.photo }}
              style={styles.personnePhoto}
              resizeMode="cover"
            />
            <View style={styles.personneInfo}>
              <Text style={styles.personneName}>{item.nom}</Text>
              <Text style={styles.personneRole}>{item.role}</Text>
              <Text style={styles.personnePhone}>📞 {item.telephone}</Text>
            </View>
            <View style={styles.actionBtns}>
              <TouchableOpacity
                style={styles.callBtn}
                onPress={() => handleAppeler(item.telephone)}
              >
                <Text style={styles.callText}>📞</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.supprimerBtn}
                onPress={() => handleSupprimer(item.id)}
              >
                <Text style={styles.supprimerText}>🗑️</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))
      )}

      <View style={{ height: 30 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0D0D1A',
    paddingHorizontal: 16,
    paddingTop: 50,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: '#0D0D1A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    color: '#A78BFA',
    marginTop: 12,
    fontSize: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
    gap: 14,
  },
  logoCircle: {
    width: 52, height: 52, borderRadius: 26,
    backgroundColor: '#1E1B3A', borderWidth: 2, borderColor: '#7C3AED',
    alignItems: 'center', justifyContent: 'center',
  },
  logoEmoji:   { fontSize: 24 },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: '#FFFFFF' },
  headerSub:   { fontSize: 13, color: '#6B7A99' },
  sectionTitle: {
    fontSize: 18, fontWeight: '700',
    color: '#FFFFFF', marginBottom: 16, marginTop: 8,
  },
  row: { justifyContent: 'space-between', marginBottom: 16 },
  serviceCard: {
    backgroundColor: '#13132A', borderRadius: 16,
    width: '48%', borderWidth: 1, borderColor: '#2A2750', overflow: 'hidden',
  },
  serviceImage:  { width: '100%', height: 120 },
  cardContent:   { padding: 10 },
  cardTitle:     { fontSize: 14, fontWeight: '700', color: '#FFFFFF', marginBottom: 4 },
  cardDesc:      { fontSize: 12, color: '#6B7A99', lineHeight: 16, marginBottom: 8 },
  appelerBtn:    { backgroundColor: '#7C3AED', paddingVertical: 8, borderRadius: 10, alignItems: 'center' },
  appelerText:   { color: '#FFFFFF', fontSize: 13, fontWeight: '700' },
  personneCard: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#13132A', borderRadius: 16,
    padding: 12, marginBottom: 12,
    borderWidth: 1, borderColor: '#2A2750',
  },
  personnePhoto: {
    width: 60, height: 60, borderRadius: 30,
    borderWidth: 2, borderColor: '#7C3AED',
  },
  personneInfo:  { flex: 1, marginLeft: 12 },
  personneName:  { fontSize: 15, fontWeight: '700', color: '#FFFFFF' },
  personneRole:  { fontSize: 12, color: '#A78BFA', marginTop: 2 },
  personnePhone: { fontSize: 12, color: '#6B7A99', marginTop: 2 },
  actionBtns: {
    flexDirection: 'column',
    gap: 8,
  },
  callBtn: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: '#0D2D1A', borderWidth: 1, borderColor: '#16A34A',
    alignItems: 'center', justifyContent: 'center',
  },
  callText:      { fontSize: 22 },
  supprimerBtn: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: '#2D1010', borderWidth: 1, borderColor: '#EF4444',
    alignItems: 'center', justifyContent: 'center',
  },
  supprimerText: { fontSize: 20 },
  emptyBox: {
    backgroundColor: '#13132A', borderRadius: 16,
    padding: 24, alignItems: 'center',
    borderWidth: 1, borderColor: '#2A2750',
  },
  emptyText: { color: '#6B7A99', fontSize: 14 },
});