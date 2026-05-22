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

// ── Données mock ──────────────────────────────────────────────
const MOCK_DATA = [
  { id: '1', name: 'Marie Dubois',    role: 'Famille',    statut: 'autorise', image: 'https://randomuser.me/api/portraits/women/44.jpg', heure: '08:14', date: "Aujourd'hui" },
  { id: '2', name: 'Dr. Paul Renard', role: 'Médecin',    statut: 'autorise', image: 'https://randomuser.me/api/portraits/men/32.jpg',   heure: '10:30', date: "Aujourd'hui" },
  { id: '3', name: 'Inconnu #47',     role: 'Inconnu',    statut: 'bloque',   image: 'https://randomuser.me/api/portraits/men/55.jpg',   heure: '11:45', date: "Aujourd'hui" },
  { id: '4', name: 'Sophie Laurent',  role: 'Infirmière', statut: 'autorise', image: 'https://randomuser.me/api/portraits/women/67.jpg', heure: '14:00', date: 'Hier' },
  { id: '5', name: 'Inconnu #48',     role: 'Inconnu',    statut: 'bloque',   image: 'https://randomuser.me/api/portraits/men/71.jpg',   heure: '23:12', date: 'Hier' },
];

export default function ControleAcces() {
  const router = useRouter();

  const [persons,  setPersons]  = useState(MOCK_DATA);
  const [search,   setSearch]   = useState('');
  const [filter,   setFilter]   = useState('tous');   // tous | autorise | bloque
  const [selected, setSelected] = useState(null);     // personne dans le modal détail
  const [loading,  setLoading]  = useState(false);

  // ── Filtrage + recherche ──────────────────────────────────
  const filtered = persons.filter(p => {
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase()) ||
                        p.role.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === 'tous' ? true : p.statut === filter;
    return matchSearch && matchFilter;
  });

  // ── Stats ─────────────────────────────────────────────────
  const total    = persons.length;
  const autorise = persons.filter(p => p.statut === 'autorise').length;
  const bloque   = persons.filter(p => p.statut === 'bloque').length;

  // ── Changer statut ────────────────────────────────────────
  const toggleStatut = (id, newStatut) => {
    setPersons(prev => prev.map(p => p.id === id ? { ...p, statut: newStatut } : p));
    setSelected(prev => prev ? { ...prev, statut: newStatut } : prev);
  };

  // ── Supprimer ─────────────────────────────────────────────
  const deletePerson = (id) => {
    setPersons(prev => prev.filter(p => p.id !== id));
    setSelected(null);
  };

  // ── Render item ───────────────────────────────────────────
  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={[styles.card, item.statut === 'bloque' && styles.cardBloque]}
      onPress={() => setSelected(item)}
      activeOpacity={0.85}
    >
      {/* Photo */}
      <Image source={{ uri: item.image }} style={styles.cardImage} />

      {/* Badge statut */}
      <View style={[
        styles.statutDot,
        item.statut === 'autorise' ? styles.dotVert : styles.dotRouge
      ]} />

      {/* Infos */}
      <View style={styles.cardInfo}>
        <Text style={styles.cardName} numberOfLines={1}>{item.name}</Text>
        <Text style={styles.cardRole}>{item.role}</Text>
        <Text style={styles.cardTime}>{item.date} · {item.heure}</Text>

        {/* Boutons */}
        <View style={styles.cardBtns}>
          <TouchableOpacity
            style={[styles.cardBtn, item.statut === 'autorise' && styles.cardBtnActiveVert]}
            onPress={() => toggleStatut(item.id, 'autorise')}
          >
            <Text style={[styles.cardBtnText, item.statut === 'autorise' && { color: '#4ADE80' }]}>
              ✓ Autorisé
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.cardBtn, item.statut === 'bloque' && styles.cardBtnActiveRouge]}
            onPress={() => toggleStatut(item.id, 'bloque')}
          >
            <Text style={[styles.cardBtnText, item.statut === 'bloque' && { color: '#F87171' }]}>
              ✗ Bloqué
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );

  // ── Modal détail personne ─────────────────────────────────
  const DetailModal = () => (
    <Modal
      visible={!!selected}
      transparent
      animationType="slide"
      onRequestClose={() => setSelected(null)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalSheet}>
          {/* Barre */}
          <View style={styles.modalBar} />

          {selected && (
            <ScrollView showsVerticalScrollIndicator={false}>
              {/* Photo + nom */}
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
                    { color: selected.statut === 'autorise' ? '#4ADE80' : '#F87171' }
                  ]}>
                    {selected.statut === 'autorise' ? '✓ Autorisé' : '✗ Bloqué'}
                  </Text>
                </View>
              </View>

              {/* Infos */}
              <View style={styles.modalInfoRow}>
                <Text style={styles.modalInfoLabel}>Date détection</Text>
                <Text style={styles.modalInfoValue}>{selected.date} à {selected.heure}</Text>
              </View>
              <View style={styles.modalInfoRow}>
                <Text style={styles.modalInfoLabel}>Rôle</Text>
                <Text style={styles.modalInfoValue}>{selected.role}</Text>
              </View>

              {/* Actions statut */}
              <Text style={styles.modalSectionTitle}>Modifier le statut</Text>
              <View style={styles.modalBtnRow}>
                <TouchableOpacity
                  style={[styles.modalBtn, selected.statut === 'autorise' && styles.modalBtnActiveVert]}
                  onPress={() => toggleStatut(selected.id, 'autorise')}
                >
                  <Text style={styles.modalBtnIcon}>✅</Text>
                  <Text style={[styles.modalBtnText, selected.statut === 'autorise' && { color: '#4ADE80' }]}>
                    Autoriser
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.modalBtn, selected.statut === 'bloque' && styles.modalBtnActiveRouge]}
                  onPress={() => toggleStatut(selected.id, 'bloque')}
                >
                  <Text style={styles.modalBtnIcon}>🚫</Text>
                  <Text style={[styles.modalBtnText, selected.statut === 'bloque' && { color: '#F87171' }]}>
                    Bloquer
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Interphone */}
              <TouchableOpacity
                style={styles.modalInterphone}
                onPress={() => { setSelected(null); router.push('/interphone'); }}
              >
                <Text style={styles.modalInterphoneIcon}>📞</Text>
                <Text style={styles.modalInterphoneText}>Parler via interphone</Text>
              </TouchableOpacity>

              {/* Supprimer */}
              <TouchableOpacity
                style={styles.modalDelete}
                onPress={() => deletePerson(selected.id)}
              >
                <Text style={styles.modalDeleteText}>🗑️  Supprimer cette personne</Text>
              </TouchableOpacity>

              {/* Fermer */}
              <TouchableOpacity style={styles.modalClose} onPress={() => setSelected(null)}>
                <Text style={styles.modalCloseText}>Fermer</Text>
              </TouchableOpacity>
            </ScrollView>
          )}
        </View>
      </View>
    </Modal>
  );

  // ── UI principale ─────────────────────────────────────────
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0D0D1A" />

      {/* ── Header ── */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backText}>←</Text>
        </TouchableOpacity>

        <View style={styles.headerCenter}>
          <View style={styles.headerIconBox}>
            <Text style={styles.headerIconText}>🔑</Text>
          </View>
          <View>
            <Text style={styles.headerTitle}>Contrôle d'accès</Text>
            <Text style={styles.headerSub}>ACCÈS À LA MAISON</Text>
          </View>
        </View>

        <TouchableOpacity style={styles.addBtn} onPress={() => router.push('/add-person')}>
          <Text style={styles.addBtnText}>＋ Ajouter</Text>
        </TouchableOpacity>
      </View>

      {/* ── Stats ── */}
      <View style={styles.statsRow}>
        <TouchableOpacity style={styles.statBox} onPress={() => setFilter('tous')}>
          <Text style={[styles.statValue, filter === 'tous' && { color: '#A78BFA' }]}>{total}</Text>
          <Text style={styles.statLabel}>TOTAL</Text>
        </TouchableOpacity>
        <View style={styles.statDivider} />
        <TouchableOpacity style={styles.statBox} onPress={() => setFilter('autorise')}>
          <Text style={[styles.statValue, { color: '#4ADE80' }, filter === 'autorise' && { opacity: 1 }]}>{autorise}</Text>
          <Text style={styles.statLabel}>AUTORISÉS</Text>
        </TouchableOpacity>
        <View style={styles.statDivider} />
        <TouchableOpacity style={styles.statBox} onPress={() => setFilter('bloque')}>
          <Text style={[styles.statValue, { color: '#F87171' }, filter === 'bloque' && { opacity: 1 }]}>{bloque}</Text>
          <Text style={styles.statLabel}>BLOQUÉS</Text>
        </TouchableOpacity>
      </View>

      {/* ── Bannière reconnaissance ── */}
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

      {/* ── Recherche ── */}
      <View style={styles.searchWrapper}>
        <Text style={styles.searchIcon}>🔍</Text>
        <TextInput
          style={styles.searchInput}
          placeholder="Rechercher..."
          placeholderTextColor="#6B7A99"
          value={search}
          onChangeText={setSearch}
        />
        {search.length > 0 && (
          <TouchableOpacity onPress={() => setSearch('')}>
            <Text style={styles.searchClear}>✕</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* ── Filtres rapides ── */}
      <View style={styles.filtersRow}>
        {[
          { id: 'tous',     label: 'Tous'      },
          { id: 'autorise', label: 'Autorisés' },
          { id: 'bloque',   label: 'Bloqués'   },
        ].map(f => (
          <TouchableOpacity
            key={f.id}
            style={[styles.filterChip, filter === f.id && styles.filterChipActive]}
            onPress={() => setFilter(f.id)}
          >
            <Text style={[styles.filterChipText, filter === f.id && styles.filterChipTextActive]}>
              {f.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* ── Liste ── */}
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

      {/* ── FAB ── */}
      <TouchableOpacity style={styles.fab} onPress={() => router.push('/add-person')}>
        <Text style={styles.fabText}>＋</Text>
      </TouchableOpacity>

      {/* ── Modal détail ── */}
      <DetailModal />
    </SafeAreaView>
  );
}

// ── Styles ────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0D0D1A',
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#2E2B52',
  },
  backBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#1A1A2E',
    borderWidth: 1,
    borderColor: '#2E2B52',
    alignItems: 'center',
    justifyContent: 'center',
  },
  backText: {
    color: '#A78BFA',
    fontSize: 18,
    fontWeight: 'bold',
  },
  headerCenter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
    marginLeft: 10,
  },
  headerIconBox: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#2D1B6B',
    borderWidth: 1,
    borderColor: '#7C3AED',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerIconText: { fontSize: 16 },
  headerTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  headerSub: {
    fontSize: 10,
    color: '#8A8FAB',
    letterSpacing: 0.6,
  },
  addBtn: {
    backgroundColor: '#7C3AED',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
  },
  addBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: 'bold',
  },

  // Stats
  statsRow: {
    flexDirection: 'row',
    backgroundColor: '#13132A',
    marginHorizontal: 14,
    marginTop: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#2E2B52',
    paddingVertical: 14,
    alignItems: 'center',
  },
  statBox: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  statLabel: {
    fontSize: 10,
    color: '#8A8FAB',
    marginTop: 2,
    letterSpacing: 0.6,
  },
  statDivider: {
    width: 1,
    height: 32,
    backgroundColor: '#2E2B52',
  },

  // Bannière
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#13132A',
    marginHorizontal: 14,
    marginTop: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#2E2B52',
    padding: 14,
  },
  bannerIconBox: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#2D1B6B',
    borderWidth: 1,
    borderColor: '#7C3AED',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bannerIcon: { fontSize: 18 },
  bannerTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  bannerSub: {
    fontSize: 11,
    color: '#8A8FAB',
    marginTop: 2,
  },
  bannerArrow: {
    color: '#A78BFA',
    fontSize: 22,
    fontWeight: 'bold',
  },

  // Recherche
  searchWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#13132A',
    borderWidth: 1,
    borderColor: '#2E2B52',
    borderRadius: 12,
    marginHorizontal: 14,
    marginTop: 12,
    paddingHorizontal: 14,
  },
  searchIcon: { fontSize: 16, marginRight: 8 },
  searchInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 14,
    color: '#FFFFFF',
  },
  searchClear: {
    color: '#8A8FAB',
    fontSize: 14,
    padding: 4,
  },

  // Filtres
  filtersRow: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 14,
    marginTop: 12,
    marginBottom: 4,
  },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: '#13132A',
    borderWidth: 1,
    borderColor: '#2E2B52',
  },
  filterChipActive: {
    backgroundColor: '#2D1B6B',
    borderColor: '#7C3AED',
  },
  filterChipText: {
    color: '#8A8FAB',
    fontSize: 13,
    fontWeight: '600',
  },
  filterChipTextActive: {
    color: '#A78BFA',
  },

  // Liste
  listContent: {
    paddingHorizontal: 14,
    paddingTop: 10,
    paddingBottom: 100,
  },

  // Card personne
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#13132A',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#2E2B52',
    marginBottom: 10,
    padding: 12,
    gap: 12,
    position: 'relative',
  },
  cardBloque: {
    borderColor: '#4B1515',
    backgroundColor: '#150E0E',
  },
  cardImage: {
    width: 58,
    height: 58,
    borderRadius: 12,
  },
  statutDot: {
    position: 'absolute',
    top: 10,
    left: 58,
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#0D0D1A',
  },
  dotVert:   { backgroundColor: '#4ADE80' },
  dotRouge:  { backgroundColor: '#F87171' },
  cardInfo: {
    flex: 1,
    gap: 2,
  },
  cardName: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  cardRole: {
    fontSize: 12,
    color: '#A78BFA',
    fontWeight: '600',
  },
  cardTime: {
    fontSize: 11,
    color: '#6B7A99',
    marginBottom: 6,
  },
  cardBtns: {
    flexDirection: 'row',
    gap: 8,
  },
  cardBtn: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    backgroundColor: '#1A1A2E',
    borderWidth: 1,
    borderColor: '#2E2B52',
  },
  cardBtnActiveVert: {
    backgroundColor: '#0D2D1A',
    borderColor: '#16A34A',
  },
  cardBtnActiveRouge: {
    backgroundColor: '#2D1010',
    borderColor: '#EF4444',
  },
  cardBtnText: {
    fontSize: 12,
    color: '#8A8FAB',
    fontWeight: '600',
  },

  // Empty state
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 80,
  },
  emptyIcon:  { fontSize: 52, marginBottom: 14, opacity: 0.3 },
  emptyTitle: { fontSize: 16, fontWeight: 'bold', color: '#FFFFFF', marginBottom: 6 },
  emptySub:   { fontSize: 13, color: '#8A8FAB', textAlign: 'center' },

  // FAB
  fab: {
    position: 'absolute',
    bottom: 90,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#7C3AED',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#7C3AED',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 8,
  },
  fabText: {
    color: '#FFFFFF',
    fontSize: 28,
    fontWeight: 'bold',
    marginTop: -2,
  },

  // Modal détail
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    backgroundColor: '#13132A',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderWidth: 1,
    borderColor: '#2E2B52',
    paddingHorizontal: 20,
    paddingBottom: 36,
    maxHeight: '85%',
  },
  modalBar: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#2E2B52',
    alignSelf: 'center',
    marginTop: 12,
    marginBottom: 20,
  },
  modalHeader: {
    alignItems: 'center',
    marginBottom: 20,
  },
  modalImage: {
    width: 90,
    height: 90,
    borderRadius: 45,
    borderWidth: 3,
    borderColor: '#7C3AED',
    marginBottom: 12,
  },
  modalName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  modalRole: {
    fontSize: 13,
    color: '#A78BFA',
    marginBottom: 10,
    fontWeight: '600',
  },
  modalBadge: {
    paddingHorizontal: 14,
    paddingVertical: 5,
    borderRadius: 20,
  },
  badgeVert:   { backgroundColor: '#0D2D1A' },
  badgeRouge:  { backgroundColor: '#2D1010' },
  modalBadgeText: {
    fontSize: 13,
    fontWeight: 'bold',
  },
  modalInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#2E2B52',
  },
  modalInfoLabel: { fontSize: 13, color: '#8A8FAB' },
  modalInfoValue: { fontSize: 13, color: '#FFFFFF', fontWeight: '600' },
  modalSectionTitle: {
    fontSize: 13,
    color: '#8A8FAB',
    fontWeight: '700',
    marginTop: 16,
    marginBottom: 10,
    letterSpacing: 0.6,
  },
  modalBtnRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 14,
  },
  modalBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: '#1A1A2E',
    borderWidth: 1,
    borderColor: '#2E2B52',
  },
  modalBtnActiveVert:  { backgroundColor: '#0D2D1A', borderColor: '#16A34A' },
  modalBtnActiveRouge: { backgroundColor: '#2D1010', borderColor: '#EF4444' },
  modalBtnIcon: { fontSize: 16 },
  modalBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#8A8FAB',
  },
  modalInterphone: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    backgroundColor: '#1E1040',
    borderWidth: 1,
    borderColor: '#7C3AED',
    borderRadius: 12,
    paddingVertical: 13,
    marginBottom: 10,
  },
  modalInterphoneIcon: { fontSize: 18 },
  modalInterphoneText: {
    color: '#A78BFA',
    fontSize: 15,
    fontWeight: '600',
  },
  modalDelete: {
    alignItems: 'center',
    paddingVertical: 12,
    marginBottom: 10,
  },
  modalDeleteText: {
    color: '#F87171',
    fontSize: 14,
    fontWeight: '600',
  },
  modalClose: {
    backgroundColor: '#1A1A2E',
    borderWidth: 1,
    borderColor: '#2E2B52',
    borderRadius: 12,
    paddingVertical: 13,
    alignItems: 'center',
  },
  modalCloseText: {
    color: '#8A8FAB',
    fontSize: 15,
    fontWeight: '600',
  },
});