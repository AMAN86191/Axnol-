import React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {CatalogueStackParamList} from '../../navigation/types';
import IndustriesScreen from './IndustriesScreen';
import CategoriesScreen from './CategoriesScreen';
import SubCategoriesScreen from './SubCategoriesScreen';
import ProductsScreen from './ProductsScreen';
import ProductDetailsScreen from '../product/ProductDetailsScreen';

import PricingRequestsScreen from '../pricing/PricingRequestsScreen';

const Stack = createNativeStackNavigator<CatalogueStackParamList>();

interface CatalogueNavigatorProps {
  initialRouteName: keyof CatalogueStackParamList;
}

const CatalogueNavigator: React.FC<CatalogueNavigatorProps> = ({
  initialRouteName,
}) => (
  <Stack.Navigator
    initialRouteName={initialRouteName}
    screenOptions={{headerShown: false}}>
    <Stack.Screen name="Products" component={ProductsScreen} />
    <Stack.Screen name="ProductDetails" component={ProductDetailsScreen} />
    <Stack.Screen name="Industries" component={IndustriesScreen} />
    <Stack.Screen name="Categories" component={CategoriesScreen} />
    <Stack.Screen name="SubCategories" component={SubCategoriesScreen} />
    <Stack.Screen name="RequestPrice" component={PricingRequestsScreen} />
  </Stack.Navigator>
);

export const CatalogueScreen: React.FC = () => (
  <CatalogueNavigator initialRouteName="Products" />
);

export const IndustryStack: React.FC = () => (
  <CatalogueNavigator initialRouteName="Industries" />
);

export default CatalogueScreen;
