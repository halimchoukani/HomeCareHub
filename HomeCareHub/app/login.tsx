import { useRouter } from 'expo-router';
import { useState, useEffect } from 'react';
import {
  KeyboardAvoidingView, Platform, ScrollView,
  StyleSheet, Text, TextInput,
  TouchableOpacity, View, Alert, ActivityIndicator
} from 'react-native';
import { Colors } from '@/constants/theme';
import { ENDPOINTS } from '@/constants/config';
import { saveTokens, isUserLoggedIn } from '@/constants/api';

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    checkLoginStatus();
  }, []);

  const checkLoginStatus = async () => {
    const loggedIn = await isUserLoggedIn();
    if (loggedIn) {
      router.replace('/home');
    }
  };

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Champs manquants', 'Veuillez remplir tous les champs.');
      return;
    }
    setLoading(true);
    try {
      const response = await fetch(ENDPOINTS.login, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: email, email, password }),
      });
      const data = await response.json();
      if (response.ok) {
        // Save simplejwt tokens securely to AsyncStorage
        await saveTokens(data.access, data.refresh);
        Alert.alert('Bienvenue 👋', `Bonjour ${data.name || email} !`);
        router.replace('/home');
      } else {
        Alert.alert('Erreur', data.error || 'Identifiants incorrects');
      }
    } catch (e) {
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
          <Text style={styles.title}>Connexion</Text>
          <Text style={styles.subtitle}>Accès sécurisé à votre espace</Text>

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
              placeholder="Votre mot de passe"
              placeholderTextColor="#4A4E6A"
              secureTextEntry
              value={password}
              onChangeText={setPassword}
            />
          </View>

          <TouchableOpacity
            style={styles.forgotWrapper}
            onPress={() => router.push('/forgot-password')}
          >
            <Text style={styles.forgotText}>Mot de passe oublié ?</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleLogin}
            disabled={loading}
          >
            {loading
              ? <ActivityIndicator color="#fff" />
              : <Text style={styles.buttonText}>Se connecter</Text>
            }
          </TouchableOpacity>

          <View style={styles.separator}>
            <View style={styles.separatorLine} />
            <Text style={styles.separatorText}>ou</Text>
            <View style={styles.separatorLine} />
          </View>

          <TouchableOpacity style={styles.signupBtn} onPress={() => router.push('/signup')}>
            <Text style={styles.signupText}>
              Pas encore de compte ?{'  '}
              <Text style={styles.signupHighlight}>S'inscrire</Text>
            </Text>
          </TouchableOpacity>
        </View>

      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  scrollContainer: { flexGrow: 1, justifyContent: 'center', padding: 24 },
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
  forgotWrapper: { alignSelf: 'flex-end', marginBottom: 24, marginTop: -6 },
  forgotText: { color: Colors.accent, fontSize: 13, fontWeight: '500' },
  button: {
    backgroundColor: Colors.primary, padding: 16, borderRadius: 14, alignItems: 'center',
    shadowColor: Colors.primary, shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4, shadowRadius: 12, elevation: 6,
  },
  buttonDisabled: { opacity: 0.6 },
  buttonText: { color: Colors.text, fontSize: 17, fontWeight: 'bold', letterSpacing: 0.5 },
  separator: { flexDirection: 'row', alignItems: 'center', marginVertical: 20 },
  separatorLine: { flex: 1, height: 1, backgroundColor: Colors.borderAlt },
  separatorText: { color: '#4A4E6A', paddingHorizontal: 12, fontSize: 13 },
  signupBtn: { alignItems: 'center' },
  signupText: { color: Colors.textSubtle, fontSize: 14 },
  signupHighlight: { color: Colors.accent, fontWeight: '700' },
});
