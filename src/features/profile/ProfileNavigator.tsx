import React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {ProfileStackParamList} from '../../navigation/types';
import ProfileScreen from './ProfileScreen';
import EditProfileScreen from './EditProfileScreen';
import PricingRequestsScreen from '../pricing/PricingRequestsScreen';
import DocumentsScreen from '../documents/DocumentsScreen';
import MyEnquiriesScreen from '../enquiries/MyEnquiriesScreen';
import ContactUsScreen from '../enquiries/ContactUsScreen';

const Stack = createNativeStackNavigator<ProfileStackParamList>();

export const ProfileNavigator: React.FC = () => (
  <Stack.Navigator screenOptions={{headerShown: false}}>
    <Stack.Screen name="ProfileMain" component={ProfileScreen} />
    <Stack.Screen name="EditProfile" component={EditProfileScreen} />
    <Stack.Screen name="PricingRequests" component={PricingRequestsScreen} />
    <Stack.Screen name="Documents" component={DocumentsScreen} />
    <Stack.Screen name="MyEnquiries" component={MyEnquiriesScreen} />
    <Stack.Screen name="ContactUs" component={ContactUsScreen} />
  </Stack.Navigator>
);

export default ProfileNavigator;
