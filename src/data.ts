/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Product, UserAccount, Receipt, StoreSettings } from './types';

export const DEMO_USERS: UserAccount[] = [
  { id: 'u1', name: 'Alex Mercer', role: 'cashier', username: 'alex_cashier' },
  { id: 'u2', name: 'Sara Jenkins', role: 'manager', username: 'sara_manager' }
];

export const DEFAULT_STORE_SETTINGS: StoreSettings = {
  storeName: 'Velor Supplements',
  storePhone: '+254 700 123456',
  storeEmail: 'contact@velorsupplements.co.ke',
  storeAddress: 'Westlands Mall, Ground Floor, Nairobi, Kenya',
  taxRatePercentage: 16, // Kenyan VAT is 16%
  currencySymbol: 'KSh',
  receiptThankYouNote: 'Fuel your ambition. Thank you for shopping with Velor!',
  receiptReturnPolicy: 'Unopened items can be returned within 14 days with original receipt.'
};

export const INITIAL_PRODUCTS: Product[] = [
  {
    id: 'p1',
    name: 'Gold Standard 100% Whey',
    barcode: '748927022377',
    brand: 'Optimum Nutrition',
    category: 'Protein Powder',
    flavor: 'Double Rich Chocolate',
    size: '5 lbs',
    costPrice: 5500.00,
    sellingPrice: 9500.00,
    currentStock: 18,
    lowStockLevel: 5,
    expiryDate: '2027-10-15',
    batchNumber: 'ONW-8930B',
    isActive: true
  },
  {
    id: 'p2',
    name: 'Gold Standard 100% Whey',
    barcode: '748927022414',
    brand: 'Optimum Nutrition',
    category: 'Protein Powder',
    flavor: 'Vanilla Ice Cream',
    size: '2 lbs',
    costPrice: 3000.00,
    sellingPrice: 5000.00,
    currentStock: 4, // Low Stock Alert!
    lowStockLevel: 6,
    expiryDate: '2027-09-02',
    batchNumber: 'ONW-8711A',
    isActive: true
  },
  {
    id: 'p3',
    name: 'C4 Original Pre-Workout',
    barcode: '842595101235',
    brand: 'Cellucor',
    category: 'Pre-Workout',
    flavor: 'Cherry Limeade',
    size: '30 Servings',
    costPrice: 2500.00,
    sellingPrice: 4200.00,
    currentStock: 25,
    lowStockLevel: 8,
    expiryDate: '2026-12-10',
    batchNumber: 'C4O-5512',
    isActive: true
  },
  {
    id: 'p4',
    name: 'C4 Original Pre-Workout',
    barcode: '842595101242',
    brand: 'Cellucor',
    category: 'Pre-Workout',
    flavor: 'Fruit Punch',
    size: '30 Servings',
    costPrice: 2500.00,
    sellingPrice: 4200.00,
    currentStock: 0, // Out of stock!
    lowStockLevel: 8,
    expiryDate: '2026-11-20',
    batchNumber: 'C4O-5513',
    isActive: true
  },
  {
    id: 'p5',
    name: 'Creatine Monohydrate Pure',
    barcode: '702381289542',
    brand: 'MyProtein',
    category: 'Creatine',
    flavor: 'Unflavored',
    size: '1 kg',
    costPrice: 2800.00,
    sellingPrice: 4500.00,
    currentStock: 32,
    lowStockLevel: 10,
    expiryDate: '2028-04-01',
    batchNumber: 'MYC-2266',
    isActive: true
  },
  {
    id: 'p6',
    name: 'Essential Amino Energy',
    barcode: '748927052985',
    brand: 'Optimum Nutrition',
    category: 'Amino Acids',
    flavor: 'Blue Raspberry',
    size: '30 Servings',
    costPrice: 2000.00,
    sellingPrice: 3500.00,
    currentStock: 15,
    lowStockLevel: 5,
    expiryDate: '2027-01-30',
    batchNumber: 'ONA-1200',
    isActive: true
  },
  {
    id: 'p7',
    name: 'Animal Pak Multivitamin',
    barcode: '039442030128',
    brand: 'Universal Nutrition',
    category: 'Vitamins',
    flavor: 'Pills (None)',
    size: '44 Packs',
    costPrice: 3500.00,
    sellingPrice: 5800.00,
    currentStock: 8,
    lowStockLevel: 4,
    expiryDate: '2027-04-18',
    batchNumber: 'UNV-3044',
    isActive: true
  },
  {
    id: 'p8',
    name: 'Organic Plant Protein',
    barcode: '658010118835',
    brand: 'Garden of Life',
    category: 'Protein Powder',
    flavor: 'Organic Vanilla',
    size: '1.2 lbs',
    costPrice: 2500.00,
    sellingPrice: 4200.00,
    currentStock: 2, // Low stock!
    lowStockLevel: 5,
    expiryDate: '2026-08-11', // Approaching expiry
    batchNumber: 'GOL-7788',
    isActive: true
  },
  {
    id: 'p9',
    name: 'Glutamine Premium Recovery',
    barcode: '850021575001',
    brand: 'Transparent Labs',
    category: 'Recovery',
    flavor: 'Unflavored',
    size: '300g',
    costPrice: 1800.00,
    sellingPrice: 3000.00,
    currentStock: 12,
    lowStockLevel: 4,
    expiryDate: '2027-12-05',
    batchNumber: 'TLG-9031',
    isActive: true
  },
  {
    id: 'p10',
    name: 'Protein Crunch Bar',
    barcode: '842595180018',
    brand: 'Cellucor',
    category: 'Health Snacks',
    flavor: 'Cookie Dough',
    size: '1 Box (12 Bars)',
    costPrice: 2200.00,
    sellingPrice: 3800.00,
    currentStock: 14,
    lowStockLevel: 5,
    expiryDate: '2026-09-15',
    batchNumber: 'CCB-4402',
    isActive: true
  }
];

