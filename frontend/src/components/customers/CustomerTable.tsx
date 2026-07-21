import React, { useState } from 'react';
import { Eye, Pencil, Ban, CheckCircle2, Trash2 } from 'lucide-react';
import type { Customer } from '../../store/slices/customerSlice';
import type { Role } from '../../store/slices/authSlice';

interface CustomerTableProps {
  customers: Customer[];
  userRole: Role;
  onView: (id: string) => void;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  onToggleStatus: (id: string, currentStatus: boolean) => void;
}

export const CustomerTable: React.FC<CustomerTableProps> = ({
  customers,
  userRole,
  onView,
  onEdit,
  onDelete,
  onToggleStatus,
}) => {
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

  const canEdit = userRole === 'ADMIN' || userRole === 'SALES';
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
            <th className="px-6 py-3.5 font-medium">Company Name</th>
            <th className="px-6 py-3.5 font-medium">Contact Person</th>
            <th className="px-6 py-3.5 font-medium">Phone</th>
            <th className="px-6 py-3.5 font-medium">Email</th>
            <th className="px-6 py-3.5 font-medium">Status</th>
            <th className="px-6 py-3.5 font-medium">Created Date</th>
            <th className="px-6 py-3.5 font-medium text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[var(--border)] divide-solid">
          {customers.map((customer) => (
            <tr key={customer.id} className="hover:bg-[var(--surface-hover)] transition-colors">
              <td className="px-6 py-4 font-mono font-medium text-[var(--teal-text)]">
                {customer.customerCode}
              </td>
              <td className="px-6 py-4 font-medium text-[var(--text-primary)]">
                {customer.companyName}
              </td>
              <td className="px-6 py-4 text-[var(--text-secondary)]">
                {customer.contactPerson}
              </td>
              <td className="px-6 py-4 text-[var(--text-secondary)] font-mono">
                {customer.phone}
              </td>
              <td className="px-6 py-4 text-[var(--text-secondary)]">
                {customer.email}
              </td>
              <td className="px-6 py-4">
                <span className={`status-badge ${customer.isActive ? 'confirmed' : 'cancelled'}`}>
                  {customer.isActive ? 'Active' : 'Inactive'}
                </span>
              </td>
              <td className="px-6 py-4 text-[var(--text-muted)]">
                {new Date(customer.createdAt).toLocaleDateString(undefined, {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric',
                })}
              </td>
              <td className="px-6 py-4 text-right relative">
                <button
                  type="button"
                  onClick={() => toggleDropdown(customer.id)}
                  className="px-2 py-1 text-lg font-bold text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition"
                >
                  ⋮
                </button>

                {activeDropdown === customer.id && (
                  <>
                    <div
                      className="fixed inset-0 z-10"
                      onClick={() => setActiveDropdown(null)}
                    />
                    <div className="absolute right-6 top-10 bg-white border border-[var(--border)] rounded-lg shadow-lg py-1.5 w-48 text-left z-20">
                      <button
                        type="button"
                        onClick={() => {
                          onView(customer.id);
                          setActiveDropdown(null);
                        }}
                        className="w-full px-4 py-2 text-xs font-medium text-[var(--text-secondary)] hover:bg-[var(--surface-hover)] hover:text-[var(--text-primary)] flex items-center gap-2 transition"
                      >
                        <Eye className="w-4 h-4 text-teal-600" /> View Profile
                      </button>

                      {canEdit && (
                        <>
                          <button
                            type="button"
                            onClick={() => {
                              onEdit(customer.id);
                              setActiveDropdown(null);
                            }}
                            className="w-full px-4 py-2 text-xs font-medium text-[var(--text-secondary)] hover:bg-[var(--surface-hover)] hover:text-[var(--text-primary)] flex items-center gap-2 transition"
                          >
                            <Pencil className="w-4 h-4 text-amber-500" /> Edit Details
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              onToggleStatus(customer.id, customer.isActive);
                              setActiveDropdown(null);
                            }}
                            className="w-full px-4 py-2 text-xs font-medium text-[var(--text-secondary)] hover:bg-[var(--surface-hover)] hover:text-[var(--text-primary)] flex items-center gap-2 transition"
                          >
                            {customer.isActive ? (
                              <>
                                <Ban className="w-4 h-4 text-red-500" /> Deactivate
                              </>
                            ) : (
                              <>
                                <CheckCircle2 className="w-4 h-4 text-emerald-500" /> Activate
                              </>
                            )}
                          </button>
                        </>
                      )}

                      {canDelete && (
                        <button
                          type="button"
                          onClick={() => {
                            onDelete(customer.id);
                            setActiveDropdown(null);
                          }}
                          className="w-full px-4 py-2 text-xs font-medium text-[var(--red-icon)] hover:bg-[var(--red-bg)] flex items-center gap-2 transition border-t border-[var(--border)]"
                        >
                          <Trash2 className="w-4 h-4 text-red-500" /> Archive/Delete
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

export default CustomerTable;
