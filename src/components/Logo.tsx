import React from 'react';
import { Image } from 'react-native';

const ASPECT_RATIO = 863 / 929; // logo.png natural height / width

export function Logo({ size = 64 }: { size?: number }) {
  return (
    <Image
      source={require('../../assets/logo.png')}
      style={{ width: size, height: size * ASPECT_RATIO }}
      resizeMode="contain"
    />
  );
}
