import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
  ActivityIndicator, Alert, KeyboardAvoidingView, Platform, ScrollView,
  StyleSheet, Text, TextInput, TouchableOpacity, View,
} from 'react-native';
import { API_URL } from '../constants/api';
import { useResponsive } from '../hooks/useResponsive';

export default function Signup() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const { isDesktop } = useResponsive();

  const handleSignup = async () => {
    if (!name || !email || !password || !confirm) {
      Alert.alert('Champs manquants', 'Veuillez remplir tous les champs.');
      return;
    }
    if (password !== confirm) {
      Alert.alert('Erreur', 'Les mots de passe ne correspondent pas.');
      return;
    }
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/auth/register/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: email, email, password }),
      });
      const data = await response.json();
      if (response.ok) {
        Alert.alert('Succès', 'Compte créé avec succès ! Connectez-vous.');
        router.push('/login');
      } else {
        Alert.alert('Erreur', data.error || 'Une erreur est survenue');
      }
    } catch {
      Alert.alert('Erreur', 'Impossible de contacter le serveur');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer} keyboardShouldPersistTaps="handled">
        <View style={styles.logoWrapper}>
          <View style={styles.logoCircle}>
            <Text style={styles.logoEmoji}>🏠</Text>
          </View>
          <Text style={styles.appName}>HomeCareHub</Text>
        </View>

        <View style={[styles.card, isDesktop && { maxWidth: 500, alignSelf: 'center', width: '100%' }]}>
          <Text style={styles.title}>Créer un compte</Text>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Nom complet</Text>
            <TextInput style={styles.input} placeholder="Ex: Jean Dupont" placeholderTextColor="#4A4E6A" value={name} onChangeText={setName} />
          </View>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Email</Text>
            <TextInput style={styles.input} placeholder="exemple@mail.com" placeholderTextColor="#4A4E6A" keyboardType="email-address" autoCapitalize="none" value={email} onChangeText={setEmail} />
          </View>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Mot de passe</Text>
            <TextInput style={styles.input} placeholder="Minimum 8 caractères" placeholderTextColor="#4A4E6A" secureTextEntry value={password} onChangeText={setPassword} />
          </View>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Confirmer le mot de passe</Text>
            <TextInput style={styles.input} placeholder="Répétez votre mot de passe" placeholderTextColor="#4A4E6A" secureTextEntry value={confirm} onChangeText={setConfirm} />
          </View>

          <TouchableOpacity style={[styles.button, loading && styles.buttonDisabled]} onPress={handleSignup} disabled={loading}>
            {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Créer mon compte</Text>}
          </TouchableOpacity>

          <TouchableOpacity style={styles.loginBtn} onPress={() => router.push('/login')}>
            <Text style={styles.loginText}>Déjà un compte ? <Text style={styles.loginHighlight}>Se connecter</Text></Text>
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
  logoCircle: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#1E1B3A', borderWidth: 2, borderColor: '#7C3AED', alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  logoEmoji: { fontSize: 36 },
  appName: { fontSize: 22, fontWeight: 'bold', color: '#FFFFFF' },
  card: { backgroundColor: '#13132A', borderRadius: 24, padding: 28, borderWidth: 1, borderColor: '#2A2750' },
  title: { fontSize: 26, fontWeight: 'bold', color: '#FFFFFF', textAlign: 'center' },
  inputGroup: { marginBottom: 16 },
  label: { fontSize: 13, color: '#A0A8C8', marginBottom: 8 },
  input: { backgroundColor: '#0D0D1A', borderWidth: 1, borderColor: '#2A2750', padding: 14, borderRadius: 12, color: '#FFFFFF' },
  button: { backgroundColor: '#7C3AED', padding: 16, borderRadius: 14, alignItems: 'center' },
  buttonDisabled: { opacity: 0.6 },
  buttonText: { color: '#FFFFFF', fontSize: 17, fontWeight: 'bold' },
  loginBtn: { alignItems: 'center', marginTop: 20 },
  loginText: { color: '#6B7A99' },
  loginHighlight: { color: '#A78BFA' },
});
