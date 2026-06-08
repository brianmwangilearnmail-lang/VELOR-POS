/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  RotateCcw, 
  Search, 
  Receipt as ReceiptIcon, 
  CheckCircle, 
  ArrowRightLeft, 
  ShieldAlert,
  Calendar,
  DollarSign
} from 'lucide-react';
import { Product, Receipt, ReturnRecord, StoreSettings, UserAccount } from '../types';

interface ReturnsTabProps {
  receipts: Receipt[];
  products: Product[];
  settings: StoreSettings;
  currentUser: UserAccount;
  onExecuteReturnAndAdjustStock: (
    receiptNumber: string, 
    returnedItems: { productId: string; qty: number; returnToStock: boolean; reason: string }[],
    refundTotal: number
  ) => void;
  returnLedgerHistory: ReturnRecord[];
}

export default function ReturnsTab({
  receipts,
  products,
  settings,
  currentUser,
  onExecuteReturnAndAdjustStock,
  returnLedgerHistory
}: ReturnsTabProps) {

  // Safeguard role access control
  const isManager = currentUser.role === 'manager';

  const [receiptSearchCode, setReceiptSearchCode] = useState('');
  const [selectedReceipt, setSelectedReceipt] = useState<Receipt | null>(null);
  const [returnNote, setReturnNote] = useState('');

  // Items chosen for return state (productId -> { quantityToReturn, returnToStock, reason })
  const [returnLines, setReturnLines] = useState<{
    [productId: string]: {
      selected: boolean;
      qty: number;
      returnToStock: boolean;
      reason: string;
    }
  }>({});

  // Help cashier find receipts fast
  const handleReceiptSearch = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const cleanCode = receiptSearchCode.trim().toUpperCase();
    if (!cleanCode) return;

    const match = receipts.find(r => r.receiptNumber === cleanCode);
    if (!match) {
      alert(`Receipt ID "${cleanCode}" not found in system history files.`);
      return;
    }

    if (match.status === 'Returned') {
      alert('This transaction has already been fully refunded.');
      return;
    }

    setSelectedReceipt(match);
    
    // Initialize return lines with defaults
    const initialLines: typeof returnLines = {};
    match.items.forEach(item => {
      initialLines[item.productId] = {
        selected: false,
        qty: 1,
        returnToStock: true,
        reason: 'Flavor Preference Exchange'
      };
    });
    setReturnLines(initialLines);
  };

  const selectReceiptFromDropdown = (receiptNo: string) => {
    setReceiptSearchCode(receiptNo);
    const match = receipts.find(r => r.receiptNumber === receiptNo);
    if (match) {
      setSelectedReceipt(match);
      const initialLines: typeof returnLines = {};
      match.items.forEach(item => {
        initialLines[item.productId] = {
          selected: false,
          qty: 1,
          returnToStock: true,
          reason: 'Flavor Preference Exchange'
        };
      });
      setReturnLines(initialLines);
    }
  };

  const handleLineCheckboxChange = (productId: string, val: boolean) => {
    setReturnLines(prev => ({
      ...prev,
      [productId]: {
        ...prev[productId],
        selected: val
      }
    }));
  };

  const handleLineQtyChange = (productId: string, qty: number, maxQty: number) => {
    const clamped = Math.max(1, Math.min(maxQty, qty));
    setReturnLines(prev => ({
      ...prev,
      [productId]: {
        ...prev[productId],
        qty: clamped
      }
    }));
  };

  const handleLineToggleStock = (productId: string, val: boolean) => {
    setReturnLines(prev => ({
      ...prev,
      [productId]: {
        ...prev[productId],
        returnToStock: val
      }
    }));
  };

  const handleLineReasonChange = (productId: string, rsn: string) => {
    setReturnLines(prev => ({
      ...prev,
      [productId]: {
        ...prev[productId],
        reason: rsn
      }
    }));
  };

  const handleProcessRefundExecution = () => {
    if (!selectedReceipt) return;

    // Filter which items are selected
    const chosenLines = Object.keys(returnLines)
      .filter(pId => returnLines[pId].selected)
      .map(pId => {
        const originalItem = selectedReceipt.items.find(i => i.productId === pId)!;
        return {
          productId: pId,
          qty: returnLines[pId].qty,
          returnToStock: returnLines[pId].returnToStock,
          reason: returnLines[pId].reason,
          unitPriceAfterDiscount: originalItem.finalPrice / originalItem.quantity
        };
      });

    if (chosenLines.length === 0) {
      alert('You must select at least one supplement line item to return.');
      return;
    }

    // Compute refund total
    let totalRefundCost = 0;
    chosenLines.forEach(cl => {
      totalRefundCost += cl.qty * cl.unitPriceAfterDiscount;
    });

    // Apply exact tax adjustment proportion to refund
    const taxFactor = 1 + (settings.taxRatePercentage / 100);
    const totalRefundWithTax = totalRefundCost * taxFactor;

    // Execute callback: This is where we update local ledger receipts/quantities in high fidelity!
    onExecuteReturnAndAdjustStock(
      selectedReceipt.receiptNumber,
      chosenLines.map(cl => ({
        productId: cl.productId,
        qty: cl.qty,
        returnToStock: cl.returnToStock,
        reason: cl.reason
      })),
      totalRefundWithTax
    );

    setReturnNote(`✅ Return Processed: Refunded ${settings.currencySymbol}${totalRefundWithTax.toFixed(2)} to customer accounts. Inventory logs synced.`);
    
    // Reset state
    setSelectedReceipt(null);
    setReceiptSearchCode('');
    setReturnLines({});

    setTimeout(() => {
      setReturnNote('');
    }, 4500);
  };

  if (!isManager) {
    return (
      <div className="bg-slate-950/70 p-12 border border-slate-900 rounded-2xl flex flex-col items-center justify-center text-center font-sans">
        <div className="p-3 bg-red-500/10 text-red-500 border border-red-500/25 rounded-2xl mb-4">
          <ShieldAlert className="h-10 w-10 animate-pulse" />
        </div>
        <h3 className="text-base font-bold text-slate-200">
          Manager Authorization Required
        </h3>
        <p className="text-xs text-slate-500 max-w-sm mt-1 mb-4 leading-relaxed font-normal">
          Returns, cash drawer cancellations, inventory write-offs, and payment portal reverse transactions are limited exclusively to Manager/Admin operators.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 font-sans">
      
      {/* Header Overview */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-slate-900/40 p-4 border border-slate-800 rounded-xl">
        <div>
          <h1 className="text-xl font-bold text-slate-100 flex items-center gap-2">
            <RotateCcw className="h-5 w-5 text-teal-400" />
            Returns & Refund Center
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Lookup transaction keys, verify unopened barcodes, choose exchange reasons, and log updates to shelves.
          </p>
        </div>
      </div>

      {returnNote && (
        <div className="p-4 bg-emerald-950/40 border-2 border-emerald-900/40 text-emerald-400 text-xs rounded-xl flex items-center gap-2 font-semibold">
          <CheckCircle className="h-4.5 w-4.5 text-emerald-400 shrink-0" />
          <span>{returnNote}</span>
        </div>
      )}

      {/* Main Grid: Search and selection vs Previous Returns ledger */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left pane: Active exchange execution (Column 1 to 7/8) */}
        <div className="lg:col-span-8 space-y-4">
          
          <div className="bg-slate-950 p-5 border border-slate-800 rounded-xl space-y-4">
            
            <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider pb-3 border-b border-slate-900">
              Lookup Receipt Transaction
            </h3>

            {/* Quick selectors & Search inputs */}
            <div className="flex flex-col sm:flex-row gap-3 items-end">
              <form onSubmit={handleReceiptSearch} className="flex-1 space-y-1.5">
                <label className="block text-[10px] font-semibold text-teal-400 uppercase tracking-wider">
                  Select or Enter Receipt Number
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500">
                    <Search className="h-4 w-4" />
                  </span>
                  <input
                    type="text"
                    value={receiptSearchCode}
                    onChange={(e) => setReceiptSearchCode(e.target.value)}
                    placeholder="e.g. VEL-2026-0001"
                    className="w-full pl-10 pr-4 py-2 bg-slate-900 border border-slate-800 focus:border-teal-500/50 rounded-lg text-slate-200 placeholder-slate-600 focus:outline-none text-xs transition-all font-mono"
                  />
                </div>
              </form>

              <div className="flex items-center gap-1.5 shrink-0 self-end">
                <button
                  type="button"
                  onClick={() => handleReceiptSearch()}
                  className="px-4 py-2 bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold transition-all text-xs rounded-lg uppercase tracking-wide select-none h-9"
                >
                  Retrieve Items
                </button>
              </div>
            </div>

            {/* Quick dropdown select from active receipts history */}
            <div className="space-y-2 pt-2.5 border-t border-slate-900">
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                  Select Generated Transaction Receipt
                </span>
                <span className="text-[9px] text-slate-500 font-mono">
                  {receipts.filter(r => r.status === 'Completed').length} total receipts
                </span>
              </div>
              <div className="flex flex-wrap gap-1.5 max-h-40 overflow-y-auto pr-1">
                {receipts.filter(r => r.status === 'Completed').map(r => {
                  const isCurrent = selectedReceipt?.receiptNumber === r.receiptNumber;
                  return (
                    <button
                      key={r.receiptNumber}
                      type="button"
                      onClick={() => selectReceiptFromDropdown(r.receiptNumber)}
                      className={`px-2.5 py-1.5 rounded-lg text-xs font-mono transition-all border flex items-center gap-2 hover:shadow-md cursor-pointer ${
                        isCurrent
                          ? 'bg-teal-500 text-slate-950 border-teal-400 font-bold'
                          : 'bg-slate-900 hover:bg-slate-850 text-slate-300 border-slate-800 hover:border-teal-500/35'
                      }`}
                    >
                      <span className={isCurrent ? 'text-slate-950' : 'text-teal-400 font-semibold'}>
                        {r.receiptNumber}
                      </span>
                      <span className="opacity-80">
                        {settings.currencySymbol}{r.grandTotal.toFixed(2)}
                      </span>
                      {r.customerName && (
                        <span className="text-[9px] border-l border-current pl-1.5 opacity-60 max-w-24 truncate">
                          {r.customerName}
                        </span>
                      )}
                    </button>
                  );
                })}
                {receipts.filter(r => r.status === 'Completed').length === 0 && (
                  <p className="text-[10px] text-slate-500 italic py-1 col-span-full">No completed transactions logged in system.</p>
                )}
              </div>
            </div>

          </div>

          {/* Active selection lines display */}
          {selectedReceipt && (
            <div className="bg-slate-950 p-5 border border-slate-800 rounded-xl space-y-4 animate-fade animate-duration-150">
              
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3.5 border-b border-slate-900 gap-1.5">
                <div>
                  <h4 className="text-xs font-bold text-slate-200 font-mono">
                    Receipt details: <span className="text-teal-400">{selectedReceipt.receiptNumber}</span>
                  </h4>
                  <p className="text-[10px] text-slate-500 mt-0.5">
                    Checked out by cash terminal specialist {selectedReceipt.cashierName} on {new Date(selectedReceipt.date).toLocaleString()}
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-slate-500 font-mono block">Original Total:</span>
                  <span className="text-sm font-bold text-slate-100 font-mono">
                    {settings.currencySymbol}{selectedReceipt.grandTotal.toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Items in that receipt */}
              <div className="space-y-4">
                {selectedReceipt.items.map((item) => {
                  const lineId = item.productId;
                  const currentLineState = returnLines[lineId] || { selected: false, qty: 1, returnToStock: true, reason: 'Flavor Preference Exchange' };
                  
                  return (
                    <div 
                      key={lineId} 
                      className={`p-4 rounded-xl border transition-all ${
                        currentLineState.selected 
                          ? 'bg-slate-900/60 border-teal-500/40' 
                          : 'bg-slate-900/10 border-slate-900 hover:bg-slate-900/20'
                      }`}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                        
                        {/* Selector check box + Info */}
                        <div className="flex items-start gap-3">
                          <input
                            type="checkbox"
                            checked={currentLineState.selected}
                            onChange={(e) => handleLineCheckboxChange(lineId, e.target.checked)}
                            className="mt-1 h-4.5 w-4.5 bg-slate-950 text-teal-400 accent-teal-500 rounded border-slate-800 shrink-0"
                          />
                          <div>
                            <span className="font-semibold text-slate-200 block text-xs">
                              {item.name}
                            </span>
                            <span className="text-[10px] text-slate-500 font-mono block mt-0.5">
                              {item.brand} • {item.flavor} ({item.size})
                            </span>
                            <span className="text-[10px] text-slate-400 font-mono block mt-1">
                              Bought quantity limit: <strong className="text-slate-300 font-semibold">{item.quantity} units</strong> @ {settings.currencySymbol}{(item.finalPrice/item.quantity).toFixed(2)}
                            </span>
                          </div>
                        </div>

                        {/* Return options (Only accessible if checked) */}
                        {currentLineState.selected && (
                          <div className="space-y-2.5 sm:text-right shrink-0">
                            
                            {/* Quantity to return input */}
                            <div className="flex items-center sm:justify-end gap-1.5 text-xs text-slate-300 select-none">
                              <span>Return Qty:</span>
                              <input
                                type="number"
                                min="1"
                                max={item.quantity}
                                value={currentLineState.qty}
                                onChange={(e) => handleLineQtyChange(lineId, parseInt(e.target.value) || 1, item.quantity)}
                                className="w-12 bg-slate-950 text-slate-200 border border-slate-800 text-center font-mono py-1 rounded text-xs focus:outline-none"
                              />
                            </div>

                            {/* Dropdown swap return reasons */}
                            <div className="flex items-center sm:justify-end gap-1.5 text-xs text-slate-300">
                              <span>Reason:</span>
                              <select
                                value={currentLineState.reason}
                                onChange={(e) => handleLineReasonChange(lineId, e.target.value)}
                                className="bg-slate-950 text-slate-300 border border-slate-800 rounded px-2 py-1 text-xs focus:outline-none"
                              >
                                <option value="Flavor Preference Exchange">Flavor Swap</option>
                                <option value="Damaged / Opened Container">Damaged Container</option>
                                <option value="Expired Product">Shelf Expired</option>
                                <option value="Accidental Purchase">Accidental Buy</option>
                              </select>
                            </div>

                            {/* Stock restore toggle checkbox */}
                            <div className="flex items-center sm:justify-end gap-2 text-xs text-slate-300 select-none">
                              <span>Add back to registers stock?</span>
                              <input
                                type="checkbox"
                                checked={currentLineState.returnToStock}
                                onChange={(e) => handleLineToggleStock(lineId, e.target.checked)}
                                className="h-4.5 w-4.5 bg-slate-950 accent-teal-500 rounded border-slate-800"
                              />
                            </div>

                          </div>
                        )}

                        {!currentLineState.selected && (
                          <span className="text-[10px] text-slate-500 font-mono italic">
                            Unselected
                          </span>
                        )}

                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Confirm Refund execution button trigger */}
              <div className="pt-4 border-t border-slate-900 flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setSelectedReceipt(null)}
                  className="px-4 py-2 hover:bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200 text-xs rounded-xl font-medium"
                >
                  Discard Exchange
                </button>

                <button
                  type="button"
                  onClick={handleProcessRefundExecution}
                  className="px-5 py-2 bg-rose-500 hover:bg-rose-400 text-slate-950 font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-shadow shadow-md hover:shadow-lg select-none"
                >
                  <ArrowRightLeft className="h-3.5 w-3.5" />
                  <span>Authorize Refund Disbursement</span>
                </button>
              </div>

            </div>
          )}

        </div>

        {/* Right pane: Static returns logger list (Column 8 to 12) */}
        <div className="lg:col-span-4 space-y-4">
          
          <div className="bg-slate-950/60 p-5 border border-slate-800 rounded-xl space-y-4">
            
            <div className="pb-3 border-b border-slate-900 flex items-center gap-2">
              <RotateCcw className="h-4.5 w-4.5 text-teal-400 shrink-0" />
              <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                Historic Return Ledger
              </h3>
            </div>

            {returnLedgerHistory.length === 0 ? (
              <div className="py-12 text-center text-slate-600 text-xs">
                No returned products logged during this simulation session.
              </div>
            ) : (
              <div className="space-y-4.5 max-h-[500px] overflow-y-auto pr-1">
                {returnLedgerHistory.map((rec) => (
                  <div key={rec.id} className="p-3.5 bg-slate-900/40 border border-slate-900 rounded-xl space-y-2 text-xs">
                    
                    <div className="flex items-center justify-between font-mono pb-1 border-b border-slate-950/25">
                      <span className="text-teal-400 font-bold">{rec.receiptNumber}</span>
                      <span className="text-[10px] text-slate-500">
                        {new Date(rec.date).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>

                    <div className="space-y-1">
                      {rec.items.map((it, idx) => (
                        <div key={idx} className="flex justify-between items-start text-[11px] text-slate-300 leading-tight">
                          <span>
                            {it.name} (x{it.quantity})
                          </span>
                          <span className="text-[10px] text-slate-500 font-mono lowercase">
                            {it.returnedToStock ? 'stocked' : 'wasted'}
                          </span>
                        </div>
                      ))}
                    </div>

                    <div className="pt-2 border-t border-slate-900 flex items-center justify-between text-xs">
                      <div>
                        <span className="text-[9px] text-slate-500 uppercase font-semibold">REFUND AMOUNT:</span>
                        <div className="flex items-center text-rose-400 font-mono font-bold leading-none mt-0.5">
                          <DollarSign className="h-3 w-3 shrink-0" />
                          <span>{rec.refundAmount.toFixed(2)}</span>
                        </div>
                      </div>
                      <span className="text-[9px] text-slate-500 font-mono">
                        Author: {rec.cashierName.split(' ')[0]}
                      </span>
                    </div>

                  </div>
                ))}
              </div>
            )}

          </div>

        </div>

      </div>

    </div>
  );
}
