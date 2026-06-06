

import { Ionicons } from '@expo/vector-icons';
import { Tabs, usePathname, useRouter } from 'expo-router';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import BroadcastBanner from '../../components/BroadcastBanner';
import { useUser } from '../../contexts/UserContext';
import { useResponsive } from '../../hooks/useResponsive';

function DesktopNavbar() {
  const router = useRouter();
  const pathname = usePathname();
  const { logout, role } = useUser();

  const navItems = [
    { name: 'Home', icon: 'home', path: '/home' },
    { name: 'Contrôle', icon: 'shield-checkmark', path: '/controle-acces' },
    { name: 'Alertes', icon: 'notifications', path: '/alertes' },
    { name: 'Caméras', icon: 'videocam', path: '/surveillance' },
    { name: 'Interphone', icon: 'call', path: '/interphone' },
    { name: 'Activité', icon: 'list', path: '/logs' },
  ];

  const handleLogout = async () => {
    await logout();
    router.replace('/' as any);
  };

  return (
    <View style={styles.desktopNavbar}>
      <View style={styles.navbarContent}>
        <TouchableOpacity onPress={() => router.push('/home' as any)}>
          <Text style={styles.logoText}>HomeCareHub</Text>
        </TouchableOpacity>

        <View style={styles.navLinks}>
          {navItems.map((item) => {
            const isActive = pathname === item.path;
            if (item.path === "/interphone" && role !== "owner") {
              return null;
            }
            return (
              <TouchableOpacity
                key={item.path}
                style={[styles.navItem, isActive && styles.navItemActive]}
                onPress={() => router.push(item.path as any)}
              >
                <Ionicons
                  name={item.icon as any}
                  size={20}
                  color={isActive ? '#A78BFA' : '#6B7A99'}
                />
                <Text style={[styles.navText, isActive && styles.navTextActive]}>
                  {item.name}
                </Text>
              </TouchableOpacity>
            );
          })}

          <TouchableOpacity
            style={[styles.navItem, styles.logoutLink]}
            onPress={handleLogout}
          >
            <Ionicons name="log-out-outline" size={20} color="#EF4444" />
            <Text style={[styles.navText, { color: '#EF4444' }]}>Quitter</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

export default function TabsLayout() {
  const insets = useSafeAreaInsets();
  const { isDesktop } = useResponsive();
  const { role } = useUser();

  return (
    <View style={{ flex: 1, backgroundColor: '#0D0D1A' }}>
      <BroadcastBanner />
      {isDesktop && <DesktopNavbar />}
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarStyle: {
            backgroundColor: '#0D0D1A',
            borderTopWidth: 1,
            borderTopColor: '#2E2B52',
            height: isDesktop ? 0 : 60 + insets.bottom,
            display: isDesktop ? 'none' : 'flex',
            paddingBottom: insets.bottom ? insets.bottom : 8,
            paddingTop: 8,
          },
          tabBarActiveTintColor: '#A78BFA',
          tabBarInactiveTintColor: '#6B7A99',
          tabBarLabelStyle: {
            fontSize: 11,
            fontWeight: '600',
          },
        }}
      >
        <Tabs.Screen
          name="home"
          options={{
            title: 'Home',
            tabBarIcon: ({ color }) => <Ionicons name="home" color={color} size={22} />,
          }}
        />
        <Tabs.Screen
          name="controle-acces"
          options={{
            title: 'Contrôle',
            tabBarIcon: ({ color }) => <Ionicons name="shield-checkmark" color={color} size={22} />,
          }}
        />
        <Tabs.Screen
          name="alertes"
          options={{
            title: 'Alertes',
            tabBarIcon: ({ color }) => <Ionicons name="notifications" color={color} size={22} />,
          }}
        />
        <Tabs.Screen
          name="surveillance"
          options={{
            title: 'Caméras',
            tabBarIcon: ({ color }) => <Ionicons name="videocam" color={color} size={22} />,
          }}
        />
        <Tabs.Screen
          name="interphone"
          options={{
            title: 'Interphone',
            tabBarIcon: ({ color }) => <Ionicons name="call" color={color} size={22} />,
            href: role !== "owner" ? null : "/interphone",
          }}

        />


        <Tabs.Screen
          name="contact-admin"
          options={{
            title: 'Support',
            tabBarIcon: ({ color }) => <Ionicons name="headset" color={color} size={22} />,
          }}
        />
        <Tabs.Screen
          name="logs"
          options={{
            title: 'Activité',
            tabBarIcon: ({ color }) => <Ionicons name="list" color={color} size={22} />,
          }}
        />
        <Tabs.Screen
          name="add-person"
          options={{
            href: null,
          }}
        />
      </Tabs>
    </View>
  );
}

const styles = StyleSheet.create({
  desktopNavbar: {
    height: 70,
    backgroundColor: '#13132A',
    borderBottomWidth: 1,
    borderBottomColor: '#2E2B52',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 100,
  },
  navbarContent: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  logoText: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  navLinks: {
    flexDirection: 'row',
    gap: 8,
  },
  navItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    gap: 8,
  },
  navItemActive: {
    backgroundColor: 'rgba(167, 139, 250, 0.1)',
  },
  navText: {
    color: '#6B7A99',
    fontSize: 14,
    fontWeight: '600',
  },
  navTextActive: {
    color: '#A78BFA',
  },
  logoutLink: {
    marginLeft: 20,
    borderLeftWidth: 1,
    borderLeftColor: '#2E2B52',
    paddingLeft: 20,
  },
});
