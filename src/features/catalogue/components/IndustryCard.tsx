import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { ArrowRight } from 'lucide-react-native';
import CachedImage from '../../../components/ui/CachedImage';
import { scale } from '../../../theme';

interface IndustryCardProps {
  name: string;
  image: string;
  onPress: () => void;
}

/** One industry tile: photo on top, name and a round arrow underneath. */
export const IndustryCard: React.FC<IndustryCardProps> = ({
  name,
  image,
  onPress,
}) => (
  <TouchableOpacity
    style={styles.card}
    activeOpacity={0.85}
    onPress={onPress}
    accessibilityRole="button"
    accessibilityLabel={name}
  >
    <View style={styles.imageWrap}>
      <CachedImage
        uri={image}
        style={styles.image}
        fallback={
          <View style={[styles.image, styles.fallback]}>
            <Text style={styles.fallbackText}>
              {name?.charAt(0)?.toUpperCase() || '?'}
            </Text>
          </View>
        }
      />
    </View>
    <View style={styles.footer}>
      <Text style={styles.name} numberOfLines={2}>
        {name}
      </Text>
      <View style={styles.arrow}>
        <ArrowRight size={scale(11)} color="#FFFFFF" strokeWidth={2.8} />
      </View>
    </View>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  card: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: scale(8),
    padding: scale(5),
    borderWidth: 1,
    borderColor: '#E9EEEC',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 5,
    elevation: 2,
  },
  imageWrap: {
    height: scale(82),
    borderRadius: scale(5),
    overflow: 'hidden',
    backgroundColor: '#E8EDF2',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  fallback: {
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  fallbackText: {
    fontSize: scale(16),
    fontWeight: '800',
    color: '#2563EB',
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: scale(40),
    paddingLeft: scale(3),
    gap: scale(4),
  },
  name: {
    flex: 1,
    fontSize: scale(11),
    lineHeight: scale(13),
    fontWeight: '700',
    color: '#0B0F14',
  },
  arrow: {
    width: scale(19),
    height: scale(19),
    borderRadius: scale(10),
    backgroundColor: '#2F4EA2',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default IndustryCard;
