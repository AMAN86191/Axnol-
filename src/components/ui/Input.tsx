import React, {useState} from 'react';
import {
  StyleProp,
  StyleSheet,
  Text,
  TextInput,
  TextInputProps,
  TouchableOpacity,
  View,
  ViewStyle,
} from 'react-native';
import {Eye, EyeOff, LucideIcon} from 'lucide-react-native';
import {
  colors,
  radius,
  scale,
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
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  helperText,
  leftIcon,
  rightIcon,
  onRightPress,
  containerStyle,
  secureTextEntry,
  ...rest
}) => {
  const [secure, setSecure] = useState(secureTextEntry);
  const toggleSecure = () => setSecure(!secure);
  const isSecure = secureTextEntry;
  const LeftIcon = leftIcon;
  const RightIcon = rightIcon;
  return (
    <View style={[styles.container, containerStyle]}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <View
        style={[styles.inputWrapper, error ? styles.inputError : undefined]}>
        {LeftIcon ? (
          <LeftIcon
            size={scale(18)}
            color={colors.textMuted}
            style={styles.iconLeft}
          />
        ) : null}
        <TextInput
          {...rest}
          placeholderTextColor={colors.textMuted}
          secureTextEntry={isSecure ? secure : false}
          style={[
            styles.input,
            leftIcon ? styles.inputWithLeft : undefined,
            rightIcon || isSecure ? styles.inputWithRight : undefined,
          ]}
        />
        {isSecure ? (
          <TouchableOpacity onPress={toggleSecure} style={styles.iconRight}>
            {secure ? (
              <EyeOff size={scale(18)} color={colors.textMuted} />
            ) : (
              <Eye size={scale(18)} color={colors.textMuted} />
            )}
          </TouchableOpacity>
        ) : RightIcon ? (
          <TouchableOpacity
            onPress={onRightPress}
            style={styles.iconRight}
            disabled={!onRightPress}>
            <RightIcon size={scale(18)} color={colors.textMuted} />
          </TouchableOpacity>
        ) : null}
      </View>
      {error ? (
        <Text style={styles.error}>{error}</Text>
      ) : helperText ? (
        <Text style={styles.helper}>{helperText}</Text>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {marginBottom: spacing.lg},
  label: {
    ...theme.typography.medium,
    fontSize: theme.fontSize.sm,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    minHeight: verticalScale(48),
  },
  inputError: {borderColor: colors.danger},
  input: {
    ...theme.typography.regular,
    fontSize: theme.fontSize.md,
    color: colors.text,
    flex: 1,
    paddingVertical: spacing.md,
  },
  inputWithLeft: {paddingLeft: spacing.sm},
  inputWithRight: {paddingRight: spacing.sm},
  iconLeft: {marginRight: spacing.sm},
  iconRight: {marginLeft: spacing.sm},
  error: {
    ...theme.typography.regular,
    fontSize: theme.fontSize.xs,
    color: colors.danger,
    marginTop: spacing.xs,
  },
  helper: {
    ...theme.typography.regular,
    fontSize: theme.fontSize.xs,
    color: colors.textMuted,
    marginTop: spacing.xs,
  },
});
export default Input;
