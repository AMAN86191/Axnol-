import React, {useEffect, useState} from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import AuthStack from './AuthStack';
import MainStack from './MainStack';
import {RootStackParamList} from './types';
import {useAppDispatch, useAppSelector} from '../redux/hooks';
import {setAuth} from '../redux/AuthSlice';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {SplashScreenView} from '../features/auth/SplashScreen';
import {useCart} from '../features/cart/useCart';
import {setCartItems} from '../features/cart/cartSlice';
import {useWishlist} from '../features/wishlist/useWishlist';
import {clearWishlist} from '../features/wishlist/wishlistSlice';
import {navigationRef} from './navigationRef';

const Stack = createNativeStackNavigator<RootStackParamList>();

export const RootNavigator: React.FC = () => {
  const dispatch = useAppDispatch();
  const {token, user} = useAppSelector(state => state.auth);
  const {fetchCart} = useCart();
  const {fetchWishlist} = useWishlist();

  const ready = Boolean(token && user?.status === 'active');

  const [restoring, setRestoring] = useState(true);

  useEffect(() => {
    if (ready) {
      fetchCart();
      fetchWishlist();
    } else {
      dispatch(setCartItems([]));
      dispatch(clearWishlist());
    }
  }, [dispatch, fetchCart, fetchWishlist, ready]);

  useEffect(() => {
    const hydrate = async () => {
      try {
        const storedToken = await AsyncStorage.getItem('axnol_token');
        const storedUser = await AsyncStorage.getItem('axnol_user');
        if (storedToken && storedUser) {
          dispatch(
            setAuth({token: storedToken, user: JSON.parse(storedUser)}),
          );
        }
      } catch {
        // ignore
      } finally {
        setRestoring(false);
      }
    };
    hydrate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (restoring) {
    return <SplashScreenView />;
  }

  return (
    <NavigationContainer ref={navigationRef}>
      <Stack.Navigator screenOptions={{headerShown: false}}>
        {ready ? (
          <Stack.Screen name="Main" component={MainStack} />
        ) : (
          <Stack.Screen name="Auth" component={AuthStack} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default RootNavigator;
