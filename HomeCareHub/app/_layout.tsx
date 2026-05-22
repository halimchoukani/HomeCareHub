import { Stack } from 'expo-router';

export default function Layout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ title: 'Accueil' }} />
      <Stack.Screen name="login" options={{ title: 'Connexion' }} />
      <Stack.Screen name="signup" options={{ title: 'Inscription' }} />
    </Stack>
  );
}