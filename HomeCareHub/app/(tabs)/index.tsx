import { Link } from 'expo-router';
import { StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function Index() {
  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0D0D1A" />

      {/* Icône centrale */}
      <View style={styles.iconWrapper}>
        <Text style={styles.iconText}>🏠</Text>
      </View>

      {/* Titre */}
      <Text style={styles.title}>Bienvenue</Text>
      <Text style={styles.subtitle}>Contrôle d'Accès Intelligent</Text>
<View style={{ height: 20 }} />


      {/* Chips */}
      <View style={styles.chipsRow}>
        <View style={styles.chip}><Text style={styles.chipText}>🤖 IA Faciale</Text></View>
        <View style={styles.chip}><Text style={styles.chipText}>🔒 Sécurisé</Text></View>
        <View style={styles.chip}><Text style={styles.chipText}>📡 Temps réel</Text></View>
      </View>

      {/* Boutons */}
      <View style={styles.buttonsWrapper}>

        {/* Se connecter — violet plein */}
        <Link href="/login" asChild>
          <TouchableOpacity style={styles.buttonPrimary}>
            <Text style={styles.buttonPrimaryText}>Se connecter</Text>
          </TouchableOpacity>
        </Link>

        {/* Créer un compte — outline violet */}
        <Link href="/signup" asChild>
          <TouchableOpacity style={styles.buttonSecondary}>
            <Text style={styles.buttonSecondaryText}>Créer un compte</Text>
          </TouchableOpacity>
        </Link>

      </View>

      {/* Note sécurité */}
      <Text style={styles.secNote}>Chiffrement AES-256 · Conforme RGPD</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0D0D1A',
    paddingHorizontal: 30,
  },

  // Icône
  iconWrapper: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: '#1E1B3A',
    borderWidth: 1.5,
    borderColor: '#7C5CBF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 28,
  },
  iconText: {
    fontSize: 38,
  },

  // Titres
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 15,
    color: '#A78BFA',
    textAlign: 'center',
    marginTop: 6,
    fontWeight: '600',
  },
  module: {
    fontSize: 12,
    color: '#8A8FAB',
    textAlign: 'center',
    marginTop: 4,
    marginBottom: 24,
  },

  // Chips
  chipsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 40,
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  chip: {
    backgroundColor: '#1A1A2E',
    borderWidth: 1,
    borderColor: '#2E2B52',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  chipText: {
    color: '#B0B8D4',
    fontSize: 12,
  },

  // Boutons
  buttonsWrapper: {
    width: '100%',
    gap: 12,
  },

  // Primaire — violet plein
  buttonPrimary: {
    backgroundColor: '#7C3AED',
    paddingVertical: 16,
    borderRadius: 14,
    width: '100%',
    alignItems: 'center',
    shadowColor: '#7C3AED',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 5,
  },
  buttonPrimaryText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: 'bold',
    letterSpacing: 0.4,
  },

  // Secondaire — outline violet
  buttonSecondary: {
    borderWidth: 1.5,
    borderColor: '#7C3AED',
    paddingVertical: 16,
    borderRadius: 14,
    width: '100%',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  buttonSecondaryText: {
    color: '#A78BFA',
    fontSize: 17,
    fontWeight: '600',
    letterSpacing: 0.4,
  },

  // Note sécurité
  secNote: {
    color: '#8A8FAB',
    fontSize: 11,
    textAlign: 'center',
    marginTop: 32,
  },
});