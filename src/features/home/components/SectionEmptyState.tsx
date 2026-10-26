import React from 'react';
import {StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import {LucideIcon, PackageOpen, RefreshCw} from 'lucide-react-native';
import {colors, scale} from '../../../theme';

interface SectionEmptyStateProps {
  message: string;
  icon?: LucideIcon;
  actionLabel?: string;
  onAction?: () => void;
}

export const SectionEmptyState: React.FC<SectionEmptyStateProps> = ({
  message,
  icon: Icon = PackageOpen,
  actionLabel,
  onAction,
}) => (
  <View style={styles.container}>
    <View style={styles.content}>
      <View style={styles.iconWrap}>
        <Icon size={scale(18)} color={colors.primary} strokeWidth={1.8} />
      </View>
      <Text style={styles.text}>{message}</Text>
    </View>
    {actionLabel && onAction ? (
      <TouchableOpacity
        style={styles.actionBtn}
        activeOpacity={0.8}
        onPress={onAction}>
        <RefreshCw size={scale(12)} color={colors.primary} strokeWidth={2.4} />
        <Text style={styles.actionText}>{actionLabel}</Text>
      </TouchableOpacity>
    ) : null}
  </View>
);

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    flexWrap: 'wrap',
    gap: scale(8),
    paddingVertical: scale(14),
    paddingHorizontal: scale(12),
    borderRadius: scale(12),
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: '#DBEAFE',
    backgroundColor: '#F8FAFC',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: scale(8),
    flexShrink: 1,
  },
  iconWrap: {
    width: scale(30),
    height: scale(30),
    borderRadius: scale(15),
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    flexShrink: 1,
    fontSize: scale(11.5),
    fontWeight: '600',
    color: '#64748B',
    textAlign: 'center',
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: scale(3),
    paddingHorizontal: scale(10),
    paddingVertical: scale(5),
    borderRadius: scale(999),
    backgroundColor: '#F0F9FF',
    borderWidth: 1,
    borderColor: '#E0F2FE',
  },
  actionText: {
    fontSize: scale(10.5),
    fontWeight: '700',
    color: colors.primary,
  },
});

export default SectionEmptyState;
