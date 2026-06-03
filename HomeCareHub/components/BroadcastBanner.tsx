import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import { Animated, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useSocket } from '../contexts/SocketContext';

export default function BroadcastBanner() {
  const { socket, connected } = useSocket();
  const [broadcastMessage, setBroadcastMessage] = useState<string | null>(null);
  const [fadeAnim] = useState(new Animated.Value(0));
  const insets = useSafeAreaInsets();

  useEffect(() => {
    if (!socket || !connected) return;

    const handleBroadcast = (data: { message: string; sender?: string }) => {
      setBroadcastMessage(data.message);
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();

      // Auto dismiss after 10 seconds
      setTimeout(() => {
        dismissBanner();
      }, 10000);
    };

    socket.on('admin_message', handleBroadcast);

    return () => {
      socket.off('admin_message', handleBroadcast);
    };
  }, [socket, connected, fadeAnim]);

  const dismissBanner = () => {
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      setBroadcastMessage(null);
    });
  };

  if (!broadcastMessage) return null;

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim, paddingTop: Math.max(insets.top, 12) }]}>
      <View style={styles.iconContainer}>
        <Ionicons name="megaphone" size={20} color="#FFFFFF" />
      </View>
      <Text style={styles.messageText}>{broadcastMessage}</Text>
      <TouchableOpacity onPress={dismissBanner} style={styles.closeButton}>
        <Ionicons name="close" size={20} color="#FFFFFF" />
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#EF4444', // Red for alert/broadcast
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    zIndex: 1000,
  },
  iconContainer: {
    marginRight: 12,
  },
  messageText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    flex: 1,
  },
  closeButton: {
    padding: 4,
  },
});
