import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import { LineChart, Line, XAxis, Tooltip, ResponsiveContainer } from 'recharts';

const trendData = [
  { b: 'Jan', n: 72 }, { b: 'Feb', n: 75 }, { b: 'Mar', n: 74 },
  { b: 'Apr', n: 78 }, { b: 'Mei', n: 80 }, { b: 'Jun', n: 85 },
];

function ProgressBar({ value }) {
  const color = value >= 80 ? 'bg-green-500' : value >= 50 ? 'bg-yellow-400' : 'bg-orange-400';
  return (
    <div className="w-full bg-gray-200 rounded-full h-3 mt-2">
      <div className={`${color} h-3 rounded-full transition-all duration-500`} style={{ width: `${value}%` }} />
    </div>
  );
}

function DeadlineBadge({ days }) {
  const color = days <= 2 ? 'bg-red-500' : days <= 5 ? 'bg-orange-400' : 'bg-yellow-400';
  return (
    <span className={`${color} text-white text-xs px-3 py-1 rounded-full font-medium`}>
      Due: {days} days left
    </span>
  );
}

export default function Home() {
  const { user } = useAuth();
  const [activities, setActivities] = useState([]);
  const [progress,   setProgress]   = useState([]);
  const [attendance, setAttendance] = useState(null);
  const [eom,        setEom]        = useState(null);
  const [loading,    setLoading]    = useState(true);
  const [showProgress, setShowProgress] = useState(null);
  const [progressForm, setProgressForm] = useState({ activity_id: '', progress_percentage: '', notes: '' });

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [aRes, pRes, attRes, eomRes] = await Promise.all([
          api.get('/activities'),
          api.get('/progress'),
          api.get('/attendance'),
          api.get('/employee-of-month'),
        ]);
        setActivities(aRes.data.slice(0, 3));
        setProgress(pRes.data);
        setAttendance(attRes.data[0] || null);
        setEom(eomRes.data[0] || null); // ambil peringkat 1
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, [user]);

  const handleProgressUpdate = async (e) => {
    e.preventDefault();
    try {
      await api.post('/progress', progressForm);
      setShowProgress(null);
      // Refresh progress data
      const pRes = await api.get('/progress');
      setProgress(pRes.data);
    } catch (err) { alert(err.response?.data?.message || 'Gagal menyimpan progress'); }
  };

  const getProgressPct = (actId) => {
    const act = activities.find(a => a.id === actId);
    return act ? act.total_progress : 0;
  };

  if (loading) return <div className="text-center py-20 text-gray-400">Memuat data...</div>;

  return (
    <div>
      {/* Banner */}
      <div className="bg-white rounded-xl p-6 mb-6 border-l-4 border-blue-500 shadow-sm">
        <h1 className="text-2xl font-bold text-gray-800">Selamat Datang, {user?.name}!</h1>
        <p className="text-gray-500 text-sm mt-1">{user?.jabatan} — {user?.unit_kerja}</p>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Kiri: Daftar tugas */}
        <div className="col-span-2 bg-white rounded-xl p-5 shadow-sm">
          <h2 className="font-semibold text-gray-700 mb-4">Monitoring</h2>
          <div className="bg-gray-50 rounded-xl p-4 space-y-5">
            <h3 className="font-semibold text-gray-600">Daftar Tugas</h3>
            {activities.length === 0
              ? <p className="text-gray-400 text-sm">Belum ada tugas yang ditugaskan</p>
              : activities.map(act => (
                <div key={act.id}>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">{act.title}</span>
                    <div className="flex items-center gap-2">
                      <DeadlineBadge days={act.days_left ?? 7} />
                      {user?.role === 'pegawai' ? (
                        <a href="/kegiatan" className="bg-blue-500 hover:bg-blue-600 text-white text-xs px-3 py-1 rounded-full transition">
                          Unggah Bukti
                        </a>
                      ) : (
                        <button 
                          onClick={() => { setProgressForm({ activity_id: act.id, progress_percentage: '', notes: '' }); setShowProgress(act); }}
                          className="bg-blue-500 hover:bg-blue-600 text-white text-xs px-3 py-1 rounded-full transition">
                          Update
                        </button>
                      )}
                    </div>
                  </div>
                  <ProgressBar value={getProgressPct(act.id)} />
                </div>
              ))
            }
          </div>
        </div>

        {/* Kanan: Info cards */}
        <div className="space-y-4">
          {/* Presensi */}
          <div className="bg-white rounded-xl p-4 shadow-sm">
            <h3 className="font-semibold text-gray-700 mb-3">Presensi Bulanan</h3>
            <div className="flex items-center gap-4">
              <div className="relative w-16 h-16 flex-shrink-0">
                <svg viewBox="0 0 64 64" className="w-16 h-16 -rotate-90">
                  <circle cx="32" cy="32" r="26" fill="none" stroke="#e5e7eb" strokeWidth="6" />
                  <circle cx="32" cy="32" r="26" fill="none" stroke="#22c55e" strokeWidth="6"
                    strokeDasharray={`${2 * Math.PI * 26}`}
                    strokeDashoffset={`${2 * Math.PI * 26 * (1 - (attendance?.hadir || 22) / 22)}`} />
                </svg>
                <span className="absolute inset-0 flex items-center justify-center text-xs font-bold text-gray-700 rotate-90">
                  {attendance ? Math.round((attendance.hadir / 22) * 100) : 100}%
                </span>
              </div>
              <div className="text-xs space-y-1 text-gray-600">
                <p>Kehadiran: <b>{attendance?.hadir ?? 22}/22</b></p>
                <p>Terlambat: <b>{attendance?.terlambat ?? 0}x</b></p>
                <p>Rapat: <b>{attendance?.hadir_rapat ?? 0}x</b></p>
                <p>Upacara: <b>{attendance?.hadir_upacara ?? 0}x</b></p>
              </div>
            </div>
          </div>

          {/* Employee of Month */}
          <div className="bg-white rounded-xl p-4 shadow-sm">
            <h3 className="font-semibold text-gray-700 mb-3">🏆 Employee of the Month</h3>
            <div className="flex flex-col items-center">
              <div className="relative">
                <div className={`w-14 h-14 rounded-full flex items-center justify-center font-bold text-lg ${
                  eom ? 'bg-gradient-to-br from-yellow-400 to-amber-500 text-white shadow-lg shadow-yellow-200'
                       : 'bg-gray-200 text-gray-500'
                }`}>
                  {eom ? eom.name?.charAt(0) : '?'}
                </div>
                {eom && (
                  <span className="absolute -top-1 -right-1 bg-yellow-400 text-xs rounded-full w-6 h-6 flex items-center justify-center font-bold shadow">👑</span>
                )}
              </div>
              {eom ? (
                <>
                  <p className="text-sm font-bold mt-2 text-center text-gray-800">{eom.name}</p>
                  <p className="text-xs text-gray-400 text-center">{eom.jabatan || '-'}</p>
                  <p className="text-lg font-black text-yellow-600 mt-1">{eom.total_score}</p>
                  <p className="text-xs text-gray-400">Periode: {eom.period}</p>
                </>
              ) : (
                <p className="text-sm mt-2 text-center text-gray-400">Belum ditentukan</p>
              )}
              <a href="/employee-of-month"
                className="mt-3 text-xs text-blue-500 hover:text-blue-700 font-medium transition underline underline-offset-2">
                Lihat Selengkapnya →
              </a>
            </div>
          </div>

          {/* Tren Nilai */}
          <div className="bg-white rounded-xl p-4 shadow-sm">
            <h3 className="font-semibold text-gray-700 mb-2">Hasil Penilaian</h3>
            <p className="text-xs text-gray-400 mb-1">Tren Nilai (Jan-Jun)</p>
            <ResponsiveContainer width="100%" height={80}>
              <LineChart data={trendData}>
                <Line type="monotone" dataKey="n" stroke="#3b82f6" strokeWidth={2} dot={{ r: 3 }} />
                <XAxis dataKey="b" tick={{ fontSize: 10 }} />
                <Tooltip />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Modal update progress */}
      {showProgress && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-sm shadow-xl">
            <h3 className="font-bold text-lg mb-1">Update Progress</h3>
            <p className="text-sm text-gray-500 mb-4">{showProgress.title}</p>
            <form onSubmit={handleProgressUpdate} className="space-y-3">
              <div>
                <label className="text-xs font-medium text-gray-600">Progress (0 - 100%) *</label>
                <input type="number" min="0" max="100" required value={progressForm.progress_percentage}
                  onChange={e => setProgressForm({ ...progressForm, progress_percentage: e.target.value })}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm mt-1 outline-none focus:ring-2 focus:ring-blue-300" />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-600">Catatan</label>
                <textarea value={progressForm.notes}
                  onChange={e => setProgressForm({ ...progressForm, notes: e.target.value })}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm mt-1 outline-none h-16 resize-none focus:ring-2 focus:ring-blue-300" />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowProgress(null)}
                  className="flex-1 border border-gray-300 rounded-lg py-2 text-sm hover:bg-gray-50">Batal</button>
                <button type="submit"
                  className="flex-1 bg-blue-600 text-white rounded-lg py-2 text-sm hover:bg-blue-700">Simpan</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
