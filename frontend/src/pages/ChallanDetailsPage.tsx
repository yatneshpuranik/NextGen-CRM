import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  fetchSalesChallanById, 
  confirmSalesChallan, 
  cancelSalesChallan, 
  completeSalesChallan, 
  deleteSalesChallan
} from '../store/slices/salesChallanSlice';
import type { RootState } from '../store';
import Loader from '../components/Loader';
import Toast from '../components/Toast';

export const ChallanDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { singleChallan, loading, error } = useSelector((state: RootState) => state.salesChallan);
  const { user } = useSelector((state: RootState) => state.auth);

  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [showConfirmModal, setShowConfirmModal] = useState<boolean>(false);
  const [confirmAction, setConfirmAction] = useState<'confirm' | 'cancel' | 'complete' | 'delete' | null>(null);

  const isReadOnly = user?.role === 'WAREHOUSE' || user?.role === 'ACCOUNTS';

  useEffect(() => {
    if (id) {
      dispatch(fetchSalesChallanById(id) as any);
    }
  }, [dispatch, id]);

  const handleAction = async () => {
    if (!id || !confirmAction) return;

    try {
      if (confirmAction === 'confirm') {
        await dispatch(confirmSalesChallan(id) as any).unwrap();
        setToastMsg('Sales Challan confirmed successfully. Stock level deducted.');
      } else if (confirmAction === 'cancel') {
        await dispatch(cancelSalesChallan(id) as any).unwrap();
        setToastMsg('Sales Challan cancelled. Stock level restored.');
      } else if (confirmAction === 'complete') {
        await dispatch(completeSalesChallan(id) as any).unwrap();
        setToastMsg('Sales Challan marked as COMPLETED.');
      } else if (confirmAction === 'delete') {
        await dispatch(deleteSalesChallan(id) as any).unwrap();
        setToastMsg('Draft Sales Challan deleted.');
        setTimeout(() => navigate('/dashboard/sales-challans'), 1000);
        return;
      }
      dispatch(fetchSalesChallanById(id) as any);
    } catch (err: any) {
      setToastMsg(err || 'Action failed');
    } finally {
      setShowConfirmModal(false);
      setConfirmAction(null);
    }
  };

  const triggerModal = (action: 'confirm' | 'cancel' | 'complete' | 'delete') => {
    setConfirmAction(action);
    setShowConfirmModal(true);
  };

  const getStatusBadge = (statusStr: string) => {
    switch (statusStr) {
      case 'DRAFT':
        return <span className="status-badge draft text-sm">Draft</span>;
      case 'CONFIRMED':
        return <span className="status-badge confirmed text-sm">Confirmed</span>;
      case 'CANCELLED':
        return <span className="status-badge low-stock text-sm">Cancelled</span>;
      case 'COMPLETED':
        return <span className="status-badge completed text-sm">Completed</span>;
      default:
        return <span className="status-badge text-sm">{statusStr}</span>;
    }
  };

  if (loading && !singleChallan) {
    return <Loader />;
  }

  if (!singleChallan) {
    return (
      <div className="p-6 text-center text-sm text-[var(--text-secondary)]">
        Sales Challan record not found. 
        <Link to="/dashboard/sales-challans" className="text-[var(--teal-text)] block hover:underline mt-2">
          Return to Hub
        </Link>
      </div>
    );
  }

  const isDraft = singleChallan.status === 'DRAFT';
  const isConfirmed = singleChallan.status === 'CONFIRMED';
  const isCompleted = singleChallan.status === 'COMPLETED';

  const downloadPdf = (type: 'challan' | 'invoice') => {
    const token = localStorage.getItem('token') || '';
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/crm/v1';
    window.open(`${apiUrl}/pdf/${type}/${singleChallan.id}?token=${token}`, '_blank');
  };

  return (
    <div className="space-y-6">
      {/* Toast notifications */}
      {toastMsg && <Toast message={toastMsg} type="info" onClose={() => setToastMsg(null)} />}
      
      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-[var(--surface-card)] rounded-lg p-6 max-w-sm w-full border border-[var(--border)] space-y-4">
            <h4 className="text-lg font-medium text-[var(--text-primary)] capitalize">
              {confirmAction} Sales Challan
            </h4>
            <p className="text-sm text-[var(--text-secondary)]">
              {confirmAction === 'confirm' && 'Are you sure you want to confirm this challan? This will check inventory levels and deduct quantities from stock.'}
              {confirmAction === 'cancel' && 'Are you sure you want to cancel this confirmed challan? This will return all items back into available stock.'}
              {confirmAction === 'complete' && 'Are you sure you want to mark this challan as completed? This denotes successful delivery to customer.'}
              {confirmAction === 'delete' && 'Are you sure you want to delete this draft? This action is permanent and cannot be undone.'}
            </p>
            <div className="flex gap-2 justify-end pt-2">
              <button
                onClick={() => setShowConfirmModal(false)}
                className="px-4 py-2 border rounded-lg text-sm font-medium hover:bg-[var(--surface-hover)]"
              >
                No, cancel
              </button>
              <button
                onClick={handleAction}
                className="px-4 py-2 bg-[var(--teal-bg)] border border-[var(--teal-border)] text-[var(--teal-text)] rounded-lg text-sm font-medium hover:bg-[var(--surface-hover)]"
              >
                Yes, proceed
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[var(--border)] pb-4">
        <div>
          <div className="flex items-center gap-3">
            <h2 className="text-2xl font-medium tracking-tight text-[var(--text-primary)]">
              Challan {singleChallan.challanNumber}
            </h2>
            {getStatusBadge(singleChallan.status)}
          </div>
          <p className="text-sm text-[var(--text-secondary)] mt-1">
            Registered on {new Date(singleChallan.challanDate).toLocaleString()} by {singleChallan.createdByUser?.fullName} ({singleChallan.createdByUser?.role})
          </p>
        </div>

        <div className="flex gap-2">
          <Link to="/dashboard/sales-challans" className="btn-secondary-action">
            Back to Hub
          </Link>
          
          {/* PDF Downloads */}
          <button onClick={() => downloadPdf('challan')} className="btn-secondary-action">
            📄 PDF Challan
          </button>
          {(isConfirmed || isCompleted) && (
            <button onClick={() => downloadPdf('invoice')} className="btn-secondary-action">
              🧾 PDF Invoice
            </button>
          )}
          
          {!isReadOnly && isDraft && (
            <>
              <Link to={`/dashboard/sales-challans/${singleChallan.id}/edit`} className="btn-primary-action">
                Edit Draft
              </Link>
              <button onClick={() => triggerModal('confirm')} className="btn-primary-action">
                🚀 Confirm & Dispatch
              </button>
              <button onClick={() => triggerModal('delete')} className="btn-danger-action">
                Delete Draft
              </button>
            </>
          )}

          {!isReadOnly && isConfirmed && (
            <>
              <button onClick={() => triggerModal('complete')} className="btn-primary-action">
                ✔️ Mark Completed
              </button>
              <button onClick={() => triggerModal('cancel')} className="btn-danger-action">
                Cancel Shipment
              </button>
            </>
          )}
        </div>
      </div>

      {error && (
        <div className="p-4 bg-[var(--red-bg)] text-[var(--red-text)] rounded-lg text-sm">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Customer & Item details */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Customer CRM details */}
          <div className="content-card space-y-4">
            <h3 className="text-lg font-medium text-[var(--text-primary)]">CRM Recipient Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="block text-xs font-semibold text-[var(--text-secondary)]">Company Name</span>
                <span className="text-[var(--text-primary)] font-medium">{singleChallan.customer?.companyName}</span>
              </div>
              <div>
                <span className="block text-xs font-semibold text-[var(--text-secondary)]">Customer Code</span>
                <span className="text-[var(--text-primary)] font-mono">{singleChallan.customer?.customerCode}</span>
              </div>
              <div>
                <span className="block text-xs font-semibold text-[var(--text-secondary)]">Email Address</span>
                <span className="text-[var(--text-primary)]">{singleChallan.customer?.email}</span>
              </div>
              <div>
                <span className="block text-xs font-semibold text-[var(--text-secondary)]">Phone Number</span>
                <span className="text-[var(--text-primary)]">{singleChallan.customer?.phone}</span>
              </div>
              <div className="md:col-span-2">
                <span className="block text-xs font-semibold text-[var(--text-secondary)]">Billing / Shipping Address</span>
                <span className="text-[var(--text-primary)]">{singleChallan.customer?.address}, {singleChallan.customer?.city}, {singleChallan.customer?.state}, {singleChallan.customer?.pincode}</span>
              </div>
              {singleChallan.customer?.gstNumber && (
                <div>
                  <span className="block text-xs font-semibold text-[var(--text-secondary)]">GST Identification Number</span>
                  <span className="text-[var(--text-primary)] font-mono">{singleChallan.customer?.gstNumber}</span>
                </div>
              )}
            </div>
          </div>

          {/* Items Table */}
          <div className="content-card space-y-4">
            <h3 className="text-lg font-medium text-[var(--text-primary)]">Shipped Items List</h3>
            <div className="overflow-x-auto">
              <table className="modern-table text-sm">
                <thead>
                  <tr>
                    <th className="pb-3 text-left">Product SKU</th>
                    <th className="pb-3 text-center">Quantity</th>
                    <th className="pb-3 text-right">Selling Price</th>
                    <th className="pb-3 text-right">Discount</th>
                    <th className="pb-3 text-right">Tax (GST %)</th>
                    <th className="pb-3 text-right">Line Total</th>
                  </tr>
                </thead>
                <tbody>
                  {singleChallan.items?.map((item) => {
                    const lineSub = Number(item.sellingPrice) * item.quantity;
                    return (
                      <tr key={item.id}>
                        <td className="py-3">
                          <span className="font-medium text-[var(--text-primary)]">{item.product?.productName}</span>
                          <div className="text-[10px] text-[var(--text-muted)] font-mono">{item.product?.sku}</div>
                        </td>
                        <td className="py-3 text-center font-medium">{item.quantity}</td>
                        <td className="py-3 text-right">₹{Number(item.sellingPrice).toFixed(2)}</td>
                        <td className="py-3 text-right text-[var(--red-icon)]">-₹{Number(item.discount).toFixed(2)}</td>
                        <td className="py-3 text-right text-[var(--text-secondary)]">
                          ₹{((lineSub - Number(item.discount)) * (Number(item.gstPercentage) / 100)).toFixed(2)}
                          <div className="text-[10px] text-[var(--text-muted)]">({Number(item.gstPercentage)}%)</div>
                        </td>
                        <td className="py-3 text-right font-semibold text-[var(--text-primary)]">
                          ₹{Number(item.total).toFixed(2)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Totals & Delivery Status Sidepanel */}
        <div className="space-y-6">
          
          {/* Summary Card */}
          <div className="content-card space-y-4">
            <h3 className="text-lg font-medium text-[var(--text-primary)]">Shipping & Totals</h3>
            
            <div className="space-y-3 text-sm border-b border-[var(--border)] pb-4">
              <div className="flex justify-between text-[var(--text-secondary)]">
                <span>Subtotal (Gross)</span>
                <span>₹{Number(singleChallan.subtotal).toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-[var(--text-secondary)]">
                <span>Global Addon Discount</span>
                <span className="text-[var(--red-icon)]">-₹{Number(singleChallan.discount).toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-[var(--text-secondary)]">
                <span>Total GST Tax Amount</span>
                <span>+₹{Number(singleChallan.gstAmount).toFixed(2)}</span>
              </div>
            </div>

            <div className="flex justify-between items-center font-semibold text-[var(--text-primary)] pt-2">
              <span>Grand Total</span>
              <span className="text-xl text-[var(--teal-text)]">
                ₹{Number(singleChallan.totalAmount).toFixed(2)}
              </span>
            </div>
          </div>

          {/* Delivery Date & Logistics */}
          <div className="content-card space-y-4">
            <h3 className="text-lg font-medium text-[var(--text-primary)]">Logistics Info</h3>
            <div className="space-y-3 text-sm">
              <div>
                <span className="block text-xs font-semibold text-[var(--text-secondary)]">Target Delivery Date</span>
                <span className="text-[var(--text-primary)]">
                  {singleChallan.deliveryDate ? new Date(singleChallan.deliveryDate).toLocaleDateString() : 'Immediate dispatch'}
                </span>
              </div>
              <div>
                <span className="block text-xs font-semibold text-[var(--text-secondary)]">Logistics / Shipping Remarks</span>
                <p className="text-[var(--text-secondary)] mt-1 whitespace-pre-wrap">
                  {singleChallan.remarks || 'No shipping remarks specified.'}
                </p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default ChallanDetailsPage;
