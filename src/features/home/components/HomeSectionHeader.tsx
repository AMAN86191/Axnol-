import React from 'react';
import {StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import {ChevronRight} from 'lucide-react-native';
import {colors, scale} from '../../../theme';

interface HomeSectionHeaderProps {
  title: string;
  subtitle?: string;
  actionLabel?: string;
  onAction?: () => void;
}

export const HomeSectionHeader: React.FC<HomeSectionHeaderProps> = ({
  title,
  subtitle,
  actionLabel = 'View All',
  onAction,
}) => (
  <View style={styles.row}>
   <View style={{flexDirection:"row",  alignItems:"center"}}>

      <View style={styles.accentBar} />
     
        <Text style={styles.title}>{title}</Text>
   </View>
     
      
    

    {onAction ? (
      <TouchableOpacity
        style={styles.actionBtn}
        activeOpacity={0.7}
        hitSlop={8}
        onPress={onAction}>
        <Text style={styles.actionText}>{actionLabel}</Text>
        <ChevronRight size={scale(13)} color={colors.primary} strokeWidth={2.6} />
      </TouchableOpacity>
    ) : null}
  </View>
);

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: scale(11),
  },
  left: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: scale(8),
    flex: 1,
    paddingRight: scale(8),
  },
  accentBar: {
    width: scale(3),
    height: scale(25),
    borderRadius: scale(2),
    backgroundColor: colors.primary,
    marginTop: scale(1),
  },
  titleWrap: {
    flexShrink: 1,
  },
  title: {
    fontSize: scale(14),
    fontWeight: '700',
    color: '#0F172A',
    letterSpacing: -0.3,
    lineHeight: scale(20),
    paddingLeft:scale(10)
  },
  subtitle: {
    fontSize: scale(11),
    fontWeight: '500',
    color: '#64748B',
    marginTop: scale(1),
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: scale(1),
    backgroundColor: '#F0F9FF',
    borderWidth: 1,
    borderColor: '#E0F2FE',
    paddingHorizontal: scale(9),
    paddingVertical: scale(5),
    borderRadius: scale(999),
  },
  actionText: {
    fontSize: scale(11),
    fontWeight: '700',
    color: colors.primary,
  },
});

export default HomeSectionHeader;
