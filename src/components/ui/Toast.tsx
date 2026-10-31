import React, {useCallback, useEffect, useRef} from 'react';
import {
  Animated,
  Easing,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {
  AlertCircle,
  AlertTriangle,
  CheckCircle2,
  Info,
  X,
} from 'lucide-react-native';
import type {LucideIcon} from 'lucide-react-native';
import {colors, radius, scale, spacing, typography} from '../../theme';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface ToastAction {
  label: string;
  onPress: () => void;
  style?: 'default' | 'destructive';
}

export interface ToastData {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  action?: ToastAction;
  duration: number;
}

interface Theme {
  icon: LucideIcon;
  accent: string;
  tint: string;
}

const THEMES: Record<ToastType, Theme> = {
  success: {icon: CheckCircle2, accent: colors.success, tint: colors.successLight},
  error: {icon: AlertCircle, accent: colors.danger, tint: colors.dangerLight},
  warning: {icon: AlertTriangle, accent: colors.warning, tint: colors.warningLight},
  info: {icon: Info, accent: colors.info, tint: colors.infoLight},
};

interface ToastProps {
  data: ToastData;
  onClose: (id: string) => void;
}

export const Toast: React.FC<ToastProps> = ({data, onClose}) => {
  const {type, title, message, action} = data;
  const conf = THEMES[type];
  const Icon = conf.icon;

  const translateY = useRef(new Animated.Value(-scale(22))).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.94)).current;
  const progress = useRef(new Animated.Value(1)).current;
  const closing = useRef(false);

  const close = useCallback(() => {
    if (closing.current) {
      return;
    }
    closing.current = true;
    progress.stopAnimation();
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 0,
        duration: 160,
        easing: Easing.in(Easing.quad),
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: -scale(16),
        duration: 160,
        easing: Easing.in(Easing.quad),
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 0.96,
        duration: 160,
        easing: Easing.in(Easing.quad),
        useNativeDriver: true,
      }),
    ]).start(({finished}) => {
      if (finished) {
        onClose(data.id);
      }
    });
  }, [data.id, onClose, opacity, progress, scaleAnim, translateY]);

  useEffect(() => {
    Animated.parallel([
      Animated.spring(translateY, {
        toValue: 0,
        friction: 8,
        tension: 120,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 1,
        duration: 180,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 8,
        tension: 120,
        useNativeDriver: true,
      }),
    ]).start();

    if (action || data.duration <= 0) {
      return;
    }

    Animated.timing(progress, {
      toValue: 0,
      duration: data.duration,
      easing: Easing.linear,
      useNativeDriver: false,
    }).start(({finished}) => {
      if (finished) {
        close();
      }
    });

    return () => {
      progress.stopAnimation();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleAction = (a: ToastAction) => {
    close();
    a.onPress();
  };

  const progressWidth = progress.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  return (
    <Animated.View
      style={[
        styles.wrap,
        {
          opacity,
          transform: [{translateY}, {scale: scaleAnim}],
        },
      ]}>
      <View style={styles.card}>
        <View style={[styles.accentRail, {backgroundColor: conf.accent}]} />
        <View style={[styles.iconBadge, {backgroundColor: conf.tint}]}>
          <Icon size={scale(20)} color={conf.accent} strokeWidth={2.2} />
        </View>

        <View style={styles.textWrap}>
          <Text style={styles.title} numberOfLines={2}>
            {title}
          </Text>
          {message ? (
            <Text style={styles.message} numberOfLines={3}>
              {message}
            </Text>
          ) : null}

          {action ? (
            <View style={styles.actionRow}>
              <TouchableOpacity
                accessibilityRole="button"
                activeOpacity={0.7}
                style={styles.cancelBtn}
                onPress={close}>
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                accessibilityRole="button"
                activeOpacity={0.85}
                style={[
                  styles.actionBtn,
                  {backgroundColor: conf.accent},
                ]}
                onPress={() => handleAction(action)}>
                <Text style={styles.actionText}>{action.label}</Text>
              </TouchableOpacity>
            </View>
          ) : null}
        </View>

        <TouchableOpacity
          accessibilityRole="button"
          accessibilityLabel="Dismiss notification"
          style={styles.closeBtn}
          activeOpacity={0.6}
          onPress={close}
          hitSlop={{top: 8, bottom: 8, left: 8, right: 8}}>
          <X size={scale(13)} color={colors.textMuted} strokeWidth={2.4} />
        </TouchableOpacity>

        {!action && data.duration > 0 ? (
          <View style={styles.progressTrack}>
            <Animated.View
              style={[
                styles.progressBar,
                {width: progressWidth, backgroundColor: conf.accent},
              ]}
            />
          </View>
        ) : null}
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  wrap: {
    marginBottom: spacing.md,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: scale(14),
    paddingLeft: scale(14),
    paddingRight: scale(12),
    gap: scale(12),
    overflow: 'hidden',
  },
  iconBadge: {
    width: scale(38),
    height: scale(38),
    borderRadius: scale(13),
    alignItems: 'center',
    justifyContent: 'center',
  },
  accentRail: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: scale(4),
  },
  textWrap: {
    flex: 1,
    paddingTop: scale(1),
  },
  title: {
    ...typography.semibold,
    fontSize: scale(14),
    color: colors.text,
    lineHeight: scale(19),
  },
  message: {
    ...typography.regular,
    fontSize: scale(12),
    color: colors.textSecondary,
    marginTop: scale(3),
    lineHeight: scale(17),
  },
  closeBtn: {
    width: scale(28),
    height: scale(28),
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surfaceAlt,
    marginTop: scale(-3),
    marginRight: scale(-2),
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    gap: spacing.md,
    marginTop: scale(12),
  },
  cancelBtn: {
    minHeight: scale(36),
    justifyContent: 'center',
    paddingHorizontal: spacing.md,
  },
  cancelText: {
    ...typography.semibold,
    fontSize: scale(12),
    color: colors.textSecondary,
  },
  actionBtn: {
    minHeight: scale(36),
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
    borderRadius: radius.md,
  },
  actionText: {
    ...typography.bold,
    fontSize: scale(12),
    color: colors.textInverse,
  },
  progressTrack: {
    position: 'absolute',
    left: scale(4),
    right: 0,
    bottom: 0,
    height: scale(3),
    backgroundColor: colors.surfaceAlt,
  },
  progressBar: {
    height: '100%',
    borderBottomLeftRadius: radius.lg,
  },
});

export default Toast;
