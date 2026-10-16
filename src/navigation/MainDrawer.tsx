import React, { memo, useCallback, useMemo } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import {
  createDrawerNavigator,
  DrawerContentComponentProps,
} from '@react-navigation/drawer';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  Factory,
  Home,
  LucideIcon,
  Package,
  Receipt,
  UserRound,
  ChevronRight,
} from 'lucide-react-native';

import AppImage from '../components/ui/AppImage';
import { scale } from '../theme';
import { MainDrawerParamList, MainTabParamList } from './types';
import MainTabs from './MainTabs';

const Drawer = createDrawerNavigator<MainDrawerParamList>();

const COLORS = {
  primaryNavy: '#0B3D68',
  primaryNavyDark: '#082E50',
  secondaryBlue: '#1261A0',
  background: '#FFFFFF',
  activeBackground: '#EAF3FB',
  activeIndicator: '#0B3D68',
  iconContainerInactive: '#EAF3FB',
  iconContainerActive: '#FFFFFF',
  text: '#172338',
  secondaryText: '#7B8798',
  iconInactive: '#5A7CA8',
  iconActive: '#0B3D68',
  divider: '#EDF1F5',
  versionText: '#9AA4B2',
  overlay: 'rgba(11, 61, 104, 0.45)',
};

const VERSION = 'Axnol · v1.0.0';

interface SidebarLink {
  key: keyof MainTabParamList;
  label: string;
  icon: LucideIcon;
}

const LINKS: SidebarLink[] = [
  { key: 'Home', label: 'Home', icon: Home },
  { key: 'Products', label: 'Products', icon: Package },
  { key: 'Orders', label: 'Orders', icon: Receipt },
  { key: 'Industry', label: 'Industry', icon: Factory },
  { key: 'Profile', label: 'Profile', icon: UserRound },
];

type DrawerRoute = {
  state?: {
    index?: number;
    routes?: Array<{ name: string }>;
  };
};

const getActiveTab = (
  state: DrawerContentComponentProps['state'],
): string => {
  const route = state.routes[state.index] as DrawerRoute | undefined;
  const nestedState = route?.state;

  if (!nestedState?.routes?.length) {
    return 'Home';
  }

  return nestedState.routes[nestedState.index ?? 0]?.name ?? 'Home';
};

interface NavigationItemProps {
  item: SidebarLink;
  active: boolean;
  onPress: () => void;
}

const NavigationItem = memo(
  ({ item, active, onPress }: NavigationItemProps) => {
    const Icon = item.icon;

    return (
      <TouchableOpacity
        accessibilityRole="button"
        accessibilityLabel={item.label}
        accessibilityState={{ selected: active }}
        activeOpacity={0.72}
        onPress={onPress}
        style={[
          styles.navigationItem,
          active && styles.navigationItemActive,
        ]}>
        {active && <View style={styles.activeIndicator} />}

        <View
          style={[
            styles.iconContainer,
            active && styles.iconContainerActive,
          ]}>
          <Icon
            size={scale(21)}
            color={active ? COLORS.iconActive : COLORS.iconInactive}
            strokeWidth={active ? 2.2 : 1.8}
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
            color={COLORS.primaryNavy}
            strokeWidth={2}
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

  const handleNavigate = useCallback(
    (key: keyof MainTabParamList) => {
      navigation.navigate('HomeTabs', { screen: key });
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
      {/* Brand header */}
      <LinearGradient
        colors={[COLORS.primaryNavyDark, COLORS.primaryNavy]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0.8 }}
        style={[
          styles.brandHeader,
          { paddingTop: insets.top + scale(18) },
        ]}>
        <View style={styles.brandTopRow}>
          <View style={styles.logoBadge}>
            <AppImage
              uri="axnol_round_logo"
              style={styles.logo}
              resizeMode="contain"
            />
          </View>

          <View style={styles.brandIdentity}>
            <Text style={styles.brandName}>AXNOL</Text>
            <Text style={styles.brandTag}>
              Industrial Lubricants
            </Text>
          </View>
        </View>
      </LinearGradient>

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
              onPress={() => handleNavigate(item.key)}
            />
          ))}
        </View>
      </ScrollView>

      {/* Footer */}
      <View
        style={[
          styles.footer,
          { paddingBottom: Math.max(insets.bottom, scale(12)) },
        ]}>
        <View style={styles.footerDivider} />
        <Text style={styles.version}>{VERSION}</Text>
      </View>
    </View>
  );
};

