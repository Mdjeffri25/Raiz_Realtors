export const ROLES = {
  ADMIN: 'ADMIN',
  SALES: 'SALES',
  BACK_OFFICE: 'BACK_OFFICE',
  AUDITOR: 'AUDITOR',
};

export const LEAD_STAGES = [
  { value: 'NEW', label: 'New' },
  { value: 'CONTACTED', label: 'Contacted' },
  { value: 'SITE_VISIT', label: 'Site Visit' },
  { value: 'INTERESTED', label: 'Interested' },
  { value: 'NEGOTIATION', label: 'Negotiation' },
  { value: 'BOOKED', label: 'Booked' },
  { value: 'LOST', label: 'Lost' },
];

export const STAGE_COLORS = {
  NEW: { bg: '#F5F5F4', text: '#44403C', dot: '#A8A29E' },
  CONTACTED: { bg: '#FEF3C7', text: '#92400E', dot: '#F59E0B' },
  SITE_VISIT: { bg: '#DBEAFE', text: '#1E40AF', dot: '#3B82F6' },
  INTERESTED: { bg: '#F6E3DA', text: '#9A4A2A', dot: '#E7A58C' },
  NEGOTIATION: { bg: '#E0E7FF', text: '#3730A3', dot: '#6366F1' },
  BOOKED: { bg: '#D1FAE5', text: '#065F46', dot: '#10B981' },
  LOST: { bg: '#FEE2E2', text: '#991B1B', dot: '#EF4444' },
};

export const UNIT_STATUS = {
  AVAILABLE: { bg: '#F6E3DA', text: '#9A4A2A', dot: '#E7A58C' },
  BOOKED: { bg: '#F5F5F4', text: '#44403C', dot: '#A8A29E' },
};

export const AUDIT_ACTIONS = [
  'LOGIN',
  'CREATED',
  'UPDATED',
  'DELETED',
  'BOOKED',
  'CANCELLED',
  'ASSIGNED',
];

export const ROLE_OPTIONS = [
  { value: 'ADMIN', label: 'Admin' },
  { value: 'SALES', label: 'Sales' },
  { value: 'BACK_OFFICE', label: 'Back Office' },
  { value: 'AUDITOR', label: 'Auditor' },
];

export function formatCurrency(amount) {
  if (amount === null || amount === undefined) return '—';
  const num = Number(amount);
  if (isNaN(num)) return '—';
  if (num >= 10000000) {
    return `₹${(num / 10000000).toFixed(2)} Cr`;
  } else if (num >= 100000) {
    return `₹${(num / 100000).toFixed(2)} L`;
  }
  return `₹${num.toLocaleString('en-IN')}`;
}

export function formatDate(dateString) {
  if (!dateString) return '—';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return '—';
  return date.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

export function formatDateTime(dateString) {
  if (!dateString) return '—';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return '—';
  return date.toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });
}

export function formatTime(dateString) {
  if (!dateString) return '—';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return '—';
  return date.toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });
}

export function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

export function isOverdue(dateString) {
  if (!dateString) return false;
  const date = new Date(dateString);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return date < today;
}

export function isToday(dateString) {
  if (!dateString) return false;
  const date = new Date(dateString);
  const today = new Date();
  return (
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear()
  );
}

export function isUpcoming(dateString) {
  if (!dateString) return false;
  const date = new Date(dateString);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return date > today;
}
