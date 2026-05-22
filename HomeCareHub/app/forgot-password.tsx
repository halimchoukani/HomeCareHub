import { useState } from 'react';
import { useRouter } from 'expo-router';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, Alert, ActivityIndicator,
  KeyboardAvoidingView, Platform, ScrollView
} from 'react-native';
import { Colors } from '@/constants/theme';

export default function ForgotPassword() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleEnvoyer = async () => {
    if (!email.trim()) {
      Alert.alert('Erreur', 'Veuillez entrer votre adresse Gmail');
      return;
    }
    if (!email.includes('@')) {
      Alert.alert('Erreur', 'Veuillez entrer une adresse email valide');
      return;
    }
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      Alert.alert(
        'Email envoyé ✅',
        `Un lien de réinitialisation a été envoyé à ${email}`,
        [{ text: 'OK', onPress: () => router.back() }]
      );
    }, 2000);
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer} keyboardShouldPersistTaps="handled">

        {/* Bouton retour */}
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Text style={styles.backText}>←</Text>
        </TouchableOpacity>

        {/* Logo */}
        <View style={styles.logoWrapper}>
          <View style={styles.logoCircle}>
            <Text style={styles.logoEmoji}>🔑</Text>
          </View>
          <Text style={styles.appName}>HomeCareHub</Text>
        </View>

        {/* Carte */}
        <View style={styles.card}>
          <Text style={styles.title}>Mot de passe oublié ?</Text>
          <Text style={styles.subtitle}>
            Entrez votre adresse Gmail et nous vous enverrons un lien pour réinitialiser votre mot de passe
          </Text>

          {/* Champ Gmail */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>📧  Adresse Gmail</Text>
            <TextInput
              style={styles.input}
              placeholder="exemple@gmail.com"
              placeholderTextColor="#4A4E6A"
              keyboardType="email-address"
              autoCapitalize="none"
              value={email}
              onChangeText={setEmail}
            />
          </View>

          {/* Bouton Envoyer */}
          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleEnvoyer}
            disabled={loading}
          >
            {loading
              ? <ActivityIndicator color="#fff" />
              : <Text style={styles.buttonText}>Envoyer le lien 📨</Text>
            }
          </TouchableOpacity>

          {/* Lien retour connexion */}
          <TouchableOpacity style={styles.loginBtn} onPress={() => router.back()}>
            <Text style={styles.loginText}>
              Retour à la {''}
              <Text style={styles.loginHighlight}>connexion</Text>
            </Text>
          </TouchableOpacity>
        </View>

      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 24,
  },
  backBtn: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: Colors.primaryMuted,
    borderWidth: 1, borderColor: Colors.borderAlt,
    alignItems: 'center', justifyContent: 'center',
    marginBottom: 24,
  },
  backText: {
    color: Colors.accent,
    fontSize: 20,
    fontWeight: 'bold',
  },
  logoWrapper: {
    alignItems: 'center',
    marginBottom: 32,
  },
  logoCircle: {
    width: 80, height: 80, borderRadius: 40,
    backgroundColor: Colors.primaryMuted,
    borderWidth: 2, borderColor: Colors.primary,
    alignItems: 'center', justifyContent: 'center',
    marginBottom: 12,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5, shadowRadius: 12, elevation: 8,
  },
  logoEmoji: { fontSize: 36 },
  appName: {
    fontSize: 22, fontWeight: 'bold',
    color: Colors.text, letterSpacing: 1,
  },
  card: {
    backgroundColor: Colors.card,
    borderRadius: 24, padding: 28,
    borderWidth: 1, borderColor: Colors.borderAlt,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4, shadowRadius: 16, elevation: 10,
  },
  title: {
    fontSize: 24, fontWeight: 'bold',
    color: Colors.text, textAlign: 'center', marginBottom: 10,
  },
  subtitle: {
    fontSize: 13, color: Colors.textSubtle,
    textAlign: 'center', marginBottom: 28,
    lineHeight: 20,
  },
  inputGroup: { marginBottom: 20 },
  label: {
    fontSize: 13, fontWeight: '600',
    color: Colors.textSecondary, marginBottom: 8,
  },
  input: {
    backgroundColor: Colors.background,
    borderWidth: 1, borderColor: Colors.borderAlt,
    padding: 14, borderRadius: 12,
    fontSize: 15, color: Colors.text,
  },
  button: {
    backgroundColor: Colors.primary,
    padding: 16, borderRadius: 14,
    alignItems: 'center',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4, shadowRadius: 12, elevation: 6,
    marginBottom: 16,
  },
  buttonDisabled: { opacity: 0.6 },
  buttonText: {
    color: Colors.text, fontSize: 17,
    fontWeight: 'bold', letterSpacing: 0.5,
  },
  loginBtn: { alignItems: 'center', marginTop: 4 },
  loginText: { color: Colors.textSubtle, fontSize: 14 },
  loginHighlight: { color: Colors.accent, fontWeight: '700' },
});
