import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import {
  Alert,
  FlatList,
  Image,
  Modal,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { API_URL, api } from "../../constants/api";
import { useUser } from "../../contexts/UserContext";
import { useResponsive } from "../../hooks/useResponsive";
import { getPersonsByDevice, removePersonFromDevice, toggleBlockStatus } from "@/hooks/useDevice";

interface Personne {
  id: number;
  username: string;
  email: string;
  role: string;
  facePhoto: string;
  createdAt: string;
  isActive: boolean;
}

export default function ControleAcces() {
  const router = useRouter();
  const { token, deviceId, role, user } = useUser();
  const [persons, setPersons] = useState<Personne[]>([]);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState(0);
  const [selected, setSelected] = useState<Personne | null>(null);
  const [loading, setLoading] = useState(true);
  const { isDesktop } = useResponsive();
  const numColumns = isDesktop ? 4 : 1;

  const headers = {
    Authorization: `Bearer ${token}`,
  };

  useFocusEffect(
    useCallback(() => {
      fetchPersons();
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [token]),
  );

  const fetchPersons = async () => {
    if (!token || !deviceId) return;
    setLoading(true);

    try {
      const personnesRes = await getPersonsByDevice(parseInt(deviceId!));
      if (!personnesRes) {
        throw new Error('Failed loading persons');
      }
      setPersons(personnesRes);
    } catch (error) {
      console.error(error);
      Alert.alert(
        'Erreur',
        'Impossible de charger les données'
      );
    } finally {
      setLoading(false);
    }
  };

  const filtered = persons.filter((p) => {

    const matchSearch =
      (p.username + " " + p.email).toLowerCase().includes(search.toLowerCase()) ||
      p.role.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === 0 ? true : p.isActive === true;
    return matchSearch && matchFilter;
  });
  const total = persons.length;
  const autorise = persons.filter((p) => p.isActive === true).length;
  const bloque = persons.filter((p) => p.isActive === false).length;

  const toggleStatut = async (id: number, newStatut: Personne["isActive"]) => {
    try {
      const response = await toggleBlockStatus(parseInt(deviceId!), id, newStatut ? "unblock" : "block");
      if (!response) {
        throw new Error("Error while updating person status");
      }
      setPersons((prev) => prev.map((p) => (p.id === id ? { ...p, isActive: newStatut } : p)));
      setSelected((prev) => (prev && prev.id === id ? { ...prev, isActive: newStatut } : prev));
    } catch {
      Alert.alert("Erreur", "Impossible de mettre à jour le statut");
    }
  };

  const deletePerson = async (id: number) => {
    try {
      const response = await removePersonFromDevice(parseInt(deviceId!), id);
      if (!response) {
        throw new Error("Error while removing person");
      }
      setPersons((prev) => prev.filter((p) => p.id !== id));
      setSelected(null);
    } catch {
      Alert.alert("Erreur", "Impossible de supprimer");
    }
  };

  const renderItem = ({ item }: { item: Personne }) => (
    <TouchableOpacity
      style={[
        styles.card,
        item.isActive === false && styles.cardBloque,
        isDesktop && { width: "24%" },
      ]}
      onPress={() => setSelected(item)}
      activeOpacity={0.85}
    >
      <Image source={{ uri: item.facePhoto }} style={styles.cardImage} />
      <View
        style={[
          styles.statutDot,
          item.isActive === true ? styles.dotVert : styles.dotRouge,
        ]}
      />
      <View style={styles.cardInfo}>
        <Text style={styles.cardName} numberOfLines={1}>
          {item.username}
        </Text>
        <Text style={styles.cardRole}>{item.role}</Text>
        <Text style={styles.cardTime}>
          {item.createdAt}
        </Text>
        {item.role !== "owner" && role === "owner" && (
          <View style={styles.cardBtns}>

            <TouchableOpacity
              style={[
                styles.cardBtn,
                item.isActive === true && styles.cardBtnActiveVert,
              ]}
              onPress={() => toggleStatut(item.id, true)}
            >
              <Text
                style={[
                  styles.cardBtnText,
                  item.isActive === true && { color: "#4ADE80" },
                ]}
              >
                ✓ Autorisé
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.cardBtn,
                item.isActive === false && styles.cardBtnActiveRouge,
              ]}
              onPress={() => toggleStatut(item.id, false)}
            >
              <Text
                style={[
                  styles.cardBtnText,
                  item.isActive === false && { color: "#F87171" },
                ]}
              >
                ✗ Bloqué
              </Text>
            </TouchableOpacity>
          </View>)}
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0D0D1A" />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backText}>←</Text>
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <View style={styles.headerIconBox}>
            <Text style={styles.headerIconText}>🔑</Text>
          </View>
          <View>
            <Text style={styles.headerTitle}>
              Contr&ocirc;le d&apos;acc&egrave;s
            </Text>
            <Text style={styles.headerSub}>
              ACC&Egrave;S &Agrave; LA MAISON
            </Text>
          </View>
        </View>
        {
          role === "owner" && (
            <TouchableOpacity
              style={styles.addBtn}
              onPress={() => router.push("/add-person")}
            >
              <Text style={styles.addBtnText}>＋ Ajouter</Text>
            </TouchableOpacity>
          )
        }
      </View>

      <View style={styles.statsRow}>
        <TouchableOpacity
          style={styles.statBox}
          onPress={() => setFilter(0)}
        >
          <Text
            style={[
              styles.statValue,
              filter === 0 && { color: "#A78BFA" },
            ]}
          >
            {total}
          </Text>
          <Text style={styles.statLabel}>TOTAL</Text>
        </TouchableOpacity>
        <View style={styles.statDivider} />
        <TouchableOpacity
          style={styles.statBox}
          onPress={() => setFilter(1)}
        >
          <Text style={[styles.statValue, { color: "#4ADE80" }]}>
            {autorise}
          </Text>
          <Text style={styles.statLabel}>AUTORISÉS</Text>
        </TouchableOpacity>
        <View style={styles.statDivider} />
        <TouchableOpacity
          style={styles.statBox}
          onPress={() => setFilter(2)}
        >
          <Text style={[styles.statValue, { color: "#F87171" }]}>{bloque}</Text>
          <Text style={styles.statLabel}>BLOQUÉS</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        style={styles.banner}
        onPress={() => router.push("/surveillance")}
      >
        <View style={styles.bannerIconBox}>
          <Text style={styles.bannerIcon}>📷</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.bannerTitle}>Reconnaissance à la porte</Text>
          <Text style={styles.bannerSub}>
            Les personnes autorisées sont reconnues par la caméra
          </Text>
        </View>
        <Text style={styles.bannerArrow}>›</Text>
      </TouchableOpacity>

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
          <TouchableOpacity onPress={() => setSearch("")}>
            <Text style={styles.searchClear}>✕</Text>
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.filtersRow}>
        {[0, 1, 2].map((f) => (
          <TouchableOpacity
            key={f}
            style={[styles.filterChip, filter === f && styles.filterChipActive]}
            onPress={() => setFilter(f)}
          >
            <Text
              style={[
                styles.filterChipText,
                filter === f && styles.filterChipTextActive,
              ]}
            >
              {f === 0
                ? "Tous"
                : f === 1
                  ? "Autorisés"
                  : "Bloqués"}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {loading ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyTitle}>Chargement...</Text>
        </View>
      ) : filtered.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyIcon}>👤</Text>
          <Text style={styles.emptyTitle}>Aucune personne trouvée</Text>
          {
            role === "owner" && (
              <Text style={styles.emptySub}>
                Appuyez sur + Ajouter pour en ajouter une
              </Text>
            )
          }
        </View>
      ) : (
        <FlatList
          data={filtered}
          key={`cols-${numColumns}`}
          keyExtractor={(item) => item.id.toString()}
          numColumns={numColumns}
          columnWrapperStyle={numColumns > 1 ? styles.row : undefined}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      )}

      {role === "owner" && (
        <TouchableOpacity
          style={styles.fab}
          onPress={() => router.push("/add-person")}
        >
          <Text style={styles.fabText}>＋</Text>
        </TouchableOpacity>
      )}

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
                  <Image
                    source={{ uri: selected.facePhoto }}
                    style={styles.modalImage}
                  />
                  <Text style={styles.modalName}>{selected.username}</Text>
                  <Text style={styles.modalRole}>{selected.role}</Text>
                  <View
                    style={[
                      styles.modalBadge,
                      selected.isActive === true
                        ? styles.badgeVert
                        : styles.badgeRouge,
                    ]}
                  >
                    <Text
                      style={[
                        styles.modalBadgeText,
                        {
                          color:
                            selected.isActive === true
                              ? "#4ADE80"
                              : "#F87171",
                        },
                      ]}
                    >
                      {selected.isActive === true
                        ? "✓ Autorisé"
                        : "✗ Bloqué"}
                    </Text>
                  </View>
                </View>
                <View style={styles.modalInfoRow}>
                  <Text style={styles.modalInfoLabel}>Date détection</Text>
                  <Text style={styles.modalInfoValue}>
                    {selected.createdAt}
                  </Text>
                </View>
                <View style={styles.modalInfoRow}>
                  <Text style={styles.modalInfoLabel}>Rôle</Text>
                  <Text style={styles.modalInfoValue}>{selected.role}</Text>
                </View>
                <Text style={styles.modalSectionTitle}>Modifier le statut</Text>
                {
                  role === "owner" && selected.email !== user?.email && (
                    <View style={styles.modalBtnRow}>
                      <TouchableOpacity
                        style={[
                          styles.modalBtn,
                          selected.isActive === true &&
                          styles.modalBtnActiveVert,
                        ]}
                        onPress={() => toggleStatut(selected.id, true)}
                      >
                        <Text style={styles.modalBtnIcon}>✅</Text>
                        <Text
                          style={[
                            styles.modalBtnText,
                            selected.isActive === true && { color: "#4ADE80" },
                          ]}
                        >
                          Autoriser
                        </Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={[
                          styles.modalBtn,
                          selected.isActive === false &&
                          styles.modalBtnActiveRouge,
                        ]}
                        onPress={() => toggleStatut(selected.id, false)}
                      >
                        <Text style={styles.modalBtnIcon}>🚫</Text>
                        <Text
                          style={[
                            styles.modalBtnText,
                            selected.isActive === false && { color: "#F87171" },
                          ]}
                        >
                          Bloquer
                        </Text>
                      </TouchableOpacity>
                    </View>
                  )
                }
                {
                  selected.email !== user?.email && (
                    <TouchableOpacity
                      style={styles.modalInterphone}
                      onPress={() => {
                        setSelected(null);
                        router.push("/interphone");
                      }}
                    >
                      <Text style={styles.modalInterphoneIcon}>📞</Text>
                      <Text style={styles.modalInterphoneText}>
                        Parler via interphone
                      </Text>
                    </TouchableOpacity>
                  )
                }
                {
                  role === "owner" && selected.email !== user?.email && (
                    <TouchableOpacity
                      style={styles.modalDelete}
                      onPress={() => {
                        Alert.alert("Confirmer", `Supprimer ${selected.username} ?`, [
                          { text: "Annuler", style: "cancel" },
                          {
                            text: "Supprimer",
                            style: "destructive",
                            onPress: () => deletePerson(selected.id),
                          },
                        ]);
                      }}
                    >
                      <Text style={styles.modalDeleteText}>
                        🗑️ Supprimer cette personne
                      </Text>
                    </TouchableOpacity>
                  )
                }
                <TouchableOpacity
                  style={styles.modalClose}
                  onPress={() => setSelected(null)}
                >
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
  container: { flex: 1, backgroundColor: "#0D0D1A" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#2E2B52",
  },
  backBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: "#1A1A2E",
    borderWidth: 1,
    borderColor: "#2E2B52",
    alignItems: "center",
    justifyContent: "center",
  },
  backText: { color: "#A78BFA", fontSize: 18, fontWeight: "bold" },
  headerCenter: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    flex: 1,
    marginLeft: 10,
  },
  headerIconBox: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "#2D1B6B",
    borderWidth: 1,
    borderColor: "#7C3AED",
    alignItems: "center",
    justifyContent: "center",
  },
  headerIconText: { fontSize: 16 },
  headerTitle: { fontSize: 15, fontWeight: "bold", color: "#FFFFFF" },
  headerSub: { fontSize: 10, color: "#8A8FAB", letterSpacing: 0.6 },
  addBtn: {
    backgroundColor: "#7C3AED",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
  },
  addBtnText: { color: "#FFFFFF", fontSize: 13, fontWeight: "bold" },
  statsRow: {
    flexDirection: "row",
    backgroundColor: "#13132A",
    marginHorizontal: 14,
    marginTop: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#2E2B52",
    paddingVertical: 14,
    alignItems: "center",
  },
  statBox: { flex: 1, alignItems: "center" },
  statValue: { fontSize: 24, fontWeight: "bold", color: "#FFFFFF" },
  statLabel: {
    fontSize: 10,
    color: "#8A8FAB",
    marginTop: 2,
    letterSpacing: 0.6,
  },
  statDivider: { width: 1, height: 32, backgroundColor: "#2E2B52" },
  banner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: "#13132A",
    marginHorizontal: 14,
    marginTop: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#2E2B52",
    padding: 14,
  },
  bannerIconBox: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#2D1B6B",
    borderWidth: 1,
    borderColor: "#7C3AED",
    alignItems: "center",
    justifyContent: "center",
  },
  bannerIcon: { fontSize: 18 },
  bannerTitle: { fontSize: 14, fontWeight: "700", color: "#FFFFFF" },
  bannerSub: { fontSize: 11, color: "#8A8FAB", marginTop: 2 },
  bannerArrow: { color: "#A78BFA", fontSize: 22, fontWeight: "bold" },
  searchWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#13132A",
    borderWidth: 1,
    borderColor: "#2E2B52",
    borderRadius: 12,
    marginHorizontal: 14,
    marginTop: 12,
    paddingHorizontal: 14,
  },
  searchIcon: { fontSize: 16, marginRight: 8 },
  searchInput: { flex: 1, paddingVertical: 12, fontSize: 14, color: "#FFFFFF" },
  searchClear: { color: "#8A8FAB", fontSize: 14, padding: 4 },
  filtersRow: {
    flexDirection: "row",
    gap: 8,
    paddingHorizontal: 14,
    marginTop: 12,
    marginBottom: 4,
  },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: "#13132A",
    borderWidth: 1,
    borderColor: "#2E2B52",
  },
  filterChipActive: { backgroundColor: "#2D1B6B", borderColor: "#7C3AED" },
  filterChipText: { color: "#8A8FAB", fontSize: 13, fontWeight: "600" },
  filterChipTextActive: { color: "#A78BFA" },
  row: { justifyContent: "flex-start", gap: 8 },
  listContent: { paddingHorizontal: 14, paddingTop: 10, paddingBottom: 100 },
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#13132A",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#2E2B52",
    marginBottom: 10,
    padding: 12,
    gap: 12,
    position: "relative",
  },
  cardBloque: { borderColor: "#4B1515", backgroundColor: "#150E0E" },
  cardImage: { width: 58, height: 58, borderRadius: 12 },
  statutDot: {
    position: "absolute",
    top: 10,
    left: 58,
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: "#0D0D1A",
  },
  dotVert: { backgroundColor: "#4ADE80" },
  dotRouge: { backgroundColor: "#F87171" },
  cardInfo: { flex: 1, gap: 2 },
  cardName: { fontSize: 15, fontWeight: "bold", color: "#FFFFFF" },
  cardRole: { fontSize: 12, color: "#A78BFA", fontWeight: "600" },
  cardTime: { fontSize: 11, color: "#6B7A99", marginBottom: 6 },
  cardBtns: { flexDirection: "row", gap: 8 },
  cardBtn: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    backgroundColor: "#1A1A2E",
    borderWidth: 1,
    borderColor: "#2E2B52",
  },
  cardBtnActiveVert: { backgroundColor: "#0D2D1A", borderColor: "#16A34A" },
  cardBtnActiveRouge: { backgroundColor: "#2D1010", borderColor: "#EF4444" },
  cardBtnText: { fontSize: 12, color: "#8A8FAB", fontWeight: "600" },
  emptyState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingBottom: 80,
  },
  emptyIcon: { fontSize: 52, marginBottom: 14, opacity: 0.3 },
  emptyTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginBottom: 6,
  },
  emptySub: { fontSize: 13, color: "#8A8FAB", textAlign: "center" },
  fab: {
    position: "absolute",
    bottom: 90,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#7C3AED",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#7C3AED",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 8,
  },
  fabText: {
    color: "#FFFFFF",
    fontSize: 28,
    fontWeight: "bold",
    marginTop: -2,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.7)",
    justifyContent: "flex-end",
  },
  modalSheet: {
    backgroundColor: "#13132A",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderWidth: 1,
    borderColor: "#2E2B52",
    paddingHorizontal: 20,
    paddingBottom: 36,
    maxHeight: "85%",
  },
  modalBar: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#2E2B52",
    alignSelf: "center",
    marginTop: 12,
    marginBottom: 20,
  },
  modalHeader: { alignItems: "center", marginBottom: 20 },
  modalImage: {
    width: 90,
    height: 90,
    borderRadius: 45,
    borderWidth: 3,
    borderColor: "#7C3AED",
    marginBottom: 12,
  },
  modalName: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginBottom: 4,
  },
  modalRole: {
    fontSize: 13,
    color: "#A78BFA",
    marginBottom: 10,
    fontWeight: "600",
  },
  modalBadge: { paddingHorizontal: 14, paddingVertical: 5, borderRadius: 20 },
  badgeVert: { backgroundColor: "#0D2D1A" },
  badgeRouge: { backgroundColor: "#2D1010" },
  modalBadgeText: { fontSize: 13, fontWeight: "bold" },
  modalInfoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#2E2B52",
  },
  modalInfoLabel: { fontSize: 13, color: "#8A8FAB" },
  modalInfoValue: { fontSize: 13, color: "#FFFFFF", fontWeight: "600" },
  modalSectionTitle: {
    fontSize: 13,
    color: "#8A8FAB",
    fontWeight: "700",
    marginTop: 16,
    marginBottom: 10,
    letterSpacing: 0.6,
  },
  modalBtnRow: { flexDirection: "row", gap: 10, marginBottom: 14 },
  modalBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: "#1A1A2E",
    borderWidth: 1,
    borderColor: "#2E2B52",
  },
  modalBtnActiveVert: { backgroundColor: "#0D2D1A", borderColor: "#16A34A" },
  modalBtnActiveRouge: { backgroundColor: "#2D1010", borderColor: "#EF4444" },
  modalBtnIcon: { fontSize: 16 },
  modalBtnText: { fontSize: 14, fontWeight: "600", color: "#8A8FAB" },
  modalInterphone: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    backgroundColor: "#1E1040",
    borderWidth: 1,
    borderColor: "#7C3AED",
    borderRadius: 12,
    paddingVertical: 13,
    marginBottom: 10,
  },
  modalInterphoneIcon: { fontSize: 18 },
  modalInterphoneText: { color: "#A78BFA", fontSize: 15, fontWeight: "600" },
  modalDelete: { alignItems: "center", paddingVertical: 12, marginBottom: 10 },
  modalDeleteText: { color: "#F87171", fontSize: 14, fontWeight: "600" },
  modalClose: {
    backgroundColor: "#1A1A2E",
    borderWidth: 1,
    borderColor: "#2E2B52",
    borderRadius: 12,
    paddingVertical: 13,
    alignItems: "center",
  },
  modalCloseText: { color: "#8A8FAB", fontSize: 15, fontWeight: "600" },
});
