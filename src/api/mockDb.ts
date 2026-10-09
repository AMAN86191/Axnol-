import {
  banners,
  categories,
  companyInfo,
  demoUsers,
  documents,
  industries,
  products,
  seedInvoices,
  seedOrders,
  subCategories,
} from './mockData';
import {
  AppNotification,
  Enquiry,
  Invoice,
  Order,
  PricingRequest,
  Product,
  SafeUser,
  User,
} from './types';

const DAY = 24 * 60 * 60 * 1000;

const toSafeUser = (user: User): SafeUser => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const {password: _p, ...safe} = user as any;
  return safe as SafeUser;
};

let idCounter = 1000;
const nextId = (prefix: string): string => `${prefix}-${++idCounter}`;

const mockDb = {
  companyInfo,
  banners,
  industries,
  categories,
  subCategories,
  documents,
  products: [...products] as Product[],
  users: [...demoUsers] as User[],
  pricingRequests: [
    {
      id: 'pr1',
      userId: 'u-demo',
      productId: 'p30',
      productName: 'AXNOL FOOD GRADE OIL H1 68',
      productImage: 'product_food',
      quantity: 50,
      unit: 'Litre',
      targetPrice: 2050,
      message:
        'Monthly requirement for our bottling line. Please share your best dealer price.',
      status: 'approved',
      adminRemark: 'Approved at special project price.',
      approvedPrice: 2100,
      createdAt: Date.now() - 12 * DAY,
    },
    {
      id: 'pr2',
      userId: 'u-demo',
      productId: 'p25',
      productName: 'AXNOL CUTAX SOLUBLE OIL',
      productImage: 'product_cutting',
      quantity: 200,
      unit: 'Litre',
      message: 'Need bulk rate for CNC workshop, delivery to Jaipur.',
      status: 'pending',
      createdAt: Date.now() - 2 * DAY,
    },
    {
      id: 'pr3',
      userId: 'u-demo',
      productId: 'p2',
      productName: 'MOTORAX LONG LIFE 20W40',
      productImage: 'product_oil',
      quantity: 30,
      unit: 'Litre',
      targetPrice: 1350,
      message: 'Target price for quarterly purchase.',
      status: 'rejected',
      adminRemark:
        'Requested price below dealer slab. Counter offer sent on call.',
      createdAt: Date.now() - 20 * DAY,
    },
  ] as PricingRequest[],
  orders: [...seedOrders] as Order[],
  invoices: [...seedInvoices] as Invoice[],
  enquiries: [
    {
      id: 'en1',
      type: 'contact',
      userId: 'u-demo',
      name: 'Rahul Sharma',
      email: 'demo@axnol.in',
      phone: '9876543210',
      subject: 'Regional dealership enquiry',
      message: 'We are interested in becoming a dealer for Rajasthan region.',
      status: 'in-progress',
      createdAt: Date.now() - 6 * DAY,
    },
  ] as Enquiry[],
  notifications: [
    {
      id: 'n1',
      title: 'Order Dispatched',
      body: 'Order AX/2026/1067 has been dispatched and is in transit.',
      type: 'order',
      read: false,
      createdAt: Date.now() - 5 * DAY,
    },
    {
      id: 'n2',
      title: 'Pricing Request Approved',
      body: 'Your pricing request for AXNOL FOOD GRADE OIL H1 68 has been approved at ₹2,100/L.',
      type: 'pricing',
      read: false,
      createdAt: Date.now() - 11 * DAY,
    },
    {
      id: 'n3',
      title: 'Invoice Generated',
      body: 'Invoice AX/INV/2026/0451 for order AX/2026/1067 is now available.',
      type: 'invoice',
      read: true,
      createdAt: Date.now() - 8 * DAY,
    },
  ] as AppNotification[],
  tokens: new Map<string, string>(),
  otps: new Map<string, string>(),
};

export type MockDb = typeof mockDb;

export const db = mockDb;

export const delay = (ms: number = 350 + Math.random() * 250): Promise<void> =>
  new Promise(resolve => setTimeout(resolve, ms));

export const apiError = (status: number, message: string): never => {
  throw {status, data: {message}};
};

export const sanitizeUser = toSafeUser;

export const findUserById = (id: string): User | undefined =>
  db.users.find(u => u.id === id);

export const findUserByToken = (token?: string | null): User | undefined => {
  if (!token) {
    return undefined;
  }
  const userId = db.tokens.get(token);
  return userId ? findUserById(userId) : undefined;
};

export const createToken = (userId: string): string => {
  const token = `axnol_${userId}_${Date.now().toString(36)}`;
  db.tokens.set(token, userId);
  return token;
};

export const revokeToken = (token: string): void => {
  db.tokens.delete(token);
};

export const generateId = nextId;

export const addNotification = (
  n: Omit<AppNotification, 'id' | 'read' | 'createdAt'>,
): AppNotification => {
  const notification: AppNotification = {
    ...n,
    id: nextId('n'),
    read: false,
    createdAt: Date.now(),
  };
  db.notifications.unshift(notification);
  return notification;
};

export const ensureDemoOrdersExist = (): void => {};

export const resetDemoData = (): void => {};
