import api from './axiosConfig';
import {cachedRequest} from './requestCache';

export interface ApiCategory {
  id: number | string;
  title?: string;
  name?: string;
  description?: string | null;
  btn_text?: string | null;
  btn_link?: string | null;
  image_url?: string | null;
  image?: string | null;
  industry_id?: number | string | null;
  industryId?: number | string | null;
  [key: string]: any;
}

export interface CategoriesResponse {
  status: boolean;
  data: any;
}

export interface CategoriesParams {
  industryId?: string | number;
  industry_id?: string | number;
}

export const getCategories = async (
  params?: CategoriesParams,
  force = false,
): Promise<CategoriesResponse> => {
  try {
    return await cachedRequest({
      resource: '/categories',
      params,
      force,
      request: async () => (await api.get('/categories', {params})).data,
    });
  } catch (error: any) {
    const data = error.response?.data ?? { message: error.message };
    throw data;
  }
};

export const getCategoryDetails = async (
  category: string | number,
  force = false,
): Promise<CategoriesResponse> => {
  try {
    const categoryId = encodeURIComponent(String(category));
    return await cachedRequest({
      resource: `/categories/${categoryId}`,
      force,
      request: async () => (await api.get(`/categories/${categoryId}`)).data,
    });
  } catch (error: any) {
    const data = error.response?.data ?? { message: error.message };
    throw data;
  }
};
