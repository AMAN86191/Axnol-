import {useCallback} from 'react';
import {useAppDispatch, useAppSelector} from '../../store';
import {
  addToCart as addToCartAction,
  CartItem,
  CartSummary,
  clearPendingQuantity,
  mergeCartItemDetails,
  restoreCartItems,
  setCartData,
  setCartLoading,
  setCartMutationPending,
  setPendingQuantity,
} from './cartSlice';
import {selectCartItemCount, selectCartItems, selectCartTotals} from './cartSelectors';
import {
  addToCartApi,
  clearCartApi,
  getCart,
  removeCartItemApi,
  updateCartItemApi,
} from '../../api/CartProvider';
import {getProductById, ProductApi} from '../../api/ProductProvider';
import {toast} from '../../components/ui/ToastProvider';
import {useAppNotification} from '../../components/ui/NotificationProvider';
import {getNetworkErrorKind, getNetworkErrorMessage} from '../../utils/apiError';
import {getRateChartId} from '../../utils/productCardData';

interface RateChartMeta {
  name?: string;
  image?: string;
  code?: string;
  unit?: string;
  packSize?: string;
  price?: number;
  mrp?: number;
}

const rateChartMetaCache = new Map<string, RateChartMeta | null>();
const productDetailCache = new Map<string, Promise<ProductApi | null>>();
const activeCartMutations = new Set<string>();

// Quick taps on + / - are grouped: the screen shows each tap at once and one
// request with the final number is sent after the taps stop.
const QUANTITY_DEBOUNCE_MS = 450;
const quantityTimers = new Map<string, ReturnType<typeof setTimeout>>();
const latestQuantities = new Map<string, number>();

export const getCartProductMutationKey = (product: {
  id: string | number;
  productId?: string | number;
  rateChartId?: string | number;
  size?: string;
  unit?: string;
}): string => {
  const productId = String(product.productId ?? product.id);
  const rateChartId = product.rateChartId;
  if (rateChartId !== undefined && rateChartId !== null) {
    return `cart-product:${productId}:rate:${String(rateChartId)}`;
  }
  const size = product.size ?? product.unit;
  return `cart-product:${productId}:size:${size ?? ''}`;
};

export const getCartItemMutationKey = (id: string | number): string =>
  `cart-item:${String(id)}`;

const runCartMutation = async <T,>(
  keys: string[],
  dispatch: ReturnType<typeof useAppDispatch>,
  request: () => Promise<T>,
): Promise<T | undefined> => {
  if (keys.some(key => activeCartMutations.has(key))) {
    return undefined;
  }

  keys.forEach(key => activeCartMutations.add(key));
  dispatch(setCartMutationPending({keys, pending: true}));
  try {
    return await request();
  } finally {
    keys.forEach(key => activeCartMutations.delete(key));
    dispatch(setCartMutationPending({keys, pending: false}));
  }
};

const loadProductDetails = (productId: string | number) => {
  const key = String(productId);
  const cached = productDetailCache.get(key);
  if (cached) {
    return cached;
  }
  const request = getProductById(key)
    .then(res => res?.data ?? null)
    .catch(() => null);
  productDetailCache.set(key, request);
  request.then(product => {
    if (!product) {
      productDetailCache.delete(key);
    }
  });
  return request;
};

const getRateChartMeta = (
  product: ProductApi,
  rateChartId: string | number,
): RateChartMeta | null => {
  const rateCharts = Array.isArray(product?.rate_charts)
    ? product.rate_charts
    : [];
  const rateChart = rateCharts.find(
    chart => String(getRateChartId(chart)) === String(rateChartId),
  );
  if (!rateChart) {
    return null;
  }
  const qty = rateChart.qty ?? rateChart.quantity;
  const unit = rateChart.unit;
  const explicitSize = rateChart.size ?? rateChart.packSize;
  const packSize = explicitSize
    ? String(explicitSize).trim()
    : qty !== undefined && qty !== null && unit
    ? `${qty} ${String(unit).trim()}`.trim()
    : unit
    ? String(unit).trim()
    : undefined;
  const price = Number(
    rateChart.price ??
      rateChart.rate ??
      rateChart.amount ??
      rateChart.selling_price ??
      0,
  );
  const mrp = Number(rateChart.mrp ?? rateChart.mrp_price ?? 0);
  return {
    name: product.name,
    image: product.thumbnail_url ?? product.image_urls?.[0],
    code:
      product.category?.title ??
      product.category?.name ??
      product.sub_category?.title ??
      product.sub_category?.name,
    unit: unit ? String(unit).trim() : undefined,
    packSize,
    price: Number.isFinite(price) && price > 0 ? price : undefined,
    mrp: Number.isFinite(mrp) && mrp > 0 ? mrp : undefined,
  };
};

