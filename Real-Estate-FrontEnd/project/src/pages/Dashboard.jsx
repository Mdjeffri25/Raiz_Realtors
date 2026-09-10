import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import dashboardApi from '../api/dashboardApi';
import { LoadingState, ErrorState, EmptyState } from '../components/ui/States';
import StatusBadge from '../components/ui/StatusBadge';
import PageHeader from '../components/ui/PageHeader';
import {
  formatCurrency,
  formatDate,
  formatTime,
  getGreeting,
  LEAD_STAGES,
  STAGE_COLORS,
} from '../utils/constants';
import { Users, Phone, Building2, ClipboardList, TrendingUp } from 'lucide-react';

export default function Dashboard() {
  const { user } = useAuth();
  const { showError } = useToast();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchDashboard = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await dashboardApi.getData();
      setData(res.data);
    } catch (err) {
      setError(err.message || 'Unable to load dashboard data.');
      if (err.status !== 0) showError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  const today = new Date().toLocaleDateString('en-IN', {
    weekday: 'long',
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });

  if (loading) return <LoadingState label="Loading dashboard…" />;
  if (error) return <ErrorState message={error} onRetry={fetchDashboard} />;

  const stats = data || {};
  const pipeline = data?.pipeline || [];
  const followUps = data?.followUpsToday || [];
  const projects = data?.unitAvailability || [];
  const bookings = data?.recentBookings || [];
  const activity = data?.recentActivity || [];

  return (
    <div className="space-y-8">
      {/* Greeting */}
      <div>
        <div className="text-xs tracking-widest text-raiz-secondary uppercase mb-1">{today}</div>
        <h1 className="font-serif text-2xl sm:text-3xl font-semibold tracking-tight text-raiz-black">
          {getGreeting()}, {user?.name}
        </h1>
        <p className="mt-1 text-sm text-raiz-secondary">
          Sales overview & today's activity across Raiz Realtors.
        </p>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-px bg-raiz-border rounded-lg overflow-hidden border border-raiz-border">
        <StatBlock icon={Users} label="Total Leads" value={stats.totalLeads ?? 0} />
<StatBlock icon={TrendingUp} label="Qualified" value={stats.qualified ?? 0} />
<StatBlock icon={Phone} label="Follow-ups Today" value={stats.todayFollowUps ?? 0} />
<StatBlock icon={Building2} label="Available Units" value={stats.availableUnits ?? 0} />
<StatBlock icon={ClipboardList} label="Bookings" value={stats.bookings ?? 0} />
      </div>

      {/* Pipeline */}
      <Section title="Sales Pipeline" description="Lead distribution across stages">
        <div className="flex flex-wrap gap-3">
          {LEAD_STAGES.map((stage) => {
            const count = pipeline.find((p) => p.stage === stage.value)?.count ?? 0;
            const colors = STAGE_COLORS[stage.value];
            const maxCount = Math.max(...LEAD_STAGES.map((s) => pipeline.find((p) => p.stage === s.value)?.count ?? 0), 1);
            const width = (count / maxCount) * 100;
            return (
              <div
                key={stage.value}
                className="flex-1 min-w-[120px] rounded-lg border border-raiz-border bg-white p-4"
              >
                <div className="flex items-center gap-2 mb-2">
                  <span
                    className="h-2 w-2 rounded-full"
                    style={{ backgroundColor: colors.dot }}
                  />
                  <span className="text-xs font-medium text-raiz-secondary uppercase tracking-wide">
                    {stage.label}
                  </span>
                </div>
                <div className="text-2xl font-semibold text-raiz-black">{count}</div>
                <div className="mt-2 h-1 rounded-full bg-raiz-offwhite overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{ width: `${width}%`, backgroundColor: colors.dot }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </Section>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Follow-ups today */}
        <Section title="Follow-ups Today" description="Scheduled callbacks for today">
          {followUps.length === 0 ? (
            <InlineEmpty text="No follow-ups scheduled for today." />
          ) : (
            <div className="divide-y divide-raiz-border">
              {followUps.slice(0, 6).map((fu, i) => (
                <div key={i} className="flex items-center gap-3 py-2.5 first:pt-0 last:pb-0">
                  <div className="text-xs text-raiz-secondary w-16 shrink-0">
                    {formatTime(fu.followUpDate)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-raiz-black truncate">{fu.leadName || fu.name}</div>
                    <div className="text-xs text-raiz-secondary truncate">
                      {fu.assignedUserName || 'Unassigned'}
                    </div>
                  </div>
                  <StatusBadge status={fu.stage} size="xs" />
                </div>
              ))}
            </div>
          )}
        </Section>

        {/* Unit availability */}
        <Section title="Unit Availability" description="Project inventory overview">
          {projects.length === 0 ? (
            <InlineEmpty text="No project data available." />
          ) : (
            <div className="divide-y divide-raiz-border">
              {projects.slice(0, 6).map((proj, i) => {
                const total = proj.totalUnits ?? 0;
                const available = proj.availableUnits ?? 0;
                const pct = total > 0 ? (available / total) * 100 : 0;
                return (
                  <div key={i} className="py-3 first:pt-0 last:pb-0">
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="text-sm font-medium text-raiz-black">{proj.name}</div>
                      <div className="text-xs text-raiz-secondary">
                        {available} / {total} available
                      </div>
                    </div>
                    <div className="h-1.5 rounded-full bg-raiz-offwhite overflow-hidden">
                      <div
                        className="h-full rounded-full bg-raiz-peach transition-all"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </Section>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent bookings */}
        <Section title="Recent Bookings" description="Latest closed transactions">
          {bookings.length === 0 ? (
            <InlineEmpty text="No bookings yet." />
          ) : (
            <div className="overflow-x-auto scrollbar-thin">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-raiz-border">
                    <th className="text-left text-10 font-semibold tracking-wide text-raiz-secondary uppercase py-2 pr-3">Lead</th>
                    <th className="text-left text-10 font-semibold tracking-wide text-raiz-secondary uppercase py-2 pr-3">Unit</th>
                    <th className="text-right text-10 font-semibold tracking-wide text-raiz-secondary uppercase py-2 pr-3">Amount</th>
                    <th className="text-left text-10 font-semibold tracking-wide text-raiz-secondary uppercase py-2">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-raiz-border">
                  {bookings.slice(0, 6).map((b, i) => (
                    <tr key={i} className="hover:bg-raiz-offwhite/50 transition-colors">
                      <td className="py-2.5 pr-3 font-medium text-raiz-black">{b.leadName || b.lead?.name || '—'}</td>
                      <td className="py-2.5 pr-3 text-raiz-secondary">{b.unitNumber || b.unit?.unitNumber || '—'}</td>
                      <td className="py-2.5 pr-3 text-right font-medium text-raiz-black">{formatCurrency(b.price || b.amount)}</td>
                      <td className="py-2.5 text-raiz-secondary">{formatDate(b.bookingDate)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Section>

        {/* Recent activity */}
        <Section title="Recent Activity" description="Operational events">
          {activity.length === 0 ? (
            <InlineEmpty text="No recent activity." />
          ) : (
            <div className="space-y-3">
              {activity.slice(0, 6).map((a, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className="mt-1 h-1.5 w-1.5 rounded-full bg-raiz-peach shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm text-raiz-black">
                      <span className="font-medium">{a.userName || a.user?.name || 'System'}</span>
                      <span className="text-raiz-secondary"> · {a.action}</span>
                    </div>
                    <div className="text-xs text-raiz-secondary truncate">
                      {a.entity} {a.entityId ? `#${a.entityId}` : ''} · {formatTime(a.timestamp)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Section>
      </div>
    </div>
  );
}

function StatBlock({ icon: Icon, label, value }) {
  return (
    <div className="bg-white p-4 flex flex-col gap-2">
      <div className="flex items-center gap-2">
        <Icon size={14} className="text-raiz-secondary" />
        <span className="text-10 font-medium tracking-wide text-raiz-secondary uppercase">{label}</span>
      </div>
      <div className="text-2xl font-semibold text-raiz-black">{value}</div>
    </div>
  );
}

function Section({ title, description, children }) {
  return (
    <div className="rounded-lg border border-raiz-border bg-white p-5">
      <div className="mb-4">
        <h3 className="text-sm font-semibold text-raiz-black uppercase tracking-wide">{title}</h3>
        {description && <p className="text-xs text-raiz-secondary mt-0.5">{description}</p>}
      </div>
      {children}
    </div>
  );
}

function InlineEmpty({ text }) {
  return <p className="text-sm text-raiz-secondary py-4 text-center">{text}</p>;
}
// Dashboard.jsx
