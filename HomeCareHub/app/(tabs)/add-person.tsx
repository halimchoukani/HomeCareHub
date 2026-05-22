import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import {
  Alert,
  Image,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text, TextInput,
  TouchableOpacity,
  View,
  ActivityIndicator,
  Platform
} from 'react-native';
import { Colors } from '@/constants/theme';
import { ENDPOINTS } from '@/constants/config';
import { authFetch } from '@/constants/api';
import { useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function AddPerson() {
  const router = useRouter();
  const [photo, setPhoto] = useState<ImagePicker.ImagePickerAsset | null>(null);
  const [name, setName] = useState('');
  const [role, setRole] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);

  const handleGallery = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Permission refusée', 'Autorisez l\'accès à la galerie');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });
    if (!result.canceled && result.assets && result.assets.length > 0) {
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
    if (!result.canceled && result.assets && result.assets.length > 0) {
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
      formData.append('name', name);
      formData.append('role', role);
      formData.append('phone', phone);

      // Setup file upload
      const uriParts = photo.uri.split('.');
      const fileType = uriParts[uriParts.length - 1];

      let fileToUpload: any = null;
      
      // If we are running in a web browser (React Native Web) or have a local blob/base64 URL,
      // standard FormData expects a real Blob/File object, not a native { uri, name, type } object.
      if (Platform.OS === 'web' || photo.uri.startsWith('blob:') || photo.uri.startsWith('data:')) {
        const responseBlob = await fetch(photo.uri);
        const blob = await responseBlob.blob();
        fileToUpload = new File([blob], `photo.${fileType || 'jpg'}`, {
          type: `image/${fileType === 'png' ? 'png' : 'jpeg'}`,
        });
      } else {
        // Native mobile environments (iOS/Android)
        fileToUpload = {
          uri: photo.uri,
          name: `photo.${fileType || 'jpg'}`,
          type: `image/${fileType === 'png' ? 'png' : 'jpeg'}`,
        };
      }

      formData.append('photo', fileToUpload);

      const response = await authFetch(ENDPOINTS.ajouterPersonne, {
        method: 'POST',
        body: formData,
      });
      console.log("response", response);

      const data = await response.json();
      if (response.ok) {
        Alert.alert('Succès ✅', `${name} a été ajouté(e) !`, [
          { text: 'OK', onPress: () => router.replace('/home') }
        ]);
      } else {
        Alert.alert('Erreur', JSON.stringify(data));
      }
    } catch (e) {
      console.error(e);
      Alert.alert('Erreur', 'Impossible de contacter le serveur');
    } finally {
      setLoading(false);
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
          <View style={styles.headerIcon}>
            <Text style={styles.headerIconText}>👤</Text>
          </View>
          <View>
            <Text style={styles.headerTitle}>Ajouter une personne</Text>
            <Text style={styles.headerSub}>{"Contrôle d'accès à la maison"}</Text>
          </View>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Section photo */}
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
              <Text style={[styles.photoBtnText, { color: Colors.accent }]}>Caméra</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Nom */}
        <Text style={styles.label}>NOM COMPLET</Text>
        <View style={styles.inputWrapper}>
          <Text style={styles.inputIcon}>👤</Text>
          <TextInput
            style={styles.input}
            placeholder="Ex : Jean Dupont"
            placeholderTextColor={Colors.textMuted}
            value={name}
            onChangeText={setName}
          />
        </View>

        {/* Rôle */}
        <Text style={styles.label}>RÔLE / DESCRIPTION</Text>
        <View style={styles.inputWrapper}>
          <Text style={styles.inputIcon}>🏷️</Text>
          <TextInput
            style={styles.input}
            placeholder="Ex : Famille, Infirmier, Livreur..."
            placeholderTextColor={Colors.textMuted}
            value={role}
            onChangeText={setRole}
          />
        </View>

        {/* Téléphone */}
        <Text style={styles.label}>NUMÉRO DE TÉLÉPHONE</Text>
        <View style={styles.inputWrapper}>
          <Text style={styles.inputIcon}>📞</Text>
          <TextInput
            style={styles.input}
            placeholder="Ex : +216 97 582 131"
            placeholderTextColor={Colors.textMuted}
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
          />
        </View>

        {/* Bouton Ajouter */}
        <TouchableOpacity
          style={[styles.addBtn, loading && { opacity: 0.6 }]}
          onPress={handleAdd}
          disabled={loading}
        >
          {loading
            ? <ActivityIndicator color="#fff" />
            : <>
              <Text style={styles.addBtnIcon}>💾</Text>
              <Text style={styles.addBtnText}>Ajouter</Text>
            </>
          }
        </TouchableOpacity>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: Colors.border },
  backBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: Colors.primaryMuted, borderWidth: 1, borderColor: Colors.border, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  backText: { color: Colors.accent, fontSize: 18, fontWeight: 'bold' },
  headerCenter: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  headerIcon: { width: 40, height: 40, borderRadius: 20, backgroundColor: Colors.accentMuted, borderWidth: 1, borderColor: Colors.primary, alignItems: 'center', justifyContent: 'center' },
  headerIconText: { fontSize: 18 },
  headerTitle: { fontSize: 16, fontWeight: 'bold', color: Colors.text },
  headerSub: { fontSize: 11, color: Colors.textMuted, marginTop: 1 },
  scrollContent: { padding: 20, paddingBottom: 40 },
  photoSection: { flexDirection: 'row', alignItems: 'center', gap: 16, marginBottom: 28 },
  photoPreview: { position: 'relative', width: 80, height: 80 },
  photoImage: { width: 80, height: 80, borderRadius: 14, borderWidth: 2, borderColor: Colors.primary },
  photoPlaceholder: { width: 80, height: 80, borderRadius: 14, backgroundColor: Colors.primaryMuted, borderWidth: 1.5, borderColor: Colors.border, alignItems: 'center', justifyContent: 'center' },
  photoPlaceholderIcon: { fontSize: 32, opacity: 0.4 },
  cameraBadge: { position: 'absolute', bottom: -6, right: -6, width: 28, height: 28, borderRadius: 14, backgroundColor: Colors.primary, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: Colors.background },
  cameraBadgeText: { fontSize: 13 },
  photoButtons: { flex: 1, gap: 10 },
  photoBtn: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: Colors.primaryMuted, borderWidth: 1, borderColor: Colors.border, borderRadius: 12, paddingVertical: 12, paddingHorizontal: 16 },
  photoBtnCam: { borderColor: Colors.primary, backgroundColor: Colors.accentMuted },
  photoBtnIcon: { fontSize: 18 },
  photoBtnText: { color: Colors.textSecondary, fontSize: 15, fontWeight: '600' },
  label: { fontSize: 11, fontWeight: '700', color: Colors.textMuted, marginBottom: 8, letterSpacing: 0.8 },
  inputWrapper: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.primaryMuted, borderWidth: 1, borderColor: Colors.border, borderRadius: 12, paddingHorizontal: 14, marginBottom: 20 },
  inputIcon: { fontSize: 16, marginRight: 10 },
  input: { flex: 1, paddingVertical: 14, fontSize: 15, color: Colors.text },
  addBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, backgroundColor: Colors.primary, paddingVertical: 16, borderRadius: 14, marginTop: 8, shadowColor: Colors.primary, shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.35, shadowRadius: 10, elevation: 5 },
  addBtnIcon: { fontSize: 18 },
  addBtnText: { color: Colors.text, fontSize: 17, fontWeight: 'bold', letterSpacing: 0.4 },
});
