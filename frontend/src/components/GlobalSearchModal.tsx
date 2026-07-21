import React, { useEffect, useState, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import type { RootState, AppDispatch } from '../store';
import { Search } from 'lucide-react';
import { executeGlobalSearch, clearSearchResults } from '../store/slices/enterpriseSlice';

interface GlobalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GlobalSearchModal: React.FC<GlobalSearchModalProps> = ({ isOpen, onClose }) => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { searchResults } = useSelector((state: RootState) => state.enterprise);
  
  const [query, setQuery] = useState('');
  const [recents, setRecents] = useState<string[]>([]);
  const modalRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const saved = localStorage.getItem('recent_searches');
    if (saved) {
      setRecents(JSON.parse(saved));
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
    } else {
      setQuery('');
      dispatch(clearSearchResults());
    }
  }, [isOpen, dispatch]);

  useEffect(() => {
    if (!query.trim()) {
      dispatch(clearSearchResults());
      return;
    }

    const timer = setTimeout(() => {
      dispatch(executeGlobalSearch(query));
    }, 300);

    return () => clearTimeout(timer);
  }, [query, dispatch]);

  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleOutsideClick);
    }
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, [isOpen, onClose]);

  const handleSelectResult = (path: string, searchItem: string) => {
    // Add to recents
    const updated = [searchItem, ...recents.filter(x => x !== searchItem)].slice(0, 5);
    setRecents(updated);
    localStorage.setItem('recent_searches', JSON.stringify(updated));

    onClose();
    navigate(path);
  };

  const clearRecents = () => {
    setRecents([]);
    localStorage.removeItem('recent_searches');
  };

  if (!isOpen) return null;

  const { user } = useSelector((state: RootState) => state.auth);

  const canSeeCustomers = user?.role === 'ADMIN' || user?.role === 'SALES' || user?.role === 'ACCOUNTS';
  const canSeeInventory = user?.role === 'ADMIN' || user?.role === 'WAREHOUSE' || user?.role === 'ACCOUNTS';

  const totalResults = 
    (canSeeCustomers ? searchResults.customers.length : 0) + 
    searchResults.products.length + 
    (canSeeInventory ? searchResults.inventory.length : 0) + 
    searchResults.challans.length;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-start justify-center p-4 pt-[10vh] z-50">
      <div 
        ref={modalRef}
        className="bg-[var(--surface-card)] w-full max-w-2xl rounded-xl border border-[var(--border)] shadow-2xl flex flex-col overflow-hidden"
      >
        {/* Search Input Bar */}
        <div className="p-4 border-b border-[var(--border)] flex items-center gap-3">
          <Search className="w-5 h-5 text-[var(--text-muted)] shrink-0" />
          <input 
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search enterprise assets..."
            className="flex-1 bg-transparent border-0 outline-none text-sm text-[var(--text-primary)] placeholder-[var(--text-muted)]"
          />
          <button 
            onClick={onClose}
            className="px-2 py-1 text-xs border border-[var(--border)] rounded-md hover:bg-[var(--surface-hover)]"
          >
            ESC
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 max-h-[60vh] overflow-y-auto p-4 space-y-4">
          
          {/* Recent Searches */}
          {!query && recents.length > 0 && (
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">
                <span>Recent Searches</span>
                <button onClick={clearRecents} className="hover:text-[var(--red-icon)]">Clear</button>
              </div>
              <div className="flex flex-wrap gap-2">
                {recents.map((item, idx) => (
                  <button 
                    key={idx}
                    onClick={() => setQuery(item)}
                    className="px-3 py-1 bg-[var(--surface-hover)] border border-[var(--border)] rounded-full text-xs font-medium hover:border-[var(--teal-border)] hover:text-[var(--teal-text)]"
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Results Lists */}
          {query && totalResults === 0 ? (
            <div className="p-8 text-center text-sm text-[var(--text-muted)]">
              No matching records found for "{query}".
            </div>
          ) : (
            <div className="space-y-4">
              
              {/* Customers */}
              {canSeeCustomers && searchResults.customers.length > 0 && (
                <div className="space-y-1">
                  <h5 className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider px-2">Customers</h5>
                  {searchResults.customers.map((c) => (
                    <div 
                      key={c.id}
                      onClick={() => handleSelectResult(`/dashboard/customers/${c.id}`, c.companyName)}
                      className="p-2 hover:bg-[var(--surface-hover)] rounded-lg cursor-pointer flex items-center justify-between text-xs transition-colors"
                    >
                      <span className="font-medium text-[var(--text-primary)]">{c.companyName}</span>
                      <span className="text-[10px] text-[var(--text-muted)]">Code: {c.customerCode}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Products */}
              {searchResults.products.length > 0 && (
                <div className="space-y-1">
                  <h5 className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider px-2">Products</h5>
                  {searchResults.products.map((p) => (
                    <div 
                      key={p.id}
                      onClick={() => handleSelectResult(`/dashboard/products/${p.id}`, p.productName)}
                      className="p-2 hover:bg-[var(--surface-hover)] rounded-lg cursor-pointer flex items-center justify-between text-xs transition-colors"
                    >
                      <span className="font-medium text-[var(--text-primary)]">{p.productName}</span>
                      <span className="text-[10px] text-[var(--text-muted)]">SKU: {p.sku}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Inventory */}
              {canSeeInventory && searchResults.inventory.length > 0 && (
                <div className="space-y-1">
                  <h5 className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider px-2">Inventory Stock</h5>
                  {searchResults.inventory.map((i) => (
                    <div 
                      key={i.id}
                      onClick={() => handleSelectResult(`/dashboard/inventory/${i.id}`, i.product?.productName)}
                      className="p-2 hover:bg-[var(--surface-hover)] rounded-lg cursor-pointer flex items-center justify-between text-xs transition-colors"
                    >
                      <span className="font-medium text-[var(--text-primary)]">{i.product?.productName}</span>
                      <span className="text-[10px] text-[var(--text-muted)]">Stock: {i.availableStock} in {i.warehouseLocation || 'Main Warehouse'}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Challans */}
              {searchResults.challans.length > 0 && (
                <div className="space-y-1">
                  <h5 className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider px-2">Delivery Challans</h5>
                  {searchResults.challans.map((ch) => (
                    <div 
                      key={ch.id}
                      onClick={() => handleSelectResult(`/dashboard/sales-challans/${ch.id}`, ch.challanNumber)}
                      className="p-2 hover:bg-[var(--surface-hover)] rounded-lg cursor-pointer flex items-center justify-between text-xs transition-colors"
                    >
                      <span className="font-medium text-[var(--text-primary)]">{ch.challanNumber}</span>
                      <span className="text-[10px] text-[var(--text-muted)]">{ch.customer?.companyName} • {ch.status}</span>
                    </div>
                  ))}
                </div>
              )}

            </div>
          )}

        </div>

        {/* Footer info */}
        <div className="p-3 bg-[var(--surface-page)] border-t border-[var(--border)] text-[10px] text-[var(--text-muted)] flex justify-between">
          <span>Search index is active and synchronized</span>
          <span>Tip: Press Esc to close search at any time</span>
        </div>
      </div>
    </div>
  );
};
