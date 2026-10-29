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
import {colors, radius, scale, shadows, spacing, typography} from '../../theme';

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
        <View style={[styles.iconBadge, {backgroundColor: conf.tint}]}>
          <Icon size={scale(14)} color={conf.accent} strokeWidth={2.4} />
        </View>

        <View style={styles.textWrap}>
          <Text style={styles.title} numberOfLines={1}>
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
                activeOpacity={0.7}
                style={styles.cancelBtn}
                onPress={close}>
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
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
          style={styles.closeBtn}
          activeOpacity={0.6}
          onPress={close}
          hitSlop={{top: 8, bottom: 8, left: 8, right: 8}}>
          <X size={scale(13)} color={colors.textMuted} strokeWidth={2.4} />
        </TouchableOpacity>

        {!action && data.duration > 0 ? (
          <Animated.View
            style={[
              styles.progressBar,
              {width: progressWidth, backgroundColor: conf.accent},
            ]}
          />
        ) : null}
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  wrap: {
    marginBottom: spacing.sm,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.borderLight,
    paddingVertical: scale(9),
    paddingLeft: scale(9),
    paddingRight: scale(10),
    gap: scale(9),
    overflow: 'hidden',
    ...shadows.medium,
  },
  iconBadge: {
    width: scale(25),
    height: scale(25),
    borderRadius: scale(14),
    alignItems: 'center',
    justifyContent: 'center',
  },
  textWrap: {
    flex: 1,
  },
  title: {
    ...typography.semibold,
    fontSize: scale(11.5),
    color: colors.text,
    letterSpacing: -0.1,
  },
  message: {
    ...typography.regular,
    fontSize: scale(10),
    color: colors.textSecondary,
    marginTop: scale(1),
    lineHeight: scale(14.5),
  },
  closeBtn: {
    alignSelf: 'flex-start',
    paddingTop: scale(2),
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: scale(7),
  },
  cancelBtn: {
    paddingVertical: scale(4),
    paddingHorizontal: spacing.sm,
  },
  cancelText: {
    ...typography.semibold,
    fontSize: scale(11.5),
    color: colors.textSecondary,
  },
  actionBtn: {
    paddingVertical: scale(4),
    paddingHorizontal: spacing.md,
    borderRadius: radius.sm,
  },
  actionText: {
    ...typography.bold,
    fontSize: scale(11.5),
    color: colors.textInverse,
  },
  progressBar: {
    position: 'absolute',
    left: 0,
    bottom: 0,
    height: 2,
    borderBottomLeftRadius: radius.md,
  },
});

export default Toast;
