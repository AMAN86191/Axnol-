import {createSlice, PayloadAction} from '@reduxjs/toolkit';

export interface WishlistItem {
  id: string;
  name: string;
  code?: string;
  image?: string;
  price: number;
  mrp?: number;
  unit?: string;
}

export interface WishlistState {
  items: WishlistItem[];
  isHydrated: boolean;
}

const initialState: WishlistState = {
  items: [],
  isHydrated: false,
};

const wishlistSlice = createSlice({
  name: 'wishlist',
  initialState,
  reducers: {
    addToWishlist: (state, action: PayloadAction<WishlistItem>) => {
      const exists = state.items.some(item => item.id === action.payload.id);
      if (!exists) {
        state.items.push(action.payload);
      }
    },
    removeFromWishlist: (state, action: PayloadAction<string>) => {
      state.items = state.items.filter(item => item.id !== action.payload);
    },
    toggleWishlist: (state, action: PayloadAction<WishlistItem>) => {
      const index = state.items.findIndex(item => item.id === action.payload.id);
      if (index >= 0) {
        state.items.splice(index, 1);
      } else {
        state.items.push(action.payload);
      }
    },
    clearWishlist: state => {
      state.items = [];
    },
    hydrateWishlist: (state, action: PayloadAction<WishlistItem[]>) => {
      state.items = action.payload;
      state.isHydrated = true;
    },
    setWishlistHydrated: (state, action: PayloadAction<boolean>) => {
      state.isHydrated = action.payload;
    },
  },
});

export const {
  addToWishlist,
  removeFromWishlist,
  toggleWishlist,
  clearWishlist,
  hydrateWishlist,
  setWishlistHydrated,
} = wishlistSlice.actions;

export default wishlistSlice.reducer;
