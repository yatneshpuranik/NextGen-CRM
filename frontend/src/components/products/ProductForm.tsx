import React, { useState, useEffect } from 'react';
import Loader from '../Loader';

interface ProductFormProps {
  initialData?: any;
  onSubmit: (data: FormData) => Promise<void>;
  onCancel: () => void;
  loading: boolean;
  backendErrors?: { [key: string]: string };
}

export const ProductForm: React.FC<ProductFormProps> = ({
  initialData,
  onSubmit,
  onCancel,
  loading,
  backendErrors = {},
}) => {
  const [formData, setFormData] = useState({
    productName: '',
    sku: '',
    barcode: '',
    description: '',
    category: '',
    brand: '',
    unit: 'PCS',
    purchasePrice: '',
    sellingPrice: '',
    gstPercentage: '18',
    minimumStock: '0',
    currentStock: '0',
  });

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    if (initialData) {
      setFormData({
        productName: initialData.productName || '',
        sku: initialData.sku || '',
        barcode: initialData.barcode || '',
        description: initialData.description || '',
        category: initialData.category || '',
        brand: initialData.brand || '',
        unit: initialData.unit || 'PCS',
        purchasePrice: initialData.purchasePrice ? String(initialData.purchasePrice) : '',
        sellingPrice: initialData.sellingPrice ? String(initialData.sellingPrice) : '',
        gstPercentage: initialData.gstPercentage ? String(initialData.gstPercentage) : '18',
        minimumStock: initialData.minimumStock ? String(initialData.minimumStock) : '0',
        currentStock: initialData.currentStock ? String(initialData.currentStock) : '0',
      });
      if (initialData.imageUrl) {
        setImagePreview(initialData.imageUrl);
      }
    }
  }, [initialData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const validate = () => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.productName.trim()) newErrors.productName = 'Product name is required';
    if (!formData.sku.trim()) newErrors.sku = 'SKU is required';
    if (!formData.category.trim()) newErrors.category = 'Category is required';
    if (!formData.brand.trim()) newErrors.brand = 'Brand is required';
    if (!formData.unit.trim()) newErrors.unit = 'Unit is required';

    const pPrice = parseFloat(formData.purchasePrice);
    if (isNaN(pPrice) || pPrice <= 0) {
      newErrors.purchasePrice = 'Purchase price must be a positive number';
    }

    const sPrice = parseFloat(formData.sellingPrice);
    if (isNaN(sPrice) || sPrice <= 0) {
      newErrors.sellingPrice = 'Selling price must be a positive number';
    }

    if (!isNaN(pPrice) && !isNaN(sPrice) && sPrice < pPrice) {
      newErrors.sellingPrice = 'Selling price cannot be less than purchase price';
    }

    const gst = parseFloat(formData.gstPercentage);
    if (isNaN(gst) || gst < 0 || gst > 100) {
      newErrors.gstPercentage = 'GST must be between 0 and 100';
    }

    const minStock = parseInt(formData.minimumStock, 10);
    if (isNaN(minStock) || minStock < 0) {
      newErrors.minimumStock = 'Minimum stock must be a non-negative integer';
    }

    const curStock = parseInt(formData.currentStock, 10);
    if (isNaN(curStock) || curStock < 0) {
      newErrors.currentStock = 'Current stock must be a non-negative integer';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const data = new FormData();
    data.append('productName', formData.productName.trim());
    data.append('sku', formData.sku.trim());
    if (formData.barcode.trim()) data.append('barcode', formData.barcode.trim());
    if (formData.description.trim()) data.append('description', formData.description.trim());
    data.append('category', formData.category.trim());
    data.append('brand', formData.brand.trim());
    data.append('unit', formData.unit.trim());
    data.append('purchasePrice', formData.purchasePrice);
    data.append('sellingPrice', formData.sellingPrice);
    data.append('gstPercentage', formData.gstPercentage);
    data.append('minimumStock', formData.minimumStock);
    data.append('currentStock', formData.currentStock);
    if (imageFile) {
      data.append('image', imageFile);
    }

    onSubmit(data);
  };

  const mergedErrors = { ...errors, ...backendErrors };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Product Name */}
        <div>
          <label className="block text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider mb-1">
            Product Name *
          </label>
          <input
            type="text"
            name="productName"
            value={formData.productName}
            onChange={handleChange}
            placeholder="e.g. Steel Rod 12mm"
            className={`w-full px-4 py-2.5 rounded-lg border bg-[var(--surface-card)] text-[var(--text-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--teal-primary)] ${mergedErrors.productName ? 'border-[var(--status-cancelled)]' : 'border-[var(--border)]'}`}
          />
          {mergedErrors.productName && (
            <p className="mt-1 text-xs text-[var(--status-cancelled)]">{mergedErrors.productName}</p>
          )}
        </div>

        {/* SKU */}
        <div>
          <label className="block text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider mb-1">
            SKU Code *
          </label>
          <input
            type="text"
            name="sku"
            value={formData.sku}
            onChange={handleChange}
            placeholder="e.g. TATA-STL-12MM"
            className={`w-full px-4 py-2.5 rounded-lg border bg-[var(--surface-card)] text-[var(--text-primary)] font-mono focus:outline-none focus:ring-1 focus:ring-[var(--teal-primary)] ${mergedErrors.sku ? 'border-[var(--status-cancelled)]' : 'border-[var(--border)]'}`}
          />
          {mergedErrors.sku && (
            <p className="mt-1 text-xs text-[var(--status-cancelled)]">{mergedErrors.sku}</p>
          )}
        </div>

        {/* Category */}
        <div>
          <label className="block text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider mb-1">
            Category *
          </label>
          <input
            type="text"
            name="category"
            value={formData.category}
            onChange={handleChange}
            placeholder="e.g. Construction Materials"
            className={`w-full px-4 py-2.5 rounded-lg border bg-[var(--surface-card)] text-[var(--text-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--teal-primary)] ${mergedErrors.category ? 'border-[var(--status-cancelled)]' : 'border-[var(--border)]'}`}
          />
          {mergedErrors.category && (
            <p className="mt-1 text-xs text-[var(--status-cancelled)]">{mergedErrors.category}</p>
          )}
        </div>

        {/* Brand */}
        <div>
          <label className="block text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider mb-1">
            Brand *
          </label>
          <input
            type="text"
            name="brand"
            value={formData.brand}
            onChange={handleChange}
            placeholder="e.g. TATA"
            className={`w-full px-4 py-2.5 rounded-lg border bg-[var(--surface-card)] text-[var(--text-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--teal-primary)] ${mergedErrors.brand ? 'border-[var(--status-cancelled)]' : 'border-[var(--border)]'}`}
          />
          {mergedErrors.brand && (
            <p className="mt-1 text-xs text-[var(--status-cancelled)]">{mergedErrors.brand}</p>
          )}
        </div>

        {/* Barcode (Optional) */}
        <div>
          <label className="block text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider mb-1">
            Barcode (Optional)
          </label>
          <input
            type="text"
            name="barcode"
            value={formData.barcode}
            onChange={handleChange}
            placeholder="e.g. 8901234567890"
            className="w-full px-4 py-2.5 rounded-lg border border-[var(--border)] bg-[var(--surface-card)] text-[var(--text-primary)] font-mono focus:outline-none focus:ring-1 focus:ring-[var(--teal-primary)]"
          />
        </div>

        {/* Unit */}
        <div>
          <label className="block text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider mb-1">
            Measurement Unit *
          </label>
          <select
            name="unit"
            value={formData.unit}
            onChange={handleChange}
            className="w-full px-4 py-2.5 rounded-lg border border-[var(--border)] bg-[var(--surface-card)] text-[var(--text-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--teal-primary)]"
          >
            <option value="PCS">PCS (Pieces)</option>
            <option value="BOX">BOX (Boxes)</option>
            <option value="KG">KG (Kilograms)</option>
            <option value="TON">TON (Tons)</option>
            <option value="MTR">MTR (Meters)</option>
            <option value="LTR">LTR (Liters)</option>
            <option value="SET">SET (Sets)</option>
          </select>
        </div>

        {/* Purchase Price */}
        <div>
          <label className="block text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider mb-1">
            Purchase Price (₹) *
          </label>
          <input
            type="number"
            step="0.01"
            name="purchasePrice"
            value={formData.purchasePrice}
            onChange={handleChange}
            placeholder="0.00"
            className={`w-full px-4 py-2.5 rounded-lg border bg-[var(--surface-card)] text-[var(--text-primary)] font-mono focus:outline-none focus:ring-1 focus:ring-[var(--teal-primary)] ${mergedErrors.purchasePrice ? 'border-[var(--status-cancelled)]' : 'border-[var(--border)]'}`}
          />
          {mergedErrors.purchasePrice && (
            <p className="mt-1 text-xs text-[var(--status-cancelled)]">{mergedErrors.purchasePrice}</p>
          )}
        </div>

        {/* Selling Price */}
        <div>
          <label className="block text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider mb-1">
            Selling Price (₹) *
          </label>
          <input
            type="number"
            step="0.01"
            name="sellingPrice"
            value={formData.sellingPrice}
            onChange={handleChange}
            placeholder="0.00"
            className={`w-full px-4 py-2.5 rounded-lg border bg-[var(--surface-card)] text-[var(--text-primary)] font-mono focus:outline-none focus:ring-1 focus:ring-[var(--teal-primary)] ${mergedErrors.sellingPrice ? 'border-[var(--status-cancelled)]' : 'border-[var(--border)]'}`}
          />
          {mergedErrors.sellingPrice && (
            <p className="mt-1 text-xs text-[var(--status-cancelled)]">{mergedErrors.sellingPrice}</p>
          )}
        </div>

        {/* GST Percentage */}
        <div>
          <label className="block text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider mb-1">
            GST Tax Percentage (%) *
          </label>
          <input
            type="number"
            step="0.01"
            name="gstPercentage"
            value={formData.gstPercentage}
            onChange={handleChange}
            placeholder="18"
            className={`w-full px-4 py-2.5 rounded-lg border bg-[var(--surface-card)] text-[var(--text-primary)] font-mono focus:outline-none focus:ring-1 focus:ring-[var(--teal-primary)] ${mergedErrors.gstPercentage ? 'border-[var(--status-cancelled)]' : 'border-[var(--border)]'}`}
          />
          {mergedErrors.gstPercentage && (
            <p className="mt-1 text-xs text-[var(--status-cancelled)]">{mergedErrors.gstPercentage}</p>
          )}
        </div>

        {/* Minimum Stock Alert Level */}
        <div>
          <label className="block text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider mb-1">
            Minimum Stock Level (Alert threshold) *
          </label>
          <input
            type="number"
            name="minimumStock"
            value={formData.minimumStock}
            onChange={handleChange}
            placeholder="0"
            className={`w-full px-4 py-2.5 rounded-lg border bg-[var(--surface-card)] text-[var(--text-primary)] font-mono focus:outline-none focus:ring-1 focus:ring-[var(--teal-primary)] ${mergedErrors.minimumStock ? 'border-[var(--status-cancelled)]' : 'border-[var(--border)]'}`}
          />
          {mergedErrors.minimumStock && (
            <p className="mt-1 text-xs text-[var(--status-cancelled)]">{mergedErrors.minimumStock}</p>
          )}
        </div>

        {/* Current Stock */}
        <div>
          <label className="block text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider mb-1">
            Initial / Current Stock Level *
          </label>
          <input
            type="number"
            name="currentStock"
            value={formData.currentStock}
            onChange={handleChange}
            placeholder="0"
            disabled={!!initialData} // Lock current stock on edit view to prevent direct hacks (adjustments should be done via transaction records in inventory module)
            className={`w-full px-4 py-2.5 rounded-lg border bg-[var(--surface-card)] text-[var(--text-primary)] font-mono focus:outline-none focus:ring-1 focus:ring-[var(--teal-primary)] ${initialData ? 'opacity-60 cursor-not-allowed' : ''} ${mergedErrors.currentStock ? 'border-[var(--status-cancelled)]' : 'border-[var(--border)]'}`}
          />
          {mergedErrors.currentStock && (
            <p className="mt-1 text-xs text-[var(--status-cancelled)]">{mergedErrors.currentStock}</p>
          )}
        </div>

        {/* Product Image File */}
        <div>
          <label className="block text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider mb-1">
            Product Catalog Image
          </label>
          <div className="flex items-center gap-4">
            <input
              type="file"
              accept="image/*"
              id="image-file"
              onChange={handleFileChange}
              className="hidden"
            />
            <label
              htmlFor="image-file"
              className="px-4 py-2.5 rounded-lg border border-[var(--teal-primary)] text-[var(--teal-text)] text-xs font-semibold cursor-pointer hover:bg-teal-50 transition"
            >
              Choose Image File
            </label>
            {imagePreview && (
              <img
                src={imagePreview}
                alt="Upload Preview"
                className="w-12 h-12 rounded object-cover border border-[var(--border)]"
              />
            )}
          </div>
        </div>
      </div>

      {/* Description */}
      <div>
        <label className="block text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider mb-1">
          Detailed Description (Optional)
        </label>
        <textarea
          name="description"
          value={formData.description}
          onChange={handleChange}
          rows={3}
          placeholder="Detailed specs or internal catalog notes..."
          className="w-full px-4 py-2.5 rounded-lg border border-[var(--border)] bg-[var(--surface-card)] text-[var(--text-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--teal-primary)]"
        />
      </div>

      {/* Action Buttons */}
      <div className="flex justify-end gap-3 pt-4 border-t border-[var(--border)]">
        <button
          type="button"
          onClick={onCancel}
          disabled={loading}
          className="px-5 py-2.5 border border-[var(--border)] rounded-lg text-xs font-semibold text-[var(--text-secondary)] hover:bg-[var(--surface-hover)] transition disabled:opacity-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading}
          className="btn-primary-action min-w-[120px] flex items-center justify-center gap-2"
        >
          {loading ? <Loader /> : initialData ? 'Save Changes' : 'Create Product'}
        </button>
      </div>
    </form>
  );
};
