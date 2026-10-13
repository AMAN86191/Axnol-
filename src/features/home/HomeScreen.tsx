import React, {useState} from 'react';
import {
  Dimensions,
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
  FileCheck,
  FileSpreadsheet,
  FileText,
  FolderOpen,
  Search,
} from 'lucide-react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import AppImage from '../../components/ui/AppImage';
import {colors, fontSize, radius, scale, spacing, typography, verticalScale} from '../../theme';
import {useAppSelector} from '../../store';
import images from '../../assets/images';

const {width: SCREEN_WIDTH} = Dimensions.get('window');

const QUICK_ACTIONS = [
  {
    key: 'Products',
    label: 'Products',
    icon: FileText,
    iconBg: '#FFEDD5',
    iconColor: '#EA580C',
  },
  {
    key: 'PriceRequest',
    label: 'Price Request',
    icon: FileCheck,
    iconBg: '#DCFCE7',
    iconColor: '#16A34A',
  },
  {
    key: 'Orders',
    label: 'My Orders',
    icon: FolderOpen,
    iconBg: '#DBEAFE',
    iconColor: '#2563EB',
  },
  {
    key: 'Invoices',
    label: 'Invoices',
    icon: FileSpreadsheet,
    iconBg: '#FEF3C7',
    iconColor: '#D97706',
  },
];

const POPULAR_CATEGORIES = [
  {id: 'cat1', name: 'Engine Oil', image: 'cat_engine_oil', industryId: 'ind2'},
  {id: 'cat2', name: 'Gear Oil', image: 'cat_gear_oil', industryId: 'ind2'},
  {id: 'cat3', name: 'Hydraulic Oil', image: 'cat_hydraulic_oil', industryId: 'ind2'},
  {id: 'cat4', name: 'Industrial', image: 'cat_industrial', industryId: 'ind1'},
  {id: 'cat5', name: 'Marine', image: 'cat_marine', industryId: 'ind4'},
  {id: 'cat6', name: 'Automotive', image: 'cat_automotive', industryId: 'ind2'},
];

