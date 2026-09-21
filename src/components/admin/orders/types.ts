export type AdminAddress = {
  addressLine1: string;
  addressLine2: string;
  city: string;
  country: string;
  firstName: string;
  lastName: string;
  phone: string;
  postalCode: string;
  state: string;
};

export type AdminOrderItem = {
  lineTotal: number;
  name: string;
  productID: number | null;
  quantity: number;
  unitPrice: number;
};

export type AdminOrderTransaction = {
  amount: number;
  billingAddress: AdminAddress | null;
  cartID: number | null;
  createdAt: string;
  currency: string;
  customerEmail: string;
  customerID: number | null;
  id: number;
  merchantOrderID: string;
  ntpID: string;
  paymentMethod: string;
  status: string;
  updatedAt: string;
};

export type AdminOrderActivity = {
  description: string;
  fromStatus: string;
  occurredAt: string;
  source: 'admin' | 'customer' | 'system';
  toStatus: string;
  type: 'cancellation_requested' | 'order_placed' | 'status_changed';
};

export type AdminOrder = {
  activity: AdminOrderActivity[];
  amount: number;
  billingAddress: AdminAddress | null;
  createdAt: string;
  currency: string;
  customerEmail: string;
  customerID: number | null;
  customerName: string;
  deliveryFee: number;
  deliveryVAT: number;
  fulfillmentDate: string;
  fulfillmentMethod: 'delivery' | 'pickup';
  grandTotal: number;
  id: number;
  items: AdminOrderItem[];
  paymentReference: string;
  productSubtotal: number;
  productVAT: number;
  rawSnapshot: unknown;
  shippingAddress: AdminAddress | null;
  status: string;
  transactions: AdminOrderTransaction[];
  updatedAt: string;
  vatRates: {
    delivery: number;
    products: number;
  };
};
