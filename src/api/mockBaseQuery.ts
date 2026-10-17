import type {BaseQueryFn} from '@reduxjs/toolkit/query';
import {
  db,
  delay,
  apiError,
  findUserByToken,
  createToken,
  revokeToken,
  sanitizeUser,
  generateId,
  addNotification,
} from './mockDb';
import {
  Enquiry,
  Invoice,
  Order,
  OrderTimelineEntry,
  PricingRequest,
  User,
} from './types';

export interface MockRequest {
  url: string;
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  body?: any;
  params?: Record<string, string | number | undefined>;
}

interface RouteContext {
  params: Record<string, string>;
  query: Record<string, string>;
  body: any;
  user?: User;
}

type RouteHandler = (ctx: RouteContext) => Promise<any>;

interface Route {
  method: NonNullable<MockRequest['method']>;
  segments: string[];
  handler: RouteHandler;
}

const REGISTER_APPROVAL_DELAY = 12000;
const PRICING_APPROVAL_DELAY = 25000;
const ORDER_STEP_DELAYS = [0, 30000, 90000, 240000];
const ORDER_STEPS: Order['status'][] = [
  'placed',
  'confirmed',
  'dispatched',
  'delivered',
];
const GST_RATE = 0.18;

const requireUser = (ctx: RouteContext): User => {
  if (!ctx.user as any) {
    apiError(401, 'Session expired. Please login again.');
  }
  return ctx.user as any;
};

const maybeApproveUser = (user: User): void => {
  if (
    (user as any).status === 'pending' &&
    user.registeredAt + REGISTER_APPROVAL_DELAY <= Date.now()
  ) {
    (user as any).status = 'active';
    user.approvedAt = Date.now();
    addNotification({
      title: 'Account Approved',
      body: `Welcome ${user.name}! Your Axnol account has been approved. You can now request pricing, place orders and access invoices.`,
      type: 'account',
    });
  }
};

const maybeAdvanceOrder = (order: Order): void => {
  const currentIndex = ORDER_STEPS.indexOf((order as any).status);
  if (currentIndex < 0 || (order as any).status === 'cancelled') {
    return;
  }
  const elapsed = Date.now() - (order as any).createdAt;
  let targetIndex = 0;
  ORDER_STEP_DELAYS.forEach((d, i) => {
    if (elapsed >= d) {
      targetIndex = i;
    }
  });
  const labels: Record<string, string> = {
    confirmed: 'Order Confirmed',
    dispatched: 'Dispatched',
    delivered: 'Delivered',
  };
  const notes: Record<string, string> = {
    confirmed: 'Stock allocated and order confirmed by Axnol.',
    dispatched: 'Order shipped from Jaipur depot, in transit.',
    delivered: 'Order delivered and signed for.',
  };
  while (
    currentIndex + 1 <= targetIndex &&
    (order as any).status !== 'delivered'
  ) {
    const nextStep = ORDER_STEPS[
      ORDER_STEPS.indexOf((order as any).status) + 1
    ] as Order['status'];
    if (!nextStep) {
      break;
    }
    (order as any).status = nextStep;
    const entry: OrderTimelineEntry = {
      status: nextStep,
      label: labels[nextStep],
      date: Date.now(),
      note: notes[nextStep],
    };
    (order as any).timeline.push(entry);
    addNotification({
      title: labels[nextStep],
      body: `Order ${(order as any).orderNo} — ${notes[nextStep]}`,
      type: nextStep === 'delivered' ? 'order' : 'order',
    });
    if (nextStep === 'confirmed') {
      ensureInvoice(order as any);
    }
  }
};

