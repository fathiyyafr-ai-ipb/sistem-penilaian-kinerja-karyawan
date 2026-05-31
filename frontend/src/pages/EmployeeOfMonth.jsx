import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import { Trophy, Medal, Crown, ChevronDown } from 'lucide-react';

const MEDAL_CFG = [
  { bg: 'from-yellow-400 to-amber-500',   border: 'border-yellow-300', text: 'text-yellow-600', label: '🥇 Terbaik 1', shadow: 'shadow-yellow-200' },
  { bg: 'from-slate-400 to-gray-500',     border: 'border-gray-300',   text: 'text-gray-600',   label: '🥈 Terbaik 2', shadow: 'shadow-gray-200' },
  { bg: 'from-orange-400 to-amber-600',   border: 'border-orange-300', text: 'text-orange-600', label: '🥉 Terbaik 3', shadow: 'shadow-orange-200' },
];

function ScoreBar({ label, value, color }) {
  return (
    <div>
      <div className="flex justify-between text-xs mb-1">
        <span className="text-gray-500">{label}</span>
        <span className="font-bold text-gray-700">{value ? parseFloat(value).toFixed(2) : '-'}</span>
      </div>
      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
        <div className={`h-2 rounded-full ${color} transition-all duration-700`} style={{ width: `${value ?? 0}%` }} />
      </div>
    </div>
  );
}

function RankBadge({ rank }) {
  const cfg = rank === 1 ? 'bg-yellow-100 text-yellow-700 border-yellow-300'
            : rank === 2 ? 'bg-gray-100 text-gray-600 border-gray-300'
            : rank === 3 ? 'bg-orange-100 text-orange-700 border-orange-300'
            : 'bg-blue-50 text-blue-600 border-blue-200';
  return (
    <span className={`inline-flex items-center justify-center w-7 h-7 rounded-full border-2 text-xs font-black ${cfg}`}>
      {rank}
    </span>
  );
}

