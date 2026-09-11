import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import dashboardApi from '../api/dashboardApi';
import { LoadingState, ErrorState } from '../components/ui/States';
import StatusBadge from '../components/ui/StatusBadge';
import {
  formatCurrency,
  getGreeting,
  LEAD_STAGES,
} from '../utils/constants';
import {
  Users,
  Phone,
  Building2,
  ClipboardList,
  TrendingUp,
} from 'lucide-react';
import {
  formatIndianTime,
  formatIndianDate,
} from '../utils/dateUtils';

const DASHBOARD_CACHE_KEY = 'raiz_dashboard_cache';
const DASHBOARD_CACHE_TIME = 5 * 60 * 1000; // 5 minutes

const PIPELINE_COLORS = {
  NEW: '#243447',
  CONTACTED: '#59614A',
  SITE_VISIT: '#E7A58C',
  INTERESTED: '#59614A',
  NEGOTIATION: '#243447',
  BOOKED: '#59614A',
  LOST: '#8A5A5A',
};

export default function Dashboard() {
  const { user } = useAuth();
  const { showError } = useToast();

  // Load cached dashboard data immediately
  const [data, setData] = useState(() => {
    try {
      const cached = sessionStorage.getItem(DASHBOARD_CACHE_KEY);

      if (!cached) {
        return null;
      }

      const parsed = JSON.parse(cached);

      // Use cache only if it is less than 5 minutes old
      if (
        parsed &&
        parsed.timestamp &&
        Date.now() - parsed.timestamp < DASHBOARD_CACHE_TIME
      ) {
        return parsed.data;
      }

      // Remove expired cache
      sessionStorage.removeItem(DASHBOARD_CACHE_KEY);
      return null;
    } catch {
      sessionStorage.removeItem(DASHBOARD_CACHE_KEY);
      return null;
    }
  });

  // If cached data exists, don't show loading screen
  const [loading, setLoading] = useState(() => {
    try {
      const cached = sessionStorage.getItem(DASHBOARD_CACHE_KEY);

      if (!cached) {
        return true;
      }

      const parsed = JSON.parse(cached);

      return !(
        parsed &&
        parsed.timestamp &&
        Date.now() - parsed.timestamp < DASHBOARD_CACHE_TIME
      );
    } catch {
      return true;
    }
  });

  const [error, setError] = useState(null);

  const fetchDashboard = async () => {
    // Only show full loading screen when there is no cached data
    if (!data) {
      setLoading(true);
    }

    setError(null);

    try {
      const res = await dashboardApi.getData();

      // Update dashboard with fresh data
      setData(res.data);

      // Save fresh data to cache
      sessionStorage.setItem(
        DASHBOARD_CACHE_KEY,
        JSON.stringify({
          data: res.data,
          timestamp: Date.now(),
        })
      );
    } catch (err) {
      // If cached data exists, keep displaying it
      if (!data) {
        setError(
          err.message || 'Unable to load dashboard data.'
        );
      }

      if (err.status !== 0) {
        showError(err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  const today = new Intl.DateTimeFormat('en-IN', {
    timeZone: 'Asia/Kolkata',
    weekday: 'long',
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  }).format(new Date());

  if (loading) {
    return <LoadingState label="Loading dashboard…" />;
  }

  if (error) {
    return (
      <ErrorState
        message={error}
        onRetry={fetchDashboard}
      />
    );
  }

  const stats = data || {};
  const pipeline = data?.pipeline || [];
  const followUps = data?.followUpsToday || [];
  const projects = data?.unitAvailability || [];
  const bookings = data?.recentBookings || [];
  const activity = data?.recentActivity || [];

  return (
    <div className="space-y-5">

      {/* Greeting */}
      <div>
        <div className="mb-1 text-[10px] font-medium uppercase tracking-[0.18em] text-raiz-secondary">
          {today}
        </div>

        <h1 className="font-serif text-2xl font-semibold tracking-tight text-raiz-black sm:text-3xl">
          {getGreeting()}, {user?.name}
        </h1>

        <p className="mt-1 text-sm text-raiz-secondary">
          Sales overview & today's activity across Raiz Realtors.
        </p>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-2 overflow-hidden rounded-lg border border-raiz-border bg-raiz-border sm:grid-cols-3 lg:grid-cols-5">
        <StatBlock
          icon={Users}
          label="Total Leads"
          value={stats.totalLeads ?? 0}
          accent="navy"
        />

        <StatBlock
          icon={TrendingUp}
          label="Qualified"
          value={stats.qualified ?? 0}
          accent="olive"
        />

        <StatBlock
          icon={Phone}
          label="Follow-ups Today"
          value={stats.todayFollowUps ?? 0}
          accent="peach"
        />

        <StatBlock
          icon={Building2}
          label="Available Units"
          value={stats.availableUnits ?? 0}
          accent="olive"
        />

        <StatBlock
          icon={ClipboardList}
          label="Bookings"
          value={stats.bookings ?? 0}
          accent="navy"
        />
      </div>

      {/* Pipeline */}
      <Section
        title="Sales Pipeline"
        description="Lead distribution across stages"
      >
        <div className="flex flex-wrap gap-2.5">
          {LEAD_STAGES.map((stage) => {
            const count =
              pipeline.find(
                (p) => p.stage === stage.value
              )?.count ?? 0;

            const maxCount = Math.max(
              ...LEAD_STAGES.map(
                (s) =>
                  pipeline.find(
                    (p) => p.stage === s.value
                  )?.count ?? 0
              ),
              1
            );

            const width = (count / maxCount) * 100;
            const stageColor =
              PIPELINE_COLORS[stage.value] || '#243447';

            return (
              <div
                key={stage.value}
                className="min-w-[115px] flex-1 rounded-lg border border-raiz-border bg-white p-3.5 transition-colors hover:border-raiz-secondary/40"
              >
                <div className="mb-1.5 flex items-center gap-2">
                  <span
                    className="h-2 w-2 shrink-0 rounded-full"
                    style={{
                      backgroundColor: stageColor,
                    }}
                  />

                  <span className="truncate text-[10px] font-semibold uppercase tracking-[0.08em] text-raiz-secondary">
                    {stage.label}
                  </span>
                </div>

                <div className="text-2xl font-semibold leading-none text-raiz-black">
                  {count}
                </div>

                <div className="mt-2.5 h-1 overflow-hidden rounded-full bg-raiz-offwhite">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${width}%`,
                      backgroundColor: stageColor,
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </Section>

      {/* Follow-ups + Unit Availability */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">

        {/* Follow-ups today */}
        <Section
          title="Follow-ups Today"
          description="Scheduled callbacks for today"
        >
          {followUps.length === 0 ? (
            <InlineEmpty text="No follow-ups scheduled for today." />
          ) : (
            <div className="divide-y divide-raiz-border">
              {followUps.slice(0, 6).map((fu, i) => (
                <div
                  key={i}
                  className="flex items-center gap-3 py-2.5 first:pt-0 last:pb-0"
                >
                  <div className="w-[68px] shrink-0 text-xs font-medium text-raiz-navy">
                    {formatIndianTime(fu.followUpDate)}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-medium text-raiz-black">
                      {fu.leadName || fu.name}
                    </div>

                    <div className="truncate text-xs text-raiz-secondary">
                      {fu.assignedUserName || 'Unassigned'}
                    </div>
                  </div>

                  <StatusBadge
                    status={fu.stage}
                    size="xs"
                  />
                </div>
              ))}
            </div>
          )}
        </Section>

        {/* Unit availability */}
        <Section
          title="Unit Availability"
          description="Project inventory overview"
        >
          {projects.length === 0 ? (
            <InlineEmpty text="No project data available." />
          ) : (
            <div className="divide-y divide-raiz-border">
              {projects.slice(0, 6).map((proj, i) => {
                const total = proj.totalUnits ?? 0;
                const available = proj.availableUnits ?? 0;

                const pct =
                  total > 0
                    ? (available / total) * 100
                    : 0;

                return (
                  <div
                    key={i}
                    className="py-2.5 first:pt-0 last:pb-0"
                  >
                    <div className="mb-1.5 flex items-center justify-between gap-3">
                      <div className="truncate text-sm font-medium text-raiz-black">
                        {proj.name}
                      </div>

                      <div className="shrink-0 text-xs text-raiz-secondary">
                        {available} / {total} available
                      </div>
                    </div>

                    <div className="h-1.5 overflow-hidden rounded-full bg-raiz-offwhite">
                      <div
                        className="h-full rounded-full bg-raiz-olive transition-all duration-500"
                        style={{
                          width: `${pct}%`,
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </Section>
      </div>

      {/* Recent Bookings + Activity */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">

        {/* Recent bookings */}
        <Section
          title="Recent Bookings"
          description="Latest closed transactions"
        >
          {bookings.length === 0 ? (
            <InlineEmpty text="No bookings yet." />
          ) : (
            <div className="overflow-x-auto scrollbar-thin">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-raiz-border">
                    <th className="py-2 pr-3 text-left text-[10px] font-semibold uppercase tracking-[0.08em] text-raiz-secondary">
                      Lead
                    </th>

                    <th className="py-2 pr-3 text-left text-[10px] font-semibold uppercase tracking-[0.08em] text-raiz-secondary">
                      Unit
                    </th>

                    <th className="py-2 pr-3 text-right text-[10px] font-semibold uppercase tracking-[0.08em] text-raiz-secondary">
                      Amount
                    </th>

                    <th className="py-2 text-left text-[10px] font-semibold uppercase tracking-[0.08em] text-raiz-secondary">
                      Date
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-raiz-border">
                  {bookings.slice(0, 6).map((b, i) => (
                    <tr
                      key={i}
                      className="transition-colors hover:bg-raiz-offwhite/50"
                    >
                      <td className="py-2.5 pr-3 font-medium text-raiz-black">
                        {b.leadName ||
                          b.lead?.name ||
                          '—'}
                      </td>

                      <td className="py-2.5 pr-3 text-raiz-secondary">
                        {b.unitNumber ||
                          b.unit?.unitNumber ||
                          '—'}
                      </td>

                      <td className="py-2.5 pr-3 text-right font-medium text-raiz-black">
                        {formatCurrency(
                          b.price || b.amount
                        )}
                      </td>

                      <td className="whitespace-nowrap py-2.5 text-raiz-secondary">
                        {formatIndianDate(b.bookingDate)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Section>

        {/* Recent activity */}
        <Section
          title="Recent Activity"
          description="Operational events"
        >
          {activity.length === 0 ? (
            <InlineEmpty text="No recent activity." />
          ) : (
            <div className="space-y-2.5">
              {activity.slice(0, 6).map((a, i) => (
                <div
                  key={i}
                  className="flex items-start gap-3"
                >
                  <div className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-raiz-peach" />

                  <div className="min-w-0 flex-1">
                    <div className="text-sm text-raiz-black">
                      <span className="font-medium">
                        {a.userName ||
                          a.user?.name ||
                          'System'}
                      </span>

                      <span className="text-raiz-secondary">
                        {' · '}
                        {a.action}
                      </span>
                    </div>

                    <div className="truncate text-xs text-raiz-secondary">
                      {a.entity}{' '}
                      {a.entityId
                        ? `#${a.entityId}`
                        : ''}{' '}
                      · {formatIndianTime(a.timestamp)}
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

/* =========================================================
   STAT BLOCK
========================================================= */

function StatBlock({
  icon: Icon,
  label,
  value,
  accent = 'navy',
}) {
  const accentClasses = {
    navy: 'text-raiz-navy',
    olive: 'text-raiz-olive',
    peach: 'text-raiz-peach',
    black: 'text-raiz-black',
  };

  return (
    <div className="flex min-h-[96px] flex-col justify-between gap-2 bg-white p-3.5 sm:p-4">
      <div className="flex items-center gap-2">
        <Icon
          size={14}
          strokeWidth={1.8}
          className={accentClasses[accent]}
        />

        <span className="text-[10px] font-semibold uppercase tracking-[0.08em] text-raiz-secondary">
          {label}
        </span>
      </div>

      <div className="text-2xl font-semibold leading-none text-raiz-black">
        {value}
      </div>
    </div>
  );
}

/* =========================================================
   SECTION
========================================================= */

function Section({
  title,
  description,
  children,
}) {
  return (
    <section className="rounded-lg border border-raiz-border bg-white p-4 sm:p-4.5">
      <div className="mb-3">
        <h3 className="text-xs font-semibold uppercase tracking-[0.08em] text-raiz-black">
          {title}
        </h3>

        {description && (
          <p className="mt-0.5 text-xs text-raiz-secondary">
            {description}
          </p>
        )}
      </div>

      {children}
    </section>
  );
}

/* =========================================================
   EMPTY STATE
========================================================= */

function InlineEmpty({ text }) {
  return (
    <p className="py-4 text-center text-sm text-raiz-secondary">
      {text}
    </p>
  );
}