const enrichCartItem = async (item: CartItem): Promise<CartItem> => {
  if (!item.productId || item.rateChartId === undefined || item.rateChartId === null) {
    return item;
  }
  const cacheKey = `${String(item.productId)}:${String(item.rateChartId)}`;
  let meta = rateChartMetaCache.get(cacheKey);
  if (meta === undefined) {
    const product = await loadProductDetails(item.productId);
    if (!product) {
      return item;
    }
    meta = getRateChartMeta(product, item.rateChartId);
    rateChartMetaCache.set(cacheKey, meta);
  }
  if (!meta) {
    return item;
  }
  return {
    ...item,
    name: item.name || meta.name || '',
    code: item.code || meta.code,
    image: item.image || meta.image,
    unit: item.unit || meta.unit,
    size: item.size || meta.unit,
    packSize: meta.packSize ?? item.packSize,
    price: item.price > 0 ? item.price : meta.price ?? 0,
    mrp: item.mrp ?? meta.mrp,
  };
};

const enrichCartItems = async (items: CartItem[]): Promise<CartItem[]> =>
  Promise.all(items.map(item => enrichCartItem(item)));

const mapApiCartItem = (item: any): CartItem => {
  const product = item?.product ?? item?.product_detail ?? item;
  const productId = item?.product_id ?? product?.id ?? item?.productId;
  const id = String(productId ?? item?.id ?? '');
  const rateChart = item?.rate_chart ?? null;
  const price =
    Number(
      item?.unit_price ??
        item?.price ??
        item?.rate ??
        rateChart?.price ??
        rateChart?.rate ??
        product?.price ??
        0,
    ) || 0;
  const rawMrp =
    item?.mrp ??
    item?.mrp_price ??
    rateChart?.mrp ??
    rateChart?.mrp_price ??
    product?.mrp;
  const mrpValue = Number(rawMrp);
  const mrp =
    Number.isFinite(mrpValue) && mrpValue > 0 ? mrpValue : undefined;
  const unit =
    item?.unit ??
    rateChart?.unit ??
    item?.size ??
    item?.pack_size ??
    product?.unit ??
    '';
  const quantity = Number(item?.qty ?? item?.quantity ?? item?.pivot?.qty ?? 1) || 1;
  const rateChartId =
    item?.rate_chart_id ?? item?.rateChartId ?? rateChart?.id;
  const image =
    item?.image ??
    item?.thumbnail_url ??
    product?.thumbnail_url ??
    product?.image_urls?.[0] ??
    '';
  const name = item?.name ?? product?.name ?? '';
  const rawLineTotal = item?.line_total ?? item?.lineTotal;
  const lineTotalValue = Number(rawLineTotal);
  const lineTotal =
    Number.isFinite(lineTotalValue) && lineTotalValue >= 0
      ? lineTotalValue
      : undefined;
  return {
    id,
    cartItemId: item?.id ?? item?.cart_id ?? item?.cart_item_id,
    productId,
    rateChartId,
    name,
    code:
      product?.category?.title ??
      product?.category?.name ??
      product?.code ??
      item?.code ??
      '',
    image,
    price,
    mrp,
    unit,
    size: item?.size ?? item?.pack_size ?? unit,
    packSize: item?.pack_size ?? item?.packSize,
    lineTotal,
    quantity,
  };
};

