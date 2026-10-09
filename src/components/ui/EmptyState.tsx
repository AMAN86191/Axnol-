import React from 'react';
import {StyleSheet, Text, View} from 'react-native';
import {FileSearch, LucideIcon} from 'lucide-react-native';
import {colors, fontSize, scale, spacing, typography} from '../../theme';
import Button from './Button';

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  subtitle?: string;
  actionLabel?: string;
  onAction?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon: Icon = FileSearch,
  title,
  subtitle,
  actionLabel,
  onAction,
}) => (
  <View style={styles.container}>
    <View style={styles.iconWrap}>
      <Icon size={scale(30)} color={colors.primary} strokeWidth={1.8} />
    </View>
    <Text style={styles.title}>{title}</Text>
    {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
    {actionLabel && onAction ? (
      <Button
        title={actionLabel}
        onPress={onAction}
        variant="outline"
        fullWidth={false}
        style={styles.btn}
      />
    ) : null}
  </View>
);

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingVertical: spacing.xxxl,
    paddingHorizontal: spacing.xl,
  },
  iconWrap: {
    width: scale(64),
    height: scale(64),
    borderRadius: scale(32),
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
  },
  title: {
    ...typography.bold,
    fontSize: fontSize.lg,
    color: colors.text,
    textAlign: 'center',
  },
  subtitle: {
    ...typography.regular,
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: spacing.sm,
    lineHeight: fontSize.sm * 1.5,
  },
  btn: {marginTop: spacing.xl},
});

export default EmptyState;
