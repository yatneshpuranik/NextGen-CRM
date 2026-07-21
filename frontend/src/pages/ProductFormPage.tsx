import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import type { AppDispatch, RootState } from '../store';
import {
  createProduct,
  updateProduct,
  fetchProductById,
  clearSingleProduct,
} from '../store/slices/productSlice';
import { ProductForm } from '../components/products/ProductForm';
import Toast from '../components/Toast';
import Loader from '../components/Loader';

export const ProductFormPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  const isEditMode = !!id;

  const { user } = useSelector((state: RootState) => state.auth);
  const { singleProduct, loading, error } = useSelector((state: RootState) => state.product);

  const [formLoading, setFormLoading] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [backendErrors, setBackendErrors] = useState<{ [key: string]: string }>({});

  // Safety Role check: only ADMIN and WAREHOUSE can access this form page
  useEffect(() => {
    if (user && user.role !== 'ADMIN' && user.role !== 'WAREHOUSE') {
      navigate('/unauthorized', { replace: true });
    }
  }, [user, navigate]);

  // Fetch details if edit mode
  useEffect(() => {
    if (isEditMode && id) {
      dispatch(fetchProductById(id));
    }
    return () => {
      dispatch(clearSingleProduct());
    };
  }, [id, isEditMode, dispatch]);

  const handleSubmit = async (formData: FormData) => {
    setFormLoading(true);
    setBackendErrors({});

    try {
      if (isEditMode && id) {
        await dispatch(updateProduct({ id, formData })).unwrap();
        setToast({ message: 'Product profile updated successfully!', type: 'success' });
        setTimeout(() => navigate('/dashboard/products'), 1000);
      } else {
        await dispatch(createProduct(formData)).unwrap();
        setToast({ message: 'Product profile created successfully!', type: 'success' });
        setTimeout(() => navigate('/dashboard/products'), 1000);
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
        message: errResponse?.message || 'Failed to submit product data. Check inputs.',
        type: 'error',
      });
    } finally {
      setFormLoading(false);
    }
  };

  if (isEditMode && loading && !singleProduct) {
    return (
      <div className="content-card py-20 flex items-center justify-center">
        <Loader size="lg" />
      </div>
    );
  }

  if (isEditMode && error && !singleProduct) {
    return (
      <div className="content-card py-16 text-center space-y-4">
        <p className="text-[var(--red-icon)] font-medium">⚠️ Error loading product records</p>
        <p className="text-sm text-[var(--text-secondary)]">{error}</p>
        <button
          type="button"
          onClick={() => id && dispatch(fetchProductById(id))}
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
          <span className="cursor-pointer hover:text-[var(--text-primary)]" onClick={() => navigate('/dashboard/products')}>
            Products
          </span>
          <span>/</span>
          <span className="text-[var(--text-secondary)]">{isEditMode ? 'Edit Profile' : 'Add Product'}</span>
        </div>
        <h2 className="text-xl font-medium tracking-tight text-[var(--text-primary)]">
          {isEditMode ? 'Edit Product Specifications' : 'Onboard New Product'}
        </h2>
        <p className="text-sm text-[var(--text-secondary)] mt-0.5">
          {isEditMode
            ? `Update descriptions, benchmarks, or prices for ${singleProduct?.productName || 'product'}`
            : 'Register a new stock item with standard SKU, barcode, brand, and pricing parameters.'}
        </p>
      </div>

      {/* Form Card */}
      <div className="content-card">
        <ProductForm
          initialData={isEditMode ? singleProduct : undefined}
          onSubmit={handleSubmit}
          onCancel={() => navigate('/dashboard/products')}
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

export default ProductFormPage;
