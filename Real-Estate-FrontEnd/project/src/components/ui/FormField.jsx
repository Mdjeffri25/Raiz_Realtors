export function Input({ label, error, className = '', icon, ...props }) {
  return (
    <div className="w-full">
      {label && (
        <label className="mb-1.5 block text-xs font-medium tracking-wide text-raiz-secondary uppercase">
          {label}
        </label>
      )}
      <div className="relative">
        {icon && (
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-raiz-secondary">
            {icon}
          </span>
        )}
        <input
          className={`w-full h-10 rounded-md border bg-white px-3 text-sm text-raiz-black placeholder:text-raiz-secondary/60 focus:outline-none focus:border-raiz-black transition-colors ${
            icon ? 'pl-9' : ''
          } ${error ? 'border-red-400' : 'border-raiz-border'} ${className}`}
          {...props}
        />
      </div>
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  );
}

export function Select({ label, error, children, className = '', ...props }) {
  return (
    <div className="w-full">
      {label && (
        <label className="mb-1.5 block text-xs font-medium tracking-wide text-raiz-secondary uppercase">
          {label}
        </label>
      )}
      <select
        className={`w-full h-10 rounded-md border bg-white px-3 text-sm text-raiz-black focus:outline-none focus:border-raiz-black transition-colors appearance-none cursor-pointer ${
          error ? 'border-red-400' : 'border-raiz-border'
        } ${className}`}
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12' fill='none'%3E%3Cpath d='M2 4l4 4 4-4' stroke='%236B6865' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E")`,
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'right 10px center',
          paddingRight: '28px',
        }}
        {...props}
      >
        {children}
      </select>
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  );
}

export function Textarea({ label, error, className = '', ...props }) {
  return (
    <div className="w-full">
      {label && (
        <label className="mb-1.5 block text-xs font-medium tracking-wide text-raiz-secondary uppercase">
          {label}
        </label>
      )}
      <textarea
        className={`w-full rounded-md border bg-white px-3 py-2 text-sm text-raiz-black placeholder:text-raiz-secondary/60 focus:outline-none focus:border-raiz-black transition-colors resize-none ${
          error ? 'border-red-400' : 'border-raiz-border'
        } ${className}`}
        rows={4}
        {...props}
      />
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  );
}
