import { Ionicons } from '@expo/vector-icons';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { api } from '../../constants/api';
import { useSocket } from '../../contexts/SocketContext';
import { useUser } from '../../contexts/UserContext';

interface LogEntry {
  id: number;
  action: string;
  details: string;
  createdAt: string;
  userId?: number;
}

type FilterType = 'all' | 'device' | 'person';

const ACTION_CONFIG: Record<string, { label: string; icon: string; color: string; bg: string }> = {
  USER_JOINED_DEVICE: {
    label: 'Device Joined',
    icon: 'hardware-chip-outline',
    color: '#06B6D4',
    bg: 'rgba(6,182,212,0.12)',
  },
  USER_ADDED_PERSON: {
    label: 'Person Added',
    icon: 'person-add-outline',
    color: '#4ADE80',
    bg: 'rgba(74,222,128,0.12)',
  },
  USER_DELETED_PERSON: {
    label: 'Person Removed',
    icon: 'person-remove-outline',
    color: '#F87171',
    bg: 'rgba(248,113,113,0.12)',
  },
  USER_CREATED: {
    label: 'Account Created',
    icon: 'shield-checkmark-outline',
    color: '#A78BFA',
    bg: 'rgba(167,139,250,0.12)',
  },
};

function LogCard({ log, isNew }: { log: LogEntry; isNew: boolean }) {
  const fadeAnim = useRef(new Animated.Value(isNew ? 0 : 1)).current;
  const slideAnim = useRef(new Animated.Value(isNew ? -20 : 0)).current;
  const glowAnim = useRef(new Animated.Value(isNew ? 1 : 0)).current;

  useEffect(() => {
    if (isNew) {
      Animated.parallel([
        Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }),
        Animated.timing(slideAnim, { toValue: 0, duration: 400, useNativeDriver: true }),
        Animated.sequence([
          Animated.timing(glowAnim, { toValue: 1, duration: 300, useNativeDriver: false }),
          Animated.delay(2500),
          Animated.timing(glowAnim, { toValue: 0, duration: 800, useNativeDriver: false }),
        ]),
      ]).start();
    }
  }, [isNew]);

  const config = ACTION_CONFIG[log.action] ?? {
    label: log.action,
    icon: 'ellipse-outline',
    color: '#8A8FAB',
    bg: 'rgba(138,143,171,0.1)',
  };

  const borderColor = glowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['#2E2B52', config.color],
  });

  return (
    <Animated.View
      style={[
        styles.logCard,
        { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
        { borderColor },
      ]}
    >
      {/* Icon */}
      <View style={[styles.logIconBox, { backgroundColor: config.bg }]}>
        <Ionicons name={config.icon as any} size={18} color={config.color} />
      </View>

      <View style={styles.logContent}>
        <View style={styles.logHeader}>
          <View style={[styles.logBadge, { backgroundColor: config.bg }]}>
            <Text style={[styles.logBadgeText, { color: config.color }]}>{config.label}</Text>
          </View>
          {isNew && (
            <View style={styles.newBadge}>
              <Text style={styles.newBadgeText}>NEW</Text>
            </View>
          )}
        </View>
        <Text style={styles.logDetails}>{log.details}</Text>
        <View style={styles.logFooter}>
          <Ionicons name="time-outline" size={11} color="#6B7A99" />
          <Text style={styles.logTime}>
            {new Date(log.createdAt).toLocaleString(undefined, {
              day: '2-digit', month: 'short', year: 'numeric',
              hour: '2-digit', minute: '2-digit',
            })}
          </Text>
        </View>
      </View>
    </Animated.View>
  );
}

