import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import {
  changePassword,
  loginUser,
  registerUser,
  resendOtp,
  updateProfile,
  verifyOtp,
} from '../api/AuthProvider';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {invalidateRequests} from '../api/requestCache';

export const registerUserSlice = createAsyncThunk(
  'auth/registerUserSlice',
  async (payload: any, { rejectWithValue }) => {
    try {
      const res = await registerUser(payload);
      const data = res?.data ?? res;
      if (data?.token) {
        await AsyncStorage.setItem('axnol_token', data.token);
      }
      invalidateRequests();
      return data;
    } catch (error) {
      return rejectWithValue(error);
    }
  },
);

export const loginUserSlice = createAsyncThunk(
  'auth/loginUserSlice',
  async (payload: any, { rejectWithValue }) => {
    try {
      const res = await loginUser(payload);
      const data = res?.data ?? res;
      if (data?.token) {
        await AsyncStorage.setItem('axnol_token', data.token);
      }
      if (data?.user) {
        await AsyncStorage.setItem('axnol_user', JSON.stringify(data.user));
      }
      invalidateRequests();
      return data;
    } catch (error) {
      return rejectWithValue(error);
    }
  },
);

export const verifyOtpSlice = createAsyncThunk(
  'auth/verifyOtpSlice',
  async (payload: any, { rejectWithValue }) => {
    try {
      const res = await verifyOtp(payload);
      const data = res?.data ?? res;
      const token =
        data?.token ?? (await AsyncStorage.getItem('axnol_token')) ?? undefined;
      if (token) {
        await AsyncStorage.setItem('axnol_token', token);
      }
      if (data?.user) {
        await AsyncStorage.setItem('axnol_user', JSON.stringify(data.user));
      }
      invalidateRequests();
      return { ...data, token };
    } catch (error) {
      return rejectWithValue(error);
    }
  },
);

export const resendOtpSlice = createAsyncThunk(
  'auth/resendOtpSlice',
  async (payload: any, { rejectWithValue }) => {
    try {
      const res = await resendOtp(payload);
      return res?.data ?? res;
    } catch (error) {
      return rejectWithValue(error);
    }
  },
);

export const updateProfileSlice = createAsyncThunk(
  'auth/updateProfileSlice',
  async (payload: any, { rejectWithValue }) => {
    try {
      const res = await updateProfile(payload);
      const data = res?.data ?? res;
      const user = data?.user ?? data;
      if (user) {
        await AsyncStorage.setItem('axnol_user', JSON.stringify(user));
      }
      return user;
    } catch (error) {
      return rejectWithValue(error);
    }
  },
);

export const changePasswordSlice = createAsyncThunk(
  'auth/changePasswordSlice',
  async (
    payload: {
      current_password: string;
      password: string;
      password_confirmation: string;
    },
    { rejectWithValue },
  ) => {
    try {
      const res = await changePassword(payload);
      return res?.data ?? res;
    } catch (error) {
      return rejectWithValue(error);
    }
  },
);

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    loading: false,
    error: null as any,
    user: null as any,
    token: null as string | null,
  },
  reducers: {
    setAuth: (state, action) => {
      state.token = action.payload?.token || null;
      state.user = action.payload?.user || null;
      state.error = null;
    },
    clearAuth: state => {
      state.token = null;
      state.user = null;
      state.error = null;
    },
  },
  extraReducers: builder => {
    builder
      .addCase(registerUserSlice.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(registerUserSlice.fulfilled, state => {
        state.loading = false;
      })
      .addCase(registerUserSlice.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(loginUserSlice.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUserSlice.fulfilled, (state, action) => {
        state.loading = false;
        state.token = action.payload?.token || null;
        state.user = action.payload?.user || null;
      })
      .addCase(loginUserSlice.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(verifyOtpSlice.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(verifyOtpSlice.fulfilled, (state, action) => {
        state.loading = false;
        state.token = action.payload?.token || null;
        state.user = action.payload?.user || null;
      })
      .addCase(verifyOtpSlice.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(resendOtpSlice.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(resendOtpSlice.fulfilled, state => {
        state.loading = false;
      })
      .addCase(resendOtpSlice.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(updateProfileSlice.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateProfileSlice.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload) {
          state.user = action.payload;
        }
      })
      .addCase(updateProfileSlice.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(changePasswordSlice.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(changePasswordSlice.fulfilled, state => {
        state.loading = false;
      })
      .addCase(changePasswordSlice.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { setAuth, clearAuth } = authSlice.actions;
export default authSlice.reducer;
