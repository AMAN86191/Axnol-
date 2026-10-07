import React, {useState} from 'react';
import {
  ActivityIndicator,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {RouteProp, useRoute} from '@react-navigation/native';
import {CatalogueStackParamList} from '../../navigation/types';
import {useGetProductByIdQuery} from '../../api/services/catalogueApi';
import {colors, radius, spacing, theme, verticalScale} from '../../theme';
import Button from '../../components/ui/Button';
import {useCreatePricingRequestMutation} from '../../api/services/pricingApi';

type Route = RouteProp<CatalogueStackParamList, 'ProductDetails'>;

export const ProductDetailsScreen: React.FC = () => {
  const {params} = useRoute<Route>();
  const {data, isLoading} = useGetProductByIdQuery(params.productId);
  const [createReq] = useCreatePricingRequestMutation();
  const [qty, setQty] = useState('20');
  if (isLoading || !data) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }
  const requestPricing = async () => {
    await createReq({productId: data.id, quantity: Number(qty) || 20}).unwrap();
  };
  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <Image
        source={{uri: data.images[0]}}
        style={styles.img}
        resizeMode="cover"
      />
      <View style={styles.card}>
        <Text style={styles.name}>{data.name}</Text>
        <Text style={styles.brand}>{data.brand}</Text>
        <Text style={styles.price}>₹ {data.dealerPrice ?? data.price}</Text>
        <Text style={styles.desc}>{data.description}</Text>
        <Text style={styles.section}>Specifications</Text>
        {data.specs.map((s, i) => (
          <View key={i} style={styles.specRow}>
            <Text style={styles.specLabel}>{s.label}</Text>
            <Text style={styles.specValue}>{s.value}</Text>
          </View>
        ))}
        <Text style={styles.section}>Pack Sizes</Text>
        <Text style={styles.pack}>{data.packSizes.join(', ')}</Text>
        <View style={{marginTop: spacing.xxl}}>
          <Button title="Request Pricing" onPress={requestPricing} />
        </View>
      </View>
      <View style={{height: spacing.xxxl}} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: colors.background},
  loader: {flex: 1, alignItems: 'center', justifyContent: 'center'},
  img: {height: verticalScale(240), width: '100%'},
  card: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: radius.xxl,
    borderTopRightRadius: radius.xxl,
    marginTop: -24,
    padding: spacing.xxl,
  },
  name: {
    ...theme.typography.bold,
    fontSize: theme.fontSize.xl,
    color: colors.text,
  },
  brand: {
    ...theme.typography.regular,
    fontSize: theme.fontSize.sm,
    color: colors.textMuted,
  },
  price: {
    ...theme.typography.bold,
    fontSize: theme.fontSize.xxl,
    color: colors.primary,
    marginVertical: spacing.md,
  },
  desc: {
    ...theme.typography.regular,
    fontSize: theme.fontSize.md,
    color: colors.textSecondary,
    lineHeight: theme.fontSize.md * 1.5,
  },
  section: {
    ...theme.typography.bold,
    fontSize: theme.fontSize.md,
    color: colors.text,
    marginTop: spacing.xl,
    marginBottom: spacing.sm,
  },
  specRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  specLabel: {
    ...theme.typography.regular,
    fontSize: theme.fontSize.sm,
    color: colors.textSecondary,
  },
  specValue: {
    ...theme.typography.medium,
    fontSize: theme.fontSize.sm,
    color: colors.text,
  },
  pack: {
    ...theme.typography.regular,
    fontSize: theme.fontSize.md,
    color: colors.text,
  },
});
export default ProductDetailsScreen;