export const HomeScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const insets = useSafeAreaInsets();
  const user = useAppSelector(s => s.auth.user);
  const [search, setSearch] = useState('');

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

      {/* Top Header Background with City Backdrop */}
      <ImageBackground
        source={images.header_sky_bg}
        style={[styles.headerBg, {paddingTop: insets.top + scale(4)}]}
        resizeMode="cover">
        
        {/* Logo and Notification Row */}
        <View style={styles.topBar}>
          <View style={styles.logoWrap}>
            <AppImage uri="logo" resizeMode="contain" style={styles.logo} />
          </View>
          <TouchableOpacity
            style={styles.bellBtn}
            activeOpacity={0.7}
            onPress={() => navigation.navigate('Orders', {screen: 'OrdersList'})}>
            <Bell size={scale(20)} color="#1E293B" strokeWidth={2.2} />
            <View style={styles.bellDot} />
          </TouchableOpacity>
        </View>

        {/* User Greeting Row */}
        <View style={styles.greetingRow}>
          <View style={styles.avatarWrap}>
            <AppImage uri="user_avatar" style={styles.avatar} resizeMode="cover" />
          </View>
          <View style={styles.greetingText}>
            <Text style={styles.helloText}>Hello,</Text>
            <Text style={styles.userName}>{user?.name ?? 'Rahul Sharma'}</Text>
          </View>
        </View>
      </ImageBackground>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scrollContent, {paddingBottom: insets.bottom + scale(85)}]}>
        
        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <Search size={scale(18)} color="#94A3B8" strokeWidth={2.2} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search products, industries..."
            placeholderTextColor="#94A3B8"
            value={search}
            onChangeText={setSearch}
            onSubmitEditing={handleSearchSubmit}
            returnKeyType="search"
          />
        </View>

        {/* Hero Banner with Exact Graphic and View Products Button */}
        <TouchableOpacity
          activeOpacity={0.9}
          onPress={() => navigation.navigate('Products', {screen: 'Products'})}
          style={styles.bannerWrap}>
          <ImageBackground
            source={images.hero_banner}
            style={styles.bannerImage}
            imageStyle={styles.bannerImageInner}
            resizeMode="cover">
            {/* Clickable View Products Pill Button overlaid on banner position */}
            <View style={styles.bannerBtnOverlay}>
              <View style={styles.viewProductsBtn}>
                <Text style={styles.viewProductsBtnText}>View Products</Text>
                <ArrowRight size={scale(13)} color="#FFFFFF" strokeWidth={2.5} />
              </View>
            </View>
          </ImageBackground>
        </TouchableOpacity>

        {/* Quick Actions (4 Cards Row) */}
        <View style={styles.quickActionRow}>
          {QUICK_ACTIONS.map(action => (
            <TouchableOpacity
              key={action.key}
              style={styles.quickCard}
              activeOpacity={0.8}
              onPress={() => onQuickAction(action.key)}>
              <View style={[styles.quickIconBox, {backgroundColor: action.iconBg}]}>
                <action.icon size={scale(22)} color={action.iconColor} strokeWidth={2.2} />
              </View>
              <Text style={styles.quickLabel}>{action.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Popular Categories Section */}
        <View style={styles.categoriesSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Popular Categories</Text>
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => navigation.navigate('Products', {screen: 'Industries'})}>
              <Text style={styles.viewAllText}>View All</Text>
            </TouchableOpacity>
          </View>

          {/* 2x3 Grid Matching Exact Artwork */}
          <View style={styles.catGrid}>
            {POPULAR_CATEGORIES.map(cat => (
              <TouchableOpacity
                key={cat.id}
                style={styles.catCard}
                activeOpacity={0.82}
                onPress={() =>
                  navigation.navigate('Products', {
                    screen: 'Products',
                    params: {title: cat.name},
                  })
                }>
                <View style={styles.catImageWrap}>
                  <AppImage uri={cat.image} style={styles.catImage} resizeMode="cover" />
                </View>
                <Text style={styles.catName} numberOfLines={1}>
                  {cat.name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  headerBg: {
    width: '100%',
    paddingBottom: scale(10),
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: scale(6),
  },
  logoWrap: {
    height: scale(36),
    justifyContent: 'center',
  },
  logo: {
    width: scale(140),
    height: scale(36),
  },
  bellBtn: {
    width: scale(38),
    height: scale(38),
    alignItems: 'center',
    justifyContent: 'center',
  },
  bellDot: {
    position: 'absolute',
    top: scale(7),
    right: scale(7),
    width: scale(8),
    height: scale(8),
    borderRadius: scale(4),
    backgroundColor: '#EA580C',
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
  },
  greetingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    marginTop: scale(4),
    marginBottom: scale(8),
    gap: spacing.md,
  },
  avatarWrap: {
    width: scale(48),
    height: scale(48),
    borderRadius: scale(24),
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: '#FFFFFF',
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  avatar: {
    width: '100%',
    height: '100%',
  },
  greetingText: {
    justifyContent: 'center',
  },
  helloText: {
    fontSize: scale(12.5),
    color: '#64748B',
    fontWeight: '500',
  },
  userName: {
    fontSize: scale(16),
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: -0.2,
  },
  scrollContent: {
    paddingTop: scale(4),
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: spacing.lg,
    paddingHorizontal: spacing.md,
    height: scale(46),
    borderRadius: radius.pill,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.2,
    borderColor: '#E2E8F0',
    marginBottom: scale(14),
    shadowColor: '#0F172A',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.04,
    shadowRadius: 5,
    elevation: 2,
  },
  searchInput: {
    flex: 1,
    marginLeft: spacing.sm,
    fontSize: fontSize.sm,
    color: '#0F172A',
    paddingVertical: 0,
    fontWeight: '500',
  },
  bannerWrap: {
    marginHorizontal: spacing.lg,
    borderRadius: radius.lg,
    overflow: 'hidden',
    marginBottom: scale(16),
    shadowColor: '#073660',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.16,
    shadowRadius: 10,
    elevation: 4,
  },
  bannerImage: {
    width: '100%',
    height: scale(140),
  },
  bannerImageInner: {
    borderRadius: radius.lg,
  },
  bannerBtnOverlay: {
    position: 'absolute',
    bottom: scale(14),
    left: scale(14),
  },
  viewProductsBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0284C7',
    paddingHorizontal: scale(12),
    paddingVertical: scale(6),
    borderRadius: radius.pill,
    gap: scale(4),
  },
  viewProductsBtnText: {
    fontSize: scale(11.5),
    fontWeight: '700',
    color: '#FFFFFF',
  },
  quickActionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    marginBottom: scale(20),
  },
  quickCard: {
    width: (SCREEN_WIDTH - spacing.lg * 2 - spacing.sm * 3) / 4,
    backgroundColor: '#FFFFFF',
    borderRadius: radius.md,
    paddingVertical: scale(10),
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#0F172A',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  quickIconBox: {
    width: scale(38),
    height: scale(38),
    borderRadius: scale(10),
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: scale(6),
  },
  quickLabel: {
    fontSize: scale(10.5),
    fontWeight: '700',
    color: '#334155',
    textAlign: 'center',
  },
  categoriesSection: {
    paddingHorizontal: spacing.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  sectionTitle: {
    fontSize: scale(16),
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: -0.2,
  },
  viewAllText: {
    fontSize: scale(13),
    fontWeight: '700',
    color: '#0284C7',
  },
  catGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: scale(10),
  },
  catCard: {
    width: (SCREEN_WIDTH - spacing.lg * 2 - scale(20)) / 3,
    backgroundColor: '#FFFFFF',
    borderRadius: radius.md,
    padding: scale(4),
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#0F172A',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
    marginBottom: scale(4),
  },
  catImageWrap: {
    width: '100%',
    height: scale(64),
    borderRadius: scale(8),
    overflow: 'hidden',
    backgroundColor: '#F1F5F9',
    marginBottom: scale(5),
  },
  catImage: {
    width: '100%',
    height: '100%',
  },
  catName: {
    fontSize: scale(11),
    fontWeight: '700',
    color: '#1E293B',
    textAlign: 'center',
    paddingBottom: scale(2),
  },
});

export default HomeScreen;
