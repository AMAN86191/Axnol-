import React from 'react';
import {ScrollView, StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import {ArrowRight, Heart} from 'lucide-react-native';
import AppImage from '../../../components/ui/AppImage';
import Button from '../../../components/ui/Button';
import {colors, scale} from '../../../theme';
import {HomeProduct} from '../homeData';
import HomeSectionHeader from './HomeSectionHeader';

interface FeaturedProductsSectionProps {
  products: HomeProduct[];
  favorites: Record<string, boolean>;
  onToggleFavorite: (id: string) => void;
  onSeeAll?: () => void;
  onPress: (product: HomeProduct) => void;
}

export const FeaturedProductsSection: React.FC<FeaturedProductsSectionProps> = ({
  products,
  favorites,
  onToggleFavorite,
  onSeeAll,
  onPress,
}) => (
  <>
    <HomeSectionHeader
      title="Featured Products"
      subtitle="Hand-picked by our experts"
      onAction={onSeeAll}
    />

    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.scrollPad}>
      {products.map(prod => {
        const isFav = Boolean(favorites[prod.id]);
        return (
          <TouchableOpacity
            key={prod.id}
            style={styles.card}
            activeOpacity={0.9}
            onPress={() => onPress(prod)}>
            {/* Image panel */}
            <LinearGradient
              colors={['#F8FBFF', '#E8F2FB']}
              start={{x: 0, y: 0}}
              end={{x: 1, y: 1}}
              style={styles.imgArea}>
              <TouchableOpacity
                style={styles.favBtn}
                activeOpacity={0.7}
                onPress={() => onToggleFavorite(prod.id)}>
                <Heart
                  size={scale(13)}
                  color={isFav ? '#EF4444' : '#94A3B8'}
                  fill={isFav ? '#EF4444' : 'none'}
                  strokeWidth={2}
                />
              </TouchableOpacity>

              <AppImage uri={prod.image} style={styles.img} resizeMode="contain" />
            </LinearGradient>

            {/* Info */}
            <Text style={styles.name} numberOfLines={1}>
              {prod.name}
            </Text>
            <Text style={styles.code} numberOfLines={1}>
              {prod.code}
            </Text>

            <View style={styles.divider} />

            {/* CTA */}
            <Button
              title="View Details"
              variant="outline"
              size="small"
              fullWidth
              onPress={() => onPress(prod)}
              iconRight={
                <ArrowRight
                  size={scale(13)}
                  color={colors.primary}
                  strokeWidth={2.6}
                />
              }
              textStyle={styles.detailsText}
            />
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  </>
);

const styles = StyleSheet.create({
  scrollPad: {
    gap: scale(11),
    paddingRight: scale(6),
    paddingTop: scale(2),
    paddingBottom: scale(6),
  },
  card: {
    width: scale(160),
    // backgroundColor: '#FFFFFF',
    borderRadius: scale(18),
    borderWidth: 2,
    borderColor: colors.border,
    padding: scale(6),
    // shadowColor: '#0F172A',
    // shadowOffset: {width: 0, height: 4},
    // shadowOpacity: 0.08,
    // shadowRadius: 9,
    // elevation: 2,
  },
  imgArea: {
    height: scale(122),
    borderRadius: scale(14),
    borderWidth: 1,
    borderColor: '#E9F1FA',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: scale(10),
    overflow: 'hidden',
  },
  img: {
    width: scale(112),
    height: scale(104),
  },
  favBtn: {
    position: 'absolute',
    top: scale(6),
    right: scale(6),
    width: scale(25),
    height: scale(25),
    borderRadius: scale(14),
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#EDF1F7',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#0F172A',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 1,
    zIndex: 2,
  },
  name: {
    fontSize: scale(13),
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: -0.2,
    lineHeight: scale(17),
    // minHeight: scale(34),
    marginBottom: scale(3),
  },
  code: {
    fontSize: scale(9.5),
    color: '#94A3B8',
    fontWeight: '600',
    // marginBottom: scale(10),
  },
  divider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginBottom: scale(10),
  },
  detailsText: {
    fontSize: scale(11),
    fontWeight: '700',
  },
});

export default FeaturedProductsSection;
