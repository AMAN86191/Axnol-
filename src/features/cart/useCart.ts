import {useCallback} from 'react';
import {useAppDispatch, useAppSelector} from '../../store';
import {
  addToCart,
  CartItem,
  decrementQuantity,
  incrementQuantity,
  removeFromCart,
  setQuantity as setQuantityAction,
} from './cartSlice';
import {selectCartItemCount, selectCartItems, selectCartTotals} from './cartSelectors';

export const useCart = () => {
  const dispatch = useAppDispatch();
  const items = useAppSelector(selectCartItems);
  const itemCount = useAppSelector(selectCartItemCount);
  const totals = useAppSelector(selectCartTotals);

  const add = useCallback(
    (product: Omit<CartItem, 'quantity'>, quantity = 1) => {
      dispatch(addToCart({...product, quantity}));
    },
    [dispatch],
  );

  const increment = useCallback(
    (id: string) => {
      dispatch(incrementQuantity(id));
    },
    [dispatch],
  );

  const decrement = useCallback(
    (id: string) => {
      dispatch(decrementQuantity(id));
    },
    [dispatch],
  );

  const setQuantity = useCallback(
    (id: string, quantity: number) => {
      dispatch(setQuantityAction({id, quantity}));
    },
    [dispatch],
  );

  const remove = useCallback(
    (id: string) => {
      dispatch(removeFromCart(id));
    },
    [dispatch],
  );

  return {items, itemCount, totals, add, increment, decrement, setQuantity, remove};
};

export default useCart;
