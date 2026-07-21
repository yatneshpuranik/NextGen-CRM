import React from 'react';
import type { CustomerFilters } from '../../store/slices/customerSlice';

interface FilterPanelProps {
  filters: CustomerFilters;
  onChange: (filters: Partial<CustomerFilters>) => void;
  onReset: () => void;
}

export const FilterPanel: React.FC<FilterPanelProps> = ({ filters, onChange, onReset }) => {
  return (
    <div className="bg-[var(--surface-card)] border border-[var(--border)] rounded-xl p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 items-end">
      {/* 1. Status Filter */}
      <div>
        <label className="block text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider mb-1">
          Status
        </label>
        <select
          value={filters.isActive}
          onChange={(e) => onChange({ isActive: e.target.value })}
          className="w-full px-3 py-2 border border-[var(--border)] rounded-lg text-sm bg-[var(--surface-card)] focus:outline-none focus:border-[var(--teal-border)]"
        >
          <option value="">All Statuses</option>
          <option value="true">Active Only</option>
          <option value="false">Inactive Only</option>
        </select>
      </div>

      {/* 2. Customer Type Filter */}
      <div>
        <label className="block text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider mb-1">
          Customer Type
        </label>
        <select
          value={filters.customerType}
          onChange={(e) => onChange({ customerType: e.target.value })}
          className="w-full px-3 py-2 border border-[var(--border)] rounded-lg text-sm bg-[var(--surface-card)] focus:outline-none focus:border-[var(--teal-border)]"
        >
          <option value="">All Types</option>
          <option value="RETAIL">Retail</option>
          <option value="WHOLESALE">Wholesale</option>
          <option value="DISTRIBUTOR">Distributor</option>
        </select>
      </div>

      {/* 3. Sort By */}
      <div>
        <label className="block text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider mb-1">
          Sort By
        </label>
        <select
          value={filters.sortBy}
          onChange={(e) => onChange({ sortBy: e.target.value })}
          className="w-full px-3 py-2 border border-[var(--border)] rounded-lg text-sm bg-[var(--surface-card)] focus:outline-none focus:border-[var(--teal-border)]"
        >
          <option value="companyName">Company Name</option>
          <option value="createdAt">Date Created</option>
        </select>
      </div>

      {/* 4. Sort Order */}
      <div>
        <label className="block text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider mb-1">
          Direction
        </label>
        <select
          value={filters.sortOrder}
          onChange={(e) => onChange({ sortOrder: e.target.value as 'asc' | 'desc' })}
          className="w-full px-3 py-2 border border-[var(--border)] rounded-lg text-sm bg-[var(--surface-card)] focus:outline-none focus:border-[var(--teal-border)]"
        >
          <option value="asc">Ascending</option>
          <option value="desc">Descending</option>
        </select>
      </div>

      {/* 5. Reset Button */}
      <div>
        <button
          type="button"
          onClick={onReset}
          className="w-full px-4 py-2 border border-[var(--border)] hover:bg-[var(--surface-hover)] rounded-lg text-sm font-medium text-[var(--text-secondary)] transition"
        >
          Reset Filters
        </button>
      </div>
    </div>
  );
};

export default FilterPanel;
