import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
  Alert,
  FlatList,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { Colors } from '@/constants/theme';

interface AlertItem {
  id: string;
  type: 'critique' | 'warning' | 'info' | 'medical';
  icon: string;
  title: string;
  desc: string;
  time: string;
  date: string;
  lu: boolean;
}

const MOCK_ALERTS: AlertItem[] = [
  { id: 'a1', type: 'critique', icon: '⚠️', title: 'Visiteur suspect détecté', desc: 'Personne inconnue à l\'entrée principale', time: 'Il y a 5 min', date: "Aujourd'hui", lu: false },
  { id: 'a2', type: 'info', icon: '✅', title: 'Accès autorisé', desc: 'Dr. Paul Renard a accédé au domicile', time: 'Il y a 2h', date: "Aujourd'hui", lu: false },
  { id: 'a3', type: 'warning', icon: '🔒', title: 'Tentative d\'accès refusée', desc: 'Badge inconnu utilisé à la porte', time: 'Il y a 3h', date: "Aujourd'hui", lu: true },
  { id: 'a4', type: 'medical', icon: '🏥', title: 'Caméra médicale activée', desc: 'Activée par infirmière Sophie Laurent', time: '14:05', date: 'Hier', lu: true },
  { id: 'a5', type: 'critique', icon: '🚨', title: 'Tentative d\'intrusion', desc: 'Détection mouvement zone extérieure', time: '23:12', date: 'Hier', lu: true },
  { id: 'a6', type: 'info', icon: '✅', title: 'Porte verrouillée', desc: 'Serrure connectée verrouillée à distance', time: '20:30', date: 'Hier', lu: true },
  { id: 'a7', type: 'warning', icon: '📷', title: 'Caméra hors ligne', desc: 'Caméra Salon déconnectée', time: '10:00', date: '19 Mars', lu: true },
  { id: 'a8', type: 'medical', icon: '⚕️', title: 'Intervention médicale', desc: 'Accès prioritaire accordé aux secours', time: '08:45', date: '18 Mars', lu: true },
];

const TYPE_CONFIG = {
  critique: { bg: Colors.dangerMuted, border: '#7F1D1D', badgeBg: '#3B1515', color: Colors.danger, label: 'Critique' },
  warning: { bg: Colors.warningMuted, border: Colors.warningBorder, badgeBg: '#3D2000', color: Colors.warning, label: 'Attention' },
  info: { bg: Colors.successMuted, border: Colors.successBorder, badgeBg: '#0D2D1A', color: Colors.success, label: 'Info' },
  medical: { bg: Colors.infoMuted, border: Colors.infoBorder, badgeBg: '#071520', color: Colors.info, label: 'Médical' },
};

