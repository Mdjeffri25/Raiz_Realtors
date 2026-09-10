import { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import Topbar from './Topbar';

const PAGE_META = {
  '/dashboard': { title: 'Dashboard', description: 'Sales overview & today\'s activity' },
  '/leads': { title: 'Leads', description: 'Manage your sales pipeline' },
  '/follow-ups': { title: 'Follow-ups', description: 'Stay on top of your scheduled callbacks' },
  '/properties': { title: 'Properties', description: 'Project & unit inventory' },
  '/bookings': { title: 'Bookings', description: 'Transaction records & new booking flow' },
  '/audit-logs': { title: 'Audit Trail', description: 'Every important system action is recorded' },
  '/users': { title: 'Users', description: 'Manage team members & access levels' },
  '/settings': { title: 'Settings', description: 'Your account & application information' },
};

export default function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  const meta = PAGE_META[location.pathname] || {
    title: 'Raiz Realtors',
    description: '',
  };

  return (
    <div className="flex min-h-screen bg-raiz-offwhite">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex-1 min-w-0 flex flex-col">
        <Topbar
          title={meta.title}
          description={meta.description}
          onMenuClick={() => setSidebarOpen(true)}
        />
        <main className="flex-1 overflow-x-hidden">
          <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
