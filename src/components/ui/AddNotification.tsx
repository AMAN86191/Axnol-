import React, {useCallback, useEffect, useRef} from 'react';
import {Animated, Easing, StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import {Check} from 'lucide-react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {radius, scale} from '../../theme';

export type AddNotificationType = 'cart' | 'wishlist' | 'success';

export interface AddNotificationData {
  id: string;
  type: AddNotificationType;
  title: string;
  message?: string;
  duration?: number;
}

interface AddNotificationProps {
  data: AddNotificationData;
  onClose: (id: string) => void;
}

export const AddNotification: React.FC<AddNotificationProps> = ({data, onClose}) => {
  const {title, message, duration = 1600} = data;
  const insets = useSafeAreaInsets();
  const translateY = useRef(new Animated.Value(scale(80))).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.92)).current;
  const checkScale = useRef(new Animated.Value(0)).current;
  const closing = useRef(false);

  const close = useCallback(() => {
    if (closing.current) return;
    closing.current = true;
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 0,
        duration: 140,
        easing: Easing.in(Easing.quad),
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: scale(80),
        duration: 140,
        easing: Easing.in(Easing.quad),
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 0.94,
        duration: 140,
        easing: Easing.in(Easing.quad),
        useNativeDriver: true,
      }),
    ]).start(({finished}) => {
      if (finished) onClose(data.id);
    });
  }, [data.id, onClose, opacity, scaleAnim, translateY]);

  useEffect(() => {
    Animated.sequence([
      Animated.parallel([
        Animated.spring(translateY, {
          toValue: 0,
          friction: 10,
          tension: 140,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 200,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 10,
          tension: 140,
          useNativeDriver: true,
        }),
      ]),
      Animated.spring(checkScale, {
        toValue: 1,
        friction: 6,
        tension: 160,
        useNativeDriver: true,
      }),
    ]).start();

    const timer = setTimeout(close, duration);
    return () => clearTimeout(timer);
  }, [checkScale, close, duration, opacity, scaleAnim, translateY]);

  return (
    <Animated.View
      pointerEvents="box-none"
      style={[
        styles.wrap,
        {
          bottom: insets.bottom + scale(90),
          opacity,
          transform: [{translateY}, {scale: scaleAnim}],
        },
      ]}>
      <TouchableOpacity activeOpacity={0.9} onPress={close} style={styles.card}>
        <Animated.View style={[styles.checkWrap, {transform: [{scale: checkScale}]}]}>
          <View style={styles.checkInner}>
            <Check size={scale(14)} color="#FFFFFF" strokeWidth={3} />
          </View>
        </Animated.View>
        <View style={styles.textWrap}>
          <Text style={styles.title} numberOfLines={1}>{title}</Text>
          {message ? <Text style={styles.message} numberOfLines={1}>{message}</Text> : null}
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  wrap: {
    position: 'absolute',
    alignSelf: 'center',
    zIndex: 9999,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1F2937',
    borderRadius: radius.pill,
    paddingVertical: scale(9),
    paddingHorizontal: scale(16),
    shadowColor: '#000000',
    shadowOffset: {width: 0, height: 10},
    shadowOpacity: 0.18,
    shadowRadius: 18,
    elevation: 12,
    maxWidth: scale(320),
  },
  checkWrap: {
    marginRight: scale(10),
  },
  checkInner: {
    width: scale(24),
    height: scale(24),
    borderRadius: scale(12),
    backgroundColor: '#22C55E',
    alignItems: 'center',
    justifyContent: 'center',
  },
  textWrap: {
    flexShrink: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: scale(6),
  },
  title: {
    fontSize: scale(12.5),
    fontWeight: '700',
    color: '#FFFFFF',
  },
  message: {
    fontSize: scale(12),
    color: 'rgba(255,255,255,0.8)',
  },
});

export default AddNotification;
