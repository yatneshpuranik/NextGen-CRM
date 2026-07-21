import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AlertTriangle, CheckCircle2, FileText, Users, Boxes, Megaphone, BellOff, Trash2, Check } from 'lucide-react';
import type { RootState, AppDispatch } from '../store';
import { 
  fetchNotifications, 
  markNotificationRead, 
  markAllNotificationsRead, 
  deleteNotification 
} from '../store/slices/enterpriseSlice';

export const NotificationsPage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { notifications } = useSelector((state: RootState) => state.enterprise);

  useEffect(() => {
    dispatch(fetchNotifications());
  }, [dispatch]);

  const handleMarkRead = (id: string) => {
    dispatch(markNotificationRead(id));
  };

  const handleMarkAllRead = () => {
    dispatch(markAllNotificationsRead());
  };

  const handleDelete = (id: string) => {
    dispatch(deleteNotification(id));
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'LOW_STOCK':
        return <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0" />;
      case 'CHALLAN_CONFIRMED':
        return <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />;
      case 'NEW_CHALLAN':
        return <FileText className="w-5 h-5 text-blue-500 shrink-0" />;
      case 'NEW_CUSTOMER':
        return <Users className="w-5 h-5 text-purple-500 shrink-0" />;
      case 'INVENTORY_UPDATED':
        return <Boxes className="w-5 h-5 text-teal-500 shrink-0" />;
      default:
        return <Megaphone className="w-5 h-5 text-[var(--teal-text-strong)] shrink-0" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[var(--border)] pb-4">
        <div>
          <h2 className="text-2xl font-medium tracking-tight text-[var(--text-primary)]">System Alerts & Notifications</h2>
          <p className="text-sm text-[var(--text-secondary)]">Stay updated on low inventory levels, customer additions, and shipment dispatches.</p>
        </div>

        {notifications.filter(n => !n.isRead).length > 0 && (
          <button 
            onClick={handleMarkAllRead}
            className="px-4 py-2 border border-[var(--teal-border)] bg-[var(--teal-bg)] text-[var(--teal-text)] hover:bg-[var(--surface-hover)] rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5"
          >
            <Check className="w-4 h-4" /> Mark All Read
          </button>
        )}
      </div>

      <div className="content-card divide-y divide-[var(--border)] max-w-4xl">
        {notifications.length === 0 ? (
          <div className="p-12 text-center text-sm text-[var(--text-muted)] space-y-2 flex flex-col items-center">
            <BellOff className="w-10 h-10 text-[var(--text-muted)]" />
            <p>Your inbox is empty. No notifications generated yet.</p>
          </div>
        ) : (
          notifications.map((n) => (
            <div 
              key={n.id}
              className={`p-4 flex items-start gap-4 transition-colors ${!n.isRead ? 'bg-[var(--teal-bg)]/10' : 'hover:bg-[var(--surface-hover)]'}`}
            >
              <span className="text-2xl flex-shrink-0 mt-0.5">{getIcon(n.type)}</span>
              <div className="flex-1 space-y-1 text-xs">
                <div className="flex justify-between items-start gap-4">
                  <h4 className={`text-sm text-[var(--text-primary)] ${!n.isRead ? 'font-bold' : 'font-semibold'}`}>
                    {n.title}
                  </h4>
                  <div className="flex gap-2">
                    {!n.isRead && (
                      <button 
                        onClick={() => handleMarkRead(n.id)}
                        className="text-[10px] text-[var(--teal-text)] hover:underline flex items-center gap-0.5"
                      >
                        <Check className="w-3 h-3" /> Mark read
                      </button>
                    )}
                    <button 
                      onClick={() => handleDelete(n.id)}
                      className="text-[10px] text-[var(--red-icon)] hover:underline flex items-center gap-0.5"
                    >
                      <Trash2 className="w-3 h-3" /> Delete
                    </button>
                  </div>
                </div>
                <p className="text-[var(--text-secondary)] leading-relaxed">{n.message}</p>
                <span className="text-[10px] text-[var(--text-muted)] block">
                  {new Date(n.createdAt).toLocaleString()}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default NotificationsPage;
