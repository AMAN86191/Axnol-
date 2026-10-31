import api from './axiosConfig';
import {cachedRequest, invalidateRequests} from './requestCache';

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
  subtotal?: number;
  gst_rate?: number;
  gst_amount?: number;
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

export interface OrderItemRecord {
  productId: number;
  productName: string;
  rateChartId?: string | number | null;
  size?: string;
  qty: number;
  unitPrice: number;
  lineTotal: number;
  image?: string;
}

export interface OrderRecord {
  id: string;
  orderNumber: string;
  status: string;
  paymentStatus: string;
  subtotal: number;
  gstRate: number;
  gstAmount: number;
  totalAmount: number;
  totalQty: number;
  items: OrderItemRecord[];
  createdAt?: string;
  updatedAt?: string;
  userId?: number;
  remark?: string;
  companyName?: string;
  phone?: string;
  email?: string;
  address?: string;
  city?: string;
  state?: string;
  pincode?: string;
}

const toNumber = (value: unknown): number => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
};

const toText = (value: unknown, fallback = ''): string => {
  if (value === null || value === undefined) return fallback;
  const text = String(value).trim();
  return text || fallback;
};

const getPackSizeLabel = (raw: any, product: any): string => {
  const unit = toText(
    raw?.unit ?? raw?.product_unit ?? raw?.uom ?? product?.unit,
  );
  const explicitSize = toText(
    raw?.size ??
      raw?.packSize ??
      raw?.pack_size_label ??
      product?.size ??
      product?.packSize,
  );
  const sizeValue =
    raw?.product_size ??
    raw?.productSize ??
    raw?.pack_size ??
    raw?.packSize ??
    product?.product_size ??
    product?.productSize ??
    product?.pack_size ??
    product?.packSize;

  if (sizeValue !== undefined && sizeValue !== null) {
    const sizeText = String(sizeValue).trim();
    if (sizeText) {
      if (!unit) {
        if (explicitSize && explicitSize !== sizeText) {
          return explicitSize.toLowerCase().includes(sizeText.toLowerCase())
            ? explicitSize
            : `${sizeText} ${explicitSize}`;
        }
        return explicitSize || sizeText;
      }
      return sizeText.toLowerCase().includes(unit.toLowerCase())
        ? sizeText
        : `${sizeText} ${unit}`;
    }
  }

  return explicitSize || unit;
};

const normalizeOrderItem = (raw: any): OrderItemRecord => {
  const product = raw?.product ?? raw?.product_detail ?? {};
  const qty = toNumber(raw?.qty ?? raw?.quantity) || 1;
  const unitPrice = toNumber(
    raw?.unit_price ?? raw?.unitPrice ?? raw?.price ?? product?.price,
  );
  const lineTotal =
    toNumber(raw?.line_total ?? raw?.lineTotal ?? raw?.total) ||
    unitPrice * qty;

  return {
    productId: toNumber(
      raw?.product_id ?? raw?.productId ?? product?.id,
    ),
    productName: toText(
      raw?.product_name ??
        raw?.productName ??
        raw?.name ??
        product?.name,
      'Product',
    ),
    rateChartId:
      raw?.rate_chart_id ??
      raw?.rateChartId ??
      raw?.rate_chart?.id ??
      null,
    size: getPackSizeLabel(raw, product),
    qty,
    unitPrice,
    lineTotal,
    image: toText(
      raw?.image ??
        raw?.thumbnail_url ??
        raw?.thumbnailUrl ??
        product?.thumbnail_url ??
        product?.thumbnailUrl ??
        product?.image_urls?.[0] ??
        product?.imageUrls?.[0],
      '',
    ),
  };
};

