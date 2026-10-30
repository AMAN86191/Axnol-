import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import {
  confirmOrder,
  ConfirmOrderPayload,
  ConfirmOrderResponse,
  getOrderById,
  getOrders,
  OrderRecord,
} from '../api/OrderProvider';

export const confirmOrderSlice = createAsyncThunk(
  'order/confirmOrderSlice',
  async (payload: ConfirmOrderPayload, { rejectWithValue }) => {
    try {
      console.log('order api payload :', payload);
      return await confirmOrder(payload);
    } catch (error) {
      return rejectWithValue(error);
    }
  },
);

export const fetchOrdersSlice = createAsyncThunk(
  'order/fetchOrdersSlice',
  async (_, { rejectWithValue }) => {
    try {
      return await getOrders();
    } catch (error) {
      return rejectWithValue(error);
    }
  },
);

export const fetchOrderDetailSlice = createAsyncThunk(
  'order/fetchOrderDetailSlice',
  async (orderId: string | number, { rejectWithValue }) => {
    try {
      return await getOrderById(orderId);
    } catch (error) {
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
    orders: [] as OrderRecord[],
    ordersLoading: false,
    ordersError: null as any,
    orderDetail: null as OrderRecord | null,
    orderDetailLoading: false,
    orderDetailError: null as any,
  },
  reducers: {
    resetOrderState: state => {
      state.loading = false;
      state.error = null;
      state.confirmedOrder = null;
    },
    resetOrderDetail: state => {
      state.orderDetail = null;
      state.orderDetailError = null;
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
      })
      .addCase(fetchOrdersSlice.pending, state => {
        state.ordersLoading = true;
        state.ordersError = null;
      })
      .addCase(fetchOrdersSlice.fulfilled, (state, action) => {
        state.ordersLoading = false;
        state.orders = action.payload;
      })
      .addCase(fetchOrdersSlice.rejected, (state, action) => {
        state.ordersLoading = false;
        state.ordersError = action.payload;
      })
      .addCase(fetchOrderDetailSlice.pending, state => {
        state.orderDetailLoading = true;
        state.orderDetailError = null;
        state.orderDetail = null;
      })
      .addCase(fetchOrderDetailSlice.fulfilled, (state, action) => {
        state.orderDetailLoading = false;
        state.orderDetail = action.payload;
      })
      .addCase(fetchOrderDetailSlice.rejected, (state, action) => {
        state.orderDetailLoading = false;
        state.orderDetailError = action.payload;
      });
  },
});

export const { resetOrderState, resetOrderDetail } = orderSlice.actions;
export default orderSlice.reducer;
