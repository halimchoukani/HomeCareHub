import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
  KeyboardAvoidingView, Platform, ScrollView,
  StyleSheet, Text, TextInput,
  TouchableOpacity, View, Alert, ActivityIndicator
} from 'react-native';

export default function Login() {
  const router = useRouter();
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading]   = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Champs manquants', 'Veuillez remplir tous les champs.');
      return;
    }
    setLoading(true);
    try {
      const response = await fetch('http://192.168.1.108:8000/api/auth/login/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await response.json();
      if (response.ok) {
        Alert.alert('Bienvenue 👋', `Bonjour ${data.name} !`);
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
  container: { flex: 1, backgroundColor: '#0D0D1A' },
  scrollContainer: { flexGrow: 1, justifyContent: 'center', padding: 24 },
  logoWrapper: { alignItems: 'center', marginBottom: 32 },
  logoCircle: {
    width: 80, height: 80, borderRadius: 40,
    backgroundColor: '#1E1B3A', borderWidth: 2, borderColor: '#7C3AED',
    alignItems: 'center', justifyContent: 'center', marginBottom: 12,
    shadowColor: '#7C3AED', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5, shadowRadius: 12, elevation: 8,
  },
  logoEmoji: { fontSize: 36 },
  appName: { fontSize: 22, fontWeight: 'bold', color: '#FFFFFF', letterSpacing: 1 },
  card: {
    backgroundColor: '#13132A', borderRadius: 24, padding: 28,
    borderWidth: 1, borderColor: '#2A2750',
    shadowColor: '#000', shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4, shadowRadius: 16, elevation: 10,
  },
  title: { fontSize: 26, fontWeight: 'bold', color: '#FFFFFF', textAlign: 'center', marginBottom: 6 },
  subtitle: { fontSize: 14, color: '#6B7A99', textAlign: 'center', marginBottom: 28 },
  inputGroup: { marginBottom: 16 },
  label: { fontSize: 13, fontWeight: '600', color: '#A0A8C8', marginBottom: 8 },
  input: {
    backgroundColor: '#0D0D1A', borderWidth: 1, borderColor: '#2A2750',
    padding: 14, borderRadius: 12, fontSize: 15, color: '#FFFFFF',
  },
  forgotWrapper: { alignSelf: 'flex-end', marginBottom: 24, marginTop: -6 },
  forgotText: { color: '#A78BFA', fontSize: 13, fontWeight: '500' },
  button: {
    backgroundColor: '#7C3AED', padding: 16, borderRadius: 14, alignItems: 'center',
    shadowColor: '#7C3AED', shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4, shadowRadius: 12, elevation: 6,
  },
  buttonDisabled: { opacity: 0.6 },
  buttonText: { color: '#FFFFFF', fontSize: 17, fontWeight: 'bold', letterSpacing: 0.5 },
  separator: { flexDirection: 'row', alignItems: 'center', marginVertical: 20 },
  separatorLine: { flex: 1, height: 1, backgroundColor: '#2A2750' },
  separatorText: { color: '#4A4E6A', paddingHorizontal: 12, fontSize: 13 },
  signupBtn: { alignItems: 'center' },
  signupText: { color: '#6B7A99', fontSize: 14 },
  signupHighlight: { color: '#A78BFA', fontWeight: '700' },
});