import React, {useEffect} from 'react';
import {ActivityIndicator, StyleSheet, View} from 'react-native';
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import AuthStack from './AuthStack';
import MainTabs from './MainTabs';
import {RootStackParamList} from './types';
import {useAppDispatch, useAppSelector} from '../store';
import {setCredentials, setHydrated} from '../features/auth/authSlice';
import {useMeQuery} from '../api/services/authApi';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {colors} from '../theme';

const Stack = createNativeStackNavigator<RootStackParamList>();

export const RootNavigator: React.FC = () => {
  const dispatch = useAppDispatch();
  const {token, isHydrated} = useAppSelector(state => state.auth);
  const user = useAppSelector(state => state.auth.user);
  useMeQuery(undefined, {skip: !token});
  const ready = Boolean(
    token && user?.status === 'active' && user?.profileCompleted,
  );

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
    if (user && token) {
      AsyncStorage.setItem('axnol_user', JSON.stringify(user)).catch(() => {});
    }
  }, [user, token]);

  if (!isHydrated) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator color={colors.primary} size="large" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{headerShown: false}}>
        {ready ? (
          <Stack.Screen name="Main" component={MainTabs} />
        ) : (
          <Stack.Screen name="Auth" component={AuthStack} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

const styles = StyleSheet.create({
  loader: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
  },
});
export default RootNavigator;
