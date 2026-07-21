import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { FileText, Printer, Download, Search } from 'lucide-react';
import { fetchReport, clearReportsData } from '../store/slices/dashboardSlice';
import { fetchCustomers } from '../store/slices/customerSlice';
import { fetchProducts } from '../store/slices/productSlice';
import type { RootState } from '../store';
import Toast from '../components/Toast';
import ExportButton from '../components/ExportButton';

export const ReportsPage: React.FC = () => {
  const dispatch = useDispatch();

  const { reportsData, loading, error } = useSelector((state: RootState) => state.dashboard);
  const { customers } = useSelector((state: RootState) => state.customer);
  const { products } = useSelector((state: RootState) => state.product);
  const { user } = useSelector((state: RootState) => state.auth);

  // States
  const [reportType, setReportType] = useState<string>('');
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [customerId, setCustomerId] = useState('');
  const [productId, setProductId] = useState('');
  const [category, setCategory] = useState('');
  const [brand, setBrand] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [transactionType, setTransactionType] = useState('');
  const [, setPage] = useState(1);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // Sync CRM list metadata on mount
  useEffect(() => {
    if (user?.role === 'ADMIN' || user?.role === 'SALES' || user?.role === 'ACCOUNTS') {
      dispatch(fetchCustomers() as any);
    }
    dispatch(fetchProducts() as any);
    dispatch(clearReportsData());
  }, [dispatch, user?.role]);

  // Handle report selection change, resets parameters
  const handleReportTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    setReportType(val);
    setSearch('');
    setStatus('');
    setCustomerId('');
    setProductId('');
    setCategory('');
    setBrand('');
    setStartDate('');
    setEndDate('');
    setTransactionType('');
    setPage(1);
    dispatch(clearReportsData());
  };

  const isAuthorized = (type: string) => {
    const role = user?.role;
    if (role === 'ADMIN') return true;
    if (role === 'SALES') return ['sales', 'customers', 'challans'].includes(type);
    if (role === 'WAREHOUSE') return ['inventory', 'products', 'stock-movements'].includes(type);
    if (role === 'ACCOUNTS') return ['sales', 'inventory', 'customers', 'products', 'challans'].includes(type);
    return false;
  };

  const handleFetchReport = (targetPage: number = 1) => {
    if (!reportType) {
      setToastMsg('Please select a report type first');
      return;
    }
    if (!isAuthorized(reportType)) {
      setToastMsg('Insufficient role privileges to access this report');
      return;
    }

    const params: any = {
      page: targetPage.toString(),
      limit: '10',
      search: search || undefined,
      status: status || undefined,
      customerId: customerId || undefined,
      productId: productId || undefined,
      category: category || undefined,
      brand: brand || undefined,
      startDate: startDate || undefined,
      endDate: endDate || undefined,
      transactionType: transactionType || undefined
    };

    dispatch(fetchReport({ type: reportType, params }) as any);
    setPage(targetPage);
  };

  const handlePageChange = (newPage: number) => {
    handleFetchReport(newPage);
  };

  const handleExportCSV = () => {
    if (!reportsData || reportsData.records.length === 0) {
      setToastMsg('No records available to export');
      return;
    }

    const records = reportsData.records;
    let headers: string[] = [];
    let rows: string[][] = [];

    if (reportType === 'sales') {
      headers = ['Challan #', 'Customer', 'Date', 'Status', 'Total Revenue'];
      rows = records.map((r: any) => [
        r.challanNumber,
        r.customer?.companyName || '',
        new Date(r.challanDate).toLocaleDateString(),
        r.status,
        r.totalAmount
      ]);
    } else if (reportType === 'inventory') {
      headers = ['Product Name', 'SKU', 'Available Stock', 'Reserved Stock', 'Damaged Stock'];
      rows = records.map((r: any) => [
        r.product?.productName || '',
        r.product?.sku || '',
        r.availableStock,
        r.reservedStock,
        r.damagedStock
      ]);
    } else {
      headers = Object.keys(records[0] || {});
      rows = records.map((r: any) => headers.map((h) => String(r[h] || '')));
    }

    const csvContent = [headers.join(','), ...rows.map((row) => row.map((val) => `"${val.replace(/"/g, '""')}"`).join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `${reportType}_report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrint = () => {
    window.print();
  };

  const hasData = reportsData && reportsData.records.length > 0;

  return (
    <div className="space-y-6">
      {/* Toast notifications */}
      {toastMsg && <Toast message={toastMsg} type="info" onClose={() => setToastMsg(null)} />}

      {/* Header (Hidden during browser prints) */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[var(--border)] pb-4 print:hidden">
        <div>
          <h2 className="text-2xl font-medium tracking-tight text-[var(--text-primary)]">Reporting & Auditing</h2>
          <p className="text-sm text-[var(--text-secondary)]">Search, filter, print, and export CSV ledger reports from your workspace databases.</p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <ExportButton module="reports" />
          {reportType === 'inventory' && (
            <button
              onClick={() => {
                const token = localStorage.getItem('token') || '';
                const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/crm/v1';
                window.open(`${apiUrl}/pdf/report/inventory?token=${token}`, '_blank');
              }}
              disabled={!hasData}
              className="btn-secondary-action disabled:opacity-50 flex items-center gap-1.5"
            >
              <FileText className="w-4 h-4 text-red-500" /> PDF Inventory
            </button>
          )}
          <button onClick={handlePrint} disabled={!hasData} className="btn-secondary-action disabled:opacity-50 flex items-center gap-1.5">
            <Printer className="w-4 h-4" /> Print Report
          </button>
          <button onClick={handleExportCSV} disabled={!hasData} className="btn-primary-action disabled:opacity-50 flex items-center gap-1.5">
            <Download className="w-4 h-4" /> Export CSV Ledger
          </button>
        </div>
      </div>

      {/* Filter Parameters Card (Hidden during prints) */}
      <div className="content-card space-y-4 print:hidden">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">Select Report Type *</label>
            <select
              value={reportType}
              onChange={handleReportTypeChange}
              className="w-full text-sm"
            >
              <option value="">-- Choose Audit Report --</option>
              {isAuthorized('sales') && <option value="sales">Sales Revenue Report (Financial)</option>}
              {isAuthorized('inventory') && <option value="inventory">Inventory Asset Valuation (Stock)</option>}
              {isAuthorized('products') && <option value="products">Products Catalog Spread</option>}
              {isAuthorized('customers') && <option value="customers">Customers Volume Growth (CRM)</option>}
              {isAuthorized('stock-movements') && <option value="stock-movements">Stock Movements timeline Ledger</option>}
              {isAuthorized('challans') && <option value="challans">Delivery Challans Summary</option>}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">Search Keywords</label>
            <div className="relative">
              <Search className="w-4 h-4 text-[var(--text-muted)] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                placeholder="Search IDs, Names, SKUs..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full text-sm pl-10 pr-3 py-2 border border-[var(--border)] rounded-lg bg-[var(--surface-card)]"
              />
            </div>
          </div>

          {/* Conditional filters based on report selection */}
          {reportType === 'sales' && (
            <div>
              <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">Select Customer</label>
              <select value={customerId} onChange={(e) => setCustomerId(e.target.value)} className="w-full text-sm">
                <option value="">All Customer Accounts</option>
                {customers.map(c => <option key={c.id} value={c.id}>{c.companyName}</option>)}
              </select>
            </div>
          )}

          {reportType === 'inventory' && (
            <>
              <div>
                <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">Category Filter</label>
                <select value={category} onChange={(e) => setCategory(e.target.value)} className="w-full text-sm">
                  <option value="">All Categories</option>
                  {Array.from(new Set(products.map(p => p.category))).map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">Stock Level status</label>
                <select value={status} onChange={(e) => setStatus(e.target.value)} className="w-full text-sm">
                  <option value="">All Stock Levels</option>
                  <option value="LOW_STOCK">Low Stock Alerts</option>
                  <option value="OUT_OF_STOCK">Out of Stock Warnings</option>
                </select>
              </div>
            </>
          )}

          {reportType === 'products' && (
            <>
              <div>
                <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">Category Filter</label>
                <select value={category} onChange={(e) => setCategory(e.target.value)} className="w-full text-sm">
                  <option value="">All Categories</option>
                  {Array.from(new Set(products.map(p => p.category))).map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">Product Status</label>
                <select value={status} onChange={(e) => setStatus(e.target.value)} className="w-full text-sm">
                  <option value="">All Statuses</option>
                  <option value="ACTIVE">Active Listings</option>
                  <option value="INACTIVE">Deactivated items</option>
                </select>
              </div>
            </>
          )}

          {reportType === 'customers' && (
            <div>
              <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">Customer Profile Status</label>
              <select value={status} onChange={(e) => setStatus(e.target.value)} className="w-full text-sm">
                <option value="">All Profile states</option>
                <option value="ACTIVE">Active clients</option>
                <option value="INACTIVE">Deactivated clients</option>
              </select>
            </div>
          )}

          {reportType === 'stock-movements' && (
            <>
              <div>
                <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">Filter by Product</label>
                <select value={productId} onChange={(e) => setProductId(e.target.value)} className="w-full text-sm">
                  <option value="">All Products</option>
                  {products.map(p => <option key={p.id} value={p.id}>{p.productName}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">Transaction type</label>
                <select value={transactionType} onChange={(e) => setTransactionType(e.target.value)} className="w-full text-sm">
                  <option value="">All Movement Types</option>
                  <option value="STOCK_IN">STOCK IN (Purchases/Return)</option>
                  <option value="STOCK_OUT">STOCK OUT (Sales Dispatch)</option>
                  <option value="ADJUSTMENT">ADJUSTMENT (Corrections)</option>
                  <option value="DAMAGE">DAMAGE (Damaged Writeoff)</option>
                  <option value="RETURN">RETURN (Sales Cancellations)</option>
                </select>
              </div>
            </>
          )}

          {reportType === 'challans' && (
            <>
              <div>
                <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">Select Customer</label>
                <select value={customerId} onChange={(e) => setCustomerId(e.target.value)} className="w-full text-sm">
                  <option value="">All Customer Accounts</option>
                  {customers.map(c => <option key={c.id} value={c.id}>{c.companyName}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">Challan Status</label>
                <select value={status} onChange={(e) => setStatus(e.target.value)} className="w-full text-sm">
                  <option value="">All Statuses</option>
                  <option value="DRAFT">DRAFT</option>
                  <option value="CONFIRMED">CONFIRMED</option>
                  <option value="CANCELLED">CANCELLED</option>
                  <option value="COMPLETED">COMPLETED</option>
                </select>
              </div>
            </>
          )}
        </div>

        {/* Date Ranges */}
        {(reportType === 'sales' || reportType === 'stock-movements' || reportType === 'challans') && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-[var(--border)] pt-4">
            <div>
              <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">From Date</label>
              <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="w-full text-sm" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1">To Date</label>
              <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="w-full text-sm" />
            </div>
          </div>
        )}

        <div className="flex justify-end gap-2 pt-2 border-t border-[var(--border)]">
          <button
            onClick={() => handleFetchReport(1)}
            disabled={loading}
            className="btn-primary-action py-2"
          >
            {loading ? 'Aggregating...' : 'Generate Report'}
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-[var(--red-bg)] text-[var(--red-text)] rounded-lg text-sm print:hidden">
          {error}
        </div>
      )}

      {/* Renders dynamic report result block */}
      {reportsData && (
        <div className="space-y-6">
          {/* Printable only Header block */}
          <div className="hidden print:block border-b-2 border-black pb-4">
            <h1 className="text-2xl font-bold uppercase tracking-wide">NextGen ERP Ledger Report</h1>
            <p className="text-xs">Report classification: <span className="font-semibold uppercase">{reportType}</span></p>
            <p className="text-xs">Date generated: {new Date().toLocaleString()}</p>
          </div>

          {/* Aggregate Summary boxes */}
          {reportsData.summary && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 print:grid-cols-3">
              {reportType === 'sales' && (
                <>
                  <div className="stat-card purple text-sm">
                    <span className="stat-label block text-xs opacity-75">Gross Report Sales Valuation</span>
                    <span className="stat-number text-lg font-bold">₹{Number(reportsData.summary.totalRevenue).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                  </div>
                  <div className="stat-card teal text-sm">
                    <span className="stat-label block text-xs opacity-75">Accumulated Sales Tax (GST)</span>
                    <span className="stat-number text-lg font-bold">₹{Number(reportsData.summary.totalGST).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                  </div>
                  <div className="stat-card amber text-sm">
                    <span className="stat-label block text-xs opacity-75">Total Discount Adjustments</span>
                    <span className="stat-number text-lg font-bold">₹{Number(reportsData.summary.totalDiscount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                  </div>
                </>
              )}

              {reportType === 'inventory' && (
                <>
                  <div className="stat-card teal text-sm">
                    <span className="stat-label block text-xs opacity-75">Gross Valuation Cost Asset</span>
                    <span className="stat-number text-lg font-bold">₹{Number(reportsData.summary.totalAssetValuation).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                  </div>
                  <div className="stat-card purple text-sm">
                    <span className="stat-label block text-xs opacity-75">Physical Stock Quantity</span>
                    <span className="stat-number text-lg font-bold">{reportsData.summary.totalItemsInStock} units</span>
                  </div>
                  <div className="stat-card amber text-sm">
                    <span className="stat-label block text-xs opacity-75">Distinct catalog SKUs</span>
                    <span className="stat-number text-lg font-bold">{reportsData.summary.totalDistinctSKUs} SKUs</span>
                  </div>
                </>
              )}
            </div>
          )}

          {/* Output Ledger List Table */}
          <div className="content-card">
            {reportsData.records.length > 0 ? (
              <div className="space-y-4">
                <div className="overflow-x-auto">
                  <table className="modern-table text-xs">
                    <thead>
                      {reportType === 'sales' && (
                        <tr>
                          <th className="pb-2">Challan Number</th>
                          <th className="pb-2">Customer Account</th>
                          <th className="pb-2">Challan Date</th>
                          <th className="pb-2 text-center">Status</th>
                          <th className="pb-2 text-right">Tax (₹)</th>
                          <th className="pb-2 text-right">Total Amount (₹)</th>
                        </tr>
                      )}
                      {reportType === 'inventory' && (
                        <tr>
                          <th className="pb-2">Product Name</th>
                          <th className="pb-2">SKU</th>
                          <th className="pb-2">Category</th>
                          <th className="pb-2 text-center">Current Stock</th>
                          <th className="pb-2 text-center">Location</th>
                          <th className="pb-2 text-right">Purchase cost (₹)</th>
                          <th className="pb-2 text-right">Stock valuation (₹)</th>
                        </tr>
                      )}
                      {reportType === 'products' && (
                        <tr>
                          <th className="pb-2">Product Code</th>
                          <th className="pb-2">Product Name</th>
                          <th className="pb-2">SKU</th>
                          <th className="pb-2">Category</th>
                          <th className="pb-2 text-right">Purchase Price (₹)</th>
                          <th className="pb-2 text-right">Selling Price (₹)</th>
                          <th className="pb-2 text-center">Status</th>
                        </tr>
                      )}
                      {reportType === 'customers' && (
                        <tr>
                          <th className="pb-2">Client Code</th>
                          <th className="pb-2">Company Name</th>
                          <th className="pb-2">Contact Name</th>
                          <th className="pb-2">Email</th>
                          <th className="pb-2">Phone</th>
                          <th className="pb-2 text-center">Orders Count</th>
                          <th className="pb-2 text-right">Cumulative Volume (₹)</th>
                        </tr>
                      )}
                      {reportType === 'stock-movements' && (
                        <tr>
                          <th className="pb-2">Log Date</th>
                          <th className="pb-2">Product / SKU</th>
                          <th className="pb-2">Movement Type</th>
                          <th className="pb-2 text-center">Change Qty</th>
                          <th className="pb-2 text-center">Previous Stock</th>
                          <th className="pb-2 text-center">New Stock</th>
                          <th className="pb-2">Reference</th>
                          <th className="pb-2">Operator</th>
                        </tr>
                      )}
                      {reportType === 'challans' && (
                        <tr>
                          <th className="pb-2">Challan Number</th>
                          <th className="pb-2">Customer Account</th>
                          <th className="pb-2">Delivery Date</th>
                          <th className="pb-2 text-center">Status</th>
                          <th className="pb-2 text-right">Total Amount (₹)</th>
                          <th className="pb-2">Operator</th>
                        </tr>
                      )}
                    </thead>
                    <tbody>
                      {reportsData.records.map((row: any, idx: number) => (
                        <tr key={row.id || idx}>
                          {reportType === 'sales' && (
                            <>
                              <td className="py-2.5 font-mono font-semibold text-[var(--teal-text)]">{row.challanNumber}</td>
                              <td className="py-2.5 font-medium">{row.customer?.companyName}</td>
                              <td className="py-2.5">{new Date(row.challanDate).toLocaleDateString()}</td>
                              <td className="py-2.5 text-center">
                                <span className={`status-badge text-[9px] py-0.5 px-2 font-medium uppercase ${row.status === 'CONFIRMED' ? 'confirmed' : 'completed'}`}>{row.status}</span>
                              </td>
                              <td className="py-2.5 text-right font-medium">₹{Number(row.gstAmount).toFixed(2)}</td>
                              <td className="py-2.5 text-right font-semibold text-[var(--text-primary)]">₹{Number(row.totalAmount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                            </>
                          )}
                          {reportType === 'inventory' && (
                            <>
                              <td className="py-2.5">
                                <span className="font-semibold block">{row.productName}</span>
                                <span className="text-[9px] text-[var(--text-muted)] font-mono">{row.brand}</span>
                              </td>
                              <td className="py-2.5 font-mono font-medium text-[var(--text-secondary)]">{row.sku}</td>
                              <td className="py-2.5">{row.category}</td>
                              <td className={`py-2.5 text-center font-bold ${row.currentStock <= row.minimumStock ? 'text-[var(--red-icon)]' : 'text-[var(--text-primary)]'}`}>{row.currentStock}</td>
                              <td className="py-2.5 text-center font-medium text-[var(--text-secondary)]">{row.warehouseLocation}</td>
                              <td className="py-2.5 text-right font-medium">₹{Number(row.purchasePrice).toFixed(2)}</td>
                              <td className="py-2.5 text-right font-semibold text-[var(--teal-text-strong)]">₹{Number(row.costValue).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                            </>
                          )}
                          {reportType === 'products' && (
                            <>
                              <td className="py-2.5 font-mono font-medium text-[var(--text-secondary)]">{row.productCode}</td>
                              <td className="py-2.5 font-semibold">{row.productName}</td>
                              <td className="py-2.5 font-mono">{row.sku}</td>
                              <td className="py-2.5">{row.category}</td>
                              <td className="py-2.5 text-right">₹{Number(row.purchasePrice).toFixed(2)}</td>
                              <td className="py-2.5 text-right">₹{Number(row.sellingPrice).toFixed(2)}</td>
                              <td className="py-2.5 text-center">
                                <span className={`status-badge text-[9px] py-0.5 px-2 font-medium uppercase ${row.isActive ? 'confirmed' : 'cancelled'}`}>{row.isActive ? 'Active' : 'Inactive'}</span>
                              </td>
                            </>
                          )}
                          {reportType === 'customers' && (
                            <>
                              <td className="py-2.5 font-mono font-medium text-[var(--text-secondary)]">{row.customerCode}</td>
                              <td className="py-2.5 font-semibold">{row.companyName}</td>
                              <td className="py-2.5 font-medium">{row.contactPerson}</td>
                              <td className="py-2.5">{row.email}</td>
                              <td className="py-2.5 font-mono">{row.phone}</td>
                              <td className="py-2.5 text-center font-semibold">{row.ordersCount}</td>
                              <td className="py-2.5 text-right font-bold text-[var(--teal-text-strong)]">₹{Number(row.totalVolume).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                            </>
                          )}
                          {reportType === 'stock-movements' && (
                            <>
                              <td className="py-2.5">{new Date(row.createdAt).toLocaleDateString()} {new Date(row.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</td>
                              <td className="py-2.5">
                                <span className="font-semibold block">{row.product?.productName}</span>
                                <span className="text-[9px] text-[var(--text-muted)] font-mono">{row.product?.sku}</span>
                              </td>
                              <td className="py-2.5">
                                <span className={`status-badge text-[9px] py-0.5 px-2 font-medium uppercase ${row.transactionType === 'STOCK_IN' || row.transactionType === 'RETURN' ? 'confirmed' : 'cancelled'}`}>{row.transactionType}</span>
                              </td>
                              <td className="py-2.5 text-center font-semibold">{row.quantity}</td>
                              <td className="py-2.5 text-center">{row.previousStock}</td>
                              <td className="py-2.5 text-center font-semibold">{row.newStock}</td>
                              <td className="py-2.5 font-mono font-medium text-[var(--text-secondary)]">{row.reference || '-'}</td>
                              <td className="py-2.5 text-[var(--text-secondary)]">{row.createdByUser?.fullName}</td>
                            </>
                          )}
                          {reportType === 'challans' && (
                            <>
                              <td className="py-2.5 font-mono font-semibold text-[var(--teal-text)]">{row.challanNumber}</td>
                              <td className="py-2.5 font-semibold">{row.customer?.companyName}</td>
                              <td className="py-2.5">{row.deliveryDate ? new Date(row.deliveryDate).toLocaleDateString() : 'Immediate'}</td>
                              <td className="py-2.5 text-center">
                                <span className={`status-badge text-[9px] py-0.5 px-2 font-medium uppercase ${row.status === 'DRAFT' ? 'draft' : row.status === 'CONFIRMED' ? 'confirmed' : row.status === 'COMPLETED' ? 'completed' : 'low-stock'}`}>{row.status}</span>
                              </td>
                              <td className="py-2.5 text-right font-semibold text-[var(--text-primary)]">₹{Number(row.totalAmount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                              <td className="py-2.5 text-[var(--text-secondary)]">{row.createdByUser?.fullName}</td>
                            </>
                          )}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Pagination (Hidden during prints) */}
                <div className="flex items-center justify-between border-t border-[var(--border)] pt-4 print:hidden">
                  <span className="text-xs text-[var(--text-secondary)]">
                    Page <span className="font-semibold">{reportsData.pagination.page}</span> of{' '}
                    <span className="font-semibold">{reportsData.pagination.totalPages}</span> ({reportsData.pagination.totalRecords} records)
                  </span>

                  <div className="flex gap-2">
                    <button
                      onClick={() => handlePageChange(reportsData.pagination.page - 1)}
                      disabled={reportsData.pagination.page === 1}
                      className="px-3 py-1 border border-[var(--border)] rounded hover:bg-[var(--surface-hover)] disabled:opacity-50 transition"
                    >
                      Previous
                    </button>
                    <button
                      onClick={() => handlePageChange(reportsData.pagination.page + 1)}
                      disabled={reportsData.pagination.page === reportsData.pagination.totalPages}
                      className="px-3 py-1 border border-[var(--border)] rounded hover:bg-[var(--surface-hover)] disabled:opacity-50 transition"
                    >
                      Next
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-12 text-[var(--text-muted)] text-sm">
                No matching records returned for this report query.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ReportsPage;
