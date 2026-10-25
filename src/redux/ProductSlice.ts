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
    pagination: null as any,
    detailLoading: false,
    detailError: null as any,
    productDetail: null as ProductApi | null,
  },
  reducers: {
    clearProductDetail: state => {
      state.productDetail = null;
    },
    clearProducts: state => {
      state.products = [];
      state.pagination = null;
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
        const params: any = action.meta?.arg ?? {};
        const page = Number(params?.page ?? params?.pageNumber ?? 1);
        if (Array.isArray(data)) {
          if (page > 1) {
            state.products = [...(state.products ?? []), ...data];
          } else {
            state.products = data;
          }
          state.pagination = null;
        } else {
          const list = data?.products ?? data?.items ?? data?.data ?? [];
          if (page > 1) {
            state.products = [...(state.products ?? []), ...list];
          } else {
            state.products = list;
          }
          state.pagination =
            data?.pagination ??
            data?.meta?.pagination ??
            data?.meta ??
            null;
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

export const { clearProductDetail, clearProducts } = productSlice.actions;
export default productSlice.reducer;
