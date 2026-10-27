import { OrderRecord } from '../../api/OrderProvider';

export const statusKey = (status?: string): string => {
  const key = String(status ?? '').trim().toLowerCase();
  return key === 'canceled' ? 'cancelled' : key;
};

export const formatStatusLabel = (status?: string): string => {
  const key = statusKey(status).replace(/[_-]+/g, ' ');
  if (!key) return 'Unknown';
  return key.replace(/\b\w/g, char => char.toUpperCase());
};

const STATUS_STYLES: Record<
  string,
  { bg: string; text: string; dot: string }
> = {
  pending: { bg: '#FEF3C7', text: '#D97706', dot: '#F59E0B' },
  placed: { bg: '#DBEAFE', text: '#2563EB', dot: '#3B82F6' },
  unpaid: { bg: '#FEE2E2', text: '#DC2626', dot: '#EF4444' },
  processing: { bg: '#DBEAFE', text: '#2563EB', dot: '#3B82F6' },
  confirmed: { bg: '#E0E7FF', text: '#4F46E5', dot: '#6366F1' },
  dispatched: { bg: '#E0E7FF', text: '#4F46E5', dot: '#6366F1' },
  shipped: { bg: '#E0E7FF', text: '#4F46E5', dot: '#6366F1' },
  delivered: { bg: '#DCFCE7', text: '#16A34A', dot: '#22C55E' },
  completed: { bg: '#DCFCE7', text: '#16A34A', dot: '#22C55E' },
  paid: { bg: '#DCFCE7', text: '#16A34A', dot: '#22C55E' },
  canceled: { bg: '#FEE2E2', text: '#DC2626', dot: '#EF4444' },
  cancelled: { bg: '#FEE2E2', text: '#DC2626', dot: '#EF4444' },
};

export const getStatusBadgeStyle = (status?: string) =>
  STATUS_STYLES[statusKey(status)] ?? {
    bg: '#F1F5F9',
    text: '#64748B',
    dot: '#94A3B8',
  };

const parseDate = (value?: string): Date | null => {
  if (!value) return null;
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
};

export const formatOrderDate = (value?: string): string => {
  const date = parseDate(value);
  if (!date) return value || '-';
  return date.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
};

export const formatOrderDateTime = (value?: string): string => {
  const date = parseDate(value);
  if (!date) return value || '-';
  return date.toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const getOrderItemsTotal = (order: OrderRecord): number =>
  order.items.reduce(
    (sum, item) => sum + (item.lineTotal || item.unitPrice * item.qty),
    0,
  );

export const getOrderQty = (order: OrderRecord): number =>
  order.totalQty ||
  order.items.reduce((sum, item) => sum + item.qty, 0);

export const getOrderProductLabel = (order: OrderRecord): string => {
  const first = order.items[0]?.productName;
  if (!first) return 'Order Items';
  if (order.items.length === 1) return first;
  return `${first} +${order.items.length - 1} more`;
};

export const getOrderImage = (order: OrderRecord): string =>
  order.items.find(item => !!item.image)?.image || 'product_generic';

export const getOrderAddress = (order: OrderRecord): string =>
  [order.address, order.city, order.state, order.pincode]
    .filter(Boolean)
    .join(', ');

export const getOrderErrorMessage = (error: any): string => {
  if (typeof error === 'string') return error;
  const message = error?.message;
  if (typeof message === 'string' && message.trim()) return message;
  return 'Unable to load orders. Please try again.';
};
