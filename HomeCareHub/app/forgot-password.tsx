import { useState } from 'react';
import { useRouter } from 'expo-router';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator,
  KeyboardAvoidingView, Platform, ScrollView,
} from 'react-native';

export default function ForgotPassword() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleEnvoyer = async () => {
    if (!email.trim()) {
      Alert.alert('Erreur', 'Veuillez entrer votre adresse email');
      return;
    }
    if (!email.includes('@')) {
      Alert.alert('Erreur', 'Veuillez entrer une adresse email valide');
      return;
    }
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      Alert.alert('Email envoyé', `Un lien de réinitialisation a été envoyé à ${email}`, [
        { text: 'OK', onPress: () => router.back() },
      ]);
    }, 2000);
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer} keyboardShouldPersistTaps="handled">
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Text style={styles.backText}>←</Text>
        </TouchableOpacity>
        <View style={styles.logoWrapper}>
          <View style={styles.logoCircle}><Text style={styles.logoEmoji}>🔑</Text></View>
          <Text style={styles.appName}>HomeCareHub</Text>
        </View>
        <View style={styles.card}>
          <Text style={styles.title}>Mot de passe oublié ?</Text>
          <Text style={styles.subtitle}>Entrez votre adresse email et nous vous enverrons un lien pour réinitialiser votre mot de passe</Text>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Adresse email</Text>
            <TextInput style={styles.input} placeholder="exemple@gmail.com" placeholderTextColor="#4A4E6A" keyboardType="email-address" autoCapitalize="none" value={email} onChangeText={setEmail} />
          </View>
          <TouchableOpacity style={[styles.button, loading && styles.buttonDisabled]} onPress={handleEnvoyer} disabled={loading}>
            {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Envoyer le lien</Text>}
          </TouchableOpacity>
          <TouchableOpacity style={styles.loginBtn} onPress={() => router.back()}>
            <Text style={styles.loginText}>Retour à la <Text style={styles.loginHighlight}>connexion</Text></Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0D0D1A' },
  scrollContainer: { flexGrow: 1, justifyContent: 'center', padding: 24 },
  backBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#1E1B3A', borderWidth: 1, borderColor: '#2A2750', alignItems: 'center', justifyContent: 'center', marginBottom: 24 },
  backText: { color: '#A78BFA', fontSize: 20, fontWeight: 'bold' },
  logoWrapper: { alignItems: 'center', marginBottom: 32 },
  logoCircle: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#1E1B3A', borderWidth: 2, borderColor: '#7C3AED', alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  logoEmoji: { fontSize: 36 },
  appName: { fontSize: 22, fontWeight: 'bold', color: '#FFFFFF', letterSpacing: 1 },
  card: { backgroundColor: '#13132A', borderRadius: 24, padding: 28, borderWidth: 1, borderColor: '#2A2750' },
  title: { fontSize: 24, fontWeight: 'bold', color: '#FFFFFF', textAlign: 'center', marginBottom: 10 },
  subtitle: { fontSize: 13, color: '#6B7A99', textAlign: 'center', marginBottom: 28, lineHeight: 20 },
  inputGroup: { marginBottom: 20 },
  label: { fontSize: 13, fontWeight: '600', color: '#A0A8C8', marginBottom: 8 },
  input: { backgroundColor: '#0D0D1A', borderWidth: 1, borderColor: '#2A2750', padding: 14, borderRadius: 12, fontSize: 15, color: '#FFFFFF' },
  button: { backgroundColor: '#7C3AED', padding: 16, borderRadius: 14, alignItems: 'center', marginBottom: 16 },
  buttonDisabled: { opacity: 0.6 },
  buttonText: { color: '#FFFFFF', fontSize: 17, fontWeight: 'bold' },
  loginBtn: { alignItems: 'center', marginTop: 4 },
  loginText: { color: '#6B7A99', fontSize: 14 },
  loginHighlight: { color: '#A78BFA', fontWeight: '700' },
});
