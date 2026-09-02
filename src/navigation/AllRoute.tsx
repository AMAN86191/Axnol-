import React from 'react';
import { LinkingOptions } from '@react-navigation/native';
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
import EventGalleryScreen from '../screens/main/EventGalleryScreen';
import PrivacyPolicyScreen from '../screens/main/PrivacyPolicyScreen';
import TermsScreen from '../screens/main/TermsScreen';
import PublicProfileScreen from '../screens/main/PublicProfileScreen';
import NotificationScreen from '../screens/main/NotificationScreen';
import AboutTrustScreen from '../screens/main/AboutTrustScreen';
import EditProfileScreen from '../screens/main/EditProfileScreen';
import UpcomingEventsScreen from '../screens/main/UpcomingEventsScreen';
import { RootStackParamList } from './types';
import FeedScreen from '../screens/main/FeedScreen';
import DonationSuccessScreen from '../screens/main/DonationSuccessScreen';
import PlansScreen from '../screens/main/PlansScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();

// ─── Deep Linking Config ─────────────────────────────────────────────────────
// Shared post links look like: https://gst.tambimotors.com/post/{postId}
// (WhatsApp/telegram ke liye https link clickable rehta hai, nahi ki custom scheme)
const linking: LinkingOptions<RootStackParamList> = {
  prefixes: [
    'https://gst.tambimotors.com',
    'gaumatatrust://',
  ],
  config: {
    screens: {
      PostDetailsScreen: 'post/:postId',
    },
  },
};

// ─── Main Navigator ──────────────────────────────────────────────────────────
const Allroute = () => {
  return (
    <NavigationContainer linking={linking}>
      <Stack.Navigator
        initialRouteName="SplashScreen"
        screenOptions={{
          headerShown: false,
          animation: 'slide_from_right',
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
          name="EventGalleryScreen"
          component={EventGalleryScreen}
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
        <Stack.Screen
          name="PlansScreen"
          component={PlansScreen}
        />
        <Stack.Screen
          name="EditProfileScreen"
          component={EditProfileScreen}
        />
        <Stack.Screen
          name="UpcomingEventsScreen"
          component={UpcomingEventsScreen}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default Allroute;
