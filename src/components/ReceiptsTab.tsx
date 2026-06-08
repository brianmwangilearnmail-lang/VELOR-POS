/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Receipt as ReceiptIcon, 
  Search, 
  Calendar, 
  Printer, 
  Mail, 
  X, 
  CheckCircle, 
  RotateCcw,
  Sparkles,
  MailCheck, 
  Eye
} from 'lucide-react';
import { Receipt, StoreSettings, UserAccount } from '../types';

interface ReceiptsTabProps {
  receipts: Receipt[];
  settings: StoreSettings;
  currentUser: UserAccount;
}

export default function ReceiptsTab({
  receipts,
  settings,
  currentUser
}: ReceiptsTabProps) {

  const [keywordQuery, setKeywordQuery] = useState('');
  const [dateQuery, setDateQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | 'Completed' | 'Returned'>('All');

  // Detail Modal overlay states
  const [selectedReceipt, setSelectedReceipt] = useState<Receipt | null>(null);
  const [emailStatus, setEmailStatus] = useState<'none' | 'sending' | 'sent'>('none');
  const [customReceiptEmail, setCustomReceiptEmail] = useState('');

  // Filters computed receipts list
  const filteredReceipts = receipts.filter(r => {
    // Search keyword maps receipt code, cashier, or customerEmail
    const term = keywordQuery.trim().toLowerCase();
    const matchKeyword = !term ||
      r.receiptNumber.toLowerCase().includes(term) ||
      r.cashierName.toLowerCase().includes(term) ||
      (r.customerName && r.customerName.toLowerCase().includes(term)) ||
      (r.customerEmail && r.customerEmail.toLowerCase().includes(term));

    // Date substring filter
    const matchDate = !dateQuery || r.date.startsWith(dateQuery);

    // Status filter matches
    let matchStatus = true;
    if (statusFilter === 'Completed') matchStatus = r.status === 'Completed';
    else if (statusFilter === 'Returned') matchStatus = r.status === 'Returned' || r.status === 'Partially Returned';

    return matchKeyword && matchDate && matchStatus;
  });

  // Launch printer simulation
  const handlePrintReplica = (r: Receipt) => {
    const backupWindow = window.open('', '_blank');
    if (!backupWindow) {
      alert('Proof replica copied to browser memory. Please check popup blockers to view full print mock.');
      return;
    }

    backupWindow.document.write(`
      <html>
        <head>
          <title>COPY RECEIPT - ${r.receiptNumber}</title>
          <style>
            body { font-family: 'Courier New', monospace; color: #000; padding: 15px; font-size: 13px; width: 280px; margin: 0 auto; }
            .text-center { text-align: center; }
            .border-top { border-top: 1px dotted #000; margin-top: 8px; padding-top: 8px; }
            .flex-between { display: flex; justify-content: space-between; }
            .bold { font-weight: bold; }
            .tag { border: 2px solid #000; display: inline-block; padding: 4px 10px; margin: 10px 0; font-weight: bold; }
          </style>
        </head>
        <body>
          <div class="text-center">
            <span class="tag">DUPLICATE COPY</span>
            <h3>${settings.storeName.toUpperCase()}</h3>
            <p>${settings.storeAddress}</p>
          </div>
          <div class="border-top">
            <p>Date: ${new Date(r.date).toLocaleString()}<br/>
            Rcpt #: ${r.receiptNumber}<br/>
            Status: ${r.status.toUpperCase()}<br/>
            Staff Cashier: ${r.cashierName}<br/>
            ${r.customerName ? `Customer: ${r.customerName}<br/>` : ''}
            ${r.customerEmail ? `Email: ${r.customerEmail}` : ''}</p>
          </div>
          <div class="border-top">
            ${r.items.map(i => `
              <div class="flex-between">
                <span>${i.name} (x${i.quantity})</span>
                <span>${settings.currencySymbol}${i.finalPrice.toFixed(2)}</span>
              </div>
            `).join('')}
          </div>
          <div class="border-top">
            <div class="flex-between"><span>Subtotal:</span><span>${settings.currencySymbol}${r.subtotal.toFixed(2)}</span></div>
            <div class="flex-between"><span>Discount:</span><span>-${settings.currencySymbol}${r.discountTotal.toFixed(2)}</span></div>
            <div class="flex-between"><span>Tax Fee:</span><span>${settings.currencySymbol}${r.taxTotal.toFixed(2)}</span></div>
            <div class="flex-between bold"><span>GRAND TOTAL:</span><span>${settings.currencySymbol}${r.grandTotal.toFixed(2)}</span></div>
          </div>
          <p class="text-center border-top">Thank you for fueling with ${settings.storeName}!</p>
        </body>
      </html>
    `);
    backupWindow.document.close();
    backupWindow.print();
  };

  const handleOpenDetailModal = (r: Receipt) => {
    setSelectedReceipt(r);
    setCustomReceiptEmail(r.customerEmail || '');
    setEmailStatus('none');
  };

  // Resend email notifier mockings
  const handleResendReceiptEmailAction = () => {
    if (!customReceiptEmail.trim()) {
      alert('Please state a recipient email address.');
      return;
    }
    setEmailStatus('sending');
    setTimeout(() => {
      setEmailStatus('sent');
      if (selectedReceipt) {
        selectedReceipt.customerEmail = customReceiptEmail.trim(); // save back simulation
      }
    }, 1500);
  };

  return (
    <div className="space-y-6 font-sans">
      
      {/* Header Overview line */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-slate-900/40 p-4 border border-slate-800 rounded-xl">
        <div>
          <h1 className="text-xl font-bold text-slate-100 flex items-center gap-2">
            <ReceiptIcon className="h-5 w-5 text-teal-400" />
            Historic Receipt Archives
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Query past checkout registers, print replica copy slips, or resend digital invoices to customer accounts.
          </p>
        </div>
      </div>

      {/* Query Search Panel controls */}
      <div className="bg-slate-950/60 p-4 border border-slate-800 rounded-xl flex flex-col md:flex-row gap-4 items-center justify-between">
        
        {/* keyword text search */}
        <div className="relative w-full md:w-80 select-none">
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500">
            <Search className="h-4 w-4" />
          </span>
          <input
            type="text"
            value={keywordQuery}
            onChange={(e) => setKeywordQuery(e.target.value)}
            placeholder="Search by Cashier, Receipt ID, or Email..."
            className="w-full pl-10 pr-4 py-2 bg-slate-900 border border-slate-800 focus:border-teal-500/60 rounded-lg text-slate-200 placeholder-slate-500 focus:outline-none text-xs transition-all"
          />
        </div>

        {/* Date query filter */}
        <div className="flex flex-wrap items-center gap-4 w-full md:w-auto">
          
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-slate-500 shrink-0" />
            <span className="text-[10px] text-slate-500 font-mono uppercase tracking-wider">Date query:</span>
            <input
              type="date"
              value={dateQuery}
              onChange={(e) => setDateQuery(e.target.value)}
              className="bg-slate-900 border border-slate-800 text-slate-200 text-xs py-1.5 px-3 rounded-lg focus:outline-none focus:border-teal-500/45 font-mono"
            />
            {dateQuery && (
              <button 
                onClick={() => setDateQuery('')}
                className="text-[10px] text-teal-500 hover:text-teal-400 font-mono link select-none"
              >
                Clear
              </button>
            )}
          </div>

          {/* Status Tabs filters */}
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] text-slate-500 font-mono uppercase tracking-wider">Ledger:</span>
            <div className="inline-flex bg-slate-900 border border-slate-800 p-0.5 rounded-lg text-[11px]">
              {['All', 'Completed', 'Returned'].map((st) => (
                <button
                  key={st}
                  type="button"
                  onClick={() => setStatusFilter(st as any)}
                  className={`px-3 py-1 transition-all rounded font-medium ${
                    statusFilter === st
                      ? 'bg-teal-500/10 text-teal-400 font-bold'
                      : 'text-slate-500 hover:text-slate-300'
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>

        </div>

      </div>

      {/* Receipts listing table data */}
      <div className="bg-slate-950/40 border border-slate-800 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-900 text-slate-500 font-mono bg-slate-950">
                <th className="py-3 px-4 font-medium">Receipt ID</th>
                <th className="py-3 px-4 font-medium">Checkout Date</th>
                <th className="py-3 px-4 font-medium">Active Cashier</th>
                <th className="py-3 px-4 font-medium">Customer Name</th>
                <th className="py-3 px-4 font-medium">Customer Email</th>
                <th className="py-3 px-4 font-medium text-right">Items Specification</th>
                <th className="py-3 px-4 font-medium text-right">Total Price</th>
                <th className="py-3 px-4 font-medium text-center">Checkout Status</th>
                <th className="py-3 px-4 font-medium text-right">Receipt Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-900">
              {filteredReceipts.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-500 bg-slate-950/10">
                    No transactions found in system histories matching description query.
                  </td>
                </tr>
              ) : (
                filteredReceipts.map((r) => {
                  const totalItemsQty = r.items.reduce((sum, i) => sum + i.quantity, 0);
                  const parsedTime = new Date(r.date).toLocaleString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                    hour12: true
                  });

                  return (
                    <tr key={r.receiptNumber} className="hover:bg-slate-900/40 transition-colors">
                      
                      {/* Receipt code */}
                      <td className="py-3.5 px-4 font-mono font-bold text-teal-400">
                        {r.receiptNumber}
                      </td>

                      {/* Expiry / Date timestamp */}
                      <td className="py-3.5 px-4 font-mono text-slate-400">
                        {parsedTime}
                      </td>

                      {/* Staff operator */}
                      <td className="py-3.5 px-4 font-medium text-slate-300">
                        {r.cashierName}
                      </td>

                      {/* Customer Name */}
                      <td className="py-3.5 px-4 text-slate-300 max-w-[120px] truncate">
                        {r.customerName || <span className="text-slate-650">—</span>}
                      </td>

                      {/* Email descriptor */}
                      <td className="py-3.5 px-4 font-mono text-slate-400 max-w-[120px] truncate">
                        {r.customerEmail || <span className="text-slate-650">—</span>}
                      </td>

                      {/* Packages size counter */}
                      <td className="py-3.5 px-4 text-right font-mono text-slate-400">
                        {totalItemsQty} items
                      </td>

                      {/* Sum money details */}
                      <td className="py-3.5 px-4 text-right font-mono font-bold text-slate-200">
                        {settings.currencySymbol}{r.grandTotal.toFixed(2)}
                      </td>

                      {/* checkout state */}
                      <td className="py-3.5 px-4 text-center">
                        {r.status === 'Completed' ? (
                          <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-teal-950/60 text-teal-400 border border-teal-900/40">
                            COMPLETED
                          </span>
                        ) : r.status === 'Partially Returned' ? (
                          <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-950/60 text-amber-400 border border-amber-900/40">
                            PARTIAL RETURN
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-rose-950/60 text-rose-400 border border-rose-900/40">
                            RETURNED / REFUND
                          </span>
                        )}
                      </td>

                      {/* Actions button trigger detailed slip screen */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => handlePrintReplica(r)}
                            className="p-1 px-2 border border-slate-800 hover:border-slate-700 hover:bg-slate-900/40 rounded text-[10px] font-bold text-slate-400 transition-colors flex items-center gap-1 shrink-0"
                            title="Directly trigger prints replica draft copies"
                          >
                            <Printer className="h-3 w-3" />
                            <span>Print slip</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => handleOpenDetailModal(r)}
                            className="p-1 px-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-teal-400 rounded text-[10px] font-bold transition-all flex items-center gap-1.5 shrink-0"
                          >
                            <Eye className="h-3 w-3" />
                            <span>Inspect</span>
                          </button>
                        </div>
                      </td>

                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* DYNAMIC MODAL: COMPREHENSIVE RECEIPT VIEWER WITH MOCK THERMAL DISPLAY */}
      {selectedReceipt && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 select-none">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 w-full max-w-md relative flex flex-col justify-between max-h-[92vh]">
            
            {/* Modal layout title label */}
            <div className="flex items-center justify-between pb-3.5 border-b border-slate-800 shrink-0">
              <div className="flex items-center gap-2">
                <ReceiptIcon className="h-4.5 w-4.5 text-teal-400" />
                <h4 className="text-xs font-bold text-slate-300 uppercase tracking-widest font-mono">
                  Inspect Register Record: {selectedReceipt.receiptNumber}
                </h4>
              </div>
              <button
                type="button"
                onClick={() => setSelectedReceipt(null)}
                className="text-slate-500 hover:text-slate-300 transition-all p-1"
              >
                <X className="h-4.5 w-4.5" />
              </button>
            </div>

            {/* Thermal Slip Visualization Scrollable Container */}
            <div className="flex-1 overflow-y-auto py-5 px-1">
              
              <div className="bg-white text-slate-950 p-5 rounded font-mono text-[11px] leading-relaxed shadow-lg border border-slate-200 w-full max-w-[310px] mx-auto relative text-left">
                
                {/* Top torn effect */}
                <div className="absolute top-0 inset-x-0 h-1 bg-[linear-gradient(45deg,#cbd5e1_25%,transparent_25%),linear-gradient(-45deg,#cbd5e1_25%,transparent_25%)] bg-[size:6px_6px]" />
                
                {/* Store Label Header */}
                <div className="text-center mt-3 mb-4 space-y-0.5">
                  <h5 className="font-bold text-xs uppercase text-slate-900 tracking-tight">
                    {settings.storeName}
                  </h5>
                  <p className="text-[10px] text-zinc-600">{settings.storeAddress}</p>
                  <p className="text-[10px] text-zinc-600">Tel: {settings.storePhone}</p>
                </div>

                {/* Slip Meta */}
                <div className="border-t border-dashed border-slate-300 py-2.5 space-y-0.5 text-zinc-700">
                  <p>Receipt Number: <span className="font-bold text-slate-900">{selectedReceipt.receiptNumber}</span></p>
                  <p>Receipt Status: <span className="font-bold uppercase decoration-dashed text-slate-900">{selectedReceipt.status}</span></p>
                  <p>Checkout Timestamp: <span className="text-slate-900">{new Date(selectedReceipt.date).toLocaleString()}</span></p>
                  <p>Cashier Assigned: <span className="text-slate-900">{selectedReceipt.cashierName}</span></p>
                  {selectedReceipt.customerName && (
                    <p className="truncate">Customer Name: <span className="font-bold text-slate-900">{selectedReceipt.customerName}</span></p>
                  )}
                  {selectedReceipt.customerEmail && (
                    <p className="truncate">Recipient Email: <span className="text-slate-900">{selectedReceipt.customerEmail}</span></p>
                  )}
                </div>

                {/* ItemSpec Table columns heading */}
                <div className="border-t border-dashed border-slate-300 py-2.5">
                  <div className="flex items-center justify-between text-[10px] font-bold pb-1 text-zinc-800">
                    <span>Line Specifications</span>
                    <span>Total Net</span>
                  </div>
                  <div className="space-y-2 divide-y divide-slate-100">
                    {selectedReceipt.items.map((i, idx) => (
                      <div key={idx} className="pt-2 flex flex-col">
                        <div className="flex justify-between items-start">
                          <span className="font-bold text-slate-900 leading-tight">
                            {i.name}
                          </span>
                          <span className="font-bold text-slate-900">
                            {settings.currencySymbol}{i.finalPrice.toFixed(2)}
                          </span>
                        </div>
                        <div className="flex justify-between text-[10px] text-zinc-500 pl-1 mt-0.5">
                          <span>
                            {i.flavor} ({i.size})
                          </span>
                          <span>
                            {i.quantity} x {settings.currencySymbol}{i.unitPrice.toFixed(2)}
                            {i.discountPercentage > 0 ? ` (-${i.discountPercentage}%)` : ''}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Sum numbers */}
                <div className="border-t border-dashed border-slate-300 py-2.5 space-y-1 text-zinc-700">
                  <div className="flex justify-between">
                    <span>Invoice Subtotal:</span>
                    <span className="text-slate-900">{settings.currencySymbol}{selectedReceipt.subtotal.toFixed(2)}</span>
                  </div>

                  {selectedReceipt.discountTotal > 0 && (
                    <div className="flex justify-between font-bold text-emerald-855">
                      <span>Store Saving:</span>
                      <span className="text-emerald-700">-{settings.currencySymbol}{selectedReceipt.discountTotal.toFixed(2)}</span>
                    </div>
                  )}

                  <div className="flex justify-between text-[10px]">
                    <span>Sales Tax ({settings.taxRatePercentage}%):</span>
                    <span className="text-slate-900">{settings.currencySymbol}{selectedReceipt.taxTotal.toFixed(2)}</span>
                  </div>

                  <div className="flex justify-between text-xs font-bold text-slate-950 pt-2 border-t border-slate-200">
                    <span>GRAND NET TOTAL:</span>
                    <span>{settings.currencySymbol}{selectedReceipt.grandTotal.toFixed(2)}</span>
                  </div>
                </div>

                {/* Cash payment options specs */}
                <div className="border-t border-dashed border-slate-300 py-2.5 text-zinc-700 space-y-0.5">
                  <p>Settlement: <span className="font-bold text-slate-900 uppercase">{selectedReceipt.paymentMethod}</span></p>
                  <p>Auth Status: <span className="text-slate-900">Approved & Settled</span></p>
                </div>

                {/* Store Policies thank notes footer info */}
                <div className="border-t border-dashed border-slate-300 pt-3 text-center text-[9px] text-zinc-500 space-y-1">
                  <p className="font-bold italic text-zinc-700">
                    "{settings.receiptThankYouNote}"
                  </p>
                  <p className="text-zinc-500">
                    {settings.receiptReturnPolicy}
                  </p>
                  
                  {/* barcode footer visual */}
                  <div className="flex flex-col items-center justify-center pt-2.5 border-t border-dotted border-slate-200 mt-2">
                    <span className="font-mono text-[9px] tracking-[6px] text-slate-950 font-black">
                      ||||| | |||| ||| | ||
                    </span>
                    <span className="text-[9px] text-zinc-500 font-mono tracking-wider">
                      {selectedReceipt.receiptNumber}
                    </span>
                  </div>
                </div>

                {/* Bottom torn paper visual effect */}
                <div className="absolute bottom-0 inset-x-0 h-1 bg-[linear-gradient(45deg,#cbd5e1_25%,transparent_25%),linear-gradient(-45deg,#cbd5e1_25%,transparent_25%)] bg-[size:6px_6px] rotate-180" />

              </div>

            </div>

            {/* Email resending panel */}
            <div className="mt-4 pt-4 border-t border-slate-800 space-y-3 shrink-0">
              
              <div className="flex items-center gap-2">
                <input
                  type="email"
                  value={customReceiptEmail}
                  onChange={(e) => setCustomReceiptEmail(e.target.value)}
                  placeholder="Review destination customer email..."
                  className="flex-1 bg-slate-950 border border-slate-800 focus:border-teal-500/60 rounded-lg text-slate-300 text-xs py-2 px-3 placeholder-slate-650 focus:outline-none"
                />
                
                <button
                  type="button"
                  onClick={handleResendReceiptEmailAction}
                  disabled={emailStatus === 'sending'}
                  className="px-3.5 py-2 bg-teal-500 text-slate-950 hover:bg-teal-400 font-bold text-xs rounded-lg flex items-center justify-center gap-1.5 transition-all shrink-0 select-none"
                >
                  <Mail className="h-3.5 w-3.5" />
                  <span>Resend Email</span>
                </button>
              </div>

              {emailStatus === 'sending' && (
                <p className="text-[10px] text-slate-400 font-mono animate-pulse">
                  Initiating SMTP dispatch... Connecting pipeline...
                </p>
              )}
              {emailStatus === 'sent' && (
                <p className="text-[10px] text-emerald-400 font-mono font-bold flex items-center gap-1">
                  <MailCheck className="h-3 w-3" />
                  <span>Invoice emailed to {customReceiptEmail} successfully!</span>
                </p>
              )}

              {/* Action options buttons */}
              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-850">
                <button
                  type="button"
                  onClick={() => handlePrintReplica(selectedReceipt)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-lg border border-slate-700 hover:border-slate-600 transition-all flex items-center gap-1.5"
                >
                  <Printer className="h-4 w-4 text-slate-400" />
                  <span>Print Slip Replica</span>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedReceipt(null)}
                  className="px-4.5 py-2 bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold transition-all text-xs rounded-lg"
                >
                  Close Document
                </button>
              </div>

            </div>

          </div>
        </div>
      )}

    </div>
  );
}