const normalizeOrder = (raw: any): OrderRecord => {
  const rawItems = raw?.items ?? raw?.order_items ?? raw?.orderItems ?? [];
  const items = Array.isArray(rawItems)
    ? rawItems.map(normalizeOrderItem)
    : [];
  const itemsQty = items.reduce((sum, item) => sum + item.qty, 0);
  const itemsTotal = items.reduce((sum, item) => sum + item.lineTotal, 0);
  const orderId = raw?.id ?? raw?.order_id ?? raw?.orderId;

  return {
    id: toText(orderId),
    orderNumber: toText(
      raw?.invoice_number ??
        raw?.invoiceNumber ??
        raw?.invoice_no ??
        raw?.orderNumber ??
        raw?.order_number ??
        raw?.order_no,
      orderId ? `#${orderId}` : 'Order',
    ),
    status: toText(raw?.status, 'pending'),
    paymentStatus: toText(
      raw?.payment_status ?? raw?.paymentStatus ?? raw?.payment,
      'unpaid',
    ),
    subtotal:
      raw?.subtotal !== undefined && raw?.subtotal !== null
        ? toNumber(raw.subtotal)
        : itemsTotal,
    gstRate: toNumber(raw?.gst_rate ?? raw?.gstRate),
    gstAmount: toNumber(raw?.gst_amount ?? raw?.gstAmount),
    totalAmount:
      toNumber(
        raw?.total_amount ??
          raw?.totalAmount ??
          raw?.total ??
          raw?.amount,
      ) || itemsTotal,
    totalQty:
      toNumber(raw?.total_qty ?? raw?.totalQty ?? raw?.qty) || itemsQty,
    items,
    createdAt: raw?.created_at ?? raw?.createdAt,
    updatedAt: raw?.updated_at ?? raw?.updatedAt,
    userId:
      raw?.user_id != null || raw?.userId != null
        ? toNumber(raw?.user_id ?? raw?.userId)
        : undefined,
    remark: toText(raw?.remark ?? raw?.message, ''),
    companyName: toText(
      raw?.company_name ?? raw?.companyName ?? raw?.company,
      '',
    ),
    phone: toText(raw?.phone, ''),
    email: toText(raw?.email, ''),
    address: toText(raw?.address, ''),
    city: toText(raw?.city, ''),
    state: toText(raw?.state, ''),
    pincode: toText(raw?.pincode, ''),
  };
};

const findOrderList = (node: any, depth = 0): any[] => {
  if (Array.isArray(node)) return node;
  if (!node || typeof node !== 'object' || depth > 5) return [];

  for (const key of ['orders', 'items', 'data', 'results']) {
    if (node[key] !== undefined) {
      const found = findOrderList(node[key], depth + 1);
      if (found.length > 0) return found;
    }
  }
  return [];
};

export const getOrders = async (force = false): Promise<OrderRecord[]> => {
  try {
    return await cachedRequest({
      resource: '/orders',
      force,
      request: async () => {
        const response = await api.get('/orders');
        return findOrderList(response.data).map(normalizeOrder);
      },
    });
  } catch (error: any) {
    const data = error.response?.data ?? { message: error.message };
    throw data;
  }
};

export const getOrderById = async (
  orderId: string | number,
  force = false,
): Promise<OrderRecord> => {
  try {
    return await cachedRequest({
      resource: `/orders/${orderId}`,
      force,
      request: async () => {
        const response = await api.get(`/orders/${orderId}`);
        console.log(
          `[Order API] GET /orders/${orderId} response:`,
          JSON.stringify(response.data, null, 2),
        );
        const payload = response.data?.data ?? response.data;
        const raw =
          payload?.order ?? payload?.data?.order ?? payload?.data ?? payload;

        if (!raw || typeof raw !== 'object') {
          throw { message: 'Order not found' };
        }
        return normalizeOrder(raw);
      },
    });
  } catch (error: any) {
    const data = error.response?.data ?? { message: error.message };
    throw data;
  }
};

export const confirmOrder = async (
  payload: ConfirmOrderPayload,
): Promise<ConfirmOrderResponse> => {
  try {
    const response = await api.post('/orders/confirm', payload);
    console.log(
      '[Order API] POST /orders/confirm response:',
      JSON.stringify(response.data, null, 2),
    );
    invalidateRequests('/orders');
    // Placing an order empties the server-side cart.
    invalidateRequests('/cart');
    return response.data;
  } catch (error: any) {
    const data = error.response?.data ?? { message: error.message };
    throw data;
  }
};
