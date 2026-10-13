import React, {useEffect, useRef, useState} from 'react';
import {
  FlatList,
  NativeScrollEvent,
  NativeSyntheticEvent,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from 'react-native';
import Svg, {
  Circle,
  Defs,
  Line,
  LinearGradient as SvgGradient,
  Path,
  Stop,
  Text as SvgText,
} from 'react-native-svg';
import Animated, {
  Easing,
  useAnimatedProps,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import {useNavigation} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {
  Activity,
  ArrowRight,
  Route as RouteIcon,
  Satellite,
  ShieldCheck,
  TrendingUp,
} from 'lucide-react-native';
import {AuthStackParamList} from '../../navigation/types';
import {
  fontSize,
  radius,
  scale,
  shadows,
  spacing,
  typography,
} from '../../theme';
import AppImage from '../../components/ui/AppImage';
import Button from '../../components/ui/Button';

type Nav = NativeStackNavigationProp<AuthStackParamList, 'Onboarding'>;

/* ------------------------------------------------------------------ */
/* Design tokens matching the reference splash screens                 */
/* ------------------------------------------------------------------ */
const DS = {
  surface: '#FAF8FF',
  card: '#FFFFFF',
  primary: '#00288E',
  primaryContainer: '#1E40AF',
  secondary: '#006591',
  sky: '#39B8FD',
  skyLight: '#89CEFF',
  skyPale: '#C9E6FF',
  onSurface: '#131B2E',
  onVariant: '#444653',
  outline: '#757684',
  outlineVariant: '#C4C5D5',
  container: '#EAEDFF',
  containerHigh: '#E2E7FF',
  containerHighest: '#DAE2FD',
  containerLow: '#F2F3FF',
  amber: '#FFA929',
  amberDark: '#D97706',
};

const AnimatedCircle = Animated.createAnimatedComponent(Circle);
const AnimatedPath = Animated.createAnimatedComponent(Path);

/* ------------------------------------------------------------------ */
/* Reusable animation primitives                                       */
/* ------------------------------------------------------------------ */

/** Infinitely rotating wrapper (ring rotation, radar sweep, conduits). */
const SpinView: React.FC<{
  size: number;
  duration?: number;
  reverse?: boolean;
  children: React.ReactNode;
}> = ({size, duration = 22000, reverse = false, children}) => {
  const r = useSharedValue(0);
  useEffect(() => {
    r.value = withRepeat(
      withTiming(reverse ? -360 : 360, {duration, easing: Easing.linear}),
      -1,
    );
  }, [duration, reverse, r]);
  const style = useAnimatedStyle(() => ({
    transform: [{rotate: `${r.value}deg`}],
  }));
  return (
    <Animated.View
      style={[
        {width: size, height: size, alignItems: 'center', justifyContent: 'center'},
        style,
      ]}>
      {children}
    </Animated.View>
  );
};

/** Expanding + fading pulse ring (sonar ping effect). */
const PingView: React.FC<{
  size: number;
  color: string;
  duration?: number;
  delay?: number;
  borderWidth?: number;
}> = ({size, color, duration = 2800, delay = 0, borderWidth = 1.5}) => {
  const p = useSharedValue(0);
  useEffect(() => {
    p.value = withDelay(
      delay,
      withRepeat(
        withTiming(1, {duration, easing: Easing.out(Easing.cubic)}),
        -1,
      ),
    );
  }, [delay, duration, p]);
  const style = useAnimatedStyle(() => ({
    transform: [{scale: 0.85 + p.value * 0.5}],
    opacity: 0.8 * (1 - p.value),
  }));
  return (
    <Animated.View
      pointerEvents="none"
      style={[
        {
          position: 'absolute',
          width: size,
          height: size,
          borderRadius: size / 2,
          borderWidth,
          borderColor: color,
        },
        style,
      ]}
    />
  );
};

/** Gentle floating motion for badges / droplets. */
const FloatView: React.FC<{
  distance?: number;
  duration?: number;
  children: React.ReactNode;
  style?: object;
}> = ({distance = 4, duration = 1800, children, style}) => {
  const y = useSharedValue(0);
  useEffect(() => {
    y.value = withRepeat(
      withSequence(
        withTiming(-distance, {duration, easing: Easing.inOut(Easing.ease)}),
        withTiming(0, {duration, easing: Easing.inOut(Easing.ease)}),
      ),
      -1,
    );
  }, [distance, duration, y]);
  const anim = useAnimatedStyle(() => ({transform: [{translateY: y.value}]}));
  return <Animated.View style={[anim, style]}>{children}</Animated.View>;
};

/** SVG path with infinitely flowing dashes (fluid / route motion). */
const FlowPath: React.FC<{
  d: string;
  stroke: string;
  strokeWidth: number;
  dash?: string;
  duration?: number;
  from?: number;
  opacity?: number;
}> = ({d, stroke, strokeWidth, dash = '4 6', duration = 2000, from = 40, opacity = 1}) => {
  const o = useSharedValue(from);
  useEffect(() => {
    o.value = withRepeat(
      withTiming(0, {duration, easing: Easing.linear}),
      -1,
    );
  }, [duration, o]);
  const props = useAnimatedProps(() => ({strokeDashoffset: o.value}));
  return (
    <AnimatedPath
      d={d}
      fill="none"
      stroke={stroke}
      strokeWidth={strokeWidth}
      strokeDasharray={dash}
      strokeLinecap="round"
      strokeOpacity={opacity}
      animatedProps={props}
    />
  );
};

/** SVG circle that repeatedly pulses in radius + opacity. */
const PulseDot: React.FC<{
  x: number;
  y: number;
  r: number;
  color: string;
  duration?: number;
  delay?: number;
  maxOpacity?: number;
}> = ({x, y, r, color, duration = 2600, delay = 0, maxOpacity = 0.35}) => {
  const p = useSharedValue(0);
  useEffect(() => {
    p.value = withDelay(
      delay,
      withRepeat(
        withTiming(1, {duration, easing: Easing.out(Easing.cubic)}),
        -1,
      ),
    );
  }, [delay, duration, p]);
  const props = useAnimatedProps(() => ({
    r: r * (0.9 + p.value * 1.1),
    opacity: maxOpacity * (1 - p.value),
  }));
  return <AnimatedCircle cx={x} cy={y} fill={color} animatedProps={props} />;
};

/** Small live indicator dot with ping halo. */
const LiveDot: React.FC<{color?: string; size?: number}> = ({
  color = DS.secondary,
  size = 8,
}) => (
  <View style={{width: size, height: size}}>
    <PingView size={size} color={color} duration={2000} borderWidth={1} />
    <View
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: color,
      }}
    />
  </View>
);

