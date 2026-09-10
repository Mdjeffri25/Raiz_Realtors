import { useState } from 'react';
import { useToast } from '../context/ToastContext';
import { Input, Select } from '../components/ui/FormField';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import PageHeader from '../components/ui/PageHeader';
import { EmptyState } from '../components/ui/States';
import { ROLE_OPTIONS, formatDate } from '../utils/constants';
import { Search, Plus, UserPlus, Shield } from 'lucide-react';

// Users page — admin only. The backend endpoints for user CRUD may not exist yet.
// We display a clean management interface. When the backend exposes user endpoints,
// wire them up in src/api/ and replace the placeholder fetch.

export default function Users() {
  const { showError, showSuccess, showInfo } = useToast();
  const [search, setSearch] = useState('');
  const [createOpen, setCreateOpen] = useState(false);
  const [createForm, setCreateForm] = useState({ name: '', email: '', role: 'SALES', password: '' });
  const [creating, setCreating] = useState(false);
  const [users] = useState([]);

  const filteredUsers = users.filter((u) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return `${u.name || ''} ${u.email || ''} ${u.role || ''}`.toLowerCase().includes(q);
  });

  const handleCreate = async () => {
    if (!createForm.name || !createForm.email || !createForm.password) {
      showError('All fields are required.');
      return;
    }
    setCreating(true);
    // Placeholder — wire to backend when user endpoints are available
    setTimeout(() => {
      setCreating(false);
      setCreateOpen(false);
      showInfo('User creation requires a backend endpoint. Please add a user management API to the Spring Boot backend.');
      setCreateForm({ name: '', email: '', role: 'SALES', password: '' });
    }, 500);
  };

  return (
    <div>
      <PageHeader title="Users" description="Manage team members & access levels.">
        <Button onClick={() => setCreateOpen(true)}>
          <Plus size={15} />
          Add User
        </Button>
      </PageHeader>

      <div className="mb-5">
        <Input
          placeholder="Search users…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          icon={<Search size={14} />}
        />
      </div>

      <div className="rounded-lg border border-raiz-border bg-white overflow-hidden">
        {filteredUsers.length === 0 ? (
          <EmptyState
            title="No Users to Display"
            description="User management will show team members here once the backend user API is available."
            action={<Button onClick={() => setCreateOpen(true)}><Plus size={15} /> Add User</Button>}
          />
        ) : (
          <div className="overflow-x-auto scrollbar-thin">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-raiz-border bg-raiz-offwhite/50">
                  <th className="px-4 py-3 text-left text-10 font-semibold tracking-wide text-raiz-secondary uppercase">Name</th>
                  <th className="px-4 py-3 text-left text-10 font-semibold tracking-wide text-raiz-secondary uppercase">Email</th>
                  <th className="px-4 py-3 text-left text-10 font-semibold tracking-wide text-raiz-secondary uppercase">Role</th>
                  <th className="px-4 py-3 text-left text-10 font-semibold tracking-wide text-raiz-secondary uppercase">Status</th>
                  <th className="px-4 py-3 text-left text-10 font-semibold tracking-wide text-raiz-secondary uppercase">Last Activity</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-raiz-border">
                {filteredUsers.map((u) => (
                  <tr key={u.id} className="hover:bg-raiz-offwhite/40 transition-colors">
                    <td className="px-4 py-3 font-medium text-raiz-black">{u.name}</td>
                    <td className="px-4 py-3 text-raiz-secondary">{u.email}</td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center gap-1.5 rounded text-xs font-medium px-2 py-0.5 bg-raiz-peach-light text-raiz-black">
                        <Shield size={11} />
                        {u.role?.split('_').map((w) => w.charAt(0) + w.slice(1).toLowerCase()).join(' ')}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center gap-1.5 text-xs ${u.active ? 'text-green-600' : 'text-raiz-secondary'}`}>
                        <span className={`h-1.5 w-1.5 rounded-full ${u.active ? 'bg-green-500' : 'bg-raiz-secondary'}`} />
                        {u.active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-raiz-secondary">{formatDate(u.lastActivity)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Modal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        title="Add New User"
        width="max-w-md"
        footer={
          <>
            <Button variant="secondary" size="sm" onClick={() => setCreateOpen(false)}>Cancel</Button>
            <Button size="sm" onClick={handleCreate} loading={creating}>Create User</Button>
          </>
        }
      >
        <div className="space-y-4">
          <Input label="Name" placeholder="Full name" value={createForm.name} onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })} />
          <Input label="Email" type="email" placeholder="Email address" value={createForm.email} onChange={(e) => setCreateForm({ ...createForm, email: e.target.value })} />
          <Select label="Role" value={createForm.role} onChange={(e) => setCreateForm({ ...createForm, role: e.target.value })}>
            {ROLE_OPTIONS.map((r) => <option key={r.value} value={r.value}>{r.label}</option>)}
          </Select>
          <Input label="Password" type="password" placeholder="Temporary password" value={createForm.password} onChange={(e) => setCreateForm({ ...createForm, password: e.target.value })} />
        </div>
      </Modal>
    </div>
  );
}
// Users.jsx