// The cart reply has no names or images, so borrow them from what the app
// already knows (the product card that was tapped, or the earlier cart).
const fillFromKnown = (
  item: CartItem,
  known: Array<Partial<CartItem>>,
): CartItem => {
  const match = known.find(
    candidate =>
      String(candidate.productId ?? candidate.id) ===
        String(item.productId ?? item.id) &&
      (candidate.rateChartId === undefined ||
        candidate.rateChartId === null ||
        item.rateChartId === undefined ||
        item.rateChartId === null ||
        String(candidate.rateChartId) === String(item.rateChartId)),
  );
  if (!match) {
    return item;
  }
  return {
    ...item,
    name: item.name || match.name || '',
    code: item.code || match.code,
    image: item.image || match.image,
    unit: item.unit || match.unit,
    size: item.size || match.size,
    packSize: item.packSize || match.packSize,
    mrp: item.mrp ?? match.mrp,
  };
};

const toOptionalNumber = (value: unknown): number | undefined => {
  if (value === undefined || value === null || value === '') {
    return undefined;
  }
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
};

const parseCartResponse = (
  response: any,
): {items: any[] | null; summary: CartSummary | null} => {
  const candidates = [
    response?.data?.data,
    response?.data,
    response,
  ];
  const cartData = candidates.find(
    candidate =>
      Array.isArray(candidate) ||
      Array.isArray(candidate?.items) ||
      Array.isArray(candidate?.cart),
  );

  if (!cartData) {
    return {items: null, summary: null};
  }

  if (Array.isArray(cartData)) {
    return {items: cartData, summary: null};
  }

  const summary: CartSummary = {
    totalItems: toOptionalNumber(cartData.total_items),
    totalQty: toOptionalNumber(cartData.total_qty),
    totalPrice: toOptionalNumber(cartData.total_price),
    gstRate: toOptionalNumber(cartData.gst_rate),
    gstAmount: toOptionalNumber(cartData.gst_amount),
    grandTotal: toOptionalNumber(cartData.grand_total),
  };
  const hasSummary = Object.values(summary).some(value => value !== undefined);

  return {
    items: cartData.items ?? cartData.cart,
    summary: hasSummary ? summary : null,
  };
};

const findCartItem = (items: CartItem[], id: string | number) =>
  items.find(
    item =>
      item.cartItemId !== undefined &&
      item.cartItemId !== null &&
      String(item.cartItemId) === String(id),
  ) ?? items.find(item => String(item.id) === String(id));

// The server no longer has this cart item (e.g. it was just removed).
const isItemGoneError = (error: any): boolean =>
  String(error?.message ?? '')
    .toLowerCase()
    .includes('no query results');

const wait = (ms: number) => new Promise<void>(resolve => setTimeout(resolve, ms));

const getCartErrorMessage = (error: any, fallback: string): string => {
  const kind = getNetworkErrorKind(error);
  if (kind) {
    return getNetworkErrorMessage(kind);
  }
  const message = error?.message ?? error?.error;
  return typeof message === 'string' && message.trim() ? message : fallback;
};

