import React from 'react';
import Svg, { Circle, ClipPath, Defs, G, LinearGradient, Path, Rect, Stop } from 'react-native-svg';

const HEART_PATH =
  'M512,936 C512,936 96,652 96,378 C96,214 220,102 372,102 C466,102 512,164 512,258 C512,164 558,102 652,102 C804,102 928,214 928,378 C928,652 512,936 512,936 Z';

export function Logo({ size = 64 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 1024 1024">
      <Defs>
        <LinearGradient id="green" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor="#9BD253" />
          <Stop offset="1" stopColor="#6FAE2E" />
        </LinearGradient>
        <LinearGradient id="orange" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor="#FFC24D" />
          <Stop offset="1" stopColor="#F0961B" />
        </LinearGradient>
        <LinearGradient id="blue" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor="#5FD3EF" />
          <Stop offset="1" stopColor="#1FA6D6" />
        </LinearGradient>
        <LinearGradient id="rust" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor="#F97A45" />
          <Stop offset="1" stopColor="#E85526" />
        </LinearGradient>
        <LinearGradient id="pink" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor="#F14A83" />
          <Stop offset="1" stopColor="#D42561" />
        </LinearGradient>
        <ClipPath id="heartClip">
          <Path d={HEART_PATH} />
        </ClipPath>
      </Defs>

      <Path d={HEART_PATH} fill="#FBF3DD" />

      <G clipPath="url(#heartClip)">
        <Rect x="96" y="102" width="416" height="420" fill="url(#green)" />
        <Rect x="512" y="102" width="416" height="420" fill="url(#orange)" />
        <Rect x="96" y="522" width="416" height="420" fill="url(#blue)" />
        <Rect x="512" y="522" width="416" height="420" fill="url(#rust)" />
        <Path d="M304,560 L720,560 L512,924 Z" fill="url(#pink)" />
      </G>

      <Path d={HEART_PATH} fill="none" stroke="#1B2A41" strokeWidth={26} strokeLinejoin="round" />

      <G stroke="#1B2A41" strokeWidth={20} strokeLinejoin="round">
        <Path
          d="M 521.97,504.88 A 118,118 0 1 1 521.97,335.12 L 490.02,368.21 A 72,72 0 1 0 490.02,471.79 Z"
          fill="#FBF3DD"
        />
        <Path
          d="M 502.03,335.12 A 118,118 0 1 1 502.03,504.88 L 533.98,471.79 A 72,72 0 1 0 533.98,368.21 Z"
          fill="#FBF3DD"
        />
      </G>

      <Path
        d="M188,340 A230,230 0 0 1 400,182"
        fill="none"
        stroke="#FFFFFF"
        strokeWidth={20}
        strokeLinecap="round"
        opacity={0.85}
      />
      <Path
        d="M624,182 A230,230 0 0 1 836,340"
        fill="none"
        stroke="#FFFFFF"
        strokeWidth={20}
        strokeLinecap="round"
        opacity={0.85}
      />
      <Circle cx={190} cy={418} r={12} fill="#FFFFFF" opacity={0.9} />
      <Circle cx={834} cy={418} r={12} fill="#FFFFFF" opacity={0.9} />
    </Svg>
  );
}
