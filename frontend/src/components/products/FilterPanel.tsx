import React from 'react';
import type { ProductFilters } from '../../store/slices/productSlice';

interface FilterPanelProps {
  filters: ProductFilters;
  onChange: (filters: Partial<ProductFilters>) => void;
  onReset: () => void;
}

export const FilterPanel: React.FC<FilterPanelProps> = ({
  filters,
  onChange,
  onReset,
}) => {
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    onChange({ [name]: value });
  };

  const toggleSortOrder = () => {
    onChange({ sortOrder: filters.sortOrder === 'asc' ? 'desc' : 'asc' });
  };

  return (
    <div className="bg-[var(--surface-card)] p-5 rounded-xl border border-[var(--border)] space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        {/* Status Filter */}
        <div>
          <label className="block text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider mb-1">
            Status
          </label>
          <select
            name="isActive"
            value={filters.isActive}
            onChange={handleInputChange}
            className="w-full px-3 py-2 rounded-lg border border-[var(--border)] bg-[var(--surface-page)] text-[var(--text-primary)] text-xs focus:outline-none focus:ring-1 focus:ring-[var(--teal-primary)]"
          >
            <option value="">All Statuses</option>
            <option value="true">Active Only</option>
            <option value="false">Inactive Only</option>
          </select>
        </div>

        {/* Category Filter */}
        <div>
          <label className="block text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider mb-1">
            Category
          </label>
          <input
            type="text"
            name="category"
            value={filters.category}
            onChange={handleInputChange}
            placeholder="e.g. Construction"
            className="w-full px-3 py-2 rounded-lg border border-[var(--border)] bg-[var(--surface-page)] text-[var(--text-primary)] text-xs focus:outline-none focus:ring-1 focus:ring-[var(--teal-primary)]"
          />
        </div>

        {/* Brand Filter */}
        <div>
          <label className="block text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider mb-1">
            Brand
          </label>
          <input
            type="text"
            name="brand"
            value={filters.brand}
            onChange={handleInputChange}
            placeholder="e.g. TATA"
            className="w-full px-3 py-2 rounded-lg border border-[var(--border)] bg-[var(--surface-page)] text-[var(--text-primary)] text-xs focus:outline-none focus:ring-1 focus:ring-[var(--teal-primary)]"
          />
        </div>

        {/* Sort By */}
        <div>
          <label className="block text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider mb-1">
            Sort By
          </label>
          <div className="flex gap-2">
            <select
              name="sortBy"
              value={filters.sortBy}
              onChange={handleInputChange}
              className="flex-1 px-3 py-2 rounded-lg border border-[var(--border)] bg-[var(--surface-page)] text-[var(--text-primary)] text-xs focus:outline-none focus:ring-1 focus:ring-[var(--teal-primary)]"
            >
              <option value="productName">Product Name</option>
              <option value="sellingPrice">Selling Price</option>
              <option value="createdAt">Created Date</option>
            </select>
            <button
              type="button"
              onClick={toggleSortOrder}
              className="px-3 py-2 rounded-lg border border-[var(--border)] bg-[var(--surface-page)] text-xs hover:bg-[var(--surface-hover)] transition text-[var(--text-secondary)] font-mono"
            >
              {filters.sortOrder === 'asc' ? '▲' : '▼'}
            </button>
          </div>
        </div>
      </div>

      <div className="flex justify-end pt-2 border-t border-[var(--border)]">
        <button
          type="button"
          onClick={onReset}
          className="text-xs font-semibold text-[var(--teal-text)] hover:text-[var(--teal-primary)] transition"
        >
          Reset All Filters
        </button>
      </div>
    </div>
  );
};

export default FilterPanel;
