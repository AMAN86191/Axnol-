import React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {CatalogueStackParamList} from '../../navigation/types';
import IndustriesScreen from './IndustriesScreen';
import CategoriesScreen from './CategoriesScreen';
import SubCategoriesScreen from './SubCategoriesScreen';
import ProductsScreen from './ProductsScreen';
import ProductDetailsScreen from '../product/ProductDetailsScreen';

const Stack = createNativeStackNavigator<CatalogueStackParamList>();

export const CatalogueScreen: React.FC = () => (
  <Stack.Navigator screenOptions={{headerShown: false}}>
    <Stack.Screen name="Industries" component={IndustriesScreen} />
    <Stack.Screen name="Categories" component={CategoriesScreen} />
    <Stack.Screen name="SubCategories" component={SubCategoriesScreen} />
    <Stack.Screen name="Products" component={ProductsScreen} />
    <Stack.Screen name="ProductDetails" component={ProductDetailsScreen} />
  </Stack.Navigator>
);
export default CatalogueScreen;
