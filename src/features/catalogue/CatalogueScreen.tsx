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
  <Stack.Navigator screenOptions={{headerShown: true}}>
    <Stack.Screen
      name="Industries"
      component={IndustriesScreen}
      options={{title: 'Industries'}}
    />
    <Stack.Screen
      name="Categories"
      component={CategoriesScreen}
      options={{title: 'Categories'}}
    />
    <Stack.Screen
      name="SubCategories"
      component={SubCategoriesScreen}
      options={{title: 'Sub Categories'}}
    />
    <Stack.Screen
      name="Products"
      component={ProductsScreen}
      options={{title: 'Products'}}
    />
    <Stack.Screen
      name="ProductDetails"
      component={ProductDetailsScreen}
      options={{title: 'Product Details'}}
    />
  </Stack.Navigator>
);
export default CatalogueScreen;
