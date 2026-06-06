import { useRouter, useFocusEffect } from 'expo-router';
import { useState, useCallback } from 'react';
import {
  Alert, FlatList, StatusBar, StyleSheet, Text, TouchableOpacity, View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useResponsive } from '../../hooks/useResponsive';
import { useUser } from '../../contexts/UserContext';
import { API_URL } from '../../constants/api';

interface Alerte {
  id: string;
  type: 'critique' | 'info' | 'warning' | 'medical';
  icon: string;
  title: string;
  desc: string;
  time: string;
  date: string;
  lu: boolean;
}

const formatLogDate = (dateString: string) => {
  const date = new Date(dateString);
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);

  if (date.toDateString() === today.toDateString()) {
    return "Aujourd'hui";
  } else if (date.toDateString() === yesterday.toDateString()) {
    return "Hier";
  } else {
    return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' });
  }
};

const formatLogTime = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
};

const TYPE_CONFIG: Record<string, { bg: string; border: string; badgeBg: string; color: string; label: string }> = {
  critique: { bg: '#2D1010', border: '#7F1D1D', badgeBg: '#3B1515', color: '#F87171', label: 'Critique' },
  warning: { bg: '#1A1200', border: '#713F12', badgeBg: '#3D2000', color: '#FACC15', label: 'Attention' },
  info: { bg: '#0D1A0D', border: '#14532D', badgeBg: '#0D2D1A', color: '#4ADE80', label: 'Info' },
  medical: { bg: '#051A22', border: '#0E4A5A', badgeBg: '#071520', color: '#06B6D4', label: 'Médical' },
};

