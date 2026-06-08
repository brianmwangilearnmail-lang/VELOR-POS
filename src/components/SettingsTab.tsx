/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Settings, 
  Save, 
  RotateCcw, 
  Percent, 
  HelpCircle,
  Clock,
  Dumbbell,
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';
import { StoreSettings, UserAccount } from '../types';

interface SettingsTabProps {
  settings: StoreSettings;
  currentUser: UserAccount;
  onSaveSettings: (settings: StoreSettings) => void;
  onResetDatabaseToSeededDefaults: () => void;
}

export default function SettingsTab({
  settings,
  currentUser,
  onSaveSettings,
  onResetDatabaseToSeededDefaults
}: SettingsTabProps) {

  const isManager = currentUser.role === 'manager';

  // State Fields
  const [storeName, setStoreName] = useState(settings.storeName);
  const [storePhone, setStorePhone] = useState(settings.storePhone);
  const [storeEmail, setStoreEmail] = useState(settings.storeEmail);
  const [storeAddress, setStoreAddress] = useState(settings.storeAddress);
  const [taxRatePercentage, setTaxRatePercentage] = useState(settings.taxRatePercentage);
  const [currencySymbol, setCurrencySymbol] = useState(settings.currencySymbol);
  const [receiptThankYouNote, setReceiptThankYouNote] = useState(settings.receiptThankYouNote);
  const [receiptReturnPolicy, setReceiptReturnPolicy] = useState(settings.receiptReturnPolicy);

  const [savedFeedback, setSavedFeedback] = useState(false);

  const handleSettingsSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const updatedSettings: StoreSettings = {
      storeName: storeName.trim() || 'Velor Supplements',
      storePhone: storePhone.trim(),
      storeEmail: storeEmail.trim(),
      storeAddress: storeAddress.trim(),
      taxRatePercentage: Number(taxRatePercentage) >= 0 ? Number(taxRatePercentage) : 0,
      currencySymbol: currencySymbol.trim() || '$',
      receiptThankYouNote: receiptThankYouNote.trim(),
      receiptReturnPolicy: receiptReturnPolicy.trim()
    };

    onSaveSettings(updatedSettings);
    
    setSavedFeedback(true);
    setTimeout(() => {
      setSavedFeedback(false);
    }, 3000);
  };

  const handleResetTrigger = () => {
    if (window.confirm('Are you sure you want to reset all products, transaction logs, and returned items back to default original seed files? This will overwrite local changes.')) {
      onResetDatabaseToSeededDefaults();
      alert('Local database storage restored to default seeded records successfully.');
      // Reload page to re-initialize from storage
      window.location.reload();
    }
  };

  if (!isManager) {
    return (
      <div className="bg-slate-950/70 p-12 border border-slate-900 rounded-2xl flex flex-col items-center justify-center text-center font-sans">
        <div className="p-3 bg-indigo-500/10 text-indigo-400 border border-indigo-500/25 rounded-2xl mb-4">
          <Settings className="h-10 w-10 animate-spin" />
        </div>
        <h3 className="text-base font-bold text-slate-200 font-sans">
          Operator Console Settings Restricted
        </h3>
        <p className="text-xs text-slate-500 max-w-sm mt-1 mb-4 leading-relaxed font-normal">
          Merchant parameters, address configurations, currency identifiers, taxes, and system formatting can only be updated by the store Manager.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 font-sans">
      
      {/* Top Header line */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-slate-900/40 p-4 border border-slate-800 rounded-xl">
        <div>
          <h1 className="text-xl font-bold text-slate-100 flex items-center gap-2">
            <Settings className="h-5 w-5 text-teal-400" />
            Operator Settings Dashboard
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Configure thermal receipt templates, select currency identifiers, and manage simulated database indexes.
          </p>
        </div>
      </div>

      {savedFeedback && (
        <div className="p-4 bg-emerald-950/40 border-2 border-emerald-900/40 text-emerald-400 text-xs rounded-xl flex items-center gap-2 font-semibold">
          <CheckCircle2 className="h-4.5 w-4.5 text-emerald-400 shrink-0" />
          <span>General store terminal configurations saved! Checkout receipts will reflect updates instantly.</span>
        </div>
      )}

      {/* Main Settings Form */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Left pane: Instruction banner (Column 1) */}
        <div className="space-y-4">
          
          <div className="bg-slate-950 p-5 border border-slate-800 rounded-xl">
            <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider mb-2">
              Merchant Information
            </h4>
            <p className="text-xs text-slate-500 leading-relaxed font-normal">
              Changes entered here dynamically propagate to checkout, historical reports, duplication copy replicas, and invoice receipts generated throughout the POS terminal system session.
            </p>
          </div>

          <div className="bg-slate-950 p-5 border border-slate-800 rounded-xl space-y-3.5">
            <h4 className="text-xs font-bold text-rose-400 uppercase tracking-wider">
              System Operations
            </h4>
            <p className="text-xs text-slate-500 leading-relaxed font-normal">
              Wipe active local database caches (localStorage) to restore default seeded supplements, original transaction registers history, and clear returned items.
            </p>
            <button
              onClick={handleResetTrigger}
              className="w-full py-2 bg-rose-950 text-rose-400 hover:bg-rose-900 border border-rose-900/40 hover:text-rose-300 rounded-lg text-xs font-bold transition-colors uppercase tracking-wide select-none"
            >
              Reset Mock Database
            </button>
          </div>

        </div>

        {/* Right pane: Form layouts (Column 2 & 3) */}
        <div className="md:col-span-2 bg-slate-950 p-6 border border-slate-800 rounded-xl shadow-xl">
          <form onSubmit={handleSettingsSubmit} className="space-y-4">
            
            <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider pb-3 border-b border-slate-900">
              Terminal System Variables
            </h3>

            {/* Store name and details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                  Storefront Base Name *
                </label>
                <input
                  type="text"
                  required
                  value={storeName}
                  onChange={(e) => setStoreName(e.target.value)}
                  className="w-full bg-slate-900 text-slate-200 border border-slate-800 focus:border-teal-500/60 rounded-xl text-xs py-2.5 px-4 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                  Store Contact Number *
                </label>
                <input
                  type="text"
                  required
                  value={storePhone}
                  onChange={(e) => setStorePhone(e.target.value)}
                  className="w-full bg-slate-900 text-slate-200 border border-slate-800 focus:border-teal-500/60 rounded-xl text-xs py-2.5 px-4 focus:outline-none font-mono"
                />
              </div>
            </div>

            {/* Email + Address info */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                  Store Support Email *
                </label>
                <input
                  type="email"
                  required
                  value={storeEmail}
                  onChange={(e) => setStoreEmail(e.target.value)}
                  className="w-full bg-slate-900 text-slate-200 border border-slate-800 focus:border-teal-500/60 rounded-xl text-xs py-2.5 px-4 focus:outline-none font-mono"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                  Sales Tax Percentage Rate (%)
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-500">
                    <Percent className="h-4 w-4" />
                  </span>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    value={taxRatePercentage}
                    onChange={(e) => setTaxRatePercentage(parseFloat(e.target.value) || 0)}
                    className="w-full bg-slate-900 text-slate-200 border border-slate-800 focus:border-teal-500/60 rounded-xl text-xs py-2.5 pl-4 pr-10 focus:outline-none font-mono"
                  />
                </div>
              </div>
            </div>

            {/* Store Address */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                Physical Shop Address
              </label>
              <input
                type="text"
                required
                value={storeAddress}
                onChange={(e) => setStoreAddress(e.target.value)}
                className="w-full bg-slate-900 text-slate-200 border border-slate-800 focus:border-teal-500/60 rounded-xl text-xs py-2.5 px-4 focus:outline-none"
              />
            </div>

            {/* Currency settings block select input */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                Currency Symbol Selector
              </label>
              <select
                value={currencySymbol}
                onChange={(e) => setCurrencySymbol(e.target.value)}
                className="w-24 bg-slate-900 text-slate-200 border border-slate-800 focus:border-teal-500/60 rounded-xl text-xs py-2.5 px-4 focus:outline-none font-mono font-bold"
              >
                <option value="$">USD ($)</option>
                <option value="£">GBP (£)</option>
                <option value="€">EUR (€)</option>
                <option value="¥">JPY (¥)</option>
                <option value="KSh">KES (KSh)</option>
              </select>
            </div>

            {/* Receipt Thank you Note */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                Thermal Receipt Greeting Message
              </label>
              <input
                type="text"
                required
                value={receiptThankYouNote}
                onChange={(e) => setReceiptThankYouNote(e.target.value)}
                className="w-full bg-slate-900 text-slate-200 border border-slate-800 focus:border-teal-500/60 rounded-xl text-xs py-2.5 px-4 focus:outline-none"
              />
            </div>

            {/* Receipt return policy */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                Return Policy Footer Notice
              </label>
              <textarea
                required
                rows={2}
                value={receiptReturnPolicy}
                onChange={(e) => setReceiptReturnPolicy(e.target.value)}
                className="w-full bg-slate-900 text-slate-200 border border-slate-800 focus:border-teal-500/60 rounded-xl text-xs py-2.5 px-4 focus:outline-none"
              />
            </div>

            <div className="pt-4 border-t border-slate-900 flex justify-end">
              <button
                type="submit"
                className="px-5 py-2.5 bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs rounded-xl flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all uppercase tracking-wide select-none"
              >
                <Save className="h-4 w-4" />
                <span>Save Store Configurations</span>
              </button>
            </div>

          </form>
        </div>

      </div>

    </div>
  );
}
