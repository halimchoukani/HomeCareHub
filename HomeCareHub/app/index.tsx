import React from 'react';
import { ActivityIndicator, View } from 'react-native';

export default function Index() {
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#0D0D1A' }}>
      <ActivityIndicator size="large" color="#7C3AED" />
    </View>
  );
}
