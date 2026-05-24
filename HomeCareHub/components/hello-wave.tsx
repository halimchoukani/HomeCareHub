import { useEffect, useRef } from 'react';
import { Animated } from 'react-native';

export function HelloWave() {
  const waveAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(waveAnim, { toValue: 1, duration: 300, useNativeDriver: true }),
        Animated.timing(waveAnim, { toValue: 0, duration: 300, useNativeDriver: true }),
      ]),
      { iterations: 4 }
    ).start();
  }, [waveAnim]);

  const rotate = waveAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '25deg'],
  });

  return (
    <Animated.Text style={{ fontSize: 28, lineHeight: 32, marginTop: -6, transform: [{ rotate }] }}>
      👋
    </Animated.Text>
  );
}
