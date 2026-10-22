import React from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {RouteProp, useNavigation, useRoute} from '@react-navigation/native';
import {ArrowRight} from 'lucide-react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {CatalogueStackParamList} from '../../navigation/types';
import {useGetProductsQuery} from '../../api/services/catalogueApi';
import {Product} from '../../api/types';
import Button from '../../components/ui/Button';
import CommonHeader from '../../components/ui/CommonHeader';
import ProductCard, {ProductCardData} from '../../components/ui/ProductCard';
import {colors, scale, spacing} from '../../theme';
import {ImageKey} from '../../assets/images';
import IndustryBanner from './components/IndustryBanner';
import {getIndustry} from './industriesData';

type Route = RouteProp<CatalogueStackParamList, 'IndustryDetails'>;

const PREVIEW_COUNT = 4;

const toCard = (product: Product): ProductCardData => ({
  id: product.id,
  name: product.name,
  image: product.images?.[0],
  code: product.brand,
  price: product.price,
  unit: product.packSizes?.[0],
});

export const IndustryDetailsScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const insets = useSafeAreaInsets();
  const {params} = useRoute<Route>();
  const industry = getIndustry(params.industryId);

  const {data, isLoading} = useGetProductsQuery({
    industryId: params.industryId,
  });
  const products = (data ?? []).slice(0, PREVIEW_COUNT);

  const viewAll = () =>
    navigation.navigate('Products', {
      title: industry?.name,
      industryId: params.industryId,
    });

  return (
    <View style={styles.container}>
      <CommonHeader
        title="Industry Details"
        onBack={() => navigation.goBack()}
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.content,
          {paddingBottom: insets.bottom + scale(40)},
        ]}>
        {industry ? (
          <>
            <IndustryBanner
              title={industry.name}
              image={industry.image as ImageKey}
              height={scale(176)}
              showAccentLine={false}
              buttonAlign="left"
            />

            <Text style={styles.description}>{industry.description}</Text>
          </>
        ) : null}

        <Text style={styles.sectionTitle}>Recommended Products</Text>
        {isLoading ? (
          <ActivityIndicator color={colors.primary} style={styles.loader} />
        ) : products.length === 0 ? (
          <Text style={styles.emptyText}>
            No products listed for this industry yet.
          </Text>
        ) : (
          <View style={styles.grid}>
            {products.map(product => (
              <ProductCard
                key={product.id}
                product={toCard(product)}
                style={styles.gridCard}
                onPress={() =>
                  navigation.navigate('ProductDetails', {
                    productId: product.id,
                  })
                }
              />
            ))}
          </View>
        )}

        <Button
          title="View all products"
          onPress={viewAll}
          iconRight={
            <ArrowRight size={scale(16)} color={colors.textInverse} />
          }
          style={styles.cta}
        />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F9FC',
  },
  content: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
  },
  description: {
    fontSize: scale(13.5),
    lineHeight: scale(21),
    color: '#475569',
    marginTop: spacing.md,
  },
  sectionTitle: {
    fontSize: scale(15),
    fontWeight: '800',
    color: '#172033',
    marginTop: spacing.xl,
    marginBottom: spacing.md,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: scale(10),
  },
  gridCard: {
    width: '48%',
    backgroundColor: '#FFFFFF',
  },
  loader: {
    paddingVertical: spacing.xl,
  },
  emptyText: {
    fontSize: scale(12.5),
    color: '#718096',
  },
  cta: {
    marginTop: spacing.xl,
  },
});

export default IndustryDetailsScreen;
