import React, {useState} from 'react';
import {
  Alert,
  ScrollView,
  Share,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {RouteProp, useNavigation, useRoute} from '@react-navigation/native';
import {
  ChevronLeft,
  FileText,
  Heart,
  Share2,
  ShieldCheck,
  Sparkles,
} from 'lucide-react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {CatalogueStackParamList} from '../../navigation/types';
import AppImage from '../../components/ui/AppImage';
import {colors, fontSize, radius, scale, spacing, typography, verticalScale} from '../../theme';

type Route = RouteProp<CatalogueStackParamList, 'ProductDetails'>;

export const ProductDetailsScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const insets = useSafeAreaInsets();
  const route = useRoute<Route>();
  const [activeTab, setActiveTab] = useState<'overview' | 'specifications' | 'documents'>('overview');
  const [selectedPack, setSelectedPack] = useState('20L');
  const [isFavorite, setIsFavorite] = useState(false);

  const product = {
    id: route.params?.productId ?? 'p2',
    name: 'Gear Oil AX-200',
    subtitle: 'Extreme Pressure Gear Oil',
    image: 'product_drum',
    tags: ['Automotive', 'Industrial', 'High Performance'],
    description:
      'High-performance gear oil designed for industrial gear systems with excellent wear protection and thermal stability. Delivers prolonged machinery life and reduces friction.',
    packSizes: ['1L', '5L', '20L', '210L'],
    specs: [
      {label: 'Viscosity Grade', value: 'ISO VG 220'},
      {label: 'Flash Point', value: '230°C'},
      {label: 'Pour Point', value: '-18°C'},
      {label: 'Density @ 15°C', value: '0.892 g/cm³'},
      {label: 'Copper Corrosion', value: '1a (ASTM D130)'},
    ],
  };

  const onShare = async () => {
    try {
      await Share.share({
        message: `${product.name} - ${product.subtitle}\nAxnol Lubetech India Pvt. Ltd.`,
      });
    } catch {
      // ignore
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* Header */}
      <View style={[styles.header, {paddingTop: insets.top + scale(6)}]}>
        <TouchableOpacity
          style={styles.headerBtn}
          activeOpacity={0.7}
          onPress={() => navigation.goBack()}>
          <ChevronLeft size={scale(24)} color="#0F172A" />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Product Details</Text>

        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.headerBtn} activeOpacity={0.7} onPress={onShare}>
            <Share2 size={scale(20)} color="#0F172A" />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.headerBtn}
            activeOpacity={0.7}
            onPress={() => setIsFavorite(!isFavorite)}>
            <Heart
              size={scale(20)}
              color={isFavorite ? '#EF4444' : '#0F172A'}
              fill={isFavorite ? '#EF4444' : 'none'}
            />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scrollContent, {paddingBottom: insets.bottom + scale(105)}]}>
        
        {/* Large Centered Hero Showcase with Soft Glow */}
        <View style={styles.heroWrap}>
          <View style={styles.heroAura} />
          <AppImage
            uri={product.image}
            style={styles.heroImage}
            resizeMode="contain"
          />
        </View>

        {/* Product Basic Info */}
        <View style={styles.bodyContent}>
          <Text style={styles.productName}>{product.name}</Text>
          <Text style={styles.productSubtitle}>{product.subtitle}</Text>

          {/* Tags */}
          <View style={styles.tagsRow}>
            {product.tags.map(tag => (
              <View key={tag} style={styles.tagPill}>
                <Text style={styles.tagText}>{tag}</Text>
              </View>
            ))}
          </View>

          {/* Horizontal Underlined Tabs */}
          <View style={styles.tabsRow}>
            <TouchableOpacity
              style={[styles.tabItem, activeTab === 'overview' && styles.tabItemActive]}
              activeOpacity={0.7}
              onPress={() => setActiveTab('overview')}>
              <Text
                style={[styles.tabText, activeTab === 'overview' && styles.tabTextActive]}>
                Overview
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.tabItem, activeTab === 'specifications' && styles.tabItemActive]}
              activeOpacity={0.7}
              onPress={() => setActiveTab('specifications')}>
              <Text
                style={[
                  styles.tabText,
                  activeTab === 'specifications' && styles.tabTextActive,
                ]}>
                Specifications
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.tabItem, activeTab === 'documents' && styles.tabItemActive]}
              activeOpacity={0.7}
              onPress={() => setActiveTab('documents')}>
              <Text
                style={[styles.tabText, activeTab === 'documents' && styles.tabTextActive]}>
                Documents
              </Text>
            </TouchableOpacity>
          </View>

          {/* Tab Content */}
          {activeTab === 'overview' && (
            <View style={styles.tabContentBlock}>
              <Text style={styles.descriptionText}>{product.description}</Text>
              <View style={styles.featureRow}>
                <ShieldCheck size={scale(18)} color="#10B981" />
                <Text style={styles.featureText}>ISO 9001:2015 Certified High Protection</Text>
              </View>
            </View>
          )}

          {activeTab === 'specifications' && (
            <View style={styles.specBox}>
              {product.specs.map(s => (
                <View key={s.label} style={styles.specRow}>
                  <Text style={styles.specLabel}>{s.label}</Text>
                  <Text style={styles.specValue}>{s.value}</Text>
                </View>
              ))}
            </View>
          )}

          {activeTab === 'documents' && (
            <View style={styles.docBox}>
              <TouchableOpacity
                style={styles.docItem}
                activeOpacity={0.75}
                onPress={() => Alert.alert('Downloading', 'TDS PDF downloading...')}>
                <FileText size={scale(22)} color="#EF4444" />
                <View style={{flex: 1, marginLeft: spacing.sm}}>
                  <Text style={styles.docTitle}>Technical Data Sheet (TDS)</Text>
                  <Text style={styles.docSub}>PDF • 1.8 MB</Text>
                </View>
              </TouchableOpacity>
            </View>
          )}

          {/* Available Pack Sizes */}
          <View style={styles.packSection}>
            <Text style={styles.packHeading}>Available Pack Sizes</Text>
            <View style={styles.packRow}>
              {product.packSizes.map(size => {
                const selected = size === selectedPack;
                return (
                  <TouchableOpacity
                    key={size}
                    style={[styles.packPill, selected && styles.packPillSelected]}
                    activeOpacity={0.8}
                    onPress={() => setSelectedPack(size)}>
                    <Text
                      style={[
                        styles.packPillText,
                        selected && styles.packPillTextSelected,
                      ]}>
                      {size}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Sticky Bottom Action Bar */}
      <View style={[styles.bottomBar, {paddingBottom: insets.bottom + scale(10)}]}>
        <TouchableOpacity
          style={styles.addRequestBtn}
          activeOpacity={0.85}
          onPress={() => {
            Alert.alert('Added to Request', `${product.name} (${selectedPack}) added to quote list.`);
          }}>
          <Text style={styles.addRequestText}>Add to Request</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.requestPriceBtn}
          activeOpacity={0.85}
          onPress={() =>
            navigation.navigate('RequestPrice', {
              productId: product.id,
              productName: product.name,
              category: product.subtitle,
            })
          }>
          <Text style={styles.requestPriceText}>Request Price</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingBottom: scale(10),
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  headerBtn: {
    padding: scale(4),
  },
  headerTitle: {
    fontSize: scale(17),
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: -0.2,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  scrollContent: {
    paddingTop: spacing.xs,
  },
  heroWrap: {
    height: verticalScale(230),
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    paddingVertical: spacing.md,
  },
  heroAura: {
    position: 'absolute',
    width: scale(180),
    height: scale(180),
    borderRadius: scale(90),
    backgroundColor: 'rgba(2, 132, 199, 0.06)',
  },
  heroImage: {
    width: scale(175),
    height: scale(205),
  },
  bodyContent: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.sm,
  },
  productName: {
    fontSize: scale(22),
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: -0.3,
  },
  productSubtitle: {
    fontSize: scale(13),
    color: '#64748B',
    marginTop: 2,
    marginBottom: spacing.md,
  },
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  tagPill: {
    backgroundColor: '#F1F5F9',
    borderRadius: radius.pill,
    paddingHorizontal: scale(12),
    paddingVertical: scale(5),
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  tagText: {
    fontSize: scale(11),
    fontWeight: '600',
    color: '#475569',
  },
  tabsRow: {
    flexDirection: 'row',
    borderBottomWidth: 1.5,
    borderBottomColor: '#F1F5F9',
    marginBottom: spacing.lg,
    gap: spacing.xl,
  },
  tabItem: {
    paddingBottom: scale(10),
  },
  tabItemActive: {
    borderBottomWidth: 2.5,
    borderBottomColor: '#0284C7',
  },
  tabText: {
    fontSize: scale(13),
    fontWeight: '600',
    color: '#94A3B8',
  },
  tabTextActive: {
    color: '#0284C7',
    fontWeight: '800',
  },
  tabContentBlock: {
    marginBottom: spacing.xl,
  },
  descriptionText: {
    fontSize: scale(13),
    color: '#334155',
    lineHeight: scale(21),
    marginBottom: spacing.md,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: scale(8),
    backgroundColor: '#F0FDF4',
    paddingHorizontal: spacing.md,
    paddingVertical: scale(8),
    borderRadius: radius.md,
  },
  featureText: {
    fontSize: scale(11.5),
    fontWeight: '600',
    color: '#15803D',
  },
  specBox: {
    backgroundColor: '#F8FAFC',
    borderRadius: radius.lg,
    padding: spacing.md,
    marginBottom: spacing.xl,
    gap: scale(10),
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  specRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 2,
  },
  specLabel: {
    fontSize: scale(12),
    color: '#64748B',
  },
  specValue: {
    fontSize: scale(12),
    fontWeight: '700',
    color: '#0F172A',
  },
  docBox: {
    marginBottom: spacing.xl,
  },
  docItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    padding: spacing.md,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  docTitle: {
    fontSize: scale(13),
    fontWeight: '700',
    color: '#0F172A',
  },
  docSub: {
    fontSize: scale(11),
    color: '#64748B',
    marginTop: 2,
  },
  packSection: {
    marginBottom: spacing.xl,
  },
  packHeading: {
    fontSize: scale(13),
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: scale(9),
  },
  packRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  packPill: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: scale(10),
    borderRadius: radius.md,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.2,
    borderColor: '#CBD5E1',
  },
  packPillSelected: {
    borderColor: '#0284C7',
    backgroundColor: '#F0F9FF',
    shadowColor: '#0284C7',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 2,
  },
  packPillText: {
    fontSize: scale(13),
    fontWeight: '600',
    color: '#475569',
  },
  packPillTextSelected: {
    color: '#0284C7',
    fontWeight: '800',
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: spacing.lg,
    paddingTop: scale(12),
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    gap: spacing.md,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: -3},
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 6,
  },
  addRequestBtn: {
    flex: 1,
    height: scale(47),
    borderRadius: radius.pill,
    borderWidth: 1.8,
    borderColor: '#0284C7',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
  },
  addRequestText: {
    fontSize: scale(13.5),
    fontWeight: '700',
    color: '#0284C7',
  },
  requestPriceBtn: {
    flex: 1,
    height: scale(47),
    borderRadius: radius.pill,
    backgroundColor: '#EA580C',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#EA580C',
    shadowOffset: {width: 0, height: 3},
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 3,
  },
  requestPriceText: {
    fontSize: scale(13.5),
    fontWeight: '700',
    color: '#FFFFFF',
  },
});

export default ProductDetailsScreen;
