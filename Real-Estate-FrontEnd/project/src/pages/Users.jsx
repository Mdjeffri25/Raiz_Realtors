import { useEffect, useState } from 'react';
import { useToast } from '../context/ToastContext';
import { Input, Select } from '../components/ui/FormField';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import PageHeader from '../components/ui/PageHeader';
import { EmptyState } from '../components/ui/States';
import { ROLE_OPTIONS } from '../utils/constants';
import userApi from '../api/userApi';
import { Search, Plus, Shield, Trash2 } from 'lucide-react';

export default function Users() {
  const { showError, showSuccess } = useToast();

  const [search, setSearch] = useState('');
  const [createOpen, setCreateOpen] = useState(false);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);

  const [createForm, setCreateForm] = useState({
    name: '',
    email: '',
    role: 'SALES',
    password: '',
  });

  // LOAD USERS
  const loadUsers = async () => {
    try {
      setLoading(true);

      const response = await userApi.getAll();

      setUsers(response.data || []);
    } catch (error) {
      console.error('Failed to load users:', error);
      showError(
        error.message ||
        'Failed to load users.'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  // SEARCH
  const filteredUsers = users.filter((u) => {
    if (!search) return true;

    const q = search.toLowerCase();

    return `${u.name || ''} ${u.email || ''} ${u.role || ''}`
      .toLowerCase()
      .includes(q);
  });

  // CREATE USER
  const handleCreate = async () => {
    if (
      !createForm.name.trim() ||
      !createForm.email.trim() ||
      !createForm.password.trim()
    ) {
      showError('Name, email and password are required.');
      return;
    }

    try {
      setCreating(true);

      await userApi.create({
        name: createForm.name.trim(),
        email: createForm.email.trim(),
        password: createForm.password,
        role: createForm.role,
      });

      showSuccess('User created successfully.');

      setCreateOpen(false);

      setCreateForm({
        name: '',
        email: '',
        role: 'SALES',
        password: '',
      });

      await loadUsers();
    } catch (error) {
      console.error('Failed to create user:', error);

      showError(
        error.message||
        'Failed to create user.'
      );
    } finally {
      setCreating(false);
    }
  };

  // DELETE USER
  const handleDelete = async (id, name) => {
    const confirmed = window.confirm(
      `Delete user "${name}"?`
    );

    if (!confirmed) return;

    try {
      await userApi.remove(id);

      showSuccess('User deleted successfully.');

      await loadUsers();
    } catch (error) {
      console.error('Failed to delete user:', error);

      showError(
        error.message ||
        'Failed to delete user.'
      );
    }
  };

  return (
    <div>
      <PageHeader
        title="Users"
        description="Manage team members & access levels."
      >
        <Button onClick={() => setCreateOpen(true)}>
          <Plus size={15} />
          Add User
        </Button>
      </PageHeader>

      {/* SEARCH */}
      <div className="mb-5">
        <Input
          placeholder="Search users…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          icon={<Search size={14} />}
        />
      </div>

      {/* USERS TABLE */}
      <div className="rounded-lg border border-raiz-border bg-white overflow-hidden">

        {loading ? (
          <div className="p-12 text-center text-raiz-secondary">
            Loading users...
          </div>
        ) : filteredUsers.length === 0 ? (
          <EmptyState
            title="No Users to Display"
            description={
              search
                ? 'No users match your search.'
                : 'No users have been created yet.'
            }
            action={
              !search && (
                <Button onClick={() => setCreateOpen(true)}>
                  <Plus size={15} />
                  Add User
                </Button>
              )
            }
          />
        ) : (
          <div className="overflow-x-auto scrollbar-thin">
            <table className="w-full text-sm">

              <thead>
                <tr className="border-b border-raiz-border bg-raiz-offwhite/50">

                  <th className="px-4 py-3 text-left text-10 font-semibold tracking-wide text-raiz-secondary uppercase">
                    Name
                  </th>

                  <th className="px-4 py-3 text-left text-10 font-semibold tracking-wide text-raiz-secondary uppercase">
                    Email
                  </th>

                  <th className="px-4 py-3 text-left text-10 font-semibold tracking-wide text-raiz-secondary uppercase">
                    Role
                  </th>

                  <th className="px-4 py-3 text-left text-10 font-semibold tracking-wide text-raiz-secondary uppercase">
                    Status
                  </th>

                  <th className="px-4 py-3 text-right text-10 font-semibold tracking-wide text-raiz-secondary uppercase">
                    Action
                  </th>

                </tr>
              </thead>

              <tbody className="divide-y divide-raiz-border">

                {filteredUsers.map((u) => (
                  <tr
                    key={u.id}
                    className="hover:bg-raiz-offwhite/40 transition-colors"
                  >

                    <td className="px-4 py-3 font-medium text-raiz-black">
                      {u.name}
                    </td>

                    <td className="px-4 py-3 text-raiz-secondary">
                      {u.email}
                    </td>

                    <td className="px-4 py-3">

                      <span className="inline-flex items-center gap-1.5 rounded text-xs font-medium px-2 py-0.5 bg-raiz-peach-light text-raiz-black">

                        <Shield size={11} />

                        {u.role
                          ?.split('_')
                          .map(
                            (w) =>
                              w.charAt(0) +
                              w.slice(1).toLowerCase()
                          )
                          .join(' ')}

                      </span>

                    </td>

                    <td className="px-4 py-3">

                      <span
                        className={`inline-flex items-center gap-1.5 text-xs ${
                          u.active
                            ? 'text-green-600'
                            : 'text-raiz-secondary'
                        }`}
                      >

                        <span
                          className={`h-1.5 w-1.5 rounded-full ${
                            u.active
                              ? 'bg-green-500'
                              : 'bg-raiz-secondary'
                          }`}
                        />

                        {u.active ? 'Active' : 'Inactive'}

                      </span>

                    </td>

                    <td className="px-4 py-3 text-right">

                      <button
                        onClick={() =>
                          handleDelete(u.id, u.name)
                        }
                        className="inline-flex items-center justify-center p-2 text-raiz-secondary hover:text-red-600 transition-colors"
                        title="Delete user"
                      >
                        <Trash2 size={15} />
                      </button>

                    </td>

                  </tr>
                ))}

              </tbody>

            </table>
          </div>
        )}

      </div>

      {/* CREATE USER MODAL */}
      <Modal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        title="Add New User"
        width="max-w-md"
        footer={
          <>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setCreateOpen(false)}
            >
              Cancel
            </Button>

            <Button
              size="sm"
              onClick={handleCreate}
              loading={creating}
            >
              Create User
            </Button>
          </>
        }
      >

        <div className="space-y-4">

          <Input
            label="Name"
            placeholder="Full name"
            value={createForm.name}
            onChange={(e) =>
              setCreateForm({
                ...createForm,
                name: e.target.value,
              })
            }
          />

          <Input
            label="Email"
            type="email"
            placeholder="Email address"
            value={createForm.email}
            onChange={(e) =>
              setCreateForm({
                ...createForm,
                email: e.target.value,
              })
            }
          />

          <Select
            label="Role"
            value={createForm.role}
            onChange={(e) =>
              setCreateForm({
                ...createForm,
                role: e.target.value,
              })
            }
          >
            {ROLE_OPTIONS.map((r) => (
              <option
                key={r.value}
                value={r.value}
              >
                {r.label}
              </option>
            ))}
          </Select>

          <Input
            label="Password"
            type="password"
            placeholder="Temporary password"
            value={createForm.password}
            onChange={(e) =>
              setCreateForm({
                ...createForm,
                password: e.target.value,
              })
            }
          />

        </div>

      </Modal>
    </div>
  );
}