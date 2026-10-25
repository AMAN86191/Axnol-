import api from './axiosConfig';

export interface ProductApi {
  id: number;
  name: string;
  description: string;
  extra_information?: string | null;
  thumbnail_url?: string | null;
  image_urls?: string[];
  technical_datasheet_url?: string | null;
  msds_url?: string | null;
  brochure_url?: string | null;
  rate_charts?: any[];
  industry_id?: number | null;
  category_id?: number | null;
  sub_category_id?: number | null;
  industry?: any;
  category?: { id: number; title?: string; name?: string };
  sub_category?: any;
}

export interface ProductsResponse {
  status: boolean;
  data: {
    products: ProductApi[];
    pagination?: any;
  };
}

export interface ProductDetailResponse {
  status: boolean;
  data: ProductApi;
}

export const getProducts = async (params?: Record<string, any>): Promise<ProductsResponse> => {
  try {
    const response = await api.get('/products', { params });
    return response.data;
  } catch (error: any) {
    const data = error.response?.data ?? { message: error.message };
    throw data;
  }
};

export const getProductById = async (productId: string | number): Promise<ProductDetailResponse> => {
  try {
    const response = await api.get(`/products/${productId}`);
    return response.data;
  } catch (error: any) {
    const data = error.response?.data ?? { message: error.message };
    throw data;
  }
};
