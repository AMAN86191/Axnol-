import React from 'react';
import {ScrollView, StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import AppImage from '../../../components/ui/AppImage';
import {scale} from '../../../theme';
import {IndustryItem} from '../homeData';
import HomeSectionHeader from './HomeSectionHeader';

interface IndustriesSectionProps {
  industries: IndustryItem[];
  onSeeAll?: () => void;
  onSelect: (item: IndustryItem) => void;
}

const CIRCLE = scale(60);
const CARD_WIDTH = scale(84);

export const IndustriesSection: React.FC<IndustriesSectionProps> = ({
  industries,
  onSeeAll,
  onSelect,
}) => (
  <>
    <HomeSectionHeader
      title="Industries"
      subtitle="Solutions built for your sector"
      onAction={onSeeAll}
    />

    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.scrollPad}>
      {industries.map(ind => (
        <TouchableOpacity
          key={ind.id}
          style={styles.card}
          activeOpacity={0.85}
          onPress={() => onSelect(ind)}>
          {/* Round industry image */}
          <View style={styles.circleShadow}>
            <View style={styles.circle}>
              <AppImage uri={ind.image} style={styles.cardImg} resizeMode="cover" />
            </View>
          </View>

          {/* Title below the image */}
          <Text style={styles.cardName} numberOfLines={1}>
            {ind.name}
          </Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  </>
);

const styles = StyleSheet.create({
  scrollPad: {
    gap: scale(10),
    paddingRight: scale(14),
    paddingTop: scale(4),
    paddingBottom: scale(4),
  },
  card: {
    width: CARD_WIDTH,
    alignItems: 'center',
  },
  circleShadow: {
    width: CIRCLE,
    height: CIRCLE,
    borderRadius: CIRCLE / 2,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#0A3B74',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.15,
    shadowRadius: 7,
    elevation: 3,
  },
  circle: {
    width: '100%',
    height: '100%',
    borderRadius: CIRCLE / 2,
    borderWidth: 2.5,
    borderColor: '#FFFFFF',
    overflow: 'hidden',
    backgroundColor: '#F1F5F9',
  },
  cardImg: {
    width: '100%',
    height: '100%',
  },
  cardName: {
    fontSize: scale(11.5),
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: -0.2,
    textAlign: 'center',
    marginTop: scale(8),
  },
  cardLink: {
    fontSize: scale(9.5),
    fontWeight: '700',
    color: '#0284C7',
    marginTop: scale(1),
  },
});

export default IndustriesSection;
