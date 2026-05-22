import { useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import {
  Alert, Animated,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { Colors } from '@/constants/theme';

interface Contact {
  id: string;
  name: string;
  role: string;
  icon: string;
  type: 'interphone' | 'medecin' | 'famille' | 'infirmier' | 'urgence';
}

interface HistoriqueItem {
  id: string;
  name: string;
  icon: string;
  duree: string;
  time: string;
  type: 'entrant' | 'sortant' | 'manque';
}

const CONTACTS: Contact[] = [
  { id: 'p1', name: 'Entrée principale', role: 'Interphone porte', icon: '🏠', type: 'interphone' },
  { id: 'p2', name: 'Dr. Paul Renard', role: 'Médecin traitant', icon: '⚕️', type: 'medecin' },
  { id: 'p3', name: 'Marie Dubois', role: 'Famille — Fille', icon: '👤', type: 'famille' },
  { id: 'p4', name: 'Sophie Laurent', role: 'Infirmière', icon: '👩‍⚕️', type: 'infirmier' },
  { id: 'p5', name: 'SAMU — Urgences', role: 'Urgence médicale', icon: '🚑', type: 'urgence' },
];

const HISTORIQUE: HistoriqueItem[] = [
  { id: 'h1', name: 'Marie Dubois', icon: '👤', duree: '3 min 22s', time: "Aujourd'hui 10:14", type: 'entrant' },
  { id: 'h2', name: 'Dr. Paul Renard', icon: '⚕️', duree: '7 min 05s', time: "Aujourd'hui 09:30", type: 'sortant' },
  { id: 'h3', name: 'Entrée principale', icon: '🏠', duree: '0 min 45s', time: 'Hier 23:15', type: 'manque' },
  { id: 'h4', name: 'Sophie Laurent', icon: '👩‍⚕️', duree: '5 min 10s', time: 'Hier 14:02', type: 'entrant' },
];

export default function Interphone() {
  const router = useRouter();

  const [callState, setCallState] = useState<'idle' | 'ringing' | 'connected'>('idle');
  const [target, setTarget] = useState<Contact | null>(null);
  const [muted, setMuted] = useState(false);
  const [camOn, setCamOn] = useState(true);
  const [elapsed, setElapsed] = useState(0);
  const [tab, setTab] = useState<'appel' | 'historique'>('appel');

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const ringPulse = useRef(new Animated.Value(1)).current;
  const ringAnim = useRef<Animated.CompositeAnimation | null>(null);

  useEffect(() => {
    if (callState === 'connected') {
      timerRef.current = setInterval(() => setElapsed(s => s + 1), 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
      setElapsed(0);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [callState]);

  useEffect(() => {
    if (callState === 'ringing') {
      ringAnim.current = Animated.loop(
        Animated.sequence([
          Animated.timing(ringPulse, { toValue: 1.15, duration: 500, useNativeDriver: true }),
          Animated.timing(ringPulse, { toValue: 1.0, duration: 500, useNativeDriver: true }),
        ])
      );
      ringAnim.current.start();
    } else {
      ringAnim.current?.stop();
      ringPulse.setValue(1);
    }
  }, [callState]);

  const formatTime = (s: number) =>
    `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;

  const startCall = (contact: Contact) => {
    setTarget(contact);
    setCallState('ringing');
    setTimeout(() => setCallState('connected'), 2500);
  };

  const endCall = () => {
    setCallState('idle');
    setTarget(null);
    setMuted(false);
    setCamOn(true);
  };

  const handleUrgence = () => {
    Alert.alert(
      '🚨 Protocole urgence médicale',
      'Déclencher le protocole d\'urgence ?\n\n• SAMU alerté\n• Accès temporaire sécurisé accordé\n• Caméra intérieure activée\n• Journal d\'audit créé',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: '🚨 Confirmer', style: 'destructive',
          onPress: () => Alert.alert('✅ Protocole activé', 'Les secours ont été alertés.\nAccès temporaire accordé.'),
        },
      ]
    );
  };

  const openDoor = () => {
    Alert.alert('🔓 Porte ouverte', 'Serrure déverrouillée à distance depuis l\'appel.');
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.background} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => { endCall(); router.back(); }}
          style={styles.backBtn}
        >
          <Text style={styles.backText}>←</Text>
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <View style={styles.headerIconBox}>
            <Text style={styles.headerIconText}>📞</Text>
          </View>
          <View>
            <Text style={styles.headerTitle}>Interphone</Text>
            <Text style={styles.headerSub}>COMMUNICATION À DISTANCE</Text>
          </View>
        </View>
        <View style={styles.secBadge}>
          <Text style={styles.secBadgeText}>🔒 E2E</Text>
        </View>
      </View>

      {/* Appel actif */}
      {callState !== 'idle' && (
        <View style={styles.activeCallContainer}>
          <Animated.View style={[
            styles.callAvatarRing,
            callState === 'ringing' && { transform: [{ scale: ringPulse }] }
          ]}>
            <View style={styles.callAvatar}>
              <Text style={styles.callAvatarIcon}>{target?.icon}</Text>
            </View>
          </Animated.View>

          <Text style={styles.callName}>{target?.name}</Text>
          <Text style={styles.callRole}>{target?.role}</Text>

          <View style={[
            styles.callStatusBadge,
            callState === 'ringing' ? styles.callStatusRinging : styles.callStatusConnected
          ]}>
            <Text style={[
              styles.callStatusText,
              { color: callState === 'ringing' ? Colors.warning : Colors.success }
            ]}>
              {callState === 'ringing' ? '⏳ Connexion en cours...' : `✅ Connecté · ${formatTime(elapsed)}`}
            </Text>
          </View>

          {callState === 'connected' && (
            <>
              {/* Zone vidéo */}
              <View style={styles.videoZone}>
                <View style={[styles.videoMain, !camOn && styles.videoOff]}>
                  {camOn ? (
                    <>
                      <Text style={styles.videoIcon}>📹</Text>
                      <Text style={styles.videoText}>Flux vidéo actif</Text>
                    </>
                  ) : (
                    <>
                      <Text style={styles.videoIcon}>🚫</Text>
                      <Text style={styles.videoText}>Caméra désactivée</Text>
                    </>
                  )}
                </View>
                <View style={styles.selfView}>
                  <Text style={styles.selfViewIcon}>🤳</Text>
                </View>
              </View>

              {/* Contrôles en appel */}
              <View style={styles.callControls}>
                <TouchableOpacity
                  style={[styles.callCtrlBtn, muted && styles.callCtrlBtnActive]}
                  onPress={() => setMuted(!muted)}
                >
                  <Text style={styles.callCtrlIcon}>{muted ? '🔇' : '🎙️'}</Text>
                  <Text style={[styles.callCtrlLabel, muted && { color: Colors.danger }]}>
                    {muted ? 'Muet' : 'Micro'}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.hangupBtn} onPress={endCall}>
                  <Text style={styles.hangupIcon}>📵</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.callCtrlBtn, !camOn && styles.callCtrlBtnActive]}
                  onPress={() => setCamOn(!camOn)}
                >
                  <Text style={styles.callCtrlIcon}>{camOn ? '📷' : '🚫'}</Text>
                  <Text style={[styles.callCtrlLabel, !camOn && { color: Colors.danger }]}>
                    {camOn ? 'Caméra' : 'Arrêtée'}
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Ouvrir porte pendant appel */}
              <View style={styles.callDoorRow}>
                <TouchableOpacity style={styles.callDoorBtnOpen} onPress={openDoor}>
                  <Text style={styles.callDoorIcon}>🔓</Text>
                  <Text style={[styles.callDoorLabel, { color: Colors.success }]}>Ouvrir la porte</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.callDoorBtnLock}
                  onPress={() => Alert.alert('🔒 Porte verrouillée', 'Serrure verrouillée depuis l\'appel.')}
                >
                  <Text style={styles.callDoorIcon}>🔒</Text>
                  <Text style={[styles.callDoorLabel, { color: Colors.danger }]}>Verrouiller</Text>
                </TouchableOpacity>
              </View>
            </>
          )}

          {callState === 'ringing' && (
            <TouchableOpacity style={styles.hangupBtnFull} onPress={endCall}>
              <Text style={styles.hangupBtnFullText}>📵  Annuler</Text>
            </TouchableOpacity>
          )}
        </View>
      )}

      {/* Écran idle */}
      {callState === 'idle' && (
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.infoCard}>
            <Text style={styles.infoCardTitle}>📡 Communication sécurisée à distance</Text>
            <Text style={styles.infoCardText}>
              WebRTC chiffré bout-en-bout. Connectez-vous depuis n'importe quel pays avec votre téléphone mobile.
            </Text>
            <View style={styles.infoSecRow}>
              <View style={styles.secDot} />
              <Text style={styles.infoSecText}>Connexion chiffrée AES-256</Text>
            </View>
          </View>

          {/* Tabs */}
          <View style={styles.tabsRow}>
            <TouchableOpacity
              style={[styles.tabBtn, tab === 'appel' && styles.tabBtnActive]}
              onPress={() => setTab('appel')}
            >
              <Text style={[styles.tabBtnText, tab === 'appel' && styles.tabBtnTextActive]}>
                📞 Appeler
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.tabBtn, tab === 'historique' && styles.tabBtnActive]}
              onPress={() => setTab('historique')}
            >
              <Text style={[styles.tabBtnText, tab === 'historique' && styles.tabBtnTextActive]}>
                🕐 Historique
              </Text>
            </TouchableOpacity>
          </View>

          {/* Tab Appeler */}
          {tab === 'appel' && (
            <>
              {CONTACTS.map(contact => (
                <TouchableOpacity
                  key={contact.id}
                  style={[
                    styles.contactCard,
                    contact.type === 'urgence' && styles.contactCardUrgence,
                  ]}
                  onPress={() =>
                    contact.type === 'urgence' ? handleUrgence() : startCall(contact)
                  }
                  activeOpacity={0.8}
                >
                  <View style={[
                    styles.contactIconBox,
                    contact.type === 'urgence' && styles.contactIconBoxUrgence,
                    contact.type === 'medecin' && styles.contactIconBoxMedecin,
                  ]}>
                    <Text style={styles.contactIcon}>{contact.icon}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.contactName}>{contact.name}</Text>
                    <Text style={[
                      styles.contactRole,
                      contact.type === 'urgence' && { color: Colors.danger },
                    ]}>
                      {contact.type === 'urgence' ? '🚨 Urgence médicale' : contact.role}
                    </Text>
                  </View>
                  <View style={[
                    styles.callIconBtn,
                    contact.type === 'urgence' && styles.callIconBtnUrgence,
                  ]}>
                    <Text style={styles.callIconBtnText}>
                      {contact.type === 'urgence' ? '🚨' : '📞'}
                    </Text>
                  </View>
                </TouchableOpacity>
              ))}

              <View style={styles.urgenceCard}>
                <Text style={styles.urgenceCardTitle}>🔐 Protocole Urgence Médicale</Text>
                <Text style={styles.urgenceCardText}>
                  En cas d'urgence, les secours obtiennent un accès temporaire sécurisé
                  avec activation automatique de la caméra et communication directe avec le patient.
                </Text>
                <TouchableOpacity style={styles.urgenceBtn} onPress={handleUrgence}>
                  <Text style={styles.urgenceBtnText}>🚨  Déclencher protocole urgence</Text>
                </TouchableOpacity>
              </View>
            </>
          )}

          {tab === 'historique' && (
            <>
              {HISTORIQUE.map(item => (
                <View key={item.id} style={styles.histCard}>
                  <View style={[
                    styles.histIconBox,
                    item.type === 'manque' && styles.histIconBoxManque,
                  ]}>
                    <Text style={styles.histIcon}>{item.icon}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.histName}>{item.name}</Text>
                    <Text style={styles.histTime}>{item.time}</Text>
                  </View>
                  <View style={{ alignItems: 'flex-end', gap: 4 }}>
                    <View style={[
                      styles.histTypeBadge,
                      item.type === 'entrant' && styles.histTypeEntrant,
                      item.type === 'sortant' && styles.histTypeSortant,
                      item.type === 'manque' && styles.histTypeManque,
                    ]}>
                      <Text style={[
                        styles.histTypeText,
                        item.type === 'entrant' && { color: Colors.success },
                        item.type === 'sortant' && { color: Colors.accent },
                        item.type === 'manque' && { color: Colors.danger },
                      ]}>
                        {item.type === 'entrant' ? '↙ Entrant' : item.type === 'sortant' ? '↗ Sortant' : '✗ Manqué'}
                      </Text>
                    </View>
                    <Text style={styles.histDuree}>{item.duree}</Text>
                  </View>
                </View>
              ))}
            </>
          )}

        </ScrollView>
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
  secBadge: { backgroundColor: Colors.successMuted, borderWidth: 1, borderColor: Colors.successBorder, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20 },
  secBadgeText: { color: Colors.success, fontSize: 11, fontWeight: 'bold' },
  activeCallContainer: { flex: 1, alignItems: 'center', paddingHorizontal: 20, paddingTop: 30, paddingBottom: 20 },
  callAvatarRing: { width: 100, height: 100, borderRadius: 50, backgroundColor: Colors.accentMuted, borderWidth: 2, borderColor: Colors.primary, alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
  callAvatar: { width: 80, height: 80, borderRadius: 40, backgroundColor: Colors.primaryMuted, alignItems: 'center', justifyContent: 'center' },
  callAvatarIcon: { fontSize: 36 },
  callName: { fontSize: 22, fontWeight: 'bold', color: Colors.text, marginBottom: 4 },
  callRole: { fontSize: 13, color: Colors.accent, marginBottom: 12, fontWeight: '600' },
  callStatusBadge: { paddingHorizontal: 16, paddingVertical: 6, borderRadius: 20, marginBottom: 20 },
  callStatusRinging: { backgroundColor: Colors.warningMuted, borderWidth: 1, borderColor: Colors.warningBorder },
  callStatusConnected: { backgroundColor: Colors.successMuted, borderWidth: 1, borderColor: Colors.successBorder },
  callStatusText: { fontSize: 13, fontWeight: 'bold' },
  videoZone: { width: '100%', height: 180, borderRadius: 16, overflow: 'hidden', marginBottom: 16, position: 'relative', backgroundColor: '#070C14', borderWidth: 1, borderColor: Colors.border },
  videoMain: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 6 },
  videoOff: { backgroundColor: '#0A0A0A' },
  videoIcon: { fontSize: 36 },
  videoText: { color: Colors.textMuted, fontSize: 12 },
  selfView: { position: 'absolute', bottom: 8, right: 8, width: 60, height: 80, borderRadius: 10, backgroundColor: Colors.card, borderWidth: 1, borderColor: Colors.border, alignItems: 'center', justifyContent: 'center' },
  selfViewIcon: { fontSize: 22 },
  callControls: { flexDirection: 'row', alignItems: 'center', gap: 16, marginBottom: 16, width: '100%', justifyContent: 'center' },
  callCtrlBtn: { alignItems: 'center', gap: 4, backgroundColor: Colors.card, borderWidth: 1, borderColor: Colors.border, borderRadius: 14, paddingHorizontal: 16, paddingVertical: 12, minWidth: 72 },
  callCtrlBtnActive: { backgroundColor: '#1A0D0D', borderColor: Colors.dangerBorder },
  callCtrlIcon: { fontSize: 22 },
  callCtrlLabel: { color: Colors.textSecondary, fontSize: 11, fontWeight: '600' },
  hangupBtn: { width: 64, height: 64, borderRadius: 32, backgroundColor: '#7F1D1D', borderWidth: 2, borderColor: Colors.dangerBorder, alignItems: 'center', justifyContent: 'center' },
  hangupIcon: { fontSize: 26 },
  hangupBtnFull: { backgroundColor: '#7F1D1D', borderWidth: 1, borderColor: Colors.dangerBorder, borderRadius: 14, paddingVertical: 14, paddingHorizontal: 40, marginTop: 20 },
  hangupBtnFullText: { color: Colors.danger, fontSize: 16, fontWeight: 'bold' },
  callDoorRow: { flexDirection: 'row', gap: 10, width: '100%' },
  callDoorBtnOpen: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 12, borderRadius: 12, backgroundColor: Colors.successMuted, borderWidth: 1, borderColor: Colors.successBorder },
  callDoorBtnLock: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 12, borderRadius: 12, backgroundColor: Colors.dangerMuted, borderWidth: 1, borderColor: Colors.dangerBorder },
  callDoorIcon: { fontSize: 18 },
  callDoorLabel: { fontSize: 13, fontWeight: '700' },
  scrollContent: { padding: 14, paddingBottom: 40 },
  infoCard: { backgroundColor: '#0E0E2A', borderRadius: 14, borderWidth: 1, borderColor: Colors.border, padding: 14, marginBottom: 16 },
  infoCardTitle: { fontSize: 14, fontWeight: 'bold', color: Colors.accent, marginBottom: 6 },
  infoCardText: { fontSize: 13, color: Colors.textSecondary, lineHeight: 19, marginBottom: 10 },
  infoSecRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  secDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: Colors.success },
  infoSecText: { color: Colors.success, fontSize: 12 },
  tabsRow: { flexDirection: 'row', gap: 10, marginBottom: 14 },
  tabBtn: { flex: 1, paddingVertical: 10, borderRadius: 10, backgroundColor: Colors.card, borderWidth: 1, borderColor: Colors.border, alignItems: 'center' },
  tabBtnActive: { backgroundColor: Colors.accentMuted, borderColor: Colors.primary },
  tabBtnText: { color: Colors.textMuted, fontSize: 13, fontWeight: '600' },
  tabBtnTextActive: { color: Colors.accent },
  contactCard: { flexDirection: 'row', alignItems: 'center', gap: 14, backgroundColor: Colors.card, borderRadius: 14, borderWidth: 1, borderColor: Colors.border, padding: 14, marginBottom: 10 },
  contactCardUrgence: { backgroundColor: Colors.dangerMutedAlt, borderColor: '#7F1D1D' },
  contactIconBox: { width: 48, height: 48, borderRadius: 24, backgroundColor: Colors.primaryMuted, borderWidth: 1, borderColor: Colors.border, alignItems: 'center', justifyContent: 'center' },
  contactIconBoxUrgence: { backgroundColor: Colors.dangerMuted, borderColor: Colors.dangerBorder },
  contactIconBoxMedecin: { backgroundColor: Colors.infoMuted, borderColor: Colors.info },
  contactIcon: { fontSize: 22 },
  contactName: { fontSize: 15, fontWeight: 'bold', color: Colors.text, marginBottom: 2 },
  contactRole: { fontSize: 12, color: Colors.textMuted },
  callIconBtn: { width: 42, height: 42, borderRadius: 21, backgroundColor: Colors.accentMuted, borderWidth: 1, borderColor: Colors.primary, alignItems: 'center', justifyContent: 'center' },
  callIconBtnUrgence: { backgroundColor: Colors.dangerMuted, borderColor: Colors.dangerBorder },
  callIconBtnText: { fontSize: 18 },
  urgenceCard: { backgroundColor: Colors.dangerMutedAlt, borderRadius: 14, borderWidth: 1, borderColor: '#7F1D1D', padding: 16, marginTop: 6, marginBottom: 10 },
  urgenceCardTitle: { fontSize: 14, fontWeight: 'bold', color: Colors.danger, marginBottom: 8 },
  urgenceCardText: { fontSize: 13, color: Colors.textSecondary, lineHeight: 19, marginBottom: 14 },
  urgenceBtn: { backgroundColor: '#7F1D1D', borderRadius: 12, paddingVertical: 13, alignItems: 'center', borderWidth: 1, borderColor: Colors.dangerBorder },
  urgenceBtnText: { color: Colors.danger, fontSize: 14, fontWeight: 'bold' },
  histCard: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: Colors.card, borderRadius: 14, borderWidth: 1, borderColor: Colors.border, padding: 14, marginBottom: 10 },
  histIconBox: { width: 40, height: 40, borderRadius: 20, backgroundColor: Colors.primaryMuted, borderWidth: 1, borderColor: Colors.border, alignItems: 'center', justifyContent: 'center' },
  histIconBoxManque: { backgroundColor: Colors.dangerMuted, borderColor: Colors.dangerBorder },
  histIcon: { fontSize: 18 },
  histName: { fontSize: 14, fontWeight: 'bold', color: Colors.text },
  histTime: { fontSize: 11, color: Colors.textMuted, marginTop: 2 },
  histTypeBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 10, backgroundColor: Colors.primaryMuted },
  histTypeEntrant: { backgroundColor: Colors.successMuted },
  histTypeSortant: { backgroundColor: Colors.accentMuted },
  histTypeManque: { backgroundColor: Colors.dangerMuted },
  histTypeText: { fontSize: 10, fontWeight: 'bold' },
  histDuree: { fontSize: 11, color: Colors.textSubtle },
});
