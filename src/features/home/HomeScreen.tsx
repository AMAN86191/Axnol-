import React, {useState} from 'react';
import {
  Dimensions,
  Image,
  ImageBackground,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {
  ArrowRight,
  Bell,
  ChevronDown,
  ChevronRight,
  Heart,
  ScanLine,
  Search,
} from 'lucide-react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import AppImage from '../../components/ui/AppImage';
import {colors, fontSize, radius, scale, spacing, typography} from '../../theme';
import {useAppSelector} from '../../store';
import images from '../../assets/images';


const INDUSTRIES = [
  {
    id: 'ind2',
    name: 'Automotive',
    image: images.ind_automotive,
  },
  {
    id: 'ind1',
    name: 'Industrial',
    image: images.ind_industrial,
  },
  {
    id: 'ind6',
    name: 'Construction',
    image: images.ind_construction,
  },
  {
    id: 'ind4',
    name: 'Marine',
    image: images.ind_marine,
  },
];

const FEATURED_PRODUCTS = [
  {
    id: 'p1',
    name: 'Engine Oil 15W-40',
    code: 'AXN-EN-1540',
    category: 'Engine Oil',
    tagBg: '#FFF7ED',
    tagColor: '#EA580C',
    image: images.feat_prod1_img,
  },
  {
    id: 'p2',
    name: 'Hydraulic Oil AW 68',
    code: 'AXN-HY-068',
    category: 'Hydraulic Oil',
    tagBg: '#EFF6FF',
    tagColor: '#2563EB',
    image: images.feat_prod2_img,
  },
  {
    id: 'p3',
    name: 'Gear Oil EP 90',
    code: 'AXN-GR-090',
    category: 'Gear Oil',
    tagBg: '#FAF5FF',
    tagColor: '#7C3AED',
    image: images.feat_prod3_img,
  },
  {
    id: 'p4',
    name: 'Compressor Oil',
    code: 'AXN-CP-100',
    category: 'Compressor Oil',
    tagBg: '#F0FDF4',
    tagColor: '#16A34A',
    image: images.feat_prod4_img,
  },
];

export const HomeScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const insets = useSafeAreaInsets();
  const user = useAppSelector(s => s.auth.user);
  const [search, setSearch] = useState('');
  const [favorites, setFavorites] = useState<Record<string, boolean>>({});

  const toggleFavorite = (id: string) => {
    setFavorites(prev => ({...prev, [id]: !prev[id]}));
  };

  const handleSearchSubmit = () => {
    if (search.trim()) {
      navigation.navigate('Products', {
        screen: 'Products',
        params: {search: search.trim(), title: `Search: ${search.trim()}`},
      });
    }
  };

  const onQuickAction = (key: string) => {
    switch (key) {
      case 'Products':
        navigation.navigate('Products', {screen: 'Products'});
        break;
      case 'PriceRequest':
        navigation.navigate('Products', {screen: 'RequestPrice'});
        break;
      case 'Orders':
        navigation.navigate('Orders', {screen: 'OrdersList'});
        break;
      case 'Invoices':
        navigation.navigate('Orders', {screen: 'Invoice'});
        break;
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" translucent backgroundColor="transparent" />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.scrollContent,
          {
            paddingTop: insets.top + scale(8),
            paddingBottom: insets.bottom + scale(85),
          },
        ]}>
        
        {/* ================= 1. Top Header Row ================= */}
        <View style={styles.headerRow}>
          {/* Brand Logo */}
          <View style={styles.logoWrap}>
            <AppImage uri="logo" resizeMode="contain" style={styles.logo} />
          </View>

          {/* Right Header items: Notification Bell + User Profile */}
          <View style={styles.headerRight}>
            {/* Notification Bell */}
            <TouchableOpacity
              style={styles.bellBtn}
              activeOpacity={0.75}
              onPress={() => navigation.navigate('Orders', {screen: 'OrdersList'})}>
              <Bell size={scale(20)} color="#1E293B" strokeWidth={2.2} />
              <View style={styles.bellDot} />
            </TouchableOpacity>

            {/* Profile Chip */}
            <TouchableOpacity
              style={styles.profileChip}
              activeOpacity={0.8}
              onPress={() => navigation.navigate('Profile')}>
              <Image source={images.user_avatar} style={styles.avatarImg} />
              <View style={styles.profileTexts}>
                <Text style={styles.helloText}>Hello,</Text>
                <Text style={styles.userName} numberOfLines={1}>
                  {user?.name ?? 'Rahul Sharma'}
                </Text>
              </View>
              <ChevronDown size={scale(15)} color="#0F172A" strokeWidth={2.2} />
            </TouchableOpacity>
          </View>
        </View>

        {/* ================= 2. Search Row + Scan QR ================= */}
        <View style={styles.searchRow}>
          <View style={styles.searchBar}>
            <Search size={scale(18)} color="#64748B" strokeWidth={2.2} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search products, industries, categories..."
              placeholderTextColor="#94A3B8"
              value={search}
              onChangeText={setSearch}
              onSubmitEditing={handleSearchSubmit}
              returnKeyType="search"
            />
          </View>

          {/* Scanner Button */}
          <TouchableOpacity
            style={styles.scanBtn}
            activeOpacity={0.75}
            onPress={() => {
              navigation.navigate('Products', {screen: 'Products'});
            }}>
            <ScanLine size={scale(20)} color="#0F172A" strokeWidth={2.2} />
          </TouchableOpacity>
        </View>

        {/* ================= 3. Hero Carousel Banner ================= */}
        <View style={styles.bannerContainer}>
          <TouchableOpacity
            style={styles.bannerWrap}
            activeOpacity={0.9}
            onPress={() => navigation.navigate('Products', {screen: 'Products'})}>
            <Image
              source={images.home_hero_new}
              style={styles.bannerImage}
              resizeMode="cover"
            />
          </TouchableOpacity>

          {/* Carousel Dots */}
          <View style={styles.dotsRow}>
            <View style={[styles.dot, styles.dotActive]} />
            <View style={styles.dot} />
            <View style={styles.dot} />
            <View style={styles.dot} />
          </View>
        </View>

      

        {/* ================= 5. Industries Section ================= */}
        <View style={styles.sectionWrap}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Industries</Text>
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => navigation.navigate('Products', {screen: 'Industries'})}
              style={styles.viewAllBtn}>
              <Text style={styles.viewAllText}>View All</Text>
              <ChevronRight size={scale(15)} color="#0284C7" strokeWidth={2.4} />
            </TouchableOpacity>
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.horizontalScrollPad}>
            {INDUSTRIES.map(ind => (
              <TouchableOpacity
                key={ind.id}
                style={styles.industryCard}
                activeOpacity={0.85}
                onPress={() =>
                  navigation.navigate('Products', {
                    screen: 'Products',
                    params: {title: ind.name, industryId: ind.id},
                  })
                }>
                <Image
                  source={ind.image}
                  style={styles.industryCardImg}
                  resizeMode="cover"
                />
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* ================= 6. Featured Products Section ================= */}
        <View style={styles.sectionWrap}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Featured Products</Text>
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() =>
                navigation.navigate('Products', {
                  screen: 'Products',
                  params: {featured: true, title: 'Featured Products'},
                })
              }
              style={styles.viewAllBtn}>
              <Text style={styles.viewAllText}>View All</Text>
              <ChevronRight size={scale(15)} color="#0284C7" strokeWidth={2.4} />
            </TouchableOpacity>
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.horizontalScrollPad}>
            {FEATURED_PRODUCTS.map(prod => {
              const isFav = Boolean(favorites[prod.id]);
              return (
                <TouchableOpacity
                  key={prod.id}
                  style={styles.productCard}
                  activeOpacity={0.85}
                  onPress={() =>
                    navigation.navigate('Products', {
                      screen: 'ProductDetails',
                      params: {productId: prod.id},
                    })
                  }>
                  {/* Heart / Favorite button */}
                  <TouchableOpacity
                    style={styles.favBtn}
                    activeOpacity={0.7}
                    onPress={() => toggleFavorite(prod.id)}>
                    <Heart
                      size={scale(14)}
                      color={isFav ? '#EF4444' : '#64748B'}
                      fill={isFav ? '#EF4444' : 'none'}
                      strokeWidth={1.8}
                    />
                  </TouchableOpacity>

                  {/* Centered Product Image */}
                  <View style={styles.prodImgWrap}>
                    <Image
                      source={prod.image}
                      style={styles.prodImg}
                      resizeMode="contain"
                    />
                  </View>

                  {/* Product Info */}
                  <Text style={styles.prodName} numberOfLines={1}>
                    {prod.name}
                  </Text>
                  <Text style={styles.prodCode}>{prod.code}</Text>

                  {/* Category Pill */}
                  <View style={[styles.prodTagPill, {backgroundColor: prod.tagBg}]}>
                    <Text style={[styles.prodTagText, {color: prod.tagColor}]}>
                      {prod.category}
                    </Text>
                  </View>

                  {/* View Details Pill Button */}
                  <View style={styles.viewDetailsBtn}>
                    <Text style={styles.viewDetailsText}>View Details</Text>
                    <ArrowRight size={scale(11)} color="#2563EB" strokeWidth={2.4} />
                  </View>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* ================= 7. Bottom Promotional Banner (Why Axnol) ================= */}
        <TouchableOpacity
          style={styles.bottomPromoWrap}
          activeOpacity={0.9}
          onPress={() => navigation.navigate('Products', {screen: 'Industries'})}>
          <Image
            source={images.why_axnol_banner}
            style={styles.bottomPromoImg}
            resizeMode="cover"
          />
        </TouchableOpacity>

      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  scrollContent: {
    paddingHorizontal: scale(14),
  },

  /* 1. Header Styles */
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: scale(6),
    marginBottom: scale(8),
  },
  logoWrap: {
    justifyContent: 'center',
  },
  logo: {
    width: scale(135),
    height: scale(36),
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: scale(10),
  },
  bellBtn: {
    width: scale(36),
    height: scale(36),
    alignItems: 'center',
    justifyContent: 'center',
  },
  bellDot: {
    position: 'absolute',
    top: scale(5),
    right: scale(7),
    width: scale(8),
    height: scale(8),
    borderRadius: scale(4),
    backgroundColor: '#DC2626',
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
  },
  profileChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: scale(6),
  },
  avatarImg: {
    width: scale(34),
    height: scale(34),
    borderRadius: scale(17),
    backgroundColor: '#F1F5F9',
  },
  profileTexts: {
    justifyContent: 'center',
  },
  helloText: {
    fontSize: scale(10),
    color: '#64748B',
    fontWeight: '500',
    lineHeight: scale(12),
  },
  userName: {
    fontSize: scale(12.5),
    fontWeight: '800',
    color: '#0F172A',
    lineHeight: scale(15),
  },

  /* 2. Search Row */
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: scale(8),
    marginBottom: scale(12),
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: scale(14),
    borderWidth: 1.2,
    borderColor: '#E2E8F0',
    paddingHorizontal: scale(12),
    height: scale(44),
    shadowColor: '#0F172A',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.03,
    shadowRadius: 3,
    elevation: 1,
  },
  searchInput: {
    flex: 1,
    marginLeft: scale(8),
    fontSize: scale(12.5),
    color: '#0F172A',
    paddingVertical: 0,
    fontWeight: '500',
  },
  scanBtn: {
    width: scale(44),
    height: scale(44),
    borderRadius: scale(14),
    backgroundColor: '#FFFFFF',
    borderWidth: 1.2,
    borderColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#0F172A',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.03,
    shadowRadius: 3,
    elevation: 1,
  },

  /* 3. Hero Carousel Banner */
  bannerContainer: {
    marginBottom: scale(12),
  },
  bannerWrap: {
    width: '100%',
    height: scale(195),
    borderRadius: scale(16),
    overflow: 'hidden',
    shadowColor: '#0A3B74',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.16,
    shadowRadius: 8,
    elevation: 4,
  },
  bannerImage: {
    width: '100%',
    height: '100%',
  },
  dotsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: scale(5),
    marginTop: scale(8),
  },
  dot: {
    width: scale(6),
    height: scale(6),
    borderRadius: scale(3),
    backgroundColor: '#CBD5E1',
  },
  dotActive: {
    width: scale(18),
    backgroundColor: '#0A3B74',
  },


  /* 5. Section General Styles */
  sectionWrap: {
    marginBottom: scale(18),
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: scale(10),
  },
  sectionTitle: {
    fontSize: scale(17),
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: -0.2,
  },
  viewAllBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  viewAllText: {
    fontSize: scale(12.5),
    fontWeight: '700',
    color: '#0284C7',
  },
  horizontalScrollPad: {
    gap: scale(9),
    paddingRight: scale(6),
  },

  /* Industries Cards */
  industryCard: {
    width: scale(115),
    height: scale(102),
    borderRadius: scale(14),
    overflow: 'hidden',
    backgroundColor: '#0F172A',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  industryCardImg: {
    width: '100%',
    height: '100%',
  },

  /* Featured Products Cards */
  productCard: {
    width: scale(114),
    backgroundColor: '#FFFFFF',
    borderRadius: scale(14),
    borderWidth: 1.2,
    borderColor: '#E2E8F0',
    padding: scale(8),
    shadowColor: '#0F172A',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1.5,
  },
  favBtn: {
    position: 'absolute',
    top: scale(8),
    right: scale(8),
    zIndex: 2,
  },
  prodImgWrap: {
    height: scale(72),
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: scale(4),
    marginBottom: scale(6),
  },
  prodImg: {
    width: scale(64),
    height: scale(70),
  },
  prodName: {
    fontSize: scale(11),
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: -0.2,
    marginBottom: 1,
  },
  prodCode: {
    fontSize: scale(9),
    color: '#94A3B8',
    fontWeight: '500',
    marginBottom: scale(5),
  },
  prodTagPill: {
    alignSelf: 'flex-start',
    paddingHorizontal: scale(6),
    paddingVertical: scale(2.5),
    borderRadius: scale(6),
    marginBottom: scale(6),
  },
  prodTagText: {
    fontSize: scale(8.8),
    fontWeight: '700',
  },
  viewDetailsBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#EFF6FF',
    borderRadius: scale(8),
    paddingVertical: scale(4),
    gap: 3,
  },
  viewDetailsText: {
    fontSize: scale(9.5),
    fontWeight: '700',
    color: '#2563EB',
  },

  /* 7. Bottom Promotional Banner */
  bottomPromoWrap: {
    width: '100%',
    height: scale(68),
    borderRadius: scale(14),
    overflow: 'hidden',
    marginTop: scale(2),
    marginBottom: scale(10),
    shadowColor: '#0F172A',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
  },
  bottomPromoImg: {
    width: '100%',
    height: '100%',
  },
});

export default HomeScreen;
