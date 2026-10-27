import {createSelector} from '@reduxjs/toolkit';
import {RootState} from '../../store';
import {CartItem} from './cartSlice';

export interface CartTotals {
  itemCount: number;
  uniqueCount: number;
  subtotal: number;
  mrpTotal: number;
  savings: number;
  discountPercent: number;
}

export const selectCartItems = (state: RootState): CartItem[] =>
  state.cart.items;

export const selectCartItemCount = (state: RootState): number =>
  state.cart.items.reduce((sum, item) => sum + item.quantity, 0);

export const selectCartTotals = createSelector(
  [selectCartItems],
  (items): CartTotals => {
    const subtotal = items.reduce(
      (sum, item) => sum + (item.lineTotal ?? item.price * item.quantity),
      0,
    );
    const mrpTotal = items.reduce(
      (sum, item) => sum + (item.mrp ?? item.price) * item.quantity,
      0,
    );
    const savings = mrpTotal - subtotal;
    const discountPercent =
      mrpTotal > 0 ? Math.round((savings / mrpTotal) * 100) : 0;

    return {
      itemCount: items.reduce((sum, item) => sum + item.quantity, 0),
      uniqueCount: items.length,
      subtotal,
      mrpTotal,
      savings,
      discountPercent,
    };
  },
);

export const selectCartQuantity =
  (id: string) =>
  (state: RootState): number =>
    state.cart.items.find(item => item.id === id)?.quantity ?? 0;
