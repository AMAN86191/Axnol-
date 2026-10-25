import api from './axiosConfig';

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

export const getIndustries = async (): Promise<IndustriesResponse> => {
  try {
    const response = await api.get('/industries');
    return response.data;
  } catch (error: any) {
    const data = error.response?.data ?? { message: error.message };
    throw data;
  }
};

export const getIndustryDetails = async (
  industryId: string | number,
): Promise<IndustryDetailsResponse> => {
  try {
    const response = await api.get(`/industries/${industryId}`);
    return response.data;
  } catch (error: any) {
    const data = error.response?.data ?? { message: error.message };
    throw data;
  }
};
