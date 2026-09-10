import { useState, useEffect, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import bookingApi from '../api/bookingApi';
import leadApi from '../api/leadApi';
import propertyApi from '../api/propertyApi';
import { ROLES, formatCurrency, formatDate } from '../utils/constants';
import { Input } from '../components/ui/FormField';
import Button from '../components/ui/Button';
import StatusBadge from '../components/ui/StatusBadge';
import Modal from '../components/ui/Modal';
import PageHeader from '../components/ui/PageHeader';
import { LoadingState, ErrorState, EmptyState } from '../components/ui/States';
import { Plus, Search, Check, ChevronRight, ChevronLeft, X, ClipboardList, Building2, User as UserIcon, IndianRupee } from 'lucide-react';

export default function Bookings() {
  const { user, hasRole } = useAuth();
  const { showSuccess, showError } = useToast();
  const location = useLocation();
  const canCreate = hasRole([ROLES.ADMIN, ROLES.SALES, ROLES.BACK_OFFICE]);
  const isAuditor = user?.role === ROLES.AUDITOR;

  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');

  const [wizardOpen, setWizardOpen] = useState(false);
  const [step, setStep] = useState(1);
  const [leads, setLeads] = useState([]);
  const [units, setUnits] = useState([]);
  const [wizardLoading, setWizardLoading] = useState(false);
  const [selectedLead, setSelectedLead] = useState(null);
  const [selectedUnit, setSelectedUnit] = useState(null);
  const [leadSearch, setLeadSearch] = useState('');
  const [unitSearch, setUnitSearch] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [confirmedBooking, setConfirmedBooking] = useState(null);

  const fetchBookings = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await bookingApi.getAll();
      setBookings(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      setError(err.message || 'Unable to load bookings.');
      if (err.status !== 0) showError(err.message);
    } finally {
      setLoading(false);
    }
  }, [showError]);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  // Preselect unit from Properties page
  useEffect(() => {
    if (location.state?.preselectUnit && canCreate) {
      setSelectedUnit(location.state.preselectUnit);
      setStep(1);
      setWizardOpen(true);
      // Fetch leads and units for the wizard
      openWizard();
    }
  }, [location.state]);

  const openWizard = async () => {
    setWizardOpen(true);
    setStep(1);
    setSelectedLead(null);
    setWizardLoading(true);
    try {
      const [leadRes, unitRes] = await Promise.all([
        leadApi.getAll(),
        propertyApi.getUnits(),
      ]);
      setLeads(Array.isArray(leadRes.data) ? leadRes.data : []);
      setUnits(
        (Array.isArray(unitRes.data) ? unitRes.data : []).filter(
          (u) => (u.status || '').toUpperCase() === 'AVAILABLE'
        )
      );
    } catch (err) {
      showError(err.message || 'Unable to load data for booking.');
    } finally {
      setWizardLoading(false);
    }
  };

  const closeWizard = () => {
    setWizardOpen(false);
    setStep(1);
    setSelectedLead(null);
    setSelectedUnit(null);
    setLeadSearch('');
    setUnitSearch('');
    setConfirmedBooking(null);
  };

  const handleConfirm = async () => {
    if (!selectedLead || !selectedUnit) return;
    setSubmitting(true);
    try {
      const payload = {
        leadId: selectedLead.id,
        unitId: selectedUnit.id,
      };
      const res = await bookingApi.create(payload);
      setConfirmedBooking(res.data);
      showSuccess('Booking confirmed successfully.');
      fetchBookings();
    } catch (err) {
      if (err.status === 409) {
        showError('This unit was just booked by another user. Please select another available unit.');
        setStep(2);
        // Remove the booked unit from list
        setUnits((prev) => prev.filter((u) => u.id !== selectedUnit.id));
        setSelectedUnit(null);
      } else {
        showError(err.message || 'Failed to create booking.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const filteredLeads = leads.filter((l) => {
    if (!leadSearch) return true;
    const q = leadSearch.toLowerCase();
    return (l.name || '').toLowerCase().includes(q) || (l.phone || '').toLowerCase().includes(q);
  });

  const filteredUnits = units.filter((u) => {
    if (!unitSearch) return true;
    const q = unitSearch.toLowerCase();
    return `${u.unitNumber || ''} ${u.unitType || ''} ${u.projectName || u.project?.name || ''}`.toLowerCase().includes(q);
  });

  const filteredBookings = bookings.filter((b) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return `${b.leadName || b.lead?.name || ''} ${b.unitNumber || b.unit?.unitNumber || ''} ${b.projectName || b.project?.name || ''}`.toLowerCase().includes(q);
  });

  return (
    <div>
      <PageHeader title="Bookings" description="Transaction records & new booking flow.">
        {canCreate && (
          <Button onClick={openWizard}>
            <Plus size={15} />
            New Booking
          </Button>
        )}
      </PageHeader>

      {/* Search */}
      <div className="mb-5">
        <Input
          placeholder="Search bookings…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          icon={<Search size={14} />}
        />
      </div>

      {/* Bookings table */}
      <div className="rounded-lg border border-raiz-border bg-white overflow-hidden">
        {loading ? (
          <LoadingState label="Loading bookings…" />
        ) : error ? (
          <ErrorState message={error} onRetry={fetchBookings} />
        ) : filteredBookings.length === 0 ? (
          <EmptyState
            title="No Bookings Yet"
            description="Transactions will appear here once a booking is made."
            action={canCreate ? <Button onClick={openWizard}><Plus size={15} /> New Booking</Button> : null}
          />
        ) : (
          <div className="overflow-x-auto scrollbar-thin">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-raiz-border bg-raiz-offwhite/50">
                  <Th>Booking ID</Th>
                  <Th>Lead</Th>
                  <Th>Project</Th>
                  <Th>Unit</Th>
                  <Th className="text-right">Amount</Th>
                  <Th>Booked By</Th>
                  <Th>Date</Th>
                  <Th>Status</Th>
                </tr>
              </thead>
              <tbody className="divide-y divide-raiz-border">
                {filteredBookings.map((b) => (
                  <tr key={b.id} className="hover:bg-raiz-offwhite/40 transition-colors">
                    <td className="px-4 py-3 font-medium text-raiz-black whitespace-nowrap">
                      {b.bookingId ? `#${b.bookingId}` : `#${b.id}`}
                    </td>
                    <td className="px-4 py-3 text-raiz-black">{b.leadName || b.lead?.name || '—'}</td>
                    <td className="px-4 py-3 text-raiz-secondary">{b.projectName || b.project?.name || '—'}</td>
                    <td className="px-4 py-3 text-raiz-secondary">{b.unitNumber || b.unit?.unitNumber || '—'}</td>
                    <td className="px-4 py-3 text-right font-medium text-raiz-black whitespace-nowrap">{formatCurrency(b.price || b.amount)}</td>
                    <td className="px-4 py-3 text-raiz-secondary">{b.bookedByName || b.bookedBy?.name || '—'}</td>
                    <td className="px-4 py-3 text-raiz-secondary whitespace-nowrap">{formatDate(b.bookingDate)}</td>
                    <td className="px-4 py-3">
                      <StatusBadge status={b.status || 'BOOKED'} type="unit" size="xs" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Booking Wizard Modal */}
      <Modal
        open={wizardOpen}
        onClose={closeWizard}
        title={confirmedBooking ? 'Booking Confirmed' : 'New Booking'}
        width="max-w-2xl"
        footer={
          confirmedBooking ? (
            <Button size="sm" onClick={closeWizard}>Done</Button>
          ) : wizardLoading ? null : (
            <>
              {step > 1 && (
                <Button variant="secondary" size="sm" onClick={() => setStep(step - 1)}>
                  <ChevronLeft size={14} /> Back
                </Button>
              )}
              {step === 1 && selectedLead && (
                <Button size="sm" onClick={() => setStep(2)}>
                  Next: Select Unit <ChevronRight size={14} />
                </Button>
              )}
              {step === 2 && selectedUnit && (
                <Button size="sm" onClick={() => setStep(3)}>
                  Next: Confirm <ChevronRight size={14} />
                </Button>
              )}
              {step === 3 && (
                <Button size="sm" onClick={handleConfirm} loading={submitting}>
                  Confirm Booking
                </Button>
              )}
            </>
          )
        }
      >
        {confirmedBooking ? (
          <ConfirmationView booking={confirmedBooking} />
        ) : wizardLoading ? (
          <LoadingState label="Loading data…" />
        ) : (
          <>
            {/* Stepper */}
            <div className="flex items-center gap-2 mb-6">
              <StepIndicator num={1} label="Select Lead" active={step >= 1} done={step > 1} />
              <div className={`h-px flex-1 ${step > 1 ? 'bg-raiz-peach' : 'bg-raiz-border'}`} />
              <StepIndicator num={2} label="Select Unit" active={step >= 2} done={step > 2} />
              <div className={`h-px flex-1 ${step > 2 ? 'bg-raiz-peach' : 'bg-raiz-border'}`} />
              <StepIndicator num={3} label="Confirm" active={step >= 3} done={false} />
            </div>

            {/* Step 1 — Select Lead */}
            {step === 1 && (
              <div>
                <Input
                  placeholder="Search leads by name or phone…"
                  value={leadSearch}
                  onChange={(e) => setLeadSearch(e.target.value)}
                  icon={<Search size={14} />}
                />
                <div className="mt-3 max-h-72 overflow-y-auto scrollbar-thin divide-y divide-raiz-border rounded-lg border border-raiz-border">
                  {filteredLeads.length === 0 ? (
                    <p className="text-sm text-raiz-secondary text-center py-6">No leads found.</p>
                  ) : (
                    filteredLeads.map((lead) => (
                      <button
                        key={lead.id}
                        onClick={() => setSelectedLead(lead)}
                        className={`w-full flex items-center justify-between px-4 py-3 text-left transition-colors ${
                          selectedLead?.id === lead.id
                            ? 'bg-raiz-peach-light/40'
                            : 'hover:bg-raiz-offwhite'
                        }`}
                      >
                        <div>
                          <div className="text-sm font-medium text-raiz-black">{lead.name}</div>
                          <div className="text-xs text-raiz-secondary">{lead.phone} · {lead.email}</div>
                        </div>
                        {selectedLead?.id === lead.id && <Check size={16} className="text-raiz-peach" />}
                      </button>
                    ))
                  )}
                </div>
              </div>
            )}

            {/* Step 2 — Select Unit */}
            {step === 2 && (
              <div>
                <Input
                  placeholder="Search available units…"
                  value={unitSearch}
                  onChange={(e) => setUnitSearch(e.target.value)}
                  icon={<Search size={14} />}
                />
                <div className="mt-3 max-h-72 overflow-y-auto scrollbar-thin divide-y divide-raiz-border rounded-lg border border-raiz-border">
                  {filteredUnits.length === 0 ? (
                    <p className="text-sm text-raiz-secondary text-center py-6">No available units found.</p>
                  ) : (
                    filteredUnits.map((unit) => (
                      <button
                        key={unit.id}
                        onClick={() => setSelectedUnit(unit)}
                        className={`w-full flex items-center justify-between px-4 py-3 text-left transition-colors ${
                          selectedUnit?.id === unit.id
                            ? 'bg-raiz-peach-light/40'
                            : 'hover:bg-raiz-offwhite'
                        }`}
                      >
                        <div>
                          <div className="text-sm font-medium text-raiz-black">{unit.unitNumber} · {unit.unitType}</div>
                          <div className="text-xs text-raiz-secondary">
                            {unit.buildingName || unit.building?.name || '—'} · {unit.projectName || unit.project?.name || '—'}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-medium text-raiz-black">{formatCurrency(unit.price)}</div>
                          {selectedUnit?.id === unit.id && <Check size={14} className="text-raiz-peach ml-auto mt-1" />}
                        </div>
                      </button>
                    ))
                  )}
                </div>
              </div>
            )}

            {/* Step 3 — Confirm */}
            {step === 3 && (
              <div className="space-y-4">
                <p className="text-sm text-raiz-secondary">Please review the booking details before confirming.</p>
                <div className="rounded-lg border border-raiz-border divide-y divide-raiz-border">
                  <SummaryRow icon={UserIcon} label="Lead" value={selectedLead?.name} />
                  <SummaryRow icon={Building2} label="Project" value={selectedUnit?.projectName || selectedUnit?.project?.name} />
                  <SummaryRow icon={Building2} label="Building" value={selectedUnit?.buildingName || selectedUnit?.building?.name} />
                  <SummaryRow icon={ClipboardList} label="Unit" value={`${selectedUnit?.unitNumber} · ${selectedUnit?.unitType || ''}`} />
                  <SummaryRow icon={IndianRupee} label="Price" value={formatCurrency(selectedUnit?.price)} />
                  <SummaryRow icon={UserIcon} label="Booked By" value={user?.name} />
                  <SummaryRow icon={ClipboardList} label="Booking Date" value={formatDate(new Date())} />
                </div>
              </div>
            )}
          </>
        )}
      </Modal>
    </div>
  );
}

function StepIndicator({ num, label, active, done }) {
  return (
    <div className="flex items-center gap-2 shrink-0">
      <div
        className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold transition-colors ${
          done
            ? 'bg-raiz-peach text-white'
            : active
            ? 'bg-raiz-black text-white'
            : 'bg-raiz-offwhite text-raiz-secondary border border-raiz-border'
        }`}
      >
        {done ? <Check size={13} /> : num}
      </div>
      <span className={`text-xs font-medium ${active ? 'text-raiz-black' : 'text-raiz-secondary'} hidden sm:inline`}>
        {label}
      </span>
    </div>
  );
}

function SummaryRow({ icon: Icon, label, value }) {
  return (
    <div className="flex items-center gap-3 px-4 py-3">
      <Icon size={15} className="text-raiz-secondary shrink-0" />
      <span className="text-xs font-medium tracking-wide text-raiz-secondary uppercase w-24 shrink-0">{label}</span>
      <span className="text-sm text-raiz-black font-medium">{value || '—'}</span>
    </div>
  );
}

function ConfirmationView({ booking }) {
  return (
    <div className="text-center py-4">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-green-50 border border-green-100 mb-4">
        <Check size={24} className="text-green-600" />
      </div>
      <h3 className="font-serif text-xl font-semibold text-raiz-black">Booking Confirmed</h3>
      <p className="mt-1 text-sm text-raiz-secondary">The unit has been successfully booked.</p>

      <div className="mt-5 rounded-lg border border-raiz-border divide-y divide-raiz-border text-left">
        <SummaryRow icon={ClipboardList} label="Booking ID" value={booking.bookingId ? `#${booking.bookingId}` : `#${booking.id}`} />
        <SummaryRow icon={UserIcon} label="Lead" value={booking.leadName || booking.lead?.name} />
        <SummaryRow icon={Building2} label="Unit" value={booking.unitNumber || booking.unit?.unitNumber} />
        <SummaryRow icon={IndianRupee} label="Price" value={formatCurrency(booking.price || booking.amount)} />
      </div>
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
