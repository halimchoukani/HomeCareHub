import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
  KeyboardAvoidingView, Platform, ScrollView,
  StyleSheet, Text, TextInput,
  TouchableOpacity, View, Alert, ActivityIndicator
} from 'react-native';
import { Colors } from '@/constants/theme';
import { ENDPOINTS } from '@/constants/config';

export default function Signup() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSignup = async () => {
    if (!name || !email || !password || !confirm) {
      Alert.alert('Champs manquants', 'Veuillez remplir tous les champs.');
      return;
    }
    if (password !== confirm) {
      Alert.alert('Erreur', 'Les mots de passe ne correspondent pas.');
      return;
    }
    if (password.length < 8) {
      Alert.alert('Erreur', 'Le mot de passe doit contenir au moins 8 caractères.');
      return;
    }
    setLoading(true);
    try {
      const response = await fetch(ENDPOINTS.register, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: name, email, password }),
      });
      const data = await response.json();
      if (response.ok) {
        Alert.alert('Succès ✅', 'Compte créé avec succès ! Connectez-vous.');
        router.push('/login');
      } else {
        Alert.alert('Erreur', data.error || 'Une erreur est survenue');
      }
    } catch (e) {
      console.log(e);
      Alert.alert('Erreur', 'Impossible de contacter le serveur');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer} keyboardShouldPersistTaps="handled">

        <View style={styles.logoWrapper}>
          <View style={styles.logoCircle}>
            <Text style={styles.logoEmoji}>🏠</Text>
          </View>
          <Text style={styles.appName}>HomeCareHub</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.title}>Créer un compte</Text>
          <Text style={styles.subtitle}>Rejoignez la plateforme dès maintenant</Text>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>👤  Nom complet</Text>
            <TextInput
              style={styles.input}
              placeholder="Ex: Jean Dupont"
              placeholderTextColor="#4A4E6A"
              value={name}
              onChangeText={setName}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>📧  Email</Text>
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
            <Text style={styles.label}>🔒  Mot de passe</Text>
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
            <Text style={styles.label}>🔒  Confirmer le mot de passe</Text>
            <TextInput
              style={[styles.input, confirm.length > 0 && password !== confirm && styles.inputError]}
              placeholder="Répétez votre mot de passe"
              placeholderTextColor="#4A4E6A"
              secureTextEntry
              value={confirm}
              onChangeText={setConfirm}
            />
            {confirm.length > 0 && password !== confirm && (
              <Text style={styles.errorText}>Les mots de passe ne correspondent pas</Text>
            )}
          </View>

          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleSignup}
            disabled={loading}
          >
            {loading
              ? <ActivityIndicator color="#fff" />
              : <Text style={styles.buttonText}>Créer mon compte</Text>
            }
          </TouchableOpacity>

          <View style={styles.separator}>
            <View style={styles.separatorLine} />
            <Text style={styles.separatorText}>ou</Text>
            <View style={styles.separatorLine} />
          </View>

          <TouchableOpacity style={styles.loginBtn} onPress={() => router.push('/login')}>
            <Text style={styles.loginText}>
              Déjà un compte ?{'  '}
              <Text style={styles.loginHighlight}>Se connecter</Text>
            </Text>
          </TouchableOpacity>
        </View>

      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  scrollContainer: { flexGrow: 1, justifyContent: 'center', padding: 24, paddingVertical: 40 },
  logoWrapper: { alignItems: 'center', marginBottom: 32 },
  logoCircle: {
    width: 80, height: 80, borderRadius: 40,
    backgroundColor: Colors.primaryMuted, borderWidth: 2, borderColor: Colors.primary,
    alignItems: 'center', justifyContent: 'center', marginBottom: 12,
    shadowColor: Colors.primary, shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5, shadowRadius: 12, elevation: 8,
  },
  logoEmoji: { fontSize: 36 },
  appName: { fontSize: 22, fontWeight: 'bold', color: Colors.text, letterSpacing: 1 },
  card: {
    backgroundColor: Colors.card, borderRadius: 24, padding: 28,
    borderWidth: 1, borderColor: Colors.borderAlt,
    shadowColor: '#000', shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4, shadowRadius: 16, elevation: 10,
  },
  title: { fontSize: 26, fontWeight: 'bold', color: Colors.text, textAlign: 'center', marginBottom: 6 },
  subtitle: { fontSize: 14, color: Colors.textSubtle, textAlign: 'center', marginBottom: 28 },
  inputGroup: { marginBottom: 16 },
  label: { fontSize: 13, fontWeight: '600', color: Colors.textSecondary, marginBottom: 8 },
  input: {
    backgroundColor: Colors.background, borderWidth: 1, borderColor: Colors.borderAlt,
    padding: 14, borderRadius: 12, fontSize: 15, color: Colors.text,
  },
  inputError: { borderColor: Colors.danger },
  errorText: { color: Colors.danger, fontSize: 12, marginTop: 4, marginLeft: 4 },
  button: {
    backgroundColor: Colors.primary, padding: 16, borderRadius: 14,
    alignItems: 'center', marginTop: 8,
    shadowColor: Colors.primary, shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4, shadowRadius: 12, elevation: 6,
  },
  buttonDisabled: { opacity: 0.6 },
  buttonText: { color: Colors.text, fontSize: 17, fontWeight: 'bold', letterSpacing: 0.5 },
  separator: { flexDirection: 'row', alignItems: 'center', marginVertical: 20 },
  separatorLine: { flex: 1, height: 1, backgroundColor: Colors.borderAlt },
  separatorText: { color: '#4A4E6A', paddingHorizontal: 12, fontSize: 13 },
  loginBtn: { alignItems: 'center' },
  loginText: { color: Colors.textSubtle, fontSize: 14 },
  loginHighlight: { color: Colors.accent, fontWeight: '700' },
});