/* ------------------------------------------------------------------ */
/* Slide 1 — Refinery Fluid Motion (Direct Sourcing)                    */
/* ------------------------------------------------------------------ */
const RefineryGraphic: React.FC<{size: number}> = ({size}) => {
  const gauge = size * 0.8;
  const conduit = size * 0.62;
  const chamber = size * 0.43;
  const droplet = size * 0.25;

  return (
    <View
      style={{width: size, height: size, alignItems: 'center', justifyContent: 'center'}}>
      {/* Outer sonic pulse rings */}
      <PingView size={size * 0.86} color={DS.primary} duration={2800} />
      <View
        style={{
          position: 'absolute',
          width: size * 0.74,
          height: size * 0.74,
          borderRadius: (size * 0.74) / 2,
          borderWidth: 1,
          borderColor: `${DS.sky}40`,
        }}
      />
      {/* Rotating precision gauge ring */}
      <View style={StyleSheet.absoluteFill}>
        <View style={{flex: 1, alignItems: 'center', justifyContent: 'center'}}>
          <SpinView size={gauge} duration={22000}>
            <Svg width={gauge} height={gauge} viewBox="0 0 208 208">
              <Circle
                cx={104}
                cy={104}
                r={100}
                fill="none"
                stroke={DS.outline}
                strokeOpacity={0.18}
                strokeWidth={1.5}
                strokeDasharray="2 6"
              />
              <Circle cx={104} cy={4} r={3} fill={DS.sky} />
              <Circle cx={204} cy={104} r={2.5} fill={DS.amber} />
              <Circle cx={104} cy={204} r={2.5} fill={DS.primaryContainer} />
              <Circle cx={4} cy={104} r={2.5} fill={DS.sky} />
            </Svg>
          </SpinView>
        </View>
      </View>
      {/* Reverse rotating orbital fluid conduit */}
      <View style={StyleSheet.absoluteFill}>
        <View style={{flex: 1, alignItems: 'center', justifyContent: 'center'}}>
          <SpinView size={conduit} duration={26000} reverse>
            <Svg width={conduit} height={conduit} viewBox="0 0 160 160">
              <Circle
                cx={80}
                cy={80}
                r={76}
                fill="none"
                stroke={DS.secondary}
                strokeOpacity={0.35}
                strokeWidth={2}
              />
              <FlowPath
                d="M 80 4 A 76 76 0 1 1 79.9 4"
                stroke={DS.sky}
                strokeWidth={2}
                dash="4 6"
                duration={2000}
                from={40}
              />
              <Circle cx={80} cy={4} r={3.5} fill={DS.amber} />
              <Circle cx={156} cy={80} r={2.5} fill={DS.sky} />
            </Svg>
          </SpinView>
        </View>
      </View>
      {/* Glowing refinery chamber with lubricant droplet */}
      <View
        style={{
          width: chamber,
          height: chamber,
          borderRadius: chamber / 2,
          backgroundColor: DS.card,
          borderWidth: 1.5,
          borderColor: 'rgba(255,255,255,0.9)',
          alignItems: 'center',
          justifyContent: 'center',
          ...shadows.medium,
        }}>
        <FloatView distance={4} duration={1800}>
          <Svg width={droplet} height={droplet} viewBox="0 0 64 64">
            <Defs>
              <SvgGradient id="dropletGrad" x1="22.5" y1="17" x2="41.5" y2="44.5">
                <Stop offset="0%" stopColor={DS.sky} />
                <Stop offset="45%" stopColor={DS.primaryContainer} />
                <Stop offset="100%" stopColor={DS.primary} />
              </SvgGradient>
              <SvgGradient id="amberWave" x1="22.5" y1="34" x2="41.5" y2="44.5">
                <Stop offset="0%" stopColor="#F59E0B" />
                <Stop offset="60%" stopColor={DS.amberDark} />
                <Stop offset="100%" stopColor="#B45309" />
              </SvgGradient>
            </Defs>
            <Path
              d="M18 20C18 16.5 21 14 25 14H39C43 14 46 16.5 46 20V44C46 47.5 43 50 39 50H25C21 50 18 47.5 18 44V20Z"
              fill="#FFFFFF"
              fillOpacity={0.5}
              stroke={DS.primary}
              strokeOpacity={0.25}
              strokeWidth={2}
            />
            <Line x1={18} y1={23} x2={46} y2={23} stroke={DS.secondary} strokeOpacity={0.2} strokeWidth={1.5} />
            <Line x1={18} y1={41} x2={46} y2={41} stroke={DS.secondary} strokeOpacity={0.2} strokeWidth={1.5} />
            <Line x1={10} y1={32} x2={18} y2={32} stroke={DS.secondary} strokeLinecap="round" strokeWidth={2.5} />
            <Circle cx={10} cy={32} r={2} fill={DS.sky} />
            <Line x1={46} y1={32} x2={54} y2={32} stroke={DS.secondary} strokeLinecap="round" strokeWidth={2.5} />
            <Circle cx={54} cy={32} r={2} fill={DS.amber} />
            <Path
              d="M32 17C32 17 41.5 28.5 41.5 35C41.5 40.2 37.2 44.5 32 44.5C26.8 44.5 22.5 40.2 22.5 35C22.5 28.5 32 17 32 17Z"
              fill="url(#dropletGrad)"
              stroke={DS.primary}
              strokeWidth={1.8}
            />
            <Path
              d="M23.2 36C25.5 34.5 28 36.5 31.5 35C35 33.5 38 35.5 40.8 34.2C41.2 35.1 41.5 36 41.5 37C41.5 42 37.5 44.5 32 44.5C26.5 44.5 22.5 42 22.5 37C22.5 36.6 22.7 36.3 23.2 36Z"
              fill="url(#amberWave)"
            />
            <Path
              d="M26.5 29C25.5 31 25.2 33.5 25.4 35"
              stroke="#FFFFFF"
              strokeLinecap="round"
              strokeOpacity={0.85}
              strokeWidth={1.5}
              fill="none"
            />
            <Circle cx={30} cy={23} r={1.2} fill="#FFFFFF" fillOpacity={0.9} />
          </Svg>
        </FloatView>
        <View style={[ominTick, {top: -3}]} />
        <View style={[ominTick, {bottom: -3, backgroundColor: '#F59E0B99'}]} />
        <View style={[ominTick, {left: -3, backgroundColor: `${DS.sky}99`}]} />
        <View style={[ominTick, {right: -3, backgroundColor: `${DS.sky}99`}]} />
      </View>
    </View>
  );
};

