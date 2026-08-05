import React from 'react';
import Svg, { Circle, Ellipse, G, Path, Rect } from 'react-native-svg';
import { colors } from '../../theme/theme';

export type ArtKind =
  | 'apple'
  | 'sunflower'
  | 'bird'
  | 'coffee'
  | 'moon'
  | 'butterfly'
  | 'sailboat'
  | 'umbrella';

export const ART_KINDS: ArtKind[] = [
  'apple',
  'sunflower',
  'bird',
  'coffee',
  'moon',
  'butterfly',
  'sailboat',
  'umbrella',
];

const BROWN = '#8A5A2B';

function Apple() {
  return (
    <>
      <Path
        d="M50 32 C 32 16, 13 30, 16 52 C 19 74, 36 88, 50 83 C 64 88, 81 74, 84 52 C 87 30, 68 16, 50 32 Z"
        fill={colors.rust}
      />
      <Path
        d="M50 32 C 50 24, 52 17, 57 12"
        stroke={BROWN}
        strokeWidth={4.5}
        strokeLinecap="round"
        fill="none"
      />
      <Ellipse cx={64} cy={19} rx={10} ry={5} fill={colors.green} transform="rotate(-28 64 19)" />
      <Ellipse cx={35} cy={42} rx={6} ry={10} fill="#FFFFFF" opacity={0.25} transform="rotate(20 35 42)" />
    </>
  );
}

function Sunflower() {
  return (
    <>
      {[0, 45, 90, 135, 180, 225, 270, 315].map((a) => (
        <Ellipse
          key={a}
          cx={50}
          cy={25}
          rx={9}
          ry={16}
          fill={colors.orangeLight}
          transform={`rotate(${a} 50 50)`}
        />
      ))}
      <Circle cx={50} cy={50} r={15} fill={BROWN} />
      <Circle cx={45} cy={46} r={2} fill="#6E4419" />
      <Circle cx={54} cy={49} r={2} fill="#6E4419" />
      <Circle cx={48} cy={55} r={2} fill="#6E4419" />
    </>
  );
}

function Bird() {
  return (
    <>
      <Path d="M28 64 L12 55 L22 72 Z" fill={colors.blueLight} />
      <Circle cx={48} cy={58} r={24} fill={colors.blue} />
      <Circle cx={68} cy={38} r={14} fill={colors.blue} />
      <Path d="M80 35 L93 40 L80 46 Z" fill={colors.orange} />
      <Circle cx={71} cy={35} r={2.6} fill={colors.navy} />
      <Ellipse cx={42} cy={60} rx={13} ry={8} fill={colors.blueLight} transform="rotate(-24 42 60)" />
      <Ellipse cx={44} cy={80} rx={16} ry={3} fill={colors.navy} opacity={0.08} />
    </>
  );
}

function Coffee() {
  return (
    <>
      <Ellipse cx={48} cy={82} rx={28} ry={6} fill={colors.creamDeep} />
      <Circle cx={68} cy={57} r={10} stroke={colors.rust} strokeWidth={5} fill="none" />
      <Rect x={26} y={42} width={40} height={35} rx={9} fill={colors.rust} />
      <Rect x={26} y={42} width={40} height={9} rx={4.5} fill={colors.rustLight} />
      <Path d="M39 34 C 36 28, 43 26, 40 19" stroke={colors.textFaint} strokeWidth={3.5} strokeLinecap="round" fill="none" />
      <Path d="M53 34 C 50 28, 57 26, 54 19" stroke={colors.textFaint} strokeWidth={3.5} strokeLinecap="round" fill="none" />
    </>
  );
}

function Moon() {
  return (
    <>
      <Path d="M62 12 A 39 39 0 1 0 62 88 A 31 31 0 1 1 62 12 Z" fill="#E8B84B" />
      <Path d="M22 26 L24.5 32 L22 38 L19.5 32 Z" fill={colors.orangeLight} />
      <Path d="M80 62 L83 69 L80 76 L77 69 Z" fill={colors.orangeLight} />
      <Circle cx={30} cy={62} r={3} fill={colors.orangeLight} />
    </>
  );
}

