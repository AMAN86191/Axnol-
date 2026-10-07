import {configureStore} from '@reduxjs/toolkit';
import {TypedUseSelectorHook, useDispatch, useSelector} from 'react-redux';
import {authApi} from '../api/services/authApi';
import {homeApi} from '../api/services/homeApi';
import {catalogueApi} from '../api/services/catalogueApi';
import {pricingApi} from '../api/services/pricingApi';
import {ordersApi} from '../api/services/ordersApi';
import {profileApi} from '../api/services/profileApi';
import {documentsApi} from '../api/services/documentsApi';
import {enquiriesApi} from '../api/services/enquiriesApi';
import authReducer from '../features/auth/authSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
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

export const useAppDispatch: () => AppDispatch = useDispatch;
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