const ominTick = {
  position: 'absolute' as const,
  width: 6,
  height: 6,
  borderRadius: 3,
  backgroundColor: `${DS.primary}66`,
};

/* ------------------------------------------------------------------ */
/* Slide 2 — Real-Time Bulk Pricing (animated wave chart)              */
/* ------------------------------------------------------------------ */
const WAVE_D =
  'M 20 160 C 70 160, 95 110, 140 115 C 185 120, 210 55, 260 50 C 295 45, 310 70, 325 65';
const WAVE_FILL = `${WAVE_D} L 325 190 L 20 190 Z`;

const PricingGraphic: React.FC<{width: number; active: boolean}> = ({
  width,
  active,
}) => {
  const height = (width * 210) / 340;
  const draw = useSharedValue(400);
  useEffect(() => {
    if (active) {
      draw.value = 400;
      draw.value = withTiming(0, {
        duration: 2400,
        easing: Easing.bezier(0.16, 1, 0.3, 1),
      });
    }
  }, [active, draw]);
  const drawProps = useAnimatedProps(() => ({strokeDashoffset: draw.value}));

  return (
    <View>
      <Svg width={width} height={height} viewBox="0 0 340 210">
        <Defs>
          <SvgGradient id="curveGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <Stop offset="0%" stopColor={DS.primary} />
            <Stop offset="50%" stopColor={DS.secondary} />
            <Stop offset="100%" stopColor={DS.sky} />
          </SvgGradient>
          <SvgGradient id="areaGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <Stop offset="0%" stopColor={DS.sky} stopOpacity={0.32} />
            <Stop offset="60%" stopColor={DS.secondary} stopOpacity={0.08} />
            <Stop offset="100%" stopColor={DS.primary} stopOpacity={0} />
          </SvgGradient>
        </Defs>
        {[50, 100, 150].map(y => (
          <Line
            key={y}
            x1={20}
            x2={320}
            y1={y}
            y2={y}
            stroke={DS.containerHighest}
            strokeDasharray="3 3"
            strokeWidth={0.75}
          />
        ))}
        <Path d={WAVE_FILL} fill="url(#areaGrad)" />
        <AnimatedPath
          d={WAVE_D}
          fill="none"
          stroke="url(#curveGrad)"
          strokeLinecap="round"
          strokeWidth={3.5}
          strokeDasharray="400"
          animatedProps={drawProps}
        />
        <Circle cx={68} cy={142} r={4} fill={DS.primary} />
        <PulseDot x={68} y={142} r={8} color={DS.primary} duration={2800} maxOpacity={0.2} />
        <Circle cx={140} cy={115} r={4} fill={DS.secondary} />
        <PulseDot x={140} y={115} r={9} color={DS.secondary} duration={2200} maxOpacity={0.25} />
        <PulseDot x={260} y={50} r={12} color={DS.sky} duration={1800} maxOpacity={0.3} />
        <Circle cx={260} cy={50} r={6} fill="#FFFFFF" />
        <Circle cx={260} cy={50} r={4} fill={DS.secondary} />
        <Circle cx={325} cy={65} r={4} fill={DS.sky} />
      </Svg>
      {/* Glassmorphic live delta peak pill */}
      <FloatView
        distance={3}
        duration={1500}
        style={{position: 'absolute', right: width * 0.12, top: height * 0.18}}>
        <View style={styles.peakPill}>
          <TrendingUp size={scale(15)} color={DS.secondary} />
          <Text style={styles.peakText}>+14.8%</Text>
          <View style={styles.peakDot} />
        </View>
      </FloatView>
      {/* Market pulse chip */}
      <View style={[styles.pulseChip, {left: scale(12), bottom: scale(8)}]}>
        <Activity size={scale(14)} color={DS.primary} />
        <Text style={styles.pulseChipText}>Automated Tier Calibration</Text>
      </View>
    </View>
  );
};

