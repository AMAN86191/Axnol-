import React, {useEffect, useState} from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import AuthStack from './AuthStack';
import MainDrawer from './MainDrawer';
import {RootStackParamList} from './types';
import {useAppDispatch, useAppSelector} from '../store';
import {setCredentials, setHydrated} from '../features/auth/authSlice';
import {useMeQuery} from '../api/services/authApi';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {SplashScreenView} from '../features/auth/SplashScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();

export const RootNavigator: React.FC = () => {
  const dispatch = useAppDispatch();
  const {token, isHydrated} = useAppSelector(state => state.auth);
  const user = useAppSelector(state => state.auth.user);
  const meQuery = useMeQuery(undefined, {skip: !token});
  const ready = Boolean(
    token && user?.status === 'active' && user?.profileCompleted,
  );

  // `restoring` is only true during the very first app-open restore: while we
  // rehydrate storage and (if a stored token exists) validate it with
  // `auth/me`. Once that first boot finishes we never show the splash again,
  // so logging in or out transitions straight to the right screen.
  const [restoring, setRestoring] = useState(true);

  useEffect(() => {
    const hydrate = async () => {
      try {
        const storedToken = await AsyncStorage.getItem('axnol_token');
        const storedUser = await AsyncStorage.getItem('axnol_user');
        if (storedToken && storedUser) {
          dispatch(
            setCredentials({token: storedToken, user: JSON.parse(storedUser)}),
          );
        }
      } catch {
        // ignore
      } finally {
        dispatch(setHydrated(true));
      }
    };
    hydrate();
  }, [dispatch]);

  useEffect(() => {
    if (!isHydrated) {
      return;
    }
    if (!token) {
      setRestoring(false);
      return;
    }
    const settled =
      !meQuery.isUninitialized && !meQuery.isFetching && !meQuery.isLoading;
    if (settled) {
      setRestoring(false);
    }
  }, [
    isHydrated,
    token,
    meQuery.isUninitialized,
    meQuery.isFetching,
    meQuery.isLoading,
  ]);

  useEffect(() => {
    if (user && token) {
      AsyncStorage.setItem('axnol_user', JSON.stringify(user)).catch(() => {});
    }
  }, [user, token]);

  if (!isHydrated || restoring) {
    return <SplashScreenView />;
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{headerShown: false}}>
        {ready ? (
          <Stack.Screen name="Main" component={MainDrawer} />
        ) : (
          <Stack.Screen name="Auth" component={AuthStack} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default RootNavigator;
