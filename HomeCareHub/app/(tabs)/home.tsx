import { Feather, Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  Linking,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { API_URL } from '../../constants/api';
import { useUser } from '../../contexts/UserContext';
import { useResponsive } from '../../hooks/useResponsive';
import { getPersonsByDevice } from '@/hooks/useDevice';

interface Service {
  id: number;
  name: string;
  lastName: string;
  facePhoto: string;
  phone: string;
}

interface Personne {
  id: number;
  username: string;
  email: string;
  role: string;
  phone: string;
  facePhoto: string;
  isActive: boolean;
}

export default function Home() {
  const router = useRouter();
  const { user, token, logout, deviceId, setDeviceId } = useUser();
  const { columnCount } = useResponsive();

  const [services, setServices] = useState<Service[]>([]);
  const [personnes, setPersonnes] = useState<Personne[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = async () => {
    if (!token || !deviceId) return;

    try {
      const personnesRes = await getPersonsByDevice(parseInt(deviceId!));
      if (!personnesRes) {
        throw new Error('Failed loading persons');
      }
      setPersonnes(personnesRes);

    } catch (error) {
      console.error(error);
      Alert.alert(
        'Erreur',
        'Impossible de charger les données'
      );
    }
  };

  useFocusEffect(
    useCallback(() => {
      setLoading(true);

      fetchData().finally(() => {
        setLoading(false);
      });
    }, [token, deviceId])
  );

  const onRefresh = useCallback(() => {
    setRefreshing(true);

    fetchData().finally(() => {
      setRefreshing(false);
    });
  }, [token, deviceId]);

  const handleAppeler = async (telephone: string) => {
    try {

      const url = `tel:${telephone}`;
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
      } else {
        Alert.alert(
          'Erreur',
          'Impossible d’ouvrir le téléphone'
        );
      }
    } catch {
      Alert.alert(
        'Erreur',
        'Impossible de lancer l’appel'
      );
    }
  };

  const handleLogout = async () => {
    await logout();
    router.replace('/');
  };

  const handleExitDevice = () => {
    setDeviceId(null);
    router.replace('/join-device');
  };

  if (loading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator
          size="large"
          color="#7C3AED"
        />
      </View>
    );
  }

  const username =
    user?.username || (user?.name as string) || 'Utilisateur';

  const authorizedPersons = personnes.filter(
    (p) =>
      p.isActive
  );

  return (
    <View style={styles.root}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={
          styles.contentContainer
        }
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#7C3AED"
          />
        }
      >
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>
              Bonjour, {username || "Utilisateur"} 👋
            </Text>
            <Text style={styles.subtitle}>
              Bienvenue sur HomeCareHub
            </Text>
          </View>

          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <TouchableOpacity
              style={styles.logoutBtn}
              onPress={handleExitDevice}
            >
              <Ionicons
                name="hardware-chip-outline"
                size={24}
                color="#7C3AED"
              />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.logoutBtn}
              onPress={handleLogout}
            >
              <Ionicons
                name="log-out-outline"
                size={24}
                color="#EF4444"
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* PERSONNES */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>
            Personnes autorisées
          </Text>
          <Feather
            name="users"
            size={20}
            color="#5BEF8A"
          />
        </View>

        {authorizedPersons.map((item) => (
          <View
            key={item.id}
            style={styles.personneCard}
          >
            {/* Avatar */}
            <View style={styles.avatarContainer}>
              {item.facePhoto ? (
                <Image source={{ uri: item.facePhoto }} style={styles.avatar} />
              ) : (
                <View style={styles.avatarPlaceholder}>
                  <Ionicons
                    name="person"
                    size={24}
                    color="#A0A8C8"
                  />
                </View>
              )}
            </View>

            <View style={styles.personneInfo}>
              <Text style={styles.personneName}>
                {item.username}
              </Text>
              <Text style={styles.personneRole}>
                {item.role}
              </Text>
            </View>

            {item.phone && item.username !== user?.username && (
              <TouchableOpacity
                onPress={() => handleAppeler(item.phone)}
              >
                <Ionicons
                  name="call"
                  size={22}
                  color="#5BEF8A"
                />
              </TouchableOpacity>
            )}
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#0F172A',
  },
  container: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
    paddingBottom: 40,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0F172A',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 25,
  },
  greeting: {
    fontSize: 24,
    fontWeight: '700',
    color: 'white',
  },
  subtitle: {
    color: '#94A3B8',
    marginTop: 4,
  },
  logoutBtn: {
    padding: 10,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
    marginTop: 20,
  },
  sectionTitle: {
    color: 'white',
    fontSize: 20,
    fontWeight: '700',
  },
  servicesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  serviceCard: {
    backgroundColor: '#1E293B',
    borderRadius: 18,
    padding: 14,
  },
  serviceImage: {
    width: '100%',
    height: 120,
    borderRadius: 14,
    marginBottom: 12,
  },
  placeholderImage: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#334155',
  },
  cardTitle: {
    color: 'white',
    fontWeight: '600',
    marginBottom: 10,
  },
  appelerBtn: {
    backgroundColor: '#7C3AED',
    padding: 10,
    borderRadius: 10,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
  },
  appelerText: {
    color: 'white',
    fontWeight: '600',
  },

  avatarContainer: {
    marginRight: 14,
  },

  avatar: {
    width: 58,
    height: 58,
    borderRadius: 29,
  },

  avatarPlaceholder: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: '#334155',
    justifyContent: 'center',
    alignItems: 'center',
  },

  callButton: {
    padding: 8,
  },


  personneCard: {
    backgroundColor: '#1E293B',
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  personneInfo: {
    flex: 1,
  },
  personneName: {
    color: 'white',
    fontSize: 16,
    fontWeight: '700',
  },
  personneRole: {
    color: '#94A3B8',
  },
});