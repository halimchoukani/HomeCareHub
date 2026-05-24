import { Stack, usePathname, useRouter } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import { useEffect } from 'react';
import { UserProvider, useUser } from '../contexts/UserContext';
import { useResponsive } from '../hooks/useResponsive';

function RootRedirector() {
  const { user, loading } = useUser();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (loading) return;
    if (pathname === '/') {
      if (user) router.replace('/home');
      else router.replace('/login');
    }
  }, [loading, user, pathname, router]);

  return null;
}

export default function Layout() {
  const { contentMaxWidth, isDesktop } = useResponsive();
  const pathname = usePathname();

  const isAuthPage = pathname === '/' || pathname === '/login' || pathname === '/signup' || pathname === '/logout';

  return (
    <UserProvider>
      <RootRedirector />
      <View style={[
        styles.rootContainer,
        isDesktop && styles.desktopRoot,
        isDesktop && isAuthPage && styles.desktopCenterAuth,
      ]}>
        <View style={[
          styles.contentContainer,
          isDesktop && { maxWidth: contentMaxWidth },
          isDesktop && !isAuthPage && { flex: 1, alignSelf: 'center' },
        ]}>
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="login" />
            <Stack.Screen name="signup" />
            <Stack.Screen name="forgot-password" />
          </Stack>
        </View>
      </View>
    </UserProvider>
  );
}

const styles = StyleSheet.create({
  rootContainer: {
    flex: 1,
    backgroundColor: '#0D0D1A',
  },
  desktopRoot: {
    backgroundColor: '#0D0D1A',
  },
  desktopCenterAuth: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  contentContainer: {
    flex: 1,
    width: '100%',
  },
});