import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import {
  ApiCategory,
  CategoriesParams,
  getCategories,
  getCategoryDetails,
} from '../api/CategoryProvider';

const extractCategories = (payload: any): ApiCategory[] => {
  const data: any = payload?.data ?? payload;
  if (Array.isArray(data)) {
    return data;
  }
  return data?.categories ?? data?.data ?? [];
};

export const fetchCategoriesSlice = createAsyncThunk(
  'category/fetchCategoriesSlice',
  async (params: CategoriesParams | undefined, { rejectWithValue }) => {
    try {
      return await getCategories(params);
    } catch (error) {
      return rejectWithValue(error);
    }
  },
);

export const fetchCategoryDetailsSlice = createAsyncThunk(
  'category/fetchCategoryDetailsSlice',
  async (category: string | number, { rejectWithValue }) => {
    try {
      return await getCategoryDetails(category);
    } catch (error) {
      return rejectWithValue(error);
    }
  },
);

const categorySlice = createSlice({
  name: 'category',
  initialState: {
    loading: false,
    error: null as any,
    categories: [] as ApiCategory[],
    allCategories: [] as ApiCategory[],
    detailLoading: false,
    detailError: null as any,
    categoryDetail: null as any,
  },
  reducers: {},
  extraReducers: builder => {
    builder
      .addCase(fetchCategoriesSlice.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCategoriesSlice.fulfilled, (state, action) => {
        state.loading = false;
        const categories = extractCategories(action.payload);
        state.categories = categories;
        const params = action.meta.arg;
        if (!params?.industryId && !params?.industry_id) {
          state.allCategories = categories;
        }
      })
      .addCase(fetchCategoriesSlice.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchCategoryDetailsSlice.pending, state => {
        state.detailLoading = true;
        state.detailError = null;
        state.categoryDetail = null;
      })
      .addCase(fetchCategoryDetailsSlice.fulfilled, (state, action) => {
        state.detailLoading = false;
        state.categoryDetail = action.payload?.data ?? action.payload ?? null;
      })
      .addCase(fetchCategoryDetailsSlice.rejected, (state, action) => {
        state.detailLoading = false;
        state.detailError = action.payload;
      });
  },
});

export default categorySlice.reducer;
