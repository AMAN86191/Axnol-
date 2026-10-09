import React, {useRef, useState} from 'react';
import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {
  Bell,
  ChevronRight,
  FileText,
  LayoutGrid,
  ReceiptText,
  Tag,
} from 'lucide-react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {useGetHomeQuery} from '../../api/services/homeApi';
import {useGetNotificationsQuery} from '../../api/services/documentsApi';
import AppImage from '../../components/ui/AppImage';
import SectionHeader from '../../components/ui/SectionHeader';
import {Banner, Industry, Product} from '../../api/types';
import {
  colors,
  fontSize,
  radius,
  scale,
  shadows,
  spacing,
  typography,
  verticalScale,
} from '../../theme';

const {width: WIN_WIDTH} = Dimensions.get('window');
const BANNER_W = WIN_WIDTH - spacing.lg * 2;
const BANNER_H = verticalScale(180);

const QUICK_ACTIONS = [
  {key: 'Catalogue', label: 'Catalogue', icon: LayoutGrid},
  {key: 'Orders', label: 'Orders', icon: ReceiptText},
  {key: 'Pricing', label: 'Pricing', icon: Tag},
  {key: 'Documents', label: 'Docs', icon: FileText},
] as const;

export const HomeScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const insets = useSafeAreaInsets();
  const {data, isLoading} = useGetHomeQuery();
  const {data: notifications} = useGetNotificationsQuery();
  const [bannerIndex, setBannerIndex] = useState(0);
  const bannerRef = useRef<FlatList<Banner>>(null);

  if (isLoading || !data) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator color={colors.primary} size="large" />
      </View>
    );
  }

  const go = (tab: string, screen?: string, params?: object) =>
    navigation.navigate(tab, screen ? {screen, params} : undefined);

  const onQuickAction = (key: string) => {
    if (key === 'Catalogue') {
      go('Catalogue', 'Industries');
    } else if (key === 'Orders') {
      go('Orders', 'OrdersList');
    } else if (key === 'Pricing') {
      go('Profile', 'PricingRequests');
    } else {
      go('Profile', 'Documents');
    }
  };

  const updates = (notifications ?? []).slice(0, 2);

  return (
    <ScrollView
      style={styles.container}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{paddingBottom: spacing.xxxl}}>
      {/* Top bar */}
      <View style={[styles.topBar, {paddingTop: insets.top + spacing.md}]}>
        <View>
          <Text style={styles.hello}>Axnol Lubetech</Text>
          <Text style={styles.tagline}>Solution of energy since 1959</Text>
        </View>
        <TouchableOpacity
          style={styles.bellBtn}
          activeOpacity={0.7}
          onPress={() => navigation.navigate('Notifications')}>
          <Bell size={scale(20)} color={colors.primary} />
          {updates.length > 0 && !notifications?.every(n => n.read) ? (
            <View style={styles.bellDot} />
          ) : null}
        </TouchableOpacity>
      </View>

      {/* Banners */}
      <View style={styles.bannerWrap}>
        <FlatList
          ref={bannerRef}
          data={data.banners}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          keyExtractor={b => b.id}
          onMomentumScrollEnd={e =>
            setBannerIndex(
              Math.round(e.nativeEvent.contentOffset.x / BANNER_W),
            )
          }
          renderItem={({item}) => (
            <AppImage
              uri={item.image}
              style={styles.banner}
              accessibilityLabel={item.title}
            />
          )}
        />
        <View style={styles.bannerOverlay}>
          <Text style={styles.bannerTitle} numberOfLines={1}>
            {data.banners[bannerIndex]?.title}
          </Text>
          <Text style={styles.bannerSubtitle} numberOfLines={1}>
            {data.banners[bannerIndex]?.subtitle}
          </Text>
        </View>
        <View style={styles.dots}>
          {data.banners.map((b, i) => (
            <View
              key={b.id}
              style={[styles.dot, i === bannerIndex && styles.dotActive]}
            />
          ))}
        </View>
      </View>

      {/* Quick actions */}
      <View style={styles.quickRow}>
        {QUICK_ACTIONS.map(a => (
          <TouchableOpacity
            key={a.key}
            style={styles.quickCard}
            activeOpacity={0.75}
            onPress={() => onQuickAction(a.key)}>
            <View style={styles.quickIcon}>
              <a.icon size={scale(20)} color={colors.primary} strokeWidth={2} />
            </View>
            <Text style={styles.quickLabel}>{a.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Updates */}
      {updates.length > 0 ? (
        <View style={styles.section}>
          <SectionHeader
            title="Updates"
            actionLabel="View all"
            onAction={() => navigation.navigate('Notifications')}
          />
          {updates.map(n => (
            <View key={n.id} style={styles.updateCard}>
              <View
                style={[
                  styles.updateDot,
                  {
                    backgroundColor: n.read
                      ? colors.border
                      : colors.accent,
                  },
                ]}
              />
              <View style={{flex: 1}}>
                <Text style={styles.updateTitle} numberOfLines={1}>
                  {n.title}
                </Text>
                <Text style={styles.updateBody} numberOfLines={2}>
                  {n.body}
                </Text>
              </View>
            </View>
          ))}
        </View>
      ) : null}

      {/* Industries */}
      <View style={styles.section}>
        <SectionHeader
          title="Industries"
          actionLabel="View all"
          onAction={() => go('Catalogue', 'Industries')}
        />
        <FlatList
          data={data.industries}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{gap: spacing.md}}
          keyExtractor={(i: Industry) => i.id}
          renderItem={({item}) => (
            <TouchableOpacity
              style={styles.indCard}
              activeOpacity={0.8}
              onPress={() =>
                go('Catalogue', 'Categories', {
                  industryId: item.id,
                  industryName: item.name,
                })
              }>
              <AppImage uri={item.image} style={styles.indImg} />
              <View style={styles.indLabel}>
                <Text style={styles.indName} numberOfLines={1}>
                  {item.name}
                </Text>
              </View>
            </TouchableOpacity>
          )}
        />
      </View>

      {/* Featured products */}
      <View style={styles.section}>
        <SectionHeader
          title="Featured Products"
          actionLabel="View all"
          onAction={() =>
            go('Catalogue', 'Products', {title: 'Featured', featured: true})
          }
        />
        <FlatList
          data={data.featuredProducts}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{gap: spacing.md}}
          keyExtractor={(p: Product) => p.id}
          renderItem={({item}) => (
            <TouchableOpacity
              style={styles.prodCard}
              activeOpacity={0.8}
              onPress={() =>
                go('Catalogue', 'ProductDetails', {productId: item.id})
              }>
              <AppImage uri={item.images[0]} style={styles.prodImg} />
              <View style={styles.prodBody}>
                <Text style={styles.prodBrand} numberOfLines={1}>
                  {item.brand}
                </Text>
                <Text style={styles.prodName} numberOfLines={2}>
                  {item.name}
                </Text>
                <View style={styles.prodFooter}>
                  <Text style={styles.prodPrice}>
                    ₹{(item.dealerPrice ?? item.price).toLocaleString('en-IN')}
                  </Text>
                  <View style={styles.prodCta}>
                    <ChevronRight size={scale(14)} color={colors.primary} />
                  </View>
                </View>
              </View>
            </TouchableOpacity>
          )}
        />
      </View>

      {/* Stats */}
      <View style={styles.section}>
        <SectionHeader title="Our Reach" />
        <View style={styles.statsCard}>
          {data.stats.map(s => (
            <View key={s.label} style={styles.statItem}>
              <Text style={styles.statValue}>{s.value}</Text>
              <Text style={styles.statLabel}>{s.label}</Text>
            </View>
          ))}
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: colors.background},
  loader: {flex: 1, alignItems: 'center', justifyContent: 'center'},

  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  hello: {
    ...typography.bold,
    fontSize: fontSize.xl,
    color: colors.text,
  },
  tagline: {
    ...typography.regular,
    fontSize: fontSize.xs,
    color: colors.textSecondary,
    marginTop: 2,
  },
  bellBtn: {
    width: scale(40),
    height: scale(40),
    borderRadius: scale(20),
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bellDot: {
    position: 'absolute',
    top: scale(9),
    right: scale(11),
    width: scale(9),
    height: scale(9),
    borderRadius: scale(5),
    backgroundColor: colors.accent,
    borderWidth: 1.5,
    borderColor: colors.primaryLight,
  },

  bannerWrap: {
    marginHorizontal: spacing.lg,
    marginTop: spacing.lg,
    borderRadius: radius.lg,
    overflow: 'hidden',
    backgroundColor: colors.primaryDark,
    ...shadows.medium,
  },
  banner: {width: BANNER_W, height: BANNER_H},
  bannerOverlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    padding: spacing.lg,
    backgroundColor: 'rgba(7, 24, 44, 0.55)',
  },
  bannerTitle: {
    ...typography.bold,
    fontSize: fontSize.xl,
    color: colors.textInverse,
  },
  bannerSubtitle: {
    ...typography.regular,
    fontSize: fontSize.sm,
    color: colors.primaryMuted,
    marginTop: 2,
  },
  dots: {
    position: 'absolute',
    right: spacing.lg,
    top: spacing.md,
    flexDirection: 'row',
    gap: 5,
  },
  dot: {
    width: scale(6),
    height: scale(6),
    borderRadius: 3,
    backgroundColor: 'rgba(255,255,255,0.45)',
  },
  dotActive: {
    backgroundColor: colors.accent,
    width: scale(16),
  },

  quickRow: {
    flexDirection: 'row',
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
    marginTop: spacing.lg,
  },
  quickCard: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.borderLight,
    alignItems: 'center',
    paddingVertical: spacing.md,
    gap: spacing.xs,
    ...shadows.small,
  },
  quickIcon: {
    width: scale(38),
    height: scale(38),
    borderRadius: scale(19),
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickLabel: {
    ...typography.semibold,
    fontSize: fontSize.xs,
    color: colors.text,
  },

  section: {
    marginTop: spacing.xl,
    paddingHorizontal: spacing.lg,
  },
  updateCard: {
    flexDirection: 'row',
    gap: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.borderLight,
    padding: spacing.lg,
    marginBottom: spacing.sm,
    alignItems: 'center',
    ...shadows.small,
  },
  updateDot: {width: scale(8), height: scale(8), borderRadius: 4},
  updateTitle: {
    ...typography.semibold,
    fontSize: fontSize.md,
    color: colors.text,
  },
  updateBody: {
    ...typography.regular,
    fontSize: fontSize.xs,
    color: colors.textSecondary,
    marginTop: 2,
    lineHeight: fontSize.xs * 1.5,
  },

  indCard: {
    width: scale(120),
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.borderLight,
    ...shadows.small,
  },
  indImg: {width: '100%', height: verticalScale(80)},
  indLabel: {padding: spacing.sm},
  indName: {
    ...typography.semibold,
    fontSize: fontSize.xs,
    color: colors.text,
  },

  prodCard: {
    width: scale(170),
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.borderLight,
    overflow: 'hidden',
    ...shadows.small,
  },
  prodImg: {width: '100%', height: verticalScale(110)},
  prodBody: {padding: spacing.md},
  prodBrand: {
    ...typography.medium,
    fontSize: fontSize.xs,
    color: colors.accentDark,
    textTransform: 'uppercase',
  },
  prodName: {
    ...typography.semibold,
    fontSize: fontSize.sm,
    color: colors.text,
    marginTop: 2,
    lineHeight: fontSize.sm * 1.4,
    minHeight: fontSize.sm * 2.8,
  },
  prodFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: spacing.sm,
  },
  prodPrice: {
    ...typography.bold,
    fontSize: fontSize.md,
    color: colors.primary,
  },
  prodCta: {
    width: scale(24),
    height: scale(24),
    borderRadius: scale(12),
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },

  statsCard: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.borderLight,
    paddingVertical: spacing.lg,
    ...shadows.small,
  },
  statItem: {width: '33.33%', alignItems: 'center', paddingVertical: spacing.sm},
  statValue: {
    ...typography.bold,
    fontSize: fontSize.xxl,
    color: colors.primary,
  },
  statLabel: {
    ...typography.regular,
    fontSize: fontSize.xs,
    color: colors.textSecondary,
    marginTop: 2,
  },
});
export default HomeScreen;
