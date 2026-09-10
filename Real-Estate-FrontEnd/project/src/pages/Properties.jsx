import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';
import axiosClient from '../api/axiosClient';
import propertyApi from '../api/propertyApi';
import { ROLES, formatCurrency } from '../utils/constants';
import { Input, Select } from '../components/ui/FormField';
import Button from '../components/ui/Button';
import StatusBadge from '../components/ui/StatusBadge';
import Drawer from '../components/ui/Drawer';
import Modal from '../components/ui/Modal';
import PageHeader from '../components/ui/PageHeader';
import { LoadingState, ErrorState, EmptyState } from '../components/ui/States';
import {
  Search,
  Building2,
  MapPin,
  ArrowRight,
  Plus,
  X
} from 'lucide-react';

export default function Properties() {

  const { hasRole } = useAuth();
  const { showError, showSuccess } = useToast();
  const navigate = useNavigate();

  const canBook = hasRole([
    ROLES.ADMIN,
    ROLES.SALES,
    ROLES.BACK_OFFICE
  ]);

  const canManageUnits = hasRole([
    ROLES.ADMIN,
    ROLES.BACK_OFFICE
  ]);

  const [projects, setProjects] = useState([]);
  const [buildings, setBuildings] = useState([]);
  const [units, setUnits] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [projectFilter, setProjectFilter] = useState('');

  const [selectedUnit, setSelectedUnit] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  // ==========================================
  // ADD UNIT STATE
  // ==========================================

  const [addUnitOpen, setAddUnitOpen] = useState(false);

  const [unitForm, setUnitForm] = useState({
    buildingId: '',
    unitNumber: '',
    type: '2BHK',
    price: '',
    status: 'AVAILABLE'
  });

  const [savingUnit, setSavingUnit] = useState(false);

  // ==========================================
  // LOAD DATA
  // ==========================================

  const fetchData = useCallback(async () => {

    setLoading(true);
    setError(null);

    try {

      const [projRes, unitRes, buildingRes] =
        await Promise.all([
          propertyApi.getProjects(),
          propertyApi.getUnits(),
          axiosClient.get('/buildings')
        ]);

      setProjects(
        Array.isArray(projRes.data)
          ? projRes.data
          : []
      );

      setUnits(
        Array.isArray(unitRes.data)
          ? unitRes.data
          : []
      );

      setBuildings(
        Array.isArray(buildingRes.data)
          ? buildingRes.data
          : []
      );

    } catch (err) {

      setError(
        err.message ||
        'Unable to load property data.'
      );

      if (err.status !== 0) {
        showError(err.message);
      }

    } finally {
      setLoading(false);
    }

  }, [showError]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // ==========================================
  // FILTER UNITS
  // ==========================================

  const filteredUnits = units.filter((u) => {

    if (
      statusFilter &&
      (u.status || '').toUpperCase() !== statusFilter
    ) {
      return false;
    }

    const unitProjectId =
      u.projectId ||
      u.project?.id ||
      u.building?.projectId ||
      u.building?.project?.id;

    if (
      projectFilter &&
      String(unitProjectId) !== String(projectFilter)
    ) {
      return false;
    }

    if (search) {

      const q = search.toLowerCase();

      const matchStr = `
        ${u.unitNumber || ''}
        ${u.unitType || ''}
        ${u.type || ''}
        ${u.projectName || ''}
        ${u.project?.name || ''}
        ${u.buildingName || ''}
        ${u.building?.name || ''}
      `.toLowerCase();

      if (!matchStr.includes(q)) {
        return false;
      }
    }

    return true;
  });

  // ==========================================
  // GROUP BY PROJECT
  // ==========================================

  const groupedByProject = projects
    .map((proj) => {

      const projUnits = filteredUnits.filter((u) => {

        const unitProjectId =
          u.projectId ||
          u.project?.id ||
          u.building?.projectId ||
          u.building?.project?.id;

        return String(unitProjectId) === String(proj.id);
      });

      const total = projUnits.length;

      const available = projUnits.filter(
        (u) =>
          (u.status || '').toUpperCase() === 'AVAILABLE'
      ).length;

      const booked = projUnits.filter(
        (u) =>
          (u.status || '').toUpperCase() === 'BOOKED'
      ).length;

      return {
        project: proj,
        units: projUnits,
        total,
        available,
        booked
      };

    })
    .filter(
      (g) =>
        g.units.length > 0 ||
        (!search &&
          !statusFilter &&
          !projectFilter)
    );

  // ==========================================
  // OPEN UNIT
  // ==========================================

  const openUnit = (unit) => {

    if (
      (unit.status || '').toUpperCase() !==
      'AVAILABLE'
    ) {
      return;
    }

    setSelectedUnit(unit);
    setDrawerOpen(true);
  };

  // ==========================================
  // OPEN ADD UNIT
  // ==========================================

  const openAddUnit = () => {

    setUnitForm({
      buildingId: '',
      unitNumber: '',
      type: '2BHK',
      price: '',
      status: 'AVAILABLE'
    });

    setAddUnitOpen(true);
  };

  // ==========================================
  // HANDLE FORM
  // ==========================================

  const handleUnitChange = (e) => {

    const { name, value } = e.target;

    setUnitForm((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  // ==========================================
  // CREATE UNIT
  // ==========================================

  const handleAddUnit = async (e) => {

    e.preventDefault();

    if (!unitForm.buildingId) {
      showError('Please select a building.');
      return;
    }

    if (!unitForm.unitNumber.trim()) {
      showError('Please enter a unit number.');
      return;
    }

    if (!unitForm.price || Number(unitForm.price) <= 0) {
      showError('Please enter a valid price.');
      return;
    }

    setSavingUnit(true);

    try {

      // await axiosClient.post('/units', {
      //   unitNumber: unitForm.unitNumber.trim(),
      //   type: unitForm.type,
      //   price: Number(unitForm.price),
      //   status: unitForm.status,

      //   // Backend Unit has a ManyToOne Building relation
      //   building: {
      //     id: Number(unitForm.buildingId)
      //   }
      // });

//       await axiosClient.post('/units', {
//   unitNumber: unitForm.unitNumber.trim(),
//   type: unitForm.type,
//   price: Number(unitForm.price),
//   status: unitForm.status,
//   buildingId: Number(unitForm.buildingId)
// });


await axiosClient.post('/units', {
  unitNumber: unitForm.unitNumber.trim(),
  type: unitForm.type,
  price: Number(unitForm.price),
  status: unitForm.status,
  buildingId: Number(unitForm.buildingId)
});
      showSuccess(
        `Unit ${unitForm.unitNumber} added successfully.`
      );

      setAddUnitOpen(false);

      await fetchData();

    } catch (err) {

      showError(
        err.response?.data?.message ||
        err.response?.data?.error ||
        err.message ||
        'Unable to add unit.'
      );

    } finally {
      setSavingUnit(false);
    }
  };

  // ==========================================
  // LOADING
  // ==========================================

  if (loading) {
    return (
      <LoadingState label="Loading properties…" />
    );
  }

  // ==========================================
  // ERROR
  // ==========================================

  if (error) {
    return (
      <ErrorState
        message={error}
        onRetry={fetchData}
      />
    );
  }

  // ==========================================
  // UI
  // ==========================================

  return (
    <div>

      <PageHeader
        title="Properties"
        description="Project & unit inventory."
      />

      {/* ======================================
          TOP ACTION
      ====================================== */}

      <div className="flex justify-end mb-5">

        {canManageUnits && (
          <Button
            size="sm"
            onClick={openAddUnit}
          >
            <Plus size={14} />
            Add Unit
          </Button>
        )}

      </div>

      {/* ======================================
          FILTERS
      ====================================== */}

      <div className="mb-5 flex flex-col sm:flex-row gap-3">

        <div className="flex-1">

          <Input
            placeholder="Search units, projects, buildings…"
            value={search}
            onChange={(e) =>
              setSearch(e.target.value)
            }
            icon={<Search size={14} />}
          />

        </div>

        <div className="flex gap-3 flex-wrap">

          <Select
            value={projectFilter}
            onChange={(e) =>
              setProjectFilter(e.target.value)
            }
            className="w-auto min-w-[160px]"
          >

            <option value="">
              All Projects
            </option>

            {projects.map((p) => (
              <option
                key={p.id}
                value={String(p.id)}
              >
                {p.name}
              </option>
            ))}

          </Select>

          <Select
            value={statusFilter}
            onChange={(e) =>
              setStatusFilter(e.target.value)
            }
            className="w-auto min-w-[140px]"
          >

            <option value="">
              All Status
            </option>

            <option value="AVAILABLE">
              Available
            </option>

            <option value="BOOKED">
              Booked
            </option>

          </Select>

        </div>

      </div>

      {/* ======================================
          NO PROJECTS
      ====================================== */}

      {projects.length === 0 ? (

        <div className="rounded-lg border border-raiz-border bg-white">

          <EmptyState
            title="No Projects Yet"
            description="Property projects will appear here once they are added in the backend."
          />

        </div>

      ) : groupedByProject.length === 0 ? (

        <div className="rounded-lg border border-raiz-border bg-white">

          <EmptyState
            title="No Matching Units"
            description="Try adjusting your filters."
          />

        </div>

      ) : (

        <div className="space-y-6">

          {groupedByProject.map(
            ({
              project,
              units: projUnits,
              total,
              available,
              booked
            }) => (

              <div
                key={project.id}
                className="rounded-lg border border-raiz-border bg-white overflow-hidden"
              >

                {/* PROJECT HEADER */}

                <div className="flex items-center justify-between px-5 py-4 border-b border-raiz-border bg-raiz-offwhite/40">

                  <div>

                    <div className="flex items-center gap-2">

                      <Building2
                        size={16}
                        className="text-raiz-secondary"
                      />

                      <h3 className="font-serif text-lg font-semibold text-raiz-black">
                        {project.name}
                      </h3>

                    </div>

                    {project.location && (

                      <div className="flex items-center gap-1.5 mt-1 ml-6">

                        <MapPin
                          size={12}
                          className="text-raiz-secondary"
                        />

                        <span className="text-xs text-raiz-secondary">
                          {project.location}
                        </span>

                      </div>

                    )}

                  </div>

                  <div className="flex items-center gap-4 text-xs">

                    <div className="text-raiz-secondary">
                      <span className="font-semibold text-raiz-black">
                        {total}
                      </span>{' '}
                      Units
                    </div>

                    <div className="text-raiz-secondary">
                      <span className="font-semibold text-raiz-peach">
                        {available}
                      </span>{' '}
                      Available
                    </div>

                    <div className="text-raiz-secondary">
                      <span className="font-semibold text-raiz-black">
                        {booked}
                      </span>{' '}
                      Booked
                    </div>

                  </div>

                </div>

                {/* AVAILABILITY BAR */}

                <div className="h-1 bg-raiz-offwhite">

                  <div
                    className="h-full bg-raiz-peach transition-all"
                    style={{
                      width: `${
                        total > 0
                          ? (available / total) * 100
                          : 0
                      }%`
                    }}
                  />

                </div>

                {/* UNITS TABLE */}

                {projUnits.length > 0 ? (

                  <div className="overflow-x-auto scrollbar-thin">

                    <table className="w-full text-sm">

                      <thead>

                        <tr className="border-b border-raiz-border">

                          <th className="px-4 py-2.5 text-left text-10 font-semibold tracking-wide text-raiz-secondary uppercase">
                            Unit
                          </th>

                          <th className="px-4 py-2.5 text-left text-10 font-semibold tracking-wide text-raiz-secondary uppercase">
                            Type
                          </th>

                          <th className="px-4 py-2.5 text-left text-10 font-semibold tracking-wide text-raiz-secondary uppercase">
                            Building
                          </th>

                          <th className="px-4 py-2.5 text-right text-10 font-semibold tracking-wide text-raiz-secondary uppercase">
                            Price
                          </th>

                          <th className="px-4 py-2.5 text-left text-10 font-semibold tracking-wide text-raiz-secondary uppercase">
                            Status
                          </th>

                          <th className="px-4 py-2.5 text-right text-10 font-semibold tracking-wide text-raiz-secondary uppercase">
                            Action
                          </th>

                        </tr>

                      </thead>

                      <tbody className="divide-y divide-raiz-border">

                        {projUnits.map((unit) => {

                          const isAvailable =
                            (unit.status || '')
                              .toUpperCase() ===
                            'AVAILABLE';

                          return (

                            <tr
                              key={unit.id}
                              className={`transition-colors ${
                                isAvailable
                                  ? 'hover:bg-raiz-peach-light/30 cursor-pointer'
                                  : 'opacity-60'
                              }`}
                              onClick={() =>
                                isAvailable &&
                                openUnit(unit)
                              }
                            >

                              <td className="px-4 py-3 font-medium text-raiz-black">
                                {unit.unitNumber || '—'}
                              </td>

                              <td className="px-4 py-3 text-raiz-secondary">
                                {unit.unitType ||
                                  unit.type ||
                                  '—'}
                              </td>

                              <td className="px-4 py-3 text-raiz-secondary">
                                {unit.buildingName ||
                                  unit.building?.name ||
                                  '—'}
                              </td>

                              <td className="px-4 py-3 text-right font-medium text-raiz-black whitespace-nowrap">
                                {formatCurrency(
                                  unit.price
                                )}
                              </td>

                              <td className="px-4 py-3">
                                <StatusBadge
                                  status={unit.status}
                                  type="unit"
                                  size="xs"
                                />
                              </td>

                              <td
                                className="px-4 py-3 text-right"
                                onClick={(e) =>
                                  e.stopPropagation()
                                }
                              >

                                {isAvailable &&
                                canBook ? (

                                  <button
                                    onClick={() =>
                                      navigate(
                                        '/bookings',
                                        {
                                          state: {
                                            preselectUnit:
                                              unit
                                          }
                                        }
                                      )
                                    }
                                    className="inline-flex items-center gap-1 text-xs font-medium text-raiz-black hover:text-raiz-peach transition-colors"
                                  >
                                    Book
                                    <ArrowRight
                                      size={12}
                                    />
                                  </button>

                                ) : (

                                  <span className="text-xs text-raiz-secondary">
                                    —
                                  </span>

                                )}

                              </td>

                            </tr>

                          );

                        })}

                      </tbody>

                    </table>

                  </div>

                ) : (

                  <div className="px-5 py-6 text-center text-sm text-raiz-secondary">
                    No units in this project.
                  </div>

                )}

              </div>

            )
          )}

        </div>

      )}

      {/* ======================================
          UNIT DETAIL DRAWER
      ====================================== */}

      <Drawer
        open={drawerOpen}
        onClose={() =>
          setDrawerOpen(false)
        }
        title="Unit Details"
        width="max-w-md"
        footer={
          selectedUnit &&
          canBook && (
            <Button
              size="sm"
              onClick={() => {
                setDrawerOpen(false);

                navigate('/bookings', {
                  state: {
                    preselectUnit:
                      selectedUnit
                  }
                });
              }}
            >
              Book This Unit
              <ArrowRight size={13} />
            </Button>
          )
        }
      >

        {selectedUnit && (

          <div className="space-y-5">

            <div>

              <h3 className="font-serif text-2xl font-semibold text-raiz-black">
                {selectedUnit.unitNumber}
              </h3>

              <div className="mt-2">

                <StatusBadge
                  status={selectedUnit.status}
                  type="unit"
                  size="sm"
                />

              </div>

            </div>

            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-raiz-border">

              <DetailField
                label="Unit Type"
                value={
                  selectedUnit.unitType ||
                  selectedUnit.type
                }
              />

              <DetailField
                label="Price"
                value={formatCurrency(
                  selectedUnit.price
                )}
              />

              <DetailField
                label="Building"
                value={
                  selectedUnit.buildingName ||
                  selectedUnit.building?.name
                }
              />

              <DetailField
                label="Project"
                value={
                  selectedUnit.projectName ||
                  selectedUnit.project?.name ||
                  selectedUnit.building?.project?.name
                }
              />

              {selectedUnit.area && (
                <DetailField
                  label="Area"
                  value={selectedUnit.area}
                />
              )}

              {selectedUnit.floor && (
                <DetailField
                  label="Floor"
                  value={selectedUnit.floor}
                />
              )}

            </div>

            {selectedUnit.description && (

              <div className="pt-4 border-t border-raiz-border">

                <div className="text-10 font-semibold tracking-wide text-raiz-secondary uppercase mb-2">
                  Description
                </div>

                <p className="text-sm text-raiz-black leading-relaxed">
                  {selectedUnit.description}
                </p>

              </div>

            )}

          </div>

        )}

      </Drawer>

      {/* ======================================
          ADD UNIT MODAL
      ====================================== */}

      <Modal
        open={addUnitOpen}
        onClose={() => {
          if (!savingUnit) {
            setAddUnitOpen(false);
          }
        }}
        title="Add Unit"
      >

        <form
          onSubmit={handleAddUnit}
          className="space-y-5"
        >

          <div>

            <label className="block text-xs font-medium text-raiz-secondary uppercase tracking-wide mb-2">
              Building
            </label>

            <Select
              name="buildingId"
              value={unitForm.buildingId}
              onChange={handleUnitChange}
              required
            >

              <option value="">
                Select Building
              </option>

              {buildings.map((building) => (

                <option
                  key={building.id}
                  value={String(building.id)}
                >
                  {building.name}
                  {building.project?.name
                    ? ` — ${building.project.name}`
                    : ''}
                </option>

              ))}

            </Select>

          </div>

          <div>

            <label className="block text-xs font-medium text-raiz-secondary uppercase tracking-wide mb-2">
              Unit Number
            </label>

            <Input
              name="unitNumber"
              placeholder="A-103"
              value={unitForm.unitNumber}
              onChange={handleUnitChange}
              required
            />

          </div>

          <div className="grid grid-cols-2 gap-4">

            <div>

              <label className="block text-xs font-medium text-raiz-secondary uppercase tracking-wide mb-2">
                Type
              </label>

              <Select
                name="type"
                value={unitForm.type}
                onChange={handleUnitChange}
              >

                <option value="1BHK">
                  1 BHK
                </option>

                <option value="2BHK">
                  2 BHK
                </option>

                <option value="3BHK">
                  3 BHK
                </option>

                <option value="4BHK">
                  4 BHK
                </option>

                <option value="VILLA">
                  Villa
                </option>

                <option value="PLOT">
                  Plot
                </option>

              </Select>

            </div>

            <div>

              <label className="block text-xs font-medium text-raiz-secondary uppercase tracking-wide mb-2">
                Status
              </label>

              <Select
                name="status"
                value={unitForm.status}
                onChange={handleUnitChange}
              >

                <option value="AVAILABLE">
                  Available
                </option>

                <option value="BOOKED">
                  Booked
                </option>

              </Select>

            </div>

          </div>

          <div>

            <label className="block text-xs font-medium text-raiz-secondary uppercase tracking-wide mb-2">
              Price
            </label>

            <Input
              name="price"
              type="number"
              min="1"
              placeholder="6800000"
              value={unitForm.price}
              onChange={handleUnitChange}
              required
            />

          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-raiz-border">

            <Button
              type="button"
              variant="secondary"
              onClick={() =>
                setAddUnitOpen(false)
              }
              disabled={savingUnit}
            >
              Cancel
            </Button>

            <Button
              type="submit"
              disabled={savingUnit}
            >
              {savingUnit
                ? 'Adding…'
                : 'Add Unit'}
            </Button>

          </div>

        </form>

      </Modal>

    </div>
  );
}


// ==========================================
// DETAIL FIELD
// ==========================================

function DetailField({ label, value }) {

  return (

    <div>

      <div className="text-10 font-semibold tracking-wide text-raiz-secondary uppercase mb-1">
        {label}
      </div>

      <div className="text-sm text-raiz-black">
        {value || '—'}
      </div>

    </div>

  );
}