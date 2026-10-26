import api from './axiosConfig';

export interface ConfirmOrderItem {
  product_id: number;
  rate_chart_id: number;
  qty: number;
}

export interface ConfirmOrderPayload {
  items: ConfirmOrderItem[];
  address: string;
  city: string;
  state: string;
  pincode: string;
  company_name: string;
  phone: string;
  remark?: string;
}

export interface ConfirmedOrderItem {
  product_id: number;
  product_name: string;
  rate_chart_id: number;
  size: string;
  qty: number;
  unit_price: number;
  line_total: number;
}

export interface ConfirmedOrder {
  id: number;
  invoice_number: string;
  status: string;
  payment_status: string;
  total_amount: number;
  total_qty: number;
  items: ConfirmedOrderItem[];
  created_at?: string;
  user_id?: number;
  remark?: string;
  company_name?: string;
  phone?: string;
  email?: string;
  address?: string;
  city?: string;
  state?: string;
  pincode?: string;
  updated_at?: string;
}

export interface ConfirmOrderResponse {
  status?: boolean;
  message?: string;
  data?: {
    order?: ConfirmedOrder;
  };
}

export const confirmOrder = async (
  payload: ConfirmOrderPayload,
): Promise<ConfirmOrderResponse> => {
  try {
    const response = await api.post('/orders/confirm', payload);
    return response.data;
  } catch (error: any) {
    const data = error.response?.data ?? { message: error.message };
    throw data;
  }
};
