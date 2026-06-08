import { supabase } from './supabase';
import { Product, Receipt, ReturnRecord, StoreSettings } from '../types';

export const api = {
  async getProducts(): Promise<Product[]> {
    const { data, error } = await supabase.from('products').select('*');
    if (error) {
      console.error('Error fetching products:', error);
      return [];
    }
    return data.map(item => ({
      id: item.id,
      name: item.name,
      barcode: item.barcode,
      brand: item.brand,
      category: item.category,
      flavor: item.flavor,
      size: item.size,
      costPrice: Number(item.cost_price),
      sellingPrice: Number(item.selling_price),
      currentStock: item.current_stock,
      lowStockLevel: item.low_stock_level,
      isActive: item.is_active,
      imageUrl: item.image_url,
      batchNumber: item.batch_number,
      expiryDate: item.expiry_date
    }));
  },

  async saveProducts(products: Product[]): Promise<void> {
    const records = products.map(p => ({
      id: p.id,
      name: p.name,
      barcode: p.barcode,
      brand: p.brand,
      category: p.category,
      flavor: p.flavor,
      size: p.size,
      cost_price: p.costPrice,
      selling_price: p.sellingPrice,
      current_stock: p.currentStock,
      low_stock_level: p.lowStockLevel,
      is_active: p.isActive,
      image_url: p.imageUrl,
      batch_number: p.batchNumber,
      expiry_date: p.expiryDate
    }));
    
    const { error } = await supabase.from('products').upsert(records);
    if (error) console.error('Error saving products:', error);
  },

  async getReceipts(): Promise<Receipt[]> {
    const { data, error } = await supabase
      .from('receipts')
      .select(`*, receipt_items (*)`)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching receipts:', error);
      return [];
    }

    return data.map(r => ({
      receiptNumber: r.receipt_number,
      date: r.date,
      cashierName: r.cashier_name,
      items: r.receipt_items.map((item: any) => ({
        productId: item.product_id,
        name: item.name,
        brand: '', // Note: we didn't add brand/flavor to receipt_items in SQL, they can just be empty or we should add them if needed. But let's leave it simple as they are derived fields.
        flavor: '',
        size: '',
        quantity: item.quantity,
        unitPrice: Number(item.unit_price),
        discountPercentage: 0,
        finalPrice: Number(item.final_price)
      })),
      subtotal: Number(r.subtotal),
      taxTotal: Number(r.tax_total),
      discountTotal: Number(r.discount_total),
      grandTotal: Number(r.grand_total),
      paymentMethod: r.payment_method,
      isReprinted: false,
      status: r.status,
      customerEmail: r.customer_email
    }));
  },

  async saveReceipt(receipt: Receipt): Promise<void> {
    const { data: insertedReceipt, error: receiptError } = await supabase.from('receipts').upsert({
      id: receipt.receiptNumber,
      receipt_number: receipt.receiptNumber,
      date: receipt.date,
      cashier_name: receipt.cashierName,
      subtotal: receipt.subtotal,
      tax_total: receipt.taxTotal,
      discount_total: receipt.discountTotal,
      grand_total: receipt.grandTotal,
      payment_method: receipt.paymentMethod,
      status: receipt.status,
      customer_email: receipt.customerEmail
    }).select('id').single();

    if (receiptError) {
      console.error('Error saving receipt:', receiptError);
      return;
    }

    if (insertedReceipt) {
      const items = receipt.items.map(item => ({
        receipt_id: insertedReceipt.id,
        product_id: item.productId,
        name: item.name,
        quantity: item.quantity,
        unit_price: item.unitPrice,
        discount_amount: 0, // Using finalPrice
        final_price: item.finalPrice
      }));
      await supabase.from('receipt_items').upsert(items);
    }
  },

  async getReturns(): Promise<ReturnRecord[]> {
    const { data, error } = await supabase
      .from('returns')
      .select(`*, return_items (*)`)
      .order('created_at', { ascending: false });

    if (error) return [];

    return data.map(r => ({
      id: r.id,
      receiptNumber: r.receipt_number,
      date: r.date,
      cashierName: r.cashier_name,
      refundAmount: Number(r.refund_amount),
      items: r.return_items.map((item: any) => ({
        productId: item.product_id,
        name: item.name,
        quantity: item.quantity,
        unitPrice: Number(item.unit_price),
        returnedToStock: item.returned_to_stock,
        reason: item.reason
      }))
    }));
  },

  async saveReturn(returnRec: ReturnRecord): Promise<void> {
    const { error: returnError } = await supabase.from('returns').upsert({
      id: returnRec.id,
      receipt_number: returnRec.receiptNumber,
      date: returnRec.date,
      cashier_name: returnRec.cashierName,
      refund_amount: returnRec.refundAmount
    });

    if (returnError) return;

    const items = returnRec.items.map(item => ({
      return_id: returnRec.id,
      product_id: item.productId,
      name: item.name,
      quantity: item.quantity,
      unit_price: item.unitPrice,
      returned_to_stock: item.returnedToStock,
      reason: item.reason
    }));
    
    await supabase.from('return_items').upsert(items);
  }
};
