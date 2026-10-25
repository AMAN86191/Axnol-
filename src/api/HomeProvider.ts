import api from './axiosConfig';

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

export const getSliders = async (): Promise<SlidersResponse> => {
  try {
    const response = await api.get('/sliders');
    return response.data;
  } catch (error: any) {
    const data = error.response?.data ?? { message: error.message };
    throw data;
  }
};
