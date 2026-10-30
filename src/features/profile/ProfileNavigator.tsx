import React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {ProfileStackParamList} from '../../navigation/types';
import ProfileScreen from './ProfileScreen';
import EditProfileScreen from './EditProfileScreen';
import PricingRequestsScreen from '../pricing/PricingRequestsScreen';
import ContactUsScreen from '../enquiries/ContactUsScreen';
import AboutScreen from '../about/AboutScreen';
import ForgotPasswordScreen from '../auth/ForgotPasswordScreen';

const Stack = createNativeStackNavigator<ProfileStackParamList>();

export const ProfileNavigator: React.FC = () => (
  <Stack.Navigator
    initialRouteName="ProfileMain"
    screenOptions={{headerShown: false}}>
    <Stack.Screen name="ProfileMain" component={ProfileScreen} />
    <Stack.Screen name="EditProfile" component={EditProfileScreen} />
    <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
    <Stack.Screen name="PricingRequests" component={PricingRequestsScreen} />
    <Stack.Screen name="ContactUs" component={ContactUsScreen} />
    <Stack.Screen name="About" component={AboutScreen} />
  </Stack.Navigator>
);

export default ProfileNavigator;