// Initial pre-loaded receipts to populate dashboard & receipts screen instantly
export const INITIAL_RECEIPTS: Receipt[] = [
  {
    receiptNumber: 'VEL-2026-0001',
    date: '2026-06-07T09:12:00Z',
    cashierName: 'Alex Mercer',
    customerEmail: 'customer1@gmail.com',
    items: [
      {
        productId: 'p1',
        name: 'Gold Standard 100% Whey',
        brand: 'Optimum Nutrition',
        flavor: 'Double Rich Chocolate',
        size: '5 lbs',
        quantity: 1,
        unitPrice: 9500.00,
        discountPercentage: 0,
        finalPrice: 9500.00
      },
      {
        productId: 'p6',
        name: 'Essential Amino Energy',
        brand: 'Optimum Nutrition',
        flavor: 'Blue Raspberry',
        size: '30 Servings',
        quantity: 1,
        unitPrice: 3500.00,
        discountPercentage: 10, // 10% discount
        finalPrice: 3150.00
      }
    ],
    subtotal: 12650.00,
    discountTotal: 350.00,
    taxTotal: 2024.00, // 16% VAT of 12650.00
    grandTotal: 14674.00,
    paymentMethod: 'Card',
    isReprinted: false,
    status: 'Completed'
  },
  {
    receiptNumber: 'VEL-2026-0002',
    date: '2026-06-07T11:45:00Z',
    cashierName: 'Alex Mercer',
    customerEmail: 'fitbrian@outlook.com',
    items: [
      {
        productId: 'p3',
        name: 'C4 Original Pre-Workout',
        brand: 'Cellucor',
        flavor: 'Cherry Limeade',
        size: '30 Servings',
        quantity: 2,
        unitPrice: 4200.00,
        discountPercentage: 0,
        finalPrice: 8400.00
      },
      {
        productId: 'p5',
        name: 'Creatine Monohydrate Pure',
        brand: 'MyProtein',
        flavor: 'Unflavored',
        size: '1 kg',
        quantity: 1,
        unitPrice: 4500.00,
        discountPercentage: 0,
        finalPrice: 4500.00
      }
    ],
    subtotal: 12900.00,
    discountTotal: 0.00,
    taxTotal: 2064.00, // 16% VAT
    grandTotal: 14964.00,
    paymentMethod: 'Cash',
    isReprinted: false,
    status: 'Completed'
  },
  {
    receiptNumber: 'VEL-2026-0003',
    date: '2026-06-06T14:20:00Z',
    cashierName: 'Sara Jenkins',
    customerEmail: 'jenny_lifts@gmail.com',
    items: [
      {
        productId: 'p7',
        name: 'Animal Pak Multivitamin',
        brand: 'Universal Nutrition',
        flavor: 'Pills (None)',
        size: '44 Packs',
        quantity: 1,
        unitPrice: 5800.00,
        discountPercentage: 5,
        finalPrice: 5510.00
      }
    ],
    subtotal: 5510.00,
    discountTotal: 290.00,
    taxTotal: 881.60, // 16% VAT
    grandTotal: 6391.60,
    paymentMethod: 'Mobile Money',
    isReprinted: false,
    status: 'Completed'
  },
  {
    receiptNumber: 'VEL-2026-0004',
    date: '2026-06-05T16:05:00Z',
    cashierName: 'Alex Mercer',
    customerEmail: 'sam99@gmail.com',
    items: [
      {
        productId: 'p10',
        name: 'Protein Crunch Bar',
        brand: 'Cellucor',
        flavor: 'Cookie Dough',
        size: '1 Box (12 Bars)',
        quantity: 4,
        unitPrice: 3800.00,
        discountPercentage: 0,
        finalPrice: 15200.00
      }
    ],
    subtotal: 15200.00,
    discountTotal: 0.00,
    taxTotal: 2432.00, // 16% VAT
    grandTotal: 17632.00,
    paymentMethod: 'Bank Transfer',
    isReprinted: false,
    status: 'Completed'
  }
];
