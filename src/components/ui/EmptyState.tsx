import React from 'react';
import {StyleSheet, Text, View} from 'react-native';
import {FileSearch, LucideIcon} from 'lucide-react-native';
import {colors, fontSize, radius, scale, spacing, typography} from '../../theme';
import Button from './Button';

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  subtitle?: string;
  actionLabel?: string;
  onAction?: () => void;
  variant?: 'default' | 'minimal';
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon: Icon = FileSearch,
  title,
  subtitle,
  actionLabel,
  onAction,
  variant = 'default',
}) => (
  <View style={[styles.container, variant === 'minimal' && styles.containerMinimal]}>
    <View style={styles.iconWrapper}>
      <View style={styles.iconBg}>
        <Icon size={scale(32)} color={colors.primary} strokeWidth={1.6} />
      </View>
      <View style={styles.iconDot} />
    </View>
    <Text style={styles.title}>{title}</Text>
    {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
    {actionLabel && onAction ? (
      <Button
        title={actionLabel}
        onPress={onAction}
        variant="primary"
        fullWidth={false}
        style={styles.btn}
      />
    ) : null}
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xxxl,
    paddingHorizontal: spacing.xl,
  },
  containerMinimal: {
    flex: 0,
    paddingVertical: spacing.xxl,
  },
  iconWrapper: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xxl,
  },
  iconBg: {
    width: scale(88),
    height: scale(88),
    borderRadius: scale(44),
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.primary,
    shadowOffset: {width: 0, height: 8},
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 4,
  },
  iconDot: {
    position: 'absolute',
    bottom: scale(4),
    right: scale(4),
    width: scale(16),
    height: scale(16),
    borderRadius: scale(8),
    backgroundColor: colors.primary,
    borderWidth: 3,
    borderColor: colors.surface,
  },
  title: {
    ...typography.bold,
    fontSize: fontSize.xl,
    color: colors.text,
    textAlign: 'center',
    letterSpacing: -0.3,
  },
  subtitle: {
    ...typography.regular,
    fontSize: fontSize.md,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: spacing.sm,
    lineHeight: fontSize.md * 1.6,
    maxWidth: scale(280),
  },
  btn: {
    marginTop: spacing.xxl,
    paddingHorizontal: spacing.xxl,
  },
});

export default EmptyState;
