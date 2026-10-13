import React, {useRef, useState} from 'react';
import {
  Pressable,
  StyleProp,
  StyleSheet,
  Text,
  TextInput,
  TextInputProps,
  TextStyle,
  TouchableOpacity,
  View,
  ViewStyle,
} from 'react-native';
import {Eye, EyeOff, LucideIcon} from 'lucide-react-native';
import {
  colors,
  radius,
  scale,
  shadows,
  spacing,
  theme,
  verticalScale,
} from '../../theme';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: LucideIcon;
  rightIcon?: LucideIcon;
  onRightPress?: () => void;
  containerStyle?: StyleProp<ViewStyle>;
  labelStyle?: StyleProp<TextStyle>;
  variant?: 'light' | 'dark' | 'clean';
  /** Compact mode: shorter field height, tighter padding. */
  dense?: boolean;
  /** Show red required asterisk next to label */
  required?: boolean;
  /** Custom element to render in place of left icon (e.g. phone country selector) */
  leftComponent?: React.ReactNode;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  helperText,
  leftIcon,
  rightIcon,
  onRightPress,
  containerStyle,
  labelStyle,
  variant = 'light',
  dense = false,
  required = false,
  leftComponent,
  secureTextEntry,
  onFocus,
  onBlur,
  ...rest
}) => {
  const inputRef = useRef<TextInput>(null);
  const [secure, setSecure] = useState(secureTextEntry);
  const [focused, setFocused] = useState(false);
  const toggleSecure = () => setSecure(!secure);
  const isSecure = secureTextEntry;
  const isDark = variant === 'dark';
  const isClean = variant === 'clean';
  const LeftIcon = leftIcon;
  const RightIcon = rightIcon;
  const iconColor = isClean
    ? focused
      ? colors.primary
      : '#94A3B8'
    : focused
    ? colors.textInverse
    : isDark
    ? colors.textInverse
    : colors.primary;

  return (
    <View style={[styles.container, containerStyle]}>
      {label ? (
        <Text
          style={[
            styles.label,
            dense && styles.labelDense,
            isDark && styles.labelDark,
            isClean && styles.labelClean,
            labelStyle,
          ]}>
          {label}
          {required ? <Text style={styles.requiredStar}> *</Text> : null}
        </Text>
      ) : null}
      <Pressable
        onPress={() => inputRef.current?.focus()}
        style={[
          styles.inputWrapper,
          dense && styles.inputWrapperDense,
          isDark && styles.inputWrapperDark,
          isClean && styles.inputWrapperClean,
          focused && styles.inputFocused,
          isDark && focused && styles.inputFocusedDark,
          isClean && focused && styles.inputFocusedClean,
          error ? styles.inputError : undefined,
        ]}>
        {leftComponent ? (
          leftComponent
        ) : LeftIcon ? (
          <View
            pointerEvents="none"
            style={[
              styles.iconLeft,
              dense && styles.iconLeftDense,
              isDark && styles.iconLeftDark,
              isClean && styles.iconLeftClean,
              focused && styles.iconLeftFocused,
              isDark && focused && styles.iconLeftFocusedDark,
              isClean && focused && styles.iconLeftFocusedClean,
            ]}>
            <LeftIcon
              size={dense ? scale(15) : isClean ? scale(18) : scale(17)}
              color={iconColor}
            />
          </View>
        ) : null}
        <TextInput
          ref={inputRef}
          {...rest}
          onFocus={e => {
            setFocused(true);
            onFocus?.(e);
          }}
          onBlur={e => {
            setFocused(false);
            onBlur?.(e);
          }}
          placeholderTextColor={
            isDark ? 'rgba(255, 255, 255, 0.55)' : '#94A3B8'
          }
          secureTextEntry={isSecure ? secure : false}
          style={[
            styles.input,
            dense && styles.inputDense,
            isDark && styles.inputDark,
            isClean && styles.inputClean,
            leftIcon || leftComponent ? styles.inputWithLeft : undefined,
            rightIcon || isSecure ? styles.inputWithRight : undefined,
          ]}
        />
        {isSecure ? (
          <TouchableOpacity onPress={toggleSecure} style={styles.iconRight}>
            {secure ? (
              <EyeOff
                size={scale(18)}
                color={isDark ? 'rgba(255,255,255,0.7)' : '#94A3B8'}
              />
            ) : (
              <Eye
                size={scale(18)}
                color={isDark ? 'rgba(255,255,255,0.7)' : '#94A3B8'}
              />
            )}
          </TouchableOpacity>
        ) : RightIcon ? (
          <TouchableOpacity
            onPress={onRightPress}
            style={styles.iconRight}
            disabled={!onRightPress}>
            <RightIcon
              size={scale(18)}
              color={isDark ? 'rgba(255,255,255,0.7)' : '#94A3B8'}
            />
          </TouchableOpacity>
        ) : null}
      </Pressable>
      {error ? (
        <Text style={[styles.error, isDark && styles.errorDark]}>{error}</Text>
      ) : helperText ? (
        <Text style={[styles.helper, isDark && styles.helperDark]}>
          {helperText}
        </Text>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {marginBottom: spacing.lg},
  label: {
    ...theme.typography.semibold,
    fontSize: theme.fontSize.sm,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
    letterSpacing: 0.2,
  },
  labelDark: {
    color: 'rgba(255, 255, 255, 0.9)',
  },
  labelClean: {
    color: '#1E293B',
    fontSize: scale(13),
    fontWeight: '600',
    marginBottom: scale(6),
  },
  requiredStar: {
    color: '#EF4444',
    fontWeight: '700',
  },
  labelDense: {
    fontSize: theme.fontSize.xs,
    marginBottom: spacing.xs,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: radius.lg,
    paddingHorizontal: spacing.sm,
    minHeight: verticalScale(48),
    shadowColor: colors.shadow,
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },
  inputWrapperClean: {
    minHeight: scale(46),
    backgroundColor: '#FFFFFF',
    borderWidth: 1.2,
    borderColor: '#E2E8F0',
    borderRadius: radius.md,
    paddingHorizontal: scale(12),
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.02,
    shadowRadius: 2,
    elevation: 0.5,
  },
  inputWrapperDense: {
    minHeight: verticalScale(38),
    borderRadius: radius.md,
  },
  inputWrapperDark: {
    backgroundColor: 'rgba(255, 255, 255, 0.18)',
    borderColor: 'rgba(255, 255, 255, 0.35)',
  },
  inputFocused: {
    backgroundColor: colors.surface,
    borderColor: colors.primary,
    ...shadows.small,
  },
  inputFocusedClean: {
    borderColor: '#0284C7',
    backgroundColor: '#FFFFFF',
  },
  inputFocusedDark: {
    backgroundColor: 'rgba(255, 255, 255, 0.26)',
    borderColor: colors.accent,
    ...shadows.medium,
  },
  inputError: {borderColor: colors.danger},
  input: {
    ...theme.typography.regular,
    fontSize: theme.fontSize.md,
    color: colors.text,
    flex: 1,
    paddingVertical: spacing.md,
  },
  inputClean: {
    fontSize: scale(13.5),
    color: '#0F172A',
    paddingVertical: scale(8),
  },
  inputDense: {
    fontSize: theme.fontSize.sm,
    paddingVertical: scale(6),
  },
  inputDark: {
    color: colors.textInverse,
  },
  inputWithLeft: {paddingLeft: spacing.sm},
  inputWithRight: {paddingRight: spacing.sm},
  iconLeft: {
    width: scale(30),
    height: scale(30),
    borderRadius: scale(9),
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primaryLight,
    marginRight: spacing.sm,
  },
  iconLeftClean: {
    width: scale(22),
    height: scale(22),
    backgroundColor: 'transparent',
    borderRadius: 0,
    marginRight: scale(6),
  },
  iconLeftDense: {
    width: scale(28),
    height: scale(28),
    borderRadius: scale(8),
  },
  iconLeftDark: {
    backgroundColor: 'rgba(255, 255, 255, 0.24)',
  },
  iconLeftFocused: {
    backgroundColor: colors.primary,
  },
  iconLeftFocusedClean: {
    backgroundColor: 'transparent',
  },
  iconLeftFocusedDark: {
    backgroundColor: colors.accent,
  },
  iconRight: {marginLeft: spacing.sm},
  error: {
    ...theme.typography.regular,
    fontSize: theme.fontSize.xs,
    color: colors.danger,
    marginTop: spacing.xs,
  },
  errorDark: {
    color: '#FFC9C9',
  },
  helper: {
    ...theme.typography.regular,
    fontSize: theme.fontSize.xs,
    color: colors.textMuted,
    marginTop: spacing.xs,
  },
  helperDark: {
    color: 'rgba(255, 255, 255, 0.65)',
  },
});

export default Input;