export default function LogsScreen() {
  const { token } = useUser();
  const { socket, connected } = useSocket();

  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<FilterType>('all');
  const [newLogIds, setNewLogIds] = useState<Set<number>>(new Set());

  const fetchLogs = useCallback(async () => {
    if (!token) return;
    try {
      const res = await api.get('/auth/logs', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setLogs(res.data);
    } catch (err) {
      console.error('Failed to fetch logs:', err);
    }
  }, [token]);

  useEffect(() => {
    fetchLogs().finally(() => setLoading(false));
  }, [fetchLogs]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchLogs().finally(() => setRefreshing(false));
  }, [fetchLogs]);

  // Real-time: listen for new_log events from the server via WebSocket
  useEffect(() => {
    if (!socket) return;

    const handleNewLog = (newLog: LogEntry) => {
      setLogs((prev) => {
        // Avoid duplicates (e.g., if both USER_JOINED and list are same)
        if (prev.some((l) => l.id === newLog.id)) return prev;
        return [newLog, ...prev];
      });
      setNewLogIds((prev) => {
        const updated = new Set(prev);
        updated.add(newLog.id);
        // Auto-clear after 4 seconds
        setTimeout(() => {
          setNewLogIds((s) => {
            const next = new Set(s);
            next.delete(newLog.id);
            return next;
          });
        }, 4000);
        return updated;
      });
    };

    socket.on('new_log', handleNewLog);
    return () => {
      socket.off('new_log', handleNewLog);
    };
  }, [socket]);

  const filteredLogs = logs.filter((log) => {
    if (filter === 'device') return log.action === 'USER_JOINED_DEVICE';
    if (filter === 'person')
      return log.action === 'USER_ADDED_PERSON' || log.action === 'USER_DELETED_PERSON';
    return true;
  });

  const filters: { key: FilterType; label: string }[] = [
    { key: 'all', label: 'All' },
    { key: 'device', label: 'Device' },
    { key: 'person', label: 'Person' },
  ];

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.headerIconBox}>
            <Ionicons name="list-outline" size={18} color="#A78BFA" />
          </View>
          <View>
            <Text style={styles.headerTitle}>Activity Logs</Text>
            <Text style={styles.headerSub}>YOUR ACCOUNT HISTORY</Text>
          </View>
        </View>
        <View style={[styles.wsStatus, connected ? styles.wsConnected : styles.wsDisconnected]}>
          <View style={[styles.wsDot, connected ? styles.wsDotConnected : styles.wsDotDisconnected]} />
          <Text style={[styles.wsText, { color: connected ? '#4ADE80' : '#F87171' }]}>
            {connected ? 'LIVE' : 'OFFLINE'}
          </Text>
        </View>
      </View>

      {/* Filter Pills */}
      <View style={styles.filterRow}>
        {filters.map((f) => (
          <TouchableOpacity
            key={f.key}
            style={[styles.filterPill, filter === f.key && styles.filterPillActive]}
            onPress={() => setFilter(f.key)}
            activeOpacity={0.8}
          >
            <Text style={[styles.filterPillText, filter === f.key && styles.filterPillTextActive]}>
              {f.label}
            </Text>
          </TouchableOpacity>
        ))}
        <View style={styles.filterCount}>
          <Text style={styles.filterCountText}>{filteredLogs.length} events</Text>
        </View>
      </View>

      {/* Content */}
      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#A78BFA" />
          <Text style={styles.loadingText}>Loading activity history…</Text>
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#A78BFA" />
          }
        >
          {filteredLogs.length === 0 ? (
            <View style={styles.emptyState}>
              <View style={styles.emptyIconBox}>
                <Ionicons name="document-text-outline" size={36} color="#4B5563" />
              </View>
              <Text style={styles.emptyTitle}>No Activity Yet</Text>
              <Text style={styles.emptyText}>
                Actions like joining a device or adding a person will appear here in real time.
              </Text>
            </View>
          ) : (
            <View style={styles.timeline}>
              {/* Vertical trail line */}
              <View style={styles.timelineTrail} />
              {filteredLogs.map((log) => (
                <LogCard key={log.id} log={log} isNew={newLogIds.has(log.id)} />
              ))}
            </View>
          )}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0D0D1A' },

  // Header
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 14,
    borderBottomWidth: 1, borderBottomColor: '#1E1B3A',
  },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  headerIconBox: {
    width: 38, height: 38, borderRadius: 19, backgroundColor: '#1E1040',
    borderWidth: 1, borderColor: '#4C1D95', alignItems: 'center', justifyContent: 'center',
  },
  headerTitle: { fontSize: 16, fontWeight: 'bold', color: '#FFFFFF' },
  headerSub: { fontSize: 10, color: '#6B7A99', letterSpacing: 0.8, marginTop: 1 },

  // WebSocket status
  wsStatus: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20, borderWidth: 1,
  },
  wsConnected: { backgroundColor: 'rgba(74,222,128,0.08)', borderColor: 'rgba(74,222,128,0.3)' },
  wsDisconnected: { backgroundColor: 'rgba(248,113,113,0.08)', borderColor: 'rgba(248,113,113,0.3)' },
  wsDot: { width: 6, height: 6, borderRadius: 3 },
  wsDotConnected: { backgroundColor: '#4ADE80' },
  wsDotDisconnected: { backgroundColor: '#F87171' },
  wsText: { fontSize: 10, fontWeight: 'bold', letterSpacing: 0.5 },

  // Filter
  filterRow: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    paddingHorizontal: 16, paddingVertical: 12,
  },
  filterPill: {
    paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20,
    backgroundColor: '#13132A', borderWidth: 1, borderColor: '#2E2B52',
  },
  filterPillActive: { backgroundColor: '#2D1B6B', borderColor: '#7C3AED' },
  filterPillText: { fontSize: 12, fontWeight: '600', color: '#6B7A99' },
  filterPillTextActive: { color: '#A78BFA' },
  filterCount: { marginLeft: 'auto', paddingHorizontal: 10, paddingVertical: 5,
    backgroundColor: '#1A1A2E', borderRadius: 20, borderWidth: 1, borderColor: '#2E2B52' },
  filterCountText: { fontSize: 11, color: '#6B7A99', fontWeight: '600' },

  // Timeline
  scrollContent: { padding: 16, paddingBottom: 40 },
  timeline: { position: 'relative' },
  timelineTrail: {
    position: 'absolute', left: 18, top: 0, bottom: 0,
    width: 2, backgroundColor: '#1E1B3A',
  },

  // Log card
  logCard: {
    flexDirection: 'row', gap: 12, backgroundColor: '#13132A',
    borderRadius: 16, borderWidth: 1, padding: 14, marginBottom: 14, marginLeft: 10,
  },
  logIconBox: {
    width: 38, height: 38, borderRadius: 19, alignItems: 'center', justifyContent: 'center',
    flexShrink: 0,
  },
  logContent: { flex: 1 },
  logHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 6 },
  logBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 20 },
  logBadgeText: { fontSize: 10, fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: 0.5 },
  newBadge: {
    backgroundColor: '#4ADE80', paddingHorizontal: 7, paddingVertical: 2, borderRadius: 20,
  },
  newBadgeText: { color: '#022C22', fontSize: 9, fontWeight: 'bold', letterSpacing: 0.5 },
  logDetails: { fontSize: 13, color: '#C8CCE0', lineHeight: 19, marginBottom: 8 },
  logFooter: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  logTime: { fontSize: 11, color: '#6B7A99', fontFamily: 'monospace' },

  // Empty state
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12, paddingTop: 80 },
  loadingText: { color: '#6B7A99', fontSize: 13, marginTop: 8 },
  emptyState: { alignItems: 'center', justifyContent: 'center', paddingTop: 60, gap: 12 },
  emptyIconBox: {
    width: 72, height: 72, borderRadius: 36, backgroundColor: '#13132A',
    borderWidth: 1, borderColor: '#2E2B52', alignItems: 'center', justifyContent: 'center',
    marginBottom: 8,
  },
  emptyTitle: { fontSize: 17, fontWeight: 'bold', color: '#FFFFFF' },
  emptyText: { fontSize: 13, color: '#6B7A99', textAlign: 'center', maxWidth: 280, lineHeight: 20 },
});
