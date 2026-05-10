import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import { Link } from 'react-router-dom';
import { Trophy } from 'lucide-react';

export default function Laporan() {
  const { user }                  = useAuth();
  const [reviews, setReviews]     = useState([]);
  const [eom,     setEom]         = useState([]);
  const [periode, setPeriode]     = useState('');

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [rRes, eRes] = await Promise.all([
          api.get('/reviews'),
          api.get('/employee-of-month'),
        ]);
        setReviews(rRes.data);
        setEom(eRes.data);
      } catch {}
    };
    fetchAll();
  }, []);

  const filtered = reviews.filter(r => !periode || r.periode === periode);

  const statusBadge = (s) => {
    const cfg = s === 'tervalidasi'
      ? 'bg-emerald-50 text-emerald-600 border-emerald-100'
      : 'bg-amber-50 text-amber-600 border-amber-100';
    const label = s === 'tervalidasi' ? '✓ Tervalidasi' : '⏳ Menunggu';
    return <span className={`text-[10px] font-extrabold uppercase tracking-wider px-3 py-1 rounded-full border ${cfg}`}>{label}</span>;
  };

  return (
    <div className="space-y-6">
      {/* ── Filter periode ── */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-extrabold text-gray-800">Laporan Kinerja</h2>
          <p className="text-sm text-gray-500 mt-0.5">Rekap seluruh data penilaian kinerja pegawai</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-500 font-medium">Periode</span>
          <input type="month" value={periode} onChange={e => setPeriode(e.target.value)}
            className="border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-300 bg-white" />
        </div>
      </div>

      {/* ── Tabel Penilaian ── */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
        <div className="px-6 py-4 border-b border-gray-100">
          <h3 className="font-bold text-gray-700">Rekap Penilaian Kinerja</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-[#f0f7ff]">
                {['No','NIP','Nama Pegawai','Jabatan','Penilai','Nilai Total','Periode','Status'].map(h => (
                  <th key={h} className="px-6 py-4 text-left text-[11px] font-extrabold text-[#2563eb] uppercase tracking-wider border-b border-gray-100">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map((r, i) => (
                <tr key={r.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-4 text-gray-400 font-medium">{i + 1}</td>
                  <td className="px-6 py-4 font-mono text-[11px] text-gray-500 font-bold">{r.nip || '-'}</td>
                  <td className="px-6 py-4 font-bold text-gray-800">{r.user_name}</td>
                  <td className="px-6 py-4 text-gray-600 text-xs">{r.jabatan || '-'}</td>
                  <td className="px-6 py-4 text-gray-600 text-xs">{r.reviewer_name}</td>
                  <td className="px-6 py-4">
                    <span className="font-extrabold text-blue-600 text-base">{r.total_score}</span>
                  </td>
                  <td className="px-6 py-4 text-gray-500 text-xs">{r.periode}</td>
                  <td className="px-6 py-4">{statusBadge(r.status)}</td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={8} className="text-center py-16 text-gray-400 italic">Belum ada data laporan untuk periode ini</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Employee of the Month Banner ── */}
      {eom.length > 0 && (
        <div className="bg-gradient-to-br from-yellow-50 via-amber-50 to-orange-50 border border-yellow-200 rounded-2xl p-6">
          <div className="flex items-center gap-2 mb-5">
            <Trophy className="w-5 h-5 text-yellow-500" />
            <h3 className="font-bold text-gray-800">🏆 Employee of the Month</h3>
            <Link to="/employee-of-month"
              className="ml-auto text-xs text-blue-500 hover:text-blue-700 font-medium underline underline-offset-2">
              Lihat Detail Ranking →
            </Link>
          </div>
          <div className="grid grid-cols-3 gap-4">
            {eom.slice(0, 3).map((e, i) => (
              <div key={e.id} className={`rounded-2xl p-5 text-center border-2 ${
                i === 0 ? 'bg-white border-yellow-300 shadow-lg shadow-yellow-100'
                : i === 1 ? 'bg-white border-gray-200 shadow'
                : 'bg-white border-orange-200 shadow'
              }`}>
                <div className="relative inline-block mb-2">
                  <div className={`w-16 h-16 rounded-full flex items-center justify-center text-xl font-black text-white ${
                    i === 0 ? 'bg-gradient-to-br from-yellow-400 to-amber-500'
                    : i === 1 ? 'bg-gradient-to-br from-slate-400 to-gray-500'
                    : 'bg-gradient-to-br from-orange-400 to-amber-600'
                  }`}>
                    {e.name?.charAt(0)}
                  </div>
                  <span className={`absolute -top-1 -right-1 rounded-full w-7 h-7 flex items-center justify-center text-xs font-black text-white shadow ${
                    i === 0 ? 'bg-yellow-500' : i === 1 ? 'bg-gray-400' : 'bg-orange-400'
                  }`}>
                    {i === 0 ? '👑' : i + 1}
                  </span>
                </div>
                <p className="font-bold text-gray-800 text-sm leading-tight">{e.name}</p>
                <p className="text-xs text-gray-500 mt-0.5">{e.jabatan}</p>
                <p className="text-2xl font-black text-blue-600 mt-2">{e.total_score}</p>
                <p className="text-xs text-gray-400">Periode: {e.period}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
