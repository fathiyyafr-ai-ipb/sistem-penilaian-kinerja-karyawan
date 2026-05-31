import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Layout           from './components/Layout';
import Login            from './pages/Login';
import Home             from './pages/Home';
import Kepegawaian      from './pages/Kepegawaian';
import Kegiatan         from './pages/Kegiatan';
import Penilaian        from './pages/Penilaian';
import PenilaianTim     from './pages/PenilaianTim';
import PenilaianPresensi from './pages/PenilaianPresensi';
import PenilaianBps      from './pages/PenilaianBps';
import Laporan          from './pages/Laporan';
import EmployeeOfMonth  from './pages/EmployeeOfMonth';
import Tim              from './pages/Tim';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="flex items-center justify-center h-screen text-gray-500">Memuat...</div>;
  if (!user)   return <Navigate to="/login" replace />;
  return children;
};

function AppRoutes() {
  const { user } = useAuth();
  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to="/" /> : <Login />} />
      <Route path="/" element={<ProtectedRoute><Layout><Home /></Layout></ProtectedRoute>} />
      <Route path="/kepegawaian" element={<ProtectedRoute><Layout><Kepegawaian /></Layout></ProtectedRoute>} />
      <Route path="/kegiatan"    element={<ProtectedRoute><Layout><Kegiatan /></Layout></ProtectedRoute>} />
      <Route path="/penilaian"          element={<ProtectedRoute><Layout><Penilaian /></Layout></ProtectedRoute>} />
      <Route path="/penilaian-tim"      element={<ProtectedRoute><Layout><PenilaianTim /></Layout></ProtectedRoute>} />
      <Route path="/penilaian-presensi"  element={<ProtectedRoute><Layout><PenilaianPresensi /></Layout></ProtectedRoute>} />
      <Route path="/penilaian-bps"       element={<ProtectedRoute><Layout><PenilaianBps /></Layout></ProtectedRoute>} />
      <Route path="/laporan"            element={<ProtectedRoute><Layout><Laporan /></Layout></ProtectedRoute>} />
      <Route path="/employee-of-month" element={<ProtectedRoute><Layout><EmployeeOfMonth /></Layout></ProtectedRoute>} />
      <Route path="/tim"                element={<ProtectedRoute><Layout><Tim /></Layout></ProtectedRoute>} />
      <Route path="*"                   element={<Navigate to="/" />} />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}
