import React, { useEffect, useState, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import type { RootState, AppDispatch } from '../store';
import { 
  fetchNotifications, 
  markNotificationRead, 
  markAllNotificationsRead, 
  deleteNotification 
} from '../store/slices/enterpriseSlice';

export const NotificationDropdown: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { notifications } = useSelector((state: RootState) => state.enterprise);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    dispatch(fetchNotifications());
    
    // Poll for notifications every 20 seconds
    const interval = setInterval(() => {
      dispatch(fetchNotifications());
    }, 20000);

    return () => clearInterval(interval);
  }, [dispatch]);

  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const handleMarkAllRead = () => {
    dispatch(markAllNotificationsRead());
  };

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    dispatch(deleteNotification(id));
  };

  const handleNotificationClick = (n: any) => {
    if (!n.isRead) {
      dispatch(markNotificationRead(n.id));
    }
    setIsOpen(false);
    
    // Smart routing based on notification type
    if (n.type.includes('CHALLAN')) {
      navigate('/dashboard/sales-challans');
    } else if (n.type.includes('CUSTOMER')) {
      navigate('/dashboard/customers');
    } else if (n.type.includes('STOCK') || n.type.includes('INVENTORY')) {
      navigate('/dashboard/inventory');
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'LOW_STOCK':
        return '🚨';
      case 'CHALLAN_CONFIRMED':
        return '✔️';
      case 'NEW_CHALLAN':
        return '📜';
      case 'NEW_CUSTOMER':
        return '👥';
      case 'INVENTORY_UPDATED':
        return '🏭';
      default:
        return '📢';
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-xl hover:bg-[var(--surface-hover)] rounded-full transition-colors flex items-center justify-center"
      >
        <span>🔔</span>
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-[var(--red-icon)] text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-[var(--surface-card)]">
            {unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-[var(--surface-card)] border border-[var(--border)] rounded-xl shadow-xl z-50 overflow-hidden">
          <div className="p-4 border-b border-[var(--border)] flex items-center justify-between">
            <h4 className="text-sm font-semibold text-[var(--text-primary)]">In-App Notifications</h4>
            {unreadCount > 0 && (
              <button 
                onClick={handleMarkAllRead}
                className="text-xs text-[var(--teal-text)] font-semibold hover:underline"
              >
                Mark all read
              </button>
            )}
          </div>

          <div className="max-h-64 overflow-y-auto divide-y divide-[var(--border)]">
            {notifications.length === 0 ? (
              <div className="p-6 text-center text-xs text-[var(--text-muted)]">
                Zero system alerts found.
              </div>
            ) : (
              notifications.map((n) => (
                <div 
                  key={n.id}
                  onClick={() => handleNotificationClick(n)}
                  className={`p-3.5 flex items-start gap-3 cursor-pointer transition-colors hover:bg-[var(--surface-hover)] ${!n.isRead ? 'bg-[var(--teal-bg)]/20' : ''}`}
                >
                  <span className="text-lg flex-shrink-0">{getIcon(n.type)}</span>
                  <div className="flex-1 space-y-0.5">
                    <div className="flex justify-between items-start gap-2">
                      <span className={`text-xs font-semibold text-[var(--text-primary)] ${!n.isRead ? 'font-bold' : ''}`}>
                        {n.title}
                      </span>
                      <button 
                        onClick={(e) => handleDelete(n.id, e)}
                        className="text-[10px] text-[var(--text-muted)] hover:text-[var(--red-icon)]"
                        title="Delete"
                      >
                        ❌
                      </button>
                    </div>
                    <p className="text-[11px] text-[var(--text-secondary)] leading-relaxed">
                      {n.message}
                    </p>
                    <span className="text-[9px] text-[var(--text-muted)] block">
                      {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="p-2.5 bg-[var(--surface-hover)] text-center border-t border-[var(--border)]">
            <button 
              onClick={() => {
                setIsOpen(false);
                navigate('/dashboard/notifications');
              }}
              className="text-xs font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
            >
              See all notifications
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
