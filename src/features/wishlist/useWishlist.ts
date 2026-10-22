import {useCallback} from 'react';
import {useAppDispatch, useAppSelector} from '../../store';
import {
  addToWishlist,
  clearWishlist,
  removeFromWishlist,
  toggleWishlist,
  WishlistItem,
} from './wishlistSlice';
import {
  selectWishlistCount,
  selectWishlistItems,
} from './wishlistSelectors';

export const useWishlist = () => {
  const dispatch = useAppDispatch();
  const items = useAppSelector(selectWishlistItems);
  const count = useAppSelector(selectWishlistCount);

  const add = useCallback(
    (product: WishlistItem) => {
      dispatch(addToWishlist(product));
    },
    [dispatch],
  );

  const remove = useCallback(
    (id: string) => {
      dispatch(removeFromWishlist(id));
    },
    [dispatch],
  );

  const toggle = useCallback(
    (product: WishlistItem) => {
      dispatch(toggleWishlist(product));
    },
    [dispatch],
  );

  const clear = useCallback(() => {
    dispatch(clearWishlist());
  }, [dispatch]);

  const isWishlisted = useCallback(
    (id: string) => items.some(item => item.id === id),
    [items],
  );

  return {items, count, add, remove, toggle, clear, isWishlisted};
};

export default useWishlist;