const ensureInvoice = (order: Order): Invoice => {
  const existing = db.invoices.find(inv => inv.orderId === order.id);
  if (existing) {
    return existing;
  }
  const user = db.users.find(u => u.id === order.userId);
  const seq = String(db.invoices.length + 452).padStart(4, '0');
  const invoice: Invoice = {
    id: generateId('inv'),
    invoiceNo: `AX/INV/2026/${seq}`,
    orderId: order.id,
    orderNo: (order as any).orderNo,
    userId: order.userId,
    buyer: {
      name: user?.name ?? 'Customer',
      company: user?.company ?? '',
      address: user
        ? `${user.address}, ${user.city}, ${user.state} - ${user.pincode}`
        : '',
      gstin: user?.gstin ?? '',
    },
    items: order.items,
    subtotal: order.subtotal,
    tax: order.tax,
    total: order.total,
    status: 'unpaid',
    date: Date.now(),
    dueDate: Date.now() + 15 * 24 * 60 * 60 * 1000,
  };
  db.invoices.unshift(invoice);
  addNotification({
    title: 'Invoice Generated',
    body: `Invoice ${invoice.invoiceNo} for order ${
      (order as any).orderNo
    } is now available.`,
    type: 'invoice',
  });
  return invoice;
};

const maybeApprovePricing = (request: PricingRequest): void => {
  if ((request as any).status !== 'pending') {
    return;
  }
  if ((request as any).createdAt + PRICING_APPROVAL_DELAY > Date.now()) {
    return;
  }
  const product = db.products.find(p => p.id === request.productId);
  (request as any).status = 'approved';
  (request as any).approvedPrice =
    (request as any).targetPrice ??
    Math.round((product?.dealerPrice ?? product?.price ?? 0) * 0.95);
  request.adminRemark =
    'Approved by Axnol sales team at special dealer pricing.';
  addNotification({
    title: 'Pricing Request Approved',
    body: `Your request for ${request.productName} has been approved at ₹${(
      request as any
    ).approvedPrice.toLocaleString('en-IN')}.`,
    type: 'pricing',
  });
};

const productWithMeta = (product: any) => {
  const category = db.categories.find(c => c.id === product.categoryId);
  const subCategory = db.subCategories.find(
    s => s.id === product.subCategoryId,
  );
  const industry = db.industries.find(i => i.id === category?.industryId);
  return {
    ...product,
    categoryName: category?.name ?? '',
    subCategoryName: subCategory?.name,
    industryId: category?.industryId,
    industryName: industry?.name,
  };
};

const nextOrderNo = (): string => `AX/2026/${1100 + db.orders.length}`;