export default function Alertes() {
  const router = useRouter();

  const [alerts, setAlerts] = useState<AlertItem[]>(MOCK_ALERTS);
  const [filter, setFilter] = useState<'tous' | 'nonlu' | 'critique' | 'warning' | 'info' | 'medical'>('tous');

  const filtered = filter === 'tous'
    ? alerts
    : filter === 'nonlu'
    ? alerts.filter(a => !a.lu)
    : alerts.filter(a => a.type === filter);

  const nonLus = alerts.filter(a => !a.lu).length;
  const critiques = alerts.filter(a => a.type === 'critique').length;

  const markAsRead = (id: string) => {
    setAlerts(prev => prev.map(a => a.id === id ? { ...a, lu: true } : a));
  };

  const markAllRead = () => {
    setAlerts(prev => prev.map(a => ({ ...a, lu: true })));
  };

  const deleteAlert = (id: string) => {
    setAlerts(prev => prev.filter(a => a.id !== id));
  };

  const clearAll = () => {
    Alert.alert(
      'Effacer tout',
      'Supprimer toutes les alertes ?',
      [
        { text: 'Annuler', style: 'cancel' },
        { text: 'Confirmer', style: 'destructive', onPress: () => setAlerts([]) },
      ]
    );
  };

  const grouped = filtered.reduce((acc: { [key: string]: AlertItem[] }, alert) => {
    if (!acc[alert.date]) acc[alert.date] = [];
    acc[alert.date].push(alert);
    return acc;
  }, {});

  const sections = Object.keys(grouped).map(date => ({
    date,
    data: grouped[date],
  }));

  const renderAlert = (item: AlertItem) => {
    const cfg = TYPE_CONFIG[item.type];
    return (
      <TouchableOpacity
        key={item.id}
        style={[
          styles.alertCard,
          { backgroundColor: cfg.bg, borderColor: cfg.border },
          !item.lu && styles.alertCardUnread,
        ]}
        onPress={() => markAsRead(item.id)}
        activeOpacity={0.85}
      >
        {!item.lu && <View style={[styles.unreadDot, { backgroundColor: cfg.color }]} />}

        <View style={[styles.alertIconBox, { backgroundColor: cfg.badgeBg }]}>
          <Text style={styles.alertIconText}>{item.icon}</Text>
        </View>

        <View style={styles.alertContent}>
          <View style={styles.alertTopRow}>
            <Text style={styles.alertTitle} numberOfLines={1}>{item.title}</Text>
            <View style={[styles.typeBadge, { backgroundColor: cfg.badgeBg }]}>
              <Text style={[styles.typeBadgeText, { color: cfg.color }]}>{cfg.label}</Text>
            </View>
          </View>
          <Text style={styles.alertDesc} numberOfLines={2}>{item.desc}</Text>
          <Text style={styles.alertTime}>{item.time}</Text>
        </View>

        <TouchableOpacity
          style={styles.deleteBtn}
          onPress={() => deleteAlert(item.id)}
        >
          <Text style={styles.deleteBtnText}>✕</Text>
        </TouchableOpacity>
      </TouchableOpacity>
    );
  };

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
            <Text style={styles.headerIconText}>🔔</Text>
          </View>
          <View>
            <Text style={styles.headerTitle}>Alertes & Journal</Text>
            <Text style={styles.headerSub}>ACCÈS À LA MAISON</Text>
          </View>
        </View>

        {nonLus > 0 && (
          <View style={styles.nonLuBadge}>
            <Text style={styles.nonLuBadgeText}>{nonLus}</Text>
          </View>
        )}
      </View>

      {/* Stats */}
      <View style={styles.statsRow}>
        <View style={styles.statBox}>
          <Text style={styles.statValue}>{alerts.length}</Text>
          <Text style={styles.statLabel}>TOTAL</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statBox}>
          <Text style={[styles.statValue, { color: Colors.danger }]}>{critiques}</Text>
          <Text style={styles.statLabel}>CRITIQUES</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statBox}>
          <Text style={[styles.statValue, { color: Colors.warning }]}>{nonLus}</Text>
          <Text style={styles.statLabel}>NON LUS</Text>
        </View>
      </View>

      {/* Actions rapides */}
      <View style={styles.actionsRow}>
        <TouchableOpacity style={styles.actionBtn} onPress={markAllRead}>
          <Text style={styles.actionBtnText}>✓ Tout marquer lu</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.actionBtn, styles.actionBtnDanger]} onPress={clearAll}>
          <Text style={[styles.actionBtnText, { color: Colors.danger }]}>🗑️ Effacer tout</Text>
        </TouchableOpacity>
      </View>

      {/* Filtres */}
      <View style={styles.filtersRow}>
        {[
          { id: 'tous',     label: 'Tous'     },
          { id: 'nonlu',    label: 'Non lus'  },
          { id: 'critique', label: 'Critiques'},
          { id: 'medical',  label: 'Médical'  },
          { id: 'info',     label: 'Info'     },
        ].map(f => (
          <TouchableOpacity
            key={f.id}
            style={[styles.filterChip, filter === f.id && styles.filterChipActive]}
            onPress={() => setFilter(f.id as any)}
          >
            <Text style={[styles.filterChipText, filter === f.id && styles.filterChipTextActive]}>
              {f.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Liste groupée par date */}
      {sections.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyIcon}>🔔</Text>
          <Text style={styles.emptyTitle}>Aucune alerte</Text>
          <Text style={styles.emptySub}>Toutes les alertes ont été effacées</Text>
        </View>
      ) : (
        <FlatList
          data={sections}
          keyExtractor={item => item.date}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          renderItem={({ item: section }) => (
            <View>
              <View style={styles.dateSeparator}>
                <View style={styles.dateLine} />
                <Text style={styles.dateLabel}>{section.date}</Text>
                <View style={styles.dateLine} />
              </View>
              {section.data.map(alert => renderAlert(alert))}
            </View>
          )}
        />
      )}
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
  nonLuBadge: { backgroundColor: Colors.danger, width: 24, height: 24, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  nonLuBadgeText: { color: Colors.text, fontSize: 12, fontWeight: 'bold' },
  statsRow: { flexDirection: 'row', backgroundColor: Colors.card, marginHorizontal: 14, marginTop: 14, borderRadius: 14, borderWidth: 1, borderColor: Colors.border, paddingVertical: 14, alignItems: 'center' },
  statBox: { flex: 1, alignItems: 'center' },
  statValue: { fontSize: 22, fontWeight: 'bold', color: Colors.text },
  statLabel: { fontSize: 10, color: Colors.textMuted, marginTop: 2, letterSpacing: 0.6 },
  statDivider: { width: 1, height: 30, backgroundColor: Colors.border },
  actionsRow: { flexDirection: 'row', gap: 10, paddingHorizontal: 14, marginTop: 12 },
  actionBtn: { flex: 1, paddingVertical: 10, borderRadius: 10, backgroundColor: Colors.card, borderWidth: 1, borderColor: Colors.border, alignItems: 'center' },
  actionBtnDanger: { borderColor: '#7F1D1D', backgroundColor: '#1A0808' },
  actionBtnText: { color: Colors.accent, fontSize: 13, fontWeight: '600' },
  filtersRow: { flexDirection: 'row', gap: 8, paddingHorizontal: 14, marginTop: 12, marginBottom: 4, flexWrap: 'wrap' },
  filterChip: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, backgroundColor: Colors.card, borderWidth: 1, borderColor: Colors.border },
  filterChipActive: { backgroundColor: Colors.accentMuted, borderColor: Colors.primary },
  filterChipText: { color: Colors.textMuted, fontSize: 12, fontWeight: '600' },
  filterChipTextActive: { color: Colors.accent },
  listContent: { paddingHorizontal: 14, paddingTop: 8, paddingBottom: 40 },
  dateSeparator: { flexDirection: 'row', alignItems: 'center', gap: 10, marginVertical: 12 },
  dateLine: { flex: 1, height: 1, backgroundColor: Colors.border },
  dateLabel: { color: Colors.textMuted, fontSize: 12, fontWeight: '600', letterSpacing: 0.4 },
  alertCard: { flexDirection: 'row', alignItems: 'center', borderRadius: 14, borderWidth: 1, padding: 12, marginBottom: 10, gap: 12, position: 'relative' },
  alertCardUnread: { shadowColor: Colors.primary, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.2, shadowRadius: 6, elevation: 3 },
  unreadDot: { position: 'absolute', top: 12, left: 12, width: 8, height: 8, borderRadius: 4 },
  alertIconBox: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  alertIconText: { fontSize: 20 },
  alertContent: { flex: 1, gap: 3 },
  alertTopRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 },
  alertTitle: { fontSize: 14, fontWeight: 'bold', color: Colors.text, flex: 1 },
  typeBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 20 },
  typeBadgeText: { fontSize: 10, fontWeight: 'bold' },
  alertDesc: { fontSize: 12, color: Colors.textMuted, lineHeight: 17 },
  alertTime: { fontSize: 11, color: Colors.textSubtle, marginTop: 2 },
  deleteBtn: { width: 28, height: 28, borderRadius: 14, backgroundColor: Colors.primaryMuted, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  deleteBtnText: { color: Colors.textSubtle, fontSize: 12, fontWeight: 'bold' },
  emptyState: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingBottom: 80 },
  emptyIcon: { fontSize: 52, marginBottom: 14, opacity: 0.3 },
  emptyTitle: { fontSize: 16, fontWeight: 'bold', color: Colors.text, marginBottom: 6 },
  emptySub: { fontSize: 13, color: Colors.textMuted, textAlign: 'center' },
});
