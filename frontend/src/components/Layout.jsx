import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Home, Users, BookOpen, BarChart2, Star, FileText, Bell, Search, LogOut, Trophy } from 'lucide-react';

const menuItems = [
  { path: '/',                  label: 'Home',            icon: Home },
  { path: '/kepegawaian',       label: 'Kepegawaian',     icon: Users },
  { path: '/kegiatan',          label: 'Kegiatan',        icon: BookOpen },
  { path: '/monitoring',        label: 'Monitoring',      icon: BarChart2 },
  { path: '/penilaian',         label: 'Penilaian',       icon: Star },
  { path: '/employee-of-month', label: 'Best Employee',   icon: Trophy },
  { path: '/laporan',           label: 'Laporan',         icon: FileText },
];

export default function Layout({ children }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => { logout(); navigate('/login'); };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      {/* ── Header ── */}
      <header className="bg-blue-700 text-white shadow-md z-10">
        <div className="flex items-center justify-between px-6 py-3">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white rounded flex items-center justify-center p-1">
              <img src="/bpspanjang.png" alt="Logo BPS" className="w-full h-full object-contain" />
            </div>
            <div>
              <p className="font-bold text-sm leading-tight">BADAN PUSAT STATISTIK</p>
              <p className="text-xs opacity-80">KABUPATEN SOLOK</p>
            </div>
          </div>

          {/* Search */}
          <div className="flex-1 max-w-md mx-8">
            <div className="relative">
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
              <input type="text" placeholder="Search"
                className="w-full pl-10 pr-4 py-2 rounded-full text-gray-800 text-sm bg-white outline-none" />
            </div>
          </div>

          {/* User info */}
          <div className="flex items-center gap-4">
            <button className="relative">
              <Bell className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2 bg-white text-gray-800 rounded-lg px-3 py-2">
              <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center text-xs font-bold text-gray-600">
                {user?.name?.charAt(0)}
              </div>
              <div className="text-xs">
                <p className="font-semibold leading-tight">{user?.name}</p>
                <p className="text-gray-500">{user?.jabatan || user?.role}</p>
              </div>
            </div>
            <button onClick={handleLogout} title="Logout" className="hover:text-red-200 transition">
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
        <div className="h-1 bg-blue-400" />
      </header>

      <div className="flex flex-1">
        {/* ── Sidebar ── */}
        <aside className="w-48 bg-gray-50 border-r border-gray-200 py-6 relative">
          <nav className="space-y-1 px-3">
            {menuItems.map(({ path, label, icon: Icon }) => (
              <NavLink key={path} to={path} end={path === '/'}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                    isActive ? 'font-bold text-gray-900 bg-blue-50' : 'text-gray-600 hover:bg-gray-100'
                  }`
                }
              >
                <Icon className="w-4 h-4" />
                {label}
              </NavLink>
            ))}
          </nav>
          {/* Logo bawah */}
          <div className="absolute bottom-6 left-4">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center p-1">
              <img src="/bpspanjang.png" alt="Logo BPS" className="w-full h-full object-contain" />
            </div>
          </div>
        </aside>

        {/* ── Konten ── */}
        <main className="flex-1 p-6 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
