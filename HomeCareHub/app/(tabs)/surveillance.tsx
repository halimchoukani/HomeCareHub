import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, SafeAreaView,
  StatusBar, ScrollView, Alert, Animated
} from 'react-native';
import { useRouter } from 'expo-router';
import { Colors } from '@/constants/theme';
import { ENDPOINTS } from '@/constants/config';
import { authFetch } from '@/constants/api';

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

  const [cameras, setCameras] = useState<Camera[]>(CAMERAS);
  const [selected, setSelected] = useState<Camera>(CAMERAS[0]);
  const [recording, setRecording] = useState(false);
  const [medActive, setMedActive] = useState(false);
  const [doorOpen, setDoorOpen] = useState(false);
  const [elapsed, setElapsed] = useState(0);

  // Animation pulse pour REC
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
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [recording]);

  const formatTime = (s: number) =>
    `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;

  const controlDoor = async (state: 'open' | 'close') => {
    try {
      const response = await authFetch(ENDPOINTS.deviceControl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          device_id: 'door_1',
          state: state,
        }),
      });
      if (response.ok) {
        setDoorOpen(state === 'open');
        Alert.alert(
          state === 'open' ? '🔓 Porte ouverte' : '🔒 Porte verrouillée',
          state === 'open' ? 'Serrure déverrouillée à distance avec succès.' : 'Serrure verrouillée à distance avec succès.'
        );
      } else {
        Alert.alert('Erreur', 'Impossible d\'envoyer la commande à la serrure.');
      }
    } catch (err) {
      console.error(err);
      Alert.alert('Erreur', 'Connexion au serveur impossible.');
    }
  };

  const handleMedical = () => {
    Alert.alert(
      '🏥 Activation médicale',
      'Activer la télésurveillance médicale ?\n\nRequiert le consentement du patient.',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Autoriser', onPress: () => {
            setMedActive(true);
            Alert.alert('✅ Activé', 'Télésurveillance médicale active.\nSession enregistrée.');
          }
        },
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
      <StatusBar barStyle="light-content" backgroundColor={Colors.background} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backText}>←</Text>
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <View style={styles.headerIconBox}>
            <Text style={styles.headerIconText}>📹</Text>
          </View>
          <View>
            <Text style={styles.headerTitle}>Surveillance caméra</Text>
            <Text style={styles.headerSub}>ACCÈS À LA MAISON</Text>
          </View>
        </View>
        <View style={styles.liveIndicator}>
          <View style={styles.liveDot} />
          <Text style={styles.liveText}>LIVE</Text>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Flux vidéo principal */}
        <View style={styles.liveCard}>
          <View style={[
            styles.liveScreen,
            !selected.active && styles.liveScreenOff
          ]}>
            {selected.active ? (
              <>
                <Text style={styles.liveScreenIcon}>📹</Text>
                <Text style={styles.liveScreenName}>{selected.name}</Text>
                <Text style={styles.liveScreenLocation}>{selected.location}</Text>

                {/* Badge REC */}
                {recording && (
                  <Animated.View style={[styles.recBadge, { transform: [{ scale: pulse }] }]}>
                    <View style={styles.recDot} />
                    <Text style={styles.recText}>REC {formatTime(elapsed)}</Text>
                  </Animated.View>
                )}

                {/* Badge mouvement */}
                {selected.motion && (
                  <View style={styles.motionBadge}>
                    <Text style={styles.motionText}>⚡ Mouvement détecté</Text>
                  </View>
                )}

                {/* Badge médical */}
                {medActive && (
                  <View style={styles.medBadge}>
                    <Text style={styles.medBadgeText}>🏥 Médical actif</Text>
                  </View>
                )}
              </>
            ) : (
              <>
                <Text style={styles.offIcon}>📵</Text>
                <Text style={styles.offText}>Caméra hors ligne</Text>
              </>
            )}
          </View>

          {/* Contrôles caméra */}
          <View style={styles.camControls}>
            <TouchableOpacity
              style={styles.camCtrlBtn}
              onPress={() => Alert.alert('🔄 Pan/Tilt', 'Contrôle motorisé de la caméra')}
            >
              <Text style={styles.camCtrlIcon}>🔄</Text>
              <Text style={styles.camCtrlLabel}>Pivoter</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.camCtrlBtn, recording && styles.camCtrlBtnRec]}
              onPress={() => setRecording(!recording)}
            >
              <Text style={styles.camCtrlIcon}>{recording ? '⏹' : '⏺'}</Text>
              <Text style={[styles.camCtrlLabel, recording && { color: Colors.danger }]}>
                {recording ? 'Arrêter' : 'Enregistrer'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.camCtrlBtn}
              onPress={() => Alert.alert('📷 Capture', 'Photo enregistrée dans le journal.')}
            >
              <Text style={styles.camCtrlIcon}>📷</Text>
              <Text style={styles.camCtrlLabel}>Capture</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.camCtrlBtn}
              onPress={() => router.push('/interphone')}
            >
              <Text style={styles.camCtrlIcon}>📞</Text>
              <Text style={styles.camCtrlLabel}>Parler</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Liste des caméras */}
        <Text style={styles.sectionTitle}>Caméras disponibles</Text>
        {cameras.map(cam => (
          <TouchableOpacity
            key={cam.id}
            style={[styles.camCard, selected.id === cam.id && styles.camCardSelected]}
            onPress={() => setSelected(cam)}
            activeOpacity={0.8}
          >
            <View style={[styles.camStatusDot, cam.active ? styles.dotVert : styles.dotGris]} />

            <View style={{ flex: 1 }}>
              <Text style={styles.camCardName}>{cam.name}</Text>
              <Text style={styles.camCardLocation}>
                {cam.location} · {cam.active ? 'Active' : 'Hors ligne'}
              </Text>
            </View>

            {cam.motion && (
              <View style={styles.motionPill}>
                <Text style={styles.motionPillText}>⚡ Mvt</Text>
              </View>
            )}

            <TouchableOpacity
              style={[styles.camToggle, cam.active && styles.camToggleActive]}
              onPress={() => toggleCamera(cam.id)}
            >
              <Text style={styles.camToggleText}>{cam.active ? 'ON' : 'OFF'}</Text>
            </TouchableOpacity>
          </TouchableOpacity>
        ))}

        {/* Commande serrure */}
        <Text style={styles.sectionTitle}>Commande serrure</Text>
        <View style={styles.doorCard}>
          <TouchableOpacity
            style={[styles.doorBtn, styles.doorBtnOpen]}
            onPress={() => controlDoor('open')}
          >
            <Text style={styles.doorBtnIcon}>🔓</Text>
            <Text style={[styles.doorBtnText, { color: Colors.success }]}>Ouvrir</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.doorBtn, styles.doorBtnLock]}
            onPress={() => controlDoor('close')}
          >
            <Text style={styles.doorBtnIcon}>🔒</Text>
            <Text style={[styles.doorBtnText, { color: Colors.danger }]}>Verrouiller</Text>
          </TouchableOpacity>
        </View>

        {/* Activation médicale */}
        <Text style={styles.sectionTitle}>Télésurveillance médicale</Text>
        <View style={[styles.medCard, medActive && styles.medCardActive]}>
          <Text style={styles.medCardTitle}>
            {medActive ? '🏥 Télésurveillance active' : '🏥 Activation conditionnelle'}
          </Text>
          <Text style={styles.medCardText}>
            Permet l'activation temporaire de la caméra intérieure par un professionnel de santé autorisé.
            Requiert un consentement numérique obligatoire.
          </Text>
          <TouchableOpacity
            style={[styles.medBtn, medActive && styles.medBtnActive]}
            onPress={medActive
              ? () => { setMedActive(false); Alert.alert('Désactivé', 'Télésurveillance médicale désactivée.'); }
              : handleMedical
            }
          >
            <Text style={styles.medBtnText}>
              {medActive ? '⏹  Désactiver' : '▶  Activer pour professionnel de santé'}
            </Text>
          </TouchableOpacity>
        </View>

      </ScrollView>
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
  liveIndicator: { flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: Colors.dangerMuted, borderWidth: 1, borderColor: Colors.danger, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20 },
  liveDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: Colors.danger },
  liveText: { color: Colors.danger, fontSize: 11, fontWeight: 'bold', letterSpacing: 0.6 },
  scrollContent: { padding: 14, paddingBottom: 40 },
  liveCard: { backgroundColor: Colors.card, borderRadius: 16, borderWidth: 1, borderColor: Colors.border, overflow: 'hidden', marginBottom: 20 },
  liveScreen: { height: 220, backgroundColor: '#070C14', alignItems: 'center', justifyContent: 'center', position: 'relative' },
  liveScreenOff: { backgroundColor: '#0A0A0A' },
  liveScreenIcon: { fontSize: 44, marginBottom: 10 },
  liveScreenName: { color: Colors.text, fontSize: 16, fontWeight: 'bold' },
  liveScreenLocation: { color: Colors.textMuted, fontSize: 12, marginTop: 4 },
  offIcon: { fontSize: 44, marginBottom: 10, opacity: 0.3 },
  offText: { color: Colors.textSubtle, fontSize: 14 },
  recBadge: { position: 'absolute', top: 12, left: 12, flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: 'rgba(239,68,68,0.2)', borderWidth: 1, borderColor: Colors.danger, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  recDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: Colors.danger },
  recText: { color: Colors.danger, fontSize: 11, fontWeight: 'bold' },
  motionBadge: { position: 'absolute', bottom: 12, right: 12, backgroundColor: 'rgba(245,158,11,0.2)', borderWidth: 1, borderColor: Colors.warning, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  motionText: { color: Colors.warning, fontSize: 11, fontWeight: 'bold' },
  medBadge: { position: 'absolute', top: 12, right: 12, backgroundColor: 'rgba(6,182,212,0.2)', borderWidth: 1, borderColor: Colors.info, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  medBadgeText: { color: Colors.info, fontSize: 11, fontWeight: 'bold' },
  camControls: { flexDirection: 'row', justifyContent: 'space-around', paddingVertical: 14, paddingHorizontal: 8, borderTopWidth: 1, borderTopColor: Colors.border },
  camCtrlBtn: { alignItems: 'center', gap: 4, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10, borderWidth: 1, borderColor: Colors.border, backgroundColor: Colors.primaryMuted, minWidth: 68 },
  camCtrlBtnRec: { borderColor: Colors.danger, backgroundColor: Colors.dangerMuted },
  camCtrlIcon: { fontSize: 20 },
  camCtrlLabel: { color: Colors.textSecondary, fontSize: 11, fontWeight: '600' },
  sectionTitle: { fontSize: 13, fontWeight: '700', color: Colors.textMuted, letterSpacing: 0.6, marginBottom: 10, marginTop: 4 },
  camCard: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: Colors.card, borderRadius: 14, borderWidth: 1, borderColor: Colors.border, padding: 14, marginBottom: 10 },
  camCardSelected: { borderColor: Colors.primary, backgroundColor: '#1E1040' },
  camStatusDot: { width: 10, height: 10, borderRadius: 5 },
  dotVert: { backgroundColor: Colors.success },
  dotGris: { backgroundColor: Colors.textSubtle },
  camCardName: { fontSize: 14, fontWeight: 'bold', color: Colors.text },
  camCardLocation: { fontSize: 12, color: Colors.textMuted, marginTop: 2 },
  motionPill: { backgroundColor: 'rgba(245,158,11,0.15)', borderWidth: 1, borderColor: Colors.warning, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 20 },
  motionPillText: { color: Colors.warning, fontSize: 11, fontWeight: '600' },
  camToggle: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, backgroundColor: Colors.primaryMuted, borderWidth: 1, borderColor: Colors.border },
  camToggleActive: { backgroundColor: Colors.successMuted, borderColor: Colors.successBorder },
  camToggleText: { fontSize: 11, fontWeight: 'bold', color: Colors.textMuted },
  doorCard: { flexDirection: 'row', gap: 12, marginBottom: 20 },
  doorBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 16, borderRadius: 14, borderWidth: 1 },
  doorBtnOpen: { backgroundColor: Colors.successMuted, borderColor: Colors.successBorder },
  doorBtnLock: { backgroundColor: Colors.dangerMuted, borderColor: Colors.dangerBorder },
  doorBtnIcon: { fontSize: 22 },
  doorBtnText: { fontSize: 15, fontWeight: 'bold' },
  medCard: { backgroundColor: '#071520', borderRadius: 14, borderWidth: 1, borderColor: Colors.border, padding: 16, marginBottom: 20 },
  medCardActive: { borderColor: Colors.info, backgroundColor: Colors.infoMuted },
  medCardTitle: { fontSize: 14, fontWeight: 'bold', color: Colors.info, marginBottom: 8 },
  medCardText: { fontSize: 13, color: Colors.textSecondary, lineHeight: 19, marginBottom: 14 },
  medBtn: { backgroundColor: Colors.border, borderRadius: 12, paddingVertical: 13, alignItems: 'center', borderWidth: 1, borderColor: Colors.info },
  medBtnActive: { backgroundColor: Colors.dangerMuted, borderColor: Colors.dangerBorder },
  medBtnText: { color: Colors.info, fontSize: 14, fontWeight: 'bold' },
});
