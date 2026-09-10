export default function Drawer({ open, onClose, title, children, footer, width = 'max-w-md' }) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[1000] flex justify-end">
      <div
        className="absolute inset-0 bg-raiz-black/40 animate-fade-in"
        onClick={onClose}
      />
      <div
        className={`relative h-full w-full ${width} animate-slide-in-right bg-white border-l border-raiz-border shadow-xl flex flex-col`}
      >
        <div className="flex items-center justify-between border-b border-raiz-border px-6 py-4 shrink-0">
          <h2 className="text-base font-semibold text-raiz-black">{title}</h2>
          <button
            onClick={onClose}
            className="text-raiz-secondary hover:text-raiz-black transition-colors p-1 -mr-1"
          >
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <path d="M4 4l10 10M14 4L4 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-6 py-5 scrollbar-thin">{children}</div>
        {footer && (
          <div className="flex items-center justify-end gap-3 border-t border-raiz-border px-6 py-4 shrink-0">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