const renderDrawerContent = (
  props: DrawerContentComponentProps,
) => <SidebarContent {...props} />;

export const MainDrawer: React.FC = () => {
  const { width } = useWindowDimensions();

  const drawerWidth = Math.min(
    width * 0.8,
    scale(320),
  );

  return (
    <Drawer.Navigator
      drawerContent={renderDrawerContent}
      screenOptions={{
        headerShown: false,
        drawerType: 'front',
        swipeEdgeWidth: scale(48),
        overlayColor: COLORS.overlay,
        drawerStyle: {
          width: drawerWidth,
          backgroundColor: COLORS.background,
        },
        sceneStyle: {
          backgroundColor: COLORS.background,
        },
      }}>
      <Drawer.Screen
        name="HomeTabs"
        component={MainTabs}
      />
    </Drawer.Navigator>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  // Brand
  brandHeader: {
    paddingHorizontal: scale(22),
    paddingBottom: scale(16),
    borderBottomLeftRadius: scale(24),
    borderBottomRightRadius: scale(24),
  },

  brandTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  logoBadge: {
    width: scale(64),
    height: scale(64),
    borderRadius: scale(32),
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.6)',
  },

  logo: {
    width: scale(46),
    height: scale(46),
  },

  brandIdentity: {
    flex: 1,
    marginLeft: scale(15),
  },

  brandName: {
    fontSize: scale(22),
    fontWeight: '800',
    letterSpacing: 1.2,
    color: '#FFFFFF',
  },

  brandTag: {
    fontSize: scale(11.5),
    fontWeight: '500',
    color: 'rgba(255,255,255,0.78)',
    marginTop: scale(4),
  },

  // Menu
  menuScroll: {
    flex: 1,
  },

  menuContent: {
    paddingHorizontal: scale(14),
    paddingTop: scale(22),
    paddingBottom: scale(18),
  },

  navigationGroup: {
    gap: scale(6),
  },

  navigationItem: {
    minHeight: scale(40),
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: scale(12),
    paddingVertical: scale(4),
    borderRadius: scale(13),
    borderWidth: 1,
    borderColor: 'transparent',
    overflow: 'hidden',
  },

  navigationItemActive: {
    backgroundColor: COLORS.activeBackground,
    borderColor: '#DCEAF7',
  },

  activeIndicator: {
    position: 'absolute',
    left: 0,
    top: scale(10),
    bottom: scale(10),
    width: scale(3),
    borderTopRightRadius: scale(3),
    borderBottomRightRadius: scale(3),
    backgroundColor: COLORS.activeIndicator,
  },

  iconContainer: {
    width: scale(32),
    height: scale(32),
    borderRadius: scale(11),
    backgroundColor: COLORS.iconContainerInactive,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: scale(14),
  },

  iconContainerActive: {
    backgroundColor: COLORS.iconContainerActive,
  },

  navigationLabel: {
    flex: 1,
    fontSize: scale(14.5),
    fontWeight: '600',
    color: COLORS.text,
    letterSpacing: 0.1,
  },

  navigationLabelActive: {
    fontWeight: '700',
    color: COLORS.primaryNavy,
  },

  // Footer
  footer: {
    paddingHorizontal: scale(20),
    paddingTop: scale(12),
  },

  footerDivider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: COLORS.divider,
    marginBottom: scale(14),
  },

  version: {
    textAlign: 'center',
    fontSize: scale(10.5),
    fontWeight: '500',
    color: COLORS.versionText,
    letterSpacing: 0.2,
  },
});

export default MainDrawer;