import {configureStore} from '@reduxjs/toolkit';
import {TypedUseSelectorHook, useDispatch, useSelector} from 'react-redux';
import AsyncStorage from '@react-native-async-storage/async-storage';
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
  },
  middleware: getDefaultMiddleware =>
    getDefaultMiddleware({serializableCheck: false}),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

const CART_STORAGE_KEY = 'axnol_cart';

let lastCartItems = store.getState().cart.items;

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
  if (items === lastCartItems) {
    return;
  }
  lastCartItems = items;
  AsyncStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items)).catch(
    () => {},
  );
});

const WISHLIST_STORAGE_KEY = 'axnol_wishlist';

let lastWishlistItems = store.getState().wishlist.items;

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
  if (items === lastWishlistItems) {
    return;
  }
  lastWishlistItems = items;
  AsyncStorage.setItem(WISHLIST_STORAGE_KEY, JSON.stringify(items)).catch(
    () => {},
  );
});

export const useAppDispatch: () => AppDispatch = useDispatch;
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
