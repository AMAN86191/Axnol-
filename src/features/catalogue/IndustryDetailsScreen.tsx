import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import MaskedView from '@react-native-masked-view/masked-view';
import {RouteProp, useNavigation, useRoute} from '@react-navigation/native';
import {ArrowRight} from 'lucide-react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {CatalogueStackParamList} from '../../navigation/types';
import {useGetProductsQuery} from '../../api/services/catalogueApi';
import {Product} from '../../api/types';
import Button from '../../components/ui/Button';
import CommonHeader from '../../components/ui/CommonHeader';
import ProductCard, {ProductCardData} from '../../components/ui/ProductCard';
import Skeleton from '../../components/ui/Skeleton';
import {colors, radius, scale, spacing} from '../../theme';
import IndustryBanner from './components/IndustryBanner';
import {useAppDispatch} from '../../redux/hooks';
import {useAppSelector} from '../../store';
import {fetchIndustryDetailsSlice} from '../../redux/IndustrySlice';

type Route = RouteProp<CatalogueStackParamList, 'IndustryDetails'>;

const PREVIEW_COUNT = 4;

const loggedIndustryDetails = new Set<string>();

const stripHtml = (html?: string | null) =>
  (html ?? '')
    .replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, ' ')
    .trim();

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
  const dispatch = useAppDispatch();
  const industryDetail = useAppSelector(s => s.industry.industryDetail);
  const detailLoading = useAppSelector(s => s.industry.detailLoading);
  const {industryId, industryTitle} = params;
  const [expanded, setExpanded] = useState(false);

  const {data, isLoading} = useGetProductsQuery({
    industryId,
  });
  const products = (data ?? []).slice(0, PREVIEW_COUNT);

  useEffect(() => {
    dispatch(fetchIndustryDetailsSlice(industryId))
      .unwrap()
      .then(res => {
        if (!loggedIndustryDetails.has(industryId)) {
          loggedIndustryDetails.add(industryId);
          console.log('Industry Details API Response:', res);
        }
      })
      .catch(err => console.log('Industry Details API Error:', err));
  }, [dispatch, industryId]);

  const title = industryDetail?.title ?? industryTitle ?? 'Industry';
  const image = industryDetail?.image_url ?? '';
  const description = stripHtml(industryDetail?.description);

  const viewAll = () =>
    navigation.navigate('Products', {
      title,
      industryId,
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
        {detailLoading && !industryDetail ? (
          <Skeleton
            height={scale(176)}
            borderRadius={radius.lg}
            style={styles.bannerSkeleton}
          />
        ) : (
          <IndustryBanner
            title={title}
            image={image}
            height={scale(176)}
            showAccentLine={false}
            buttonAlign="left"
          />
        )}

        {!!description && (
          <View style={styles.descWrap}>
            <Text
              style={styles.description}
              numberOfLines={expanded ? undefined : 4}>
              {description}
            </Text>
            {!expanded && description.split(/\s+/).length > 60 ? (
              <LinearGradient
                colors={['rgba(247,249,252,0)', '#F7F9FC']}
                style={styles.fade}
                pointerEvents="none"
              />
            ) : null}
            {description.split(/\s+/).length > 60 ? (
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => setExpanded(v => !v)}
                style={styles.readMoreBtn}>
                <MaskedView
                  maskElement={
                    <Text style={styles.readMoreMaskText}>
                      {expanded ? 'Read less' : 'Read more'}
                    </Text>
                  }>
                  <LinearGradient
                    colors={['#0F172A', '#CBD5E1']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}>
                    <Text style={[styles.readMoreMaskText, { opacity: 0 }]}>
                      {expanded ? 'Read less' : 'Read more'}
                    </Text>
                  </LinearGradient>
                </MaskedView>
              </TouchableOpacity>
            ) : null}
          </View>
        )}

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
  bannerSkeleton: {
    marginBottom: scale(2),
  },
  descWrap: {
    marginTop: spacing.md,
  },
  description: {
    fontSize: scale(13.5),
    lineHeight: scale(21),
    color: '#475569',
  },
  fade: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: scale(24),
    height: scale(36),
  },
  readMoreBtn: {
    alignSelf: 'flex-end',
    marginTop: scale(6),
  },
  readMoreMaskText: {
    fontSize: scale(12),
    fontWeight: '700',
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
