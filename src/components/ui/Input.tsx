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
  variant?: 'light' | 'dark';
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
  const LeftIcon = leftIcon;
  const RightIcon = rightIcon;
  const iconColor = focused
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
            isDark && styles.labelDark,
            labelStyle,
          ]}>
          {label}
        </Text>
      ) : null}
      <Pressable
        onPress={() => inputRef.current?.focus()}
        style={[
          styles.inputWrapper,
          isDark && styles.inputWrapperDark,
          focused && styles.inputFocused,
          isDark && focused && styles.inputFocusedDark,
          error ? styles.inputError : undefined,
        ]}>
        {LeftIcon ? (
          <View
            pointerEvents="none"
            style={[
              styles.iconLeft,
              isDark && styles.iconLeftDark,
              focused && styles.iconLeftFocused,
              isDark && focused && styles.iconLeftFocusedDark,
              error ? styles.iconLeftError : undefined,
            ]}>
            <LeftIcon
              size={scale(17)}
              color={error ? colors.textInverse : iconColor}
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
            isDark ? 'rgba(255, 255, 255, 0.55)' : colors.textMuted
          }
          secureTextEntry={isSecure ? secure : false}
          style={[
            styles.input,
            isDark && styles.inputDark,
            leftIcon ? styles.inputWithLeft : undefined,
            rightIcon || isSecure ? styles.inputWithRight : undefined,
          ]}
        />
        {isSecure ? (
          <TouchableOpacity onPress={toggleSecure} style={styles.iconRight}>
            {secure ? (
              <EyeOff
                size={scale(18)}
                color={isDark ? 'rgba(255,255,255,0.7)' : colors.textMuted}
              />
            ) : (
              <Eye
                size={scale(18)}
                color={isDark ? 'rgba(255,255,255,0.7)' : colors.textMuted}
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
              color={isDark ? 'rgba(255,255,255,0.7)' : colors.textMuted}
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
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceAlt,
    borderWidth: 1.5,
    borderColor: colors.borderLight,
    borderRadius: radius.lg,
    paddingHorizontal: spacing.sm,
    minHeight: verticalScale(45),
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
  inputDark: {
    color: colors.textInverse,
  },
  inputWithLeft: {paddingLeft: spacing.sm},
  inputWithRight: {paddingRight: spacing.sm},
  iconLeft: {
    width: scale(34),
    height: scale(34),
    borderRadius: scale(10),
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primaryLight,
    marginRight: spacing.sm,
  },
  iconLeftDark: {
    backgroundColor: 'rgba(255, 255, 255, 0.24)',
  },
  iconLeftFocused: {
    backgroundColor: colors.primary,
  },
  iconLeftFocusedDark: {
    backgroundColor: colors.accent,
  },
  iconLeftError: {
    backgroundColor: colors.danger,
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
