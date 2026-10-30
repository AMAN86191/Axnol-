import React from 'react';
import {StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import {LucideIcon, PackageOpen, RefreshCw} from 'lucide-react-native';
import {colors, radius, scale, spacing, typography, fontSize} from '../../../theme';

interface SectionEmptyStateProps {
  message: string;
  subtitle?: string;
  icon?: LucideIcon;
  actionLabel?: string;
  onAction?: () => void;
}

export const SectionEmptyState: React.FC<SectionEmptyStateProps> = ({
  message,
  subtitle,
  icon: Icon = PackageOpen,
  actionLabel,
  onAction,
}) => (
  <View style={styles.container}>
    <View style={styles.content}>
      <View style={styles.iconWrap}>
        <Icon size={scale(20)} color={colors.primary} strokeWidth={1.6} />
      </View>
      <View style={styles.textWrap}>
        <Text style={styles.message}>{message}</Text>
        {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
      </View>
    </View>
    {actionLabel && onAction ? (
      <TouchableOpacity
        style={styles.actionBtn}
        activeOpacity={0.8}
        onPress={onAction}>
        <RefreshCw size={scale(13)} color={colors.primary} strokeWidth={2} />
        <Text style={styles.actionText}>{actionLabel}</Text>
      </TouchableOpacity>
    ) : null}
  </View>
);

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: spacing.sm,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    shadowColor: colors.shadow,
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 1,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    flex: 1,
    flexShrink: 1,
  },
  iconWrap: {
    width: scale(44),
    height: scale(44),
    borderRadius: scale(22),
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textWrap: {
    flex: 1,
    flexShrink: 1,
  },
  message: {
    ...typography.semibold,
    fontSize: fontSize.sm,
    color: colors.text,
    letterSpacing: -0.1,
  },
  subtitle: {
    ...typography.regular,
    fontSize: fontSize.xs,
    color: colors.textSecondary,
    marginTop: spacing.xs,
    lineHeight: fontSize.xs * 1.5,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: scale(4),
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.pill,
    backgroundColor: colors.primaryLight,
    borderWidth: 1,
    borderColor: colors.primaryMuted,
  },
  actionText: {
    ...typography.semibold,
    fontSize: fontSize.xs,
    color: colors.primary,
  },
});

export default SectionEmptyState;
