import {RootState} from '../../store';
import {WishlistItem} from './wishlistSlice';

export const selectWishlistItems = (state: RootState): WishlistItem[] =>
  state.wishlist.items;

export const selectWishlistCount = (state: RootState): number =>
  state.wishlist.items.length;

export const selectIsWishlisted =
  (id: string | number) =>
  (state: RootState): boolean =>
    state.wishlist.items.some(
      item => item.id === String(id) || String(item.productId) === String(id),
    );

export const selectWishlistLoading = (state: RootState): boolean =>
  state.wishlist.loading;
