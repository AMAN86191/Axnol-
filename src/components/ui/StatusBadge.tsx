import React from 'react';
import {StyleSheet, Text, View} from 'react-native';
import {fontSize, radius, spacing, typography} from '../../theme';
import {getStatusColor} from '../../utils/status';

interface StatusBadgeProps {
  status: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({status}) => {
  const {bg, text} = getStatusColor(status);
  const label = status
    .replace(/-/g, '')
    .replace(/\b\w/g, c => c.toUpperCase());
  return (
    <View style={[styles.badge, {backgroundColor: bg}]}>
      <Text style={[styles.text, {color: text}]}>{label}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radius.pill,
    alignSelf: 'flex-start',
  },
  text: {
    ...typography.semibold,
    fontSize: fontSize.xs,
  },
});

export default StatusBadge;
