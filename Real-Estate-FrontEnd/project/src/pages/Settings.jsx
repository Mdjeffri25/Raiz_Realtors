import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import Button from '../components/ui/Button';
import PageHeader from '../components/ui/PageHeader';
import { LogOut, Mail, Shield, User as UserIcon, Building } from 'lucide-react';

export default function Settings() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const roleLabel = (user?.role || '')
    .split('_')
    .map((w) => w.charAt(0) + w.slice(1).toLowerCase())
    .join(' ');

  const initials = (user?.name || 'U')
    .split(' ')
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <div>
      <PageHeader title="Settings" description="Your account & application information." />

      <div className="max-w-2xl space-y-6">
        {/* Profile */}
        <div className="rounded-lg border border-raiz-border bg-white p-6">
          <h3 className="text-sm font-semibold text-raiz-black uppercase tracking-wide mb-5">Profile</h3>

          <div className="flex items-center gap-4 mb-6">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-raiz-black text-white text-lg font-semibold shrink-0">
              {initials}
            </div>
            <div>
              <div className="font-serif text-xl font-semibold text-raiz-black">{user?.name}</div>
              <div className="text-sm text-raiz-secondary mt-0.5">{roleLabel}</div>
            </div>
          </div>

          <div className="space-y-4 pt-4 border-t border-raiz-border">
            <SettingRow icon={UserIcon} label="Name" value={user?.name} />
            <SettingRow icon={Mail} label="Email" value={user?.email} />
            <SettingRow icon={Shield} label="Role" value={roleLabel} />
            <SettingRow icon={Building} label="User ID" value={String(user?.userId || '—')} />
          </div>
        </div>

        {/* Application Info */}
        <div className="rounded-lg border border-raiz-border bg-white p-6">
          <h3 className="text-sm font-semibold text-raiz-black uppercase tracking-wide mb-5">Application</h3>
          <div className="space-y-4">
            <SettingRow label="Application" value="Raiz Realtors CRM" />
            <SettingRow label="Version" value="1.0.0" />
            <SettingRow label="Environment" value="Development" />
            <SettingRow
              label="API Base URL"
              value={import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api'}
              mono
            />
          </div>
        </div>

        {/* Logout */}
        <div className="rounded-lg border border-raiz-border bg-white p-6">
          <h3 className="text-sm font-semibold text-raiz-black uppercase tracking-wide mb-3">Session</h3>
          <p className="text-sm text-raiz-secondary mb-4">
            You are currently signed in. You can sign out at any time.
          </p>
          <Button
            variant="danger"
            onClick={() => {
              logout();
              navigate('/login');
            }}
          >
            <LogOut size={15} />
            Sign Out
          </Button>
        </div>
      </div>
    </div>
  );
}

function SettingRow({ icon: Icon, label, value, mono }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <div className="flex items-center gap-2.5">
        {Icon && <Icon size={15} className="text-raiz-secondary" />}
        <span className="text-sm text-raiz-secondary">{label}</span>
      </div>
      <span className={`text-sm font-medium text-raiz-black ${mono ? 'font-mono text-xs' : ''}`}>{value || '—'}</span>
    </div>
  );
}
// Settings.jsx
