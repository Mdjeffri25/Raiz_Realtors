import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ChevronDown, LogOut, Settings, Menu } from 'lucide-react';

export default function Topbar({ title, description, onMenuClick }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const initials = (user?.name || 'U')
    .split(' ')
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  const roleLabel = (user?.role || '')
    .split('_')
    .map((w) => w.charAt(0) + w.slice(1).toLowerCase())
    .join(' ');

  return (
    <header className="sticky top-0 z-30 border-b border-raiz-border bg-white/90 backdrop-blur-sm">
      <div className="flex items-center justify-between px-4 py-3.5 sm:px-6">
        <div className="flex items-center gap-3 min-w-0">
          <button
            onClick={onMenuClick}
            className="lg:hidden text-raiz-secondary hover:text-raiz-black transition-colors p-1 -ml-1"
          >
            <Menu size={20} />
          </button>
          <div className="min-w-0">
            <h2 className="text-sm font-semibold text-raiz-black truncate">{title}</h2>
            {description && (
              <p className="text-xs text-raiz-secondary truncate hidden sm:block">{description}</p>
            )}
          </div>
        </div>

        {/* User menu */}
        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="flex items-center gap-2.5 rounded-md py-1.5 px-1.5 hover:bg-raiz-offwhite transition-colors"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-raiz-black text-white text-xs font-semibold shrink-0">
              {initials}
            </div>
            <div className="hidden sm:block text-left">
              <div className="text-xs font-semibold text-raiz-black leading-tight">{user?.name}</div>
              <div className="text-10 tracking-wide text-raiz-secondary uppercase">{roleLabel}</div>
            </div>
            <ChevronDown size={14} className="text-raiz-secondary shrink-0" />
          </button>

          {menuOpen && (
            <div className="absolute right-0 top-full mt-1.5 w-56 animate-fade-scale rounded-lg border border-raiz-border bg-white shadow-lg py-1.5 z-50">
              <div className="px-3 py-2.5 border-b border-raiz-border">
                <div className="text-sm font-semibold text-raiz-black">{user?.name}</div>
                <div className="text-xs text-raiz-secondary">{user?.email}</div>
                <div className="mt-1.5">
                  <span className="inline-flex items-center rounded text-10 font-medium px-1.5 py-0.5 bg-raiz-peach-light text-raiz-black tracking-wide uppercase">
                    {roleLabel}
                  </span>
                </div>
              </div>
              <button
                onClick={() => {
                  setMenuOpen(false);
                  navigate('/settings');
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-raiz-black hover:bg-raiz-offwhite transition-colors"
              >
                <Settings size={15} className="text-raiz-secondary" />
                Settings
              </button>
              <button
                onClick={() => {
                  setMenuOpen(false);
                  logout();
                  navigate('/login');
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
              >
                <LogOut size={15} />
                Sign out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
