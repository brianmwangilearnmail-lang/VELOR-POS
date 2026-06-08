/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Product, Receipt, ReturnRecord, StoreSettings, UserAccount } from './types';
import { INITIAL_PRODUCTS, INITIAL_RECEIPTS, DEFAULT_STORE_SETTINGS } from './data';
import { api } from './lib/api';
// Subcomponents
import LoginScreen from './components/LoginScreen';
import Sidebar from './components/Sidebar';
import DashboardTab from './components/DashboardTab';
import PosTab from './components/PosTab';
import ProductsTab from './components/ProductsTab';
import InventoryTab from './components/InventoryTab';
import ReceiptsTab from './components/ReceiptsTab';
import ReturnsTab from './components/ReturnsTab';
import SettingsTab from './components/SettingsTab';

const LOCAL_STORAGE_KEYS = {
  USER: 'velor_pos_current_user',
  PRODUCTS: 'velor_pos_products_db',
  RECEIPTS: 'velor_pos_receipts_db',
  RETURNS: 'velor_pos_returns_db',
  SETTINGS: 'velor_pos_settings_db'
};

export default function App() {
  // Core application states
  const [currentUser, setCurrentUser] = useState<UserAccount | null>(null);
  const [activeTab, setActiveTab] = useState<string>('pos');

  const [products, setProducts] = useState<Product[]>([]);
  const [receipts, setReceipts] = useState<Receipt[]>([]);
  const [returnLedgerHistory, setReturnLedgerHistory] = useState<ReturnRecord[]>([]);
  const [settings, setSettings] = useState<StoreSettings>(DEFAULT_STORE_SETTINGS);

  const [oneOffReceiptToInspect, setOneOffReceiptToInspect] = useState<Receipt | null>(null);

  // 1. Load starting states from Supabase or fallback
  useEffect(() => {
    const cachedUser = localStorage.getItem(LOCAL_STORAGE_KEYS.USER);
    if (cachedUser) {
      try { setCurrentUser(JSON.parse(cachedUser)); } catch (e) {}
    }

    const cachedSettings = localStorage.getItem(LOCAL_STORAGE_KEYS.SETTINGS);
    if (cachedSettings) {
      try {
        const parsed: StoreSettings = JSON.parse(cachedSettings);
        parsed.currencySymbol = 'KSh';
        if (parsed.taxRatePercentage === 8.5) parsed.taxRatePercentage = 16;
        setSettings(parsed);
      } catch (e) {
        setSettings(DEFAULT_STORE_SETTINGS);
      }
    } else {
      setSettings(DEFAULT_STORE_SETTINGS);
    }

    const loadFromDb = async () => {
      try {
        const dbProducts = await api.getProducts();
        if (dbProducts.length > 0) setProducts(dbProducts);
        else setProducts(INITIAL_PRODUCTS);

        const dbReceipts = await api.getReceipts();
        setReceipts(dbReceipts.length > 0 ? dbReceipts : INITIAL_RECEIPTS);

        const dbReturns = await api.getReturns();
        setReturnLedgerHistory(dbReturns);
      } catch (err) {
        console.error('Error loading data from Supabase:', err);
      }
    };
    
    loadFromDb();
  }, []);

  // Update tabs selection automatically when roles change
  useEffect(() => {
    if (currentUser) {
      if (currentUser.role === 'manager') {
        setActiveTab('dashboard');
      } else {
        setActiveTab('pos');
      }
    }
  }, [currentUser]);

  // Save utility wrappers
  const saveProductsToStorage = (updatedList: Product[]) => {
    setProducts(updatedList);
    api.saveProducts(updatedList);
  };

  const saveReceiptsToStorage = (updatedList: Receipt[]) => {
    setReceipts(updatedList);
  };

  const saveReturnsToStorage = (updatedList: ReturnRecord[]) => {
    setReturnLedgerHistory(updatedList);
  };

  const saveSettingsToStorage = (updatedSettings: StoreSettings) => {
    setSettings(updatedSettings);
    localStorage.setItem(LOCAL_STORAGE_KEYS.SETTINGS, JSON.stringify(updatedSettings));
  };

  // 2. Auth handlers
  const handleLogin = (user: UserAccount) => {
    setCurrentUser(user);
    localStorage.setItem(LOCAL_STORAGE_KEYS.USER, JSON.stringify(user));
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem(LOCAL_STORAGE_KEYS.USER);
  };

  // 3. Inventory Stock decrements after POS Checkout Sale
  const updateStockAfterSale = (soldItems: { productId: string; qty: number }[]) => {
    const updated = products.map(prod => {
      const matchSold = soldItems.find(item => item.productId === prod.id);
      if (matchSold) {
        const remainingStock = Math.max(0, prod.currentStock - matchSold.qty);
        return {
          ...prod,
          currentStock: remainingStock
        };
      }
      return prod;
    });

    saveProductsToStorage(updated);
  };

  // 4. POS sale creates receipt ledger
  const addReceipt = (receipt: Receipt) => {
    const updated = [receipt, ...receipts];
    saveReceiptsToStorage(updated);
    api.saveReceipt(receipt);
  };

  // 5. Products Admin additions
  const addProduct = (product: Product) => {
    const updated = [product, ...products];
    saveProductsToStorage(updated);
  };

  const updateProduct = (product: Product) => {
    const updated = products.map(p => p.id === product.id ? product : p);
    saveProductsToStorage(updated);
  };

  // 6. Restocking Form adjustments
  const restockProduct = (productId: string, addedQty: number, newBatch?: string, newExpiry?: string) => {
    const updated = products.map(p => {
      if (p.id === productId) {
        return {
          ...p,
          currentStock: p.currentStock + addedQty,
          batchNumber: newBatch !== undefined ? newBatch : p.batchNumber,
          expiryDate: newExpiry !== undefined ? newExpiry : p.expiryDate
        };
      }
      return p;
    });

    saveProductsToStorage(updated);
  };

  // 7. Process items returns exchanges
  const executeReturnAndAdjustStock = (
    receiptNumber: string,
    returnedItems: { productId: string; qty: number; returnToStock: boolean; reason: string }[],
    refundTotal: number
  ) => {
    // Step A: Append Return Record to returnLedgerHistory
    const timeRef = new Date().toISOString();
    const returnRecordId = `RET-${Date.now()}`;
    
    const formattedReturnedItems = returnedItems.map(item => {
      const matchedProd = products.find(p => p.id === item.productId)!;
      return {
        productId: item.productId,
        name: matchedProd.name,
        quantity: item.qty,
        unitPrice: matchedProd.sellingPrice,
        returnedToStock: item.returnToStock,
        reason: item.reason
      };
    });

    const newReturnRecord: ReturnRecord = {
      id: returnRecordId,
      receiptNumber,
      date: timeRef,
      cashierName: currentUser?.name || 'Manager Operator',
      items: formattedReturnedItems,
      refundAmount: refundTotal
    };

    saveReturnsToStorage([newReturnRecord, ...returnLedgerHistory]);
    api.saveReturn(newReturnRecord);

    // Step B: Replenish Products stock if returnedToStock flag is strictly checked
    const productsUpdated = products.map(prod => {
      const matchReturn = returnedItems.find(item => item.productId === prod.id && item.returnToStock);
      if (matchReturn) {
        return {
          ...prod,
          currentStock: prod.currentStock + matchReturn.qty
        };
      }
      return prod;
    });

    saveProductsToStorage(productsUpdated);

    // Step C: Modify state flag of the historical Receipt record
    const receiptsUpdated = receipts.map(rcpt => {
      if (rcpt.receiptNumber === receiptNumber) {
        // Compute if all original invoice items are now returned, or only half
        const totalPurchasedQtyAvailable = rcpt.items.reduce((sum, item) => sum + item.quantity, 0);
        const totalReturnedNowQty = returnedItems.reduce((sum, item) => sum + item.qty, 0);

        // Simple mapping: If total returned qty matches original count, mark 'Returned'. Otherwise 'Partially Returned'.
        const newStatus: Receipt['status'] = totalReturnedNowQty >= totalPurchasedQtyAvailable ? 'Returned' : 'Partially Returned';

        return {
          ...rcpt,
          status: newStatus
        };
      }
      return rcpt;
    });

    saveReceiptsToStorage(receiptsUpdated);
    const updatedReceipt = receiptsUpdated.find(r => r.receiptNumber === receiptNumber);
    if (updatedReceipt) api.saveReceipt(updatedReceipt);
  };

  // 8. Wipe data settings
  const resetDatabaseToSeededDefaults = () => {
    localStorage.removeItem(LOCAL_STORAGE_KEYS.PRODUCTS);
    localStorage.removeItem(LOCAL_STORAGE_KEYS.RECEIPTS);
    localStorage.removeItem(LOCAL_STORAGE_KEYS.RETURNS);
    localStorage.removeItem(LOCAL_STORAGE_KEYS.SETTINGS);
  };

  // Helper navigate callback used in child dashboard triggers
  const navigateToTab = (tabId: string) => {
    setActiveTab(tabId);
  };

  const inspectSingleReceiptInHistoricalReceiptsTab = (rcpt: Receipt) => {
    setOneOffReceiptToInspect(rcpt);
    setActiveTab('receipts');
  };

  // Clean intercept rendering for viewing details
  const triggerOneOffHistoryAction = () => {
    if (oneOffReceiptToInspect) {
      // Trigger temporary cleanup or forward inside components
      setOneOffReceiptToInspect(null);
    }
  };

  // Sidebar stock indicator alert count computes
  const lowStockThresholdCountTotal = products.filter(p => p.isActive && p.currentStock <= p.lowStockLevel).length;

  // Render screening logic
  if (!currentUser) {
    return <LoginScreen onLoginSuccess={handleLogin} />;
  }

  return (
    <div className="flex h-screen bg-slate-900 text-slate-100 overflow-hidden font-sans">
      
      {/* Sidebar Navigation Panel Area */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={navigateToTab}
        currentUser={currentUser}
        onLogout={handleLogout}
        lowStockCount={lowStockThresholdCountTotal}
      />

      {/* Primary tab views viewport section */}
      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        
        {/* Top universal Header Banner */}
        <header className="h-14 bg-slate-950 border-b border-slate-900 flex items-center justify-between px-6 shrink-0 relative select-none">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[11px] font-mono tracking-wide text-slate-400 capitalize">
              Terminal Node #1 Active — Store context: {settings.storeName}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[10px] bg-slate-900 border border-slate-800 text-slate-400 font-mono px-2 py-0.5 rounded">
              CURRENCY: {settings.currencySymbol}
            </span>
            <span className="text-[10px] bg-teal-500/10 text-teal-400 font-mono px-2 py-0.5 rounded border border-teal-500/15">
              TAX: {settings.taxRatePercentage}%
            </span>
          </div>
        </header>

        {/* Tab-specific pages switch mapping layouts */}
        <div className="flex-1 p-6 max-w-7xl w-full mx-auto">
          {activeTab === 'dashboard' && (
            <DashboardTab
              products={products}
              receipts={receipts}
              settings={settings}
              onNavigateToTab={navigateToTab}
              onViewReceipt={inspectSingleReceiptInHistoricalReceiptsTab}
            />
          )}

          {activeTab === 'pos' && (
            <PosTab
              products={products}
              settings={settings}
              currentUser={currentUser}
              onUpdateStockAfterSale={updateStockAfterSale}
              onAddReceipt={addReceipt}
              onAddProduct={addProduct}
              onUpdateProduct={updateProduct}
            />
          )}

          {activeTab === 'products' && (
            <ProductsTab
              products={products}
              settings={settings}
              currentUser={currentUser}
              onAddProduct={addProduct}
              onUpdateProduct={updateProduct}
            />
          )}

          {activeTab === 'inventory' && (
            <InventoryTab
              products={products}
              settings={settings}
              currentUser={currentUser}
              onRestockProduct={restockProduct}
            />
          )}

          {activeTab === 'receipts' && (
            <ReceiptsTab
              receipts={receipts}
              settings={settings}
              currentUser={currentUser}
            />
          )}

          {activeTab === 'returns' && (
            <ReturnsTab
              receipts={receipts}
              products={products}
              settings={settings}
              currentUser={currentUser}
              onExecuteReturnAndAdjustStock={executeReturnAndAdjustStock}
              returnLedgerHistory={returnLedgerHistory}
            />
          )}

          {activeTab === 'settings' && (
            <SettingsTab
              settings={settings}
              currentUser={currentUser}
              onSaveSettings={saveSettingsToStorage}
              onResetDatabaseToSeededDefaults={resetDatabaseToSeededDefaults}
            />
          )}
        </div>

      </main>

    </div>
  );
}
