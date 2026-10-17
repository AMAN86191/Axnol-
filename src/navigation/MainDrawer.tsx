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
  Factory,
  HelpCircle,
  Home,
  Info,
  LucideIcon,
  Package,
  Pencil,
  Receipt,
  ScrollText,
  ShieldCheck,
  UserRound,
} from 'lucide-react-native';

import AppImage from '../components/ui/AppImage';
import {colors, radius, scale, spacing, fontSize} from '../theme';
import {useAppSelector} from '../store';
import {
  MainDrawerParamList,
  MainTabParamList,
  ProfileStackParamList,
} from './types';
import MainTabs from './MainTabs';
import TermsConditionsScreen from '../features/legal/TermsConditionsScreen';
import PrivacyPolicyScreen from '../features/legal/PrivacyPolicyScreen';

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

const LINKS: DrawerLink[] = [
  {key: 'Home', label: 'Home', icon: Home},
  {key: 'Products', label: 'Products', icon: Package},
  {key: 'Orders', label: 'Orders', icon: Receipt},
  {key: 'Industry', label: 'Industry', icon: Factory},
  {key: 'Profile', label: 'Profile', icon: UserRound},
];

type ProfileKey = keyof ProfileStackParamList;

interface ProfileLink {
  key: ProfileKey;
  label: string;
  icon: LucideIcon;
}

const ACCOUNT_LINKS: ProfileLink[] = [
  {key: 'EditProfile', label: 'Edit Profile', icon: Pencil},
  {key: 'ContactUs', label: 'Help & Support', icon: HelpCircle},
  {key: 'About', label: 'About Us', icon: Info},
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
    routes?: Array<{name: string}>;
  };
};

const getActiveTab = (
  state: DrawerContentComponentProps['state'],
): string => {
  const route = state.routes[state.index] as DrawerRoute | undefined;

  if (route?.name && route.name !== 'HomeTabs') {
    return route.name;
  }

  const nestedState = route?.state;

  if (!nestedState?.routes?.length) {
    return 'Home';
  }

  return nestedState.routes[nestedState.index ?? 0]?.name ?? 'Home';
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
  const activeKey = getActiveTab(state);
  const {user} = useAppSelector(s => s.auth);

  const name = user?.name ?? 'Rahul Sharma';
  const company = user?.company ?? 'Sharma Auto Traders';

  const handleTabNavigate = useCallback(
    (key: string) => {
      navigation.navigate('HomeTabs', {
        screen: key as keyof MainTabParamList,
      });
      navigation.closeDrawer();
    },
    [navigation],
  );

  const handleProfileNavigate = useCallback(
    (screen: ProfileKey) => {
      navigation.navigate('HomeTabs', {
        screen: 'Profile',
        params: {screen},
      });
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

  const menuItems = useMemo(
    () =>
      LINKS.map(item => ({
        ...item,
        active: item.key === activeKey,
      })),
    [activeKey],
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={[styles.header, {paddingTop: insets.top + scale(20)}]}>
        <View style={styles.blobOne} />
        <View style={styles.blobTwo} />

        <View style={styles.brandRow}>
          <View style={styles.logoBadge}>
            <AppImage
              uri="axnol_round_logo"
              style={styles.logo}
              resizeMode="contain"
            />
          </View>

          <View style={styles.brandIdentity}>
            <Text style={styles.brandEyebrow}>SINCE 1959</Text>
            <Text style={styles.brandName}>AXNOL</Text>
            <Text style={styles.brandTag}>Industrial Lubricants</Text>
          </View>
        </View>

        {/* Signed-in user */}
        <View style={styles.userCard}>
          <View style={styles.userAvatarRing}>
            <AppImage
              uri={user?.avatar ?? 'user_avatar'}
              style={styles.userAvatar}
              resizeMode="cover"
            />
          </View>
          <View style={styles.userInfo}>
            <Text style={styles.userName} numberOfLines={1}>
              {name}
            </Text>
            <Text style={styles.userCompany} numberOfLines={1}>
              {company}
            </Text>
          </View>
          <ChevronRight size={scale(16)} color={PALETTE.textMuted} strokeWidth={2} />
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

        {/* Account */}
        <View style={styles.sectionGroup}>
          <Text style={styles.sectionHeading}>Account</Text>
          {ACCOUNT_LINKS.map(item => (
            <NavigationItem
              key={item.key}
              item={item}
              active={activeKey === item.key}
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
              active={item.key === activeKey}
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
    flexDirection: 'row',
    alignItems: 'center',
  },

  logoBadge: {
    width: scale(56),
    height: scale(56),
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: PALETTE.border,
  },

  logo: {
    width: scale(40),
    height: scale(40),
  },

  brandIdentity: {
    flex: 1,
    marginLeft: spacing.md,
  },

  brandEyebrow: {
    fontSize: fontSize.xs,
    fontWeight: '800',
    letterSpacing: 1.4,
    color: PALETTE.eyebrow,
  },

  brandName: {
    fontSize: scale(21),
    fontWeight: '800',
    letterSpacing: 1.2,
    color: PALETTE.text,
    marginTop: scale(1),
  },

  brandTag: {
    fontSize: scale(11.5),
    fontWeight: '500',
    color: PALETTE.textSecondary,
    marginTop: scale(1),
  },

  userCard: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.lg,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.sm,
    borderRadius: radius.xl,
    backgroundColor: PALETTE.surface,
    borderWidth: 1,
    borderColor: PALETTE.border,
  },

  userAvatarRing: {
    width: scale(42),
    height: scale(42),
    borderRadius: radius.pill,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: colors.primaryLight,
    backgroundColor: colors.surfaceAlt,
  },

  userAvatar: {
    width: '100%',
    height: '100%',
  },

  userInfo: {
    flex: 1,
    marginLeft: spacing.md,
  },

  userName: {
    fontSize: scale(13.5),
    fontWeight: '700',
    color: PALETTE.text,
  },

  userCompany: {
    fontSize: scale(11),
    fontWeight: '500',
    color: PALETTE.textSecondary,
    marginTop: scale(2),
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
