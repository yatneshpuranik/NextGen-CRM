import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import type { AppDispatch, RootState } from '../store';
import {
  createCustomer,
  updateCustomer,
  fetchCustomerById,
  clearSingleCustomer,
} from '../store/slices/customerSlice';
import CustomerForm from '../components/customers/CustomerForm';
import Toast from '../components/Toast';
import Loader from '../components/Loader';

export const CustomerFormPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  const isEditMode = !!id;

  const { user } = useSelector((state: RootState) => state.auth);
  const { singleCustomer, loading, error } = useSelector((state: RootState) => state.customer);

  const [formLoading, setFormLoading] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [backendErrors, setBackendErrors] = useState<{ [key: string]: string }>({});

  // Safety Role check: only ADMIN and SALES can access this form page
  if (user && user.role !== 'ADMIN' && user.role !== 'SALES') {
    return (
      <div className="content-card p-12 text-center space-y-3">
        <p className="text-base font-semibold text-[var(--red-icon)]">Access Restricted</p>
        <p className="text-xs text-[var(--text-secondary)]">You don't have permission to perform this action.</p>
      </div>
    );
  }

  // Fetch details if edit mode
  useEffect(() => {
    if (isEditMode && id) {
      dispatch(fetchCustomerById(id));
    }
    return () => {
      dispatch(clearSingleCustomer());
    };
  }, [id, isEditMode, dispatch]);

  const handleSubmit = async (formData: any) => {
    setFormLoading(true);
    setBackendErrors({});

    try {
      if (isEditMode && id) {
        await dispatch(updateCustomer({ id, data: formData })).unwrap();
        setToast({ message: 'Customer profile updated successfully!', type: 'success' });
        setTimeout(() => navigate('/dashboard/customers'), 1000);
      } else {
        await dispatch(createCustomer(formData)).unwrap();
        setToast({ message: 'Customer profile created successfully!', type: 'success' });
        setTimeout(() => navigate('/dashboard/customers'), 1000);
      }
    } catch (err: any) {
      // Parse express-validator backend errors from our standard validateRequest response
      const errResponse = err;
      const formValErrors: { [key: string]: string } = {};

      if (errResponse && errResponse.errors) {
        errResponse.errors.forEach((eObj: any) => {
          if (eObj.field) {
            formValErrors[eObj.field] = eObj.message;
          }
        });
      }

      setBackendErrors(formValErrors);
      setToast({
        message: errResponse?.message || 'Failed to submit customer data. Check inputs.',
        type: 'error',
      });
    } finally {
      setFormLoading(false);
    }
  };

  if (isEditMode && loading && !singleCustomer) {
    return (
      <div className="content-card py-20 flex items-center justify-center">
        <Loader size="lg" />
      </div>
    );
  }

  if (isEditMode && error && !singleCustomer) {
    return (
      <div className="content-card py-16 text-center space-y-4">
        <p className="text-[var(--red-icon)] font-medium">⚠️ Error loading customer records</p>
        <p className="text-sm text-[var(--text-secondary)]">{error}</p>
        <button
          type="button"
          onClick={() => id && dispatch(fetchCustomerById(id))}
          className="btn-primary-action text-xs"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Page Header */}
      <div>
        <div className="flex items-center gap-2 text-xs text-[var(--text-muted)] font-medium mb-1">
          <span>Dashboard</span>
          <span>/</span>
          <span className="cursor-pointer hover:text-[var(--text-primary)]" onClick={() => navigate('/dashboard/customers')}>
            Customers
          </span>
          <span>/</span>
          <span className="text-[var(--text-secondary)]">{isEditMode ? 'Edit Profile' : 'Add Customer'}</span>
        </div>
        <h2 className="text-xl font-medium tracking-tight text-[var(--text-primary)]">
          {isEditMode ? 'Edit Customer Profile' : 'Onboard New Customer'}
        </h2>
        <p className="text-sm text-[var(--text-secondary)] mt-0.5">
          {isEditMode
            ? `Update shipping information and coordinates for ${singleCustomer?.companyName || 'customer'}`
            : 'Register a new enterprise client profile with billing and shipping definitions.'}
        </p>
      </div>

      {/* Form Card */}
      <div className="content-card">
        <CustomerForm
          initialData={isEditMode ? singleCustomer : undefined}
          onSubmit={handleSubmit}
          onCancel={() => navigate('/dashboard/customers')}
          loading={formLoading}
          backendErrors={backendErrors}
        />
      </div>

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

export default CustomerFormPage;
