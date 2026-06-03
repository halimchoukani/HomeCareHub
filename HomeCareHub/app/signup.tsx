import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import * as ImagePicker from 'expo-image-picker';
import { useSignup } from "../constants/api";
import { useUser } from "../contexts/UserContext";
import { useResponsive } from "../hooks/useResponsive";

export default function Signup() {
  const router = useRouter();
  const { user, token, loading: authLoading } = useUser();
  const [photo, setPhoto] = useState<ImagePicker.ImagePickerAsset | null>(null);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const { isDesktop } = useResponsive();

  useEffect(() => {
    if (!authLoading && (user || token)) {
      router.replace("/home");
    }
  }, [authLoading, router, token, user]);

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
  const handleSignup = async () => {
    if (!photo) {
      Alert.alert("Photo manquante", "Veuillez sélectionner une photo.");
      return;
    }
    if (!name || !email || !password || !confirm || !phone) {
      Alert.alert("Champs manquants", "Veuillez remplir tous les champs.");
      return;
    }
    if (password !== confirm) {
      Alert.alert("Erreur", "Les mots de passe ne correspondent pas.");
      return;
    }
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('facePhoto', {
        uri: photo.uri,
        name: 'photo.jpg',
        type: 'image/jpeg',
      } as any);
      formData.append("username", name);
      formData.append("email", email);
      formData.append("password", password);
      formData.append("phone", phone);
      const response = await useSignup(formData);
      if (response) {
        Alert.alert("Succès", "Compte créé avec succès ! Connectez-vous.");
        router.push("/login");
      } else {
        Alert.alert("Erreur", "Visage non détecté ou information manquante.");
      }
    } catch (err: any) {
      Alert.alert(
        "Erreur",
        err.response?.data?.error || "Impossible de contacter le serveur",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.logoWrapper}>
          <View style={styles.logoCircle}>
            <Text style={styles.logoEmoji}>🏠</Text>
          </View>
          <Text style={styles.appName}>HomeCareHub</Text>
        </View>

        <View
          style={[
            styles.card,
            isDesktop && { maxWidth: 500, alignSelf: "center", width: "100%" },
          ]}
        >
          <Text style={styles.title}>Créer un compte</Text>

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
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Username</Text>
            <TextInput
              style={styles.input}
              placeholder="Ex: Jean Dupont"
              placeholderTextColor="#4A4E6A"
              value={name}
              onChangeText={setName}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Phone</Text>
            <TextInput
              style={styles.input}
              placeholder="Ex: 12345678"
              placeholderTextColor="#4A4E6A"
              value={phone}
              onChangeText={setPhone}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              style={styles.input}
              placeholder="exemple@mail.com"
              placeholderTextColor="#4A4E6A"
              keyboardType="email-address"
              autoCapitalize="none"
              value={email}
              onChangeText={setEmail}
            />
          </View>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Mot de passe</Text>
            <TextInput
              style={styles.input}
              placeholder="Minimum 8 caractères"
              placeholderTextColor="#4A4E6A"
              secureTextEntry
              value={password}
              onChangeText={setPassword}
            />
          </View>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Confirmer le mot de passe</Text>
            <TextInput
              style={styles.input}
              placeholder="Répétez votre mot de passe"
              placeholderTextColor="#4A4E6A"
              secureTextEntry
              value={confirm}
              onChangeText={setConfirm}
            />
          </View>

          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleSignup}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Créer mon compte</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.loginBtn}
            onPress={() => router.push("/login")}
          >
            <Text style={styles.loginText}>
              Déjà un compte ?{" "}
              <Text style={styles.loginHighlight}>Se connecter</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0D0D1A" },
  scrollContainer: { flexGrow: 1, justifyContent: "center", padding: 24 },
  logoWrapper: { alignItems: "center", marginBottom: 32 },
  logoCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#1E1B3A",
    borderWidth: 2,
    borderColor: "#7C3AED",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  logoEmoji: { fontSize: 36 },
  appName: { fontSize: 22, fontWeight: "bold", color: "#FFFFFF" },
  card: {
    backgroundColor: "#13132A",
    borderRadius: 24,
    padding: 28,
    borderWidth: 1,
    borderColor: "#2A2750",
  },
  title: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#FFFFFF",
    textAlign: "center",
  },

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

  inputGroup: { marginBottom: 16 },
  label: { fontSize: 13, color: "#A0A8C8", marginBottom: 8 },
  input: {
    backgroundColor: "#0D0D1A",
    borderWidth: 1,
    borderColor: "#2A2750",
    padding: 14,
    borderRadius: 12,
    color: "#FFFFFF",
  },
  button: {
    backgroundColor: "#7C3AED",
    padding: 16,
    borderRadius: 14,
    alignItems: "center",
  },
  buttonDisabled: { opacity: 0.6 },
  buttonText: { color: "#FFFFFF", fontSize: 17, fontWeight: "bold" },
  loginBtn: { alignItems: "center", marginTop: 20 },
  loginText: { color: "#6B7A99" },
  loginHighlight: { color: "#A78BFA" },
});
