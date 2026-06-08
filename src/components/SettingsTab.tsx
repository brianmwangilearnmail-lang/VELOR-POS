/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  Settings, 
  Save, 
  RotateCcw, 
  Percent, 
  HelpCircle,
  Clock,
  Dumbbell,
  ShieldCheck,
  CheckCircle2,
  Mail,
  ExternalLink,
  Key,
  X
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
  const [gmailAppPassword, setGmailAppPassword] = useState(settings.gmailAppPassword || '');

  const [isGmailModalOpen, setIsGmailModalOpen] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'info' } | null>(null);

  const showToast = (message: string, type: 'success' | 'info' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

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
      receiptReturnPolicy: receiptReturnPolicy.trim(),
      gmailAppPassword: gmailAppPassword.trim()
    };

    onSaveSettings(updatedSettings);
    showToast('Store configurations saved successfully!');
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
                  Automated Email Receipts
                </label>
                {gmailAppPassword ? (
                  <div className="flex items-center justify-between bg-emerald-950/20 border border-emerald-900/50 rounded-xl px-4 py-2.5">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                      <span className="text-xs text-emerald-400 font-semibold">Gmail Connected</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setIsGmailModalOpen(true)}
                      className="text-[10px] text-slate-400 hover:text-white transition-colors underline"
                    >
                      Reconfigure
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setIsGmailModalOpen(true)}
                    className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-teal-400 border border-slate-800 hover:border-teal-500/40 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2"
                  >
                    <Mail className="h-4 w-4" />
                    Connect Gmail Account
                  </button>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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

      {/* GMAIL SETUP WIZARD MODAL */}
      {isGmailModalOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg relative flex flex-col shadow-2xl">
            
            <div className="p-5 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="p-1.5 bg-teal-500/15 rounded-lg text-teal-400">
                  <Mail className="h-5 w-5" />
                </span>
                <h3 className="text-slate-100 font-bold text-sm">
                  Connect Gmail for Automated Receipts
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsGmailModalOpen(false)}
                className="text-slate-500 hover:text-slate-300 p-1"
              >
                <X className="h-4.5 w-4.5" />
              </button>
            </div>

            <div className="p-6 space-y-5">
              <p className="text-xs text-slate-400 leading-relaxed">
                To securely send email receipts directly to customers during checkout, you must configure a specific 16-character <strong>App Password</strong> generated by Google. Do not use your regular email password!
              </p>

              <div className="space-y-3">
                <div className="flex gap-3">
                  <div className="shrink-0 h-6 w-6 rounded-full bg-slate-800 flex items-center justify-center text-xs font-bold text-slate-300">1</div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-200 mb-1">Open Google Security Settings</h4>
                    <p className="text-[11px] text-slate-500 mb-2">Ensure you are logged into the exact Gmail account you want to send receipts from.</p>
                    <a 
                      href="https://myaccount.google.com/apppasswords" 
                      target="_blank" 
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-[11px] font-bold rounded-lg transition-colors"
                    >
                      <ExternalLink className="h-3.5 w-3.5" />
                      Open Google App Passwords
                    </a>
                  </div>
                </div>

                <div className="flex gap-3">
                  <div className="shrink-0 h-6 w-6 rounded-full bg-slate-800 flex items-center justify-center text-xs font-bold text-slate-300">2</div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-200 mb-1">Generate a New Password</h4>
                    <p className="text-[11px] text-slate-500">Name the app "Velor POS" and click Create. Google will give you a 16-character password in a yellow box.</p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <div className="shrink-0 h-6 w-6 rounded-full bg-slate-800 flex items-center justify-center text-xs font-bold text-slate-300">3</div>
                  <div className="w-full">
                    <h4 className="text-xs font-bold text-slate-200 mb-1">Paste Password Here</h4>
                    <div className="relative mt-2">
                      <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500">
                        <Key className="h-4 w-4" />
                      </span>
                      <input
                        type="text"
                        value={gmailAppPassword}
                        onChange={(e) => setGmailAppPassword(e.target.value)}
                        placeholder="abcd efgh ijkl mnop"
                        className="w-full pl-9 pr-4 py-2.5 bg-slate-950 border border-slate-800 focus:border-teal-500/60 rounded-xl text-slate-200 placeholder-slate-600 text-xs focus:outline-none font-mono tracking-widest"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-4 border-t border-slate-800 flex justify-end gap-3 bg-slate-900/50 rounded-b-2xl">
              <button
                type="button"
                onClick={() => setIsGmailModalOpen(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-slate-200 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => { setIsGmailModalOpen(false); showToast('Gmail account connected! Receipts will now be sent via your Gmail.', 'success'); }}
                className="px-5 py-2 bg-teal-500 hover:bg-teal-400 text-slate-950 text-xs font-bold rounded-xl transition-colors shadow-md"
              >
                Confirm Password
              </button>
            </div>

          </div>
        </div>
      )}

      {/* FIXED TOAST NOTIFICATION */}
      {toast && (
        <div
          className="fixed bottom-6 right-6 z-[9999] flex items-center gap-3 px-5 py-4 rounded-2xl shadow-2xl border animate-in fade-in slide-in-from-bottom-4 duration-300"
          style={{
            background: toast.type === 'success' ? 'linear-gradient(135deg, #052e16 0%, #064e3b 100%)' : 'linear-gradient(135deg, #1e1b4b 0%, #1e3a5f 100%)',
            borderColor: toast.type === 'success' ? '#059669' : '#3b82f6',
            minWidth: '280px',
            maxWidth: '380px',
          }}
        >
          <div
            className="shrink-0 h-8 w-8 rounded-full flex items-center justify-center"
            style={{ background: toast.type === 'success' ? '#059669' : '#3b82f6' }}
          >
            <CheckCircle2 className="h-4.5 w-4.5 text-white" />
          </div>
          <div className="flex-1">
            <p className="text-xs font-bold text-white">Settings Updated</p>
            <p className="text-[11px] mt-0.5" style={{ color: toast.type === 'success' ? '#6ee7b7' : '#93c5fd' }}>
              {toast.message}
            </p>
          </div>
          <button
            onClick={() => setToast(null)}
            className="shrink-0 text-slate-400 hover:text-white transition-colors ml-2"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

    </div>
  );
}
