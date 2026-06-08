/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Plus, 
  Search, 
  Edit3, 
  X, 
  Trash2, 
  AlertTriangle, 
  ShieldAlert,
  Tag,
  Dumbbell,
  Upload,
  Image
} from 'lucide-react';
import { Product, StoreSettings, UserAccount } from '../types';

interface ProductsTabProps {
  products: Product[];
  settings: StoreSettings;
  currentUser: UserAccount;
  onAddProduct: (product: Product) => void;
  onUpdateProduct: (product: Product) => void;
}

export default function ProductsTab({
  products,
  settings,
  currentUser,
  onAddProduct,
  onUpdateProduct
}: ProductsTabProps) {

  // Safeguard role access control
  const isManager = currentUser.role === 'manager';

  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('Active'); // All, Active, Inactive

  // Add/Edit Modal
  const [isOpenForm, setIsOpenForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Form Fields State
  const [name, setName] = useState('');
  const [brand, setBrand] = useState('');
  const [barcode, setBarcode] = useState('');
  const [category, setCategory] = useState('');
  const [flavor, setFlavor] = useState('');
  const [size, setSize] = useState('');
  const [costPrice, setCostPrice] = useState(0);
  const [sellingPrice, setSellingPrice] = useState(0);
  const [currentStock, setCurrentStock] = useState(0);
  const [lowStockLevel, setLowStockLevel] = useState(5);
  const [expiryDate, setExpiryDate] = useState('');
  const [batchNumber, setBatchNumber] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [imageUrl, setImageUrl] = useState('');
  const [isDragging, setIsDragging] = useState(false);

  // Filters definition
  const uniqueCategories = ['All', ...Array.from(new Set(products.map(p => p.category)))];

  const filteredProducts = products.filter(p => {
    const term = searchQuery.toLowerCase();
    const matchSearch = 
      p.name.toLowerCase().includes(term) ||
      p.brand.toLowerCase().includes(term) ||
      p.barcode.toLowerCase().includes(term) ||
      p.flavor.toLowerCase().includes(term);

    const matchCategory = categoryFilter === 'All' || p.category === categoryFilter;
    
    let matchStatus = true;
    if (statusFilter === 'Active') matchStatus = p.isActive;
    else if (statusFilter === 'Inactive') matchStatus = !p.isActive;

    return matchSearch && matchCategory && matchStatus;
  });

  // Trigger add overlay
  const handleOpenAdd = () => {
    setEditingProduct(null);
    setName('');
    setBrand('');
    setBarcode(Math.floor(100000000000 + Math.random() * 900000000000).toString()); // auto generated random barcode for supplements
    setCategory('Protein Powder');
    setFlavor('Unflavored');
    setSize('2 lbs');
    setCostPrice(0);
    setSellingPrice(0);
    setCurrentStock(10);
    setLowStockLevel(5);
    setExpiryDate('');
    setBatchNumber('');
    setIsActive(true);
    setImageUrl('');
    setIsOpenForm(true);
  };

  // Trigger edit mode
  const handleOpenEdit = (p: Product) => {
    setEditingProduct(p);
    setName(p.name);
    setBrand(p.brand);
    setBarcode(p.barcode);
    setCategory(p.category);
    setFlavor(p.flavor);
    setSize(p.size);
    setCostPrice(p.costPrice);
    setSellingPrice(p.sellingPrice);
    setCurrentStock(p.currentStock);
    setLowStockLevel(p.lowStockLevel);
    setExpiryDate(p.expiryDate || '');
    setBatchNumber(p.batchNumber || '');
    setIsActive(p.isActive);
    setImageUrl(p.imageUrl || '');
    setIsOpenForm(true);
  };

  // Submit trigger handler
  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      alert('Product primary name is required.');
      return;
    }
    if (!brand.trim()) {
      alert('Product brand label is required.');
      return;
    }
    if (!barcode.trim()) {
      alert('UPC Barcode number is required.');
      return;
    }

    const payload: Product = {
      id: editingProduct ? editingProduct.id : `p_custom_${Date.now()}`,
      name: name.trim(),
      brand: brand.trim(),
      barcode: barcode.trim(),
      category: category.trim() || 'General Supplement',
      flavor: flavor.trim() || 'Unflavored',
      size: size.trim() || 'N/A',
      costPrice: Number(costPrice) || 0,
      sellingPrice: Number(sellingPrice) || 0,
      currentStock: Number(currentStock) >= 0 ? Number(currentStock) : 0,
      lowStockLevel: Number(lowStockLevel) >= 0 ? Number(lowStockLevel) : 3,
      expiryDate: expiryDate ? expiryDate : undefined,
      batchNumber: batchNumber ? batchNumber.trim() : undefined,
      isActive: isActive,
      imageUrl: imageUrl || undefined
    };

    if (editingProduct) {
      onUpdateProduct(payload);
    } else {
      // Validate duplicate barcodes
      const barcodeExists = products.some(p => p.barcode === payload.barcode);
      if (barcodeExists) {
        alert('A supplement matches this exact barcode in the index already!');
        return;
      }
      onAddProduct(payload);
    }

    setIsOpenForm(false);
  };

  // Simple quick flag switch for deactivating
  const handleToggleActiveQuick = (p: Product) => {
    onUpdateProduct({
      ...p,
      isActive: !p.isActive
    });
  };

  // Allow all active session operators in simulation to view & modify product registry profiles

  return (
    <div className="space-y-6 font-sans">
      
      {/* Top action header section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-slate-900/40 p-4 border border-slate-800 rounded-xl">
        <div>
          <h1 className="text-xl font-bold text-slate-100 flex items-center gap-2">
            <Tag className="h-5 w-5 text-teal-400" />
            Products Registry
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Manage supplement specification catalog, barcodes, base retail values, and default alert margins.
          </p>
        </div>
        
        <button
          onClick={handleOpenAdd}
          className="bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold px-3 py-2 text-xs rounded-xl flex items-center justify-center gap-1.5 shadow-md hover:shadow-lg transition-all shrink-0"
        >
          <Plus className="h-4 w-4 stroke-[3px]" />
          <span>Add Supplement SKU</span>
        </button>
      </div>

      {/* Catalog navigation filters panel */}
      <div className="bg-slate-950/60 p-4 border border-slate-800 rounded-xl flex flex-col lg:flex-row gap-4 items-center justify-between">
        
        <div className="relative w-full lg:w-96 select-none">
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500">
            <Search className="h-4 w-4" />
          </span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search catalog by name, brand, barcode or flavor..."
            className="w-full pl-10 pr-4 py-2 bg-slate-900 border border-slate-800 focus:border-teal-500/60 rounded-lg text-slate-200 placeholder-slate-500 focus:outline-none text-xs transition-all animate-fade"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
          
          {/* Category drop down selection */}
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] text-slate-500 font-mono uppercase tracking-wider">Category:</span>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="bg-slate-900 border border-slate-800 text-slate-300 text-xs py-1.5 px-2.5 rounded-lg focus:outline-none focus:border-teal-500/40"
            >
              {uniqueCategories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          {/* Active / Inactive states filters */}
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] text-slate-500 font-mono uppercase tracking-wider">Status:</span>
            <div className="inline-flex bg-slate-900 border border-slate-800 p-0.5 rounded-lg text-[11px]">
              {['All', 'Active', 'Inactive'].map((st) => (
                <button
                  key={st}
                  type="button"
                  onClick={() => setStatusFilter(st)}
                  className={`px-2 py-1 rounded-md transition-all font-medium ${
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

      {/* Primary specs data table */}
      <div className="bg-slate-950/40 border border-slate-800 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-900 text-slate-500 font-mono bg-slate-950">
                <th className="py-3 px-4 font-medium">Supplement Specification</th>
                <th className="py-3 px-4 font-medium">UPC Barcode</th>
                <th className="py-3 px-4 font-medium">Category</th>
                <th className="py-3 px-4 font-medium text-right">Cost Price</th>
                <th className="py-3 px-4 font-medium text-right">Selling Price</th>
                <th className="py-3 px-4 font-medium text-right">Remaining Stock</th>
                <th className="py-3 px-4 font-medium text-center">Batch Details</th>
                <th className="py-3 px-4 font-medium text-center">Active Status</th>
                <th className="py-3 px-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-900">
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-500 bg-slate-950/10">
                    No products matching search guidelines found. Click "Add Supplement SKU" to seed.
                  </td>
                </tr>
              ) : (
                filteredProducts.map((p) => {
                  const isLow = p.currentStock <= p.lowStockLevel && p.currentStock > 0;
                  const isOut = p.currentStock === 0;

                  return (
                    <tr key={p.id} className="hover:bg-slate-900/40 transition-colors">
                      
                      {/* Name / Brands info */}
                      <td className="py-3.5 px-4 font-sans">
                        <div className="flex items-start gap-2.5">
                          <div className="h-8 w-8 mt-0.5 rounded bg-slate-900 flex items-center justify-center shrink-0 border border-slate-800 text-slate-500 text-[10px] font-mono overflow-hidden">
                            {p.imageUrl ? (
                              <img src={p.imageUrl} referrerPolicy="no-referrer" className="w-full h-full object-cover" alt={p.name} />
                            ) : (
                              p.brand.slice(0, 2).toUpperCase()
                            )}
                          </div>
                          <div>
                            <span className="font-semibold text-slate-200 block leading-snug">
                              {p.name}
                            </span>
                            <span className="text-[10px] text-slate-500 font-mono block mt-0.5">
                              {p.brand} • Flavor: <strong className="text-slate-400 font-medium">{p.flavor}</strong> ({p.size})
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Barcode details */}
                      <td className="py-3.5 px-4 font-mono text-xs text-teal-400/80">
                        {p.barcode}
                      </td>

                      {/* category marker badge */}
                      <td className="py-3.5 px-4 text-slate-400 font-mono">
                        <span className="px-1.5 py-0.5 rounded bg-slate-900 text-[10px]">
                          {p.category}
                        </span>
                      </td>

                      {/* Cost price */}
                      <td className="py-3.5 px-4 text-right font-mono text-slate-400">
                        {settings.currencySymbol}{p.costPrice.toFixed(2)}
                      </td>

                      {/* Retail price */}
                      <td className="py-3.5 px-4 text-right font-mono font-bold text-slate-200">
                        {settings.currencySymbol}{p.sellingPrice.toFixed(2)}
                      </td>

                      {/* Stocks details */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex flex-col items-end">
                          <span className={`font-mono font-bold ${
                            isOut ? 'text-red-500' : isLow ? 'text-amber-500' : 'text-slate-300'
                          }`}>
                            {p.currentStock} units
                          </span>
                          <span className="text-[9px] text-slate-500 font-mono">
                            Alert limit: {p.lowStockLevel}
                          </span>
                        </div>
                      </td>

                      {/* Batch ID & Expiry values */}
                      <td className="py-3.5 px-4 text-center font-mono">
                        {p.batchNumber ? (
                          <div className="inline-block text-left text-[10px] text-slate-400 space-y-0.5">
                            <p className="leading-none">#Batch: <strong className="text-slate-300">{p.batchNumber}</strong></p>
                            {p.expiryDate && (
                              <p className="text-[9px] text-slate-500">Exp: {p.expiryDate}</p>
                            )}
                          </div>
                        ) : (
                          <span className="text-slate-600">—</span>
                        )}
                      </td>

                      {/* Active status flag button toggle */}
                      <td className="py-3.5 px-4 text-center">
                        <button
                          type="button"
                          onClick={() => handleToggleActiveQuick(p)}
                          className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                            p.isActive 
                              ? 'bg-teal-950 text-teal-400 border border-teal-900' 
                              : 'bg-slate-900 text-slate-600 border border-slate-800'
                          }`}
                          title="Click to toggle status flag"
                        >
                          {p.isActive ? 'ACTIVE' : 'INACTIVE'}
                        </button>
                      </td>

                      {/* Action buttons (Edit/Erase) */}
                      <td className="py-3.5 px-4 text-right font-sans">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleOpenEdit(p)}
                            className="p-1 px-1.5 bg-slate-900 hover:bg-slate-800 text-teal-400 rounded-lg border border-slate-800 hover:border-slate-700 transition-all text-[11px] flex items-center gap-1"
                          >
                            <Edit3 className="h-3 w-3" />
                            <span>Edit</span>
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

      {/* DYNAMIC MODAL: ADD / EDIT DIALOG FORM */}
      {isOpenForm && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 select-none">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl relative flex flex-col max-h-[90vh]">
            
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Dumbbell className="h-5 w-5 text-teal-400" />
                <h3 className="text-slate-100 font-bold text-sm">
                  {editingProduct ? 'Configure Product Specifications' : 'Add New Supplement Variant SKU'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsOpenForm(false)}
                className="text-slate-500 hover:text-slate-300 p-1"
              >
                <X className="h-4.5 w-4.5" />
              </button>
            </div>

            {/* Modal Body Form */}
            <form onSubmit={handleFormSubmit} className="flex-1 overflow-y-auto p-5 space-y-4">
              
              {/* Product Basic Name & Brand row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                    Product Display Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Gold Standard 100% Whey"
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
                    value={brand}
                    onChange={(e) => setBrand(e.target.value)}
                    placeholder="e.g. Optimum Nutrition"
                    className="w-full bg-slate-950 text-slate-200 border border-slate-800 focus:border-teal-500/60 rounded-xl text-xs py-2.5 px-4 placeholder-slate-600 focus:outline-none"
                  />
                </div>
              </div>

              {/* Barcode & Categories */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                    UPC Barcode * (Scan / Auto-generate)
                  </label>
                  <input
                    type="text"
                    required
                    value={barcode}
                    onChange={(e) => setBarcode(e.target.value)}
                    placeholder="e.g. 748927022377"
                    className="w-full bg-slate-950 font-mono text-teal-400 border border-slate-800 focus:border-teal-500/60 rounded-xl text-xs py-2.5 px-4 placeholder-slate-600 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                    Store Category Selector
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
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
                    value={flavor}
                    onChange={(e) => setFlavor(e.target.value)}
                    placeholder="e.g. Double Rich Chocolate or pills / Unflavored"
                    className="w-full bg-slate-950 text-slate-200 border border-slate-800 focus:border-teal-500/60 rounded-xl text-xs py-2.5 px-4 placeholder-slate-600 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                    Container Measurement Size
                  </label>
                  <input
                    type="text"
                    value={size}
                    onChange={(e) => setSize(e.target.value)}
                    placeholder="e.g. 5 lbs, 30 Servings, 90 capsules"
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
                    step="0.01"
                    min="0"
                    required
                    value={costPrice}
                    onChange={(e) => setCostPrice(parseFloat(e.target.value) || 0)}
                    className="w-full bg-slate-950 font-mono text-slate-200 border border-slate-800 focus:border-teal-500/60 rounded-xl text-xs py-2.5 px-4 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                    Consumer Selling Price ({settings.currencySymbol})
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    value={sellingPrice}
                    onChange={(e) => setSellingPrice(parseFloat(e.target.value) || 0)}
                    className="w-full bg-slate-950 font-mono text-slate-200 border border-slate-800 focus:border-teal-500/60 rounded-xl text-xs py-2.5 px-4 focus:outline-none"
                  />
                </div>
              </div>

              {/* Stock quantities & critical alert level thresholds */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                    Initial Stock In Registers
                  </label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={currentStock}
                    onChange={(e) => setCurrentStock(parseInt(e.target.value) || 0)}
                    className="w-full bg-slate-950 font-mono text-slate-200 border border-slate-800 focus:border-teal-500/60 rounded-xl text-xs py-2.5 px-4 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                    Low-stock ALERT Level Threshold
                  </label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={lowStockLevel}
                    onChange={(e) => setLowStockLevel(parseInt(e.target.value) || 0)}
                    className="w-full bg-slate-950 font-mono text-slate-200 border border-slate-800 focus:border-teal-500/60 rounded-xl text-xs py-2.5 px-4 focus:outline-none"
                  />
                </div>
              </div>

              {/* Supplements unique metrics Expiries & batch codes */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                    Expiry Date YYYY-MM-DD (Optional for FEFO shelf alert)
                  </label>
                  <input
                    type="date"
                    value={expiryDate}
                    onChange={(e) => setExpiryDate(e.target.value)}
                    className="w-full bg-slate-950 text-slate-200 border border-slate-800 focus:border-teal-500/60 rounded-xl text-xs py-2.5 px-4 focus:outline-none font-mono"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                    Batch Manufacturing Code Number (Optional)
                  </label>
                  <input
                    type="text"
                    value={batchNumber}
                    onChange={(e) => setBatchNumber(e.target.value)}
                    placeholder="e.g. BATCH-8893-W"
                    className="w-full bg-slate-950 text-slate-200 border border-slate-800 focus:border-teal-500/60 rounded-xl text-xs py-2.5 px-4 placeholder-slate-600 focus:outline-none"
                  />
                </div>
              </div>

              {/* Product Image Upload Section */}
              <div className="space-y-1.5">
                <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                  Product Image Thumbnail (Drag & Drop or Choose)
                </label>
                
                <div 
                  className={`border-2 border-dashed rounded-xl p-4 flex flex-col items-center justify-center transition-all ${
                    isDragging 
                      ? 'border-teal-500 bg-teal-500/5' 
                      : 'border-slate-800 bg-slate-950 hover:border-slate-700'
                  }`}
                  onDragOver={(e) => {
                    e.preventDefault();
                    setIsDragging(true);
                  }}
                  onDragLeave={() => setIsDragging(false)}
                  onDrop={(e) => {
                    e.preventDefault();
                    setIsDragging(false);
                    const file = e.dataTransfer.files?.[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onloadend = () => {
                        setImageUrl(reader.result as string);
                      };
                      reader.readAsDataURL(file);
                    }
                  }}
                >
                  {imageUrl ? (
                    <div className="flex flex-col items-center gap-3">
                      <div className="relative group/img h-24 w-24 bg-slate-900 rounded-lg overflow-hidden border border-slate-800">
                        <img src={imageUrl} className="w-full h-full object-cover" alt="Product preview" referrerPolicy="no-referrer" />
                        <button
                          type="button"
                          onClick={() => setImageUrl('')}
                          className="absolute inset-0 bg-red-950/85 text-red-400 flex items-center justify-center opacity-0 group-hover/img:opacity-100 transition-opacity text-xs font-semibold"
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
                        Drag & Drop or <span className="text-teal-400 hover:text-teal-300 underline">browse photo</span>
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
                              setImageUrl(reader.result as string);
                            };
                            reader.readAsDataURL(file);
                          }
                        }}
                      />
                    </label>
                  )}
                </div>
              </div>

              {/* Active flag check box toggle */}
              <div className="flex items-center gap-3 pt-2">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="h-4.5 w-4.5 accent-teal-500 bg-slate-950 rounded border-slate-800"
                />
                <label htmlFor="isActive" className="text-xs font-semibold text-slate-300">
                  Allow sale immediately in register (This product is marked active)
                </label>
              </div>

              {/* Form Buttons */}
              <div className="pt-4 border-t border-slate-800 flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsOpenForm(false)}
                  className="px-4.5 py-2 rounded-xl text-xs text-slate-400 hover:text-slate-200 bg-slate-950 border border-slate-800 transition-all font-medium"
                >
                  Cancel changes
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold transition-all shadow-md"
                >
                  {editingProduct ? 'Save Variant Code' : 'Save New Supplement SKU'}
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
}
