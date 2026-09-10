import { STAGE_COLORS, UNIT_STATUS } from '../../utils/constants';

export default function StatusBadge({ status, type = 'stage', size = 'sm' }) {
  const colorMap = type === 'unit' ? UNIT_STATUS : STAGE_COLORS;
  const normalized = (status || '').toUpperCase();
  const colors = colorMap[normalized] || { bg: '#F5F5F4', text: '#44403C', dot: '#A8A29E' };

  const label = normalized
    .split('_')
    .map((w) => w.charAt(0) + w.slice(1).toLowerCase())
    .join(' ');

  const sizes = {
    xs: 'text-10 px-1.5 py-0.5 gap-1',
    sm: 'text-xs px-2 py-0.5 gap-1.5',
    md: 'text-sm px-2.5 py-1 gap-1.5',
  };

  return (
    <span
      className={`inline-flex items-center rounded ${sizes[size]} font-medium whitespace-nowrap`}
      style={{ backgroundColor: colors.bg, color: colors.text }}
    >
      <span
        className="rounded-full"
        style={{
          width: size === 'xs' ? '5px' : '6px',
          height: size === 'xs' ? '5px' : '6px',
          backgroundColor: colors.dot,
        }}
      />
      {label}
    </span>
  );
}
