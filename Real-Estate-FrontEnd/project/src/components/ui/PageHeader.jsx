export default function PageHeader({ title, description, children }) {
  return (
    <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
      <div>
        <h1 className="font-serif text-2xl font-semibold tracking-tight text-raiz-black sm:text-3xl">
          {title}
        </h1>
        {description && <p className="mt-1 text-sm text-raiz-secondary">{description}</p>}
      </div>
      {children && <div className="flex items-center gap-2 shrink-0">{children}</div>}
    </div>
  );
}
