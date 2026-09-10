import { createContext, useContext, useState, useCallback } from 'react';

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback((message, type = 'info', duration = 4000) => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, message, type }]);
    if (duration > 0) {
      setTimeout(() => removeToast(id), duration);
    }
    return id;
  }, [removeToast]);

  const showSuccess = useCallback((msg, duration) => showToast(msg, 'success', duration), [showToast]);
  const showError = useCallback((msg, duration) => showToast(msg, 'error', duration), [showToast]);
  const showInfo = useCallback((msg, duration) => showToast(msg, 'info', duration), [showToast]);
  const showWarning = useCallback((msg, duration) => showToast(msg, 'warning', duration), [showToast]);

  return (
    <ToastContext.Provider value={{ showToast, showSuccess, showError, showInfo, showWarning, removeToast }}>
      {children}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </ToastContext.Provider>
  );
}

function ToastContainer({ toasts, onRemove }) {
  const iconMap = {
    success: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <path d="M3.333 8.667L6.667 12l6-8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    error: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      </svg>
    ),
    warning: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <path d="M8 2v6M8 12v.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      </svg>
    ),
    info: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <path d="M8 11V7M8 5v.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      </svg>
    ),
  };

  const colorMap = {
    success: { border: '#D1FAE5', icon: '#10B981', bg: '#F0FDF4' },
    error: { border: '#FEE2E2', icon: '#EF4444', bg: '#FEF2F2' },
    warning: { border: '#FEF3C7', icon: '#F59E0B', bg: '#FFFBEB' },
    info: { border: '#E5E2DF', icon: '#6B6865', bg: '#FFFFFF' },
  };

  return (
    <div className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-2 max-w-sm">
      {toasts.map((toast) => {
        const colors = colorMap[toast.type] || colorMap.info;
        return (
          <div
            key={toast.id}
            className="animate-slide-in-right flex items-start gap-3 rounded-lg border bg-white px-4 py-3 shadow-md"
            style={{ borderColor: colors.border, backgroundColor: colors.bg }}
          >
            <span style={{ color: colors.icon }} className="mt-0.5 shrink-0">
              {iconMap[toast.type] || iconMap.info}
            </span>
            <p className="flex-1 text-sm leading-relaxed text-raiz-black">{toast.message}</p>
            <button
              onClick={() => onRemove(toast.id)}
              className="shrink-0 text-raiz-secondary hover:text-raiz-black transition-colors"
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M3 3l8 8M11 3l-8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
            </button>
          </div>
        );
      })}
    </div>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
}

export default ToastContext;
