/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef } from 'react';
import { 
  Search, 
  ScanLine, 
  Trash2, 
  Plus, 
  Minus, 
  CreditCard, 
  Coins, 
  Smartphone, 
  FileOutput, 
  CheckCircle2, 
  Printer, 
  Mail, 
  X,
  Sparkles,
  Barcode,
  User,
  Upload
} from 'lucide-react';
import { Product, CartItem, Receipt, StoreSettings, UserAccount } from '../types';

interface PosTabProps {
  products: Product[];
  settings: StoreSettings;
  currentUser: UserAccount;
  onUpdateStockAfterSale: (soldItems: { productId: string; qty: number }[]) => void;
  onAddReceipt: (receipt: Receipt) => void;
  onAddProduct: (product: Product) => void;
  onUpdateProduct: (product: Product) => void;
}

export default function PosTab({
  products,
  settings,
  currentUser,
  onUpdateStockAfterSale,
  onAddReceipt,
  onAddProduct,
  onUpdateProduct
}: PosTabProps) {

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  
  // Barcode scanner mockup states
  const [scannedBarcode, setScannedBarcode] = useState('');
  const [scannerFeedback, setScannerFeedback] = useState('');

  // Quick product creation modal parameters
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [addName, setAddName] = useState('');
  const [addBrand, setAddBrand] = useState('');
  const [addBarcode, setAddBarcode] = useState('');
  const [addCategory, setAddCategory] = useState('Protein Powder');
  const [addFlavor, setAddFlavor] = useState('Unflavored');
  const [addSize, setAddSize] = useState('2 lbs');
  const [addCostPrice, setAddCostPrice] = useState<number>(0);
  const [addSellingPrice, setAddSellingPrice] = useState<number>(0);
  const [addStock, setAddStock] = useState<number>(15);
  const [addLowStock, setAddLowStock] = useState<number>(5);
  const [addExpiry, setAddExpiry] = useState('');
  const [addBatch, setAddBatch] = useState('');
  const [addImageUrl, setAddImageUrl] = useState('');
  const [addIsDragging, setAddIsDragging] = useState(false);

  const openQuickAddProduct = () => {
    setAddName('');
    setAddBrand('');
    setAddBarcode(Math.floor(100000000000 + Math.random() * 900000000000).toString());
    setAddCategory('Protein Powder');
    setAddFlavor('Unflavored');
    setAddSize('2 lbs');
    setAddCostPrice(0);
    setAddSellingPrice(0);
    setAddStock(15);
    setAddLowStock(5);
    setAddExpiry('');
    setAddBatch(`BCH-${Math.floor(1000 + Math.random() * 9000)}`);
    setAddImageUrl('');
    setAddIsDragging(false);
    setIsAddModalOpen(true);
  };

  const handleQuickAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!addName.trim()) {
      alert('Product display name is required.');
      return;
    }
    if (!addBrand.trim()) {
      alert('Product brand label is required.');
      return;
    }
    if (!addBarcode.trim()) {
      alert('Barcode is required.');
      return;
    }

    const barcodeExists = products.some(p => p.barcode === addBarcode.trim());
    if (barcodeExists) {
      alert('A product with this identical barcode is already in the catalog!');
      return;
    }

    const newProd: Product = {
      id: `p_pos_${Date.now()}`,
      name: addName.trim(),
      brand: addBrand.trim(),
      barcode: addBarcode.trim(),
      category: addCategory,
      flavor: addFlavor.trim() || 'Unflavored',
      size: addSize.trim() || 'N/A',
      costPrice: Number(addCostPrice) || 0,
      sellingPrice: Number(addSellingPrice) || 0,
      currentStock: Number(addStock) >= 0 ? Number(addStock) : 0,
      lowStockLevel: Number(addLowStock) >= 0 ? Number(addLowStock) : 3,
      expiryDate: addExpiry || undefined,
      batchNumber: addBatch.trim() || undefined,
      isActive: true,
      imageUrl: addImageUrl || undefined
    };

    onAddProduct(newProd);
    setIsAddModalOpen(false);
    setScannerFeedback(`Supplement "${newProd.name}" successfully added to registry.`);
    setTimeout(() => setScannerFeedback(''), 5000);
  };

  // Cart
  const [cart, setCart] = useState<CartItem[]>([]);
  const [paymentMethod, setPaymentMethod] = useState<'Cash' | 'Card' | 'Mobile Money' | 'Bank Transfer'>('Card');
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerName, setCustomerName] = useState('');
  
  // Checkout & Receipt Modal
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);
  const [latestReceipt, setLatestReceipt] = useState<Receipt | null>(null);
  const [emailStatus, setEmailStatus] = useState<'none' | 'sending' | 'sent'>('none');

  // Categorization
  const categories = ['All', ...Array.from(new Set(products.map(p => p.category)))];

  // Filters search query (Matches name, brand, barcode, flavor, or size)
  const filteredProducts = products.filter(product => {
    if (!product.isActive) return false;
    const matchesCategory = selectedCategory === 'All' || product.category === selectedCategory;
    
    const term = searchQuery.toLowerCase();
    const matchesSearch = 
      product.name.toLowerCase().includes(term) ||
      product.brand.toLowerCase().includes(term) ||
      product.barcode.includes(term) ||
      product.flavor.toLowerCase().includes(term) ||
      product.size.toLowerCase().includes(term);

    return matchesCategory && matchesSearch;
  });

  // Adding product to cart
  const addToCart = (product: Product) => {
    if (product.currentStock <= 0) {
      alert('This product is out of stock!');
      return;
    }

    setCart(prevCart => {
      const existingIndex = prevCart.findIndex(item => item.product.id === product.id);
      
      if (existingIndex > -1) {
        // Double check stock limit
        const newQty = prevCart[existingIndex].quantity + 1;
        if (newQty > product.currentStock) {
          alert(`In-store warning: Stock contains only ${product.currentStock} units total.`);
          return prevCart;
        }
        const updated = [...prevCart];
        updated[existingIndex].quantity = newQty;
        return updated;
      } else {
        return [...prevCart, { product, quantity: 1, discountPercentage: 0 }];
      }
    });
  };

  // Adjust line quantities
  const updateQuantity = (productId: string, delta: number) => {
    setCart(prevCart => {
      const index = prevCart.findIndex(item => item.product.id === productId);
      if (index === -1) return prevCart;

      const item = prevCart[index];
      const newQty = item.quantity + delta;

      if (newQty <= 0) {
        // Remove item
        return prevCart.filter(i => i.product.id !== productId);
      }

      // Check stock limit
      if (newQty > item.product.currentStock) {
        alert(`Cannot add more. Limit reached: Only ${item.product.currentStock} units available.`);
        return prevCart;
      }

      const updated = [...prevCart];
      updated[index].quantity = newQty;
      return updated;
    });
  };

  // Adjust discount % per product item
  const updateLineDiscount = (productId: string, discount: number) => {
    const clampedDiscount = Math.max(0, Math.min(100, discount));
    setCart(prevCart => {
      return prevCart.map(item => {
        if (item.product.id === productId) {
          return { ...item, discountPercentage: clampedDiscount };
        }
        return item;
      });
    });
  };

  // Remove line item
  const removeLineItem = (productId: string) => {
    setCart(prevCart => prevCart.filter(i => i.product.id !== productId));
  };

  // Simulated rapid barcode scanner input key submission
  const handleBarcodeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanBarcode = scannedBarcode.trim();
    if (!cleanBarcode) return;

    const matchedProduct = products.find(p => p.isActive && p.barcode === cleanBarcode);

    if (matchedProduct) {
      if (matchedProduct.currentStock <= 0) {
        setScannerFeedback(`❌ OUT OF STOCK: ${matchedProduct.name}`);
      } else {
        addToCart(matchedProduct);
        setScannerFeedback(`✅ ADDED: ${matchedProduct.name} - ${matchedProduct.flavor}`);
      }
    } else {
      setScannerFeedback(`❌ UNKNOWN BARCODE: "${cleanBarcode}"`);
    }

    setScannedBarcode('');
    setTimeout(() => setScannerFeedback(''), 3000);
  };

  const handleShortcutScan = (barcode: string) => {
    setScannedBarcode(barcode);
    const matchedProduct = products.find(p => p.isActive && p.barcode === barcode);
    if (matchedProduct) {
      if (matchedProduct.currentStock <= 0) {
        setScannerFeedback(`❌ OUT OF STOCK: ${matchedProduct.name}`);
      } else {
        addToCart(matchedProduct);
        setScannerFeedback(`✅ ADDED: ${matchedProduct.name}`);
      }
    }
    setScannedBarcode('');
    setTimeout(() => setScannerFeedback(''), 3000);
  };

  // Pricing calculations
  const calculateTotals = () => {
    let subtotal = 0;
    let discountTotal = 0;

    cart.forEach(item => {
      const lineCost = item.product.sellingPrice * item.quantity;
      const lineSaving = lineCost * (item.discountPercentage / 100);
      subtotal += lineCost;
      discountTotal += lineSaving;
    });

    const preTaxAndDiscountTotal = subtotal - discountTotal;
    const taxTotal = preTaxAndDiscountTotal * (settings.taxRatePercentage / 100);
    const grandTotal = preTaxAndDiscountTotal + taxTotal;

    return {
      subtotal,
      discountTotal,
      taxTotal,
      grandTotal
    };
  };

  const { subtotal, discountTotal, taxTotal, grandTotal } = calculateTotals();

  // Clear overall state
  const clearCart = () => {
    setCart([]);
    setCustomerEmail('');
    setCustomerName('');
  };

  // Submit complete checkout checkout transaction
  const handleCheckout = () => {
    if (cart.length === 0) {
      alert('Cart is empty!');
      return;
    }

    const timestamp = new Date().toISOString();
    const dateFormatted = new Date();
    const receiptSeed = `VEL-${dateFormatted.getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

    // Build Receipt model items list
    const receiptItemsDef = cart.map(item => {
      const rawPrice = item.product.sellingPrice * item.quantity;
      const finalPrice = rawPrice * (1 - item.discountPercentage / 100);
      return {
        productId: item.product.id,
        name: item.product.name,
        brand: item.product.brand,
        flavor: item.product.flavor,
        size: item.product.size,
        quantity: item.quantity,
        unitPrice: item.product.sellingPrice,
        discountPercentage: item.discountPercentage,
        finalPrice: finalPrice
      };
    });

    const newReceipt: Receipt = {
      receiptNumber: receiptSeed,
      date: timestamp,
      cashierName: currentUser.name,
      customerEmail: customerEmail.trim() || undefined,
      customerName: customerName.trim() || undefined,
      items: receiptItemsDef,
      subtotal: subtotal,
      discountTotal: discountTotal,
      taxTotal: taxTotal,
      grandTotal: grandTotal,
      paymentMethod: paymentMethod,
      isReprinted: false,
      status: 'Completed'
    };

    // Callback 1: Dispatch to decrement products inventory state locally
    const soldItems = cart.map(item => ({
      productId: item.product.id,
      qty: item.quantity
    }));

    onUpdateStockAfterSale(soldItems);

    // Callback 2: Store transaction ledger overall history
    onAddReceipt(newReceipt);

    // Set interactive visual thermal slip states
    setLatestReceipt(newReceipt);
    setIsReceiptModalOpen(true);
    setEmailStatus('none');

    // Wipe cart
    clearCart();
  };

  // Simple copy reprint markup
  const handlePrintMockup = () => {
    const rawReceiptWindow = window.open('', '_blank');
    if (!rawReceiptWindow) {
      alert('Printed mock output copied successfully (Popup blocker prevented direct tab).');
      return;
    }
    
    if (!latestReceipt) return;

    rawReceiptWindow.document.write(`
      <html>
        <head>
          <title>Receipt ${latestReceipt.receiptNumber}</title>
          <style>
            body { font-family: 'Courier New', Courier, monospace; color: #000; padding: 20px; font-size: 14px; width: 300px; margin: 0 auto; }
            .text-center { text-align: center; }
            .border-top { border-top: 1px dotted #000; margin-top: 10px; padding-top: 10px; }
            .grid-flex { display: flex; justify-content: space-between; }
            .bold { font-weight: bold; }
          </style>
        </head>
        <body>
          <div class="text-center">
            <h3>== ${settings.storeName.toUpperCase()} ==</h3>
            <p>${settings.storeAddress}<br/>Phone: ${settings.storePhone}</p>
          </div>
          <div class="border-top">
            <p>Date: ${new Date(latestReceipt.date).toLocaleString()}<br/>
            Rcpt #: ${latestReceipt.receiptNumber}<br/>
            Cashier: ${latestReceipt.cashierName}<br/>
            ${latestReceipt.customerName ? `Customer: ${latestReceipt.customerName}<br/>` : ''}
            ${latestReceipt.customerEmail ? `Email: ${latestReceipt.customerEmail}` : ''}</p>
          </div>
          <div class="border-top">
            ${latestReceipt.items.map(item => `
              <div class="grid-flex">
                <span>${item.name} (${item.flavor}) x${item.quantity}</span>
                <span>${settings.currencySymbol}${item.finalPrice.toFixed(2)}</span>
              </div>
            `).join('')}
          </div>
          <div class="border-top">
            <div class="grid-flex"><span>Subtotal:</span><span>${settings.currencySymbol}${latestReceipt.subtotal.toFixed(2)}</span></div>
            <div class="grid-flex"><span>Discount:</span><span>-${settings.currencySymbol}${latestReceipt.discountTotal.toFixed(2)}</span></div>
            <div class="grid-flex"><span>Tax (${settings.taxRatePercentage}%):</span><span>${settings.currencySymbol}${latestReceipt.taxTotal.toFixed(2)}</span></div>
            <div class="grid-flex bold"><span>TOTAL PAID:</span><span>${settings.currencySymbol}${latestReceipt.grandTotal.toFixed(2)}</span></div>
          </div>
          <p class="text-center border-top">${settings.receiptThankYouNote}</p>
        </body>
      </html>
    `);
    rawReceiptWindow.document.close();
    rawReceiptWindow.print();
  };

  const handleSendEmailSimulation = async () => {
    const finalEmail = latestReceipt?.customerEmail || customerEmail;
    if (!finalEmail) {
      alert('Please fill in a destination customer email address first.');
      return;
    }
    
    setEmailStatus('sending');
    
    try {
      const response = await fetch('http://localhost:3001/api/send-receipt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: finalEmail,
          receipt: latestReceipt,
          settings: settings
        })
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || 'Failed to send email');
      }

      setEmailStatus('sent');
    } catch (error: any) {
      console.error(error);
      alert('Email dispatch failed: ' + error.message);
      setEmailStatus('none');
    }
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 font-sans">
      
      {/* LEFT PORTION: Product Directory & Barcode mockup (Columns 1 to 7/8) */}
      <div className="xl:col-span-7 2xl:col-span-8 space-y-4">
        
        {/* Search controls + scan layout bar */}
        <div className="bg-slate-950/60 p-4 border border-slate-800 rounded-xl space-y-3">
          
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="relative flex-1">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500">
                <Search className="h-4 w-4" />
              </span>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search supplements by flavor, name, barcode brand, size..."
                className="w-full pl-10 pr-4 py-2 bg-slate-900 border border-slate-800 focus:border-teal-500/60 rounded-lg text-slate-200 placeholder-slate-500 focus:outline-none text-xs transition-all"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {/* Simulated barcode scanner bar */}
              <form onSubmit={handleBarcodeSubmit} className="flex items-center gap-2">
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-2.5 flex items-center text-teal-500">
                    <ScanLine className="h-3.5 w-3.5" />
                  </span>
                  <input
                    type="text"
                    value={scannedBarcode}
                    onChange={(e) => setScannedBarcode(e.target.value)}
                    placeholder="Scan / Type Barcode..."
                    className="pl-8 pr-3 py-1.5 w-44 bg-slate-900 border border-slate-800 focus:border-teal-500/60 focus:ring-1 focus:ring-teal-500/35 rounded-lg text-slate-200 placeholder-slate-500 text-xs focus:outline-none font-mono"
                  />
                </div>
                <button 
                  type="submit"
                  className="py-1.5 px-3 bg-teal-500/10 hover:bg-teal-500/20 text-teal-400 font-semibold rounded-lg text-xs leading-none border border-teal-500/25 transition-all shrink-0"
                >
                  Scan Enter
                </button>
              </form>

              {/* Quick Add Product Button */}
              <button
                type="button"
                onClick={openQuickAddProduct}
                className="py-1.5 px-3.5 bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold rounded-lg text-xs flex items-center justify-center gap-1.5 transition-all shrink-0 shadow-md"
              >
                <Plus className="h-3.5 w-3.5 stroke-[3px]" />
                <span>Add Product</span>
              </button>
            </div>
          </div>

          {/* Scanner dynamic feedback notifications */}
          {scannerFeedback && (
            <div className="p-2 rounded bg-slate-900 border border-slate-800 text-[11px] font-mono flex items-center gap-1.5 text-teal-400">
              <Barcode className="h-3 w-3 text-teal-500 shrink-0" />
              <span>{scannerFeedback}</span>
            </div>
          )}

          {/* Quick bar-code simulator shortcuts */}
          <div className="flex flex-wrap items-center gap-2 pt-1">
            <span className="text-[10px] text-slate-500 font-mono">Demo barcode clicks:</span>
            {products.slice(0, 4).map(p => (
              <button
                key={p.id}
                onClick={() => handleShortcutScan(p.barcode)}
                className="px-2 py-0.5 rounded bg-slate-900/60 hover:bg-slate-900 text-[10px] font-mono text-slate-400 border border-slate-800 hover:border-teal-500/30 transition-all"
                title={`Click to simulate laser scanner scan for ${p.name}`}
              >
                [{p.barcode.slice(-4)}] {p.name.split(' ').slice(0,2).join(' ')}
              </button>
            ))}
          </div>

        </div>

        {/* Categories Scrollers Horizontal Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium shrink-0 transition-all border ${
                selectedCategory === cat
                  ? 'bg-teal-500/10 text-teal-400 border-teal-500/40'
                  : 'bg-slate-950/40 text-slate-400 border-slate-800/80 hover:text-slate-300 hover:border-slate-700'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Product Catalog Display Grid cards */}
        {filteredProducts.length === 0 ? (
          <div className="bg-slate-950/20 p-12 border border-dashed border-slate-800 rounded-xl flex flex-col items-center text-center justify-center text-slate-500">
            <Search className="h-8 w-8 text-slate-700 mb-2" />
            <p className="text-xs">No active matching supplements are found under selected category filters.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredProducts.map((prod) => {
              const isLow = prod.currentStock <= prod.lowStockLevel && prod.currentStock > 0;
              const isOut = prod.currentStock === 0;

              return (
                <div 
                  key={prod.id} 
                  className={`bg-slate-950/50 p-4 border rounded-xl flex flex-col justify-between transition-all ${
                    isOut 
                      ? 'border-slate-900 opacity-60' 
                      : isLow 
                      ? 'border-amber-900/40 hover:border-amber-500/40' 
                      : 'border-slate-800/85 hover:border-slate-700/80'
                  }`}
                >
                  <div>
                    {/* Header line brand & catalog fields */}
                    <div className="flex items-center justify-between text-[10px] text-slate-500 font-mono mb-2">
                      <span className="truncate pr-1 uppercase tracking-wider font-semibold text-teal-400">
                        {prod.brand}
                      </span>
                      <span className="shrink-0 bg-slate-900 px-1.5 py-0.5 rounded border border-white/5 text-[9px]">
                        {prod.category}
                      </span>
                    </div>

                    {/* Compact Modern Supplement Placeholder Image Container matching mockup */}
                    <div className="h-28 bg-slate-900/60 rounded-lg mb-3.5 flex items-center justify-center border border-white/10 relative overflow-hidden group select-none">
                      {prod.imageUrl ? (
                        <img 
                          src={prod.imageUrl} 
                          referrerPolicy="no-referrer" 
                          className="w-full h-full object-cover select-none absolute inset-0 z-0" 
                          alt={prod.name} 
                        />
                      ) : null}
                      
                      {/* Direct product picture uploader upload trigger */}
                      <label 
                        title="Upload product image directly"
                        className="absolute top-2 right-2 z-30 p-1.5 bg-slate-950/85 hover:bg-slate-900 text-teal-400 hover:text-teal-300 border border-slate-800 rounded-lg cursor-pointer transition-all shadow-md active:scale-95 flex items-center justify-center hover:shadow-lg"
                      >
                        <Upload className="h-3.5 w-3.5" />
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              const reader = new FileReader();
                              reader.onloadend = () => {
                                onUpdateProduct({
                                  ...prod,
                                  imageUrl: reader.result as string
                                });
                              };
                              reader.readAsDataURL(file);
                            }
                          }}
                        />
                      </label>

                      <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[#0A0A0A]/40 z-10" />
                      <div className="z-20 flex flex-col items-center gap-1.5 pointer-events-none">
                        <span className="text-[10px] text-slate-200 font-mono tracking-widest uppercase select-none font-bold bg-slate-950/70 px-2 py-0.5 rounded shadow-sm opacity-90">
                          {prod.size}
                        </span>
                        <span className="text-[9px] px-1.5 py-0.5 bg-slate-950/70 rounded text-teal-400 font-mono scale-95 uppercase font-semibold shadow-sm opacity-90">
                          {prod.flavor}
                        </span>
                      </div>
                    </div>

                    <h3 className="text-xs font-semibold text-slate-100 leading-snug line-clamp-2">
                      {prod.name}
                    </h3>

                    {/* Flavor & Variant parameters */}
                    <div className="flex flex-wrap gap-1 mt-2">
                      <span className="text-[9px] bg-slate-900 text-slate-400 px-1.5 py-0.5 rounded font-mono">
                        {prod.flavor}
                      </span>
                      <span className="text-[9px] bg-sky-950 text-sky-400 px-1.5 py-0.5 rounded font-mono">
                        {prod.size}
                      </span>
                      {prod.batchNumber && (
                        <span className="text-[9px] bg-indigo-950/60 text-slate-400 px-1.5 py-0.5 rounded font-mono">
                          B:{prod.batchNumber}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Stock parameters & checkout button line */}
                  <div className="mt-4 pt-3.5 border-t border-slate-900 flex items-center justify-between">
                    <div>
                      <span className="text-[11px] text-slate-500 font-mono block">Selling Price:</span>
                      <span className="text-sm font-black text-slate-100 font-mono">
                        {settings.currencySymbol}{prod.sellingPrice.toFixed(2)}
                      </span>
                    </div>

                    <div className="flex flex-col items-end gap-1.5">
                      {/* Stock badge indicators */}
                      {isOut ? (
                        <span className="text-[9px] text-rose-500 font-mono font-bold uppercase">
                          Out Of Stock
                        </span>
                      ) : isLow ? (
                        <span className="text-[9px] text-amber-500 font-mono font-bold uppercase animate-pulse">
                          Only {prod.currentStock} left
                        </span>
                      ) : (
                        <span className="text-[9px] text-teal-400 font-mono">
                          In Store: {prod.currentStock} units
                        </span>
                      )}

                      <button
                        disabled={isOut}
                        onClick={() => addToCart(prod)}
                        className={`px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all shrink-0 select-none ${
                          isOut 
                            ? 'bg-slate-900 text-slate-600 border border-slate-800/20 cursor-not-allowed'
                            : 'bg-teal-500 hover:bg-teal-400 text-slate-950 hover:shadow-md'
                        }`}
                      >
                        + Add to Sale
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* RIGHT PORTION: Cart Drawer list + summary totals checker (Columns 8 to 12) */}
      <div className="xl:col-span-5 2xl:col-span-4 bg-slate-950 border border-slate-800 rounded-xl p-4 flex flex-col justify-between h-[calc(100vh-140px)] sticky top-24 overflow-y-auto">
        
        {/* Cart Drawer Header */}
        <div>
          <div className="flex items-center justify-between pb-3.5 border-b border-slate-900">
            <div className="flex items-center gap-2">
              <span className="bg-teal-500/10 text-teal-400 border border-teal-500/20 text-[10px] h-5 w-5 rounded-full flex items-center justify-center font-bold">
                {cart.reduce((sum, i) => sum + i.quantity, 0)}
              </span>
              <h3 className="text-xs font-semibold text-slate-200 uppercase tracking-wider">
                Current Sale Items
              </h3>
            </div>
            {cart.length > 0 && (
              <button 
                onClick={clearCart}
                className="text-[10px] text-slate-500 hover:text-slate-300 flex items-center gap-1 font-medium select-none"
              >
                <Trash2 className="h-3 w-3 shrink-0 text-red-500" />
                Clear cart
              </button>
            )}
          </div>

          {/* Cart items list */}
          {cart.length === 0 ? (
            <div className="py-20 flex flex-col items-center justify-center text-center text-slate-600">
              <Sparkles className="h-8 w-8 text-slate-700 mb-2" />
              <p className="text-xs">The shopping cart is empty.</p>
              <p className="text-[11px] text-slate-600 mt-1 max-w-[200px] leading-snug">
                Scan product barcodes or click "+ Add to Sale" on the grid.
              </p>
            </div>
          ) : (
            <div className="space-y-3.5 max-h-[300px] overflow-y-auto pr-1 mt-3">
              {cart.map((item) => {
                const lineTotalRaw = item.product.sellingPrice * item.quantity;
                const lineDiscountVal = lineTotalRaw * (item.discountPercentage / 100);
                const lineFinalTotal = lineTotalRaw - lineDiscountVal;

                return (
                  <div 
                    key={item.product.id} 
                    className="p-3 bg-slate-900/60 border border-slate-900 rounded-xl space-y-2 text-xs"
                  >
                    {/* Item title line */}
                    <div className="flex items-start justify-between">
                      <div className="min-w-0 pr-1">
                        <p className="font-semibold text-slate-200 leading-tight">
                          {item.product.name}
                        </p>
                        <p className="text-[10px] text-slate-500 mt-1 font-mono">
                          {item.product.brand} • {item.product.flavor} ({item.product.size})
                        </p>
                      </div>
                      <button
                        onClick={() => removeLineItem(item.product.id)}
                        className="text-slate-500 hover:text-rose-400 p-1 shrink-0"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </div>

                    {/* Quantity Adjustment + Discount input segment */}
                    <div className="flex items-center justify-between pt-1 border-t border-slate-950/20">
                      
                      {/* Qty count control wrapper */}
                      <div className="flex items-center gap-2 bg-slate-950 px-2 py-1 rounded border border-slate-800">
                        <button 
                          onClick={() => updateQuantity(item.product.id, -1)}
                          className="text-slate-400 hover:text-slate-200"
                        >
                          <Minus className="h-3 w-3" />
                        </button>
                        <span className="font-mono text-xs font-semibold text-slate-200 w-4 text-center">
                          {item.quantity}
                        </span>
                        <button 
                          onClick={() => updateQuantity(item.product.id, 1)}
                          className="text-slate-400 hover:text-slate-200"
                        >
                          <Plus className="h-3 w-3" />
                        </button>
                      </div>

                      {/* Discount Percentage slider selector */}
                      <div className="flex items-center gap-1">
                        <span className="text-[10px] text-slate-500 font-mono uppercase tracking-wider">
                          Discount:
                        </span>
                        <div className="flex items-center bg-slate-950 border border-slate-800 rounded px-1.5 py-0.5">
                          <input
                            type="number"
                            min="0"
                            max="100"
                            value={item.discountPercentage}
                            onChange={(e) => updateLineDiscount(item.product.id, parseInt(e.target.value) || 0)}
                            className="bg-transparent text-slate-200 font-mono text-[10px] w-6 focus:outline-none text-right font-semibold"
                          />
                          <span className="text-slate-500 font-mono text-[10px] ml-0.5">%</span>
                        </div>
                      </div>

                      {/* Line subtotal representation */}
                      <div className="text-right">
                        {item.discountPercentage > 0 && (
                          <span className="text-[10px] text-slate-500 line-through font-mono block">
                            {settings.currencySymbol}{lineTotalRaw.toFixed(2)}
                          </span>
                        )}
                        <span className="font-mono text-xs font-bold text-slate-300">
                          {settings.currencySymbol}{lineFinalTotal.toFixed(2)}
                        </span>
                      </div>

                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Sales summary details & Payment checkout forms */}
        <div className="mt-4 pt-4 border-t border-slate-900 space-y-4">
          
          {/* Customer Name option */}
          <div className="space-y-1.5">
            <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
              Customer Name
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-2.5 flex items-center text-slate-500">
                <User className="h-3.5 w-3.5" />
              </span>
              <input
                type="text"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="optional (e.g. Jenkins / Brian)"
                className="w-full pl-8 pr-3 py-1.5 bg-slate-900 border border-slate-850 focus:border-teal-500/50 rounded-lg text-xs text-slate-300 placeholder-slate-600 focus:outline-none"
              />
            </div>
          </div>

          {/* Email receipt placeholder options */}
          <div className="space-y-1.5">
            <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
              Customer Email Address (Send digital receipt)
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-2.5 flex items-center text-slate-500">
                <Mail className="h-3.5 w-3.5" />
              </span>
              <input
                type="email"
                value={customerEmail}
                onChange={(e) => setCustomerEmail(e.target.value)}
                placeholder="optional (e.g. brian@example.com)"
                className="w-full pl-8 pr-3 py-1.5 bg-slate-900 border border-slate-850 focus:border-teal-500/50 rounded-lg text-xs text-slate-300 placeholder-slate-600 focus:outline-none"
              />
            </div>
          </div>

          {/* Pricing breakdowns */}
          <div className="bg-slate-900/40 p-3 rounded-xl border border-slate-900 space-y-1.5">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span>Retail Subtotal:</span>
              <span className="font-mono text-slate-200">
                {settings.currencySymbol}{subtotal.toFixed(2)}
              </span>
            </div>

            {discountTotal > 0 && (
              <div className="flex items-center justify-between text-xs text-teal-400 font-bold">
                <span>Total Savings:</span>
                <span className="font-mono">
                  -{settings.currencySymbol}{discountTotal.toFixed(2)}
                </span>
              </div>
            )}

            <div className="flex items-center justify-between text-xs text-slate-500 font-mono">
              <span>Sales Tax ({settings.taxRatePercentage}%):</span>
              <span>{settings.currencySymbol}{taxTotal.toFixed(2)}</span>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-slate-800 text-slate-100">
              <span className="text-xs font-bold uppercase tracking-wider">Total Amount:</span>
              <span className="text-base font-black font-mono text-teal-400">
                {settings.currencySymbol}{grandTotal.toFixed(2)}
              </span>
            </div>
          </div>

          {/* Payment method selector grids */}
          <div className="space-y-1.5">
            <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
              Choose Payment Method
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setPaymentMethod('Card')}
                className={`py-2 px-2.5 rounded-lg border text-xs font-medium transition-all flex items-center gap-1.5 select-none ${
                  paymentMethod === 'Card'
                    ? 'border-teal-500/50 bg-teal-500/10 text-teal-400'
                    : 'border-slate-850 bg-slate-900/40 text-slate-400 hover:border-slate-800'
                }`}
              >
                <CreditCard className="h-3.5 w-3.5" />
                <span>Card</span>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('Cash')}
                className={`py-2 px-2.5 rounded-lg border text-xs font-medium transition-all flex items-center gap-1.5 select-none ${
                  paymentMethod === 'Cash'
                    ? 'border-teal-500/50 bg-teal-500/10 text-teal-400'
                    : 'border-slate-850 bg-slate-900/40 text-slate-400 hover:border-slate-800'
                }`}
              >
                <Coins className="h-3.5 w-3.5" />
                <span>Cash</span>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('Mobile Money')}
                className={`py-2 px-2.5 rounded-lg border text-xs font-medium transition-all flex items-center gap-1.5 select-none ${
                  paymentMethod === 'Mobile Money'
                    ? 'border-teal-500/50 bg-teal-500/10 text-teal-400'
                    : 'border-slate-850 bg-slate-900/40 text-slate-400 hover:border-slate-800'
                }`}
              >
                <Smartphone className="h-3.5 w-3.5" />
                <span>Mobile Pay</span>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('Bank Transfer')}
                className={`py-2 px-2.5 rounded-lg border text-xs font-medium transition-all flex items-center gap-1.5 select-none ${
                  paymentMethod === 'Bank Transfer'
                    ? 'border-teal-500/50 bg-teal-500/10 text-teal-400'
                    : 'border-slate-850 bg-slate-900/40 text-slate-400 hover:border-slate-800'
                }`}
              >
                <FileOutput className="h-3.5 w-3.5" />
                <span>Bank Wire</span>
              </button>
            </div>
          </div>

          {/* Action Button: Checkout */}
          <button
            type="button"
            disabled={cart.length === 0}
            onClick={handleCheckout}
            className={`w-full py-3 font-semibold rounded-xl text-xs uppercase tracking-wider transition-all select-none ${
              cart.length === 0
                ? 'bg-slate-900 text-slate-600 border border-slate-800 cursor-not-allowed'
                : 'bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-400 hover:to-emerald-400 text-slate-950 hover:shadow-lg font-black'
            }`}
          >
            Process & complete Sale
          </button>

        </div>

      </div>

      {/* POS AUTO-RECEIPT MODAL (THERMAL INVOICE SIMULATOR) */}
      {isReceiptModalOpen && latestReceipt && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl relative flex flex-col max-h-[92vh] shadow-2xl">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 shrink-0">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-teal-400 shrink-0" />
                <h4 className="text-sm font-semibold text-slate-200">
                  Transaction Authorized — <span className="text-teal-400 font-mono">{latestReceipt.receiptNumber}</span>
                </h4>
              </div>
              <button
                onClick={() => setIsReceiptModalOpen(false)}
                className="text-slate-500 hover:text-slate-300 transition-all p-1"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Scrollable receipt area */}
            <div className="flex-1 overflow-y-auto px-6 py-5">

              {/* Thermal paper slip */}
              <div className="bg-white text-slate-900 rounded-lg shadow-xl font-mono text-[12px] leading-relaxed relative mx-auto w-full max-w-xl">

                {/* Zigzag top edge */}
                <div className="h-3 w-full" style={{background: 'repeating-linear-gradient(135deg, #f8fafc 0px, #f8fafc 5px, #e2e8f0 5px, #e2e8f0 10px)'}} />

                <div className="px-8 pb-6 pt-4">

                  {/* Store Header */}
                  <div className="text-center mb-5 pb-4 border-b-2 border-dashed border-slate-300">
                    <h2 className="font-black text-base uppercase tracking-widest text-slate-900">{settings.storeName}</h2>
                    <p className="text-slate-500 text-[11px] mt-1">{settings.storeAddress}</p>
                    <p className="text-slate-500 text-[11px]">Tel: {settings.storePhone} &nbsp;|&nbsp; {settings.storeEmail}</p>
                  </div>

                  {/* Receipt Meta — 2 column grid */}
                  <div className="grid grid-cols-2 gap-x-6 gap-y-1 mb-4 pb-4 border-b border-dashed border-slate-300 text-[11px]">
                    <div>
                      <span className="text-slate-400 uppercase tracking-wide text-[9px] font-bold block">Receipt No.</span>
                      <span className="font-bold text-slate-900">{latestReceipt.receiptNumber}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 uppercase tracking-wide text-[9px] font-bold block">Date & Time</span>
                      <span className="text-slate-700">{new Date(latestReceipt.date).toLocaleString()}</span>
                    </div>
                    <div className="mt-1">
                      <span className="text-slate-400 uppercase tracking-wide text-[9px] font-bold block">Cashier</span>
                      <span className="text-slate-700">{latestReceipt.cashierName}</span>
                    </div>
                    <div className="mt-1">
                      <span className="text-slate-400 uppercase tracking-wide text-[9px] font-bold block">Payment</span>
                      <span className="font-bold text-slate-900 uppercase">{latestReceipt.paymentMethod}</span>
                    </div>
                    {latestReceipt.customerName && (
                      <div className="mt-1">
                        <span className="text-slate-400 uppercase tracking-wide text-[9px] font-bold block">Customer</span>
                        <span className="text-slate-700">{latestReceipt.customerName}</span>
                      </div>
                    )}
                    {latestReceipt.customerEmail && (
                      <div className="mt-1 col-span-2">
                        <span className="text-slate-400 uppercase tracking-wide text-[9px] font-bold block">Email</span>
                        <span className="text-slate-700">{latestReceipt.customerEmail}</span>
                      </div>
                    )}
                  </div>

                  {/* Items Table */}
                  <div className="mb-4">
                    {/* Table Header */}
                    <div className="grid grid-cols-12 text-[9px] font-black uppercase tracking-widest text-slate-400 pb-2 border-b border-slate-200">
                      <span className="col-span-5">Item</span>
                      <span className="col-span-2 text-center">Qty</span>
                      <span className="col-span-2 text-right">Unit</span>
                      <span className="col-span-3 text-right">Total</span>
                    </div>

                    {/* Table Rows */}
                    <div className="divide-y divide-slate-100">
                      {latestReceipt.items.map((item, idx) => (
                        <div key={idx} className="grid grid-cols-12 py-2.5 text-[11px]">
                          <div className="col-span-5 pr-2">
                            <p className="font-bold text-slate-900 leading-tight">{item.name}</p>
                            <p className="text-[10px] text-slate-400">{item.flavor} · {item.size}</p>
                            {item.discountPercentage > 0 && (
                              <p className="text-[9px] text-emerald-600 font-bold">-{item.discountPercentage}% OFF</p>
                            )}
                          </div>
                          <span className="col-span-2 text-center text-slate-700 self-center">{item.quantity}</span>
                          <span className="col-span-2 text-right text-slate-700 self-center">{settings.currencySymbol}{item.unitPrice.toFixed(2)}</span>
                          <span className="col-span-3 text-right font-bold text-slate-900 self-center">{settings.currencySymbol}{item.finalPrice.toFixed(2)}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Totals block */}
                  <div className="border-t-2 border-dashed border-slate-300 pt-3 space-y-1.5 text-[11px]">
                    <div className="flex justify-between text-slate-500">
                      <span>Subtotal</span>
                      <span>{settings.currencySymbol}{latestReceipt.subtotal.toFixed(2)}</span>
                    </div>
                    {latestReceipt.discountTotal > 0 && (
                      <div className="flex justify-between text-emerald-600 font-bold">
                        <span>Discounts Saved</span>
                        <span>- {settings.currencySymbol}{latestReceipt.discountTotal.toFixed(2)}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-slate-500">
                      <span>Tax ({settings.taxRatePercentage}%)</span>
                      <span>{settings.currencySymbol}{latestReceipt.taxTotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between font-black text-base text-slate-900 pt-2 border-t-2 border-slate-900">
                      <span>TOTAL PAID</span>
                      <span>{settings.currencySymbol}{latestReceipt.grandTotal.toFixed(2)}</span>
                    </div>
                  </div>

                  {/* Footer note */}
                  <div className="mt-5 pt-4 border-t border-dashed border-slate-300 text-center space-y-1.5">
                    <p className="font-bold italic text-slate-600 text-[11px]">"{settings.receiptThankYouNote}"</p>
                    <p className="text-slate-400 text-[10px] leading-relaxed">{settings.receiptReturnPolicy}</p>

                    {/* Barcode simulation */}
                    <div className="flex flex-col items-center pt-3">
                      <div className="flex gap-px">
                        {Array.from({length: 36}).map((_, i) => (
                          <div key={i} className="bg-slate-900" style={{width: i % 3 === 0 ? 3 : i % 5 === 0 ? 1 : 2, height: 28}} />
                        ))}
                      </div>
                      <p className="text-[9px] text-slate-400 mt-1 tracking-[4px] font-mono">{latestReceipt.receiptNumber}</p>
                    </div>
                  </div>

                </div>

                {/* Zigzag bottom edge */}
                <div className="h-3 w-full" style={{background: 'repeating-linear-gradient(45deg, #f8fafc 0px, #f8fafc 5px, #e2e8f0 5px, #e2e8f0 10px)'}} />

              </div>
            </div>

            {/* Email send form inside modal overlay */}
            <div className="px-6 py-4 border-t border-slate-800 space-y-3 shrink-0 bg-slate-900 rounded-b-2xl">
              
              <div className="flex items-center gap-2">
                <input
                  type="email"
                  value={latestReceipt.customerEmail || customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                  placeholder="Enter customer email to send receipt..."
                  className="flex-1 bg-slate-950 border border-slate-800 focus:border-teal-500/60 rounded-lg text-slate-300 text-xs py-2 px-3 placeholder-slate-600 focus:outline-none"
                />
                
                <button
                  type="button"
                  onClick={handleSendEmailSimulation}
                  disabled={emailStatus === 'sending'}
                  className="px-4 py-2 bg-teal-500 text-slate-950 hover:bg-teal-400 font-bold transition-all text-xs rounded-lg flex items-center justify-center gap-1.5 shrink-0 disabled:opacity-60"
                >
                  <Mail className="h-3.5 w-3.5" />
                  <span>{emailStatus === 'sending' ? 'Sending...' : 'Send Receipt'}</span>
                </button>
              </div>

              {emailStatus === 'sent' && (
                <p className="text-[10px] text-emerald-400 font-semibold flex items-center gap-1.5">
                  <CheckCircle2 className="h-3.5 w-3.5" /> Receipt emailed to customer successfully!
                </p>
              )}

              {/* Print and Close controls button line */}
              <div className="flex items-center justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={handlePrintMockup}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-lg border border-slate-700 hover:border-slate-600 transition-all flex items-center gap-1.5"
                >
                  <Printer className="h-4 w-4" />
                  <span>Print Receipt</span>
                </button>

                <button
                  type="button"
                  onClick={() => setIsReceiptModalOpen(false)}
                  className="px-4 py-2 bg-teal-500 hover:bg-teal-400 text-slate-950 text-xs font-bold rounded-lg transition-all"
                >
                  Next Sale
                </button>
              </div>

            </div>

          </div>
        </div>
      )}
      {/* QUICK ADD PRODUCT SKU MODAL DIALOG */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 select-none">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl relative flex flex-col max-h-[90vh]">
            
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="p-1.5 bg-teal-500/15 rounded-lg text-teal-400">
                  <Plus className="h-5 w-5" />
                </span>
                <h3 className="text-slate-100 font-bold text-sm">
                  Quick Add Product to Catalog (Kenyan Shillings)
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-500 hover:text-slate-300 p-1"
              >
                <X className="h-4.5 w-4.5" />
              </button>
            </div>

            {/* Modal Body Form */}
            <form onSubmit={handleQuickAddSubmit} className="flex-1 overflow-y-auto p-5 space-y-4">
              
              {/* Product Basic Name & Brand row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                    Product Display Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={addName}
                    onChange={(e) => setAddName(e.target.value)}
                    placeholder="e.g. Hydrolyzed Iso Hydro Whey"
                    className="w-full bg-slate-950 text-slate-200 border border-slate-800 focus:border-teal-500/60 rounded-xl text-xs py-2.5 px-4 placeholder-slate-600 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                    Brand Label *
                  </label>
                  <input
                    type="text"
                    required
                    value={addBrand}
                    onChange={(e) => setAddBrand(e.target.value)}
                    placeholder="e.g. Kaged Muscle"
                    className="w-full bg-slate-950 text-slate-200 border border-slate-800 focus:border-teal-500/60 rounded-xl text-xs py-2.5 px-4 placeholder-slate-600 focus:outline-none"
                  />
                </div>
              </div>

              {/* Barcode & Categories */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                    UPC Barcode * (Scan / Auto-generated)
                  </label>
                  <input
                    type="text"
                    required
                    value={addBarcode}
                    onChange={(e) => setAddBarcode(e.target.value)}
                    placeholder="e.g. 748927022377"
                    className="w-full bg-slate-950 font-mono text-teal-400 border border-slate-800 focus:border-teal-500/60 rounded-xl text-xs py-2.5 px-4 placeholder-slate-600 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                    Store Category Selector
                  </label>
                  <select
                    value={addCategory}
                    onChange={(e) => setAddCategory(e.target.value)}
                    className="w-full bg-slate-950 text-slate-200 border border-slate-800 focus:border-teal-500/60 rounded-xl text-xs py-2.5 px-4 focus:outline-none"
                  >
                    <option value="Protein Powder">Protein Powder</option>
                    <option value="Pre-Workout">Pre-Workout</option>
                    <option value="Creatine">Creatine</option>
                    <option value="Amino Acids">Amino Acids</option>
                    <option value="Vitamins">Vitamins</option>
                    <option value="Recovery">Recovery</option>
                    <option value="Health Snacks">Health Snacks</option>
                    <option value="Accessories">Accessories</option>
                  </select>
                </div>
              </div>

              {/* Flavor Profile & Variant Size specs */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                    Flavor Variant
                  </label>
                  <input
                    type="text"
                    value={addFlavor}
                    onChange={(e) => setAddFlavor(e.target.value)}
                    placeholder="e.g. Double Chocolate Fudge / Lemonade"
                    className="w-full bg-slate-950 text-slate-200 border border-slate-800 focus:border-teal-500/60 rounded-xl text-xs py-2.5 px-4 placeholder-slate-600 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                    Container Measurement Size
                  </label>
                  <input
                    type="text"
                    value={addSize}
                    onChange={(e) => setAddSize(e.target.value)}
                    placeholder="e.g. 5 lbs, 30 Servings, 2 kg"
                    className="w-full bg-slate-950 text-slate-200 border border-slate-800 focus:border-teal-500/60 rounded-xl text-xs py-2.5 px-4 placeholder-slate-600 focus:outline-none"
                  />
                </div>
              </div>

              {/* Prices Cost vs Selling retail values */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                    Wholesale Cost Price ({settings.currencySymbol})
                  </label>
                  <input
                    type="number"
                    step="50"
                    min="0"
                    required
                    value={addCostPrice || ''}
                    onChange={(e) => setAddCostPrice(parseFloat(e.target.value) || 0)}
                    placeholder="e.g. 4000"
                    className="w-full bg-slate-950 font-mono text-slate-200 border border-slate-800 focus:border-teal-500/60 rounded-xl text-xs py-2.5 px-4 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                    Consumer Selling Price ({settings.currencySymbol}) *
                  </label>
                  <input
                    type="number"
                    step="50"
                    min="0"
                    required
                    value={addSellingPrice || ''}
                    onChange={(e) => setAddSellingPrice(parseFloat(e.target.value) || 0)}
                    placeholder="e.g. 7500"
                    className="w-full bg-slate-950 font-mono text-slate-200 border border-slate-800 focus:border-teal-500/60 rounded-xl text-xs py-2.5 px-4 focus:outline-none"
                  />
                </div>
              </div>

              {/* Stock quantities & critical alert level thresholds */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                    Initial Stock in Inventory
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={addStock}
                    onChange={(e) => setAddStock(parseInt(e.target.value) || 1)}
                    className="w-full bg-slate-950 font-mono text-slate-200 border border-slate-800 focus:border-teal-500/60 rounded-xl text-xs py-2.5 px-4 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                    Low-stock Alarm Alert Level
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={addLowStock}
                    onChange={(e) => setAddLowStock(parseInt(e.target.value) || 3)}
                    className="w-full bg-slate-950 font-mono text-slate-200 border border-slate-800 focus:border-teal-500/60 rounded-xl text-xs py-2.5 px-4 focus:outline-none"
                  />
                </div>
              </div>

              {/* Supplements unique metrics Expiries & batch codes */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                    Expiry Date YYYY-MM-DD
                  </label>
                  <input
                    type="date"
                    value={addExpiry}
                    onChange={(e) => setAddExpiry(e.target.value)}
                    className="w-full bg-slate-950 text-slate-200 border border-slate-800 focus:border-teal-500/60 rounded-xl text-xs py-2.5 px-4 focus:outline-none font-mono"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                    Batch Manufacturing Code Number (Optional)
                  </label>
                  <input
                    type="text"
                    value={addBatch}
                    onChange={(e) => setAddBatch(e.target.value)}
                    placeholder="e.g. BCH-5592-N"
                    className="w-full bg-slate-950 text-slate-200 border border-slate-800 focus:border-teal-500/60 rounded-xl text-xs py-2.5 px-4 placeholder-slate-600 focus:outline-none"
                  />
                </div>
              </div>

              {/* Product Image Upload Section */}
              <div className="space-y-1.5 text-left">
                <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
                  Product Image Thumbnail (Drag & Drop or Choose)
                </label>
                
                <div 
                  className={`border-2 border-dashed rounded-xl p-4 flex flex-col items-center justify-center transition-all ${
                    addIsDragging 
                      ? 'border-teal-500 bg-teal-500/5' 
                      : 'border-slate-800 bg-slate-950 hover:border-slate-700'
                  }`}
                  onDragOver={(e) => {
                    e.preventDefault();
                    setAddIsDragging(true);
                  }}
                  onDragLeave={() => setAddIsDragging(false)}
                  onDrop={(e) => {
                    e.preventDefault();
                    setAddIsDragging(false);
                    const file = e.dataTransfer.files?.[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onloadend = () => {
                        setAddImageUrl(reader.result as string);
                      };
                      reader.readAsDataURL(file);
                    }
                  }}
                >
                  {addImageUrl ? (
                    <div className="flex flex-col items-center gap-3">
                      <div className="relative group/addimg h-24 w-24 bg-slate-900 rounded-lg overflow-hidden border border-slate-800">
                        <img src={addImageUrl} className="w-full h-full object-cover" alt="Product preview" referrerPolicy="no-referrer" />
                        <button
                          type="button"
                          onClick={() => setAddImageUrl('')}
                          className="absolute inset-0 bg-red-950/85 text-red-400 flex items-center justify-center opacity-0 group-hover/addimg:opacity-100 transition-opacity text-xs font-semibold"
                        >
                          Remove
                        </button>
                      </div>
                      <p className="text-[10px] text-slate-500">
                        Hover over image to remove or drag new image to replace
                      </p>
                    </div>
                  ) : (
                    <label className="flex flex-col items-center gap-1.5 cursor-pointer py-1.5 text-center w-full">
                      <Upload className="h-5 w-5 text-teal-400 mb-0.5" />
                      <span className="text-[11px] font-semibold text-slate-300">
                        Drag & Drop or <span className="text-teal-400 hover:text-teal-350 underline">browse photo</span>
                      </span>
                      <span className="text-[9px] text-slate-500">
                        Supports PNG, JPG, WEBP, GIF (Converted to base64 Data URL)
                      </span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            const reader = new FileReader();
                            reader.onloadend = () => {
                              setAddImageUrl(reader.result as string);
                            };
                            reader.readAsDataURL(file);
                          }
                        }}
                      />
                    </label>
                  )}
                </div>
              </div>

              {/* Form Buttons */}
              <div className="pt-4 border-t border-slate-800 flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4.5 py-2 rounded-xl text-xs text-slate-400 hover:text-slate-200 bg-slate-950 border border-slate-800 transition-all font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold transition-all shadow-md"
                >
                  Add Product to Catalog
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
}
