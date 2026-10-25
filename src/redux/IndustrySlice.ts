import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import {
  getIndustries,
  getIndustryDetails,
  Industry,
  IndustryDetails,
} from '../api/IndustryProvider';

export const fetchIndustriesSlice = createAsyncThunk(
  'industry/fetchIndustriesSlice',
  async (_: void, { rejectWithValue }) => {
    try {
      return await getIndustries();
    } catch (error) {
      return rejectWithValue(error);
    }
  },
);

export const fetchIndustryDetailsSlice = createAsyncThunk(
  'industry/fetchIndustryDetailsSlice',
  async (industryId: string | number, { rejectWithValue }) => {
    try {
      return await getIndustryDetails(industryId);
    } catch (error) {
      return rejectWithValue(error);
    }
  },
);

const industrySlice = createSlice({
  name: 'industry',
  initialState: {
    loading: false,
    error: null as any,
    industries: [] as Industry[],
    detailLoading: false,
    detailError: null as any,
    industryDetail: null as IndustryDetails | null,
  },
  reducers: {},
  extraReducers: builder => {
    builder
      .addCase(fetchIndustriesSlice.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchIndustriesSlice.fulfilled, (state, action) => {
        state.loading = false;
        const data: any = action.payload?.data ?? action.payload;
        state.industries = Array.isArray(data) ? data : data?.industries ?? [];
      })
      .addCase(fetchIndustriesSlice.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchIndustryDetailsSlice.pending, state => {
        state.detailLoading = true;
        state.detailError = null;
        state.industryDetail = null;
      })
      .addCase(fetchIndustryDetailsSlice.fulfilled, (state, action) => {
        state.detailLoading = false;
        state.industryDetail = action.payload?.data ?? action.payload ?? null;
      })
      .addCase(fetchIndustryDetailsSlice.rejected, (state, action) => {
        state.detailLoading = false;
        state.detailError = action.payload;
      });
  },
});

export default industrySlice.reducer;
