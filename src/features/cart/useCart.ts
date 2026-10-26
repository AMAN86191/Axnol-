import {useCallback} from 'react';
import {useAppDispatch, useAppSelector} from '../../store';
import {
  addToCart,
  CartItem,
  clearCart,
  decrementQuantity,
  incrementQuantity,
  removeCartItemByCartId,
  removeFromCart,
  setCartItems,
  setCartLoading,
  setQuantity as setQuantityAction,
} from './cartSlice';
import {selectCartItemCount, selectCartItems, selectCartTotals} from './cartSelectors';
import {
  addToCartApi,
  clearCartApi,
  getCart,
  removeCartItemApi,
  updateCartItemApi,
} from '../../api/CartProvider';

const mapApiCartItem = (item: any): CartItem => {
  const product = item?.product ?? item?.product_detail ?? item;
  const productId = item?.product_id ?? product?.id ?? item?.productId;
  const id = String(productId ?? item?.id ?? Math.random().toString(36).slice(2));
  const rateChart = Array.isArray(product?.rate_charts) ? product.rate_charts[0] : null;
  const price =
    Number(
      item?.price ??
        item?.unit_price ??
        item?.rate ??
        rateChart?.price ??
        rateChart?.rate ??
        product?.price ??
        0,
    ) || 0;
  const mrp =
    Number(
      item?.mrp ??
        rateChart?.mrp ??
        product?.mrp ??
        (price > 0 ? Math.round(price * 1.1) : 0),
    ) || 0;
  const unit =
    item?.size ??
    item?.unit ??
    item?.pack_size ??
    rateChart?.unit ??
    product?.unit ??
    '';
  const quantity = Number(item?.qty ?? item?.quantity ?? item?.pivot?.qty ?? 1) || 1;
  const image =
    item?.image ??
    item?.thumbnail_url ??
    product?.thumbnail_url ??
    product?.image_urls?.[0] ??
    '';
  const name = item?.name ?? product?.name ?? '';
  return {
    id,
    cartItemId: item?.id ?? item?.cart_id ?? item?.cart_item_id,
    productId,
    name,
    code: product?.category?.title ?? product?.category?.name ?? product?.code ?? '',
    image,
    price,
    mrp,
    unit,
    size: unit,
    quantity,
  };
};

export const useCart = () => {
  const dispatch = useAppDispatch();
  const items = useAppSelector(selectCartItems);
  const itemCount = useAppSelector(selectCartItemCount);
  const totals = useAppSelector(selectCartTotals);

  const fetchCart = useCallback(async () => {
    try {
      dispatch(setCartLoading(true));
      const res = await getCart();
      console.log('Cart API Response:', res);
      const data = res?.data ?? res;
      const list = Array.isArray(data) ? data : data?.items ?? data?.cart ?? data?.data ?? [];
      dispatch(setCartItems(list.map(mapApiCartItem)));
    } catch (e) {
      console.log('Cart API Error:', e);
    } finally {
      dispatch(setCartLoading(false));
    }
  }, [dispatch]);

  const add = useCallback(
    async (
      product: Omit<CartItem, 'quantity'> & { size?: string; productId?: string | number },
      quantity = 1,
    ) => {
      const productId = product.productId ?? product.id;
      const size = product.size ?? product.unit ?? '';
      try {
      const res = await addToCartApi({
        product_id: productId,
        size,
        qty: quantity,
      });
      console.log('Add to Cart API Response:', res);
      await fetchCart();
      return;
    } catch (e) {
      console.log('Add to Cart API Error:', e);
      dispatch(addToCart({...product, quantity, size}));
    }
    },
    [dispatch, fetchCart],
  );

  const increment = useCallback(
    async (id: string) => {
      const item = items.find(i => i.id === id);
      if (!item) return;
      const nextQty = (item.quantity || 1) + 1;
      try {
        if (item.cartItemId) {
          const res = await updateCartItemApi(item.cartItemId, { qty: nextQty });
          console.log('Update Cart API Response:', res);
          await fetchCart();
          return;
        }
      } catch (e) {
        console.log('Update Cart API Error:', e);
      }
      dispatch(incrementQuantity(id));
    },
    [dispatch, fetchCart, items],
  );

  const decrement = useCallback(
    async (id: string) => {
      const item = items.find(i => i.id === id);
      if (!item) return;
      if (item.quantity <= 1) {
        if (item.cartItemId) {
          try {
            const res = await removeCartItemApi(item.cartItemId);
            console.log('Remove Cart API Response:', res);
            await fetchCart();
            return;
          } catch (e) {
            console.log('Remove Cart API Error:', e);
          }
        }
        dispatch(removeFromCart(id));
        return;
      }
      const nextQty = item.quantity - 1;
      try {
        if (item.cartItemId) {
          const res = await updateCartItemApi(item.cartItemId, { qty: nextQty });
          console.log('Update Cart API Response:', res);
          await fetchCart();
          return;
        }
      } catch (e) {
        console.log('Update Cart API Error:', e);
      }
      dispatch(decrementQuantity(id));
    },
    [dispatch, fetchCart, items],
  );

  const setQuantity = useCallback(
    async (id: string, quantity: number) => {
      const item = items.find(i => i.id === id);
      const qty = Math.max(1, quantity);
      try {
        if (item?.cartItemId) {
          const res = await updateCartItemApi(item.cartItemId, { qty });
          console.log('Update Cart API Response:', res);
          await fetchCart();
          return;
        }
      } catch (e) {
        console.log('Update Cart API Error:', e);
      }
      dispatch(setQuantityAction({id, quantity: qty}));
    },
    [dispatch, fetchCart, items],
  );

  const remove = useCallback(
    async (id: string) => {
      const item = items.find(i => i.id === id);
      try {
        if (item?.cartItemId) {
          const res = await removeCartItemApi(item.cartItemId);
          console.log('Remove Cart API Response:', res);
          await fetchCart();
          return;
        }
      } catch (e) {
        console.log('Remove Cart API Error:', e);
      }
      dispatch(removeFromCart(id));
    },
    [dispatch, fetchCart, items],
  );

  const clear = useCallback(async () => {
    try {
      const res = await clearCartApi();
      console.log('Clear Cart API Response:', res);
      await fetchCart();
      return;
    } catch (e) {
      console.log('Clear Cart API Error:', e);
    }
    dispatch(clearCart());
  }, [dispatch, fetchCart]);

  return {items, itemCount, totals, add, increment, decrement, setQuantity, remove, clear, fetchCart};
};

export default useCart;
