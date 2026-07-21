import React, { useState } from 'react';
import type { Product } from '../../store/slices/productSlice';
import type { Role } from '../../store/slices/authSlice';

interface ProductTableProps {
  products: Product[];
  userRole: Role;
  onView: (id: string) => void;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  onToggleStatus: (id: string, currentStatus: boolean) => void;
}

export const ProductTable: React.FC<ProductTableProps> = ({
  products,
  userRole,
  onView,
  onEdit,
  onDelete,
  onToggleStatus,
}) => {
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

  const canEdit = userRole === 'ADMIN' || userRole === 'WAREHOUSE';
  const canDelete = userRole === 'ADMIN';

  const toggleDropdown = (id: string) => {
    if (activeDropdown === id) {
      setActiveDropdown(null);
    } else {
      setActiveDropdown(id);
    }
  };

  return (
    <div className="overflow-x-auto w-full bg-[var(--surface-card)] rounded-xl border border-[var(--border)]">
      <table className="min-w-full divide-y divide-[var(--border)] text-left text-sm">
        <thead className="bg-[var(--surface-page)] text-xs text-[var(--text-secondary)] uppercase tracking-wider">
          <tr>
            <th className="px-6 py-3.5 font-medium">Code</th>
            <th className="px-6 py-3.5 font-medium">Product Name</th>
            <th className="px-6 py-3.5 font-medium">SKU</th>
            <th className="px-6 py-3.5 font-medium">Category</th>
            <th className="px-6 py-3.5 font-medium">Brand</th>
            <th className="px-6 py-3.5 font-medium">Selling Price</th>
            <th className="px-6 py-3.5 font-medium">Current Stock</th>
            <th className="px-6 py-3.5 font-medium">Status</th>
            <th className="px-6 py-3.5 font-medium text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[var(--border)] divide-solid">
          {products.map((product) => (
            <tr key={product.id} className="hover:bg-[var(--surface-hover)] transition-colors">
              <td className="px-6 py-4 font-mono font-medium text-[var(--teal-text)]">
                {product.productCode}
              </td>
              <td className="px-6 py-4 font-medium text-[var(--text-primary)]">
                <div className="flex items-center gap-3">
                  {product.imageUrl ? (
                    <img
                      src={product.imageUrl}
                      alt={product.productName}
                      className="w-8 h-8 rounded-md object-cover border border-[var(--border)]"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-md bg-[var(--surface-page)] border border-[var(--border)] flex items-center justify-center text-xs text-[var(--text-secondary)] font-bold">
                      📦
                    </div>
                  )}
                  <span>{product.productName}</span>
                </div>
              </td>
              <td className="px-6 py-4 text-[var(--text-secondary)] font-mono">
                {product.sku}
              </td>
              <td className="px-6 py-4 text-[var(--text-secondary)]">
                {product.category}
              </td>
              <td className="px-6 py-4 text-[var(--text-secondary)]">
                {product.brand}
              </td>
              <td className="px-6 py-4 font-mono font-medium text-[var(--text-primary)]">
                ₹{Number(product.sellingPrice).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </td>
              <td className="px-6 py-4">
                <span className={`font-mono font-medium ${product.currentStock <= product.minimumStock ? 'text-[var(--status-cancelled)] font-bold' : 'text-[var(--text-secondary)]'}`}>
                  {product.currentStock} {product.unit}
                  {product.currentStock <= product.minimumStock && (
                    <span className="text-[10px] ml-1.5 px-1.5 py-0.5 rounded bg-red-100 text-red-700 uppercase tracking-wide font-bold">Low</span>
                  )}
                </span>
              </td>
              <td className="px-6 py-4">
                <span className={`status-badge ${product.isActive ? 'confirmed' : 'cancelled'}`}>
                  {product.isActive ? 'Active' : 'Inactive'}
                </span>
              </td>
              <td className="px-6 py-4 text-right relative">
                <button
                  type="button"
                  onClick={() => toggleDropdown(product.id)}
                  className="px-2 py-1 text-lg font-bold text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition"
                >
                  ⋮
                </button>

                {activeDropdown === product.id && (
                  <>
                    <div
                      className="fixed inset-0 z-10"
                      onClick={() => setActiveDropdown(null)}
                    />
                    <div className="absolute right-6 top-10 bg-white border border-[var(--border)] rounded-lg shadow-lg py-1.5 w-48 text-left z-20">
                      <button
                        type="button"
                        onClick={() => {
                          onView(product.id);
                          setActiveDropdown(null);
                        }}
                        className="w-full px-4 py-2 text-xs font-medium text-[var(--text-secondary)] hover:bg-[var(--surface-hover)] hover:text-[var(--text-primary)] flex items-center gap-2 transition"
                      >
                        <span>👁️</span> View Profile
                      </button>

                      {canEdit && (
                        <>
                          <button
                            type="button"
                            onClick={() => {
                              onEdit(product.id);
                              setActiveDropdown(null);
                            }}
                            className="w-full px-4 py-2 text-xs font-medium text-[var(--text-secondary)] hover:bg-[var(--surface-hover)] hover:text-[var(--text-primary)] flex items-center gap-2 transition"
                          >
                            <span>✏️</span> Edit Details
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              onToggleStatus(product.id, product.isActive);
                              setActiveDropdown(null);
                            }}
                            className="w-full px-4 py-2 text-xs font-medium text-[var(--text-secondary)] hover:bg-[var(--surface-hover)] hover:text-[var(--text-primary)] flex items-center gap-2 transition"
                          >
                            <span>🔄</span> {product.isActive ? 'Deactivate' : 'Activate'}
                          </button>
                        </>
                      )}

                      {canDelete && (
                        <button
                          type="button"
                          onClick={() => {
                            onDelete(product.id);
                            setActiveDropdown(null);
                          }}
                          className="w-full px-4 py-2 text-xs font-medium text-[var(--status-cancelled)] hover:bg-red-50 hover:text-red-700 flex items-center gap-2 transition border-t border-[var(--border)]"
                        >
                          <span>🗑️</span> Delete Product
                        </button>
                      )}
                    </div>
                  </>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
