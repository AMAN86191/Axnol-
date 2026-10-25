import React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {HomeStackParamList} from '../../navigation/types';
import HomeScreen from './HomeScreen';
import NotificationsScreen from '../notifications/NotificationsScreen';
import ProductDetailsScreen from '../product/ProductDetailsScreen';
import ProductsScreen from '../catalogue/ProductsScreen';
import SubCategoriesScreen from '../catalogue/SubCategoriesScreen';
import CategoryProductsScreen from '../catalogue/CategoryProductsScreen';
import PricingRequestsScreen from '../pricing/PricingRequestsScreen';
import IndustriesScreen from '../catalogue/IndustriesScreen';
import IndustryDetailsScreen from '../catalogue/IndustryDetailsScreen';
import CategoriesScreen from '../catalogue/CategoriesScreen';

const Stack = createNativeStackNavigator<HomeStackParamList>();

export const HomeNavigator: React.FC = () => (
  <Stack.Navigator initialRouteName="Home" screenOptions={{headerShown: false}}>
    <Stack.Screen name="Home" component={HomeScreen} />
    <Stack.Screen name="Notifications" component={NotificationsScreen} />
    <Stack.Screen name="ProductDetails" component={ProductDetailsScreen} />
    <Stack.Screen name="Products" component={ProductsScreen} />
    <Stack.Screen name="SubCategories" component={SubCategoriesScreen} />
    <Stack.Screen name="CategoryProducts" component={CategoryProductsScreen} />
    <Stack.Screen name="RequestPrice" component={PricingRequestsScreen} />
    <Stack.Screen name="Industries" component={IndustriesScreen} />
    <Stack.Screen name="IndustryDetails" component={IndustryDetailsScreen} />
    <Stack.Screen name="Categories" component={CategoriesScreen} />
  </Stack.Navigator>
);

export default HomeNavigator;
