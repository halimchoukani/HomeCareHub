import { useRouter } from 'expo-router';
import { useState } from 'react';
import { API_URL } from '../../constants/api';
import * as ImagePicker from 'expo-image-picker';
import {
  ActivityIndicator, Alert, Image, ScrollView, StatusBar, StyleSheet, Text, TextInput, TouchableOpacity, View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useUser } from '../../contexts/UserContext';
import { useResponsive } from '../../hooks/useResponsive';

export default function AddPerson() {
  const router = useRouter();
  const { token } = useUser();
  const [photo, setPhoto] = useState<ImagePicker.ImagePickerAsset | null>(null);
  const [name, setName] = useState('');
  const [role, setRole] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const { isDesktop } = useResponsive();

  const handleGallery = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Permission refusée', 'Autorisez l\'accès à la galerie');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });
    if (!result.canceled) {
      setPhoto(result.assets[0]);
    }
  };

  const handleCamera = async () => {
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Permission refusée', 'Autorisez l\'accès à la caméra');
      return;
    }
    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });
    if (!result.canceled) {
      setPhoto(result.assets[0]);
    }
  };

  const handleAdd = async () => {
    if (!name.trim()) {
      Alert.alert('Erreur', 'Veuillez saisir un nom complet');
      return;
    }
    if (!phone.trim()) {
      Alert.alert('Erreur', 'Veuillez saisir un numéro de téléphone');
      return;
    }
    if (!photo) {
      Alert.alert('Erreur', 'Veuillez ajouter une photo');
      return;
    }
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('nom', name.trim());
      formData.append('role', role.trim());
      formData.append('telephone', phone.trim());
      formData.append('photo', {
        uri: photo.uri,
        name: 'photo.jpg',
        type: 'image/jpeg',
      } as any);

      const response = await fetch(`${API_URL}/api/personnes/ajouter/`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });
      const data = await response.json();
      if (response.ok) {
        Alert.alert('Succès', `${name} a été ajouté(e) !`, [
          { text: 'OK', onPress: () => router.replace('/home') },
        ]);
      } else {
        Alert.alert('Erreur', JSON.stringify(data));
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
        <View style={styles.photoSection}>
          <View style={styles.photoPreview}>
            {photo ? (
              <Image source={{ uri: photo.uri }} style={styles.photoImage} />
            ) : (
              <View style={styles.photoPlaceholder}>
                <Text style={styles.photoPlaceholderIcon}>👤</Text>
              </View>
            )}
            <TouchableOpacity style={styles.cameraBadge} onPress={handleCamera}>
              <Text style={styles.cameraBadgeText}>📷</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.photoButtons}>
            <TouchableOpacity style={styles.photoBtn} onPress={handleGallery}>
              <Text style={styles.photoBtnIcon}>🖼️</Text>
              <Text style={styles.photoBtnText}>Galerie</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.photoBtn, styles.photoBtnCam]} onPress={handleCamera}>
              <Text style={styles.photoBtnIcon}>📷</Text>
              <Text style={[styles.photoBtnText, { color: '#A78BFA' }]}>Caméra</Text>
            </TouchableOpacity>
          </View>
        </View>

        <Text style={styles.label}>NOM COMPLET</Text>
        <View style={styles.inputWrapper}>
          <Text style={styles.inputIcon}>👤</Text>
          <TextInput style={styles.input} placeholder="Ex : Jean Dupont" placeholderTextColor="#6B7A99" value={name} onChangeText={setName} />
        </View>
        <Text style={styles.label}>RÔLE / DESCRIPTION</Text>
        <View style={styles.inputWrapper}>
          <Text style={styles.inputIcon}>🏷️</Text>
          <TextInput style={styles.input} placeholder="Ex : Famille, Infirmier, Livreur..." placeholderTextColor="#6B7A99" value={role} onChangeText={setRole} />
        </View>
        <Text style={styles.label}>NUMÉRO DE TÉLÉPHONE</Text>
        <View style={styles.inputWrapper}>
          <Text style={styles.inputIcon}>📞</Text>
          <TextInput style={styles.input} placeholder="Ex : +216 97 582 131" placeholderTextColor="#6B7A99" value={phone} onChangeText={setPhone} keyboardType="phone-pad" />
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
  addBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, backgroundColor: '#7C3AED', paddingVertical: 16, borderRadius: 14, marginTop: 8 },
  addBtnIcon: { fontSize: 18 },
  addBtnText: { color: '#FFFFFF', fontSize: 17, fontWeight: 'bold' },
});