export default function EmployeeOfMonth() {
  const { user } = useAuth();
  const isKepala = user?.role === 'kepala_bps' || user?.role === 'admin' || user?.role === 'kasubag' || user?.is_leader;

  const [period, setPeriod]       = useState('2026-Q2');
  const [ranking, setRanking]     = useState([]);
  const [eomList, setEomList]     = useState([]);
  const [loading, setLoading]     = useState(false);

  const loadEom = async () => {
    try {
      const res = await api.get(`/employee-of-month?period=${period}`);
      setEomList(res.data.map(item => ({
        id: item.id,
        name: item.name,
        jabatan: item.jabatan || 'Staf Pelaksana',
        total_score: item.total_score ? parseFloat(item.total_score).toFixed(2) : '0.00',
        period: item.period
      })));
    } catch (err) {
      console.error(err);
    }
  };

  const loadRanking = async () => {
    if (!isKepala) return;
    setLoading(true);
    try {
      const res = await api.get(`/assessments/bps/review?period=${period}`);
      // Sort reviews descending based on final score and keep only validated/published ones
      const validatedList = (res.data.review || [])
        .filter(emp => emp.validation_status === 'validated' || emp.validation_status === 'published')
        .sort((a, b) => b.final_score - a.final_score);
      setRanking(validatedList);
    } catch (err) {
      console.error(err);
    } finally { setLoading(false); }
  };

  useEffect(() => {
    loadEom();
    if (isKepala) loadRanking();
  }, [period]);

  const top3 = eomList.slice(0, 3);
  const winner = top3[0];

  return (
    <div className="space-y-6">
      {/* ── Header ── */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-extrabold text-gray-800 flex items-center gap-2">
            Employee of the Month
          </h2>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <select value={period} onChange={e => setPeriod(e.target.value)}
              className="border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-yellow-300 bg-white appearance-none pr-10 font-bold text-gray-700">
              <option value="2026-Q1">2026 - Kuartal I (Q1)</option>
              <option value="2026-Q2">2026 - Kuartal II (Q2)</option>
              <option value="2026-Q3">2026 - Kuartal III (Q3)</option>
              <option value="2026-Q4">2026 - Kuartal IV (Q4)</option>
            </select>
            <ChevronDown className="absolute right-3 top-3.5 w-4 h-4 text-gray-400 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* ── Podium Winner (jika sudah ditetapkan) ── */}
      {top3.length > 0 && (
        <div className="bg-gradient-to-br from-yellow-50 via-amber-50 to-orange-50 border border-yellow-200 rounded-2xl p-6">
          <div className="flex items-center gap-2 mb-6">
            <h3 className="font-bold text-gray-800">Podium Penghargaan — Kuartal {period.split('-Q')[1]} ({period})</h3>
          </div>

          {/* Podium layout */}
          <div className="flex items-end justify-center gap-4 mb-6">
            {/* 2nd place */}
            {top3[1] && (
              <div className="flex flex-col items-center gap-2 w-40">
                <div className="relative">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-slate-400 to-gray-500 flex items-center justify-center text-white text-2xl font-black shadow-lg">
                    {top3[1].name?.charAt(0)}
                  </div>
                  <span className="absolute -top-1 -right-1 w-6 h-6 bg-gray-400 rounded-full flex items-center justify-center text-xs text-white font-black">2</span>
                </div>
                <div className="text-center">
                  <p className="font-bold text-sm text-gray-800 leading-tight">{top3[1].name}</p>
                  <p className="text-xs text-gray-500">{top3[1].jabatan}</p>
                </div>
                <div className="bg-gray-400 text-white rounded-t-xl w-full flex flex-col items-center py-4 h-20 justify-center">
                  <span className="text-2xl font-black">{top3[1].total_score}</span>
                  <span className="text-xs opacity-80">Nilai</span>
                </div>
              </div>
            )}

            {/* 1st place */}
            {winner && (
              <div className="flex flex-col items-center gap-2 w-44 -mb-2">
                <div className="relative">
                  <div className="w-20 h-20 rounded-full bg-gradient-to-br from-yellow-400 to-amber-500 flex items-center justify-center text-white text-3xl font-black shadow-xl shadow-yellow-300">
                    {winner.name?.charAt(0)}
                  </div>
                  <span className="absolute -top-2 -right-1 w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center text-sm text-white font-black shadow">👑</span>
                </div>
                <div className="text-center">
                  <p className="font-extrabold text-gray-900 leading-tight">{winner.name}</p>
                  <p className="text-xs text-gray-500">{winner.jabatan}</p>
                </div>
                <div className="bg-gradient-to-br from-yellow-400 to-amber-500 text-white rounded-t-xl w-full flex flex-col items-center py-5 h-28 justify-center shadow-lg shadow-yellow-200">
                  <span className="text-3xl font-black">{winner.total_score}</span>
                  <span className="text-xs opacity-80">Nilai Akhir</span>
                </div>
              </div>
            )}

            {/* 3rd place */}
            {top3[2] && (
              <div className="flex flex-col items-center gap-2 w-40">
                <div className="relative">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-orange-400 to-amber-600 flex items-center justify-center text-white text-2xl font-black shadow-lg">
                    {top3[2].name?.charAt(0)}
                  </div>
                  <span className="absolute -top-1 -right-1 w-6 h-6 bg-orange-400 rounded-full flex items-center justify-center text-xs text-white font-black">3</span>
                </div>
                <div className="text-center">
                  <p className="font-bold text-sm text-gray-800 leading-tight">{top3[2].name}</p>
                  <p className="text-xs text-gray-500">{top3[2].jabatan}</p>
                </div>
                <div className="bg-orange-400 text-white rounded-t-xl w-full flex flex-col items-center py-3 h-16 justify-center">
                  <span className="text-2xl font-black">{top3[2].total_score}</span>
                  <span className="text-xs opacity-80">Nilai</span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {top3.length === 0 && (
        <div className="bg-white rounded-2xl p-16 text-center border border-gray-100 shadow-sm">
          <p className="text-gray-400 font-medium">Belum ada Employee of the Month yang dirilis pada periode ini</p>
        </div>
      )}

      {/* ── Tabel Ranking (Atasan & Admin) ── */}
      {isKepala && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Medal className="w-5 h-5 text-blue-500" />
              <h3 className="font-bold text-gray-800">Ranking Pegawai — Berdasarkan Penilaian Tervalidasi</h3>
            </div>
            <span className="text-xs text-gray-400">{ranking.length} pegawai ditemukan</span>
          </div>

          {loading ? (
            <div className="text-center py-16 text-gray-400">Menghitung ranking...</div>
          ) : ranking.length === 0 ? (
            <div className="text-center py-16 text-gray-400 italic">
              Belum ada penilaian tervalidasi/terpublikasi untuk periode {period}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-slate-50">
                    {['Rank','Pegawai','Jabatan','Kinerja','Perilaku','Presensi','Nilai Akhir'].map(h => (
                      <th key={h} className="px-4 py-3 text-left text-[11px] font-extrabold text-slate-500 uppercase tracking-wide border-b border-slate-100">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {ranking.map((r, i) => (
                    <tr key={r.employee_id} className={`transition-colors ${i < 3 ? 'hover:bg-yellow-50/40' : 'hover:bg-slate-50/50'}`}>
                      <td className="px-4 py-4">
                        <RankBadge rank={i + 1} />
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-9 h-9 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0
                            ${i === 0 ? 'bg-gradient-to-br from-yellow-400 to-amber-500'
                            : i === 1 ? 'bg-gradient-to-br from-slate-400 to-gray-500'
                            : i === 2 ? 'bg-gradient-to-br from-orange-400 to-amber-600'
                            : 'bg-gradient-to-br from-blue-400 to-indigo-500'}`}>
                            {r.employee_name?.charAt(0)}
                          </div>
                          <div>
                            <p className="font-bold text-gray-800">{r.employee_name}</p>
                            <p className="text-[11px] font-mono text-gray-400">{r.nip || '-'}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4 text-gray-600 text-xs">{r.jabatan || 'Staf Pelaksana'}</td>
                      <td className="px-4 py-4 font-bold text-gray-700">{r.kinerja_score ? r.kinerja_score.toFixed(2) : '-'}</td>
                      <td className="px-4 py-4 font-bold text-gray-700">{r.perilaku_score ? r.perilaku_score.toFixed(2) : '-'}</td>
                      <td className="px-4 py-4 font-bold text-gray-700">{r.presensi_score ? r.presensi_score.toFixed(2) : '-'}</td>
                      <td className="px-4 py-4">
                        <div className={`flex items-center gap-2 font-extrabold text-lg
                          ${i === 0 ? 'text-yellow-600' : i === 1 ? 'text-gray-600' : i === 2 ? 'text-orange-600' : 'text-blue-600'}`}>
                          {r.final_score ? r.final_score.toFixed(2) : '-'}
                          {i === 0 && <Crown className="w-4 h-4 text-yellow-500" />}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ── Detail Score Breakdown (kepala_bps, top 3) ── */}
      {isKepala && ranking.length > 0 && (
        <div className="grid grid-cols-3 gap-4">
          {ranking.slice(0, 3).map((r, i) => {
            const cfg = MEDAL_CFG[i];
            return (
              <div key={r.employee_id} className={`bg-white rounded-2xl p-5 border-2 ${cfg.border} shadow-sm`}>
                <div className="flex items-center gap-3 mb-4">
                  <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${cfg.bg} flex items-center justify-center text-white font-black text-xl`}>
                    {r.employee_name?.charAt(0)}
                  </div>
                  <div>
                    <p className={`text-xs font-bold ${cfg.text}`}>{cfg.label}</p>
                    <p className="font-bold text-gray-800 text-sm leading-tight">{r.employee_name}</p>
                    <p className="text-xs text-gray-400">{r.jabatan}</p>
                  </div>
                </div>
                <div className="space-y-2.5 mb-4">
                  <ScoreBar label="Kinerja"   value={r.kinerja_score}   color="bg-blue-500" />
                  <ScoreBar label="Perilaku"  value={r.perilaku_score}  color="bg-violet-500" />
                  <ScoreBar label="Presensi"  value={r.presensi_score}  color="bg-emerald-500" />
                </div>
                <div className={`flex justify-between items-center bg-gradient-to-r ${cfg.bg} rounded-xl px-4 py-3`}>
                  <span className="text-white text-sm font-bold opacity-90">Nilai Akhir</span>
                  <span className="text-white font-black text-2xl">{r.final_score ? r.final_score.toFixed(2) : '-'}</span>
                </div>
                <p className="text-center text-xs text-gray-400 mt-2">Divalidasi Pimpinan</p>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
