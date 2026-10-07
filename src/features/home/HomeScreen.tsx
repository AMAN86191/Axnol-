import React from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  ImageBackground,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {useGetHomeQuery} from '../../api/services/homeApi';
import {
  colors,
  radius,
  scale,
  spacing,
  theme,
  verticalScale,
} from '../../theme';

export const HomeScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const {data, isLoading} = useGetHomeQuery();
  if (isLoading || !data) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }
  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <ImageBackground
        source={{uri: data.banners[0]?.image}}
        style={styles.hero}
        resizeMode="cover">
        <View style={styles.heroOverlay} />
        <View style={styles.heroContent}>
          <Image
            source={require('../../assets/logo.png')}
            resizeMode="contain"
            style={styles.logo}
          />
          <Text style={styles.tagline}>{data.banners[0]?.title}</Text>
          <Text style={styles.subtitle}>{data.banners[0]?.subtitle}</Text>
        </View>
      </ImageBackground>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Industries</Text>
        <FlatList
          data={data.industries}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{gap: spacing.md}}
          keyExtractor={i => i.id}
          renderItem={({item}) => (
            <TouchableOpacity
              style={styles.indCard}
              onPress={() =>
                navigation.navigate('Catalogue', {
                  screen: 'Categories',
                  params: {industryId: item.id, industryName: item.name},
                })
              }>
              <Image source={{uri: item.image}} style={styles.indImg} />
              <Text style={styles.indName} numberOfLines={1}>
                {item.name}
              </Text>
            </TouchableOpacity>
          )}
        />
      </View>
      <View style={styles.section}>
        <View style={styles.rowBetween}>
          <Text style={styles.sectionTitle}>Featured Products</Text>
          <TouchableOpacity
            onPress={() =>
              navigation.navigate('Catalogue', {
                screen: 'Products',
                params: {title: 'Featured', featured: true},
              })
            }>
            <Text style={styles.viewAll}>View All</Text>
          </TouchableOpacity>
        </View>
        <FlatList
          data={data.featuredProducts}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{gap: spacing.md}}
          keyExtractor={p => p.id}
          renderItem={({item}) => (
            <TouchableOpacity
              style={styles.prodCard}
              onPress={() =>
                navigation.navigate('Catalogue', {
                  screen: 'ProductDetails',
                  params: {productId: item.id},
                })
              }>
              <Image source={{uri: item.images[0]}} style={styles.prodImg} />
              <Text style={styles.prodName} numberOfLines={2}>
                {item.name}
              </Text>
              <Text style={styles.prodPrice}>
                ₹ {item.dealerPrice ?? item.price}
              </Text>
            </TouchableOpacity>
          )}
        />
      </View>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Stats</Text>
        <View style={styles.statsGrid}>
          {data.stats.map(s => (
            <View key={s.label} style={styles.statCard}>
              <Text style={styles.statValue}>{s.value}</Text>
              <Text style={styles.statLabel}>{s.label}</Text>
            </View>
          ))}
        </View>
      </View>
      <View style={{height: spacing.xxxl}} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: colors.background},
  loader: {flex: 1, alignItems: 'center', justifyContent: 'center'},
  hero: {height: verticalScale(260), justifyContent: 'flex-end'},
  heroOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(7,24,44,0.55)',
  },
  heroContent: {padding: spacing.xxl},
  logo: {width: scale(150), height: verticalScale(60)},
  tagline: {
    ...theme.typography.bold,
    fontSize: theme.fontSize.xl,
    color: colors.textInverse,
    marginTop: spacing.md,
  },
  subtitle: {
    ...theme.typography.regular,
    fontSize: theme.fontSize.sm,
    color: colors.primaryMuted,
  },
  section: {padding: spacing.xxl, paddingBottom: 0},
  sectionTitle: {
    ...theme.typography.bold,
    fontSize: theme.fontSize.lg,
    color: colors.text,
    marginBottom: spacing.md,
  },
  rowBetween: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  viewAll: {
    ...theme.typography.medium,
    fontSize: theme.fontSize.sm,
    color: colors.primary,
  },
  indCard: {
    width: scale(100),
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    overflow: 'hidden',
  },
  indImg: {width: '100%', height: verticalScale(70)},
  indName: {
    ...theme.typography.medium,
    fontSize: theme.fontSize.xs,
    color: colors.text,
    padding: spacing.sm,
    textAlign: 'center',
  },
  prodCard: {
    width: scale(160),
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.md,
  },
  prodImg: {
    width: '100%',
    height: verticalScale(90),
    borderRadius: radius.sm,
    marginBottom: spacing.sm,
  },
  prodName: {
    ...theme.typography.medium,
    fontSize: theme.fontSize.sm,
    color: colors.text,
    lineHeight: theme.fontSize.sm * 1.4,
    height: theme.fontSize.sm * 2.8,
  },
  prodPrice: {
    ...theme.typography.bold,
    fontSize: theme.fontSize.sm,
    color: colors.primary,
    marginTop: spacing.sm,
  },
  statsGrid: {flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md},
  statCard: {
    width: '47%',
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.lg,
    alignItems: 'center',
  },
  statValue: {
    ...theme.typography.bold,
    fontSize: theme.fontSize.xxl,
    color: colors.primary,
  },
  statLabel: {
    ...theme.typography.regular,
    fontSize: theme.fontSize.xs,
    color: colors.textSecondary,
  },
});
export default HomeScreen;
