import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
  fetchSalesOverview, 
  fetchInventoryOverview, 
  fetchCustomerOverview,
  fetchSummary
} from '../store/slices/dashboardSlice';
import type { RootState } from '../store';
import Loader from '../components/Loader';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  LineChart, 
  Line, 
  PieChart, 
  Pie, 
  Cell 
} from 'recharts';

export const AnalyticsPage: React.FC = () => {
  const dispatch = useDispatch();

  const { 
    salesOverview, 
    inventoryOverview, 
    customerOverview,
    summary,
    loading 
  } = useSelector((state: RootState) => state.dashboard);

  useEffect(() => {
    dispatch(fetchSummary() as any);
    dispatch(fetchSalesOverview() as any);
    dispatch(fetchInventoryOverview() as any);
    dispatch(fetchCustomerOverview() as any);
  }, [dispatch]);

  if (loading && !salesOverview) {
    return <Loader />;
  }



  // Pie chart data for Challan Statuses
  const statusData = summary ? [
    { name: 'Completed', value: summary.completedChallans, color: 'var(--teal-border)' },
    { name: 'Confirmed (Pending)', value: summary.pendingChallans, color: 'var(--purple-icon)' },
    { name: 'Draft', value: summary.draftChallans, color: 'var(--amber-border)' },
    { name: 'Cancelled', value: summary.cancelledChallans, color: 'var(--red-icon)' }
  ].filter(s => s.value > 0) : [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-medium tracking-tight text-[var(--text-primary)]">Analytics & Insights Workspace</h2>
        <p className="text-sm text-[var(--text-secondary)]">Deep-dive visual reporting on sales cycles, customer growth pipelines, and inventory valuation spreads.</p>
      </div>

      {/* Grid containing Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* 1. Monthly Revenue Trend */}
        <div className="content-card space-y-4">
          <h3 className="text-base font-semibold text-[var(--text-primary)]">Gross Revenue Cycle (Monthly)</h3>
          <div className="h-64">
            {salesOverview?.monthly ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={salesOverview.monthly} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.04)" />
                  <XAxis dataKey="label" stroke="var(--text-secondary)" fontSize={11} tickLine={false} />
                  <YAxis stroke="var(--text-secondary)" fontSize={11} tickLine={false} axisLine={false} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: 'var(--surface-card)', borderRadius: '8px', border: '1px solid var(--border)' }}
                  />
                  <Legend verticalAlign="top" height={36} iconType="circle" />
                  <Line type="monotone" dataKey="revenue" stroke="var(--teal-icon)" strokeWidth={2} name="Sales Value (₹)" activeDot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <Loader />
            )}
          </div>
        </div>

        {/* 2. Daily Sales Trend */}
        <div className="content-card space-y-4">
          <h3 className="text-base font-semibold text-[var(--text-primary)]">Sales Volume Cycle (Daily)</h3>
          <div className="h-64">
            {salesOverview?.daily ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={salesOverview.daily} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.04)" />
                  <XAxis dataKey="label" stroke="var(--text-secondary)" fontSize={11} tickLine={false} />
                  <YAxis stroke="var(--text-secondary)" fontSize={11} tickLine={false} axisLine={false} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: 'var(--surface-card)', borderRadius: '8px', border: '1px solid var(--border)' }}
                  />
                  <Legend verticalAlign="top" height={36} iconType="circle" />
                  <Bar dataKey="revenue" fill="var(--purple-icon)" radius={[4, 4, 0, 0]} maxBarSize={30} name="Revenue (₹)" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <Loader />
            )}
          </div>
        </div>

        {/* 3. Category Stock Valuation */}
        <div className="content-card space-y-4">
          <h3 className="text-base font-semibold text-[var(--text-primary)]">Inventory Valuation Asset Spread by Category</h3>
          <div className="h-64">
            {inventoryOverview?.distribution ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={inventoryOverview.distribution} layout="vertical" margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="rgba(0,0,0,0.04)" />
                  <XAxis type="number" stroke="var(--text-secondary)" fontSize={11} tickLine={false} />
                  <YAxis dataKey="category" type="category" stroke="var(--text-secondary)" fontSize={11} tickLine={false} width={80} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: 'var(--surface-card)', borderRadius: '8px', border: '1px solid var(--border)' }}
                  />
                  <Bar dataKey="valuation" fill="var(--teal-icon)" radius={[0, 4, 4, 0]} maxBarSize={25} name="Asset Value (₹)" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <Loader />
            )}
          </div>
        </div>

        {/* 4. Customer Growth */}
        <div className="content-card space-y-4">
          <h3 className="text-base font-semibold text-[var(--text-primary)]">New Customer Signups Registration Trend</h3>
          <div className="h-64">
            {customerOverview?.growthTrend ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={customerOverview.growthTrend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.04)" />
                  <XAxis dataKey="label" stroke="var(--text-secondary)" fontSize={11} tickLine={false} />
                  <YAxis stroke="var(--text-secondary)" fontSize={11} tickLine={false} axisLine={false} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: 'var(--surface-card)', borderRadius: '8px', border: '1px solid var(--border)' }}
                  />
                  <Legend verticalAlign="top" height={36} iconType="circle" />
                  <Bar dataKey="signups" fill="var(--amber-icon)" radius={[4, 4, 0, 0]} maxBarSize={35} name="Registrations" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <Loader />
            )}
          </div>
        </div>

        {/* 5. Challan Status Distribution */}
        <div className="content-card space-y-4 flex flex-col justify-between">
          <h3 className="text-base font-semibold text-[var(--text-primary)]">Sales Challan Order Status Distribution</h3>
          
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 py-6">
            <div className="h-48 w-48 relative">
              {statusData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={statusData}
                      cx="50%"
                      cy="50%"
                      innerRadius={55}
                      outerRadius={75}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {statusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="absolute inset-0 flex items-center justify-center text-xs text-[var(--text-muted)]">
                  No data
                </div>
              )}
            </div>

            <div className="flex-1 space-y-3 w-full text-xs">
              {statusData.map((entry, idx) => (
                <div key={idx} className="flex items-center justify-between border-b border-[var(--border)] pb-1.5">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: entry.color }} />
                    <span className="font-medium text-[var(--text-secondary)]">{entry.name}</span>
                  </div>
                  <span className="font-semibold text-[var(--text-primary)]">{entry.value} orders</span>
                </div>
              ))}
              {statusData.length === 0 && (
                <p className="text-center text-[var(--text-muted)] py-4">No order items logged in ledger.</p>
              )}
            </div>
          </div>
        </div>

        {/* 6. Top Spend Customers List */}
        <div className="content-card space-y-4">
          <h3 className="text-base font-semibold text-[var(--text-primary)]">Top Customer Accounts Volume Spend</h3>
          <div className="space-y-4 pt-2">
            {customerOverview?.topSpenders && customerOverview.topSpenders.length > 0 ? (
              customerOverview.topSpenders.map((cust) => (
                <div key={cust.id} className="flex items-center justify-between border-b border-[var(--border)] pb-2 text-xs">
                  <div>
                    <span className="font-semibold block text-[var(--text-primary)]">{cust.companyName}</span>
                    <span className="text-[10px] text-[var(--text-muted)] font-mono">{cust.customerCode}</span>
                  </div>
                  <div className="text-right">
                    <span className="font-semibold text-[var(--teal-text-strong)] text-sm">
                      ₹{cust.totalSpend.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-12 text-xs text-[var(--text-muted)]">No customer logs found.</div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default AnalyticsPage;
