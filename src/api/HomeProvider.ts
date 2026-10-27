import api from './axiosConfig';
import {cachedRequest} from './requestCache';

export interface Slider {
  id: number;
  title: string;
  tag_line: string;
  description: string;
  button: string;
  navigation_link: string;
  second_button: string;
  second_button_pdf_url: string | null;
  image_url: string;
}

export interface SlidersResponse {
  status: boolean;
  data: {
    sliders: Slider[];
  };
}

export const getSliders = async (
  force = false,
): Promise<SlidersResponse> => {
  try {
    return await cachedRequest({
      resource: '/sliders',
      force,
      request: async () => (await api.get('/sliders')).data,
    });
  } catch (error: any) {
    const data = error.response?.data ?? { message: error.message };
    throw data;
  }
};
