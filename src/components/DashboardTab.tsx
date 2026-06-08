/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { 
  DollarSign, 
  Receipt as ReceiptIcon, 
  AlertTriangle, 
  TrendingUp, 
  Calendar,
  Layers,
  ArrowUpRight,
  PackageCheck
} from 'lucide-react';
import { Product, Receipt, StoreSettings } from '../types';

interface DashboardTabProps {
  products: Product[];
  receipts: Receipt[];
  settings: StoreSettings;
  onNavigateToTab: (tab: string) => void;
  onViewReceipt: (receipt: Receipt) => void;
}

export default function DashboardTab({
  products,
  receipts,
  settings,
  onNavigateToTab,
  onViewReceipt
}: DashboardTabProps) {
  
  // Calculate stats based on receipts and products
  const lowStockItems = products.filter(p => p.isActive && p.currentStock <= p.lowStockLevel);
  const outOfStockCount = products.filter(p => p.isActive && p.currentStock === 0).length;

  // Let's filter today's receipts using 2026-06-07 as the "today" timeline for the demo or any receipt from user's current day
  // Here, let's look at either the user's latest receipts.
  // We'll compute "Global Overall" and "Today's" sales
  const todayDateStr = "2026-06-07"; // matches our seed timelines
  
  const todayReceipts = receipts.filter(r => r.date.startsWith(todayDateStr) && r.status !== 'Returned');
  const todaySales = todayReceipts.reduce((sum, r) => sum + r.grandTotal, 0);
  const totalSalesOverall = receipts.filter(r => r.status !== 'Returned').reduce((sum, r) => sum + r.grandTotal, 0);

  // Compute best sellers
  const sellCounters: { [key: string]: { name: string; brand: string; qty: number; sales: number } } = {};
  
  receipts.forEach(receipt => {
    if (receipt.status === 'Returned') return;
    receipt.items.forEach(item => {
      if (sellCounters[item.productId]) {
        sellCounters[item.productId].qty += item.quantity;
        sellCounters[item.productId].sales += item.finalPrice;
      } else {
        sellCounters[item.productId] = {
          name: item.name,
          brand: item.brand,
          qty: item.quantity,
          sales: item.finalPrice
        };
      }
    });
  });

  const bestSellers = Object.values(sellCounters)
    .sort((a, b) => b.qty - a.qty)
    .slice(0, 4);

  // Recent transactions
  const fileRecentReceipts = [...receipts]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5);

  return (
    <div className="space-y-6 font-sans">
      
      {/* Upper header action area */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-slate-900/40 p-4 border border-slate-800 rounded-xl">
        <div>
          <h1 className="text-xl font-bold text-slate-100">
            Store Terminal Overview
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Real-time sales, inventory warning alerts, and automated receipts metrics.
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs text-slate-400 bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-800 font-mono">
          <Calendar className="h-3.5 w-3.5 text-teal-400 shrink-0" />
          <span>Simulation Date: 2026-06-07</span>
        </div>
      </div>

      {/* Main Grid Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Today's Sales */}
        <button 
          onClick={() => onNavigateToTab('receipts')}
          className="bg-slate-950/70 border border-slate-800 rounded-xl p-5 relative overflow-hidden transition-all hover:border-teal-500/40 hover:bg-slate-900/50 text-left w-full focus:outline-none focus:ring-2 focus:ring-teal-500/20 group cursor-pointer shadow-sm hover:shadow-md"
        >
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider group-hover:text-teal-400 transition-colors">
                Today's Sales
              </p>
              <h3 className="text-2xl font-bold text-slate-100 mt-2 font-sans group-hover:text-white transition-colors">
                {settings.currencySymbol}{todaySales.toFixed(2)}
              </h3>
            </div>
            <div className="p-2.5 bg-teal-500/10 text-teal-400 border border-teal-500/20 rounded-lg group-hover:bg-teal-500/20 group-hover:scale-105 transition-all">
              <DollarSign className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-4 flex items-center justify-between text-[11px] text-slate-500 font-mono border-t border-slate-900/60 pt-2.5">
            <span>Overall Revenue:</span>
            <span className="text-slate-300 font-semibold group-hover:text-teal-300 transition-colors">
              {settings.currencySymbol}{totalSalesOverall.toFixed(2)}
            </span>
          </div>
        </button>

        {/* Total Transactions */}
        <button 
          onClick={() => onNavigateToTab('receipts')}
          className="bg-slate-950/70 border border-slate-800 rounded-xl p-5 relative overflow-hidden transition-all hover:border-indigo-500/40 hover:bg-slate-900/50 text-left w-full focus:outline-none focus:ring-2 focus:ring-indigo-500/20 group cursor-pointer shadow-sm hover:shadow-md"
        >
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider group-hover:text-indigo-400 transition-colors">
                Transactions Count
              </p>
              <h3 className="text-2xl font-bold text-slate-100 mt-2 font-sans group-hover:text-white transition-colors">
                {receipts.length}
              </h3>
            </div>
            <div className="p-2.5 bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 rounded-lg group-hover:bg-indigo-500/20 group-hover:scale-105 transition-all">
              <ReceiptIcon className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-4 flex items-center justify-between text-[11px] text-slate-500 font-mono border-t border-slate-900/60 pt-2.5">
            <span>Completed Today:</span>
            <span className="text-indigo-400 font-semibold group-hover:text-indigo-300 transition-colors">{todayReceipts.length} successful</span>
          </div>
        </button>

        {/* Low Stock Items Alert Card */}
        <button 
          onClick={() => onNavigateToTab('inventory')}
          className="bg-slate-950/70 border border-slate-800 rounded-xl p-5 relative overflow-hidden transition-all hover:border-amber-500/40 hover:bg-slate-900/50 text-left w-full focus:outline-none focus:ring-2 focus:ring-amber-500/20 group cursor-pointer shadow-sm hover:shadow-md"
        >
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider group-hover:text-amber-400 transition-colors">
                Low Stock Alerts
              </p>
              <h3 className="text-2xl font-bold text-amber-400 mt-2 font-sans group-hover:text-amber-300 transition-colors">
                {lowStockItems.length}
              </h3>
            </div>
            <div className="p-2.5 bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded-lg group-hover:bg-amber-500/20 group-hover:scale-105 transition-all">
              <AlertTriangle className="h-5 w-5 animation-pulse" />
            </div>
          </div>
          <div className="mt-4 flex items-center justify-between text-[11px] text-slate-500 font-mono border-t border-slate-900/60 pt-2.5">
            <span>Totally Out of Stock:</span>
            <span className="text-rose-400 font-semibold group-hover:text-rose-300 transition-colors">{outOfStockCount} items</span>
          </div>
        </button>

        {/* Active Products Catalog */}
        <button 
          onClick={() => onNavigateToTab('products')}
          className="bg-slate-950/70 border border-slate-800 rounded-xl p-5 relative overflow-hidden transition-all hover:border-sky-500/40 hover:bg-slate-900/50 text-left w-full focus:outline-none focus:ring-2 focus:ring-sky-500/20 group cursor-pointer shadow-sm hover:shadow-md"
        >
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider group-hover:text-sky-400 transition-colors">
                Store Catalog
              </p>
              <h3 className="text-2xl font-bold text-slate-100 mt-2 font-sans group-hover:text-white transition-colors">
                {products.length}
              </h3>
            </div>
            <div className="p-2.5 bg-sky-500/10 text-sky-400 border border-sky-500/20 rounded-lg group-hover:bg-sky-500/20 group-hover:scale-105 transition-all">
              <Layers className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-4 flex items-center justify-between text-[11px] text-slate-500 font-mono border-t border-slate-900/60 pt-2.5">
            <span>Inactive Products:</span>
            <span className="text-slate-300 font-semibold group-hover:text-sky-300 transition-colors">
              {products.filter(p => !p.isActive).length} items
            </span>
          </div>
        </button>
      </div>

      {/* Middle Grid: Best Sellers vs Stock Warnings */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Top Selling Products List */}
        <div className="bg-slate-950/50 border border-slate-800 rounded-xl p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-900">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4.5 w-4.5 text-teal-400 shrink-0" />
                <h4 className="text-xs font-semibold text-slate-200 uppercase tracking-wider">
                  Top-Selling Supplements (By Qty Sold)
                </h4>
              </div>
              <button 
                onClick={() => onNavigateToTab('pos')}
                className="text-[10px] text-teal-400 hover:text-teal-300 flex items-center gap-1 font-medium select-none"
              >
                <span>New Sale</span>
                <ArrowUpRight className="h-3 w-3" />
              </button>
            </div>

            {bestSellers.length === 0 ? (
              <div className="h-40 flex flex-col items-center justify-center text-center text-slate-500">
                <PackageCheck className="h-8 w-8 text-slate-600 mb-2" />
                <p className="text-xs">No supplement sales data recorded yet.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {bestSellers.map((item, idx) => {
                  // Calculate percentage width for visual chart bars
                  const maxQty = Math.max(...bestSellers.map(b => b.qty)) || 1;
                  const percentWidth = (item.qty / maxQty) * 100;

                  return (
                    <div key={idx} className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <div className="min-w-0 pr-2">
                          <span className="font-medium text-slate-200 truncate block">
                            {item.name}
                          </span>
                          <span className="text-[10px] text-slate-500 font-mono block">
                            {item.brand}
                          </span>
                        </div>
                        <div className="text-right shrink-0">
                          <span className="font-mono text-slate-300 font-semibold block">
                            {item.qty} sold
                          </span>
                          <span className="text-[10px] text-teal-500 font-mono block">
                            {settings.currencySymbol}{item.sales.toFixed(2)}
                          </span>
                        </div>
                      </div>
                      <div className="w-full bg-slate-900 rounded-full h-1.5 overflow-hidden">
                        <div 
                          className="bg-gradient-to-r from-teal-500 to-emerald-400 h-1.5 rounded-full"
                          style={{ width: `${percentWidth}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
          <div className="mt-4 pt-3 border-t border-slate-900 text-center">
            <span className="text-[10px] text-slate-500 font-mono">
              Calculated dynamically from active receipts state
            </span>
          </div>
        </div>

        {/* Low Stock Warning List */}
        <div className="bg-slate-950/50 border border-slate-800 rounded-xl p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-900">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-4.5 w-4.5 text-amber-500 shrink-0" />
                <h4 className="text-xs font-semibold text-slate-200 uppercase tracking-wider">
                  Critical Stock Warnings
                </h4>
              </div>
              <button 
                onClick={() => onNavigateToTab('inventory')}
                className="text-[10px] text-amber-400 hover:text-amber-300 flex items-center gap-1 font-medium select-none"
              >
                <span>Restock Inventory</span>
                <ArrowUpRight className="h-3 w-3" />
              </button>
            </div>

            {lowStockItems.length === 0 ? (
              <div className="h-40 flex flex-col items-center justify-center text-center text-teal-500/80">
                <PackageCheck className="h-8 w-8 text-teal-600 mb-2" />
                <p className="text-xs">All supplement stocks are looking healthy!</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-48 overflow-y-auto pr-1">
                {lowStockItems.map((prod) => (
                  <div 
                    key={prod.id} 
                    className="flex items-center justify-between p-2.5 rounded-lg bg-slate-900/40 border border-slate-900 hover:border-slate-800 text-xs"
                  >
                    <div>
                      <p className="font-medium text-slate-300">{prod.name}</p>
                      <p className="text-[10px] text-slate-500 font-mono mt-0.5">
                        Brand: {prod.brand} • Flavor: {prod.flavor} ({prod.size})
                      </p>
                    </div>
                    <div className="text-right">
                      {prod.currentStock === 0 ? (
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-rose-950 text-rose-400 border border-rose-900/40">
                          OUT OF STOCK
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-950 text-amber-400 border border-amber-900/40">
                          LOW ({prod.currentStock} left)
                        </span>
                      )}
                      <p className="text-[10px] text-slate-500 font-mono mt-1">
                        Min. Level: {prod.lowStockLevel}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className="mt-4 pt-3 border-t border-slate-900 text-center">
            <span className="text-[10px] text-slate-500 font-mono">
              Configure parameters inside Products or Inventory tabs
            </span>
          </div>
        </div>

      </div>

      {/* bottom half: Recent receipts log */}
      <div className="bg-slate-950/50 border border-slate-800 rounded-xl p-5">
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-900">
          <div className="flex items-center gap-2">
            <ReceiptIcon className="h-4.5 w-4.5 text-teal-400 shrink-0" />
            <h4 className="text-xs font-semibold text-slate-200 uppercase tracking-wider">
              Recent Transactions Terminal Log
            </h4>
          </div>
          <button 
            onClick={() => onNavigateToTab('receipts')}
            className="text-[10px] text-teal-400 hover:text-teal-300 flex items-center gap-1 font-medium select-none"
          >
            <span>View All Receipts</span>
            <ArrowUpRight className="h-3 w-3" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-900 text-slate-500 font-mono">
                <th className="py-2.5 font-medium">Receipt #</th>
                <th className="py-2.5 font-medium">Date & Time</th>
                <th className="py-2.5 font-medium">Cashier</th>
                <th className="py-2.5 font-medium">Customer Email</th>
                <th className="py-2.5 font-medium text-right">Items Count</th>
                <th className="py-2.5 font-medium text-right">Total Price</th>
                <th className="py-2.5 font-medium text-center">Receipt Link</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-900">
              {fileRecentReceipts.map((receipt) => {
                const totalUnits = receipt.items.reduce((sum, item) => sum + item.quantity, 0);
                const formattedDate = new Date(receipt.date).toLocaleString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                  hour12: true
                });

                return (
                  <tr 
                    key={receipt.receiptNumber} 
                    className="hover:bg-slate-900/30 transition-colors text-slate-300 group"
                  >
                    <td className="py-3 font-mono font-semibold text-teal-400">
                      {receipt.receiptNumber}
                    </td>
                    <td className="py-3 font-mono text-slate-400">
                      {formattedDate}
                    </td>
                    <td className="py-3 font-medium">
                      {receipt.cashierName}
                    </td>
                    <td className="py-3 font-mono text-slate-400 truncate max-w-[140px]">
                      {receipt.customerEmail || '—'}
                    </td>
                    <td className="py-3 font-mono text-right text-slate-400">
                      {totalUnits} pkg
                    </td>
                    <td className="py-3 font-mono text-right font-semibold text-slate-200">
                      {settings.currencySymbol}{receipt.grandTotal.toFixed(2)}
                    </td>
                    <td className="py-3 text-center">
                      <button
                        onClick={() => onViewReceipt(receipt)}
                        className="px-2.5 py-1 rounded bg-slate-900 border border-slate-800 text-teal-400 text-[10px] font-semibold hover:border-teal-500/40 transition-all"
                      >
                        Print replica
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
