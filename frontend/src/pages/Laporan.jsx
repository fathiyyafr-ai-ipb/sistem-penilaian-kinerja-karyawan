import { useEffect, useState } from 'react';
import api from '../utils/api';
import { Download, Eye } from 'lucide-react';

export default function Laporan() {
  const [reviews, setReviews] = useState([]);
  const [eom,     setEom]     = useState([]);
  const [periode, setPeriode] = useState('');

  useEffect(() => {
    const fetchAll = async () => {
      const [rRes, eRes] = await Promise.all([api.get('/reviews'), api.get('/employee-of-month')]);
      setReviews(rRes.data);
      setEom(eRes.data);
    };
    fetchAll();
  }, []);

  const filtered = reviews.filter(r => !periode || r.periode === periode);

  return (
    <div className="space-y-6">
      {/* Laporan kinerja */}
      <div className="bg-white rounded-xl p-6 shadow-sm">
        <div className="flex items-center gap-3 mb-6">
          <div className="bg-gray-100 border border-gray-300 px-4 py-2 rounded-lg font-semibold text-sm">Periode</div>
          <input type="month" value={periode} onChange={e => setPeriode(e.target.value)}
            className="border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-300" />
        </div>

        <h3 className="font-semibold text-gray-700 mb-3">Laporan Kinerja Pegawai</h3>
        <div className="overflow-x-auto border border-gray-100 rounded-xl">
          <table className="w-full text-sm border-collapse bg-white">
            <thead>
              <tr className="bg-[#f0f7ff]">
                {['NO','NIP','NAMA PEGAWAI','JABATAN','TAHAP','NILAI','STATUS','AKSI'].map(h => (
                  <th key={h} className="px-6 py-4 text-left text-[11px] font-extrabold text-[#2563eb] uppercase tracking-wider border-b border-gray-100">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map((r, i) => (
                <tr key={r.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-5 text-gray-500 font-medium">{i + 1}</td>
                  <td className="px-6 py-5 font-mono text-[11px] text-gray-500 font-bold">{r.nip || '-'}</td>
                  <td className="px-6 py-5">
                    <span className="font-bold text-gray-700 text-sm">{r.user_name}</span>
                  </td>
                  <td className="px-6 py-5 text-[13px] text-gray-600 font-medium">{r.jabatan || '-'}</td>
                  <td className="px-6 py-5">
                    <span className="bg-blue-50 text-blue-600 text-[10px] px-2.5 py-1 rounded-full font-extrabold uppercase tracking-tight border border-blue-100">
                      Tahap {r.stage}
                    </span>
                  </td>
                  <td className="px-6 py-5">
                    <span className="font-extrabold text-[#3b82f6] text-base">{r.total_score}</span>
                  </td>
                  <td className="px-6 py-5">
                    <div className="w-fit">
                      <span className={`text-[10px] font-extrabold uppercase tracking-wider px-3 py-1.5 rounded-lg border flex items-center gap-1.5 ${
                        r.status === 'validated' ? 'bg-green-50 text-green-600 border-green-100' :
                        r.status === 'submitted' ? 'bg-yellow-50 text-yellow-600 border-yellow-100' :
                        'bg-gray-50 text-gray-600 border-gray-100'
                      }`}>
                        {r.status === 'validated' ? 'Selesai' : r.status === 'submitted' ? 'Proses' : 'Belum'}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex gap-2">
                      <button className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white text-[10px] font-bold px-3 py-2 rounded-lg shadow-sm transition">
                        <Download className="w-3.5 h-3.5" /> UNDUH
                      </button>
                      <button className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition border border-transparent hover:border-blue-100 bg-white">
                        <Eye className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={8} className="text-center py-16 text-gray-400 italic font-medium">Belum ada data laporan untuk periode ini</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Employee of the Month */}
      {eom.length > 0 && (
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <h3 className="font-semibold text-gray-700 mb-4">🏆 Employee of the Month</h3>
          <div className="grid grid-cols-3 gap-4">
            {eom.slice(0, 3).map((e, i) => (
              <div key={e.id} className={`rounded-xl p-5 text-center ${
                i === 0 ? 'bg-yellow-50 border-2 border-yellow-400' : 'bg-gray-50 border border-gray-200'
              }`}>
                <div className="relative inline-block">
                  <div className="w-16 h-16 bg-gray-300 rounded-full mx-auto flex items-center justify-center text-xl font-bold text-gray-600">
                    {e.name?.charAt(0)}
                  </div>
                  <span className={`absolute -top-1 -right-1 rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold text-white ${
                    i === 0 ? 'bg-yellow-500' : i === 1 ? 'bg-gray-400' : 'bg-orange-400'
                  }`}>{i + 1}</span>
                </div>
                <p className="font-semibold mt-2 text-sm">{e.name}</p>
                <p className="text-xs text-gray-500">{e.jabatan}</p>
                <p className="text-2xl font-bold text-blue-600 mt-1">{e.total_score}</p>
                <p className="text-xs text-gray-400">Total Nilai</p>
                <p className="text-xs text-gray-400 mt-1">Periode: {e.period}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
