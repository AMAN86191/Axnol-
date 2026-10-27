import api from './axiosConfig';
import {cachedRequest} from './requestCache';

export interface ProductApi {
  id: number;
  name: string;
  description: string;
  extra_information?: string | null;
  thumbnail_url?: string | null;
  image_urls?: string[];
  technical_datasheet_url?: string | null;
  technical_datasheet_name?: string | null;
  msds_url?: string | null;
  msds_name?: string | null;
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

const PRODUCT_FILTER_ALIASES: Record<string, string> = {
  industryId: 'industry_id',
  categoryId: 'category_id',
  subCategoryId: 'sub_category_id',
};

const toProductApiParams = (params?: Record<string, any>) => {
  const apiParams: Record<string, any> = {...(params ?? {})};
  Object.entries(PRODUCT_FILTER_ALIASES).forEach(([camelKey, snakeKey]) => {
    const value = apiParams[camelKey];
    if (value !== undefined && value !== null && value !== '') {
      apiParams[snakeKey] = value;
    }
    delete apiParams[camelKey];
  });
  return apiParams;
};

export const getProducts = async (
  params?: Record<string, any>,
  force = false,
): Promise<ProductsResponse> => {
  try {
    const apiParams = toProductApiParams(params);
    return await cachedRequest({
      resource: '/products',
      params: apiParams,
      ttl: 2 * 60_000,
      force,
      request: async () => (await api.get('/products', {params: apiParams})).data,
    });
  } catch (error: any) {
    const data = error.response?.data ?? { message: error.message };
    throw data;
  }
};

export const getProductById = async (
  productId: string | number,
  force = false,
): Promise<ProductDetailResponse> => {
  try {
    return await cachedRequest({
      resource: `/products/${productId}`,
      ttl: 5 * 60_000,
      force,
      request: async () => (await api.get(`/products/${productId}`)).data,
    });
  } catch (error: any) {
    const data = error.response?.data ?? { message: error.message };
    throw data;
  }
};