/* ------------------------------------------------------------------ */
/* Slide 3 — Nationwide Express Dispatch (logistics network)           */
/* ------------------------------------------------------------------ */
const ARTERY_PRIMARY = 'M 50 125 C 95 70, 190 75, 245 185';

const DispatchGraphic: React.FC<{width: number}> = ({width}) => {
  const height = (width * 250) / 340;
  const t = useSharedValue(0);
  useEffect(() => {
    t.value = withRepeat(
      withTiming(1, {duration: 4800, easing: Easing.linear}),
      -1,
    );
  }, [t]);
  const markerProps = useAnimatedProps(() => {
    const v = t.value;
    const u = 1 - v;
    const x =
      u * u * u * 50 + 3 * u * u * v * 95 + 3 * u * v * v * 190 + v * v * v * 245;
    const y =
      u * u * u * 125 + 3 * u * u * v * 70 + 3 * u * v * v * 75 + v * v * v * 185;
    return {cx: x, cy: y};
  });

  return (
    <Svg width={width} height={height} viewBox="0 0 340 250">
      <Defs>
        <SvgGradient id="routeGradA" x1="0%" y1="0%" x2="100%" y2="100%">
          <Stop offset="0%" stopColor={DS.primary} />
          <Stop offset="50%" stopColor={DS.secondary} />
          <Stop offset="100%" stopColor={DS.sky} />
        </SvgGradient>
        <SvgGradient id="routeGradB" x1="100%" y1="0%" x2="0%" y2="100%">
          <Stop offset="0%" stopColor={DS.primaryContainer} />
          <Stop offset="100%" stopColor={DS.skyLight} />
        </SvgGradient>
      </Defs>
      {/* Static background link matrix */}
      <Line x1={50} y1={125} x2={150} y2={50} stroke={DS.containerHighest} strokeDasharray="3 3" strokeWidth={1.5} />
      <Line x1={150} y1={50} x2={280} y2={85} stroke={DS.containerHighest} strokeDasharray="3 3" strokeWidth={1.5} />
      <Line x1={50} y1={125} x2={130} y2={200} stroke={DS.containerHighest} strokeDasharray="3 3" strokeWidth={1.5} />
      <Line x1={130} y1={200} x2={245} y2={185} stroke={DS.containerHighest} strokeDasharray="3 3" strokeWidth={1.5} />
      <Line x1={245} y1={185} x2={280} y2={85} stroke={DS.containerHighest} strokeDasharray="3 3" strokeWidth={1.5} />
      {/* Animated expressway arteries */}
      <FlowPath d={ARTERY_PRIMARY} stroke="url(#routeGradA)" strokeWidth={3} dash="7 5" duration={2400} from={120} />
      <FlowPath d="M 150 50 C 210 50, 240 120, 280 85" stroke="url(#routeGradB)" strokeWidth={2.5} dash="6 4" duration={3200} from={100} />
      <FlowPath d="M 50 125 C 75 190, 160 215, 245 185" stroke={DS.sky} strokeWidth={2} dash="4 4" duration={2800} from={80} opacity={0.6} />
      {/* Gliding telemetry fleet marker */}
      <AnimatedCircle r={5} fill={DS.primary} animatedProps={markerProps} />
      <AnimatedCircle r={2.5} fill="#FFFFFF" animatedProps={markerProps} />
      {/* HUB 1 — Refinery HQ */}
      <PulseDot x={50} y={125} r={22} color={DS.sky} duration={3000} maxOpacity={0.35} />
      <Circle cx={50} cy={125} r={12} fill={DS.primaryContainer} />
      <Circle cx={50} cy={125} r={5} fill="#FFFFFF" />
      <SvgText x={26} y={151} fill={DS.onSurface} fontSize={10} fontWeight="700">REFINERY HQ</SvgText>
      {/* HUB 2 — North */}
      <PulseDot x={150} y={50} r={16} color={DS.secondary} duration={2600} delay={400} maxOpacity={0.3} />
      <Circle cx={150} cy={50} r={9} fill={DS.secondary} />
      <Circle cx={150} cy={50} r={3.5} fill="#FFFFFF" />
      <SvgText x={128} y={36} fill={DS.onVariant} fontSize={9}>HUB-NORTH</SvgText>
      {/* HUB 3 — Port terminal */}
      <PulseDot x={280} y={85} r={18} color={DS.sky} duration={2900} delay={800} maxOpacity={0.3} />
      <Circle cx={280} cy={85} r={10} fill={DS.primary} />
      <Circle cx={280} cy={85} r={4} fill="#FFFFFF" />
      <SvgText x={252} y={109} fill={DS.onSurface} fontSize={9} fontWeight="700">PORT TERMINAL</SvgText>
      {/* HUB 4 — Central */}
      <Circle cx={130} cy={200} r={7} fill={DS.container} />
      <Circle cx={130} cy={200} r={4} fill={DS.secondary} />
      <SvgText x={112} y={216} fill={DS.outline} fontSize={9}>CENTRAL-04</SvgText>
      {/* HUB 5 — Dealer dispatch */}
      <PulseDot x={245} y={185} r={20} color={DS.primaryContainer} duration={2200} delay={200} maxOpacity={0.4} />
      <Circle cx={245} cy={185} r={11} fill={DS.primaryContainer} />
      <Circle cx={245} cy={185} r={4} fill="#FFFFFF" />
      <SvgText x={213} y={209} fill={DS.primary} fontSize={10} fontWeight="700">DEALER DISPATCH</SvgText>
    </Svg>
  );
};

