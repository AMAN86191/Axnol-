import api from '../api/axiosConfig';

export interface CartItemApi {
  id: number;
  product_id: number;
  rate_chart_id?: number | string | null;
  size?: string | null;
  qty: number;
  product?: any;
  unit?: string | null;
  price?: string | number | null;
  mrp?: string | number | null;
  name?: string | null;
  image?: string | null;
  thumbnail_url?: string | null;
}

export interface CartResponse {
  status: boolean;
  data: CartItemApi[] | any;
}

export const getCart = async (): Promise<CartResponse> => {
  try {
    const response = await api.get('/cart');
    return response.data;
  } catch (error: any) {
    const data = error.response?.data ?? { message: error.message };
    throw data;
  }
};

export const addToCartApi = async (payload: {
  product_id: number | string;
rate_chart_id?: number | string;
  size?: string;
  qty?: number;
}): Promise<any> => {
  try {
    const response = await api.post('/cart', payload);
    return response.data;
  } catch (error: any) {
    const data = error.response?.data ?? { message: error.message };
    throw data;
  }
};

export const updateCartItemApi = async (
  cartItemId: number | string,
  payload: { qty: number },
): Promise<any> => {
  try {
    const response = await api.put(`/cart/${cartItemId}`, payload);
    return response.data;
  } catch (error: any) {
    const data = error.response?.data ?? { message: error.message };
    throw data;
  }
};

export const removeCartItemApi = async (cartItemId: number | string): Promise<any> => {
  try {
    const response = await api.delete(`/cart/${cartItemId}`);
    return response.data;
  } catch (error: any) {
    const data = error.response?.data ?? { message: error.message };
    throw data;
  }
};

export const clearCartApi = async (): Promise<any> => {
  try {
    const response = await api.delete('/cart');
    return response.data;
  } catch (error: any) {
    const data = error.response?.data ?? { message: error.message };
    throw data;
  }
};
