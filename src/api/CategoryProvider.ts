import api from './axiosConfig';

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
): Promise<CategoriesResponse> => {
  try {
    const response = await api.get('/categories', {params});
    return response.data;
  } catch (error: any) {
    const data = error.response?.data ?? { message: error.message };
    throw data;
  }
};

export const getCategoryDetails = async (
  category: string | number,
): Promise<CategoriesResponse> => {
  try {
    const response = await api.get(
      `/categories/${encodeURIComponent(String(category))}`,
    );
    return response.data;
  } catch (error: any) {
    const data = error.response?.data ?? { message: error.message };
    throw data;
  }
};