export const useCart = () => {
  const dispatch = useAppDispatch();
  const items = useAppSelector(selectCartItems);
  const itemCount = useAppSelector(selectCartItemCount);
  const totals = useAppSelector(selectCartTotals);
  const pendingMutations = useAppSelector(
    state => state.cart.pendingMutations,
  );
  const {showCartNotification} = useAppNotification();
  const isMutating = useCallback(
    (keys: string | string[]) =>
      (Array.isArray(keys) ? keys : [keys]).some(
        key => pendingMutations[key],
      ),
    [pendingMutations],
  );

  const fetchCart = useCallback(
    async (silent = false, force = false) => {
      try {
        dispatch(setCartLoading(true));
        const res = await getCart(force);
        const cartResponse = parseCartResponse(res);
        const mappedItems = (cartResponse.items ?? []).map(mapApiCartItem);
        const enrichedItems = await enrichCartItems(mappedItems);
        dispatch(
          setCartData({
            items: enrichedItems,
            summary: cartResponse.summary,
          }),
        );
        return true;
      } catch (error) {
        if (!silent) {
          toast.error(
            'Cart',
            getCartErrorMessage(error, 'Unable to load your cart. Please try again.'),
          );
        }
        return false;
      } finally {
        dispatch(setCartLoading(false));
      }
    },
    [dispatch],
  );

  const add = useCallback(
    async (
      product: Omit<CartItem, 'quantity'> & {size?: string; productId?: string | number},
      quantity = 1,
    ): Promise<boolean> => {
      const productId = product.productId ?? product.id;
      const size = product.size;
      const rateChartId = product.rateChartId;
      const hasRateChartId =
        rateChartId !== undefined &&
        rateChartId !== null &&
        Boolean(String(rateChartId).trim());
      const mutationKey = getCartProductMutationKey({
        ...product,
        productId,
        size,
      });
      const matchingItems = items.filter(
        item =>
          getCartProductMutationKey(item) === mutationKey &&
          item.cartItemId !== undefined &&
          item.cartItemId !== null,
      );
      const mutationKeys = [
        mutationKey,
        ...matchingItems.map(item =>
          getCartItemMutationKey(item.cartItemId as string | number),
        ),
      ];
      return (
        (await runCartMutation(mutationKeys, dispatch, async () => {
        // Show the item in the cart straight away; the server call follows.
        const snapshot = items;
        const optimistic = {
          ...product,
          id: String(productId),
          productId,
          size: size ?? product.unit,
          packSize: product.packSize ?? size ?? product.unit,
          quantity,
        };
        dispatch(addToCartAction(optimistic as any));
        try {
          const response = await addToCartApi({
            product_id: productId,
            ...(hasRateChartId ? {rate_chart_id: rateChartId} : {}),
            ...(!hasRateChartId && size ? {size} : {}),
            qty: quantity,
          });
          const cartResponse = parseCartResponse(response);
          if (cartResponse.items) {
            const quickItems = cartResponse.items
              .map(mapApiCartItem)
              .map(item => fillFromKnown(item, [...snapshot, optimistic]));
            dispatch(
              setCartData({
                items: quickItems,
                summary: cartResponse.summary,
              }),
            );
            // Pack sizes and other extras are looked up in the background.
            enrichCartItems(quickItems)
              .then(enriched => dispatch(mergeCartItemDetails(enriched)))
              .catch(() => undefined);
          } else {
            await fetchCart(true);
          }
          showCartNotification({
            id: productId,
            name: product.name,
            image: product.image,
          });
          return true;
        } catch (error) {
          // The server refused or was unreachable: take the item back out.
          dispatch(restoreCartItems(snapshot));
          toast.error(
            'Add to Cart',
            getCartErrorMessage(
              error,
              'Unable to add this product to cart. Please try again.',
            ),
          );
          return false;
        }
        })) ?? false
      );
    },
    [dispatch, fetchCart, items, showCartNotification],
  );

  const removeItem = useCallback(
    async (item: CartItem) => {
      if (!item.cartItemId) {
        await fetchCart(true);
        toast.warning('Cart', 'Cart was updated. Please try again.');
        return false;
      }
      const key = String(item.cartItemId);
      const mutationKey = getCartItemMutationKey(item.cartItemId);

      // A quantity update still waiting for this item would hit a deleted item.
      const waiting = quantityTimers.get(key);
      if (waiting) {
        clearTimeout(waiting);
        quantityTimers.delete(key);
      }
      latestQuantities.delete(key);
      dispatch(clearPendingQuantity({id: key}));

      // If an update for this item is already running, let it finish first.
      for (let i = 0; i < 100 && activeCartMutations.has(mutationKey); i += 1) {
        await wait(100);
      }

      return (
        (await runCartMutation(
          [mutationKey],
          dispatch,
          async () => {
            try {
              await removeCartItemApi(item.cartItemId as string | number);
              await fetchCart(true);
              return true;
            } catch (error) {
              if (isItemGoneError(error)) {
                // Already gone on the server: just refresh, nothing to report.
                await fetchCart(true);
                return true;
              }
              toast.error(
                'Cart',
                getCartErrorMessage(
                  error,
                  'Unable to remove this item. Please try again.',
                ),
              );
              return false;
            }
          },
        )) ?? false
      );
    },
    [dispatch, fetchCart],
  );

  const pendingQuantities = useAppSelector(
    state => state.cart.pendingQuantities,
  );

  /** Quantity to show: the one just tapped, until the server has caught up. */
  const getDisplayQuantity = useCallback(
    (item: CartItem): number =>
      pendingQuantities[String(item.cartItemId ?? item.id)] ?? item.quantity,
    [pendingQuantities],
  );

  const queueQuantity = useCallback(
    async (item: CartItem, qty: number) => {
      if (!item.cartItemId) {
        await fetchCart(true);
        toast.warning('Cart', 'Cart was updated. Please try again.');
        return;
      }
      const key = String(item.cartItemId);
      const mutationKey = getCartItemMutationKey(item.cartItemId);

      latestQuantities.set(key, qty);
      dispatch(setPendingQuantity({id: key, quantity: qty}));

      const flush = async () => {
        // A previous request for this item is still running: try again shortly.
        if (activeCartMutations.has(mutationKey)) {
          quantityTimers.set(key, setTimeout(flush, 200));
          return;
        }
        quantityTimers.delete(key);
        await runCartMutation([mutationKey], dispatch, async () => {
          try {
            await updateCartItemApi(item.cartItemId as string | number, {qty});
            await fetchCart(true);
          } catch (error) {
            if (isItemGoneError(error)) {
              // Removed meanwhile: refresh quietly instead of showing an error.
              await fetchCart(true);
            } else {
              toast.error(
                'Cart',
                getCartErrorMessage(
                  error,
                  'Unable to update the quantity. Please try again.',
                ),
              );
            }
          }
        });
        if (latestQuantities.get(key) === qty) {
          latestQuantities.delete(key);
        }
        // On failure this also puts the old number back on screen.
        dispatch(clearPendingQuantity({id: key, quantity: qty}));
      };

      const existing = quantityTimers.get(key);
      if (existing) {
        clearTimeout(existing);
      }
      quantityTimers.set(key, setTimeout(flush, QUANTITY_DEBOUNCE_MS));
    },
    [dispatch, fetchCart],
  );

  const currentQuantity = (item: CartItem) =>
    latestQuantities.get(String(item.cartItemId ?? item.id)) ?? item.quantity;

  const increment = useCallback(
    async (id: string | number) => {
      const item = findCartItem(items, id);
      if (!item) {
        return;
      }
      await queueQuantity(item, currentQuantity(item) + 1);
    },
    [items, queueQuantity],
  );

  const decrement = useCallback(
    async (id: string | number) => {
      const item = findCartItem(items, id);
      if (!item) {
        return;
      }
      const next = currentQuantity(item) - 1;
      if (next <= 0) {
        await removeItem(item);
        return;
      }
      await queueQuantity(item, next);
    },
    [items, queueQuantity, removeItem],
  );

  const setQuantity = useCallback(
    async (id: string | number, quantity: number) => {
      const item = findCartItem(items, id);
      if (!item) {
        return;
      }
      await queueQuantity(item, Math.max(1, quantity));
    },
    [items, queueQuantity],
  );

  const remove = useCallback(
    async (id: string | number) => {
      const item = findCartItem(items, id);
      if (!item) {
        return false;
      }
      return removeItem(item);
    },
    [items, removeItem],
  );

  const clear = useCallback(async () => {
    try {
      await clearCartApi();
      await fetchCart(true);
      return true;
    } catch (error) {
      toast.error(
        'Cart',
        getCartErrorMessage(error, 'Unable to clear the cart. Please try again.'),
      );
      return false;
    }
  }, [fetchCart]);

  return {
    items,
    itemCount,
    totals,
    add,
    increment,
    decrement,
    setQuantity,
    remove,
    clear,
    fetchCart,
    isMutating,
    getDisplayQuantity,
  };
};

export default useCart;
