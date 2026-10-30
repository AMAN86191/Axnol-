import {createSlice, PayloadAction} from '@reduxjs/toolkit';

export interface CartItem {
  id: string;
  cartItemId?: string | number;
  productId?: string | number;
  rateChartId?: string | number;
  name: string;
  code?: string;
  image?: string;
  price: number;
  mrp?: number;
  unit?: string;
  size?: string;
  packSize?: string;
  lineTotal?: number;
  quantity: number;
}

export interface CartSummary {
  totalItems?: number;
  totalQty?: number;
  totalPrice?: number;
  gstRate?: number;
  gstAmount?: number;
  grandTotal?: number;
}

export interface CartState {
  items: CartItem[];
  summary: CartSummary | null;
  isHydrated: boolean;
  loading: boolean;
}

const initialState: CartState = {
  items: [],
  summary: null,
  isHydrated: false,
  loading: false,
};

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    setCartItems: (state, action: PayloadAction<CartItem[]>) => {
      state.items = action.payload;
      state.summary = null;
    },
    setCartData: (
      state,
      action: PayloadAction<{items: CartItem[]; summary: CartSummary | null}>,
    ) => {
      state.items = action.payload.items;
      state.summary = action.payload.summary;
    },
    addToCart: (
      state,
      action: PayloadAction<Omit<CartItem, 'quantity'> & {quantity?: number}>,
    ) => {
      state.summary = null;
      const {quantity = 1, ...product} = action.payload;
      const existing = state.items.find(
        item => item.id === product.id && item.size === (product as any).size,
      );
      if (existing) {
        existing.quantity += quantity;
      } else {
        state.items.push({...product, quantity} as CartItem);
      }
    },
    removeFromCart: (state, action: PayloadAction<string>) => {
      state.items = state.items.filter(item => item.id !== action.payload);
      state.summary = null;
    },
    removeCartItemByCartId: (state, action: PayloadAction<string | number>) => {
      state.items = state.items.filter(item => String(item.cartItemId) !== String(action.payload));
      state.summary = null;
    },
    setQuantity: (
      state,
      action: PayloadAction<{id: string; quantity: number}>,
    ) => {
      state.summary = null;
      const item = state.items.find(i => i.id === action.payload.id);
      if (item) {
        item.quantity = Math.max(1, action.payload.quantity);
      }
    },
    incrementQuantity: (state, action: PayloadAction<string>) => {
      state.summary = null;
      const item = state.items.find(i => i.id === action.payload);
      if (item) {
        item.quantity += 1;
      }
    },
    decrementQuantity: (state, action: PayloadAction<string>) => {
      state.summary = null;
      const item = state.items.find(i => i.id === action.payload);
      if (item && item.quantity > 1) {
        item.quantity -= 1;
      }
    },
    clearCart: state => {
      state.items = [];
      state.summary = null;
    },
    hydrateCart: (state, action: PayloadAction<CartItem[]>) => {
      state.items = action.payload;
      state.summary = null;
      state.isHydrated = true;
    },
    setCartHydrated: (state, action: PayloadAction<boolean>) => {
      state.isHydrated = action.payload;
    },
    setCartLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
  },
});

export const {
  setCartItems,
  setCartData,
  addToCart,
  removeFromCart,
  removeCartItemByCartId,
  setQuantity,
  incrementQuantity,
  decrementQuantity,
  clearCart,
  hydrateCart,
  setCartHydrated,
  setCartLoading,
} = cartSlice.actions;

export default cartSlice.reducer;
