import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import leadApi from '../api/leadApi';
import { ROLES, LEAD_STAGES } from '../utils/constants';
import { formatDate, formatDateTime } from '../utils/constants';
import { Input, Select, Textarea } from '../components/ui/FormField';
import Button from '../components/ui/Button';
import StatusBadge from '../components/ui/StatusBadge';
import Drawer from '../components/ui/Drawer';
import Modal from '../components/ui/Modal';
import ConfirmDialog from '../components/ui/ConfirmDialog';
import PageHeader from '../components/ui/PageHeader';
import { LoadingState, ErrorState, EmptyState } from '../components/ui/States';
import { Plus, Search, Phone, Mail, Calendar, User as UserIcon, Trash2, Edit3, X } from 'lucide-react';

export default function Leads() {
  const { user, hasRole } = useAuth();
  const { showSuccess, showError } = useToast();

  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [search, setSearch] = useState('');
  const [stageFilter, setStageFilter] = useState('');
  const [assignedFilter, setAssignedFilter] = useState('');
  const [followUpFilter, setFollowUpFilter] = useState('');

  const [selectedLead, setSelectedLead] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editForm, setEditForm] = useState({});
  const [saving, setSaving] = useState(false);

  const [createOpen, setCreateOpen] = useState(false);
  const [createForm, setCreateForm] = useState(emptyLead());
  const [creating, setCreating] = useState(false);

  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const canDelete = hasRole([ROLES.ADMIN, ROLES.BACK_OFFICE]);
  const canCreate = hasRole([ROLES.ADMIN, ROLES.SALES, ROLES.BACK_OFFICE]);
  const canEdit = hasRole([ROLES.ADMIN, ROLES.SALES, ROLES.BACK_OFFICE]);

  function emptyLead() {
    return { name: '', phone: '', email: '', stage: 'NEW', notes: '', followUpDate: '', assignedUserId: '' };
  }

  function buildPayload(form) {
    const payload = {
      name: form.name,
      phone: form.phone,
      email: form.email || null,
      stage: form.stage,
      notes: form.notes || null,
      followUpDate: form.followUpDate || null,
    };
    const rawId = form.assignedUserId;
    if (rawId === '' || rawId === null || rawId === undefined) {
      payload.assignedUserId = null;
    } else {
      const numId = Number(rawId);
      payload.assignedUserId = isNaN(numId) ? null : numId;
    }
    return payload;
  }

  const fetchLeads = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = {};
      if (search) params.search = search;
      if (stageFilter) params.stage = stageFilter;
      if (assignedFilter) params.assignedUser = assignedFilter;
      if (followUpFilter) params.followUpDate = followUpFilter;
      const res = await leadApi.getAll(params);
      setLeads(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      setError(err.message || 'Unable to load leads.');
      if (err.status !== 0) showError(err.message);
    } finally {
      setLoading(false);
    }
  }, [search, stageFilter, assignedFilter, followUpFilter, showError]);

  useEffect(() => {
    const timer = setTimeout(fetchLeads, 300);
    return () => clearTimeout(timer);
  }, [fetchLeads]);

  const openLead = (lead) => {
    setSelectedLead(lead);
    setEditMode(false);
    setEditForm({
      ...lead,
      assignedUserId: lead.assignedUserId ?? lead.assignedUser?.id ?? '',
    });
    setDrawerOpen(true);
  };

  const handleSave = async () => {
    if (!editForm.name || !editForm.phone) {
      showError('Name and phone are required.');
      return;
    }
    setSaving(true);
    try {
      const res = await leadApi.update(selectedLead.id, buildPayload(editForm));
      const updated = res.data || { ...selectedLead, ...editForm };
      setLeads((prev) => prev.map((l) => (l.id === updated.id ? updated : l)));
      setSelectedLead(updated);
      setEditMode(false);
      showSuccess('Lead updated successfully.');
    } catch (err) {
      showError(err.message || 'Failed to update lead.');
    } finally {
      setSaving(false);
    }
  };

  const handleCreate = async () => {
    if (!createForm.name || !createForm.phone) {
      showError('Name and phone are required.');
      return;
    }
    setCreating(true);
    try {
      const res = await leadApi.create(buildPayload(createForm));
      const created = res.data;
      setLeads((prev) => [created, ...prev]);
      setCreateOpen(false);
      setCreateForm(emptyLead());
      showSuccess('Lead created successfully.');
    } catch (err) {
      showError(err.message || 'Failed to create lead.');
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await leadApi.delete(deleteTarget.id);
      setLeads((prev) => prev.filter((l) => l.id !== deleteTarget.id));
      setDeleteTarget(null);
      setDrawerOpen(false);
      showSuccess('Lead deleted.');
    } catch (err) {
      showError(err.message || 'Failed to delete lead.');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div>
      <PageHeader title="Leads" description="Manage your sales pipeline.">
        {canCreate && (
          <Button onClick={() => setCreateOpen(true)}>
            <Plus size={15} />
            New Lead
          </Button>
        )}
      </PageHeader>

      {/* Filters */}
      <div className="mb-5 flex flex-col sm:flex-row gap-3">
        <div className="flex-1">
          <Input
            placeholder="Search leads…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            icon={<Search size={14} />}
          />
        </div>
        <div className="flex gap-3 flex-wrap">
          <Select value={stageFilter} onChange={(e) => setStageFilter(e.target.value)} className="w-auto min-w-[140px]">
            <option value="">All Stages</option>
            {LEAD_STAGES.map((s) => (
              <option key={s.value} value={s.value}>{s.label}</option>
            ))}
          </Select>
          <Select value={followUpFilter} onChange={(e) => setFollowUpFilter(e.target.value)} className="w-auto min-w-[140px]">
            <option value="">All Follow-ups</option>
            <option value="today">Today</option>
            <option value="overdue">Overdue</option>
            <option value="upcoming">Upcoming</option>
          </Select>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-lg border border-raiz-border bg-white overflow-hidden">
        {loading ? (
          <LoadingState label="Loading leads…" />
        ) : error ? (
          <ErrorState message={error} onRetry={fetchLeads} />
        ) : leads.length === 0 ? (
          <EmptyState
            title="No Leads Yet"
            description="Start building your sales pipeline by adding your first lead."
            action={canCreate ? <Button onClick={() => setCreateOpen(true)}><Plus size={15} /> Add Lead</Button> : null}
          />
        ) : (
          <div className="overflow-x-auto scrollbar-thin">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-raiz-border bg-raiz-offwhite/50">
                  <Th>Lead</Th>
                  <Th>Phone</Th>
                  <Th>Stage</Th>
                  <Th>Assigned To</Th>
                  <Th>Follow-up</Th>
                  <Th>Updated</Th>
                  <Th className="text-right">Actions</Th>
                </tr>
              </thead>
              <tbody className="divide-y divide-raiz-border">
                {leads.map((lead) => (
                  <tr
                    key={lead.id}
                    className="hover:bg-raiz-offwhite/40 transition-colors cursor-pointer"
                    onClick={() => openLead(lead)}
                  >
                    <td className="px-4 py-3">
                      <div className="font-medium text-raiz-black">{lead.name}</div>
                      {lead.email && <div className="text-xs text-raiz-secondary">{lead.email}</div>}
                    </td>
                    <td className="px-4 py-3 text-raiz-secondary whitespace-nowrap">{lead.phone || '—'}</td>
                    <td className="px-4 py-3"><StatusBadge status={lead.stage} size="xs" /></td>
                    <td className="px-4 py-3 text-raiz-secondary whitespace-nowrap">{lead.assignedUserName || lead.assignedUser?.name || '—'}</td>
                    <td className="px-4 py-3 text-raiz-secondary whitespace-nowrap">{formatDate(lead.followUpDate)}</td>
                    <td className="px-4 py-3 text-raiz-secondary whitespace-nowrap">{formatDate(lead.updatedAt || lead.updatedDate)}</td>
                    <td className="px-4 py-3 text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-1">
                        {canEdit && (
                          <button
                            onClick={() => openLead(lead)}
                            className="p-1.5 rounded text-raiz-secondary hover:text-raiz-black hover:bg-raiz-offwhite transition-colors"
                            title="View / Edit"
                          >
                            <Edit3 size={14} />
                          </button>
                        )}
                        {canDelete && (
                          <button
                            onClick={() => setDeleteTarget(lead)}
                            className="p-1.5 rounded text-raiz-secondary hover:text-red-600 hover:bg-red-50 transition-colors"
                            title="Delete"
                          >
                            <Trash2 size={14} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Detail / Edit Drawer */}
      <Drawer
        open={drawerOpen}
        onClose={() => { setDrawerOpen(false); setEditMode(false); }}
        title={editMode ? 'Edit Lead' : 'Lead Details'}
        width="max-w-lg"
        footer={
          editMode ? (
            <>
              <Button variant="secondary" size="sm" onClick={() => { setEditMode(false); setEditForm({ ...selectedLead }); }}>
                Cancel
              </Button>
              <Button size="sm" onClick={handleSave} loading={saving}>
                Save Changes
              </Button>
            </>
          ) : (
            <>
              {canDelete && (
                <Button variant="danger" size="sm" onClick={() => setDeleteTarget(selectedLead)}>
                  <Trash2 size={13} /> Delete
                </Button>
              )}
              {canEdit && (
                <Button size="sm" onClick={() => setEditMode(true)}>
                  <Edit3 size={13} /> Edit
                </Button>
              )}
            </>
          )
        }
      >
        {selectedLead && (
          editMode ? (
            <div className="space-y-4">
              <Input label="Name" value={editForm.name || ''} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} />
              <Input label="Phone" value={editForm.phone || ''} onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })} />
              <Input label="Email" type="email" value={editForm.email || ''} onChange={(e) => setEditForm({ ...editForm, email: e.target.value })} />
              <Select label="Stage" value={editForm.stage || 'NEW'} onChange={(e) => setEditForm({ ...editForm, stage: e.target.value })}>
                {LEAD_STAGES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
              </Select>
              <Input label="Assigned User ID" type="number" value={editForm.assignedUserId ?? ''} onChange={(e) => setEditForm({ ...editForm, assignedUserId: e.target.value })} placeholder="e.g. 1" />
              <Input label="Follow-up Date" type="date" value={editForm.followUpDate ? editForm.followUpDate.split('T')[0] : ''} onChange={(e) => setEditForm({ ...editForm, followUpDate: e.target.value })} />
              <Textarea label="Notes" value={editForm.notes || ''} onChange={(e) => setEditForm({ ...editForm, notes: e.target.value })} />
            </div>
          ) : (
            <div className="space-y-5">
              <div>
                <h3 className="font-serif text-xl font-semibold text-raiz-black">{selectedLead.name}</h3>
                <div className="mt-2"><StatusBadge status={selectedLead.stage} size="sm" /></div>
              </div>

              <div className="space-y-3 pt-4 border-t border-raiz-border">
                <DetailRow icon={Phone} label="Phone" value={selectedLead.phone} />
                <DetailRow icon={Mail} label="Email" value={selectedLead.email} />
                <DetailRow icon={UserIcon} label="Assigned To" value={selectedLead.assignedUserName || selectedLead.assignedUser?.name} />
                <DetailRow icon={Calendar} label="Follow-up" value={formatDate(selectedLead.followUpDate)} />
              </div>

              {selectedLead.notes && (
                <div className="pt-4 border-t border-raiz-border">
                  <div className="text-10 font-semibold tracking-wide text-raiz-secondary uppercase mb-2">Notes</div>
                  <p className="text-sm text-raiz-black leading-relaxed whitespace-pre-wrap">{selectedLead.notes}</p>
                </div>
              )}

              <div className="pt-4 border-t border-raiz-border grid grid-cols-2 gap-4">
                <div>
                  <div className="text-10 font-semibold tracking-wide text-raiz-secondary uppercase mb-1">Created</div>
                  <div className="text-sm text-raiz-black">{formatDateTime(selectedLead.createdAt || selectedLead.createdDate)}</div>
                </div>
                <div>
                  <div className="text-10 font-semibold tracking-wide text-raiz-secondary uppercase mb-1">Updated</div>
                  <div className="text-sm text-raiz-black">{formatDateTime(selectedLead.updatedAt || selectedLead.updatedDate)}</div>
                </div>
              </div>
            </div>
          )
        )}
      </Drawer>

      {/* Create Modal */}
      <Modal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        title="Create New Lead"
        width="max-w-lg"
        footer={
          <>
            <Button variant="secondary" size="sm" onClick={() => setCreateOpen(false)}>Cancel</Button>
            <Button size="sm" onClick={handleCreate} loading={creating}>Create Lead</Button>
          </>
        }
      >
        <div className="space-y-4">
          <Input label="Name" placeholder="Full name" value={createForm.name} onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })} />
          <Input label="Phone" placeholder="Phone number" value={createForm.phone} onChange={(e) => setCreateForm({ ...createForm, phone: e.target.value })} />
          <Input label="Email" type="email" placeholder="Email address" value={createForm.email} onChange={(e) => setCreateForm({ ...createForm, email: e.target.value })} />
          <Select label="Stage" value={createForm.stage} onChange={(e) => setCreateForm({ ...createForm, stage: e.target.value })}>
            {LEAD_STAGES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
          </Select>
          <Input label="Assigned User ID" type="number" placeholder="e.g. 1" value={createForm.assignedUserId} onChange={(e) => setCreateForm({ ...createForm, assignedUserId: e.target.value })} />
          <Input label="Follow-up Date" type="date" value={createForm.followUpDate} onChange={(e) => setCreateForm({ ...createForm, followUpDate: e.target.value })} />
          <Textarea label="Notes" placeholder="Initial notes about this lead…" value={createForm.notes} onChange={(e) => setCreateForm({ ...createForm, notes: e.target.value })} />
        </div>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Delete Lead"
        message={`Are you sure you want to delete "${deleteTarget?.name}"? This action cannot be undone.`}
        confirmLabel="Delete"
        loading={deleting}
      />
    </div>
  );
}

function Th({ children, className = '' }) {
  return (
    <th className={`px-4 py-3 text-left text-10 font-semibold tracking-wide text-raiz-secondary uppercase ${className}`}>
      {children}
    </th>
  );
}

function DetailRow({ icon: Icon, label, value }) {
  return (
    <div className="flex items-start gap-3">
      <Icon size={15} className="text-raiz-secondary mt-0.5 shrink-0" />
      <div className="flex-1 min-w-0">
        <div className="text-10 font-semibold tracking-wide text-raiz-secondary uppercase">{label}</div>
        <div className="text-sm text-raiz-black mt-0.5">{value || '—'}</div>
      </div>
    </div>
  );
}
// Leads.jsx
