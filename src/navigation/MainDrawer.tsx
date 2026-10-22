import React, {memo, useCallback, useMemo} from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from 'react-native';
import {
  createDrawerNavigator,
  DrawerContentComponentProps,
} from '@react-navigation/drawer';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {
  ChevronRight,
  ClipboardList,
  Factory,
  HelpCircle,
  Heart,
  Home,
  Info,
  LucideIcon,
  Package,
  ScrollText,
  ShieldCheck,
  UserRound,
} from 'lucide-react-native';

import {colors, radius, scale, spacing} from '../theme';
import {
  MainDrawerParamList,
  MainTabParamList,
} from './types';
import MainTabs from './MainTabs';
import TermsConditionsScreen from '../features/legal/TermsConditionsScreen';
import PrivacyPolicyScreen from '../features/legal/PrivacyPolicyScreen';
import ContactUsScreen from '../features/enquiries/ContactUsScreen';
import AboutScreen from '../features/about/AboutScreen';
import CartScreen from '../features/cart/CartScreen';
import WishlistScreen from '../features/wishlist/WishlistScreen';
import Logo from '../components/ui/Logo';

const Drawer = createDrawerNavigator<MainDrawerParamList>();

const PALETTE = {
  background: '#F8FAFC',
  surface: colors.surface,
  border: '#E8EEF4',
  borderLight: '#EEF2F6',
  text: '#0F172A',
  textSecondary: '#64748B',
  textMuted: '#94A3B8',
  eyebrow: '#0284C7',
  iconBadge: '#F1F5F9',
  iconInactive: '#5A7CA8',
  activeBg: '#EFF6FF',
  activeBorder: '#DBEAFE',
  overlay: 'rgba(8, 30, 54, 0.5)',
};

const VERSION = 'Axnol · v1.0.0';

interface DrawerLink {
  key: string;
  label: string;
  icon: LucideIcon;
}

type TabKey = keyof MainTabParamList;

interface TabLink {
  key: TabKey;
  label: string;
  icon: LucideIcon;
}

const LINKS: TabLink[] = [
  {key: 'Home', label: 'Home', icon: Home},
  {key: 'Products', label: 'Products', icon: Package},
  {key: 'Orders', label: 'Orders', icon: ClipboardList},
  {key: 'Industry', label: 'Industry', icon: Factory},
  {key: 'Profile', label: 'Profile', icon: UserRound},
];

type AccountKey = 'ContactUs' | 'About';

interface ProfileLink {
  key: AccountKey;
  label: string;
  icon: LucideIcon;
}

const ACCOUNT_LINKS: ProfileLink[] = [
  // {key: 'EditProfile', label: 'Edit Profile', icon: Pencil},
  {key: 'ContactUs', label: 'Help & Support', icon: HelpCircle},
  {key: 'About', label: 'About Us', icon: Info},
];

type ShoppingKey = 'Wishlist';

interface ShoppingLink {
  key: ShoppingKey;
  label: string;
  icon: LucideIcon;
}

const SHOPPING_LINKS: ShoppingLink[] = [
  {key: 'Wishlist', label: 'Wishlist', icon: Heart},
];

type LegalKey = 'TermsConditions' | 'PrivacyPolicy';

interface LegalLink {
  key: LegalKey;
  label: string;
  icon: LucideIcon;
}

const LEGAL_LINKS: LegalLink[] = [
  {key: 'TermsConditions', label: 'Terms & Conditions', icon: ScrollText},
  {key: 'PrivacyPolicy', label: 'Privacy Policy', icon: ShieldCheck},
];

type DrawerRoute = {
  name?: string;
  state?: {
    index?: number;
    routes?: Array<{
      name: string;
      state?: {index?: number; routes?: Array<{name: string}>};
    }>;
  };
};

interface ActiveRoute {
  activeTab: string;
  activeProfile?: string;
}

const getActiveRoute = (
  state: DrawerContentComponentProps['state'],
): ActiveRoute => {
  const route = state.routes[state.index] as DrawerRoute | undefined;

  if (route?.name && route.name !== 'HomeTabs') {
    return {activeTab: route.name};
  }

  const tabState = route?.state;
  const tabRoute = tabState?.routes?.[tabState.index ?? 0];
  const activeTab = tabRoute?.name ?? 'Home';

  const activeProfile =
    activeTab === 'Profile'
      ? tabRoute?.state?.routes?.[tabRoute.state.index ?? 0]?.name
      : undefined;

  return {activeTab, activeProfile};
};

