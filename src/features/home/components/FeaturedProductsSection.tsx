import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { ChevronRight } from 'lucide-react-native';
import AppImage from '../../../components/ui/AppImage';
import Button from '../../../components/ui/Button';
import { colors, scale } from '../../../theme';
import { formatPrice } from '../../../utils/formatPrice';
import { HomeProduct } from '../homeData';
import HomeSectionHeader from './HomeSectionHeader';
import AddToCartButton from '../../cart/components/AddToCartButton';
import WishlistButton from '../../wishlist/components/WishlistButton';

interface FeaturedProductsSectionProps {
  products: HomeProduct[];
  onSeeAll?: () => void;
  onPress: (product: HomeProduct) => void;
}

export const FeaturedProductsSection: React.FC<FeaturedProductsSectionProps> = ({
  products,
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
        return (
          <TouchableOpacity
            key={prod.id}
            style={styles.card}
            activeOpacity={0.9}
            onPress={() => onPress(prod)}>
            {/* Image panel */}
            <LinearGradient
              colors={['#F8FBFF', '#E8F2FB']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.imgArea}>
              <WishlistButton
                product={{
                  id: prod.id,
                  name: prod.name,
                  code: prod.code,
                  image: prod.image,
                  price: prod.price,
                  mrp: prod.mrp,
                  unit: prod.unit,
                }}
                style={styles.favBtn}
              />

              <AppImage uri={prod.image} style={styles.img} resizeMode="contain" />
            </LinearGradient>

            {/* Info */}
            <Text style={styles.name} numberOfLines={1}>
              {prod.name}
            </Text>
            <Text style={styles.code} numberOfLines={1}>
              {prod.code}
            </Text>

            <View style={styles.priceRow}>
              <View style={styles.priceMain}>
                <Text style={styles.price}>{formatPrice(prod.price)}</Text>
                {prod.unit ? (
                  <Text style={styles.unit}> / {prod.unit}</Text>
                ) : null}
              </View>
              {prod.mrp && prod.mrp > prod.price ? (
                <Text style={styles.mrp}>{formatPrice(prod.mrp)}</Text>
              ) : null}
            </View>

            <View style={styles.divider} />

            {/* CTA */}
            <View style={styles.ctaRow}>
              <Button
                title="Details"
                variant="outline"
                size="small"
                fullWidth={false}
                style={styles.detailsBtn}
                onPress={() => onPress(prod)}
                iconRight={
                  <ChevronRight
                    size={scale(13)}
                    color={colors.primary}
                    strokeWidth={2.6}
                  />
                }
                textStyle={styles.detailsText}
              />
              <AddToCartButton
                product={{
                  id: prod.id,
                  name: prod.name,
                  code: prod.code,
                  image: prod.image,
                  price: prod.price,
                  mrp: prod.mrp,
                  unit: prod.unit,
                }}
                compact
                style={styles.addBtn}
              />
            </View>
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
    shadowOffset: { width: 0, height: 1 },
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
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    marginVertical: scale(5),
  },
  priceMain: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  price: {
    fontSize: scale(14),
    fontWeight: '700',
    color: colors.primary,
    letterSpacing: -0.3,
  },
  unit: {
    fontSize: scale(9.5),
    fontWeight: '600',
    color: '#94A3B8',
  },
  mrp: {
    fontSize: scale(10),
    fontWeight: '600',
    color: '#B0BEC5',
    textDecorationLine: 'line-through',
  },
  divider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginBottom: scale(10),
  },
  ctaRow: {
    flexDirection: 'row',
    alignItems: 'stretch',
    gap: scale(6),
  },
  detailsBtn: {
    flex: 1,
    paddingHorizontal: scale(4),
    gap: scale(2),
  },
  addBtn: {
    flex: 1,
  },
  detailsText: {
    fontSize: scale(10),
    fontWeight: '700',
    flexShrink: 1,
  },
});

export default FeaturedProductsSection;
