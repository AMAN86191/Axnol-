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
    // Details already loaded this session, by industry id.
    detailsById: {} as Record<string, IndustryDetails>,
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
      .addCase(fetchIndustryDetailsSlice.pending, (state, action) => {
        // Reuse what we already have for this industry so the page shows at
        // once; only a first visit starts empty (and shows the skeleton).
        const cached = state.detailsById[String(action.meta.arg)] ?? null;
        state.industryDetail = cached;
        state.detailLoading = !cached;
        state.detailError = null;
      })
      .addCase(fetchIndustryDetailsSlice.fulfilled, (state, action) => {
        state.detailLoading = false;
        const detail = action.payload?.data ?? action.payload ?? null;
        state.industryDetail = detail;
        if (detail) {
          state.detailsById[String(action.meta.arg)] = detail;
        }
      })
      .addCase(fetchIndustryDetailsSlice.rejected, (state, action) => {
        state.detailLoading = false;
        state.detailError = action.payload;
      });
  },
});

export default industrySlice.reducer;
