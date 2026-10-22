import {RootState} from '../../store';
import {WishlistItem} from './wishlistSlice';

export const selectWishlistItems = (state: RootState): WishlistItem[] =>
  state.wishlist.items;

export const selectWishlistCount = (state: RootState): number =>
  state.wishlist.items.length;

export const selectIsWishlisted =
  (id: string) =>
  (state: RootState): boolean =>
    state.wishlist.items.some(item => item.id === id);
