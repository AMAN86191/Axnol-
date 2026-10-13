import React from 'react';
import {
  ActivityIndicator,
  StyleProp,
  StyleSheet,
  Text,
  TextStyle,
  TouchableOpacity,
  View,
  ViewStyle,
} from 'react-native';
import {colors, radius, spacing, theme} from '../../theme';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'navy';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  loading?: boolean;
  iconLeft?: React.ReactNode;
  iconRight?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
  fullWidth?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  loading = false,
  iconLeft,
  iconRight,
  style,
  textStyle,
  fullWidth = true,
}) => {
  const isDisabled = disabled || loading;
  const containerStyle = [
    styles.base,
    styles[size],
    styles[variant],
    fullWidth && styles.fullWidth,
    isDisabled && styles.disabled,
    style,
  ];
  const textColor =
    variant === 'outline' || variant === 'ghost'
      ? colors.primary
      : colors.textInverse;
  const spinnerColor =
    variant === 'outline' || variant === 'ghost'
      ? colors.primary
      : colors.textInverse;
  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={onPress}
      disabled={isDisabled}
      style={containerStyle}>
      {loading ? (
        <>
          {/* Invisible ghost keeps the exact same layout size */}
          <View pointerEvents="none" style={styles.loadingGhost}>
            {iconLeft}
            <Text style={[styles.text, textStyle, styles.transparentText]}>
              {title}
            </Text>
            {iconRight}
          </View>
          <View pointerEvents="none" style={styles.spinnerOverlay}>
            <ActivityIndicator color={spinnerColor} size="small" />
          </View>
        </>
      ) : (
        <>
          {iconLeft}
          <Text style={[styles.text, {color: textColor}, textStyle]}>
            {title}
          </Text>
          {iconRight}
        </>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.md,
    gap: spacing.sm,
  },
  small: {paddingVertical: spacing.sm, paddingHorizontal: spacing.md},
  medium: {paddingVertical: spacing.lg, paddingHorizontal: spacing.xl},
  large: {paddingVertical: spacing.xl, paddingHorizontal: spacing.xxl},
  primary: {backgroundColor: colors.primary},
  secondary: {backgroundColor: colors.accent},
  outline: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: colors.primary,
  },
  ghost: {backgroundColor: 'transparent'},
  danger: {backgroundColor: colors.danger},
  navy: {backgroundColor: '#063970'},
  fullWidth: {width: '100%'},
  disabled: {opacity: 0.5},
  text: {
    ...theme.typography.medium,
    fontSize: theme.fontSize.md,
    letterSpacing: 0.2,
  },
  transparentText: {
    color: 'transparent',
  },
  loadingGhost: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    opacity: 0,
  },
  spinnerOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
export default Button;
