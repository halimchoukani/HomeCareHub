import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
  ActivityIndicator, Alert, Image, ScrollView, StatusBar, StyleSheet, Text, TextInput, TouchableOpacity, View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { API_URL } from '../../constants/api';
import { useUser } from '../../contexts/UserContext';
import { useResponsive } from '../../hooks/useResponsive';

export default function AddPerson() {
  const router = useRouter();
  const { token, user, deviceId } = useUser();

  const [email, setEmail] = useState('');
  const [role, setRole] = useState('');
  const [loading, setLoading] = useState(false);
  const { isDesktop } = useResponsive();


  const handleAdd = async () => {
    if (!email.trim()) {
      Alert.alert('Erreur', 'Veuillez saisir un email complet');
      return;
    }
    if (!role.trim()) {
      Alert.alert('Erreur', 'Veuillez saisir un rôle');
      return;
    }
    setLoading(true);
    try {

      const response = await fetch(`${API_URL}/devices/${deviceId}/persons/`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userEmail: email,
          role: role,
        }),
      });
      const data = await response.json();
      if (response.ok) {
        Alert.alert('Succès', `${email} a été ajouté(e) !`, [
          { text: 'OK', onPress: () => router.replace('/home') },
        ]);
      } else {
        Alert.alert('Erreur', data.error);
      }
    } catch {
      Alert.alert('Erreur', 'Impossible de contacter le serveur');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0D0D1A" />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backText}>←</Text>
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <View style={styles.headerIcon}><Text style={styles.headerIconText}>👤</Text></View>
          <View>
            <Text style={styles.headerTitle}>Ajouter une personne</Text>
            <Text style={styles.headerSub}>Contr&ocirc;le d&apos;acc&egrave;s &agrave; la maison</Text>
          </View>
        </View>
      </View>
      <ScrollView contentContainerStyle={[styles.scrollContent, isDesktop && { maxWidth: 600, alignSelf: 'center', width: '100%' }]} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
        <Text style={styles.label}>Email</Text>
        <View style={styles.inputWrapper}>
          <Text style={styles.inputIcon}>👤</Text>
          <TextInput style={styles.input} placeholder="Ex : exemple@gmail.com" placeholderTextColor="#6B7A99" value={email} onChangeText={setEmail} />
        </View>
        <Text style={styles.label}>RÔLE / DESCRIPTION</Text>
        <View style={styles.roleContainer}>
          <TouchableOpacity
            style={[styles.roleBtn, role === 'elder' && styles.roleBtnActive]}
            onPress={() => setRole('elder')}
          >
            <Text style={styles.roleIcon}>👴</Text>
            <Text style={[styles.roleText, role === 'elder' && styles.roleTextActive]}>Elder</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.roleBtn, role === 'healthcare' && styles.roleBtnActive]}
            onPress={() => setRole('healthcare')}
          >
            <Text style={styles.roleIcon}>⚕️</Text>
            <Text style={[styles.roleText, role === 'healthcare' && styles.roleTextActive]}>Healthcare</Text>
          </TouchableOpacity>
        </View>
        <TouchableOpacity style={[styles.addBtn, loading && { opacity: 0.6 }]} onPress={handleAdd} disabled={loading}>
          {loading ? <ActivityIndicator color="#fff" /> : <><Text style={styles.addBtnIcon}>💾</Text><Text style={styles.addBtnText}>Ajouter</Text></>}
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0D0D1A' },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: '#2E2B52' },
  backBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#1A1A2E', borderWidth: 1, borderColor: '#2E2B52', alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  backText: { color: '#A78BFA', fontSize: 18, fontWeight: 'bold' },
  headerCenter: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  headerIcon: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#2D1B6B', borderWidth: 1, borderColor: '#7C3AED', alignItems: 'center', justifyContent: 'center' },
  headerIconText: { fontSize: 18 },
  headerTitle: { fontSize: 16, fontWeight: 'bold', color: '#FFFFFF' },
  headerSub: { fontSize: 11, color: '#8A8FAB', marginTop: 1 },
  scrollContent: { padding: 20, paddingBottom: 40 },
  photoSection: { flexDirection: 'row', alignItems: 'center', gap: 16, marginBottom: 28 },
  photoPreview: { position: 'relative', width: 80, height: 80 },
  photoImage: { width: 80, height: 80, borderRadius: 14, borderWidth: 2, borderColor: '#7C3AED' },
  photoPlaceholder: { width: 80, height: 80, borderRadius: 14, backgroundColor: '#1A1A2E', borderWidth: 1.5, borderColor: '#2E2B52', alignItems: 'center', justifyContent: 'center' },
  photoPlaceholderIcon: { fontSize: 32, opacity: 0.4 },
  cameraBadge: { position: 'absolute', bottom: -6, right: -6, width: 28, height: 28, borderRadius: 14, backgroundColor: '#7C3AED', alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: '#0D0D1A' },
  cameraBadgeText: { fontSize: 13 },
  photoButtons: { flex: 1, gap: 10 },
  photoBtn: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: '#1A1A2E', borderWidth: 1, borderColor: '#2E2B52', borderRadius: 12, paddingVertical: 12, paddingHorizontal: 16 },
  photoBtnCam: { borderColor: '#7C3AED', backgroundColor: '#1E1040' },
  photoBtnIcon: { fontSize: 18 },
  photoBtnText: { color: '#B0B8D4', fontSize: 15, fontWeight: '600' },
  label: { fontSize: 11, fontWeight: '700', color: '#8A8FAB', marginBottom: 8, letterSpacing: 0.8 },
  inputWrapper: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#1A1A2E', borderWidth: 1, borderColor: '#2E2B52', borderRadius: 12, paddingHorizontal: 14, marginBottom: 20 },
  inputIcon: { fontSize: 16, marginRight: 10 },
  input: { flex: 1, paddingVertical: 14, fontSize: 15, color: '#FFFFFF' },
  roleContainer: { flexDirection: 'row', gap: 12, marginBottom: 20 },
  roleBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: '#1A1A2E', borderWidth: 1, borderColor: '#2E2B52', borderRadius: 12, paddingVertical: 14 },
  roleBtnActive: { borderColor: '#7C3AED', backgroundColor: 'rgba(124, 58, 237, 0.1)' },
  roleIcon: { fontSize: 18 },
  roleText: { color: '#8A8FAB', fontSize: 15, fontWeight: '600' },
  roleTextActive: { color: '#FFFFFF' },
  addBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, backgroundColor: '#7C3AED', paddingVertical: 16, borderRadius: 14, marginTop: 8 },
  addBtnIcon: { fontSize: 18 },
  addBtnText: { color: '#FFFFFF', fontSize: 17, fontWeight: 'bold' },
});
