import React, { useState, useEffect } from 'react';
import { productsApi } from '../services/api';

export default function ProductModal({ isOpen, onClose, onSuccess, showToast }) {
  const [formData, setFormData] = useState({ name: '', price: '', stock: '', image_url: '' });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setFormData({ name: '', price: '', stock: '', image_url: '' });
      setErrors({});
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const validate = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Product name is required';
    
    if (formData.price === '') {
      newErrors.price = 'Price is required';
    } else if (isNaN(Number(formData.price)) || Number(formData.price) < 0) {
      newErrors.price = 'Price must be a valid positive number';
    }

    if (formData.stock === '') {
      newErrors.stock = 'Stock is required';
    } else if (isNaN(Number(formData.stock)) || !Number.isInteger(Number(formData.stock)) || Number(formData.stock) < 0) {
      newErrors.stock = 'Stock must be a valid positive integer';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear error for the field being edited
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      await productsApi.create({
        name: formData.name.trim(),
        price: Number(formData.price),
        stock: Number(formData.stock),
        image_url: formData.image_url ? formData.image_url.trim() : null,
      });
      showToast('Product added successfully!', 'success');
      onSuccess(); // Refresh products
      onClose(); // Close modal
    } catch (error) {
      showToast(error.message || 'Failed to create product', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm transition-opacity dark:bg-slate-900/80">
      {/* Modal Container */}
      <div className="w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl ring-1 ring-slate-900/5 dark:bg-slate-800 dark:ring-white/10 animate-in fade-in zoom-in duration-200">
        
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Add New Product</h2>
          <button 
            onClick={onClose}
            className="text-slate-400 hover:text-slate-500 transition-colors dark:hover:text-slate-300 p-1"
            aria-label="Close"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="p-6">
          <div className="space-y-4">
            
            {/* Name Field */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Product Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="e.g. Espresso"
                className={`w-full rounded-lg border bg-transparent px-3 py-2 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 transition-shadow ${
                  errors.name 
                    ? 'border-red-300 focus:ring-red-500/20 focus:border-red-500 dark:border-red-500/50' 
                    : 'border-slate-300 focus:border-emerald-500 focus:ring-emerald-500/20 dark:border-slate-600 dark:focus:border-emerald-500'
                }`}
              />
              {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name}</p>}
            </div>

            {/* Price & Stock Grid */}
            <div className="grid grid-cols-2 gap-4">
              
              {/* Price Field */}
              <div>
                <label htmlFor="price" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Price (₹) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  id="price"
                  name="price"
                  value={formData.price}
                  onChange={handleChange}
                  placeholder="0.00"
                  className={`w-full rounded-lg border bg-transparent px-3 py-2 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 transition-shadow ${
                    errors.price 
                      ? 'border-red-300 focus:ring-red-500/20 focus:border-red-500 dark:border-red-500/50' 
                      : 'border-slate-300 focus:border-emerald-500 focus:ring-emerald-500/20 dark:border-slate-600 dark:focus:border-emerald-500'
                  }`}
                />
                {errors.price && <p className="mt-1 text-xs text-red-500">{errors.price}</p>}
              </div>

              {/* Stock Field */}
              <div>
                <label htmlFor="stock" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Stock Qty <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  step="1"
                  min="0"
                  id="stock"
                  name="stock"
                  value={formData.stock}
                  onChange={handleChange}
                  placeholder="0"
                  className={`w-full rounded-lg border bg-transparent px-3 py-2 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 transition-shadow ${
                    errors.stock 
                      ? 'border-red-300 focus:ring-red-500/20 focus:border-red-500 dark:border-red-500/50' 
                      : 'border-slate-300 focus:border-emerald-500 focus:ring-emerald-500/20 dark:border-slate-600 dark:focus:border-emerald-500'
                  }`}
                />
                {errors.stock && <p className="mt-1 text-xs text-red-500">{errors.stock}</p>}
              </div>
            </div>

            {/* Image URL Field */}
            <div>
              <label htmlFor="image_url" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Image URL <span className="text-slate-400 text-xs font-normal">(Optional)</span>
              </label>
              <input
                type="url"
                id="image_url"
                name="image_url"
                value={formData.image_url}
                onChange={handleChange}
                placeholder="https://example.com/image.jpg"
                className={`w-full rounded-lg border bg-transparent px-3 py-2 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 transition-shadow ${
                  errors.image_url 
                    ? 'border-red-300 focus:ring-red-500/20 focus:border-red-500 dark:border-red-500/50' 
                    : 'border-slate-300 focus:border-emerald-500 focus:ring-emerald-500/20 dark:border-slate-600 dark:focus:border-emerald-500'
                }`}
              />
              {errors.image_url && <p className="mt-1 text-xs text-red-500">{errors.image_url}</p>}
            </div>
          </div>

          {/* Modal Actions */}
          <div className="mt-8 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-200 disabled:opacity-50 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-600 dark:hover:bg-slate-700 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-white bg-emerald-600 border border-transparent rounded-lg hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 dark:focus:ring-offset-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-[0.98]"
            >
              {isSubmitting ? (
                <>
                  <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                  Saving...
                </>
              ) : (
                'Add Product'
              )}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}