/* ------------------------------------------------------------------ */
/* Slide definitions                                                   */
/* ------------------------------------------------------------------ */
interface Slide {
  key: 'sourcing' | 'pricing' | 'dispatch';
  title: string;
  subtitle: string;
}

const SLIDES: Slide[] = [
  {
    key: 'sourcing',
    title: 'Direct Sourcing',
    subtitle:
      'Procure premium industrial lubricants directly from certified refineries.',
  },
  {
    key: 'pricing',
    title: 'Real-Time Bulk Pricing',
    subtitle:
      'Live terminal index pricing, automated volume discount tiers, and instant bulk locks.',
  },
  {
    key: 'dispatch',
    title: 'Nationwide Express Dispatch',
    subtitle:
      'Direct refinery routing across 48 distribution hubs with automated order tracking.',
  },
];

export const OnboardingScreen: React.FC = () => {
  const navigation = useNavigation<Nav>();
  const insets = useSafeAreaInsets();
  const {width, height} = useWindowDimensions();
  const [index, setIndex] = useState(0);
  const ref = useRef<FlatList>(null);

  const goToWelcome = () => navigation.navigate('Welcome');
  const goToLogin = () => navigation.navigate('Login');

  const next = () => {
    if (index < SLIDES.length - 1) {
      ref.current?.scrollToIndex({index: index + 1, animated: true});
    } else {
      goToWelcome();
    }
  };
  const onMomentumEnd = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const i = Math.round(
      e.nativeEvent.contentOffset.x / e.nativeEvent.layoutMeasurement.width,
    );
    setIndex(i);
  };

  const cardW = width - spacing.lg * 2;
  const cardInner = cardW - spacing.lg * 2;

  /**
   * Vertical space available for the graphic stage.
   * Header + brand/step sit on top, title + dots + CTAs are pinned
   * to the bottom footer — the card gets whatever is left.
   */
  const stageFor = (key: Slide['key']) => {
    const topReserve =
      insets.top + scale(49) + (key === 'sourcing' ? scale(74) : scale(40));
    const bottomReserve =
      insets.bottom + scale(key === 'dispatch' ? 350 : 250);
    return Math.max(scale(170), height - topReserve - bottomReserve);
  };

  const renderSlide = (item: Slide, active: boolean) => {
    const stageH = stageFor(item.key);
    const refinerySize = Math.max(
      scale(140),
      Math.min(scale(240), stageH - scale(28)),
    );
    const pricingW = Math.max(
      scale(180),
      Math.min(cardInner, ((stageH - scale(64)) * 340) / 210),
    );
    const dispatchW = Math.max(
      scale(180),
      Math.min(cardInner, ((stageH - scale(112)) * 340) / 250),
    );
    return (
    <View style={{width, height}}>
      <View style={[styles.top, {paddingTop: insets.top + spacing.sm}]}>
      {/* Header */}
      {item.key === 'sourcing' ? (
        <View style={styles.headerRow}>
         <View />
          <TouchableOpacity onPress={goToWelcome} activeOpacity={0.7} style={styles.skipHit}>
            <Text style={styles.skipText}>Skip</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.headerRow}>
          {/* <AppImage uri="logo" resizeMode="contain" style={styles.logo} /> */}
          <View></View>
          <View style={styles.headerRight}>
            {/* <View style={styles.stepPill}>
              <Text style={styles.stepPillText}>{item.step}</Text>
            </View> */}
            <TouchableOpacity onPress={goToWelcome} activeOpacity={0.7} style={styles.skipHit}>
              <Text style={styles.skipText}>Skip</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

     
        <View style={styles.brandBlock}>
          <AppImage uri="logo" resizeMode="contain" style={styles.brandLogo} />
          <Text style={styles.brandEyebrow}>WHOLESALE TERMINAL ACCESS</Text>
        </View>
    
      

      </View>

      {/* Middle stage: graphic card vertically centered */}
      <View style={styles.stage}>
      <View style={styles.card}>
        {item.key === 'pricing' && (
          <View style={styles.badgeRow}>
            <View style={styles.badge}>
              <LiveDot />
              <Text style={styles.badgeText}>Spot Terminal • Live</Text>
            </View>
            <View style={styles.badge}>
              <Activity size={scale(13)} color={DS.secondary} />
              <Text style={styles.badgeMono}>ISO VG 460</Text>
            </View>
          </View>
        )}
        {item.key === 'dispatch' && (
          <View style={styles.badgeRow}>
            <View style={styles.badge}>
              <LiveDot />
              <Text style={styles.badgeMono}>48 Hubs Active</Text>
            </View>
            <View style={[styles.badge, styles.badgeTint]}>
              <Satellite size={scale(13)} color={DS.primary} />
              <Text style={styles.badgeTintText}>Telemetry Live</Text>
            </View>
          </View>
        )}

        <View style={styles.graphicWrap}>
          {item.key === 'sourcing' && <RefineryGraphic size={refinerySize} />}
          {item.key === 'pricing' && <PricingGraphic width={pricingW} active={active} />}
          {item.key === 'dispatch' && <DispatchGraphic width={dispatchW} />}
        </View>

        {item.key === 'dispatch' && (
          <View style={styles.infoBar}>
            <View style={styles.infoLeft}>
              <RouteIcon size={scale(15)} color={DS.secondary} />
              <Text style={styles.infoLabel}>Auto Route Matrix</Text>
            </View>
            <View style={styles.infoRight}>
              <Text style={styles.infoValue}>99.84%</Text>
              <Text style={styles.infoLabel}>On-Time Index</Text>
            </View>
          </View>
        )}
      </View>

      </View>

      {/* Bottom footer: title, dots and CTAs pinned at the bottom */}
      <View style={[styles.footer, {paddingBottom: insets.bottom + spacing.lg}]}>
      <Text style={styles.title}>{item.title}</Text>
      <Text style={styles.subtitle}>{item.subtitle}</Text>

      {/* Dots */}
      <View style={styles.dots}>
        {SLIDES.map((s, i) => (
          <View
            key={s.key}
            style={[styles.dot, i === index && styles.dotActive]}
          />
        ))}
      </View>

      {/* CTAs */}
      {item.key === 'dispatch' ? (
        <View style={styles.ctaCol}>
          <Button
            title="Get Started"
            size="medium"
            onPress={goToWelcome}
            iconRight={<ArrowRight size={scale(18)} color="#FFFFFF" />}
            style={styles.primaryBtn}
          />
          <Button
            title="Sign In to Existing Account"
            size="medium"
            variant="outline"
            onPress={goToLogin}
            style={styles.secondaryBtn}
            textStyle={styles.secondaryBtnText}
          />
          <View style={styles.trustRow}>
            <ShieldCheck size={scale(14)} color={DS.secondary} />
            <Text style={styles.trustText}>Secured B2B Wholesale Portal</Text>
          </View>
        </View>
      ) : (
        <View style={styles.ctaCol}>
          <Button
            title="Next"
            size="medium"
            onPress={next}
            iconRight={<ArrowRight size={scale(18)} color="#FFFFFF" />}
            style={styles.primaryBtn}
          />
          <TouchableOpacity
            onPress={goToLogin}
            activeOpacity={0.7}
            style={styles.textBtn}>
            <Text style={styles.textBtnLabel}>Skip to Login</Text>
          </TouchableOpacity>
        </View>
      )}
      </View>
    </View>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar
        translucent
        backgroundColor="transparent"
        barStyle="dark-content"
      />
      <FlatList
        ref={ref}
        style={StyleSheet.absoluteFill}
        data={SLIDES}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        keyExtractor={item => item.key}
        getItemLayout={(_, i) => ({
          length: width,
          offset: width * i,
          index: i,
        })}
        onMomentumScrollEnd={onMomentumEnd}
        onScrollToIndexFailed={() => {}}
        renderItem={({item, index: i}) => (
          <View style={{width}}>{renderSlide(item, i === index)}</View>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: DS.surface,
  },
  top: {
    paddingHorizontal: spacing.lg,
  },
  stage: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
  },
  footer: {
    paddingHorizontal: spacing.lg,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  portalPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: `${DS.container}CC`,
    borderWidth: 1,
    borderColor: DS.containerHighest,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: scale(6),
  },
  portalText: {
    ...typography.semibold,
    fontSize: fontSize.xs,
    letterSpacing: 1.4,
    color: DS.onVariant,
  },
  logo: {
    width: scale(110),
    height: scale(26),
  },

  skipHit: {
    paddingHorizontal: spacing.sm,
    paddingVertical: scale(6),
  },
  skipText: {
    ...typography.semibold,
    fontSize: fontSize.sm,
    color: DS.onVariant,
  },
  brandBlock: {
    alignItems: 'center',
    paddingTop: spacing.sm,
    paddingBottom: spacing.xs,
  },
  brandLogo: {
    width: scale(190),
    height: scale(40),
  },
  brandEyebrow: {
    ...typography.semibold,
    fontSize: fontSize.xs,
    letterSpacing: 2.4,
    color: DS.secondary,
    marginTop: spacing.sm,
  },
  stepRow: {
    alignItems: 'center',
    marginVertical: spacing.sm,
  },
  stepPillCenter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: DS.containerHigh,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: scale(5),
  },
  stepDot: {
    width: scale(6),
    height: scale(6),
    borderRadius: scale(3),
    backgroundColor: DS.sky,
  },
  card: {
    width: '100%',
    backgroundColor: DS.card,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: DS.containerHighest,
    padding: spacing.lg,
    overflow: 'hidden',
    ...shadows.medium,
  },
  graphicWrap: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
    zIndex: 2,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: scale(6),
    backgroundColor: DS.card,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: scale(5),
    ...shadows.small,
  },
  badgeText: {
    ...typography.semibold,
    fontSize: fontSize.xs,
    color: DS.onSurface,
  },
  badgeMono: {
    ...typography.semibold,
    fontSize: fontSize.xs,
    letterSpacing: 0.4,
    color: DS.onSurface,
  },
  badgeTint: {
    backgroundColor: '#DDE1FF',
  },
  badgeTintText: {
    ...typography.semibold,
    fontSize: fontSize.xs,
    color: DS.primary,
  },
  peakPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: scale(6),
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderRadius: radius.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: scale(6),
    ...shadows.medium,
  },
  peakText: {
    ...typography.semibold,
    fontSize: fontSize.sm,
    color: DS.secondary,
  },
  peakDot: {
    width: scale(6),
    height: scale(6),
    borderRadius: scale(3),
    backgroundColor: DS.secondary,
  },
  pulseChip: {
    position: 'absolute',
    flexDirection: 'row',
    alignItems: 'center',
    gap: scale(6),
    backgroundColor: 'rgba(255,255,255,0.85)',
    borderRadius: radius.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: scale(5),
  },
  pulseChipText: {
    ...typography.regular,
    fontSize: fontSize.xs,
    color: DS.onVariant,
  },
  infoBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: DS.containerLow,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    marginTop: spacing.sm,
  },
  infoLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: scale(6),
  },
  infoRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: scale(4),
  },
  infoLabel: {
    ...typography.regular,
    fontSize: fontSize.xs,
    color: DS.onSurface,
  },
  infoValue: {
    ...typography.semibold,
    fontSize: fontSize.sm,
    color: DS.secondary,
  },
  title: {
    ...typography.bold,
    fontSize: fontSize.xxxl,
    color: DS.onSurface,
    textAlign: 'center',
    letterSpacing: -0.4,
    marginTop: spacing.md,
  },
  subtitle: {
    ...typography.regular,
    fontSize: fontSize.sm,
    color: DS.onVariant,
    textAlign: 'center',
    lineHeight: fontSize.sm * 1.5,
    marginTop: spacing.sm,
    paddingHorizontal: spacing.xl,
  },
  dots: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    marginVertical: spacing.lg,
  },
  dot: {
    width: scale(8),
    height: scale(8),
    borderRadius: scale(4),
    backgroundColor: DS.containerHighest,
  },
  dotActive: {
    width: scale(28),
    backgroundColor: DS.primary,
  },
  ctaCol: {
    gap: spacing.sm,
  },
  primaryBtn: {
    backgroundColor: DS.primary,
    borderRadius: radius.md,
  },
  secondaryBtn: {
    backgroundColor: DS.container,
    borderColor: DS.container,
  },
  secondaryBtnText: {
    color: DS.onSurface,
  },
  textBtn: {
    alignItems: 'center',
    paddingVertical: spacing.md,
  },
  textBtnLabel: {
    ...typography.semibold,
    fontSize: fontSize.sm,
    color: DS.secondary,
  },
  trustRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: scale(6),
    marginTop: spacing.md,
    opacity: 0.85,
  },
  trustText: {
    ...typography.regular,
    fontSize: fontSize.xs,
    color: DS.onVariant,
  },
});

export default OnboardingScreen;