const routes: Route[] = [
  {
    method: 'POST',
    segments: ['auth', 'register'],
    handler: async ({body}) => {
      await delay();
      if (!body?.name || !body?.email || !body?.phone || !body?.password) {
        apiError(422, 'Name, email, phone and password are required.');
      }
      const exists = db.users.find(
        u => u.email.toLowerCase() === String(body.email).toLowerCase(),
      );
      if (exists) {
        apiError(409, 'An account with this email already exists.');
      }
      const user: User = {
        id: generateId('u'),
        name: body.name,
        email: body.email,
        phone: body.phone,
        password: body.password,
        company: body.company ?? '',
        designation: body.designation ?? '',
        role: body.role === 'customer' ? 'customer' : 'dealer',
        address: body.address ?? '',
        city: body.city ?? '',
        state: body.state ?? '',
        pincode: body.pincode ?? '',
        gstin: body.gstin ?? '',
        status: 'pending',
        profileCompleted: false,
        registeredAt: Date.now(),
      };
      db.users.push(user as any);
      const otp = String(Math.floor(100000 + Math.random() * 900000));
      db.otps.set((user as any).id, otp);
      return {
        data: {
          message: 'OTP sent to your email & phone.',
          userId: (user as any).id,
          demoOtp: otp,
        },
      };
    },
  },
  {
    method: 'POST',
    segments: ['auth', 'verify-otp'],
    handler: async ({body}) => {
      await delay();
      const user = db.users.find(u => u.id === body?.userId);
      if (!user as any) {
        apiError(404, 'Account not found. Please register again.');
      }
      const otp = db.otps.get((user as any).id);
      if (!otp || otp !== String(body?.otp)) {
        apiError(400, 'Invalid OTP. Please try again.');
      }
      db.otps.delete((user as any).id);
      maybeApproveUser(user as any);
      const token = createToken((user as any).id);
      return {data: {token, user: sanitizeUser(user as any)}};
    },
  },
  {
    method: 'POST',
    segments: ['auth', 'resend-otp'],
    handler: async ({body}) => {
      await delay();
      const user = db.users.find(u => u.id === body?.userId) as any;
      if (!user as any) {
        apiError(404, 'Account not found.');
      }
      const otp = String(Math.floor(100000 + Math.random() * 900000));
      db.otps.set((user as any).id, otp);
      return {data: {message: 'OTP resent successfully.', demoOtp: otp}};
    },
  },
  {
    method: 'POST',
    segments: ['auth', 'login'],
    handler: async ({body}) => {
      await delay(500);
      const email = String(body?.email ?? '').toLowerCase();
      const user = db.users.find(u => u.email.toLowerCase() === email);
      if (!user || user.password !== body?.password) {
        apiError(401, 'Invalid email or password.');
      }
      maybeApproveUser(user as any);
      if ((user as any).status === 'inactive') {
        apiError(
          403,
          'Your account has been deactivated. Please contact Axnol support.',
        );
      }
      const token = createToken((user as any).id);
      return {data: {token, user: sanitizeUser(user as any)}};
    },
  },
  {
    method: 'POST',
    segments: ['auth', 'forgot-password'],
    handler: async ({body}) => {
      await delay();
      const email = String(body?.email ?? '').toLowerCase();
      const user = db.users.find(u => u.email.toLowerCase() === email);
      if (!user as any) {
        apiError(404, 'No account found with this email.');
      }
      const otp = String(Math.floor(100000 + Math.random() * 900000));
      db.otps.set((user as any).id, otp);
      return {
        data: {
          message: 'OTP sent to your email & phone.',
          userId: (user as any).id,
          demoOtp: otp,
        },
      };
    },
  },
  {
    method: 'POST',
    segments: ['auth', 'reset-password'],
    handler: async ({body}) => {
      await delay();
      const user = db.users.find(u => u.id === body?.userId);
      if (!user as any) {
        apiError(404, 'Account not found. Please register again.');
      }
      if (!body?.password || String(body.password).length < 8) {
        apiError(400, 'Password must be at least 8 characters.');
      }
      (user as any).password = String(body.password);
      return {
        data: {
          message: 'Password reset successfully. Please login with your new password.',
        },
      };
    },
  },
  {
    method: 'GET',
    segments: ['auth', 'me'],
    handler: async ({user}) => {
      await delay(250);
      const current =
        user ?? apiError(401, 'Session expired. Please login again.');
      maybeApproveUser(current);
      return {data: sanitizeUser(current)};
    },
  },
  {
    method: 'POST',
    segments: ['auth', 'logout'],
    handler: async () => {
      await delay(150);
      return {data: {message: 'Logged out.'}};
    },
  },
  {
    method: 'GET',
    segments: ['home'],
    handler: async () => {
      await delay();
      return {
        data: {
          banners: db.banners,
          industries: db.industries.slice(0, 8),
          featuredProducts: db.products
            .filter(p => p.featured)
            .map(productWithMeta),
          stats: db.companyInfo.stats,
        },
      };
    },
  },
  {
    method: 'GET',
    segments: ['company'],
    handler: async () => {
      await delay(200);
      return {data: db.companyInfo};
    },
  },
  {
    method: 'GET',
    segments: ['industries'],
    handler: async () => {
      await delay();
      return {data: db.industries};
    },
  },
  {
    method: 'GET',
    segments: ['categories'],
    handler: async ({query}) => {
      await delay(250);
      let data = db.categories;
      if (query.industryId) {
        data = data.filter(c => c.industryId === query.industryId);
      }
      return {data};
    },
  },
  {
    method: 'GET',
    segments: ['subcategories'],
    handler: async ({query}) => {
      await delay(200);
      let data = db.subCategories;
      if (query.categoryId) {
        data = data.filter(s => s.categoryId === query.categoryId);
      }
      return {data};
    },
  },
  {
    method: 'GET',
    segments: ['products'],
    handler: async ({query}) => {
      await delay();
      let data = [...db.products].map(productWithMeta);
      if (query.industryId) {
        const catIds = db.categories
          .filter(c => c.industryId === query.industryId)
          .map(c => c.id);
        data = data.filter(p => catIds.includes(p.categoryId));
      }
      if (query.categoryId) {
        data = data.filter(p => p.categoryId === query.categoryId);
      }
      if (query.subCategoryId) {
        data = data.filter(p => p.subCategoryId === query.subCategoryId);
      }
      if (query.featured === 'true') {
        data = data.filter(p => p.featured);
      }
      if (query.search) {
        const s = query.search.toLowerCase();
        data = data.filter(
          p =>
            p.name.toLowerCase().includes(s) ||
            p.description.toLowerCase().includes(s) ||
            p.categoryName.toLowerCase().includes(s) ||
            p.brand.toLowerCase().includes(s),
        );
      }
      if (query.sort === 'price_asc') {
        data.sort((a, b) => a.price - b.price);
      } else if (query.sort === 'price_desc') {
        data.sort((a, b) => b.price - a.price);
      } else if (query.sort === 'name') {
        data.sort((a, b) => a.name.localeCompare(b.name));
      }
      return {data};
    },
  },
  {
    method: 'GET',
    segments: ['products', ':id'],
    handler: async ({params}) => {
      await delay();
      const product = db.products.find(p => p.id === params.id);
      if (!product as any) {
        apiError(404, 'Product not found.');
      }
      return {data: productWithMeta(product as any)};
    },
  },
  {
    method: 'GET',
    segments: ['pricing', 'requests'],
    handler: async ({user, query}) => {
      await delay();
      const current = requireUser({params: {}, query, body: undefined, user});
      db.pricingRequests.forEach(maybeApprovePricing);
      let data = db.pricingRequests
        .filter(r => r.userId === current.id)
        .sort((a, b) => b.createdAt - a.createdAt);
      if (query.status && query.status !== 'all') {
        data = data.filter(r => r.status === query.status);
      }
      return {data};
    },
  },
  {
    method: 'POST',
    segments: ['pricing', 'requests'],
    handler: async ({body, user, query}) => {
      const current = requireUser({params: {}, query, body, user});
      await delay(500);
      const product = db.products.find(p => p.id === body?.productId);
      if (!product as any) {
        apiError(404, 'Product not found.');
      }
      if (!body?.quantity || Number(body.quantity) <= 0) {
        apiError(422, 'Please enter a valid quantity.');
      }
      const request: PricingRequest = {
        id: generateId('pr'),
        userId: current.id,
        productId: (product as any).id,
        productName: (product as any).name,
        productImage: (product as any).images[0],
        quantity: Number(body.quantity),
        unit: body.unit || 'Litre',
        targetPrice: body.targetPrice ? Number(body.targetPrice) : undefined,
        message: body.message ?? '',
        status: 'pending',
        createdAt: Date.now(),
      };
      db.pricingRequests.unshift(request as any);
      addNotification({
        title: 'Pricing Request Submitted',
        body: `Your pricing request for ${
          (product as any).name
        } has been received. Our team will review it shortly.`,
        type: 'pricing',
      });
      return {data: request};
    },
  },
  {
    method: 'GET',
    segments: ['orders'],
    handler: async ({user, query}) => {
      await delay();
      const current = requireUser({params: {}, query, body: undefined, user});
      db.orders.forEach(maybeAdvanceOrder);
      const data = db.orders
        .filter(o => o.userId === current.id)
        .sort((a, b) => b.createdAt - a.createdAt);
      return {data};
    },
  },
  {
    method: 'GET',
    segments: ['orders', ':id'],
    handler: async ({params, user, query}) => {
      requireUser({params, query, body: undefined, user});
      await delay();
      const order = db.orders.find(o => o.id === params.id);
      if (!order as any) {
        apiError(404, 'Order not found.');
      }
      maybeAdvanceOrder(order as any);
      return {data: order};
    },
  },
  {
    method: 'POST',
    segments: ['orders'],
    handler: async ({body, user, query}) => {
      const current = requireUser({params: {}, query, body, user});
      await delay(500);
      let items: Order['items'] = [];
      if (body?.pricingRequestId) {
        const request = db.pricingRequests.find(
          r => r.id === body.pricingRequestId,
        );
        if (!request as any) {
          apiError(404, 'Pricing request not found.');
        }
        maybeApprovePricing(request as any);
        if ((request as any).status !== 'approved') {
          apiError(400, 'Pricing request is not approved yet.');
        }
        items = [
          {
            productId: (request as any).productId,
            name: (request as any).productName,
            image: (request as any).productImage,
            quantity: (request as any).quantity,
            unitPrice: (request as any).approvedPrice ?? 0,
          },
        ];
      } else if (Array.isArray(body?.items) && body.items.length) {
        items = body.items.map((item: any) => {
          const product = db.products.find(p => p.id === item.productId);
          if (!product as any) {
            apiError(404, 'Product not found.');
          }
          return {
            productId: (product as any).id,
            name: (product as any).name,
            image: (product as any).images[0],
            quantity: Number(item.quantity),
            unitPrice: Number(
              item.unitPrice ??
                (product as any).dealerPrice ??
                (product as any).price,
            ),
          };
        });
      } else {
        apiError(422, 'No order items provided.');
      }
      const subtotal = items.reduce(
        (sum, item) => sum + item.quantity * item.unitPrice,
        0,
      );
      const tax = Math.round(subtotal * GST_RATE * 100) / 100;
      const order: Order = {
        id: generateId('ord'),
        orderNo: nextOrderNo(),
        userId: current.id,
        items,
        status: 'placed',
        subtotal,
        tax,
        total: Math.round((subtotal + tax) * 100) / 100,
        shippingAddress: body?.shippingAddress
          ? String(body.shippingAddress)
          : `${current.address}, ${current.city}, ${current.state} - ${current.pincode}`,
        timeline: [
          {
            status: 'placed',
            label: 'Order Placed',
            date: Date.now(),
            note: 'Order received by Axnol.',
          },
        ],
        createdAt: Date.now(),
      };
      db.orders.unshift(order as any);
      addNotification({
        title: 'Order Placed',
        body: `Order ${(order as any).orderNo} has been placed successfully.`,
        type: 'order',
      });
      return {data: order};
    },
  },
  {
    method: 'GET',
    segments: ['orders', ':id', 'invoice'],
    handler: async ({params, user, query}) => {
      requireUser({params, query, body: undefined, user});
      await delay();
      const order = db.orders.find(o => o.id === params.id);
      if (!order as any) {
        apiError(404, 'Order not found.');
      }
      maybeAdvanceOrder(order as any);
      if ((order as any).status === 'placed') {
        apiError(404, 'Invoice will be generated once the order is confirmed.');
      }
      const invoice = ensureInvoice(order!);
      return {data: invoice};
    },
  },
  {
    method: 'GET',
    segments: ['invoices'],
    handler: async ({user, query}) => {
      const current = requireUser({params: {}, query, body: undefined, user});
      await delay();
      const orderIds = db.orders
        .filter(o => o.userId === current.id)
        .map(o => o.id);
      const data = db.invoices
        .filter(inv => orderIds.includes(inv.orderId))
        .sort((a, b) => b.date - a.date);
      return {data};
    },
  },
  {
    method: 'GET',
    segments: ['profile'],
    handler: async ({user, query}) => {
      const current = requireUser({params: {}, query, body: undefined, user});
      await delay(250);
      maybeApproveUser(current);
      return {data: sanitizeUser(current)};
    },
  },
  {
    method: 'PUT',
    segments: ['profile'],
    handler: async ({body, user, query}) => {
      const current = requireUser({params: {}, query, body, user});
      await delay(450);
      const editable = [
        'name',
        'phone',
        'company',
        'designation',
        'address',
        'city',
        'state',
        'pincode',
        'gstin',
        'avatar',
      ] as const;
      editable.forEach(key => {
        if (typeof body?.[key] === 'string') {
          (current as any)[key] = body[key];
        }
      });
      if (body?.completeProfile) {
        current.profileCompleted = true;
      }
      return {data: sanitizeUser(current)};
    },
  },
  {
    method: 'PUT',
    segments: ['profile', 'password'],
    handler: async ({body, user, query}) => {
      const current = requireUser({params: {}, query, body, user});
      await delay(450);
      if (current.password !== body?.currentPassword) {
        apiError(400, 'Current password is incorrect.');
      }
      if (!body?.newPassword || String(body.newPassword).length < 6) {
        apiError(422, 'New password must be at least 6 characters.');
      }
      current.password = body.newPassword;
      return {data: {message: 'Password changed successfully.'}};
    },
  },
  {
    method: 'GET',
    segments: ['notifications'],
    handler: async ({user, query}) => {
      requireUser({params: {}, query, body: undefined, user});
      await delay(200);
      const data = [...db.notifications].sort(
        (a, b) => b.createdAt - a.createdAt,
      );
      return {data};
    },
  },
  {
    method: 'POST',
    segments: ['notifications', 'read-all'],
    handler: async ({user, query}) => {
      requireUser({params: {}, query, body: undefined, user});
      await delay(150);
      db.notifications.forEach(n => {
        n.read = true;
      });
      return {data: {message: 'All notifications marked as read.'}};
    },
  },
  {
    method: 'GET',
    segments: ['documents'],
    handler: async ({query}) => {
      await delay(250);
      let data = db.documents;
      if (query.category && query.category !== 'All') {
        data = data.filter(d => d.category === query.category);
      }
      if (query.search) {
        const s = query.search.toLowerCase();
        data = data.filter(d => d.title.toLowerCase().includes(s));
      }
      return {data};
    },
  },
  {
    method: 'POST',
    segments: ['enquiries'],
    handler: async ({body, user}) => {
      const current = user;
      await delay(500);
      if (!body?.name || !body?.email || !body?.message) {
        apiError(422, 'Name, email and message are required.');
      }
      const enquiry: Enquiry = {
        id: generateId('en'),
        type: body.type === 'product' ? 'product' : 'contact',
        userId: current?.id,
        name: body.name,
        email: body.email,
        phone: body.phone ?? '',
        productId: body.productId,
        productName: body.productName,
        subject: body.subject ?? '',
        message: body.message,
        status: 'new',
        createdAt: Date.now(),
      };
      db.enquiries.unshift(enquiry);
      addNotification({
        title: 'Enquiry Received',
        body: `Your enquiry "${
          enquiry.subject || 'Contact request'
        }" has been received. Our team will contact you soon.`,
        type: 'general',
      });
      return {data: enquiry};
    },
  },
  {
    method: 'GET',
    segments: ['enquiries'],
    handler: async ({user, query}) => {
      const current = requireUser({params: {}, query, body: undefined, user});
      await delay();
      const data = db.enquiries
        .filter(e => e.userId === current.id)
        .sort((a, b) => b.createdAt - a.createdAt);
      return {data};
    },
  },
];

