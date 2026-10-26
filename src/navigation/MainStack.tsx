import React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import MainDrawer from './MainDrawer';
import CartScreen from '../features/cart/CartScreen';
import WishlistScreen from '../features/wishlist/WishlistScreen';
import ProductDetailsScreen from '../features/product/ProductDetailsScreen';
import PricingRequestsScreen from '../features/pricing/PricingRequestsScreen';
import ContactUsScreen from '../features/enquiries/ContactUsScreen';
import AboutScreen from '../features/about/AboutScreen';
import TermsConditionsScreen from '../features/legal/TermsConditionsScreen';
import PrivacyPolicyScreen from '../features/legal/PrivacyPolicyScreen';
import {MainStackParamList} from './types';

const Stack = createNativeStackNavigator<MainStackParamList>();

export const MainStack: React.FC = () => {
  return (
    <Stack.Navigator screenOptions={{headerShown: false}}>
      <Stack.Screen name="Drawer" component={MainDrawer} />
      <Stack.Screen name="Cart" component={CartScreen} />
      <Stack.Screen name="Wishlist" component={WishlistScreen} />
      <Stack.Screen name="ProductDetails" component={ProductDetailsScreen} />
      <Stack.Screen name="RequestPrice" component={PricingRequestsScreen} />
      <Stack.Screen name="ContactUs" component={ContactUsScreen} />
      <Stack.Screen name="About" component={AboutScreen} />
      <Stack.Screen name="TermsConditions" component={TermsConditionsScreen} />
      <Stack.Screen name="PrivacyPolicy" component={PrivacyPolicyScreen} />
    </Stack.Navigator>
  );
};

export default MainStack;