function Butterfly() {
  return (
    <>
      <Ellipse cx={33} cy={41} rx={17} ry={13} fill={colors.pink} transform="rotate(-22 33 41)" />
      <Ellipse cx={67} cy={41} rx={17} ry={13} fill={colors.pink} transform="rotate(22 67 41)" />
      <Ellipse cx={36} cy={64} rx={12} ry={9} fill={colors.orangeLight} transform="rotate(16 36 64)" />
      <Ellipse cx={64} cy={64} rx={12} ry={9} fill={colors.orangeLight} transform="rotate(-16 64 64)" />
      <Ellipse cx={50} cy={55} rx={5} ry={18} fill={colors.navy} />
      <Path d="M47 39 C 43 30, 39 26, 34 23" stroke={colors.navy} strokeWidth={2.5} strokeLinecap="round" fill="none" />
      <Path d="M53 39 C 57 30, 61 26, 66 23" stroke={colors.navy} strokeWidth={2.5} strokeLinecap="round" fill="none" />
      <Circle cx={33} cy={22} r={2.5} fill={colors.navy} />
      <Circle cx={67} cy={22} r={2.5} fill={colors.navy} />
    </>
  );
}

function Sailboat() {
  return (
    <>
      <Rect x={48.5} y={26} width={3} height={44} fill={colors.navy} />
      <Path d="M53 28 L80 62 L53 62 Z" fill={colors.orange} />
      <Path d="M46 34 L28 62 L46 62 Z" fill={colors.orangeLight} />
      <Path d="M26 68 L74 68 L64 82 L36 82 Z" fill={colors.rust} />
      <Path
        d="M8 88 Q 18 82, 28 88 T 48 88 T 68 88 T 88 88"
        stroke={colors.blue}
        strokeWidth={4}
        strokeLinecap="round"
        fill="none"
      />
    </>
  );
}

function Umbrella() {
  return (
    <>
      <Path
        d="M15 55 A 35 35 0 0 1 85 55 Q 79 48, 61.6 55 Q 50 47, 38.3 55 Q 21 48, 15 55 Z"
        fill={colors.green}
      />
      <Path d="M50 22 Q 30 26, 20 52" stroke="#FFFFFF" strokeWidth={3} opacity={0.25} fill="none" />
      <Rect x={48.5} y={12} width={3} height={10} rx={1.5} fill={colors.navy} />
      <Path
        d="M50 56 L50 80 A 7 7 0 0 1 36 80"
        stroke={colors.navy}
        strokeWidth={4.5}
        strokeLinecap="round"
        fill="none"
      />
    </>
  );
}

const ART: Record<ArtKind, () => React.JSX.Element> = {
  apple: Apple,
  sunflower: Sunflower,
  bird: Bird,
  coffee: Coffee,
  moon: Moon,
  butterfly: Butterfly,
  sailboat: Sailboat,
  umbrella: Umbrella,
};

export function CardArt({ kind, size = 52 }: { kind: ArtKind; size?: number }) {
  const Piece = ART[kind];
  return (
    <Svg width={size} height={size} viewBox="0 0 100 100">
      <G>
        <Piece />
      </G>
    </Svg>
  );
}

/** Classic diamond-lattice card back, like traditional memory decks. */
export function CardBack() {
  const diamonds: React.JSX.Element[] = [];
  let n = 0;
  for (let row = 0; row < 5; row++) {
    const y = 10 + row * 20;
    const offset = row % 2 === 0 ? 0 : 10;
    for (let col = 0; col < 4; col++) {
      const x = 10 + col * 20 + offset;
      if (x > 72) continue;
      diamonds.push(
        <Path
          key={n++}
          d={`M${x} ${y - 6} L${x + 5} ${y} L${x} ${y + 6} L${x - 5} ${y} Z`}
          fill="#FFFFFF"
          opacity={0.22}
        />
      );
    }
  }
  return (
    <Svg width="100%" height="100%" viewBox="0 0 80 100" preserveAspectRatio="xMidYMid slice">
      {diamonds}
      <Rect x={5} y={5} width={70} height={90} rx={7} stroke="#FFFFFF" strokeWidth={2.5} opacity={0.55} fill="none" />
    </Svg>
  );
}
