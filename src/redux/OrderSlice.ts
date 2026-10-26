import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import {
  confirmOrder,
  ConfirmOrderPayload,
  ConfirmOrderResponse,
} from '../api/OrderProvider';

export const confirmOrderSlice = createAsyncThunk(
  'order/confirmOrderSlice',
  async (payload: ConfirmOrderPayload, { rejectWithValue }) => {
    try {
      console.log('payload :', payload);
      return await confirmOrder(payload);
    } catch (error) {
      console.log('error :', error);
      return rejectWithValue(error);
    }
  },
);

const orderSlice = createSlice({
  name: 'order',
  initialState: {
    loading: false,
    error: null as any,
    confirmedOrder: null as ConfirmOrderResponse | null,
  },
  reducers: {
    resetOrderState: state => {
      state.loading = false;
      state.error = null;
      state.confirmedOrder = null;
    },
  },
  extraReducers: builder => {
    builder
      .addCase(confirmOrderSlice.pending, state => {
        state.loading = true;
        state.error = null;
        state.confirmedOrder = null;
      })
      .addCase(confirmOrderSlice.fulfilled, (state, action) => {
        state.loading = false;
        state.confirmedOrder = action.payload;
      })
      .addCase(confirmOrderSlice.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { resetOrderState } = orderSlice.actions;
export default orderSlice.reducer;
