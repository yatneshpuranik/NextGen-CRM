import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import type { AppDispatch, RootState } from '../store';
import {
  fetchCustomerById,
  deleteCustomer,
  activateCustomer,
  deactivateCustomer,
  clearSingleCustomer,
} from '../store/slices/customerSlice';
import ConfirmationModal from '../components/ConfirmationModal';
import Toast from '../components/Toast';
import Loader from '../components/Loader';

export const CustomerDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  const { user } = useSelector((state: RootState) => state.auth);
  const { singleCustomer, loading, error } = useSelector((state: RootState) => state.customer);

  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);
  const [deleteModal, setDeleteModal] = useState(false);
  const [statusModal, setStatusModal] = useState(false);

  useEffect(() => {
    if (id) {
      dispatch(fetchCustomerById(id));
    }
    return () => {
      dispatch(clearSingleCustomer());
    };
  }, [id, dispatch]);

  const handleConfirmStatusToggle = async () => {
    if (!singleCustomer) return;
    try {
      if (singleCustomer.isActive) {
        await dispatch(deactivateCustomer(singleCustomer.id)).unwrap();
        setToast({ message: 'Customer profile deactivated successfully', type: 'info' });
      } else {
        await dispatch(activateCustomer(singleCustomer.id)).unwrap();
        setToast({ message: 'Customer profile activated successfully', type: 'success' });
      }
    } catch (err: any) {
      setToast({ message: err || 'Failed to toggle customer status', type: 'error' });
    } finally {
      setStatusModal(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!singleCustomer) return;
    try {
      await dispatch(deleteCustomer(singleCustomer.id)).unwrap();
      setToast({ message: 'Customer profile deleted successfully', type: 'success' });
      setTimeout(() => navigate('/dashboard/customers'), 1000);
    } catch (err: any) {
      setToast({ message: err || 'Failed to delete customer profile', type: 'error' });
    } finally {
      setDeleteModal(false);
    }
  };

  if (loading) {
    return (
      <div className="content-card py-20 flex items-center justify-center">
        <Loader size="lg" />
      </div>
    );
  }

  if (error || !singleCustomer) {
    return (
      <div className="content-card py-16 text-center space-y-4">
        <p className="text-[var(--red-icon)] font-medium">⚠️ Error loading customer records</p>
        <p className="text-sm text-[var(--text-secondary)]">{error || 'Customer profile not found.'}</p>
        <button
          type="button"
          onClick={() => navigate('/dashboard/customers')}
          className="btn-primary-action text-xs"
        >
          Back to Directory
        </button>
      </div>
    );
  }

  const canEdit = user?.role === 'ADMIN' || user?.role === 'SALES';
  const canDelete = user?.role === 'ADMIN';

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-[var(--text-muted)] font-medium mb-1">
            <span>Dashboard</span>
            <span>/</span>
            <span className="cursor-pointer hover:text-[var(--text-primary)]" onClick={() => navigate('/dashboard/customers')}>
              Customers
            </span>
            <span>/</span>
            <span className="text-[var(--text-secondary)]">{singleCustomer.companyName}</span>
          </div>
          <h2 className="text-xl font-medium tracking-tight text-[var(--text-primary)] flex items-center gap-3">
            {singleCustomer.companyName}
            <span className={`status-badge ${singleCustomer.isActive ? 'confirmed' : 'cancelled'}`}>
              {singleCustomer.isActive ? 'Active' : 'Inactive'}
            </span>
          </h2>
          <p className="text-sm text-[var(--text-secondary)] mt-0.5 font-mono">
            ID Code: {singleCustomer.customerCode}
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => navigate('/dashboard/customers')}
            className="px-4 py-2 border border-[var(--border)] rounded-lg text-sm font-medium text-[var(--text-secondary)] hover:bg-[var(--surface-hover)] transition"
          >
            Directory List
          </button>
          
          {canEdit && (
            <>
              <button
                type="button"
                onClick={() => navigate(`/dashboard/customers/${singleCustomer.id}/edit`)}
                className="px-4 py-2 border border-[var(--teal-border)] bg-[var(--teal-bg)] text-[var(--teal-text-strong)] rounded-lg text-sm font-medium hover:bg-[var(--surface-hover)] transition flex items-center gap-2"
              >
                <span>✏️</span> Edit Profile
              </button>
              <button
                type="button"
                onClick={() => setStatusModal(true)}
                className={`px-4 py-2 border rounded-lg text-sm font-medium transition ${
                  singleCustomer.isActive
                    ? 'border-[var(--amber-icon)] text-[var(--amber-text-strong)] bg-[var(--amber-bg)]'
                    : 'border-[var(--teal-border)] text-[var(--teal-text-strong)] bg-[var(--teal-bg)]'
                }`}
              >
                {singleCustomer.isActive ? 'Deactivate' : 'Activate'}
              </button>
            </>
          )}

          {canDelete && (
            <button
              type="button"
              onClick={() => setDeleteModal(true)}
              className="px-4 py-2 border border-[var(--red-icon)] bg-[var(--red-bg)] text-[var(--red-text-strong)] rounded-lg text-sm font-medium hover:bg-[var(--surface-hover)] transition flex items-center gap-2"
            >
              <span>🗑️</span> Archive
            </button>
          )}
        </div>
      </div>

      {/* Main Details Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Core Customer Details */}
        <div className="content-card md:col-span-2 space-y-6">
          <h3 className="text-base font-medium text-[var(--text-primary)] border-b border-[var(--border)] pb-2">
            Company Information
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <p className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">
                Company Name
              </p>
              <p className="text-sm font-medium text-[var(--text-primary)] mt-1">
                {singleCustomer.companyName}
              </p>
            </div>

            <div>
              <p className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">
                Contact Person
              </p>
              <p className="text-sm font-medium text-[var(--text-primary)] mt-1">
                {singleCustomer.contactPerson}
              </p>
            </div>

            <div>
              <p className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">
                Email Address
              </p>
              <p className="text-sm font-medium text-[var(--text-primary)] mt-1 font-mono">
                {singleCustomer.email}
              </p>
            </div>

            <div>
              <p className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">
                Phone Number
              </p>
              <p className="text-sm font-medium text-[var(--text-primary)] mt-1 font-mono">
                {singleCustomer.phone}
              </p>
            </div>

            {singleCustomer.alternatePhone && (
              <div>
                <p className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">
                  Alternate Phone
                </p>
                <p className="text-sm font-medium text-[var(--text-primary)] mt-1 font-mono">
                  {singleCustomer.alternatePhone}
                </p>
              </div>
            )}

            {singleCustomer.gstNumber && (
              <div>
                <p className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">
                  GST Registration
                </p>
                <p className="text-sm font-medium text-[var(--text-primary)] mt-1 font-mono uppercase">
                  {singleCustomer.gstNumber}
                </p>
              </div>
            )}

            <div>
              <p className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">
                Customer Type
              </p>
              <p className="text-sm font-medium text-[var(--text-primary)] mt-1">
                {singleCustomer.customerType}
              </p>
            </div>

            <div>
              <p className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">
                Record Created
              </p>
              <p className="text-sm font-medium text-[var(--text-primary)] mt-1">
                {new Date(singleCustomer.createdAt).toLocaleString(undefined, {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </p>
            </div>
          </div>

          {singleCustomer.notes && (
            <div className="pt-4 border-t border-[var(--border)]">
              <p className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">
                Notes & Special Remarks
              </p>
              <p className="text-sm text-[var(--text-secondary)] mt-2 leading-relaxed whitespace-pre-line bg-[var(--surface-page)] p-3 rounded-lg border border-[var(--border)]">
                {singleCustomer.notes}
              </p>
            </div>
          )}
        </div>

        {/* Address and Shipping Metadata Card */}
        <div className="content-card space-y-6 h-fit">
          <h3 className="text-base font-medium text-[var(--text-primary)] border-b border-[var(--border)] pb-2">
            Address & Location
          </h3>

          <div className="space-y-4">
            <div>
              <p className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">
                Street Address
              </p>
              <p className="text-sm text-[var(--text-primary)] mt-1.5 leading-relaxed">
                {singleCustomer.address}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">
                  City
                </p>
                <p className="text-sm text-[var(--text-primary)] mt-1">
                  {singleCustomer.city}
                </p>
              </div>

              <div>
                <p className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">
                  Pincode
                </p>
                <p className="text-sm text-[var(--text-primary)] mt-1 font-mono">
                  {singleCustomer.pincode}
                </p>
              </div>

              <div>
                <p className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">
                  State
                </p>
                <p className="text-sm text-[var(--text-primary)] mt-1">
                  {singleCustomer.state}
                </p>
              </div>

              <div>
                <p className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">
                  Country
                </p>
                <p className="text-sm text-[var(--text-primary)] mt-1">
                  {singleCustomer.country}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Confirmation Modals */}
      <ConfirmationModal
        isOpen={deleteModal}
        title="Confirm Archiving Customer"
        message="Are you sure you want to archive/delete this customer profile? This will hide the profile from normal views. This action is restricted to Administrators."
        confirmText="Archive Profile"
        type="danger"
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteModal(false)}
      />

      <ConfirmationModal
        isOpen={statusModal}
        title={singleCustomer.isActive ? 'Deactivate Customer' : 'Activate Customer'}
        message={`Are you sure you want to ${
          singleCustomer.isActive ? 'deactivate' : 'activate'
        } this customer? Deactivated customers will not be eligible to raise new delivery challans.`}
        confirmText={singleCustomer.isActive ? 'Deactivate' : 'Activate'}
        type={singleCustomer.isActive ? 'warning' : 'info'}
        onConfirm={handleConfirmStatusToggle}
        onCancel={() => setStatusModal(false)}
      />

      {/* Toasts */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
};

export default CustomerDetailsPage;
