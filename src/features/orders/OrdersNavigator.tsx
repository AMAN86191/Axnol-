import React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {OrdersStackParamList} from '../../navigation/types';
import OrdersScreen from './OrdersScreen';
import OrderDetailsScreen from './OrderDetailsScreen';

const Stack = createNativeStackNavigator<OrdersStackParamList>();

export const OrdersNavigator: React.FC = () => (
  <Stack.Navigator
    initialRouteName="OrdersList"
    screenOptions={{headerShown: false}}>
    <Stack.Screen name="OrdersList" component={OrdersScreen} />
    <Stack.Screen name="OrderDetails" component={OrderDetailsScreen} />
  </Stack.Navigator>
);

export default OrdersNavigator;
