import React from 'react';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {
  Bell,
  Home,
  LayoutGrid,
  LucideIcon,
  ReceiptText,
  User,
} from 'lucide-react-native';
import {MainTabParamList} from './types';
import HomeScreen from '../features/home/HomeScreen';
import CatalogueScreen from '../features/catalogue/CatalogueScreen';
import OrdersNavigator from '../features/orders/OrdersNavigator';
import NotificationsScreen from '../features/notifications/NotificationsScreen';
import ProfileNavigator from '../features/profile/ProfileNavigator';
import {colors, fontSize, verticalScale} from '../theme';

const Tab = createBottomTabNavigator<MainTabParamList>();

const iconMap: Record<string, LucideIcon> = {
  Home,
  Catalogue: LayoutGrid,
  Orders: ReceiptText,
  Notifications: Bell,
  Profile: User,
};

export const MainTabs: React.FC = () => {
  return (
    <Tab.Navigator
      screenOptions={({route}) => ({
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarLabelStyle: {fontSize: fontSize.xs},
        tabBarStyle: {
          height: verticalScale(60),
          paddingBottom: verticalScale(8),
          paddingTop: verticalScale(6),
          backgroundColor: colors.surface,
          borderTopColor: colors.borderLight,
        },
        tabBarIcon: ({color, size}) => {
          const TabIcon = iconMap[route.name];
          return <TabIcon size={size} color={color} />;
        },
      })}>
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Catalogue" component={CatalogueScreen} />
      <Tab.Screen name="Orders" component={OrdersNavigator} />
      <Tab.Screen name="Notifications" component={NotificationsScreen} />
      <Tab.Screen name="Profile" component={ProfileNavigator} />
    </Tab.Navigator>
  );
};
export default MainTabs;
