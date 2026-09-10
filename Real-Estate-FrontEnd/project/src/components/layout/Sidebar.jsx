import { ROLES } from '../../utils/constants';

import {
  LayoutDashboard,
  Users,
  Building2,
  ClipboardList,
  Phone,
  ScrollText,
  Settings,
} from 'lucide-react';

const ALL_NAV = {
  overview: {
    label: 'Overview',
    items: [
      { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard, roles: [ROLES.ADMIN, ROLES.SALES, ROLES.BACK_OFFICE, ROLES.AUDITOR] },
    ],
  },
  sales: {
    label: 'Sales',
    items: [
      { label: 'Leads', path: '/leads', icon: Users, roles: [ROLES.ADMIN, ROLES.SALES, ROLES.BACK_OFFICE], rolesLabel: { SALES: 'My Leads' } },
      { label: 'Follow-ups', path: '/follow-ups', icon: Phone, roles: [ROLES.ADMIN, ROLES.SALES, ROLES.BACK_OFFICE] },
    ],
  },
  property: {
    label: 'Property',
    items: [
      { label: 'Properties', path: '/properties', icon: Building2, roles: [ROLES.ADMIN, ROLES.SALES, ROLES.BACK_OFFICE] },
    ],
  },
  operations: {
    label: 'Operations',
    items: [
      { label: 'Bookings', path: '/bookings', icon: ClipboardList, roles: [ROLES.ADMIN, ROLES.SALES, ROLES.BACK_OFFICE, ROLES.AUDITOR], rolesLabel: { SALES: 'My Bookings' } },
    ],
  },
  compliance: {
    label: 'Compliance',
    items: [
      { label: 'Audit Logs', path: '/audit-logs', icon: ScrollText, roles: [ROLES.ADMIN, ROLES.AUDITOR] },
    ],
  },
  system: {
    label: 'System',
    items: [
      { label: 'Users', path: '/users', icon: Users, roles: [ROLES.ADMIN] },
      { label: 'Settings', path: '/settings', icon: Settings, roles: [ROLES.ADMIN, ROLES.SALES, ROLES.BACK_OFFICE, ROLES.AUDITOR] },
    ],
  },
};

import { useAuth } from '../../context/AuthContext';

export function getNavForRole(role) {
  const groups = [];
  for (const key of Object.keys(ALL_NAV)) {
    const group = ALL_NAV[key];
    const items = group.items.filter((item) => item.roles.includes(role));
    if (items.length > 0) {
      groups.push({ label: group.label, items });
    }
  }
  return groups;
}

export default function Sidebar({ open, onClose }) {
  const { user } = useAuth();
  const navGroups = user ? getNavForRole(user.role) : [];

  return (
    <>
      {/* Mobile overlay */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-raiz-black/40 lg:hidden animate-fade-in"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed lg:sticky top-0 left-0 z-50 lg:z-auto h-screen w-64 shrink-0 border-r border-raiz-border bg-white flex flex-col transition-transform duration-300 ${
          open ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Brand */}
        <div className="px-6 py-6 border-b border-raiz-border">
          <div className="font-serif text-xl font-bold tracking-tight text-raiz-black leading-none">
            RAIZ
          </div>
          <div className="font-serif text-xl font-bold tracking-tight text-raiz-black leading-none mt-0.5">
            REALTORS
          </div>
          <div className="mt-2 text-10 font-medium tracking-widest text-raiz-secondary uppercase">
            Real Estate · Sales · Operations
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto scrollbar-thin px-3 py-4">
          {navGroups.map((group) => (
            <div key={group.label} className="mb-5">
              <div className="px-3 mb-2 text-10 font-semibold tracking-widest text-raiz-secondary/70 uppercase">
                {group.label}
              </div>
              <div className="space-y-0.5">
                {group.items.map((item) => {
                  const Icon = item.icon;
                  const label =
                    item.rolesLabel && item.rolesLabel[user?.role]
                      ? item.rolesLabel[user.role]
                      : item.label;
                  return (
                    <NavLink key={item.path} to={item.path} label={label} icon={Icon} onClick={onClose} />
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* Footer */}
        <div className="border-t border-raiz-border px-6 py-4">
          <div className="text-10 tracking-widest text-raiz-secondary/60 uppercase">
            © 2026 Raiz Realtors
          </div>
        </div>
      </aside>
    </>
  );
}

import { Link, useLocation } from 'react-router-dom';

function NavLink({ to, label, icon: Icon, onClick }) {
  const location = useLocation();
  const isActive = location.pathname === to || location.pathname.startsWith(to + '/');

  return (
    <Link
      to={to}
      onClick={onClick}
      className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-all duration-150 ${
        isActive
          ? 'bg-raiz-peach-light text-raiz-black'
          : 'text-raiz-secondary hover:text-raiz-black hover:bg-raiz-offwhite'
      }`}
    >
      <Icon size={16} className={isActive ? 'text-raiz-peach' : ''} />
      {label}
    </Link>
  );
}
