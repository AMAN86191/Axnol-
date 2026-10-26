import {configureStore} from '@reduxjs/toolkit';
import {TypedUseSelectorHook, useDispatch, useSelector} from 'react-redux';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {authApi} from '../api/services/authApi';
import {homeApi} from '../api/services/homeApi';
import {catalogueApi} from '../api/services/catalogueApi';
import {pricingApi} from '../api/services/pricingApi';
import {ordersApi} from '../api/services/ordersApi';
import {profileApi} from '../api/services/profileApi';
import {documentsApi} from '../api/services/documentsApi';
import {enquiriesApi} from '../api/services/enquiriesApi';
import authReducer from '../redux/AuthSlice';
import homeReducer from '../redux/HomeSlice';
import categoryReducer from '../redux/CategorySlice';
import industryReducer from '../redux/IndustrySlice';
import productReducer from '../redux/ProductSlice';
import orderReducer from '../redux/OrderSlice';
import cartReducer from '../features/cart/cartSlice';
import wishlistReducer from '../features/wishlist/wishlistSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    home: homeReducer,
    category: categoryReducer,
    industry: industryReducer,
    product: productReducer,
    order: orderReducer,
    cart: cartReducer,
    wishlist: wishlistReducer,
    [authApi.reducerPath]: authApi.reducer,
    [homeApi.reducerPath]: homeApi.reducer,
    [catalogueApi.reducerPath]: catalogueApi.reducer,
    [pricingApi.reducerPath]: pricingApi.reducer,
    [ordersApi.reducerPath]: ordersApi.reducer,
    [profileApi.reducerPath]: profileApi.reducer,
    [documentsApi.reducerPath]: documentsApi.reducer,
    [enquiriesApi.reducerPath]: enquiriesApi.reducer,
  },
  middleware: getDefaultMiddleware =>
    getDefaultMiddleware({serializableCheck: false}).concat(
      authApi.middleware,
      homeApi.middleware,
      catalogueApi.middleware,
      pricingApi.middleware,
      ordersApi.middleware,
      profileApi.middleware,
      documentsApi.middleware,
      enquiriesApi.middleware,
    ),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

const CART_STORAGE_KEY = 'axnol_cart';

let lastCartSnapshot = '';

export const hydrateCart = async (): Promise<void> => {
  try {
    const stored = await AsyncStorage.getItem(CART_STORAGE_KEY);
    if (stored) {
      const {hydrateCart: hydrate} = await import(
        '../features/cart/cartSlice'
      );
      store.dispatch(hydrate(JSON.parse(stored)));
    } else {
      const {setCartHydrated} = await import('../features/cart/cartSlice');
      store.dispatch(setCartHydrated(true));
    }
  } catch {
    const {setCartHydrated} = await import('../features/cart/cartSlice');
    store.dispatch(setCartHydrated(true));
  }
};

store.subscribe(() => {
  const items = store.getState().cart.items;
  const snapshot = JSON.stringify(items);
  if (snapshot === lastCartSnapshot) {
    return;
  }
  lastCartSnapshot = snapshot;
  AsyncStorage.setItem(CART_STORAGE_KEY, snapshot).catch(() => {});
});

const WISHLIST_STORAGE_KEY = 'axnol_wishlist';

let lastWishlistSnapshot = '';

export const hydrateWishlist = async (): Promise<void> => {
  try {
    const stored = await AsyncStorage.getItem(WISHLIST_STORAGE_KEY);
    if (stored) {
      const {hydrateWishlist: hydrate} = await import(
        '../features/wishlist/wishlistSlice'
      );
      store.dispatch(hydrate(JSON.parse(stored)));
    } else {
      const {setWishlistHydrated} = await import(
        '../features/wishlist/wishlistSlice'
      );
      store.dispatch(setWishlistHydrated(true));
    }
  } catch {
    const {setWishlistHydrated} = await import(
      '../features/wishlist/wishlistSlice'
    );
    store.dispatch(setWishlistHydrated(true));
  }
};

store.subscribe(() => {
  const items = store.getState().wishlist.items;
  const snapshot = JSON.stringify(items);
  if (snapshot === lastWishlistSnapshot) {
    return;
  }
  lastWishlistSnapshot = snapshot;
  AsyncStorage.setItem(WISHLIST_STORAGE_KEY, snapshot).catch(() => {});
});

export const useAppDispatch: () => AppDispatch = useDispatch;
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
