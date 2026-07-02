import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import LoginScreen from '../screens/auth/LoginScreen';
import SignUpScreen from '../screens/auth/SignUpScreen';
import SplashScreen from '../screens/auth/SplashScreen';
import ForgotPasswordScreen from '../screens/auth/ForgotPasswordScreen';
import OtpVerificationScreen from '../screens/auth/OtpVerificationScreen';
import MainDrawerNavigator from './MainDrawerNavigator';
import JoinMembershipScreen from '../screens/main/JoinMembershipScreen';
import DonateScreen from '../screens/main/DonateScreen';
import HelpSupportScreen from '../screens/main/HelpSupportScreen';
import MembershipCertificateScreen from '../screens/main/MembershipCertificateScreen';
import EditPostScreen from '../screens/main/EditPostScreen';
import PostDetailsScreen from '../screens/main/PostDetailsScreen';
import ReferralScreen from '../screens/main/ReferralScreen';
import GalleryScreen from '../screens/main/GalleryScreen';
import PrivacyPolicyScreen from '../screens/main/PrivacyPolicyScreen';
import TermsScreen from '../screens/main/TermsScreen';
import PublicProfileScreen from '../screens/main/PublicProfileScreen';
import NotificationScreen from '../screens/main/NotificationScreen';
import AboutTrustScreen from '../screens/main/AboutTrustScreen';

import { RootStackParamList } from './types';
import FeedScreen from '../screens/main/FeedScreen';
import DonationSuccessScreen from '../screens/main/DonationSuccessScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();

// ─── Main Navigator ──────────────────────────────────────────────────────────
const Allroute = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="SplashScreen"
        screenOptions={{
          headerShown: false,
          animation: 'slide_from_right',
          animationDuration: 350,
          gestureEnabled: true,
          gestureDirection: 'horizontal',
          fullScreenGestureEnabled: true,
        }}
      >
        <Stack.Screen
          name="SplashScreen"
          component={SplashScreen}
        />
        <Stack.Screen
          name="LoginScreen"
          component={LoginScreen}
          options={{ animation: 'fade' }}
        />
        <Stack.Screen
          name="SignUpScreen"
          component={SignUpScreen}
        />
        <Stack.Screen
          name="ForgotPasswordScreen"
          component={ForgotPasswordScreen}
        />
        <Stack.Screen
          name="OtpVerificationScreen"
          component={OtpVerificationScreen}
        />
        <Stack.Screen
          name="MainDrawer"
          component={MainDrawerNavigator}
        />
        <Stack.Screen
          name="JoinMembershipScreen"
          component={JoinMembershipScreen}
        />
        <Stack.Screen
          name="DonateScreen"
          component={DonateScreen}
        />
        <Stack.Screen
          name="HelpSupportScreen"
          component={HelpSupportScreen}
        />
        <Stack.Screen
          name="MembershipCertificateScreen"
          component={MembershipCertificateScreen}
        />
        <Stack.Screen
          name="EditPostScreen"
          component={EditPostScreen}
        />
        <Stack.Screen
          name="PostDetailsScreen"
          component={PostDetailsScreen}
        />
        <Stack.Screen
          name="ReferralScreen"
          component={ReferralScreen}
        />
        <Stack.Screen
          name="GalleryScreen"
          component={GalleryScreen}
        />
        <Stack.Screen
          name="PrivacyPolicyScreen"
          component={PrivacyPolicyScreen}
        />
        <Stack.Screen
          name="TermsScreen"
          component={TermsScreen}
        />
        <Stack.Screen
          name="PublicProfileScreen"
          component={PublicProfileScreen}
        />
        <Stack.Screen
          name="NotificationScreen"
          component={NotificationScreen}
        />
        <Stack.Screen
          name="AboutTrustScreen"
          component={AboutTrustScreen}
        />
        <Stack.Screen
          name="FeedScreen"
          component={FeedScreen}
        />
        <Stack.Screen
          name="DonationSuccessScreen"
          component={DonationSuccessScreen}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default Allroute;