export default function Alertes() {
  const router = useRouter();
  const { token } = useUser();
  const [alerts, setAlerts] = useState<Alerte[]>([]);

  useFocusEffect(
    useCallback(() => {
      let isMounted = true;
      const fetchLogs = async () => {
        if (!token) return;
        try {
          const response = await fetch(`${API_URL}/auth/logs`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
          if (response.ok) {
            const data = await response.json();
            if (isMounted) {
              const formatted: Alerte[] = data.map((log: any) => {
                let type: 'critique' | 'info' | 'warning' | 'medical' = 'info';
                let icon = '✅';
                let title = 'Journal d\'activité';

                if (log.action === 'USER_JOINED_DEVICE') {
                  type = 'info';
                  icon = '🔌';
                  title = 'Dispositif rejoint';
                } else if (log.action === 'USER_ADDED_PERSON') {
                  type = 'medical';
                  icon = '👤';
                  title = 'Caregiver ajouté';
                } else if (log.action === 'USER_DELETED_PERSON') {
                  type = 'critique';
                  icon = '🚨';
                  title = 'Personne supprimée';
                }

                return {
                  id: log.id.toString(),
                  type,
                  icon,
                  title,
                  desc: log.details,
                  time: formatLogTime(log.createdAt),
                  date: formatLogDate(log.createdAt),
                  lu: false,
                };
              });
              setAlerts(formatted);
            }
          }
        } catch (error) {
          console.error("Fetch user logs error:", error);
        }
      };
      fetchLogs();
      return () => {
        isMounted = false;
      };
    }, [token])
  );
  const [filter, setFilter] = useState('tous');
  const { isDesktop } = useResponsive();

  const filtered = filter === 'tous' ? alerts : filter === 'nonlu' ? alerts.filter(a => !a.lu) : alerts.filter(a => a.type === filter);
  const nonLus = alerts.filter(a => !a.lu).length;
  const critiques = alerts.filter(a => a.type === 'critique').length;

  const markAsRead = (id: string) => setAlerts(prev => prev.map(a => a.id === id ? { ...a, lu: true } : a));
  const markAllRead = () => setAlerts(prev => prev.map(a => ({ ...a, lu: true })));
  const deleteAlert = (id: string) => setAlerts(prev => prev.filter(a => a.id !== id));
  const clearAll = () => {
    Alert.alert('Effacer tout', 'Supprimer toutes les alertes ?', [
      { text: 'Annuler', style: 'cancel' },
      { text: 'Confirmer', style: 'destructive', onPress: () => setAlerts([]) },
    ]);
  };

  const grouped = filtered.reduce((acc: Record<string, Alerte[]>, alert) => {
    if (!acc[alert.date]) acc[alert.date] = [];
    acc[alert.date].push(alert);
    return acc;
  }, {});

  const sections = Object.keys(grouped).map(date => ({ date, data: grouped[date] }));

  const renderAlert = (item: Alerte) => {
    const cfg = TYPE_CONFIG[item.type];
    return (
      <TouchableOpacity
        key={item.id}
        style={[styles.alertCard, { backgroundColor: cfg.bg, borderColor: cfg.border }, !item.lu && styles.alertCardUnread, isDesktop && { width: '24%' }]}
        onPress={() => markAsRead(item.id)}
        activeOpacity={0.85}
      >
        {!item.lu && <View style={[styles.unreadDot, { backgroundColor: cfg.color }]} />}
        <View style={[styles.alertIconBox, { backgroundColor: cfg.badgeBg }]}><Text style={styles.alertIconText}>{item.icon}</Text></View>
        <View style={styles.alertContent}>
          <View style={styles.alertTopRow}>
            <Text style={styles.alertTitle} numberOfLines={1}>{item.title}</Text>
            <View style={[styles.typeBadge, { backgroundColor: cfg.badgeBg }]}><Text style={[styles.typeBadgeText, { color: cfg.color }]}>{cfg.label}</Text></View>
          </View>
          <Text style={styles.alertDesc} numberOfLines={2}>{item.desc}</Text>
          <Text style={styles.alertTime}>{item.time}</Text>
        </View>
        <TouchableOpacity style={styles.deleteBtn} onPress={() => deleteAlert(item.id)}><Text style={styles.deleteBtnText}>✕</Text></TouchableOpacity>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0D0D1A" />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}><Text style={styles.backText}>←</Text></TouchableOpacity>
        <View style={styles.headerCenter}>
          <View style={styles.headerIconBox}><Text style={styles.headerIconText}>🔔</Text></View>
          <View><Text style={styles.headerTitle}>Alertes & Journal</Text><Text style={styles.headerSub}>ACCÈS À LA MAISON</Text></View>
        </View>
        {nonLus > 0 && <View style={styles.nonLuBadge}><Text style={styles.nonLuBadgeText}>{nonLus}</Text></View>}
      </View>

      <View style={styles.statsRow}>
        <View style={styles.statBox}><Text style={styles.statValue}>{alerts.length}</Text><Text style={styles.statLabel}>TOTAL</Text></View>
        <View style={styles.statDivider} />
        <View style={styles.statBox}><Text style={[styles.statValue, { color: '#F87171' }]}>{critiques}</Text><Text style={styles.statLabel}>CRITIQUES</Text></View>
        <View style={styles.statDivider} />
        <View style={styles.statBox}><Text style={[styles.statValue, { color: '#FACC15' }]}>{nonLus}</Text><Text style={styles.statLabel}>NON LUS</Text></View>
      </View>

      <View style={styles.actionsRow}>
        <TouchableOpacity style={styles.actionBtn} onPress={markAllRead}><Text style={styles.actionBtnText}>✓ Tout marquer lu</Text></TouchableOpacity>
        <TouchableOpacity style={[styles.actionBtn, styles.actionBtnDanger]} onPress={clearAll}><Text style={[styles.actionBtnText, { color: '#F87171' }]}>🗑️ Effacer tout</Text></TouchableOpacity>
      </View>

      <View style={styles.filtersRow}>
        {[{ id: 'tous', label: 'Tous' }, { id: 'nonlu', label: 'Non lus' }, { id: 'critique', label: 'Critiques' }, { id: 'medical', label: 'Médical' }, { id: 'info', label: 'Info' }].map(f => (
          <TouchableOpacity key={f.id} style={[styles.filterChip, filter === f.id && styles.filterChipActive]} onPress={() => setFilter(f.id)}>
            <Text style={[styles.filterChipText, filter === f.id && styles.filterChipTextActive]}>{f.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

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
              <View style={styles.dateSeparator}><View style={styles.dateLine} /><Text style={styles.dateLabel}>{section.date}</Text><View style={styles.dateLine} /></View>
              <View style={[isDesktop && { flexDirection: 'row', flexWrap: 'wrap', gap: 8 }]}>
                {section.data.map(alert => renderAlert(alert))}
              </View>
            </View>
          )}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0D0D1A' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 14, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#2E2B52' },
  backBtn: { width: 34, height: 34, borderRadius: 17, backgroundColor: '#1A1A2E', borderWidth: 1, borderColor: '#2E2B52', alignItems: 'center', justifyContent: 'center' },
  backText: { color: '#A78BFA', fontSize: 18, fontWeight: 'bold' },
  headerCenter: { flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1, marginLeft: 10 },
  headerIconBox: { width: 38, height: 38, borderRadius: 19, backgroundColor: '#2D1B6B', borderWidth: 1, borderColor: '#7C3AED', alignItems: 'center', justifyContent: 'center' },
  headerIconText: { fontSize: 16 },
  headerTitle: { fontSize: 15, fontWeight: 'bold', color: '#FFFFFF' },
  headerSub: { fontSize: 10, color: '#8A8FAB', letterSpacing: 0.6 },
  nonLuBadge: { backgroundColor: '#F87171', width: 24, height: 24, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  nonLuBadgeText: { color: '#FFFFFF', fontSize: 12, fontWeight: 'bold' },
  statsRow: { flexDirection: 'row', backgroundColor: '#13132A', marginHorizontal: 14, marginTop: 14, borderRadius: 14, borderWidth: 1, borderColor: '#2E2B52', paddingVertical: 14, alignItems: 'center' },
  statBox: { flex: 1, alignItems: 'center' },
  statValue: { fontSize: 22, fontWeight: 'bold', color: '#FFFFFF' },
  statLabel: { fontSize: 10, color: '#8A8FAB', marginTop: 2, letterSpacing: 0.6 },
  statDivider: { width: 1, height: 30, backgroundColor: '#2E2B52' },
  actionsRow: { flexDirection: 'row', gap: 10, paddingHorizontal: 14, marginTop: 12 },
  actionBtn: { flex: 1, paddingVertical: 10, borderRadius: 10, backgroundColor: '#13132A', borderWidth: 1, borderColor: '#2E2B52', alignItems: 'center' },
  actionBtnDanger: { borderColor: '#7F1D1D', backgroundColor: '#1A0808' },
  actionBtnText: { color: '#A78BFA', fontSize: 13, fontWeight: '600' },
  filtersRow: { flexDirection: 'row', gap: 8, paddingHorizontal: 14, marginTop: 12, marginBottom: 4, flexWrap: 'wrap' },
  filterChip: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, backgroundColor: '#13132A', borderWidth: 1, borderColor: '#2E2B52' },
  filterChipActive: { backgroundColor: '#2D1B6B', borderColor: '#7C3AED' },
  filterChipText: { color: '#8A8FAB', fontSize: 12, fontWeight: '600' },
  filterChipTextActive: { color: '#A78BFA' },
  listContent: { paddingHorizontal: 14, paddingTop: 8, paddingBottom: 40 },
  dateSeparator: { flexDirection: 'row', alignItems: 'center', gap: 10, marginVertical: 12 },
  dateLine: { flex: 1, height: 1, backgroundColor: '#2E2B52' },
  dateLabel: { color: '#8A8FAB', fontSize: 12, fontWeight: '600', letterSpacing: 0.4 },
  alertCard: { flexDirection: 'row', alignItems: 'center', borderRadius: 14, borderWidth: 1, padding: 12, marginBottom: 10, gap: 12, position: 'relative' },
  alertCardUnread: { shadowColor: '#7C3AED', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.2, shadowRadius: 6, elevation: 3 },
  unreadDot: { position: 'absolute', top: 12, left: 12, width: 8, height: 8, borderRadius: 4 },
  alertIconBox: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  alertIconText: { fontSize: 20 },
  alertContent: { flex: 1, gap: 3 },
  alertTopRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 },
  alertTitle: { fontSize: 14, fontWeight: 'bold', color: '#FFFFFF', flex: 1 },
  typeBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 20 },
  typeBadgeText: { fontSize: 10, fontWeight: 'bold' },
  alertDesc: { fontSize: 12, color: '#8A8FAB', lineHeight: 17 },
  alertTime: { fontSize: 11, color: '#6B7A99', marginTop: 2 },
  deleteBtn: { width: 28, height: 28, borderRadius: 14, backgroundColor: '#1A1A2E', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  deleteBtnText: { color: '#6B7A99', fontSize: 12, fontWeight: 'bold' },
  emptyState: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingBottom: 80 },
  emptyIcon: { fontSize: 52, marginBottom: 14, opacity: 0.3 },
  emptyTitle: { fontSize: 16, fontWeight: 'bold', color: '#FFFFFF', marginBottom: 6 },
  emptySub: { fontSize: 13, color: '#8A8FAB', textAlign: 'center' },
});