interface NavigationItemProps {
  item: DrawerLink;
  active: boolean;
  onPress: () => void;
}

const NavigationItem = memo(
  ({item, active, onPress}: NavigationItemProps) => {
    const Icon = item.icon;

    return (
      <TouchableOpacity
        accessibilityRole="button"
        accessibilityLabel={item.label}
        accessibilityState={{selected: active}}
        activeOpacity={0.75}
        onPress={onPress}
        style={[styles.navigationItem, active && styles.navigationItemActive]}>
        <View
          style={[
            styles.iconContainer,
            active && styles.iconContainerActive,
          ]}>
          <Icon
            size={scale(18)}
            color={active ? colors.textInverse : PALETTE.iconInactive}
            strokeWidth={active ? 2.3 : 1.9}
          />
        </View>

        <Text
          numberOfLines={1}
          style={[
            styles.navigationLabel,
            active && styles.navigationLabelActive,
          ]}>
          {item.label}
        </Text>

        {active && (
          <ChevronRight
            size={scale(17)}
            color={colors.primary}
            strokeWidth={2.4}
          />
        )}
      </TouchableOpacity>
    );
  },
);

NavigationItem.displayName = 'NavigationItem';

const SidebarContent: React.FC<DrawerContentComponentProps> = ({
  navigation,
  state,
}) => {
  const insets = useSafeAreaInsets();
  const {activeTab, activeProfile} = getActiveRoute(state);

  const handleTabNavigate = useCallback(
    (key: TabKey) => {
      switch (key) {
        case 'Products':
          navigation.navigate('HomeTabs', {
            screen: 'Products',
            params: {screen: 'Products', initial: false},
          });
          break;
        case 'Orders':
          navigation.navigate('HomeTabs', {
            screen: 'Orders',
            params: {screen: 'OrdersList', initial: false},
          });
          break;
        case 'Industry':
          navigation.navigate('HomeTabs', {
            screen: 'Industry',
            params: {screen: 'Industries', initial: false},
          });
          break;
        case 'Profile':
          navigation.navigate('HomeTabs', {
            screen: 'Profile',
            params: {screen: 'ProfileMain', initial: false},
          });
          break;
        default:
          navigation.navigate('HomeTabs', {screen: 'Home'});
      }
      navigation.closeDrawer();
    },
    [navigation],
  );

  const handleProfileNavigate = useCallback(
    (screen: AccountKey) => {
      navigation.navigate(screen);
      navigation.closeDrawer();
    },
    [navigation],
  );

  const handleLegalNavigate = useCallback(
    (key: LegalKey) => {
      navigation.navigate(key);
      navigation.closeDrawer();
    },
    [navigation],
  );

  const handleShoppingNavigate = useCallback(
    (key: ShoppingKey) => {
      navigation.navigate(key);
      navigation.closeDrawer();
    },
    [navigation],
  );

  const menuItems = useMemo(
    () =>
      LINKS.map(item => ({
        ...item,
        active: item.key === activeTab,
      })),
    [activeTab],
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={[styles.header, {paddingTop: insets.top + scale(20)}]}>
        <View style={styles.blobOne} />
        <View style={styles.blobTwo} />

        <View style={styles.brandRow}>
          <Logo height={scale(44)} />
        </View>
      </View>

      {/* Navigation */}
      <ScrollView
        style={styles.menuScroll}
        contentContainerStyle={styles.menuContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled">
        <View style={styles.navigationGroup}>
          {menuItems.map(item => (
            <NavigationItem
              key={item.key}
              item={item}
              active={item.active}
              onPress={() => handleTabNavigate(item.key)}
            />
          ))}
        </View>

        {/* Shopping */}
        <View style={styles.sectionGroup}>
          <Text style={styles.sectionHeading}>Shopping</Text>
          {SHOPPING_LINKS.map(item => (
            <NavigationItem
              key={item.key}
              item={item}
              active={activeTab === item.key}
              onPress={() => handleShoppingNavigate(item.key)}
            />
          ))}
        </View>

        {/* Account */}
        <View style={styles.sectionGroup}>
          <Text style={styles.sectionHeading}>Account</Text>
          {ACCOUNT_LINKS.map(item => (
            <NavigationItem
              key={item.key}
              item={item}
              active={activeProfile === item.key || activeTab === item.key}
              onPress={() => handleProfileNavigate(item.key)}
            />
          ))}
        </View>

        {/* Legal */}
        <View style={styles.sectionGroup}>
          <Text style={styles.sectionHeading}>Legal</Text>
          {LEGAL_LINKS.map(item => (
            <NavigationItem
              key={item.key}
              item={item}
              active={item.key === activeTab}
              onPress={() => handleLegalNavigate(item.key)}
            />
          ))}
        </View>
      </ScrollView>

      {/* Footer */}
      <View
        style={[
          styles.footer,
          {paddingBottom: Math.max(insets.bottom, scale(14))},
        ]}>
        <Text style={styles.version}>{VERSION}</Text>
      </View>
    </View>
  );
};

const renderDrawerContent = (props: DrawerContentComponentProps) => (
  <SidebarContent {...props} />
);

export const MainDrawer: React.FC = () => {
  const {width} = useWindowDimensions();

  const drawerWidth = Math.min(width * 0.82, scale(324));

  return (
    <Drawer.Navigator
      drawerContent={renderDrawerContent}
      screenOptions={{
        headerShown: false,
        drawerType: 'front',
        swipeEdgeWidth: scale(48),
        overlayColor: PALETTE.overlay,
        drawerStyle: {
          width: drawerWidth,
          backgroundColor: PALETTE.background,
        },
        sceneStyle: {
          backgroundColor: PALETTE.background,
        },
      }}>
      <Drawer.Screen name="HomeTabs" component={MainTabs} />
      <Drawer.Screen name="Cart" component={CartScreen} />
      <Drawer.Screen name="Wishlist" component={WishlistScreen} />
      <Drawer.Screen name="ContactUs" component={ContactUsScreen} />
      <Drawer.Screen name="About" component={AboutScreen} />
      <Drawer.Screen
        name="TermsConditions"
        component={TermsConditionsScreen}
      />
      <Drawer.Screen name="PrivacyPolicy" component={PrivacyPolicyScreen} />
    </Drawer.Navigator>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: PALETTE.background,
  },

  // Header
  header: {
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.lg,
    backgroundColor: PALETTE.surface,
    borderBottomLeftRadius: radius.xxl,
    borderBottomRightRadius: radius.xxl,
    borderBottomWidth: 1,
    borderBottomColor: PALETTE.borderLight,
    overflow: 'hidden',
  },

  blobOne: {
    position: 'absolute',
    top: -scale(60),
    right: -scale(40),
    width: scale(160),
    height: scale(160),
    borderRadius: scale(80),
    backgroundColor: 'rgba(10, 77, 140, 0.06)',
  },

  blobTwo: {
    position: 'absolute',
    bottom: -scale(70),
    left: -scale(40),
    width: scale(150),
    height: scale(150),
    borderRadius: scale(75),
    backgroundColor: 'rgba(245, 166, 35, 0.08)',
  },

  brandRow: {
    alignItems: 'flex-start',
  },

  // Menu
  menuScroll: {
    flex: 1,
  },

  menuContent: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.lg,
  },

  navigationGroup: {
    gap: scale(5),
  },

  sectionGroup: {
    marginTop: spacing.xl,
    gap: scale(5),
  },

  sectionHeading: {
    fontSize: scale(10.5),
    fontWeight: '800',
    letterSpacing: 1,
    textTransform: 'uppercase',
    color: PALETTE.textMuted,
    paddingHorizontal: spacing.sm,
    marginBottom: scale(4),
  },

  navigationItem: {
    minHeight: scale(48),
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.sm,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: 'transparent',
    backgroundColor: 'transparent',
  },

  navigationItemActive: {
    backgroundColor: PALETTE.activeBg,
    borderColor: PALETTE.activeBorder,
  },

  iconContainer: {
    width: scale(34),
    height: scale(34),
    borderRadius: radius.md,
    backgroundColor: PALETTE.iconBadge,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },

  iconContainerActive: {
    backgroundColor: colors.primary,
  },

  navigationLabel: {
    flex: 1,
    fontSize: scale(14),
    fontWeight: '600',
    color: PALETTE.textSecondary,
    letterSpacing: 0.1,
  },

  navigationLabelActive: {
    fontWeight: '700',
    color: colors.primary,
  },

  // Footer
  footer: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: PALETTE.borderLight,
  },

  version: {
    textAlign: 'center',
    fontSize: scale(10.5),
    fontWeight: '500',
    color: PALETTE.textMuted,
    letterSpacing: 0.2,
  },
});

export default MainDrawer;
