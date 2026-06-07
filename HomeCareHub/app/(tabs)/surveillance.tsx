import { useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import {
  Alert, Animated, ScrollView, StatusBar, StyleSheet, Text, TouchableOpacity, View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useUser } from '../../contexts/UserContext';
import { useResponsive } from '../../hooks/useResponsive';

interface Camera {
  id: string;
  name: string;
  location: string;
  active: boolean;
  motion: boolean;
}

const CAMERAS: Camera[] = [
  { id: 'c1', name: 'Entrée principale', location: 'Porte avant', active: true, motion: true },
];

export default function Surveillance() {
  const router = useRouter();
  const { role } = useUser();
  const { isDesktop } = useResponsive();

  const [cameras, setCameras] = useState<Camera[]>(CAMERAS);
  const [selected, setSelected] = useState<Camera>(CAMERAS[0]);
  const [recording, setRecording] = useState(false);
  const [medActive, setMedActive] = useState(false);
  const [elapsed, setElapsed] = useState(0);

  const pulse = useRef(new Animated.Value(1)).current;
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (recording) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulse, { toValue: 1.4, duration: 600, useNativeDriver: true }),
          Animated.timing(pulse, { toValue: 1.0, duration: 600, useNativeDriver: true }),
        ])
      ).start();
      timerRef.current = setInterval(() => setElapsed(s => s + 1), 1000);
    } else {
      pulse.stopAnimation();
      pulse.setValue(1);
      if (timerRef.current) clearInterval(timerRef.current);
      setElapsed(0);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [recording, pulse]);

  const formatTime = (s: number) =>
    `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;

  const handleMedical = () => {
    Alert.alert(
      '🏥 Activation médicale',
      'Activer la télésurveillance médicale ?\n\nRequiert le consentement du patient.',
      [
        { text: 'Annuler', style: 'cancel' },
        { text: 'Autoriser', onPress: () => { setMedActive(true); Alert.alert('Activé', 'Télésurveillance médicale active.\nSession enregistrée.'); } },
      ]
    );
  };

  const toggleCamera = (id: string) => {
    setCameras(prev => prev.map(c => c.id === id ? { ...c, active: !c.active } : c));
    if (selected.id === id) {
      setSelected(prev => ({ ...prev, active: !prev.active }));
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0D0D1A" />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}><Text style={styles.backText}>←</Text></TouchableOpacity>
        <View style={styles.headerCenter}>
          <View style={styles.headerIconBox}><Text style={styles.headerIconText}>📹</Text></View>
          <View><Text style={styles.headerTitle}>Surveillance caméra</Text><Text style={styles.headerSub}>ACCÈS À LA MAISON</Text></View>
        </View>
        <View style={styles.liveIndicator}><View style={styles.liveDot} /><Text style={styles.liveText}>LIVE</Text></View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {role === 'owner' || role === 'elder' && (
          <>
            <View style={[styles.liveCard, isDesktop && { maxWidth: 800, alignSelf: 'center', width: '100%' }]}>
              <View style={[styles.liveScreen, !selected.active && styles.liveScreenOff]}>
                {selected.active ? (
                  <>
                    <Text style={styles.liveScreenIcon}>📹</Text>
                    <Text style={styles.liveScreenName}>{selected.name}</Text>
                    <Text style={styles.liveScreenLocation}>{selected.location}</Text>
                    {recording && (
                      <Animated.View style={[styles.recBadge, { transform: [{ scale: pulse }] }]}>
                        <View style={styles.recDot} /><Text style={styles.recText}>REC {formatTime(elapsed)}</Text>
                      </Animated.View>
                    )}
                    {selected.motion && <View style={styles.motionBadge}><Text style={styles.motionText}>⚡ Mouvement détecté</Text></View>}
                    {medActive && <View style={styles.medBadge}><Text style={styles.medBadgeText}>🏥 Médical actif</Text></View>}
                  </>
                ) : (
                  <><Text style={styles.offIcon}>📵</Text><Text style={styles.offText}>Caméra hors ligne</Text></>
                )}
              </View>
              <View style={styles.camControls}>
                <TouchableOpacity style={[styles.camCtrlBtn, recording && styles.camCtrlBtnRec]} onPress={() => setRecording(!recording)}>
                  <Text style={styles.camCtrlIcon}>{recording ? '⏹' : '⏺'}</Text>
                  <Text style={[styles.camCtrlLabel, recording && { color: '#F87171' }]}>{recording ? 'Arrêter' : 'Enregistrer'}</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.camCtrlBtn} onPress={() => Alert.alert('📷 Capture', 'Photo enregistrée dans le journal.')}>
                  <Text style={styles.camCtrlIcon}>📷</Text><Text style={styles.camCtrlLabel}>Capture</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.camCtrlBtn} onPress={() => router.push('/interphone')}>
                  <Text style={styles.camCtrlIcon}>📞</Text><Text style={styles.camCtrlLabel}>Parler</Text>
                </TouchableOpacity>
              </View>
            </View>

            <Text style={styles.sectionTitle}>Caméras disponibles</Text>
            <View style={[isDesktop && { flexDirection: 'row', flexWrap: 'wrap', gap: 8 }]}>
              {cameras.map(cam => (
                <TouchableOpacity key={cam.id} style={[styles.camCard, selected.id === cam.id && styles.camCardSelected, isDesktop && { width: '49%' }]}
                  onPress={() => setSelected(cam)} activeOpacity={0.8}>
                  <View style={[styles.camStatusDot, cam.active ? styles.dotVert : styles.dotGris]} />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.camCardName}>{cam.name}</Text>
                    <Text style={styles.camCardLocation}>{cam.location} · {cam.active ? 'Active' : 'Hors ligne'}</Text>
                  </View>
                  {cam.motion && <View style={styles.motionPill}><Text style={styles.motionPillText}>⚡ Mvt</Text></View>}
                  <TouchableOpacity style={[styles.camToggle, cam.active && styles.camToggleActive]} onPress={() => toggleCamera(cam.id)}>
                    <Text style={styles.camToggleText}>{cam.active ? 'ON' : 'OFF'}</Text>
                  </TouchableOpacity>
                </TouchableOpacity>
              ))}
            </View>
            {
              role !== "elder" && (
                <>
                  <Text style={styles.sectionTitle}>Commande serrure</Text>
                  <View style={styles.doorCard}>
                    <TouchableOpacity style={[styles.doorBtn, styles.doorBtnOpen]} onPress={() => Alert.alert('🔓 Porte ouverte', 'Serrure déverrouillée à distance.')}>
                      <Text style={styles.doorBtnIcon}>🔓</Text><Text style={[styles.doorBtnText, { color: '#4ADE80' }]}>Ouvrir</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.doorBtn, styles.doorBtnLock]} onPress={() => Alert.alert('🔒 Porte verrouillée', 'Serrure verrouillée à distance.')}>
                      <Text style={styles.doorBtnIcon}>🔒</Text><Text style={[styles.doorBtnText, { color: '#F87171' }]}>Verrouiller</Text>
                    </TouchableOpacity>
                  </View>
                </>
              )}

          </>
        )}
        {
          role !== "elder" && (
            <>
              <Text style={styles.sectionTitle}>Télésurveillance médicale</Text>
              <View style={[styles.medCard, medActive && styles.medCardActive]}>
                <Text style={styles.medCardTitle}>{medActive ? '🏥 Télésurveillance active' : '🏥 Activation conditionnelle'}</Text>
                <Text style={styles.medCardText}>Permet l&apos;activation temporaire de la cam&eacute;ra int&eacute;rieure par un professionnel de sant&eacute; autoris&eacute;. Requiert un consentement num&eacute;rique obligatoire.</Text>
                <TouchableOpacity style={[styles.medBtn, medActive && styles.medBtnActive]}
                  onPress={medActive ? () => { setMedActive(false); Alert.alert('Désactivé', 'Télésurveillance médicale désactivée.'); } : handleMedical}>
                  <Text style={styles.medBtnText}>{medActive ? '⏹ Désactiver' : '▶ Activer pour professionnel de santé'}</Text>
                </TouchableOpacity>
              </View>
            </>
          )}

      </ScrollView>
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
  liveIndicator: { flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: '#1A0D0D', borderWidth: 1, borderColor: '#F87171', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20 },
  liveDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: '#F87171' },
  liveText: { color: '#F87171', fontSize: 11, fontWeight: 'bold', letterSpacing: 0.6 },
  scrollContent: { padding: 14, paddingBottom: 40 },
  liveCard: { backgroundColor: '#13132A', borderRadius: 16, borderWidth: 1, borderColor: '#2E2B52', overflow: 'hidden', marginBottom: 20 },
  liveScreen: { height: 220, backgroundColor: '#070C14', alignItems: 'center', justifyContent: 'center', position: 'relative' },
  liveScreenOff: { backgroundColor: '#0A0A0A' },
  liveScreenIcon: { fontSize: 44, marginBottom: 10 },
  liveScreenName: { color: '#FFFFFF', fontSize: 16, fontWeight: 'bold' },
  liveScreenLocation: { color: '#8A8FAB', fontSize: 12, marginTop: 4 },
  offIcon: { fontSize: 44, marginBottom: 10, opacity: 0.3 },
  offText: { color: '#6B7A99', fontSize: 14 },
  recBadge: { position: 'absolute', top: 12, left: 12, flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: 'rgba(239,68,68,0.2)', borderWidth: 1, borderColor: '#F87171', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  recDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#F87171' },
  recText: { color: '#F87171', fontSize: 11, fontWeight: 'bold' },
  motionBadge: { position: 'absolute', bottom: 12, right: 12, backgroundColor: 'rgba(245,158,11,0.2)', borderWidth: 1, borderColor: '#F59E0B', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  motionText: { color: '#F59E0B', fontSize: 11, fontWeight: 'bold' },
  medBadge: { position: 'absolute', top: 12, right: 12, backgroundColor: 'rgba(6,182,212,0.2)', borderWidth: 1, borderColor: '#06B6D4', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  medBadgeText: { color: '#06B6D4', fontSize: 11, fontWeight: 'bold' },
  camControls: { flexDirection: 'row', justifyContent: 'space-around', paddingVertical: 14, paddingHorizontal: 8, borderTopWidth: 1, borderTopColor: '#2E2B52' },
  camCtrlBtn: { alignItems: 'center', gap: 4, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10, borderWidth: 1, borderColor: '#2E2B52', backgroundColor: '#1A1A2E', minWidth: 68 },
  camCtrlBtnRec: { borderColor: '#F87171', backgroundColor: '#1A0D0D' },
  camCtrlIcon: { fontSize: 20 },
  camCtrlLabel: { color: '#B0B8D4', fontSize: 11, fontWeight: '600' },
  sectionTitle: { fontSize: 13, fontWeight: '700', color: '#8A8FAB', letterSpacing: 0.6, marginBottom: 10, marginTop: 4 },
  camCard: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: '#13132A', borderRadius: 14, borderWidth: 1, borderColor: '#2E2B52', padding: 14, marginBottom: 10 },
  camCardSelected: { borderColor: '#7C3AED', backgroundColor: '#1E1040' },
  camStatusDot: { width: 10, height: 10, borderRadius: 5 },
  dotVert: { backgroundColor: '#4ADE80' },
  dotGris: { backgroundColor: '#6B7A99' },
  camCardName: { fontSize: 14, fontWeight: 'bold', color: '#FFFFFF' },
  camCardLocation: { fontSize: 12, color: '#8A8FAB', marginTop: 2 },
  motionPill: { backgroundColor: 'rgba(245,158,11,0.15)', borderWidth: 1, borderColor: '#F59E0B', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 20 },
  motionPillText: { color: '#F59E0B', fontSize: 11, fontWeight: '600' },
  camToggle: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, backgroundColor: '#1A1A2E', borderWidth: 1, borderColor: '#2E2B52' },
  camToggleActive: { backgroundColor: '#0D2D1A', borderColor: '#16A34A' },
  camToggleText: { fontSize: 11, fontWeight: 'bold', color: '#8A8FAB' },
  doorCard: { flexDirection: 'row', gap: 12, marginBottom: 20 },
  doorBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 16, borderRadius: 14, borderWidth: 1 },
  doorBtnOpen: { backgroundColor: '#0D2D1A', borderColor: '#16A34A' },
  doorBtnLock: { backgroundColor: '#2D1010', borderColor: '#EF4444' },
  doorBtnIcon: { fontSize: 22 },
  doorBtnText: { fontSize: 15, fontWeight: 'bold' },
  medCard: { backgroundColor: '#071520', borderRadius: 14, borderWidth: 1, borderColor: '#0E4A5A', padding: 16, marginBottom: 20 },
  medCardActive: { borderColor: '#06B6D4', backgroundColor: '#051A22' },
  medCardTitle: { fontSize: 14, fontWeight: 'bold', color: '#06B6D4', marginBottom: 8 },
  medCardText: { fontSize: 13, color: '#B0B8D4', lineHeight: 19, marginBottom: 14 },
  medBtn: { backgroundColor: '#0E4A5A', borderRadius: 12, paddingVertical: 13, alignItems: 'center', borderWidth: 1, borderColor: '#06B6D4' },
  medBtnActive: { backgroundColor: '#2D1010', borderColor: '#EF4444' },
  medBtnText: { color: '#06B6D4', fontSize: 14, fontWeight: 'bold' },
});
