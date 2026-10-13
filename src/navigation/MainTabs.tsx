import React from 'react';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {
  FileCheck2,
  Home,
  Package,
  Receipt,
  User,
} from 'lucide-react-native';
import {MainTabParamList} from './types';
import HomeScreen from '../features/home/HomeScreen';
import CatalogueScreen from '../features/catalogue/CatalogueScreen';
import OrdersNavigator from '../features/orders/OrdersNavigator';
import DocumentsScreen from '../features/documents/DocumentsScreen';
import ProfileNavigator from '../features/profile/ProfileNavigator';
import {colors, fontSize, verticalScale} from '../theme';

const Tab = createBottomTabNavigator<MainTabParamList>();

export const MainTabs: React.FC = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: '#8E9BAE',
        tabBarLabelStyle: {
          fontSize: fontSize.xs,
          fontWeight: '600',
          marginTop: -2,
        },
        tabBarStyle: {
          height: verticalScale(62),
          paddingBottom: verticalScale(8),
          paddingTop: verticalScale(6),
          backgroundColor: '#FFFFFF',
          borderTopColor: '#E6ECF5',
          borderTopWidth: 1,
          elevation: 8,
          shadowColor: '#000',
          shadowOffset: {width: 0, height: -2},
          shadowOpacity: 0.05,
          shadowRadius: 6,
        },
      }}>
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarLabel: 'Home',
          tabBarIcon: ({color, size}) => <Home size={size} color={color} strokeWidth={2} />,
        }}
      />
      <Tab.Screen
        name="Products"
        component={CatalogueScreen}
        options={{
          tabBarLabel: 'Products',
          tabBarIcon: ({color, size}) => <Package size={size} color={color} strokeWidth={2} />,
        }}
      />
      <Tab.Screen
        name="Orders"
        component={OrdersNavigator}
        options={{
          tabBarLabel: 'Orders',
          tabBarIcon: ({color, size}) => <Receipt size={size} color={color} strokeWidth={2} />,
        }}
      />
      <Tab.Screen
        name="Documents"
        component={DocumentsScreen}
        options={{
          tabBarLabel: 'Documents',
          tabBarIcon: ({color, size}) => <FileCheck2 size={size} color={color} strokeWidth={2} />,
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileNavigator}
        options={{
          tabBarLabel: 'Profile',
          tabBarIcon: ({color, size}) => <User size={size} color={color} strokeWidth={2} />,
        }}
      />
    </Tab.Navigator>
  );
};
export default MainTabs;
