import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { LineChart, Line, XAxis, Tooltip, ResponsiveContainer } from 'recharts';

const personalTrendData = [
  { b: 'Jan', n: 72 }, { b: 'Feb', n: 75 }, { b: 'Mar', n: 74 },
  { b: 'Apr', n: 78 }, { b: 'Mei', n: 80 }, { b: 'Jun', n: 85 },
];

const attendanceTrendData = [
  { b: 'Jan', v: 60 }, { b: 'Feb', v: 65 }, { b: 'Mar', v: 63 },
  { b: 'Apr', v: 70 }, { b: 'Mei', v: 75 }, { b: 'Jun', v: 82 },
];

const TEAM_COLORS = ['bg-cyan-400', 'bg-blue-500', 'bg-orange-400', 'bg-pink-500'];

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
    <span className={`${color} text-white text-xs px-3 py-1 rounded-full font-medium shadow-sm`}>
      Due: {days} days left
    </span>
  );
}

export default function Home() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activities, setActivities] = useState([]);
  const [progress,   setProgress]   = useState([]);
  const [attendance, setAttendance] = useState(null);
  const [eom,        setEom]        = useState(null);
  const [teams,      setTeams]      = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [showProgress, setShowProgress] = useState(null);
  const [progressForm, setProgressForm] = useState({ activity_id: '', progress_percentage: '', notes: '' });

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [aRes, pRes, attRes, eomRes, tRes] = await Promise.all([
          api.get('/activities'),
          api.get('/progress'),
          api.get('/attendance'),
          api.get('/employee-of-month'),
          api.get('/teams'),
        ]);
        setActivities(aRes.data || []);
        setProgress(pRes.data || []);
        setAttendance(attRes.data[0] || null);
        setEom(eomRes.data[0] || null); // ambil peringkat 1
        setTeams(tRes.data || []);
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
      const [aRes, pRes] = await Promise.all([
        api.get('/activities'),
        api.get('/progress'),
      ]);
      setActivities(aRes.data);
      setProgress(pRes.data);
    } catch (err) { alert(err.response?.data?.message || 'Gagal menyimpan progress'); }
  };

  const getProgressPct = (actId) => {
    const act = activities.find(a => a.id === actId);
    return act ? act.total_progress : 0;
  };

  const getTeamProgress = (teamId) => {
    const teamActs = activities.filter(a => a.team_id === teamId);
    if (!teamActs.length) return 0;
    const total = teamActs.reduce((sum, a) => {
      return sum + parseFloat(a.total_progress || 0);
    }, 0);
    return Math.round(total / teamActs.length);
  };

  if (loading) return <div className="text-center py-20 text-gray-400">Memuat data...</div>;

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="bg-white rounded-xl p-6 border-l-4 border-blue-500 shadow-sm">
        <h1 className="text-2xl font-bold text-gray-800">Selamat Datang, {user?.name}!</h1>
        <p className="text-gray-500 text-sm mt-1">{user?.jabatan} — {user?.unit_kerja}</p>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-3 gap-6">
        
        {/* Kiri: Monitoring Kegiatan Tim & Daftar Tugas */}
        <div className="col-span-2 space-y-6">
          
          {/* Progres Kegiatan Tim */}
          <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-150">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-semibold text-gray-700">Progres Kegiatan Tim</h2>
              <span className="text-xs text-gray-400 font-normal">Pemantauan kumulatif kinerja tim</span>
            </div>
            <div className="space-y-4">
              {teams.map((team, i) => {
                const prog = getTeamProgress(team.id);
                return (
                  <div key={team.id} className="flex items-center gap-4 pb-2 border-b border-gray-50 last:border-0 last:pb-0">
                    <div className="w-24 text-sm font-semibold text-gray-650 truncate" title={team.team_name}>
                      {team.team_name}
                    </div>
                    <div className="flex-1 bg-gray-100 rounded-full h-4 relative">
                      <div 
                        className={`${TEAM_COLORS[i % 4]} h-4 rounded-full transition-all duration-700`} 
                        style={{ width: `${prog}%` }} 
                      />
                    </div>
                    <span className="text-xs font-bold text-gray-600 w-10 text-right">{prog}%</span>
                    <button 
                      onClick={() => navigate('/kegiatan')}
                      className="text-xs px-3 py-1 bg-blue-50 text-blue-600 border border-blue-200 rounded-full hover:bg-blue-100 whitespace-nowrap transition-all font-medium animate-pulse hover:animate-none"
                    >
                      Detail
                    </button>
                    <div className="flex items-center gap-2 min-w-0 flex-shrink-0">
                      <div className="w-7 h-7 bg-gray-300 rounded-full flex-shrink-0 flex items-center justify-center text-xs font-bold text-gray-600">
                        {team.leader_name?.charAt(0) || '?'}
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-semibold truncate leading-tight w-16 text-gray-800">{team.leader_name || '-'}</p>
                        <p className="text-[9px] text-gray-400">Ketua</p>
                      </div>
                    </div>
                  </div>
                );
              })}
              {teams.length === 0 && <p className="text-gray-400 text-sm italic">Belum ada tim terdaftar</p>}
            </div>
          </div>

          {/* Daftar Tugas Terkini */}
          <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-150">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-gray-700">Daftar Tugas Terkini</h2>
              <span className="text-xs text-gray-400 font-normal">Kegiatan dan penugasan aktif</span>
            </div>
            <div className="bg-gray-50 rounded-xl p-4 space-y-4">
              {activities.length === 0 ? (
                <p className="text-gray-400 text-sm italic text-center py-4">Belum ada tugas yang ditugaskan</p>
              ) : (
                activities.slice(0, 4).map(act => (
                  <div key={act.id} className="pb-3 border-b border-gray-200 last:border-0 last:pb-0">
                    <div className="flex items-center justify-between mb-2">
                      <div className="min-w-0 flex-1 pr-4">
                        <span className="text-sm font-semibold text-gray-750 block truncate text-gray-800" title={act.title}>
                          {act.title}
                        </span>
                        {act.team_name && (
                          <span className="text-[10px] bg-blue-50 text-blue-600 px-2 py-0.5 rounded font-medium mt-1 inline-block">
                            {act.team_name}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <DeadlineBadge days={act.days_left ?? 7} />
                        {user?.role === 'pegawai' ? (
                          <a href="/kegiatan" className="bg-blue-500 hover:bg-blue-600 text-white text-xs px-3 py-1.5 rounded-full font-medium transition shadow-sm">
                            Unggah Bukti
                          </a>
                        ) : (
                          <button 
                            onClick={() => { setProgressForm({ activity_id: act.id, progress_percentage: '', notes: '' }); setShowProgress(act); }}
                            className="bg-blue-500 hover:bg-blue-600 text-white text-xs px-3 py-1.5 rounded-full font-medium transition shadow-sm">
                            Update
                          </button>
                        )}
                      </div>
                    </div>
                    <ProgressBar value={getProgressPct(act.id)} />
                  </div>
                ))
              )}
            </div>
          </div>

        </div>

        {/* Kanan / Sidebar: Presensi, EOM, Hasil Penilaian, Analitik Kehadiran */}
        <div className="space-y-6">
          
          {/* Presensi */}
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-150">
            <h3 className="font-semibold text-gray-700 mb-3 text-sm">Presensi Bulanan</h3>
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
                <p>Kehadiran: <b className="text-gray-800">{attendance?.hadir ?? 22}/22</b></p>
                <p>Terlambat: <b className="text-gray-850">{attendance?.terlambat ?? 0}x</b></p>
                <p>Rapat: <b className="text-gray-850">{attendance?.hadir_rapat ?? 0}x</b></p>
                <p>Upacara: <b className="text-gray-850">{attendance?.hadir_upacara ?? 0}x</b></p>
              </div>
            </div>
          </div>

          {/* Employee of Month */}
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-150">
            <h3 className="font-semibold text-gray-700 mb-3 text-sm">🏆 Employee of the Month</h3>
            <div className="flex flex-col items-center">
              <div className="relative">
                <div className={`w-14 h-14 rounded-full flex items-center justify-center font-bold text-lg ${
                  eom ? 'bg-gradient-to-br from-yellow-400 to-amber-500 text-white shadow-lg shadow-yellow-200'
                       : 'bg-gray-200 text-gray-500'
                }`}>
                  {eom ? eom.name?.charAt(0) : '?'}
                </div>
                {eom && (
                  <span className="absolute -top-1 -right-1 bg-yellow-400 text-xs rounded-full w-6 h-6 flex items-center justify-center font-bold shadow border border-white">👑</span>
                )}
              </div>
              {eom ? (
                <>
                  <p className="text-sm font-bold mt-2 text-center text-gray-800">{eom.name}</p>
                  <p className="text-xs text-gray-450 text-center">{eom.jabatan || '-'}</p>
                  <p className="text-lg font-black text-yellow-600 mt-1">{eom.total_score}</p>
                  <p className="text-xs text-gray-400">Periode: {eom.period}</p>
                </>
              ) : (
                <p className="text-sm mt-2 text-center text-gray-405">Belum ditentukan</p>
              )}
              <a href="/employee-of-month"
                className="mt-3 text-xs text-blue-500 hover:text-blue-700 font-medium transition underline underline-offset-2">
                Lihat Selengkapnya →
              </a>
            </div>
          </div>

          {/* Hasil Penilaian */}
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-150">
            <div className="mb-2">
              <h3 className="font-semibold text-gray-700 text-sm">Hasil Penilaian</h3>
              <p className="text-[10px] text-gray-400 mt-0.5">Tren nilai bulanan personal Anda</p>
            </div>
            <ResponsiveContainer width="100%" height={100}>
              <LineChart data={personalTrendData}>
                <Line type="monotone" dataKey="n" stroke="#3b82f6" strokeWidth={2} dot={{ r: 3 }} />
                <XAxis dataKey="b" tick={{ fontSize: 9, fill: '#64748b' }} />
                <Tooltip />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Tren & Distribusi Kehadiran Umum */}
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-150 space-y-4">
            <div>
              <h3 className="font-semibold text-gray-700 text-sm">Analitik Kehadiran Pegawai</h3>
              <p className="text-[10px] text-gray-400 mt-0.5">Tren & distribusi tingkat kehadiran kantor</p>
            </div>
            <ResponsiveContainer width="100%" height={80}>
              <LineChart data={attendanceTrendData}>
                <Line type="monotone" dataKey="v" stroke="#10b981" strokeWidth={2} dot={{ r: 3 }} />
                <XAxis dataKey="b" tick={{ fontSize: 9, fill: '#64748b' }} />
                <Tooltip />
              </LineChart>
            </ResponsiveContainer>

            <div className="pt-3 border-t border-gray-100">
              <h4 className="font-semibold text-gray-650 text-[11px] mb-1.5">Distribusi Kehadiran Periode Ini</h4>
              <div className="space-y-1.5 text-[11px] text-gray-650">
                {[
                  ['Sangat Baik', '60%', '17 Staf', 'text-green-600'],
                  ['Baik',        '20%', '8 Staf',  'text-blue-600'],
                  ['Cukup',       '5%',  '1 Staf',  'text-yellow-600'],
                  ['Kurang',      '15%', '2 Staf',  'text-red-600'],
                ].map(([label, pct, count, cls]) => (
                  <div key={label} className="flex justify-between items-center">
                    <span className={`font-semibold ${cls}`}>{label}</span>
                    <span className="text-gray-500 font-medium">{pct} ({count})</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

        </div>

      </div>

      {/* Modal update progress */}
      {showProgress && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-sm shadow-xl animate-in fade-in zoom-in-95 duration-150">
            <h3 className="font-bold text-lg text-gray-800 mb-1">Update Progress</h3>
            <p className="text-sm text-gray-500 mb-4">{showProgress.title}</p>
            <form onSubmit={handleProgressUpdate} className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-gray-600">Progress (0 - 100%) *</label>
                <input 
                  type="number" 
                  min="0" 
                  max="100" 
                  required 
                  value={progressForm.progress_percentage}
                  onChange={e => setProgressForm({ ...progressForm, progress_percentage: e.target.value })}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm mt-1 outline-none focus:ring-2 focus:ring-blue-300 transition-all" 
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-600">Catatan</label>
                <textarea 
                  value={progressForm.notes}
                  onChange={e => setProgressForm({ ...progressForm, notes: e.target.value })}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm mt-1 outline-none h-16 resize-none focus:ring-2 focus:ring-blue-300 transition-all" 
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button 
                  type="button" 
                  onClick={() => setShowProgress(null)}
                  className="flex-1 border border-gray-300 rounded-lg py-2 text-sm font-semibold hover:bg-gray-50 transition"
                >
                  Batal
                </button>
                <button 
                  type="submit"
                  className="flex-1 bg-blue-600 text-white rounded-lg py-2 text-sm font-semibold hover:bg-blue-700 transition shadow-md shadow-blue-100"
                >
                  Simpan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
