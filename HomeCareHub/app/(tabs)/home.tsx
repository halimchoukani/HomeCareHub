import { useState, useCallback } from 'react';
import { useFocusEffect } from 'expo-router';
import {
  View, Text, StyleSheet, FlatList,
  Image, ActivityIndicator, TouchableOpacity,
  ScrollView, Linking, Alert
} from 'react-native';
import { Colors } from '@/constants/theme';
import { ENDPOINTS } from '@/constants/config';
import { authFetch } from '@/constants/api';

interface ServiceItem {
  id: number | string;
  nom?: string;
  name?: string;
  description: string;
  image: string;
  telephone: string;
  phone?: string;
}

interface PersonneItem {
  id: number | string;
  nom?: string;
  name?: string;
  role: string;
  telephone: string;
  phone?: string;
  photo: string;
  image?: string;
}

export default function Home() {
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [personnes, setPersonnes] = useState<PersonneItem[]>([]);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      fetchData();
    }, [])
  );

  const fetchData = async () => {
    setLoading(true);
    try {
      const [resServices, resPersonnes] = await Promise.all([
        authFetch(ENDPOINTS.services),
        authFetch(ENDPOINTS.personnes),
      ]);
      const dataServices = await resServices.json();
      const dataPersonnes = await resPersonnes.json();
      
      // Adapt field names if backend returns standard English names vs French names
      const normalizedServices = dataServices.map((s: any) => ({
        id: s.id,
        nom: s.nom || s.name || '',
        description: s.description || '',
        image: s.image || '',
        telephone: s.telephone || s.phone || '',
      }));

      const normalizedPersonnes = dataPersonnes.map((p: any) => ({
        id: p.id,
        nom: p.nom || p.name || '',
        role: p.role || '',
        telephone: p.telephone || p.phone || '',
        photo: p.photo || p.image || '',
      }));

      setServices(normalizedServices);
      setPersonnes(normalizedPersonnes);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleAppeler = (telephone: string) => {
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

  const handleSupprimer = (id: number | string) => {
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
              const response = await authFetch(
                ENDPOINTS.supprimerPersonne(id),
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
        <ActivityIndicator size="large" color={Colors.primary} />
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
            {item.image ? (
              <Image
                source={{ uri: item.image }}
                style={styles.serviceImage}
                resizeMode="cover"
              />
            ) : (
              <View style={[styles.serviceImage, { backgroundColor: Colors.primaryMuted, alignItems: 'center', justifyContent: 'center' }]}>
                <Text style={{ fontSize: 24 }}>🛎️</Text>
              </View>
            )}
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
            {item.photo ? (
              <Image
                source={{ uri: item.photo }}
                style={styles.personnePhoto}
                resizeMode="cover"
              />
            ) : (
              <View style={[styles.personnePhoto, { backgroundColor: Colors.primaryMuted, alignItems: 'center', justifyContent: 'center' }]}>
                <Text style={{ fontSize: 20 }}>👤</Text>
              </View>
            )}
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
    backgroundColor: Colors.background,
    paddingHorizontal: 16,
    paddingTop: 50,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: Colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    color: Colors.accent,
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
    backgroundColor: Colors.primaryMuted, borderWidth: 2, borderColor: Colors.primary,
    alignItems: 'center', justifyContent: 'center',
  },
  logoEmoji: { fontSize: 24 },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: Colors.text },
  headerSub: { fontSize: 13, color: Colors.textSubtle },
  sectionTitle: {
    fontSize: 18, fontWeight: '700',
    color: Colors.text, marginBottom: 16, marginTop: 8,
  },
  row: { justifyContent: 'space-between', marginBottom: 16 },
  serviceCard: {
    backgroundColor: Colors.card, borderRadius: 16,
    width: '48%', borderWidth: 1, borderColor: Colors.borderAlt, overflow: 'hidden',
  },
  serviceImage: { width: '100%', height: 120 },
  cardContent: { padding: 10 },
  cardTitle: { fontSize: 14, fontWeight: '700', color: Colors.text, marginBottom: 4 },
  cardDesc: { fontSize: 12, color: Colors.textSubtle, lineHeight: 16, marginBottom: 8 },
  appelerBtn: { backgroundColor: Colors.primary, paddingVertical: 8, borderRadius: 10, alignItems: 'center' },
  appelerText: { color: Colors.text, fontSize: 13, fontWeight: '700' },
  personneCard: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: Colors.card, borderRadius: 16,
    padding: 12, marginBottom: 12,
    borderWidth: 1, borderColor: Colors.borderAlt,
  },
  personnePhoto: {
    width: 60, height: 60, borderRadius: 30,
    borderWidth: 2, borderColor: Colors.primary,
  },
  personneInfo: { flex: 1, marginLeft: 12 },
  personneName: { fontSize: 15, fontWeight: '700', color: Colors.text },
  personneRole: { fontSize: 12, color: Colors.accent, marginTop: 2 },
  personnePhone: { fontSize: 12, color: Colors.textSubtle, marginTop: 2 },
  actionBtns: {
    flexDirection: 'column',
    gap: 8,
  },
  callBtn: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: Colors.successMuted, borderWidth: 1, borderColor: Colors.successBorder,
    alignItems: 'center', justifyContent: 'center',
  },
  callText: { fontSize: 22 },
  supprimerBtn: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: Colors.dangerMuted, borderWidth: 1, borderColor: Colors.dangerBorder,
    alignItems: 'center', justifyContent: 'center',
  },
  supprimerText: { fontSize: 20 },
  emptyBox: {
    backgroundColor: Colors.card, borderRadius: 16,
    padding: 24, alignItems: 'center',
    borderWidth: 1, borderColor: Colors.borderAlt,
  },
  emptyText: { color: Colors.textSubtle, fontSize: 14 },
});
