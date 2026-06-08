/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Package, 
  RotateCcw, 
  Plus, 
  Calendar, 
  AlertTriangle, 
  CheckCircle,
  HelpCircle,
  Clock,
  ArrowUpRight,
  ShieldCheck
} from 'lucide-react';
import { Product, StoreSettings, UserAccount } from '../types';

interface InventoryTabProps {
  products: Product[];
  settings: StoreSettings;
  currentUser: UserAccount;
  onRestockProduct: (productId: string, addedQty: number, newBatch?: string, newExpiry?: string) => void;
}

export default function InventoryTab({
  products,
  settings,
  currentUser,
  onRestockProduct
}: InventoryTabProps) {

  const isManager = currentUser.role === 'manager';

  const [activeFilter, setActiveFilter] = useState<'all' | 'low' | 'out' | 'fefo'>('all');
  
  // Quick restock panel states
  const [selectedProductId, setSelectedProductId] = useState<string>('');
  const [restockQty, setRestockQty] = useState<number>(10);
  const [restockBatch, setRestockBatch] = useState<string>('');
  const [restockExpiry, setRestockExpiry] = useState<string>('');
  const [restockNote, setRestockNote] = useState<string>('');

  // Handle restock form submit
  const handleRestockSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProductId) {
      alert('You must select a supplement product to restock.');
      return;
    }
    if (restockQty <= 0) {
      alert('Please enter a positive stock amount to add.');
      return;
    }

    onRestockProduct(selectedProductId, restockQty, restockBatch || undefined, restockExpiry || undefined);
    
    // Success feedback
    const matched = products.find(p => p.id === selectedProductId);
    setRestockNote(`✅ Restock Authorized: Added ${restockQty} units to "${matched?.name}".`);
    
    // Clear
    setSelectedProductId('');
    setRestockQty(10);
    setRestockBatch('');
    setRestockExpiry('');
    
    setTimeout(() => setRestockNote(''), 4000);
  };

  const selectProductForQuickRestock = (p: Product) => {
    if (!isManager) return;
    setSelectedProductId(p.id);
    setRestockBatch(p.batchNumber || '');
    setRestockExpiry(p.expiryDate || '');
    setRestockQty(15);
  };

  // Filtered Products Computing
  let processedProducts = [...products];

  if (activeFilter === 'low') {
    processedProducts = processedProducts.filter(p => p.isActive && p.currentStock <= p.lowStockLevel && p.currentStock > 0);
  } else if (activeFilter === 'out') {
    processedProducts = processedProducts.filter(p => p.isActive && p.currentStock === 0);
  } else if (activeFilter === 'fefo') {
    // FEFO: Sort by expiry date ascending, filter items with active expiries
    processedProducts = processedProducts
      .filter(p => p.isActive && p.expiryDate)
      .sort((a, b) => {
        const dateA = a.expiryDate ? new Date(a.expiryDate).getTime() : Infinity;
        const dateB = b.expiryDate ? new Date(b.expiryDate).getTime() : Infinity;
        return dateA - dateB;
      });
  }

  // Count helper functions
  const lowStockCount = products.filter(p => p.isActive && p.currentStock <= p.lowStockLevel && p.currentStock > 0).length;
  const outOfStockCount = products.filter(p => p.isActive && p.currentStock === 0).length;
  const totalInStoreStockUnits = products.reduce((sum, p) => sum + (p.isActive ? p.currentStock : 0), 0);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 font-sans">
      
      {/* Left side: Restock command post (Columns 1 to 4/5) */}
      <div className="lg:col-span-4 xl:col-span-4 space-y-4">
        
        {/* Quick stat counters brief */}
        <div className="bg-slate-950 p-4 border border-slate-800 rounded-xl space-y-2">
          <h4 className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
            In-store physical quantities
          </h4>
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-200">Total physical stock:</span>
            <span className="text-xs font-mono font-bold text-slate-300 bg-slate-900 border border-slate-800 px-2 py-0.5 rounded">
              {totalInStoreStockUnits} pkgs
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-200">Alert warnings active:</span>
            <span className="text-xs font-mono font-bold text-amber-400 bg-slate-900 border border-slate-800 px-2 py-0.5 rounded">
              {lowStockCount} items
            </span>
          </div>
        </div>

        {/* Unified Restocking Form Card */}
        <div className="bg-slate-950/60 p-5 border border-slate-800 rounded-xl space-y-4 shadow-xl">
          <div className="pb-3 border-b border-slate-900">
            <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
              <Plus className="h-4 w-4 text-teal-400" />
              Easy Replenisher Form
            </h3>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Select any supplement Variant to increase count, assign manufacture codes, or edit shelf life limits.
            </p>
          </div>

          {!isManager ? (
            <div className="p-4 bg-slate-900/30 border border-slate-900 rounded-lg text-center">
              <ShieldCheck className="h-6 w-6 text-indigo-400 mx-auto mb-1.5 opacity-60" />
              <p className="text-[11px] text-slate-400 leading-snug">
                Restocking activities are logged under administrative actions. Login as Manager to edit inventory.
              </p>
            </div>
          ) : (
            <form onSubmit={handleRestockSubmit} className="space-y-4">
              
              {/* Product select box */}
              <div>
                <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                  Select Supplement *
                </label>
                <select
                  value={selectedProductId}
                  onChange={(e) => {
                    const prodId = e.target.value;
                    setSelectedProductId(prodId);
                    const prod = products.find(p => p.id === prodId);
                    if (prod) {
                      setRestockBatch(prod.batchNumber || '');
                      setRestockExpiry(prod.expiryDate || '');
                    }
                  }}
                  className="w-full bg-slate-900 border border-slate-800 focus:border-teal-500/60 text-slate-300 text-xs py-2 px-3 rounded-xl focus:outline-none"
                >
                  <option value="">-- Choose Supplement --</option>
                  {products.map(p => (
                    <option key={p.id} value={p.id}>
                      {p.brand} - {p.name} ({p.flavor} / {p.size}) [{p.currentStock} Units]
                    </option>
                  ))}
                </select>
              </div>

              {/* Quantity restocker adder */}
              <div>
                <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                  Restock Quantity (To Add) *
                </label>
                <input
                  type="number"
                  min="1"
                  required
                  value={restockQty}
                  onChange={(e) => setRestockQty(parseInt(e.target.value) || 0)}
                  className="w-full bg-slate-900 font-mono text-slate-200 border border-slate-800 focus:border-teal-500/60 rounded-xl text-xs py-2 px-4 focus:outline-none"
                />
              </div>

              {/* Optional Batch number */}
              <div>
                <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                  Manufacturing Batch Code (Optional)
                </label>
                <input
                  type="text"
                  value={restockBatch}
                  onChange={(e) => setRestockBatch(e.target.value)}
                  placeholder="e.g. BTC-993-ON"
                  className="w-full bg-slate-900 text-slate-200 border border-slate-800 focus:border-teal-500/60 rounded-xl text-xs py-2 px-3.5 placeholder-slate-600 focus:outline-none"
                />
              </div>

              {/* Optional expiry details for FEFO validation */}
              <div>
                <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                  Batch Expiration Date (Optional)
                </label>
                <input
                  type="date"
                  value={restockExpiry}
                  onChange={(e) => setRestockExpiry(e.target.value)}
                  className="w-full bg-slate-900 text-slate-200 border border-slate-800 focus:border-teal-500/60 rounded-xl text-xs py-2 px-3.5 focus:outline-none font-mono"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold rounded-xl text-xs uppercase tracking-wider transition-all select-none"
              >
                Execute Inventory Restock
              </button>

            </form>
          )}

          {/* Feedback messages */}
          {restockNote && (
            <div className="p-3 bg-slate-900/80 border border-emerald-900 rounded-lg text-emerald-400 text-xs leading-relaxed font-semibold">
              {restockNote}
            </div>
          )}

        </div>

      </div>

      {/* Right side: Inventory lists with filtering options (Columns 5 to 12) */}
      <div className="lg:col-span-8 space-y-4">
        
        {/* Filter sub tab headers */}
        <div className="flex bg-slate-950 p-1 border border-slate-850 rounded-xl gap-1">
          <button
            onClick={() => setActiveFilter('all')}
            className={`flex-1 py-2 px-3 text-xs font-semibold rounded-lg transition-all text-center flex items-center justify-center gap-1.5 ${
              activeFilter === 'all'
                ? 'bg-slate-900 border border-slate-800 text-slate-200'
                : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            <Package className="h-4 w-4 text-teal-400 shrink-0" />
            <span>All Store Stock</span>
          </button>

          <button
            onClick={() => setActiveFilter('low')}
            className={`flex-1 py-2 px-3 text-xs font-semibold rounded-lg transition-all text-center flex items-center justify-center gap-1.5 ${
              activeFilter === 'low'
                ? 'bg-slate-900 border border-slate-800 text-amber-400'
                : 'text-slate-500 hover:text-amber-400/80'
            }`}
          >
            <AlertTriangle className="h-4 w-4 text-amber-500 shrink-0" />
            <span>Low Stock Alerts ({lowStockCount})</span>
          </button>

          <button
            onClick={() => setActiveFilter('out')}
            className={`flex-1 py-2 px-3 text-xs font-semibold rounded-lg transition-all text-center flex items-center justify-center gap-1.5 ${
              activeFilter === 'out'
                ? 'bg-slate-900 border border-slate-800 text-rose-400'
                : 'text-slate-500 hover:text-rose-400/80'
            }`}
          >
            <Clock className="h-4 w-4 text-rose-500 shrink-0" />
            <span>Out of Stock ({outOfStockCount})</span>
          </button>

          <button
            onClick={() => setActiveFilter('fefo')}
            className={`flex-1 py-2 px-3 text-xs font-semibold rounded-lg transition-all text-center flex items-center justify-center gap-1.5 ${
              activeFilter === 'fefo'
                ? 'bg-gradient-to-r from-teal-500/10 to-teal-500/5 border border-teal-500/30 text-teal-300 font-bold'
                : 'text-slate-500 hover:text-teal-400/80'
            }`}
            title="Sort based on Expiry dates. Keeps shelf-products freshness validated."
          >
            <Calendar className="h-4 w-4 text-teal-400 shrink-0 animate-pulse" />
            <span>Supplement FEFO tracking</span>
          </button>
        </div>

        {/* Tab-specific descriptive banners */}
        {activeFilter === 'fefo' && (
          <div className="p-3 bg-teal-950/20 border border-teal-900/30 text-teal-400 rounded-xl text-xs leading-relaxed flex items-start gap-2.5">
            <CheckCircle className="h-4.5 w-4.5 shrink-0 mt-0.5 text-teal-400" />
            <div>
              <strong className="block font-bold">First-Expired, First-Out (FEFO) Model Active</strong>
              <span>Supplement batches are automatically organized below based on nearest expiration dates. We recommend selling items expiring soonest first to minimize wastage and protect customer wellness.</span>
            </div>
          </div>
        )}

        {/* Tables of inventory items */}
        <div className="bg-slate-950/40 border border-slate-800 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-900 text-slate-500 font-mono bg-slate-950">
                  <th className="py-3 px-4 font-medium">Product / Brand Variant</th>
                  <th className="py-3 px-4 font-medium">Category</th>
                  <th className="py-3 px-4 font-medium text-right font-mono">Stock Level</th>
                  <th className="py-3 px-4 font-medium text-center">Expiry Timeline</th>
                  <th className="py-3 px-4 font-medium text-center font-mono">Batch ID</th>
                  <th className="py-3 px-4 font-medium text-center">Status Flag</th>
                  {isManager && <th className="py-3 px-4 font-medium text-right">Replenish</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-900">
                {processedProducts.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-slate-500 bg-slate-950/10">
                      No matching supplements logged under this active filter criteria.
                    </td>
                  </tr>
                ) : (
                  processedProducts.map((p) => {
                    const isLow = p.currentStock <= p.lowStockLevel && p.currentStock > 0;
                    const isOut = p.currentStock === 0;

                    // Days to expiry tracking calculations
                    let expDaysLeftText = '';
                    let expBadgeStyle = 'bg-slate-905 text-slate-400 border border-slate-800';
                    
                    if (p.expiryDate) {
                      const expDate = new Date(p.expiryDate);
                      const today = new Date('2026-06-07'); // Simulation baseline date
                      const diffTime = expDate.getTime() - today.getTime();
                      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                      
                      if (diffDays <= 0) {
                        expDaysLeftText = 'EXPIRED BATCH ⚠️';
                        expBadgeStyle = 'bg-red-950 text-red-400 border border-red-900/55';
                      } else if (diffDays <= 90) {
                        expDaysLeftText = `Expiring soon (${diffDays} days)`;
                        expBadgeStyle = 'bg-amber-950 text-amber-400 border border-amber-900/55 font-semibold';
                      } else {
                        expDaysLeftText = `${diffDays} days remaining`;
                        expBadgeStyle = 'bg-emerald-950 text-emerald-400 border border-emerald-900/55';
                      }
                    } else {
                      expDaysLeftText = 'No Expiry Set';
                    }

                    return (
                      <tr 
                        key={p.id} 
                        className={`hover:bg-slate-900/30 transition-colors ${
                          selectedProductId === p.id ? 'bg-slate-900/60' : ''
                        }`}
                      >
                        
                        {/* Name brand specification variant link */}
                        <td className="py-3.5 px-4">
                          <p className="font-semibold text-slate-200">{p.name}</p>
                          <p className="text-[10px] text-slate-500 font-mono mt-0.5">
                            {p.brand} • Brand flavor: <strong className="text-slate-400 font-medium">{p.flavor}</strong> ({p.size})
                          </p>
                        </td>

                        {/* Category category badge */}
                        <td className="py-3.5 px-4 text-slate-400">
                          <span className="bg-slate-900 px-1.5 py-0.5 rounded text-[10px] font-mono whitespace-nowrap">
                            {p.category}
                          </span>
                        </td>

                        {/* Inventory stock column */}
                        <td className="py-3.5 px-4 text-right">
                          <span className={`font-mono font-bold ${
                            isOut ? 'text-rose-500' : isLow ? 'text-amber-500' : 'text-slate-300'
                          }`}>
                            {p.currentStock} units
                          </span>
                        </td>

                        {/* FEFO expirations dates tracking column */}
                        <td className="py-3.5 px-4 text-center">
                          <div className="flex flex-col items-center">
                            {p.expiryDate ? (
                              <>
                                <span className="font-mono text-xs text-slate-300">{p.expiryDate}</span>
                                <span className={`text-[9px] px-1.5 py-0.2 rounded font-mono font-semibold mt-1 ${expBadgeStyle}`}>
                                  {expDaysLeftText}
                                </span>
                              </>
                            ) : (
                              <span className="text-slate-600 font-mono">–</span>
                            )}
                          </div>
                        </td>

                        {/* Batch Number */}
                        <td className="py-3.5 px-4 text-center font-mono text-[10px] text-slate-400">
                          {p.batchNumber || <span className="text-slate-600">–</span>}
                        </td>

                        {/* Stock health status flag */}
                        <td className="py-3.5 px-4 text-center">
                          {isOut ? (
                            <span className="px-2 py-0.5 rounded text-[9px] font-mono font-bold bg-red-950 text-red-500 border border-red-900/40">
                              RELOAD Stock
                            </span>
                          ) : isLow ? (
                            <span className="px-2 py-0.5 rounded text-[9px] font-mono font-bold bg-amber-950 text-amber-500 border border-amber-900/40">
                              RELOAD Warn
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded text-[9px] font-mono font-bold bg-emerald-950 text-emerald-400 border border-emerald-900/40">
                              Good Stock
                            </span>
                          )}
                        </td>

                        {/* Quick stock button actions (exclusive manager role) */}
                        {isManager && (
                          <td className="py-3.5 px-4 text-right">
                            <button
                              type="button"
                              onClick={() => selectProductForQuickRestock(p)}
                              className="px-2.5 py-1 bg-slate-900 border border-slate-800 text-teal-400 hover:border-teal-500/40 text-[10px] font-bold rounded transition-all select-none flex items-center gap-1.5 ml-auto"
                            >
                              <span>Restock</span>
                              <ArrowUpRight className="h-3 w-3" />
                            </button>
                          </td>
                        )}

                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>

    </div>
  );
}
