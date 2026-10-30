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
  gstRate: number;
  gstAmount: number;
  total: number;
}

export const selectCartItems = (state: RootState): CartItem[] =>
  state.cart.items;

export const selectCartItemCount = (state: RootState): number =>
  state.cart.summary?.totalQty ??
  state.cart.items.reduce((sum, item) => sum + item.quantity, 0);

export const selectCartTotals = createSelector(
  [selectCartItems, (state: RootState) => state.cart.summary],
  (items, summary): CartTotals => {
    const calculatedSubtotal = items.reduce(
      (sum, item) => sum + (item.lineTotal ?? item.price * item.quantity),
      0,
    );
    const subtotal = summary?.totalPrice ?? calculatedSubtotal;
    const mrpTotal = items.reduce(
      (sum, item) => sum + (item.mrp ?? item.price) * item.quantity,
      0,
    );
    const savings = mrpTotal - subtotal;
    const discountPercent =
      mrpTotal > 0 ? Math.round((savings / mrpTotal) * 100) : 0;
    const gstRate = summary?.gstRate ?? 18;
    const calculatedGstAmount =
      Math.round((subtotal * gstRate + Number.EPSILON) * 100) / 100;
    const gstAmount = summary?.gstAmount ?? calculatedGstAmount;
    const total = summary?.grandTotal ?? subtotal + gstAmount;

    return {
      itemCount:
        summary?.totalQty ??
        items.reduce((sum, item) => sum + item.quantity, 0),
      uniqueCount: summary?.totalItems ?? items.length,
      subtotal,
      mrpTotal,
      savings,
      discountPercent,
      gstRate,
      gstAmount,
      total,
    };
  },
);

export const selectCartQuantity =
  (id: string) =>
  (state: RootState): number =>
    state.cart.items.find(item => item.id === id)?.quantity ?? 0;
