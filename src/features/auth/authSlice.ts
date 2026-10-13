import {createSlice, PayloadAction} from '@reduxjs/toolkit';
import {SafeUser} from '../../api/types';
import {authApi} from '../../api/services/authApi';

export interface AuthState {
  token: string | null;
  user: SafeUser | null;
  isHydrated: boolean;
}

const initialState: AuthState = {
  token: null,
  user: null,
  isHydrated: false,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (
      state,
      action: PayloadAction<{token: string | null; user: SafeUser | null}>,
    ) => {
      state.token = action.payload.token;
      state.user = action.payload.user;
      state.isHydrated = true;
    },
    logout: state => {
      state.token = null;
      state.user = null;
    },
    setHydrated: (state, action: PayloadAction<boolean>) => {
      state.isHydrated = action.payload;
    },
  },
  extraReducers: builder => {
    builder
      .addMatcher(authApi.endpoints.login.matchFulfilled, (state, action) => {
        state.token = action.payload.token;
        state.user = action.payload.user;
      })
      // NOTE: verifyOtp must NOT auto-login — the forgot-password flow
      // verifies an OTP without signing the user in. Call sites that need
      // a session (e.g. Register) set credentials explicitly.
      .addMatcher(authApi.endpoints.me.matchFulfilled, (state, action) => {
        state.user = action.payload;
        if (!state.token) {
          state.token = state.token ?? null;
        }
      })
      .addMatcher(authApi.endpoints.me.matchRejected, state => {
        state.token = null;
        state.user = null;
      })
      .addMatcher(authApi.endpoints.logout.matchFulfilled, state => {
        state.token = null;
        state.user = null;
      });
  },
});

export const {setCredentials, logout, setHydrated} = authSlice.actions;
export default authSlice.reducer;
