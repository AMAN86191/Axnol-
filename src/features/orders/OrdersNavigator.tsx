import React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {OrdersStackParamList} from '../../navigation/types';
import OrdersScreen from './OrdersScreen';
import OrderDetailsScreen from './OrderDetailsScreen';
import InvoiceScreen from './InvoiceScreen';

const Stack = createNativeStackNavigator<OrdersStackParamList>();

export const OrdersNavigator: React.FC = () => (
  <Stack.Navigator screenOptions={{headerShown: false}}>
    <Stack.Screen name="OrdersList" component={OrdersScreen} />
    <Stack.Screen name="OrderDetails" component={OrderDetailsScreen} />
    <Stack.Screen name="Invoice" component={InvoiceScreen} />
  </Stack.Navigator>
);

export default OrdersNavigator;
