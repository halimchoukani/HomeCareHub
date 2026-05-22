import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
  FlatList,
  Image, Modal,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { Colors } from '@/constants/theme';

import { useCallback } from 'react';
import { useFocusEffect } from 'expo-router';
import { ENDPOINTS } from '@/constants/config';
import { Alert } from 'react-native';
import { authFetch } from '@/constants/api';

interface Person {
  id: string;
  name: string;
  role: string;
  statut: 'autorise' | 'bloque';
  image: string;
  heure: string;
  date: string;
}

export default function ControleAcces() {
  const router = useRouter();

  const [persons, setPersons] = useState<Person[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'tous' | 'autorise' | 'bloque'>('tous');
  const [selected, setSelected] = useState<Person | null>(null);

  useFocusEffect(
    useCallback(() => {
      fetchPersons();
    }, [])
  );

  const fetchPersons = async () => {
    setLoading(true);
    try {
      const response = await authFetch(ENDPOINTS.personnes);
      if (response.ok) {
        const data = await response.json();
        // Backend returns Personne list. Map correctly to Person interface.
        const formatted: Person[] = data.map((p: any) => ({
          id: String(p.id),
          name: p.nom || p.name || 'Sans nom',
          role: p.role || 'Visiteur',
          statut: p.statut || 'autorise',
          image: p.photo || p.image || 'https://randomuser.me/api/portraits/men/32.jpg',
          heure: p.heure || '00:00',
          date: p.date || "Aujourd'hui",
        }));
        setPersons(formatted);
      } else {
        Alert.alert('Erreur', 'Impossible de récupérer la liste des accès.');
      }
    } catch (err) {
      console.error(err);
      Alert.alert('Erreur', 'Connexion au serveur impossible.');
    } finally {
      setLoading(false);
    }
  };

  const toggleStatut = async (id: string, newStatut: 'autorise' | 'bloque') => {
    try {
      const response = await authFetch(`${ENDPOINTS.personnes}${id}/`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ statut: newStatut }),
      });
      if (response.ok) {
        setPersons(prev => prev.map(p => p.id === id ? { ...p, statut: newStatut } : p));
        setSelected(prev => prev && prev.id === id ? { ...prev, statut: newStatut } : prev);
      } else {
        Alert.alert('Erreur', 'Impossible de modifier le statut.');
      }
    } catch (err) {
      console.error(err);
      Alert.alert('Erreur', 'Connexion au serveur impossible.');
    }
  };

  const deletePerson = async (id: string) => {
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
              const response = await authFetch(ENDPOINTS.supprimerPersonne(id), {
                method: 'DELETE',
              });
              if (response.ok || response.status === 204) {
                setPersons(prev => prev.filter(p => p.id !== id));
                setSelected(null);
              } else {
                Alert.alert('Erreur', 'Impossible de supprimer.');
              }
            } catch (err) {
              console.error(err);
              Alert.alert('Erreur', 'Connexion au serveur impossible.');
            }
          }
        }
      ]
    );
  };

  const filtered = persons.filter(p => {
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.role.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === 'tous' ? true : p.statut === filter;
    return matchSearch && matchFilter;
  });

  const total = persons.length;
  const autorise = persons.filter(p => p.statut === 'autorise').length;
  const bloque = persons.filter(p => p.statut === 'bloque').length;

  const renderItem = ({ item }: { item: Person }) => (
    <TouchableOpacity
      style={[styles.card, item.statut === 'bloque' && styles.cardBloque]}
      onPress={() => setSelected(item)}
      activeOpacity={0.85}
    >
      <Image source={{ uri: item.image }} style={styles.cardImage} />

      <View style={[
        styles.statutDot,
        item.statut === 'autorise' ? styles.dotVert : styles.dotRouge
      ]} />

      <View style={styles.cardInfo}>
        <Text style={styles.cardName} numberOfLines={1}>{item.name}</Text>
        <Text style={styles.cardRole}>{item.role}</Text>
        <Text style={styles.cardTime}>{item.date} · {item.heure}</Text>

        <View style={styles.cardBtns}>
          <TouchableOpacity
            style={[styles.cardBtn, item.statut === 'autorise' && styles.cardBtnActiveVert]}
            onPress={() => toggleStatut(item.id, 'autorise')}
          >
            <Text style={[styles.cardBtnText, item.statut === 'autorise' && { color: Colors.success }]}>
              ✓ Autorisé
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.cardBtn, item.statut === 'bloque' && styles.cardBtnActiveRouge]}
            onPress={() => toggleStatut(item.id, 'bloque')}
          >
            <Text style={[styles.cardBtnText, item.statut === 'bloque' && { color: Colors.danger }]}>
              ✗ Bloqué
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.background} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backText}>←</Text>
        </TouchableOpacity>

        <View style={styles.headerCenter}>
          <View style={styles.headerIconBox}>
            <Text style={styles.headerIconText}>🔑</Text>
          </View>
          <View>
            <Text style={styles.headerTitle}>{"Contrôle d'accès"}</Text>
            <Text style={styles.headerSub}>ACCÈS À LA MAISON</Text>
          </View>
        </View>

        <TouchableOpacity style={styles.addBtn} onPress={() => router.push('/add-person')}>
          <Text style={styles.addBtnText}>＋ Ajouter</Text>
        </TouchableOpacity>
      </View>

      {/* Stats */}
      <View style={styles.statsRow}>
        <TouchableOpacity style={styles.statBox} onPress={() => setFilter('tous')}>
          <Text style={[styles.statValue, filter === 'tous' && { color: Colors.accent }]}>{total}</Text>
          <Text style={styles.statLabel}>TOTAL</Text>
        </TouchableOpacity>
        <View style={styles.statDivider} />
        <TouchableOpacity style={styles.statBox} onPress={() => setFilter('autorise')}>
          <Text style={[styles.statValue, { color: Colors.success }]}>{autorise}</Text>
          <Text style={styles.statLabel}>AUTORISÉS</Text>
        </TouchableOpacity>
        <View style={styles.statDivider} />
        <TouchableOpacity style={styles.statBox} onPress={() => setFilter('bloque')}>
          <Text style={[styles.statValue, { color: Colors.danger }]}>{bloque}</Text>
          <Text style={styles.statLabel}>BLOQUÉS</Text>
        </TouchableOpacity>
      </View>

      {/* Bannière reconnaissance */}
      <TouchableOpacity
        style={styles.banner}
        onPress={() => router.push('/surveillance')}
      >
        <View style={styles.bannerIconBox}>
          <Text style={styles.bannerIcon}>📷</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.bannerTitle}>Reconnaissance à la porte</Text>
          <Text style={styles.bannerSub}>Les personnes autorisées sont reconnues par la caméra</Text>
        </View>
        <Text style={styles.bannerArrow}>›</Text>
      </TouchableOpacity>

      {/* Recherche */}
      <View style={styles.searchWrapper}>
        <Text style={styles.searchIcon}>🔍</Text>
        <TextInput
          style={styles.searchInput}
          placeholder="Rechercher..."
          placeholderTextColor={Colors.textMuted}
          value={search}
          onChangeText={setSearch}
        />
        {search.length > 0 && (
          <TouchableOpacity onPress={() => setSearch('')}>
            <Text style={styles.searchClear}>✕</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Filtres rapides */}
      <View style={styles.filtersRow}>
        {(['tous', 'autorise', 'bloque'] as const).map(f => (
          <TouchableOpacity
            key={f}
            style={[styles.filterChip, filter === f && styles.filterChipActive]}
            onPress={() => setFilter(f)}
          >
            <Text style={[styles.filterChipText, filter === f && styles.filterChipTextActive]}>
              {f === 'tous' ? 'Tous' : f === 'autorise' ? 'Autorisés' : 'Bloqués'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Liste */}
      {filtered.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyIcon}>👤</Text>
          <Text style={styles.emptyTitle}>Aucune personne trouvée</Text>
          <Text style={styles.emptySub}>Appuyez sur + Ajouter pour en ajouter une</Text>
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={item => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      )}

      {/* FAB */}
      <TouchableOpacity style={styles.fab} onPress={() => router.push('/add-person')}>
        <Text style={styles.fabText}>＋</Text>
      </TouchableOpacity>

      {/* Modal détail */}
      <Modal
        visible={!!selected}
        transparent
        animationType="slide"
        onRequestClose={() => setSelected(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalSheet}>
            <View style={styles.modalBar} />

            {selected && (
              <ScrollView showsVerticalScrollIndicator={false}>
                <View style={styles.modalHeader}>
                  <Image source={{ uri: selected.image }} style={styles.modalImage} />
                  <Text style={styles.modalName}>{selected.name}</Text>
                  <Text style={styles.modalRole}>{selected.role}</Text>
                  <View style={[
                    styles.modalBadge,
                    selected.statut === 'autorise' ? styles.badgeVert : styles.badgeRouge
                  ]}>
                    <Text style={[
                      styles.modalBadgeText,
                      { color: selected.statut === 'autorise' ? Colors.success : Colors.danger }
                    ]}>
                      {selected.statut === 'autorise' ? '✓ Autorisé' : '✗ Bloqué'}
                    </Text>
                  </View>
                </View>

                <View style={styles.modalInfoRow}>
                  <Text style={styles.modalInfoLabel}>Date détection</Text>
                  <Text style={styles.modalInfoValue}>{selected.date} à {selected.heure}</Text>
                </View>
                <View style={styles.modalInfoRow}>
                  <Text style={styles.modalInfoLabel}>Rôle</Text>
                  <Text style={styles.modalInfoValue}>{selected.role}</Text>
                </View>

                <Text style={styles.modalSectionTitle}>Modifier le statut</Text>
                <View style={styles.modalBtnRow}>
                  <TouchableOpacity
                    style={[styles.modalBtn, selected.statut === 'autorise' && styles.modalBtnActiveVert]}
                    onPress={() => toggleStatut(selected.id, 'autorise')}
                  >
                    <Text style={styles.modalBtnIcon}>✅</Text>
                    <Text style={[styles.modalBtnText, selected.statut === 'autorise' && { color: Colors.success }]}>
                      Autoriser
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.modalBtn, selected.statut === 'bloque' && styles.modalBtnActiveRouge]}
                    onPress={() => toggleStatut(selected.id, 'bloque')}
                  >
                    <Text style={styles.modalBtnIcon}>🚫</Text>
                    <Text style={[styles.modalBtnText, selected.statut === 'bloque' && { color: Colors.danger }]}>
                      Bloquer
                    </Text>
                  </TouchableOpacity>
                </View>

                <TouchableOpacity
                  style={styles.modalInterphone}
                  onPress={() => { setSelected(null); router.push('/interphone'); }}
                >
                  <Text style={styles.modalInterphoneIcon}>📞</Text>
                  <Text style={styles.modalInterphoneText}>Parler via interphone</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.modalDelete}
                  onPress={() => deletePerson(selected.id)}
                >
                  <Text style={styles.modalDeleteText}>🗑️  Supprimer cette personne</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.modalClose} onPress={() => setSelected(null)}>
                  <Text style={styles.modalCloseText}>Fermer</Text>
                </TouchableOpacity>
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 14, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: Colors.border },
  backBtn: { width: 34, height: 34, borderRadius: 17, backgroundColor: Colors.primaryMuted, borderWidth: 1, borderColor: Colors.border, alignItems: 'center', justifyContent: 'center' },
  backText: { color: Colors.accent, fontSize: 18, fontWeight: 'bold' },
  headerCenter: { flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1, marginLeft: 10 },
  headerIconBox: { width: 38, height: 38, borderRadius: 19, backgroundColor: Colors.accentMuted, borderWidth: 1, borderColor: Colors.primary, alignItems: 'center', justifyContent: 'center' },
  headerIconText: { fontSize: 16 },
  headerTitle: { fontSize: 15, fontWeight: 'bold', color: Colors.text },
  headerSub: { fontSize: 10, color: Colors.textMuted, letterSpacing: 0.6 },
  addBtn: { backgroundColor: Colors.primary, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20 },
  addBtnText: { color: Colors.text, fontSize: 13, fontWeight: 'bold' },
  statsRow: { flexDirection: 'row', backgroundColor: Colors.card, marginHorizontal: 14, marginTop: 14, borderRadius: 14, borderWidth: 1, borderColor: Colors.border, paddingVertical: 14, alignItems: 'center' },
  statBox: { flex: 1, alignItems: 'center' },
  statValue: { fontSize: 24, fontWeight: 'bold', color: Colors.text },
  statLabel: { fontSize: 10, color: Colors.textMuted, marginTop: 2, letterSpacing: 0.6 },
  statDivider: { width: 1, height: 32, backgroundColor: Colors.border },
  banner: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: Colors.card, marginHorizontal: 14, marginTop: 12, borderRadius: 14, borderWidth: 1, borderColor: Colors.border, padding: 14 },
  bannerIconBox: { width: 40, height: 40, borderRadius: 20, backgroundColor: Colors.accentMuted, borderWidth: 1, borderColor: Colors.primary, alignItems: 'center', justifyContent: 'center' },
  bannerIcon: { fontSize: 18 },
  bannerTitle: { fontSize: 14, fontWeight: '700', color: Colors.text },
  bannerSub: { fontSize: 11, color: Colors.textMuted, marginTop: 2 },
  bannerArrow: { color: Colors.accent, fontSize: 22, fontWeight: 'bold' },
  searchWrapper: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.card, borderWidth: 1, borderColor: Colors.border, borderRadius: 12, marginHorizontal: 14, marginTop: 12, paddingHorizontal: 14 },
  searchIcon: { fontSize: 16, marginRight: 8 },
  searchInput: { flex: 1, paddingVertical: 12, fontSize: 14, color: Colors.text },
  searchClear: { color: Colors.textMuted, fontSize: 14, padding: 4 },
  filtersRow: { flexDirection: 'row', gap: 8, paddingHorizontal: 14, marginTop: 12, marginBottom: 4 },
  filterChip: { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20, backgroundColor: Colors.card, borderWidth: 1, borderColor: Colors.border },
  filterChipActive: { backgroundColor: Colors.accentMuted, borderColor: Colors.primary },
  filterChipText: { color: Colors.textMuted, fontSize: 13, fontWeight: '600' },
  filterChipTextActive: { color: Colors.accent },
  listContent: { paddingHorizontal: 14, paddingTop: 10, paddingBottom: 100 },
  card: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.card, borderRadius: 14, borderWidth: 1, borderColor: Colors.border, marginBottom: 10, padding: 12, gap: 12, position: 'relative' },
  cardBloque: { borderColor: Colors.dangerMuted, backgroundColor: '#150E0E' },
  cardImage: { width: 58, height: 58, borderRadius: 12 },
  statutDot: { position: 'absolute', top: 10, left: 58, width: 12, height: 12, borderRadius: 6, borderWidth: 2, borderColor: Colors.background },
  dotVert: { backgroundColor: Colors.success },
  dotRouge: { backgroundColor: Colors.danger },
  cardInfo: { flex: 1, gap: 2 },
  cardName: { fontSize: 15, fontWeight: 'bold', color: Colors.text },
  cardRole: { fontSize: 12, color: Colors.accent, fontWeight: '600' },
  cardTime: { fontSize: 11, color: Colors.textSubtle, marginBottom: 6 },
  cardBtns: { flexDirection: 'row', gap: 8 },
  cardBtn: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8, backgroundColor: Colors.primaryMuted, borderWidth: 1, borderColor: Colors.border },
  cardBtnActiveVert: { backgroundColor: Colors.successMuted, borderColor: Colors.successBorder },
  cardBtnActiveRouge: { backgroundColor: Colors.dangerMuted, borderColor: Colors.dangerBorder },
  cardBtnText: { fontSize: 12, color: Colors.textMuted, fontWeight: '600' },
  emptyState: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingBottom: 80 },
  emptyIcon: { fontSize: 52, marginBottom: 14, opacity: 0.3 },
  emptyTitle: { fontSize: 16, fontWeight: 'bold', color: Colors.text, marginBottom: 6 },
  emptySub: { fontSize: 13, color: Colors.textMuted, textAlign: 'center' },
  fab: { position: 'absolute', bottom: 90, right: 20, width: 56, height: 56, borderRadius: 28, backgroundColor: Colors.primary, alignItems: 'center', justifyContent: 'center', shadowColor: Colors.primary, shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.4, shadowRadius: 10, elevation: 8 },
  fabText: { color: Colors.text, fontSize: 28, fontWeight: 'bold', marginTop: -2 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'flex-end' },
  modalSheet: { backgroundColor: Colors.card, borderTopLeftRadius: 24, borderTopRightRadius: 24, borderWidth: 1, borderColor: Colors.border, paddingHorizontal: 20, paddingBottom: 36, maxHeight: '85%' },
  modalBar: { width: 40, height: 4, borderRadius: 2, backgroundColor: Colors.border, alignSelf: 'center', marginTop: 12, marginBottom: 20 },
  modalHeader: { alignItems: 'center', marginBottom: 20 },
  modalImage: { width: 90, height: 90, borderRadius: 45, borderWidth: 3, borderColor: Colors.primary, marginBottom: 12 },
  modalName: { fontSize: 20, fontWeight: 'bold', color: Colors.text, marginBottom: 4 },
  modalRole: { fontSize: 13, color: Colors.accent, marginBottom: 10, fontWeight: '600' },
  modalBadge: { paddingHorizontal: 14, paddingVertical: 5, borderRadius: 20 },
  badgeVert: { backgroundColor: Colors.successMuted },
  badgeRouge: { backgroundColor: Colors.dangerMuted },
  modalBadgeText: { fontSize: 13, fontWeight: 'bold' },
  modalInfoRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: Colors.border },
  modalInfoLabel: { fontSize: 13, color: Colors.textMuted },
  modalInfoValue: { fontSize: 13, color: Colors.text, fontWeight: '600' },
  modalSectionTitle: { fontSize: 13, color: Colors.textMuted, fontWeight: '700', marginTop: 16, marginBottom: 10, letterSpacing: 0.6 },
  modalBtnRow: { flexDirection: 'row', gap: 10, marginBottom: 14 },
  modalBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 12, borderRadius: 12, backgroundColor: Colors.primaryMuted, borderWidth: 1, borderColor: Colors.border },
  modalBtnActiveVert: { backgroundColor: Colors.successMuted, borderColor: Colors.successBorder },
  modalBtnActiveRouge: { backgroundColor: Colors.dangerMuted, borderColor: Colors.dangerBorder },
  modalBtnIcon: { fontSize: 16 },
  modalBtnText: { fontSize: 14, fontWeight: '600', color: Colors.textMuted },
  modalInterphone: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, backgroundColor: Colors.accentMuted, borderWidth: 1, borderColor: Colors.primary, borderRadius: 12, paddingVertical: 13, marginBottom: 10 },
  modalInterphoneIcon: { fontSize: 18 },
  modalInterphoneText: { color: Colors.accent, fontSize: 15, fontWeight: '600' },
  modalDelete: { alignItems: 'center', paddingVertical: 12, marginBottom: 10 },
  modalDeleteText: { color: Colors.danger, fontSize: 14, fontWeight: '600' },
  modalClose: { backgroundColor: Colors.primaryMuted, borderWidth: 1, borderColor: Colors.border, borderRadius: 12, paddingVertical: 13, alignItems: 'center' },
  modalCloseText: { color: Colors.textMuted, fontSize: 15, fontWeight: '600' },
});
