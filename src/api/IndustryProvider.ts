import api from './axiosConfig';
import {cachedRequest} from './requestCache';

export interface Industry {
  id: number;
  title: string;
  description: string | null;
  btn_text: string | null;
  btn_link: string | null;
  image_url: string | null;
}

export interface IndustryDetails extends Industry {
  categories?: any[];
}

export interface IndustriesResponse {
  status: boolean;
  data: {
    industries: Industry[];
  };
}

export interface IndustryDetailsResponse {
  status: boolean;
  data: IndustryDetails;
}

export const getIndustries = async (
  force = false,
): Promise<IndustriesResponse> => {
  try {
    return await cachedRequest({
      resource: '/industries',
      force,
      request: async () => (await api.get('/industries')).data,
    });
  } catch (error: any) {
    const data = error.response?.data ?? { message: error.message };
    throw data;
  }
};

export const getIndustryDetails = async (
  industryId: string | number,
  force = false,
): Promise<IndustryDetailsResponse> => {
  try {
    return await cachedRequest({
      resource: `/industries/${industryId}`,
      force,
      request: async () => (await api.get(`/industries/${industryId}`)).data,
    });
  } catch (error: any) {
    const data = error.response?.data ?? { message: error.message };
    throw data;
  }
};
