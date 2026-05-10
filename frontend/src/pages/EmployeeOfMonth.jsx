import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import { Trophy, Medal, Star, Award, ChevronDown, CheckCircle, Trash2, RefreshCw, Crown } from 'lucide-react';

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
        <span className="font-bold text-gray-700">{value ?? '-'}</span>
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
  const isKepala = user?.role === 'kepala_bps' || user?.role === 'admin';

  const [period, setPeriod]       = useState(new Date().toISOString().slice(0, 7));
  const [ranking, setRanking]     = useState([]);
  const [eomList, setEomList]     = useState([]);
  const [loading, setLoading]     = useState(false);
  const [loadingDet, setLoadingDet] = useState(false);
  const [msg, setMsg]             = useState(null); // { type: 'success'|'error', text }

  const showMsg = (type, text) => {
    setMsg({ type, text });
    setTimeout(() => setMsg(null), 4000);
  };

  const loadEom = async () => {
    try {
      const res = await api.get(`/employee-of-month?period=${period}`);
      setEomList(res.data);
    } catch {}
  };

  const loadRanking = async () => {
    if (!isKepala) return;
    setLoading(true);
    try {
      const res = await api.get(`/employee-of-month/ranking?period=${period}`);
      setRanking(res.data);
    } catch (err) {
      showMsg('error', err.response?.data?.message || 'Gagal memuat ranking');
    } finally { setLoading(false); }
  };

  useEffect(() => {
    loadEom();
    if (isKepala) loadRanking();
  }, [period]);

  const handleDetermine = async () => {
    if (!confirm(`Tentukan Employee of the Month untuk periode ${period}? Data sebelumnya akan diganti.`)) return;
    setLoadingDet(true);
    try {
      await api.post('/employee-of-month/determine', { period });
      await loadEom();
      showMsg('success', 'Employee of the Month berhasil ditentukan!');
    } catch (err) {
      showMsg('error', err.response?.data?.message || 'Gagal menentukan EOM');
    } finally { setLoadingDet(false); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Hapus data Employee of the Month ini?')) return;
    try {
      await api.delete(`/employee-of-month/${id}`);
      await loadEom();
      showMsg('success', 'Data berhasil dihapus');
    } catch (err) {
      showMsg('error', err.response?.data?.message || 'Gagal menghapus');
    }
  };

  const top3 = eomList.slice(0, 3);
  const winner = top3[0];

  return (
    <div className="space-y-6">
      {/* ── Header ── */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-extrabold text-gray-800 flex items-center gap-2">
            <Trophy className="w-7 h-7 text-yellow-500" /> Employee of the Month
          </h2>
          <p className="text-sm text-gray-500 mt-0.5">
            {isKepala ? 'Lihat ranking, analisa, dan tentukan pegawai terbaik periode ini' : 'Pegawai terbaik periode ini'}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <input type="month" value={period} onChange={e => setPeriod(e.target.value)}
              className="border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-yellow-300 bg-white appearance-none pr-10" />
            <ChevronDown className="absolute right-3 top-3 w-4 h-4 text-gray-400 pointer-events-none" />
          </div>
          {isKepala && (
            <button onClick={loadRanking} disabled={loading}
              className="flex items-center gap-2 bg-white border border-gray-200 hover:bg-gray-50 text-gray-600 px-4 py-2.5 rounded-xl text-sm font-medium transition shadow-sm">
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} /> Hitung Ulang
            </button>
          )}
          {isKepala && (
            <button onClick={handleDetermine} disabled={loadingDet || ranking.length === 0}
              className="flex items-center gap-2 bg-gradient-to-r from-yellow-500 to-amber-500 hover:from-yellow-600 hover:to-amber-600 text-white px-5 py-2.5 rounded-xl text-sm font-bold transition shadow-lg shadow-yellow-200 disabled:opacity-50">
              <Crown className="w-4 h-4" /> {loadingDet ? 'Memproses...' : 'Tetapkan EOM'}
            </button>
          )}
        </div>
      </div>

      {/* ── Toast ── */}
      {msg && (
        <div className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium ${
          msg.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-red-50 text-red-700 border border-red-200'
        }`}>
          {msg.type === 'success' ? <CheckCircle className="w-4 h-4 flex-shrink-0" /> : <span className="text-red-500">✕</span>}
          {msg.text}
        </div>
      )}

      {/* ── Podium Winner (jika sudah ditetapkan) ── */}
      {top3.length > 0 && (
        <div className="bg-gradient-to-br from-yellow-50 via-amber-50 to-orange-50 border border-yellow-200 rounded-2xl p-6">
          <div className="flex items-center gap-2 mb-6">
            <Trophy className="w-5 h-5 text-yellow-500" />
            <h3 className="font-bold text-gray-800">Hasil Penetapan — Periode {period}</h3>
            {isKepala && <span className="ml-auto text-xs text-gray-400">Divalidasi oleh {top3[0]?.validated_by_name || 'Kepala BPS'}</span>}
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

          {/* Hapus tombol per baris */}
          {isKepala && (
            <div className="flex justify-center gap-3 mt-2">
              {top3.map(e => (
                <button key={e.id} onClick={() => handleDelete(e.id)}
                  className="flex items-center gap-1 text-xs text-red-400 hover:text-red-600 hover:bg-red-50 px-3 py-1 rounded-lg transition">
                  <Trash2 className="w-3 h-3" /> Hapus {e.name}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {top3.length === 0 && !isKepala && (
        <div className="bg-white rounded-2xl p-16 text-center border border-gray-100 shadow-sm">
          <Trophy className="w-16 h-16 text-gray-200 mx-auto mb-4" />
          <p className="text-gray-400 font-medium">Belum ada Employee of the Month untuk periode ini</p>
        </div>
      )}

      {/* ── Tabel Ranking (hanya kepala_bps) ── */}
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
              Belum ada penilaian tervalidasi untuk periode {period}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-slate-50">
                    {['Rank','Pegawai','Jabatan','Penilai','Kecepatan','Kualitas','Kontribusi','Tgg.Jawab','Nilai Akhir'].map(h => (
                      <th key={h} className="px-4 py-3 text-left text-[11px] font-extrabold text-slate-500 uppercase tracking-wide border-b border-slate-100">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {ranking.map((r, i) => (
                    <tr key={r.user_id} className={`transition-colors ${i < 3 ? 'hover:bg-yellow-50/40' : 'hover:bg-slate-50/50'}`}>
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
                            {r.name?.charAt(0)}
                          </div>
                          <div>
                            <p className="font-bold text-gray-800">{r.name}</p>
                            <p className="text-[11px] font-mono text-gray-400">{r.nip || '-'}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4 text-gray-600 text-xs">{r.jabatan || '-'}</td>
                      <td className="px-4 py-4">
                        <span className="bg-blue-50 text-blue-600 text-xs px-2 py-0.5 rounded-full font-bold border border-blue-100">
                          {r.jumlah_penilai}x
                        </span>
                      </td>
                      <td className="px-4 py-4 font-bold text-gray-700">{r.avg_speed}</td>
                      <td className="px-4 py-4 font-bold text-gray-700">{r.avg_quality}</td>
                      <td className="px-4 py-4 font-bold text-gray-700">{r.avg_contribution}</td>
                      <td className="px-4 py-4 font-bold text-gray-700">{r.avg_responsibility}</td>
                      <td className="px-4 py-4">
                        <div className={`flex items-center gap-2 font-extrabold text-lg
                          ${i === 0 ? 'text-yellow-600' : i === 1 ? 'text-gray-600' : i === 2 ? 'text-orange-600' : 'text-blue-600'}`}>
                          {r.final_score}
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
              <div key={r.user_id} className={`bg-white rounded-2xl p-5 border-2 ${cfg.border} shadow-sm`}>
                <div className="flex items-center gap-3 mb-4">
                  <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${cfg.bg} flex items-center justify-center text-white font-black text-xl`}>
                    {r.name?.charAt(0)}
                  </div>
                  <div>
                    <p className={`text-xs font-bold ${cfg.text}`}>{cfg.label}</p>
                    <p className="font-bold text-gray-800 text-sm leading-tight">{r.name}</p>
                    <p className="text-xs text-gray-400">{r.jabatan}</p>
                  </div>
                </div>
                <div className="space-y-2.5 mb-4">
                  <ScoreBar label="Kecepatan"   value={r.avg_speed}           color="bg-blue-500" />
                  <ScoreBar label="Kualitas"     value={r.avg_quality}         color="bg-violet-500" />
                  <ScoreBar label="Kontribusi"   value={r.avg_contribution}    color="bg-emerald-500" />
                  <ScoreBar label="Tgg. Jawab"   value={r.avg_responsibility}  color="bg-amber-500" />
                </div>
                <div className={`flex justify-between items-center bg-gradient-to-r ${cfg.bg} rounded-xl px-4 py-3`}>
                  <span className="text-white text-sm font-bold opacity-90">Nilai Akhir</span>
                  <span className="text-white font-black text-2xl">{r.final_score}</span>
                </div>
                <p className="text-center text-xs text-gray-400 mt-2">Dari {r.jumlah_penilai} penilaian</p>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
