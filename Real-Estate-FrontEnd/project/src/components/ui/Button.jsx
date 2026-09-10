export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  disabled = false,
  loading = false,
  type = 'button',
  onClick,
  ...props
}) {
  const base =
    'inline-flex items-center justify-center font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed select-none';

  const variants = {
    primary: 'bg-raiz-black text-white hover:bg-raiz-dark border border-raiz-black',
    secondary: 'bg-white text-raiz-black border border-raiz-border hover:border-raiz-black',
    peach: 'bg-raiz-peach text-white border border-raiz-peach hover:brightness-95',
    ghost: 'bg-transparent text-raiz-black hover:bg-raiz-offwhite border border-transparent',
    danger: 'bg-white text-red-600 border border-red-200 hover:bg-red-50 hover:border-red-300',
    link: 'bg-transparent text-raiz-black underline-offset-4 hover:underline border-transparent p-0 h-auto',
  };

  const sizes = {
    sm: 'h-8 px-3 text-xs rounded-md gap-1.5',
    md: 'h-10 px-4 text-sm rounded-md gap-2',
    lg: 'h-12 px-6 text-sm rounded-lg gap-2',
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`${base} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {loading && (
        <svg className="animate-spin" width="14" height="14" viewBox="0 0 14 14" fill="none">
          <circle cx="7" cy="7" r="5.5" stroke="currentColor" strokeWidth="1.5" opacity="0.25" />
          <path d="M12.5 7a5.5 5.5 0 0 0-5.5-5.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      )}
      {children}
    </button>
  );
}
