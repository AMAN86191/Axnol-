import React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {AuthStackParamList} from './types';
import SplashScreen from '../features/auth/SplashScreen';
import OnboardingScreen from '../features/auth/OnboardingScreen';
import WelcomeScreen from '../features/auth/WelcomeScreen';
import LoginScreen from '../features/auth/LoginScreen';
import RegisterScreen from '../features/auth/RegisterScreen';
import OtpVerifyScreen from '../features/auth/OtpVerifyScreen';
import SetPasswordScreen from '../features/auth/SetPasswordScreen';
import ApprovalPendingScreen from '../features/auth/ApprovalPendingScreen';
import ProfileSetupScreen from '../features/auth/ProfileSetupScreen';
import ForgotPasswordScreen from '../features/auth/ForgotPasswordScreen';
import {useAppSelector} from '../store';

const Stack = createNativeStackNavigator<AuthStackParamList>();

export const AuthStack: React.FC = () => {
  const {token} = useAppSelector(s => s.auth);
  const initialRouteName: keyof AuthStackParamList = !token
    ? 'Splash'
    : 'ApprovalPending';
  return (
    <Stack.Navigator
      initialRouteName={initialRouteName}
      screenOptions={{headerShown: false}}>
      <Stack.Screen name="Splash" component={SplashScreen} />
      <Stack.Screen name="Onboarding" component={OnboardingScreen} />
      <Stack.Screen name="Welcome" component={WelcomeScreen} />
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
      <Stack.Screen name="OtpVerify" component={OtpVerifyScreen} />
      <Stack.Screen name="SetPassword" component={SetPasswordScreen} />
      <Stack.Screen name="ApprovalPending" component={ApprovalPendingScreen} />
      <Stack.Screen name="ProfileSetup" component={ProfileSetupScreen} />
      <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
    </Stack.Navigator>
  );
};
export default AuthStack;
