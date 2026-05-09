import { useEffect, useState } from 'react';
import api from '../utils/api';
import { LineChart, Line, XAxis, Tooltip, ResponsiveContainer } from 'recharts';

const trendData = [
  { b: 'Jan', v: 60 }, { b: 'Feb', v: 65 }, { b: 'Mar', v: 63 },
  { b: 'Apr', v: 70 }, { b: 'Mei', v: 75 }, { b: 'Jun', v: 82 },
];
const TEAM_COLORS = ['bg-cyan-400', 'bg-blue-500', 'bg-orange-400', 'bg-pink-500'];

export default function Monitoring() {
  const [teams,      setTeams]      = useState([]);
  const [activities, setActivities] = useState([]);
  const [progress,   setProgress]   = useState([]);
  const [showProgress, setShowProgress] = useState(null);
  const [progressForm, setProgressForm] = useState({ activity_id: '', progress_percentage: '', notes: '' });

  useEffect(() => {
    const fetchAll = async () => {
      const [tRes, aRes, pRes] = await Promise.all([
        api.get('/teams'),
        api.get('/activities'),
        api.get('/progress'),
      ]);
      setTeams(tRes.data);
      setActivities(aRes.data);
      setProgress(pRes.data);
    };
    fetchAll();
  }, []);

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

  const getTeamProgress = (teamId) => {
    const teamActs = activities.filter(a => a.team_id === teamId);
    if (!teamActs.length) return 0;
    const total = teamActs.reduce((sum, a) => {
      const p = progress.find(p => p.activity_id === a.id);
      return sum + (p ? p.progress_percentage : 0);
    }, 0);
    return Math.round(total / teamActs.length);
  };

  return (
    <div className="space-y-6">
      {/* Progres tim */}
      <div className="bg-white rounded-xl p-6 shadow-sm">
        <h2 className="font-semibold text-gray-700 mb-5">Progres Kegiatan Tim</h2>
        <div className="space-y-4">
          {teams.map((team, i) => {
            const prog = getTeamProgress(team.id);
            return (
              <div key={team.id} className="flex items-center gap-4">
                <div className="w-24 text-sm text-gray-600 truncate">{team.team_name}</div>
                <div className="flex-1 bg-gray-100 rounded-full h-4">
                  <div className={`${TEAM_COLORS[i % 4]} h-4 rounded-full transition-all`} style={{ width: `${prog}%` }} />
                </div>
                <span className="text-xs text-gray-500 w-10 text-right">{prog}%</span>
                <button className="text-xs px-3 py-1 border border-gray-300 rounded-full hover:bg-gray-50 whitespace-nowrap">
                  Detail Tugas
                </button>
                <button className="text-xs px-3 py-1 bg-blue-500 text-white rounded-full hover:bg-blue-600 whitespace-nowrap">
                  Update
                </button>
                <div className="flex items-center gap-2 min-w-0">
                  <div className="w-7 h-7 bg-gray-300 rounded-full flex-shrink-0 flex items-center justify-center text-xs font-bold text-gray-600">
                    {team.leader_name?.charAt(0) || '?'}
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-medium truncate">{team.leader_name || '-'}</p>
                    <p className="text-xs text-gray-400">Ketua Tim</p>
                  </div>
                </div>
              </div>
            );
          })}
          {teams.length === 0 && <p className="text-gray-400 text-sm">Belum ada tim</p>}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6">
        {/* Daftar tugas dengan progress */}
        <div className="bg-white rounded-xl p-5 shadow-sm">
          <h3 className="font-semibold text-gray-700 mb-4">Daftar Tugas</h3>
          <div className="space-y-4">
            {activities.slice(0, 4).map(act => {
              const p   = progress.find(p => p.activity_id === act.id);
              const pct = p?.progress_percentage || 0;
              const barColor = pct >= 80 ? 'bg-green-500' : pct >= 40 ? 'bg-yellow-400' : 'bg-orange-400';
              return (
                <div key={act.id}>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700 truncate flex-1 mr-2">{act.title}</span>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className={`text-white text-xs px-2 py-1 rounded-full whitespace-nowrap ${
                        (act.days_left ?? 7) <= 2 ? 'bg-red-500' : (act.days_left ?? 7) <= 5 ? 'bg-orange-400' : 'bg-yellow-400'
                      }`}>Due: {act.days_left ?? 7}d</span>
                      <button 
                        onClick={() => { setProgressForm({ activity_id: act.id, progress_percentage: '', notes: '' }); setShowProgress(act); }}
                        className="bg-blue-500 text-white text-xs px-3 py-1 rounded-full hover:bg-blue-600">
                        Update
                      </button>
                    </div>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3 mt-2">
                    <div className={`${barColor} h-3 rounded-full`} style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
            {activities.length === 0 && <p className="text-gray-400 text-sm">Belum ada kegiatan</p>}
          </div>
        </div>

        {/* Presensi & statistik */}
        <div className="bg-white rounded-xl p-5 shadow-sm">
          <h3 className="font-semibold text-gray-700 mb-3">Tren Kehadiran</h3>
          <ResponsiveContainer width="100%" height={100}>
            <LineChart data={trendData}>
              <Line type="monotone" dataKey="v" stroke="#3b82f6" strokeWidth={2} dot={{ r: 3 }} />
              <XAxis dataKey="b" tick={{ fontSize: 10 }} />
              <Tooltip />
            </LineChart>
          </ResponsiveContainer>

          <h4 className="font-medium text-gray-600 mt-4 mb-2 text-sm">Distribusi Tingkat Kehadiran</h4>
          <div className="space-y-1 text-sm">
            {[
              ['Sangat Baik', '60%', '17 Orang', 'text-green-600'],
              ['Baik',        '20%', '8 Orang',  'text-blue-600'],
              ['Cukup',       '5%',  '1 Orang',  'text-yellow-600'],
              ['Kurang',      '15%', '2 Orang',  'text-red-600'],
            ].map(([label, pct, count, cls]) => (
              <div key={label} className="flex justify-between items-center">
                <span className={`font-medium ${cls}`}>{label}</span>
                <span className="text-gray-600">{pct} ({count})</span>
              </div>
            ))}
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
