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
import HomeNavigator from '../features/home/HomeNavigator';
import CatalogueNavigator from '../features/catalogue/CatalogueNavigator';
import IndustryNavigator from '../features/catalogue/IndustryNavigator';
import OrdersNavigator from '../features/orders/OrdersNavigator';
import ProfileNavigator from '../features/profile/ProfileNavigator';
import {fontSize, scale} from '../theme';

const Tab = createBottomTabNavigator<MainTabParamList>();

const ACTIVE_TINT = '#087FD1';
const INACTIVE_TINT = '#8E9BAE';
const ACTIVE_PILL = '#E4F1FC';

const TAB_BAR_BASE_HEIGHT = 70;

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
          height: TAB_BAR_BASE_HEIGHT + insets.bottom,
          paddingTop: 8,
          paddingBottom: insets.bottom + 8,
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
        component={HomeNavigator}
        options={({route}) => ({
          tabBarLabel: 'Home',
          tabBarIcon: renderTabIcon(Home),
          popToTopOnBlur: true,
          ...getTabBarStyle(getFocusedRouteNameFromRoute(route), 'Home'),
        })}
      />
      <Tab.Screen
        name="Products"
        component={CatalogueNavigator}
        options={({route}) => ({
          tabBarLabel: 'Products',
          tabBarIcon: renderTabIcon(Package),
          popToTopOnBlur: true,
          ...getTabBarStyle(getFocusedRouteNameFromRoute(route), 'Products'),
        })}
      />
      <Tab.Screen
        name="Orders"
        component={OrdersNavigator}
        options={({route}) => ({
          tabBarLabel: 'Orders',
          tabBarIcon: renderTabIcon(ClipboardList),
          popToTopOnBlur: true,
          ...getTabBarStyle(getFocusedRouteNameFromRoute(route), 'OrdersList'),
        })}
      />
      <Tab.Screen
        name="Industry"
        component={IndustryNavigator}
        options={({route}) => ({
          tabBarLabel: 'Industry',
          tabBarIcon: renderTabIcon(Factory),
          popToTopOnBlur: true,
          ...getTabBarStyle(getFocusedRouteNameFromRoute(route), 'Industries'),
        })}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileNavigator}
        options={({route}) => ({
          tabBarLabel: 'Profile',
          tabBarIcon: renderTabIcon(User),
          popToTopOnBlur: true,
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
