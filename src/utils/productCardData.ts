import {ProductCardData} from '../components/ui/ProductCard';

export const getRateChartId = (
  rateChart: any,
): string | number | undefined => {
  const id =
    rateChart?.rate_chart_id ??
    rateChart?.rateChartId ??
    rateChart?.rate_chart?.id ??
    rateChart?.id;
  if (id === undefined || id === null) {
    return undefined;
  }
  if (typeof id === 'number') {
    return id;
  }
  const value = String(id).trim();
  return value || undefined;
};

export const getProductPrice = (product: any): number => {
  const rateCharts = product?.rate_charts;
  if (Array.isArray(rateCharts) && rateCharts.length > 0) {
    const first = rateCharts[0];
    const price =
      first?.price ??
      first?.rate ??
      first?.amount ??
      first?.selling_price ??
      first?.dealer_price ??
      first?.mrp_price ??
      first?.mrp ??
      first?.list_price ??
      0;
    return Number(price) || 0;
  }
  return Number(product?.price ?? product?.selling_price ?? 0) || 0;
};

export const getProductUnitAndQty = (
  product: any,
): {unit: string; qty?: number | string} => {
  const rateCharts = product?.rate_charts;
  if (Array.isArray(rateCharts) && rateCharts.length > 0) {
    const first = rateCharts[0];
    const unit =
      first?.unit ??
      first?.pack_size_unit ??
      first?.packing_unit ??
      first?.uom ??
      first?.unit_name ??
      product?.unit;
    const qty =
      first?.qty ??
      first?.quantity ??
      first?.pack_size ??
      first?.pack_qty ??
      first?.min_qty ??
      product?.qty ??
      product?.quantity;
    return {
      unit: unit ? String(unit).trim() : 'Unit',
      qty: qty !== undefined && qty !== null && qty !== '' ? qty : undefined,
    };
  }
  return {
    unit: product?.unit ? String(product.unit).trim() : 'Unit',
    qty: product?.qty ?? product?.quantity,
  };
};

export const getProductSize = (product: any): string | undefined => {
  const rateCharts = product?.rate_charts;
  if (Array.isArray(rateCharts) && rateCharts.length > 0) {
    const first = rateCharts[0];
    const explicitSize = first?.size ?? first?.packSize;
    if (
      explicitSize !== undefined &&
      explicitSize !== null &&
      String(explicitSize).trim()
    ) {
      return String(explicitSize).trim();
    }
    if (first?.unit !== undefined && first?.unit !== null && String(first.unit).trim()) {
      return String(first.unit).trim();
    }
    return undefined;
  }
  const directSize = product?.size;
  if (
    directSize !== undefined &&
    directSize !== null &&
    String(directSize).trim()
  ) {
    return String(directSize).trim();
  }
  return undefined;
};

export const toProductCardData = (
  product: any,
  fallbackId?: string | number,
): ProductCardData & {code: string; image: string} => {
  const price = getProductPrice(product);
  const {unit, qty} = getProductUnitAndQty(product);
  const firstRateChart = Array.isArray(product?.rate_charts)
    ? product.rate_charts[0]
    : null;
  return {
    id: String(product?.id ?? fallbackId ?? ''),
    name: product?.name ?? '',
    code:
      product?.category?.title ??
      product?.category?.name ??
      product?.sub_category?.title ??
      product?.sub_category?.name ??
      '',
    image:
      product?.thumbnail_url ??
      product?.image_urls?.[0] ??
      'product_generic',
    price,
    mrp: price > 0 ? Math.round(price * 1.1) : 0,
    unit,
    qty,
    size: getProductSize(product),
    rateChartId: getRateChartId(firstRateChart),
  };
};
