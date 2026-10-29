import api from './axiosConfig';
import {cachedRequest, invalidateRequests} from './requestCache';

export interface WishlistItemApi {
  id: number;
  product_id: number;
  product?: any;
  name?: string;
  image?: string;
  thumbnail_url?: string;
  price?: string | number | null;
  mrp?: string | number | null;
  unit?: string | null;
  code?: string | null;
}

export interface WishlistResponse {
  status: boolean;
  data: WishlistItemApi[] | any;
}

export const getWishlist = async (force = false): Promise<WishlistResponse> => {
  try {
    const res = await cachedRequest({
      resource: '/wishlist',
      force,
      request: async () => (await api.get('/wishlist')).data,
    });
    console.log('[Wishlist API] GET /wishlist response:', JSON.stringify(res, null, 2));
    return res;
  } catch (error: any) {
    console.log('[Wishlist API] GET /wishlist error:', error?.response?.data ?? error);
    const data = error.response?.data ?? {message: error.message};
    throw data;
  }
};

export const addToWishlistApi = async (payload: {
  product_id: number | string;
}): Promise<any> => {
  try {
    console.log('[Wishlist API] POST /wishlist payload:', JSON.stringify(payload, null, 2));
    const response = await api.post('/wishlist', payload);
    console.log('[Wishlist API] POST /wishlist response:', JSON.stringify(response.data, null, 2));
    invalidateRequests('/wishlist');
    return response.data;
  } catch (error: any) {
    console.log('[Wishlist API] POST /wishlist error:', error?.response?.data ?? error);
    const data = error.response?.data ?? {message: error.message};
    throw data;
  }
};

export const removeFromWishlistApi = async (
  productId: number | string,
): Promise<any> => {
  try {
    console.log('[Wishlist API] DELETE /wishlist/' + productId);
    const response = await api.delete(`/wishlist/${productId}`);
    console.log('[Wishlist API] DELETE /wishlist/' + productId + ' response:', JSON.stringify(response.data, null, 2));
    invalidateRequests('/wishlist');
    return response.data;
  } catch (error: any) {
    console.log('[Wishlist API] DELETE /wishlist/' + productId + ' error:', error?.response?.data ?? error);
    const data = error.response?.data ?? {message: error.message};
    throw data;
  }
};

export const clearWishlistApi = async (): Promise<any> => {
  try {
    console.log('[Wishlist API] DELETE /wishlist');
    const response = await api.delete('/wishlist');
    console.log('[Wishlist API] DELETE /wishlist response:', JSON.stringify(response.data, null, 2));
    invalidateRequests('/wishlist');
    return response.data;
  } catch (error: any) {
    console.log('[Wishlist API] DELETE /wishlist error:', error?.response?.data ?? error);
    const data = error.response?.data ?? {message: error.message};
    throw data;
  }
};
