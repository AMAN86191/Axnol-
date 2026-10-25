import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { getSliders, Slider } from '../api/HomeProvider';

export const fetchSlidersSlice = createAsyncThunk(
  'home/fetchSlidersSlice',
  async (_: void, { rejectWithValue }) => {
    try {
      return await getSliders();
    } catch (error) {
      return rejectWithValue(error);
    }
  },
);

const homeSlice = createSlice({
  name: 'home',
  initialState: {
    loading: false,
    error: null as any,
    sliders: [] as Slider[],
  },
  reducers: {},
  extraReducers: builder => {
    builder
      .addCase(fetchSlidersSlice.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSlidersSlice.fulfilled, (state, action) => {
        state.loading = false;
        const data: any = action.payload?.data ?? action.payload;
        state.sliders = Array.isArray(data) ? data : data?.sliders ?? [];
      })
      .addCase(fetchSlidersSlice.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default homeSlice.reducer;
