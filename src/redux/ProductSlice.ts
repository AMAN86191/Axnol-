import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { getProductById, getProducts, ProductApi } from '../api/ProductProvider';

export const fetchProductsSlice = createAsyncThunk(
  'product/fetchProductsSlice',
  async (params: Record<string, any> | undefined, { rejectWithValue }) => {
    try {
      return await getProducts(params);
    } catch (error) {
      return rejectWithValue(error);
    }
  },
);

export const fetchProductDetailsSlice = createAsyncThunk(
  'product/fetchProductDetailsSlice',
  async (productId: string | number, { rejectWithValue }) => {
    try {
      return await getProductById(productId);
    } catch (error) {
      return rejectWithValue(error);
    }
  },
);

const productSlice = createSlice({
  name: 'product',
  initialState: {
    loading: false,
    error: null as any,
    products: [] as ProductApi[],
    detailLoading: false,
    detailError: null as any,
    productDetail: null as ProductApi | null,
  },
  reducers: {
    clearProductDetail: state => {
      state.productDetail = null;
    },
  },
  extraReducers: builder => {
    builder
      .addCase(fetchProductsSlice.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProductsSlice.fulfilled, (state, action) => {
        state.loading = false;
        const data: any = action.payload?.data ?? action.payload;
        if (Array.isArray(data)) {
          state.products = data;
        } else {
          state.products = data?.products ?? data?.items ?? [];
        }
      })
      .addCase(fetchProductsSlice.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchProductDetailsSlice.pending, state => {
        state.detailLoading = true;
        state.detailError = null;
        state.productDetail = null;
      })
      .addCase(fetchProductDetailsSlice.fulfilled, (state, action) => {
        state.detailLoading = false;
        state.productDetail = action.payload?.data ?? action.payload ?? null;
      })
      .addCase(fetchProductDetailsSlice.rejected, (state, action) => {
        state.detailLoading = false;
        state.detailError = action.payload;
      });
  },
});

export const { clearProductDetail } = productSlice.actions;
export default productSlice.reducer;
