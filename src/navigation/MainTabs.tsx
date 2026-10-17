import React from 'react';
import {Platform, StyleSheet, View} from 'react-native';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {getFocusedRouteNameFromRoute} from '@react-navigation/native';
import {
  ClipboardList,
  Factory,
  Home,
  LucideIcon,
  Package,
  User,
} from 'lucide-react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {MainTabParamList} from './types';
import HomeScreen from '../features/home/HomeScreen';
import CatalogueScreen, {
  IndustryStack,
} from '../features/catalogue/CatalogueScreen';
import OrdersNavigator from '../features/orders/OrdersNavigator';
import ProfileNavigator from '../features/profile/ProfileNavigator';
import {fontSize, scale, verticalScale} from '../theme';

const Tab = createBottomTabNavigator<MainTabParamList>();

const ACTIVE_TINT = '#087FD1';
const INACTIVE_TINT = '#8E9BAE';
const ACTIVE_PILL = '#E4F1FC';

const getTabBarStyle = (
  focusedRouteName: string | undefined,
  rootRouteName: string,
): {tabBarStyle?: {display: 'none'}} =>
  focusedRouteName && focusedRouteName !== rootRouteName
    ? {tabBarStyle: {display: 'none'}}
    : {};

interface TabIconProps {
  Icon: LucideIcon;
  focused: boolean;
  color: string;
  size: number;
}

const TabIcon: React.FC<TabIconProps> = ({Icon, focused, color, size}) => (
  <View style={styles.iconSlot}>
    <View style={[styles.iconPill, focused && styles.iconPillActive]}>
      <Icon size={size} color={color} strokeWidth={focused ? 2.5 : 2} />
    </View>
  </View>
);

const renderTabIcon =
  (Icon: LucideIcon) =>
  ({
    color,
    size,
    focused,
  }: {
    color: string;
    size: number;
    focused: boolean;
  }) => <TabIcon Icon={Icon} focused={focused} color={color} size={size} />;

export const MainTabs: React.FC = () => {
  const insets = useSafeAreaInsets();

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: ACTIVE_TINT,
        tabBarInactiveTintColor: INACTIVE_TINT,
        tabBarHideOnKeyboard: true,
        tabBarLabelStyle: {
          fontSize: fontSize.xs,
          fontWeight: '600',
          letterSpacing: 0.15,
          marginTop: scale(3),
        },
        tabBarItemStyle: {
          paddingVertical: 0,
        },
        tabBarStyle: {
          height: verticalScale(62) + insets.bottom,
          paddingTop: verticalScale(9),
          paddingBottom: insets.bottom > 0 ? insets.bottom : verticalScale(10),
          backgroundColor: '#FFFFFF',
          borderTopWidth: 1,
          borderTopColor: '#E8EDF3',
          borderTopLeftRadius: scale(20),
          borderTopRightRadius: scale(20),
          ...Platform.select({
            ios: {
              shadowColor: '#0F172A',
              shadowOffset: {width: 0, height: -4},
              shadowOpacity: 0.06,
              shadowRadius: 14,
            },
            android: {
              elevation: 14,
              shadowColor: '#0F172A',
            },
            default: {},
          }),
        },
      }}>
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarLabel: 'Home',
          tabBarIcon: renderTabIcon(Home),
        }}
      />
      <Tab.Screen
        name="Products"
        component={CatalogueScreen}
        options={({route}) => ({
          tabBarLabel: 'Products',
          tabBarIcon: renderTabIcon(Package),
          ...getTabBarStyle(getFocusedRouteNameFromRoute(route), 'Products'),
        })}
      />
      <Tab.Screen
        name="Orders"
        component={OrdersNavigator}
        options={({route}) => ({
          tabBarLabel: 'Orders',
          tabBarIcon: renderTabIcon(ClipboardList),
          ...getTabBarStyle(getFocusedRouteNameFromRoute(route), 'OrdersList'),
        })}
      />
      <Tab.Screen
        name="Industry"
        component={IndustryStack}
        options={({route}) => ({
          tabBarLabel: 'Industry',
          tabBarIcon: renderTabIcon(Factory),
          ...getTabBarStyle(getFocusedRouteNameFromRoute(route), 'Industries'),
        })}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileNavigator}
        options={({route}) => ({
          tabBarLabel: 'Profile',
          tabBarIcon: renderTabIcon(User),
          ...getTabBarStyle(getFocusedRouteNameFromRoute(route), 'ProfileMain'),
        })}
      />
    </Tab.Navigator>
  );
};

const styles = StyleSheet.create({
  iconSlot: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconPill: {
    width: scale(48),
    height: scale(30),
    borderRadius: scale(15),
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconPillActive: {
    backgroundColor: ACTIVE_PILL,
  },
});

export default MainTabs;
