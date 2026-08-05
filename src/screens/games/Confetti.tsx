import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, View } from 'react-native';
import { colors } from '../../theme/theme';

const PALETTE = [
  colors.green,
  colors.greenLight,
  colors.blue,
  colors.blueLight,
  colors.orange,
  colors.orangeLight,
  colors.pink,
  colors.pinkLight,
];

type Piece = {
  anim: Animated.Value;
  x: number;
  delay: number;
  duration: number;
  rot: number;
  color: string;
  size: number;
};

export function Confetti({ count = 26 }: { count?: number }) {
  const pieces = useRef<Piece[]>(
    Array.from({ length: count }, () => ({
      anim: new Animated.Value(0),
      x: Math.random() * 100,
      delay: Math.random() * 500,
      duration: 1800 + Math.random() * 900,
      rot: 360 + Math.random() * 540,
      color: PALETTE[Math.floor(Math.random() * PALETTE.length)],
      size: 7 + Math.random() * 6,
    }))
  ).current;

  useEffect(() => {
    const anims = pieces.map((p) =>
      Animated.timing(p.anim, {
        toValue: 1,
        duration: p.duration,
        delay: p.delay,
        useNativeDriver: true,
      })
    );
    Animated.parallel(anims).start();
  }, [pieces]);

  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      {pieces.map((p, i) => {
        const translateY = p.anim.interpolate({ inputRange: [0, 1], outputRange: [-40, 560] });
        const rotate = p.anim.interpolate({ inputRange: [0, 1], outputRange: ['0deg', `${p.rot}deg`] });
        const opacity = p.anim.interpolate({ inputRange: [0, 0.75, 1], outputRange: [1, 1, 0] });
        return (
          <Animated.View
            key={i}
            style={{
              position: 'absolute',
              top: 0,
              left: `${p.x}%`,
              width: p.size,
              height: p.size * 0.65,
              borderRadius: 2,
              backgroundColor: p.color,
              opacity,
              transform: [{ translateY }, { rotate }],
            }}
          />
        );
      })}
    </View>
  );
}
