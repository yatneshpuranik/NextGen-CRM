import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { 
  createSalesChallan, 
  updateSalesChallan, 
  fetchSalesChallanById, 
  clearSingleChallan 
} from '../store/slices/salesChallanSlice';
import { fetchCustomers } from '../store/slices/customerSlice';
import { fetchProducts } from '../store/slices/productSlice';
import type { RootState } from '../store';
import Loader from '../components/Loader';
import Toast from '../components/Toast';

interface FormItem {
  productId: string;
  productName: string;
  sku: string;
  quantity: number;
  sellingPrice: number;
  gstPercentage: number;
  discount: number;
  availableStock: number;
}

export const ChallanFormPage: React.FC = () => {
  const { id } = useParams<{ id?: string }>();
  const isEditMode = !!id;
  
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { singleChallan, loading, error } = useSelector((state: RootState) => state.salesChallan);
  const { customers } = useSelector((state: RootState) => state.customer);
  const { products } = useSelector((state: RootState) => state.product);

  // Form states
  const [customerId, setCustomerId] = useState('');
  const [deliveryDate, setDeliveryDate] = useState('');
  const [remarks, setRemarks] = useState('');
  const [globalDiscount, setGlobalDiscount] = useState(0);
  const [items, setItems] = useState<FormItem[]>([]);

  // Item selector state
  const [selectedProductId, setSelectedProductId] = useState('');
  const [selectQty, setSelectQty] = useState(1);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  useEffect(() => {
    dispatch(fetchCustomers() as any);
    dispatch(fetchProducts() as any);

    if (isEditMode && id) {
      dispatch(fetchSalesChallanById(id) as any);
    } else {
      dispatch(clearSingleChallan());
    }
  }, [dispatch, id, isEditMode]);

  // Set form states if editing
  useEffect(() => {
    if (isEditMode && singleChallan) {
      setCustomerId(singleChallan.customerId);
      setRemarks(singleChallan.remarks || '');
      setGlobalDiscount(Number(singleChallan.discount));
      if (singleChallan.deliveryDate) {
        setDeliveryDate(new Date(singleChallan.deliveryDate).toISOString().split('T')[0]);
      } else {
        setDeliveryDate('');
      }

      if (singleChallan.items) {
        const loadedItems = singleChallan.items.map((item: any) => ({
          productId: item.productId,
          productName: item.product?.productName || 'Unknown Product',
          sku: item.product?.sku || '',
          quantity: item.quantity,
          sellingPrice: Number(item.sellingPrice),
          gstPercentage: Number(item.gstPercentage),
          discount: Number(item.discount),
          availableStock: item.product?.currentStock || 0
        }));
        setItems(loadedItems);
      }
    }
  }, [isEditMode, singleChallan]);

  const handleAddProduct = () => {
    if (!selectedProductId) return;

    // Check duplicate
    if (items.some(i => i.productId === selectedProductId)) {
      setToastMsg('Product already added to list');
      return;
    }

    const prod = products.find(p => p.id === selectedProductId);
    if (!prod) return;

    const newItem: FormItem = {
      productId: prod.id,
      productName: prod.productName,
      sku: prod.sku,
      quantity: selectQty,
      sellingPrice: Number(prod.sellingPrice),
      gstPercentage: Number(prod.gstPercentage),
      discount: 0,
      availableStock: prod.currentStock
    };

    setItems([...items, newItem]);
    setSelectedProductId('');
    setSelectQty(1);
  };

  const handleRemoveProduct = (productId: string) => {
    setItems(items.filter(i => i.productId !== productId));
  };

  const handleUpdateItem = (productId: string, key: keyof FormItem, val: any) => {
    setItems(items.map(item => {
      if (item.productId === productId) {
        return { ...item, [key]: val };
      }
      return item;
    }));
  };

  // Live calculations
  let subtotal = 0;
  let totalLineDiscounts = 0;
  let gstAmount = 0;

  items.forEach(item => {
    const lineSub = item.sellingPrice * item.quantity;
    const lineNet = lineSub - item.discount;
    const lineTax = lineNet * (item.gstPercentage / 100);

    subtotal += lineSub;
    totalLineDiscounts += item.discount;
    gstAmount += lineTax;
  });

  const grandTotal = Math.max(0, (subtotal - totalLineDiscounts - globalDiscount) + gstAmount);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!customerId) {
      setToastMsg('Please select a customer');
      return;
    }
    if (items.length === 0) {
      setToastMsg('Please add at least one product');
      return;
    }

    // Check negative totals or invalid quantities
    for (const item of items) {
      if (item.quantity <= 0) {
        setToastMsg(`Quantity for ${item.productName} must be greater than 0`);
        return;
      }
      if (item.sellingPrice <= 0) {
        setToastMsg(`Price for ${item.productName} must be greater than 0`);
        return;
      }
      if (item.discount > (item.sellingPrice * item.quantity)) {
        setToastMsg(`Discount for ${item.productName} exceeds item subtotal`);
        return;
      }
    }

    const payload = {
      customerId,
      deliveryDate: deliveryDate || undefined,
      remarks: remarks || undefined,
      discount: globalDiscount || 0,
      items: items.map(i => ({
        productId: i.productId,
        quantity: i.quantity,
        sellingPrice: i.sellingPrice,
        discount: i.discount
      }))
    };

    try {
      if (isEditMode && id) {
        await dispatch(updateSalesChallan({ id, data: payload }) as any).unwrap();
        setToastMsg('Sales Challan updated successfully');
        setTimeout(() => navigate(`/dashboard/sales-challans/${id}`), 1000);
      } else {
        const result = await dispatch(createSalesChallan(payload) as any).unwrap();
        setToastMsg('Sales Challan saved as DRAFT');
        setTimeout(() => navigate(`/dashboard/sales-challans/${result.id}`), 1000);
      }
    } catch (err: any) {
      setToastMsg(err || 'Failed to save Challan');
    }
  };

  if (loading && items.length === 0) {
    return <Loader />;
  }

  return (
    <div className="space-y-6">
      {/* Toast */}
      {toastMsg && <Toast message={toastMsg} type="info" onClose={() => setToastMsg(null)} />}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-medium tracking-tight text-[var(--text-primary)]">
            {isEditMode ? 'Edit Sales Challan Draft' : 'New Sales Challan Draft'}
          </h2>
          <p className="text-sm text-[var(--text-secondary)]">
            Configure order items, adjust pricing rules, and save as draft before processing stock dispatch.
          </p>
        </div>
        <Link to="/dashboard/sales-challans" className="btn-secondary-action">
          Cancel
        </Link>
      </div>

      {error && (
        <div className="p-4 bg-[var(--red-bg)] text-[var(--red-text)] rounded-lg text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Core fields & Products */}
        <div className="lg:col-span-2 space-y-6">
          <div className="content-card space-y-4">
            <h3 className="text-lg font-medium text-[var(--text-primary)]">1. Challan Context</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">Select Customer *</label>
                <select
                  value={customerId}
                  onChange={(e) => setCustomerId(e.target.value)}
                  disabled={isEditMode}
                  className="w-full px-3 py-2 border rounded-lg text-sm bg-[var(--surface-card)]"
                  required
                >
                  <option value="">Choose Customer Company...</option>
                  {customers.filter(c => c.isActive).map((c) => (
                    <option key={c.id} value={c.id}>{c.companyName} ({c.customerCode})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">Expected Delivery Date</label>
                <input
                  type="date"
                  value={deliveryDate}
                  onChange={(e) => setDeliveryDate(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg text-sm bg-[var(--surface-card)]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">Internal Remarks</label>
              <textarea
                rows={2}
                placeholder="Shipping instructions, order reference numbers, courier details, etc."
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg text-sm bg-[var(--surface-card)]"
              />
            </div>
          </div>

          {/* Add Product Selector */}
          <div className="content-card space-y-4">
            <h3 className="text-lg font-medium text-[var(--text-primary)]">2. Add Line Items</h3>
            
            <div className="flex flex-col md:flex-row gap-4 items-end bg-[var(--surface-page)] p-4 rounded-lg">
              <div className="flex-1">
                <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">Select Product</label>
                <select
                  value={selectedProductId}
                  onChange={(e) => setSelectedProductId(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg text-sm bg-[var(--surface-card)]"
                >
                  <option value="">Search & Select Product SKU...</option>
                  {products.filter(p => p.isActive).map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.productName} ({p.sku}) — Stock: {p.currentStock}
                    </option>
                  ))}
                </select>
              </div>

              <div className="w-full md:w-32">
                <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">Quantity</label>
                <input
                  type="number"
                  min="1"
                  value={selectQty}
                  onChange={(e) => setSelectQty(parseInt(e.target.value, 10) || 1)}
                  className="w-full px-3 py-2 border rounded-lg text-sm bg-[var(--surface-card)]"
                />
              </div>

              <button
                type="button"
                onClick={handleAddProduct}
                className="px-6 py-2 bg-[var(--teal-bg)] border border-[var(--teal-border)] text-[var(--teal-text)] rounded-lg text-sm font-medium hover:bg-[var(--surface-hover)] transition"
              >
                Add Line
              </button>
            </div>

            {/* List items */}
            {items.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="modern-table text-sm">
                  <thead>
                    <tr>
                      <th className="py-2 text-left">Product / SKU</th>
                      <th className="py-2 text-center w-24">Stock</th>
                      <th className="py-2 text-center w-28">Quantity</th>
                      <th className="py-2 text-right w-32">Price (₹)</th>
                      <th className="py-2 text-right w-28">Discount (₹)</th>
                      <th className="py-2 text-right w-32">Total</th>
                      <th className="py-2 text-center w-16">Remove</th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((item) => {
                      const itemTotal = (item.sellingPrice * item.quantity) - item.discount;
                      const hasLowStock = item.availableStock < item.quantity;
                      
                      return (
                        <tr key={item.productId} className="hover:bg-[var(--surface-hover)] transition-colors">
                          <td className="py-3">
                            <span className="font-medium text-[var(--text-primary)]">{item.productName}</span>
                            <div className="text-[10px] text-[var(--text-muted)] font-mono">{item.sku}</div>
                          </td>
                          <td className="py-3 text-center">
                            <span className={`text-xs px-2 py-0.5 rounded ${hasLowStock ? 'bg-[var(--red-bg)] text-[var(--red-text)] font-semibold' : 'text-[var(--text-secondary)]'}`}>
                              {item.availableStock}
                            </span>
                          </td>
                          <td className="py-3 text-center">
                            <input
                              type="number"
                              min="1"
                              value={item.quantity}
                              onChange={(e) => handleUpdateItem(item.productId, 'quantity', parseInt(e.target.value, 10) || 1)}
                              className="w-20 px-2 py-1 text-center border rounded bg-[var(--surface-card)]"
                            />
                          </td>
                          <td className="py-3 text-right">
                            <input
                              type="number"
                              min="0"
                              step="0.01"
                              value={item.sellingPrice}
                              onChange={(e) => handleUpdateItem(item.productId, 'sellingPrice', parseFloat(e.target.value) || 0)}
                              className="w-28 px-2 py-1 text-right border rounded bg-[var(--surface-card)] font-semibold"
                            />
                          </td>
                          <td className="py-3 text-right">
                            <input
                              type="number"
                              min="0"
                              value={item.discount}
                              onChange={(e) => handleUpdateItem(item.productId, 'discount', parseFloat(e.target.value) || 0)}
                              className="w-24 px-2 py-1 text-right border rounded bg-[var(--surface-card)]"
                            />
                          </td>
                          <td className="py-3 text-right font-semibold text-[var(--text-primary)]">
                            ₹{itemTotal.toFixed(2)}
                            <div className="text-[10px] text-[var(--text-muted)]">GST: {item.gstPercentage}%</div>
                          </td>
                          <td className="py-3 text-center">
                            <button
                              type="button"
                              onClick={() => handleRemoveProduct(item.productId)}
                              className="text-[var(--red-icon)] hover:text-red-700 transition"
                            >
                              ❌
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-8 text-[var(--text-muted)] text-sm">
                No products added yet. Choose a product from the dropdown selector above.
              </div>
            )}
          </div>
        </div>

        {/* Pricing Summary Sidepanel */}
        <div className="space-y-6">
          <div className="content-card space-y-4">
            <h3 className="text-lg font-medium text-[var(--text-primary)]">3. Totals Ledger</h3>
            
            <div className="space-y-3 text-sm border-b border-[var(--border)] pb-4">
              <div className="flex justify-between text-[var(--text-secondary)]">
                <span>Subtotal (Gross)</span>
                <span>₹{subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-[var(--text-secondary)]">
                <span>Line Discounts</span>
                <span className="text-[var(--red-icon)]">-₹{totalLineDiscounts.toFixed(2)}</span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">Global Addon Discount (₹)</label>
                <input
                  type="number"
                  min="0"
                  value={globalDiscount}
                  onChange={(e) => setGlobalDiscount(parseFloat(e.target.value) || 0)}
                  className="w-full px-2 py-1 border rounded bg-[var(--surface-card)]"
                />
              </div>

              <div className="flex justify-between text-[var(--text-secondary)]">
                <span>Taxes (GST Total)</span>
                <span>+₹{gstAmount.toFixed(2)}</span>
              </div>
            </div>

            <div className="flex justify-between items-center text-base font-semibold text-[var(--text-primary)] pt-2">
              <span>Grand Total</span>
              <span className="text-xl text-[var(--teal-text)]">₹{grandTotal.toFixed(2)}</span>
            </div>

            <div className="pt-4">
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-[var(--teal-bg)] border border-[var(--teal-border)] text-[var(--teal-text)] rounded-lg font-semibold hover:bg-[var(--surface-hover)] disabled:opacity-50 transition"
              >
                {loading ? 'Saving draft...' : isEditMode ? 'Update Sales Challan Draft' : 'Save Sales Challan Draft'}
              </button>
            </div>
          </div>
        </div>

      </form>
    </div>
  );
};

export default ChallanFormPage;
