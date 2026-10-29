import {useCallback} from 'react';
import {useAppDispatch, useAppSelector} from '../../store';
import {
  addToWishlist,
  clearWishlist,
  removeFromWishlist,
  setWishlistItems,
  setWishlistLoading,
  toggleWishlist,
  WishlistItem,
} from './wishlistSlice';
import {
  selectWishlistCount,
  selectWishlistItems,
} from './wishlistSelectors';
import {
  addToWishlistApi,
  clearWishlistApi,
  getWishlist,
  removeFromWishlistApi,
} from '../../api/WishlistProvider';
import {getProductById, ProductApi} from '../../api/ProductProvider';
import {toast} from '../../components/ui/ToastProvider';
import {getNetworkErrorKind, getNetworkErrorMessage} from '../../utils/apiError';

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

const getWishlistErrorMessage = (error: any, fallback: string): string => {
  const kind = getNetworkErrorKind(error);
  if (kind) {
    return getNetworkErrorMessage(kind);
  }
  const message = error?.message ?? error?.error;
  return typeof message === 'string' && message.trim() ? message : fallback;
};

const mapApiWishlistItem = (item: any): WishlistItem => {
  const product = item?.product ?? item?.product_detail ?? null;
  const productId =
    product?.id ??
    item?.product_id ??
    item?.productId ??
    item?.id;
  const id = String(productId ?? item?.id ?? '');
  const rateCharts = Array.isArray(product?.rate_charts)
    ? product.rate_charts
    : Array.isArray(item?.rate_charts)
    ? item.rate_charts
    : [];
  const firstRateChart = rateCharts[0];
  const price =
    Number(
      firstRateChart?.price ??
        firstRateChart?.rate ??
        firstRateChart?.selling_price ??
        item?.price ??
        item?.unit_price ??
        product?.price ??
        product?.min_price ??
        0,
    ) || 0;
  const rawMrp =
    firstRateChart?.mrp ??
    firstRateChart?.mrp_price ??
    item?.mrp ??
    item?.mrp_price ??
    product?.mrp ??
    product?.max_mrp;
  const mrpValue = Number(rawMrp);
  const mrp =
    Number.isFinite(mrpValue) && mrpValue > 0 ? mrpValue : undefined;
  const image =
    item?.thumbnail_url ??
    product?.thumbnail_url ??
    product?.image_urls?.[0] ??
    item?.image ??
    '';
  const name = item?.name ?? product?.name ?? '';
  const unit =
    firstRateChart?.unit ??
    firstRateChart?.pack_size ??
    item?.unit ??
    product?.unit ??
    '';
  const rateChartId =
    firstRateChart?.rate_chart_id ??
    firstRateChart?.id ??
    item?.rate_chart_id ??
    product?.rate_chart_id;
  const code =
    product?.category?.title ??
    product?.category?.name ??
    product?.sub_category?.title ??
    product?.sub_category?.name ??
    product?.code ??
    item?.code ??
    '';
  return {
    id,
    productId,
    name,
    code,
    image,
    price,
    mrp: mrp && mrp > price ? mrp : mrp,
    unit,
    rateChartId,
  };
};

export const useWishlist = () => {
  const dispatch = useAppDispatch();
  const items = useAppSelector(selectWishlistItems);
  const count = useAppSelector(selectWishlistCount);

  const fetchWishlist = useCallback(
    async (silent = false, force = false) => {
      try {
        dispatch(setWishlistLoading(true));
        const res = await getWishlist(force);
        const data = res?.data ?? res;
        const list = Array.isArray(data)
          ? data
          : data?.items ?? data?.wishlist ?? data?.data ?? [];
        const mappedItems = list.map(mapApiWishlistItem);
        dispatch(setWishlistItems(mappedItems));
        return true;
      } catch (error) {
        if (!silent) {
          toast.error(
            'Wishlist',
            getWishlistErrorMessage(
              error,
              'Unable to load your wishlist. Please try again.',
            ),
          );
        }
        return false;
      } finally {
        dispatch(setWishlistLoading(false));
      }
    },
    [dispatch],
  );

  const add = useCallback(
    async (product: WishlistItem) => {
      const productId = product.productId ?? product.id;
      try {
        await addToWishlistApi({product_id: productId});
        await fetchWishlist(true);
        return true;
      } catch (error) {
        toast.error(
          'Wishlist',
          getWishlistErrorMessage(error, 'Unable to add to wishlist. Please try again.'),
        );
        return false;
      }
    },
    [fetchWishlist],
  );

  const remove = useCallback(
    async (id: string) => {
      try {
        await removeFromWishlistApi(id);
        await fetchWishlist(true);
        return true;
      } catch (error) {
        toast.error(
          'Wishlist',
          getWishlistErrorMessage(error, 'Unable to remove from wishlist. Please try again.'),
        );
        return false;
      }
    },
    [fetchWishlist],
  );

  const toggle = useCallback(
    async (product: WishlistItem) => {
      const productId = product.productId ?? product.id;
      const exists = items.some(item => item.id === String(productId) || item.id === String(product.id));
      try {
        if (exists) {
          await removeFromWishlistApi(productId);
        } else {
          await addToWishlistApi({product_id: productId});
        }
        await fetchWishlist(true);
        return true;
      } catch (error) {
        toast.error(
          'Wishlist',
          getWishlistErrorMessage(error, 'Unable to update wishlist. Please try again.'),
        );
        return false;
      }
    },
    [fetchWishlist, items],
  );

  const clear = useCallback(async () => {
    try {
      await clearWishlistApi();
      dispatch(clearWishlist());
      await fetchWishlist(true);
      return true;
    } catch (error) {
      toast.error(
        'Wishlist',
        getWishlistErrorMessage(error, 'Unable to clear wishlist. Please try again.'),
      );
      return false;
    }
  }, [dispatch, fetchWishlist]);

  const isWishlisted = useCallback(
    (id: string) => items.some(item => item.id === String(id) || String(item.productId) === String(id)),
    [items],
  );

  return {items, count, add, remove, toggle, clear, isWishlisted, fetchWishlist};
};

export default useWishlist;


export default useWishlist;
