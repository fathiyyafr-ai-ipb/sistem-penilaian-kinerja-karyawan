import { useEffect, useState, useRef } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import { 
  Home, 
  Users, 
  BookOpen, 
  BarChart2, 
  Star, 
  FileText, 
  Bell, 
  Search, 
  LogOut, 
  Trophy,
  CheckCircle,
  Clock
} from 'lucide-react';

const getMenuItems = (user) => {
  const items = [
    { path: '/',                  label: 'Home',            icon: Home },
  ];

  // Kepegawaian only for admin, kasubag, kepala_bps
  if (['admin', 'kasubag', 'kepala_bps'].includes(user?.role)) {
    items.push({ path: '/kepegawaian',       label: 'Kepegawaian',     icon: Users });
  }

  items.push({ path: '/kegiatan',          label: 'Kegiatan',        icon: BookOpen });

  // Manajemen Tim only for admin, kasubag, kepala_bps, and ketua_tim (user?.is_leader)
  if (['admin', 'kasubag', 'kepala_bps'].includes(user?.role) || user?.is_leader) {
    items.push({ path: '/tim',                label: 'Manajemen Tim',   icon: Users });
  }

  // Dynamic assessment modules based on roles/leadership
  if (user?.is_leader) {
    items.push({ path: '/penilaian-tim', label: 'Penilaian Tim', icon: Star });
  }
  if (user?.role === 'kasubag') {
    items.push({ path: '/penilaian-presensi', label: 'Input Presensi', icon: Star });
  }
  if (user?.role === 'kepala_bps') {
    items.push({ path: '/penilaian-bps', label: 'Validasi Pimpinan', icon: Star });
  }
  
  // Standard scorecard view for employees (Nilai Saya) - hide for admin, kepala_bps, and kasubag
  if (!['admin', 'kepala_bps', 'kasubag'].includes(user?.role)) {
    items.push({ 
      path: '/penilaian', 
      label: 'Nilai Saya', 
      icon: Star 
    });
  }

  items.push({ path: '/employee-of-month', label: 'Best Employee',   icon: Trophy });

  // Laporan only for admin, kasubag, kepala_bps, and ketua_tim
  if (['admin', 'kasubag', 'kepala_bps'].includes(user?.role) || user?.is_leader) {
    items.push({ path: '/laporan',           label: 'Laporan',         icon: FileText });
  }
  
  return items;
};

export default function Layout({ children }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const dropdownRef = useRef(null);

  const [notifications, setNotifications] = useState([]);
  const [showNotifDropdown, setShowNotifDropdown] = useState(false);

  const handleLogout = () => { logout(); navigate('/login'); };

  // Fetch notifications from backend
  const fetchNotifications = async () => {
    if (!user) return;
    try {
      const res = await api.get('/assessments/notifications');
      setNotifications(res.data);
    } catch (err) {
      console.error('Gagal mengambil notifikasi:', err);
    }
  };

  useEffect(() => {
    fetchNotifications();
    // Poll notifications every 30 seconds
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, [user]);

  // Click outside listener to close notifications dropdown
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowNotifDropdown(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Handle clicking notifications icon
  const handleToggleNotif = async () => {
    const nextState = !showNotifDropdown;
    setShowNotifDropdown(nextState);

    // If opening, mark all notifications as read in backend
    if (nextState && unreadCount > 0) {
      try {
        await api.post('/assessments/notifications/read');
        // Instantly mark read locally
        setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
      } catch (err) {
        console.error('Gagal menandai notifikasi dibaca:', err);
      }
    }
  };

  const unreadCount = notifications.filter(n => !n.is_read).length;
  const menuItems = getMenuItems(user);

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
              <input type="text" placeholder="Cari..."
                className="w-full pl-10 pr-4 py-2 rounded-full text-gray-800 text-sm bg-white outline-none" />
            </div>
          </div>

          {/* User info & Notifications */}
          <div className="flex items-center gap-4">
            
            {/* Bell Icon with unread badge */}
            <div className="relative" ref={dropdownRef}>
              <button 
                onClick={handleToggleNotif}
                className="relative p-1.5 hover:bg-white/10 rounded-full transition"
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-0 right-0 w-4 h-4 bg-red-600 border-2 border-blue-700 rounded-full text-[9px] font-black flex items-center justify-center text-white">
                    {unreadCount}
                  </span>
                )}
              </button>

              {/* Notifications Dropdown Drawer */}
              {showNotifDropdown && (
                <div className="absolute right-0 mt-3 w-80 bg-white rounded-2xl shadow-xl border border-gray-100 py-3 z-50 text-gray-800 animate-in fade-in slide-in-from-top-2 duration-150">
                  <div className="px-4 pb-2 border-b border-gray-100 flex items-center justify-between">
                    <span className="font-bold text-sm text-gray-800">Notifikasi Masuk</span>
                    {unreadCount > 0 && (
                      <span className="text-[10px] font-extrabold bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full">
                        {unreadCount} Baru
                      </span>
                    )}
                  </div>
                  
                  <div className="max-h-[320px] overflow-y-auto divide-y divide-gray-50">
                    {notifications.length === 0 ? (
                      <div className="px-4 py-8 text-center text-xs text-gray-400">
                        Tidak ada notifikasi.
                      </div>
                    ) : (
                      notifications.map(notif => (
                        <div 
                          key={notif.id} 
                          className={`px-4 py-3 flex gap-2.5 items-start hover:bg-slate-50 transition-colors ${
                            !notif.is_read ? 'bg-blue-50/30' : ''
                          }`}
                        >
                          <div className={`p-1.5 rounded-lg flex-shrink-0 mt-0.5 ${
                            notif.message.includes('terbit') || notif.message.includes('publikasi')
                              ? 'bg-amber-50 text-amber-600'
                              : 'bg-blue-50 text-blue-600'
                          }`}>
                            {notif.message.includes('terbit') || notif.message.includes('publikasi') ? (
                              <Trophy className="w-3.5 h-3.5" />
                            ) : (
                              <CheckCircle className="w-3.5 h-3.5" />
                            )}
                          </div>
                          <div>
                            <p className="text-xs text-gray-700 leading-normal">{notif.message}</p>
                            <p className="text-[9px] text-gray-400 font-semibold mt-1 flex items-center gap-1">
                              <Clock className="w-2.5 h-2.5" />
                              {new Date(notif.created_at).toLocaleDateString('id-ID', {
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </p>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="flex items-center gap-2 bg-white text-gray-800 rounded-lg px-3 py-2">
              <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center text-xs font-bold text-gray-600">
                {user?.name?.charAt(0)}
              </div>
              <div className="text-xs">
                <p className="font-semibold leading-tight">{user?.name}</p>
                <p className="text-gray-500 capitalize">{user?.jabatan || user?.role}</p>
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
