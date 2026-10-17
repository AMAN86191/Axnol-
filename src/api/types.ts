export type AccountStatus = 'pending' | 'active' | 'inactive';

export type UserRole = 'dealer' | 'customer';

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  password: string;
  company: string;
  designation: string;
  role: UserRole;
  address: string;
  city: string;
  state: string;
  pincode: string;
  gstin: string;
  avatar?: string;
  status: AccountStatus;
  profileCompleted: boolean;
  registeredAt: number;
  approvedAt?: number;
}

export type SafeUser = Omit<User, 'password'>;

export interface Industry {
  id: string;
  name: string;
  image: string;
  description: string;
}

export interface Category {
  id: string;
  name: string;
  industryId: string;
  image: string;
}

export interface SubCategory {
  id: string;
  categoryId: string;
  name: string;
}

export interface ProductSpec {
  label: string;
  value: string;
}

export interface Product {
  id: string;
  name: string;
  categoryId: string;
  subCategoryId?: string;
  description: string;
  brand: string;
  price: number;
  dealerPrice?: number;
  images: string[];
  specs: ProductSpec[];
  packSizes: string[];
  tdsUrl?: string;
  featured: boolean;
  status: 'active' | 'inactive';
  createdAt: number;
}

export type PricingStatus = 'pending' | 'approved' | 'rejected';

export interface PricingRequest {
  id: string;
  userId: string;
  productId: string;
  productName: string;
  productImage: string;
  quantity: number;
  unit: string;
  targetPrice?: number;
  message: string;
  status: PricingStatus;
  adminRemark?: string;
  approvedPrice?: number;
  createdAt: number;
}

export type OrderStatus =
  | 'placed'
  | 'confirmed'
  | 'dispatched'
  | 'delivered'
  | 'cancelled';

export interface OrderItem {
  productId: string;
  name: string;
  image: string;
  quantity: number;
  unitPrice: number;
}

export interface OrderTimelineEntry {
  status: OrderStatus;
  label: string;
  date: number;
  note: string;
}

export interface Order {
  id: string;
  orderNo: string;
  userId: string;
  items: OrderItem[];
  status: OrderStatus;
  subtotal: number;
  tax: number;
  total: number;
  shippingAddress: string;
  timeline: OrderTimelineEntry[];
  createdAt: number;
}

export interface Invoice {
  id: string;
  invoiceNo: string;
  orderId: string;
  orderNo: string;
  userId: string;
  buyer: {
    name: string;
    company: string;
    address: string;
    gstin: string;
  };
  items: OrderItem[];
  subtotal: number;
  tax: number;
  total: number;
  status: 'paid' | 'unpaid';
  date: number;
  dueDate: number;
}

export type EnquiryType = 'product' | 'contact';
export type EnquiryStatus = 'new' | 'in-progress' | 'resolved';

export interface Enquiry {
  id: string;
  type: EnquiryType;
  userId?: string;
  name: string;
  email: string;
  phone: string;
  productId?: string;
  productName?: string;
  subject: string;
  message: string;
  status: EnquiryStatus;
  createdAt: number;
}

export interface AppNotification {
  id: string;
  title: string;
  body: string;
  type: 'account' | 'pricing' | 'order' | 'invoice' | 'general';
  read: boolean;
  createdAt: number;
}

export interface DocumentItem {
  id: string;
  title: string;
  category: string;
  url: string;
}

export interface Banner {
  id: string;
  image: string;
  title: string;
  subtitle: string;
}

export interface CompanyStat {
  label: string;
  value: string;
}

export interface CompanyInfo {
  name: string;
  tagline: string;
  since: string;
  description: string;
  phone: string;
  email: string;
  website: string;
  registeredOffice: string;
  factory: string;
  stats: CompanyStat[];
}

export interface HomeData {
  banners: Banner[];
  industries: Industry[];
  featuredProducts: Product[];
  stats: CompanyStat[];
}

export interface AuthResponse {
  token: string;
  user: SafeUser;
}

export interface ApiError {
  status: number;
  data: {message: string};
}
