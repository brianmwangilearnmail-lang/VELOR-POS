/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type UserRole = 'cashier' | 'manager';

export interface UserAccount {
  id: string;
  name: string;
  role: UserRole;
  username: string;
}

export interface Product {
  id: string;
  name: string;
  barcode: string;
  brand: string;
  category: string;
  flavor: string;
  size: string; // e.g. "2 lbs", "60 caps", "300g"
  costPrice: number;
  sellingPrice: number;
  currentStock: number;
  lowStockLevel: number;
  expiryDate?: string; // YYYY-MM-DD
  batchNumber?: string;
  isActive: boolean;
  imageUrl?: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
  discountPercentage: number; // 0 to 100
}

export interface ReceiptItem {
  productId: string;
  name: string;
  brand: string;
  flavor: string;
  size: string;
  quantity: number;
  unitPrice: number;
  discountPercentage: number;
  finalPrice: number;
}

export interface Receipt {
  receiptNumber: string;
  date: string; // ISO String
  cashierName: string;
  customerEmail?: string;
  customerName?: string;
  items: ReceiptItem[];
  subtotal: number;
  discountTotal: number;
  taxTotal: number;
  grandTotal: number;
  paymentMethod: 'Cash' | 'Card' | 'Mobile Money' | 'Bank Transfer';
  isReprinted: boolean;
  status: 'Completed' | 'Returned' | 'Partially Returned';
}

export interface ReturnItem {
  productId: string;
  quantity: number;
  reason: string;
  returnedToStock: boolean;
}

export interface ReturnRecord {
  id: string;
  receiptNumber: string;
  date: string; // ISO String
  cashierName: string;
  items: {
    productId: string;
    name: string;
    quantity: number;
    unitPrice: number;
    returnedToStock: boolean;
    reason: string;
  }[];
  refundAmount: number;
}

export interface StoreSettings {
  storeName: string;
  storePhone: string;
  storeEmail: string;
  storeAddress: string;
  taxRatePercentage: number;
  currencySymbol: string;
  receiptThankYouNote: string;
  receiptReturnPolicy: string;
  gmailAppPassword?: string;
}
