export function EmptyState({ title, description, action, icon }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
      {icon && (
        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-raiz-offwhite border border-raiz-border">
          <span className="text-raiz-secondary">{icon}</span>
        </div>
      )}
      <h3 className="text-sm font-semibold tracking-wide text-raiz-black uppercase">{title}</h3>
      {description && <p className="mt-2 max-w-sm text-sm text-raiz-secondary">{description}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

export function LoadingState({ label = 'Loading…' }) {
  return (
    <div className="flex flex-col items-center justify-center py-16">
      <svg className="animate-spin mb-3" width="24" height="24" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="9" stroke="#E5E2DF" strokeWidth="2" />
        <path d="M21 12a9 9 0 0 0-9-9" stroke="#E7A58C" strokeWidth="2" strokeLinecap="round" />
      </svg>
      <p className="text-sm text-raiz-secondary">{label}</p>
    </div>
  );
}

export function ErrorState({ message = 'Something went wrong.', onRetry }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-red-50 border border-red-100">
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
          <path d="M10 6v5M10 14v.5" stroke="#EF4444" strokeWidth="1.5" strokeLinecap="round" />
          <circle cx="10" cy="10" r="8.5" stroke="#EF4444" strokeWidth="1.5" />
        </svg>
      </div>
      <h3 className="text-sm font-semibold text-raiz-black">Unable to load</h3>
      <p className="mt-2 max-w-sm text-sm text-raiz-secondary">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="mt-4 text-sm font-medium text-raiz-black border border-raiz-border rounded-md px-4 py-2 hover:border-raiz-black transition-colors"
        >
          Try again
        </button>
      )}
    </div>
  );
}
