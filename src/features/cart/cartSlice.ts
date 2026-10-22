import {createSlice, PayloadAction} from '@reduxjs/toolkit';

export interface CartItem {
  id: string;
  name: string;
  code?: string;
  image?: string;
  price: number;
  mrp?: number;
  unit?: string;
  quantity: number;
}

export interface CartState {
  items: CartItem[];
  isHydrated: boolean;
}

const initialState: CartState = {
  items: [],
  isHydrated: false,
};

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    addToCart: (
      state,
      action: PayloadAction<Omit<CartItem, 'quantity'> & {quantity?: number}>,
    ) => {
      const {quantity = 1, ...product} = action.payload;
      const existing = state.items.find(item => item.id === product.id);
      if (existing) {
        existing.quantity += quantity;
      } else {
        state.items.push({...product, quantity});
      }
    },
    removeFromCart: (state, action: PayloadAction<string>) => {
      state.items = state.items.filter(item => item.id !== action.payload);
    },
    setQuantity: (
      state,
      action: PayloadAction<{id: string; quantity: number}>,
    ) => {
      const item = state.items.find(i => i.id === action.payload.id);
      if (item) {
        item.quantity = Math.max(1, action.payload.quantity);
      }
    },
    incrementQuantity: (state, action: PayloadAction<string>) => {
      const item = state.items.find(i => i.id === action.payload);
      if (item) {
        item.quantity += 1;
      }
    },
    decrementQuantity: (state, action: PayloadAction<string>) => {
      const item = state.items.find(i => i.id === action.payload);
      if (item && item.quantity > 1) {
        item.quantity -= 1;
      }
    },
    clearCart: state => {
      state.items = [];
    },
    hydrateCart: (state, action: PayloadAction<CartItem[]>) => {
      state.items = action.payload;
      state.isHydrated = true;
    },
    setCartHydrated: (state, action: PayloadAction<boolean>) => {
      state.isHydrated = action.payload;
    },
  },
});

export const {
  addToCart,
  removeFromCart,
  setQuantity,
  incrementQuantity,
  decrementQuantity,
  clearCart,
  hydrateCart,
  setCartHydrated,
} = cartSlice.actions;

export default cartSlice.reducer;