const matchRoute = (
  method: string,
  path: string,
): {route: Route; params: Record<string, string>} | undefined => {
  const segments = path.split('/').filter(Boolean);
  for (const route of routes) {
    if (route.method !== method || route.segments.length !== segments.length) {
      continue;
    }
    const params: Record<string, string> = {};
    let matched = true;
    for (let i = 0; i < route.segments.length; i++) {
      const rs = route.segments[i];
      if (rs.startsWith(':')) {
        params[rs.slice(1)] = decodeURIComponent(segments[i]);
      } else if (rs !== segments[i]) {
        matched = false;
        break;
      }
    }
    if (matched) {
      return {route, params};
    }
  }
  return undefined;
};

export const mockBaseQuery: BaseQueryFn<MockRequest> = async (args, api) => {
  const method = args.method ?? 'GET';
  const [rawPath, rawQuery] = args.url.split('?');

  const query: Record<string, string> = {};
  if (rawQuery) {
    rawQuery.split('&').forEach(pair => {
      const [k, v] = pair.split('=');
      if (k) {
        query[decodeURIComponent(k)] = decodeURIComponent(v ?? '');
      }
    });
  }
  if (args.params) {
    Object.entries(args.params).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== '') {
        query[k] = String(v);
      }
    });
  }

  const matched = matchRoute(method, rawPath.replace(/^\/+/, ''));
  if (!matched) {
    return {
      error: {
        status: 404,
        data: {message: `Endpoint not found: ${method} ${args.url}`},
      },
    };
  }

  const state = api.getState() as any;
  const token = state?.auth?.token;
  const user = findUserByToken(token);

  try {
    const result = await matched.route.handler({
      params: matched.params,
      query,
      body: args.body,
      user,
    });
    if (method === 'POST' && rawPath === 'auth/logout' && token) {
      revokeToken(token);
    }
    return result as any;
  } catch (error: any) {
    if (error && error.status && error.data) {
      return {error};
    }
    return {
      error: {
        status: 500,
        data: {message: 'Something went wrong. Please try again.'},
      },
    };
  }
};
