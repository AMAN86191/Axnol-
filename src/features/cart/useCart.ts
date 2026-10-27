import {useCallback} from 'react';
import {useAppDispatch, useAppSelector} from '../../store';
import {CartItem, setCartItems, setCartLoading} from './cartSlice';
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

const findCartItem = (items: CartItem[], id: string | number) =>
  items.find(
    item =>
      item.cartItemId !== undefined &&
      item.cartItemId !== null &&
      String(item.cartItemId) === String(id),
  ) ?? items.find(item => String(item.id) === String(id));

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

  const fetchCart = useCallback(
    async (silent = false, force = false) => {
      try {
        dispatch(setCartLoading(true));
        const res = await getCart(force);
        const data = res?.data ?? res;
        const list = Array.isArray(data)
          ? data
          : data?.items ?? data?.cart ?? data?.data ?? [];
        const mappedItems = list.map(mapApiCartItem);
        const enrichedItems = await enrichCartItems(mappedItems);
        dispatch(setCartItems(enrichedItems));
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
      try {
        await addToCartApi({
          product_id: productId,
          ...(hasRateChartId ? {rate_chart_id: rateChartId} : {}),
          ...(!hasRateChartId && size ? {size} : {}),
          qty: quantity,
        });
        await fetchCart(true);
        return true;
      } catch (error) {
        toast.error(
          'Add to Cart',
          getCartErrorMessage(error, 'Unable to add this product to cart. Please try again.'),
        );
        return false;
      }
    },
    [fetchCart],
  );

  const removeItem = useCallback(
    async (item: CartItem) => {
      if (!item.cartItemId) {
        await fetchCart(true);
        toast.warning('Cart', 'Cart was updated. Please try again.');
        return false;
      }
      try {
        await removeCartItemApi(item.cartItemId);
        await fetchCart(true);
        return true;
      } catch (error) {
        toast.error(
          'Cart',
          getCartErrorMessage(error, 'Unable to remove this item. Please try again.'),
        );
        return false;
      }
    },
    [fetchCart],
  );

  const increment = useCallback(
    async (id: string | number) => {
      const item = findCartItem(items, id);
      if (!item) {
        return;
      }
      if (!item.cartItemId) {
        await fetchCart(true);
        toast.warning('Cart', 'Cart was updated. Please try again.');
        return;
      }
      try {
        await updateCartItemApi(item.cartItemId, {qty: (item.quantity || 1) + 1});
        await fetchCart(true);
      } catch (error) {
        toast.error(
          'Cart',
          getCartErrorMessage(error, 'Unable to update the quantity. Please try again.'),
        );
      }
    },
    [fetchCart, items],
  );

  const decrement = useCallback(
    async (id: string | number) => {
      const item = findCartItem(items, id);
      if (!item) {
        return;
      }
      if (item.quantity <= 1) {
        await removeItem(item);
        return;
      }
      if (!item.cartItemId) {
        await fetchCart(true);
        toast.warning('Cart', 'Cart was updated. Please try again.');
        return;
      }
      try {
        await updateCartItemApi(item.cartItemId, {qty: item.quantity - 1});
        await fetchCart(true);
      } catch (error) {
        toast.error(
          'Cart',
          getCartErrorMessage(error, 'Unable to update the quantity. Please try again.'),
        );
      }
    },
    [fetchCart, items, removeItem],
  );

  const setQuantity = useCallback(
    async (id: string | number, quantity: number) => {
      const item = findCartItem(items, id);
      if (!item) {
        return;
      }
      const qty = Math.max(1, quantity);
      if (!item.cartItemId) {
        await fetchCart(true);
        toast.warning('Cart', 'Cart was updated. Please try again.');
        return;
      }
      try {
        await updateCartItemApi(item.cartItemId, {qty});
        await fetchCart(true);
      } catch (error) {
        toast.error(
          'Cart',
          getCartErrorMessage(error, 'Unable to update the quantity. Please try again.'),
        );
      }
    },
    [fetchCart, items],
  );

  const remove = useCallback(
    async (id: string | number) => {
      const item = findCartItem(items, id);
      if (!item) {
        return;
      }
      await removeItem(item);
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
  };
};

export default useCart;
