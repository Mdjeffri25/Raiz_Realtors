import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import auditApi from '../api/auditApi';
import { AUDIT_ACTIONS, formatDateTime, formatTime, formatDate } from '../utils/constants';
import { Input, Select } from '../components/ui/FormField';
import PageHeader from '../components/ui/PageHeader';
import { LoadingState, ErrorState, EmptyState } from '../components/ui/States';
import { Search, ScrollText, Filter, X } from 'lucide-react';

const ACTION_COLORS = {
  LOGIN: { bg: '#F5F5F4', text: '#44403C', dot: '#A8A29E' },
  CREATED: { bg: '#D1FAE5', text: '#065F46', dot: '#10B981' },
  UPDATED: { bg: '#FEF3C7', text: '#92400E', dot: '#F59E0B' },
  DELETED: { bg: '#FEE2E2', text: '#991B1B', dot: '#EF4444' },
  BOOKED: { bg: '#F6E3DA', text: '#9A4A2A', dot: '#E7A58C' },
  CANCELLED: { bg: '#FEE2E2', text: '#991B1B', dot: '#EF4444' },
  ASSIGNED: { bg: '#DBEAFE', text: '#1E40AF', dot: '#3B82F6' },
};

export default function AuditLogs() {
  const { showError } = useToast();

  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [search, setSearch] = useState('');
  const [actionFilter, setActionFilter] = useState('');
  const [entityFilter, setEntityFilter] = useState('');
  const [userFilter, setUserFilter] = useState('');

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = {};
      if (actionFilter) params.action = actionFilter;
      if (entityFilter) params.entity = entityFilter;
      if (userFilter) params.userId = userFilter;
      const res = await auditApi.getAll(params);
      setLogs(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      setError(err.message || 'Unable to load audit logs.');
      if (err.status !== 0) showError(err.message);
    } finally {
      setLoading(false);
    }
  }, [actionFilter, entityFilter, userFilter, showError]);

  useEffect(() => {
    const timer = setTimeout(fetchLogs, 300);
    return () => clearTimeout(timer);
  }, [fetchLogs]);

  const filteredLogs = logs.filter((log) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return `${log.userName || log.user?.name || ''} ${log.action || ''} ${log.entity || ''} ${log.details || ''}`.toLowerCase().includes(q);
  });

  const uniqueUsers = [...new Set(logs.map((l) => l.userName || l.user?.name).filter(Boolean))];

  return (
    <div>
      <PageHeader title="Audit Trail" description="Every important system action is recorded." />

      {/* Filters */}
      <div className="mb-5 flex flex-col sm:flex-row gap-3 flex-wrap">
        <div className="flex-1 min-w-[200px]">
          <Input
            placeholder="Search activity…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            icon={<Search size={14} />}
          />
        </div>
        <Select value={userFilter} onChange={(e) => setUserFilter(e.target.value)} className="w-auto min-w-[140px]">
          <option value="">All Users</option>
          {uniqueUsers.map((u) => <option key={u} value={u}>{u}</option>)}
        </Select>
        <Select value={actionFilter} onChange={(e) => setActionFilter(e.target.value)} className="w-auto min-w-[140px]">
          <option value="">All Actions</option>
          {AUDIT_ACTIONS.map((a) => <option key={a} value={a}>{a}</option>)}
        </Select>
        <Input
          placeholder="Entity"
          value={entityFilter}
          onChange={(e) => setEntityFilter(e.target.value)}
          className="w-auto min-w-[120px]"
        />
      </div>

      {/* Timeline */}
      <div className="rounded-lg border border-raiz-border bg-white overflow-hidden">
        {loading ? (
          <LoadingState label="Loading audit trail…" />
        ) : error ? (
          <ErrorState message={error} onRetry={fetchLogs} />
        ) : filteredLogs.length === 0 ? (
          <EmptyState
            title="No Activity Recorded"
            description="Audit log entries will appear here as actions are performed in the system."
          />
        ) : (
          <div className="divide-y divide-raiz-border">
            {filteredLogs.map((log) => {
              const colors = ACTION_COLORS[log.action?.toUpperCase()] || { bg: '#F5F5F4', text: '#44403C', dot: '#A8A29E' };
              const time = formatTime(log.timestamp);
              const date = formatDate(log.timestamp);
              return (
                <div key={log.id} className="flex items-start gap-4 px-5 py-4 hover:bg-raiz-offwhite/30 transition-colors">
                  {/* Time column */}
                  <div className="shrink-0 w-20 text-right">
                    <div className="text-xs font-medium text-raiz-black">{time}</div>
                    <div className="text-10 text-raiz-secondary">{date}</div>
                  </div>

                  {/* Vertical line + dot */}
                  <div className="shrink-0 flex flex-col items-center pt-1">
                    <div className="h-2 w-2 rounded-full" style={{ backgroundColor: colors.dot }} />
                    <div className="w-px flex-1 bg-raiz-border mt-1" />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0 pb-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-semibold text-raiz-black uppercase tracking-wide">
                        {log.userName || log.user?.name || 'System'}
                      </span>
                      <span
                        className="inline-flex items-center rounded text-10 font-medium px-1.5 py-0.5 uppercase tracking-wide"
                        style={{ backgroundColor: colors.bg, color: colors.text }}
                      >
                        {log.action}
                      </span>
                    </div>
                    <div className="mt-1 text-sm text-raiz-secondary">
                      {log.entity && <span className="font-medium text-raiz-black">{log.entity}</span>}
                      {log.entityId && <span> #{log.entityId}</span>}
                    </div>
                    {log.details && (
                      <div className="mt-1 text-xs text-raiz-secondary leading-relaxed">
                        {log.details}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
// AuditLogs.jsx
