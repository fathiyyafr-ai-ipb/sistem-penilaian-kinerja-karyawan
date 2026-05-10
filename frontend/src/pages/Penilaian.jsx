import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import { LineChart, Line, XAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { Pencil, Trash2, Plus } from 'lucide-react';

const trendData = [
  { b:'Jan',n:72 }, { b:'Feb',n:75 }, { b:'Mar',n:74 },
  { b:'Apr',n:78 }, { b:'Mei',n:80 }, { b:'Jun',n:85 },
];

const emptyForm = {
  user_id: '', speed_score: '', quality_score: '',
  contribution_score: '', discipline_score: '', notes: '', periode: ''
};

export default function Penilaian() {
  const { user }                    = useAuth();
  const [reviews, setReviews]       = useState([]);
  const [users, setUsers]           = useState([]);
  const [periode, setPeriode]       = useState('');
  const [showModal, setShowModal]   = useState(false);
  const [form, setForm]             = useState(emptyForm);
  const [editingId, setEditingId]   = useState(null);

  const isKetuaTim = user?.role === 'ketua_tim';
  const isKasubag  = user?.role === 'kasubag';
  const isKepala   = user?.role === 'kepala_bps';
  const isPegawai  = user?.role === 'pegawai';

  const fetchData = async () => {
    const [rRes] = await Promise.all([api.get('/reviews')]);
    setReviews(rRes.data);
    if (!isPegawai) {
      try { const uRes = await api.get('/users'); setUsers(uRes.data.filter(u => u.role === 'pegawai')); } catch {}
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await api.put(`/reviews/${editingId}`, form);
      } else {
        const endpoint = isKetuaTim ? '/reviews/stage1' : '/reviews/stage2';
        await api.post(endpoint, { ...form, periode: form.periode || new Date().toISOString().slice(0, 7) });
      }
      setShowModal(false);
      setForm(emptyForm);
      setEditingId(null);
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || 'Gagal menyimpan penilaian');
    }
  };

  const handleEdit = (r) => {
    setEditingId(r.id);
    setForm({
      user_id: r.user_id,
      speed_score: r.speed_score || '',
      quality_score: r.quality_score || '',
      contribution_score: r.contribution_score || '',
      discipline_score: r.discipline_score || '',
      notes: r.notes || '',
      periode: r.periode || ''
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!confirm('Hapus penilaian ini?')) return;
    try {
      await api.delete(`/reviews/${id}`);
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || 'Gagal menghapus penilaian');
    }
  };

  const handleValidate = async (ids) => {
    if (!confirm('Validasi penilaian yang dipilih?')) return;
    try {
      await api.post('/reviews/validate', { review_ids: ids, periode });
      fetchData();
    } catch (err) { alert(err.response?.data?.message || 'Gagal validasi'); }
  };

  const statusBadge = (s) => {
    const m = { draft: 'bg-gray-200 text-gray-600', submitted: 'bg-yellow-100 text-yellow-700', validated: 'bg-green-100 text-green-700' };
    return <span className={`text-xs px-3 py-1 rounded-full ${m[s] || ''}`}>{s}</span>;
  };

  const filtered = reviews.filter(r => !periode || r.periode === periode);

  return (
    <div className="space-y-6">
      {/* Info pegawai yang dinilai */}
      {isPegawai && (
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white rounded-xl p-5 shadow-sm">
            <h3 className="font-semibold text-gray-600 mb-3">Pegawai yang Dinilai</h3>
            <div className="flex items-start gap-4">
              <div className="flex-1">
                {[['Nama', user?.name], ['NIP', user?.nip || '-'], ['Pangkat', user?.pangkat || '-'], ['Jabatan', user?.jabatan || '-'], ['Unit Kerja', user?.unit_kerja || '-']].map(([l, v]) => (
                  <p key={l} className="text-sm py-0.5">
                    <span className="text-gray-500 w-28 inline-block">{l}</span>
                    : <span className="font-medium">{v}</span>
                  </p>
                ))}
              </div>
              <div className="w-16 h-16 bg-gray-300 rounded-full flex items-center justify-center text-xl font-bold text-gray-600">
                {user?.name?.charAt(0)}
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-5 shadow-sm">
            <h3 className="font-semibold text-gray-600 mb-2">Tren Nilai (Jan-Jun)</h3>
            <ResponsiveContainer width="100%" height={130}>
              <LineChart data={trendData}>
                <Line type="monotone" dataKey="n" stroke="#3b82f6" strokeWidth={2} dot={{ r: 3 }} />
                <XAxis dataKey="b" tick={{ fontSize: 10 }} />
                <Tooltip />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Tabel penilaian */}
      <div className="bg-white rounded-xl p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="bg-gray-100 border border-gray-300 px-4 py-2 rounded-lg font-semibold text-sm">Periode</div>
            <input type="month" value={periode} onChange={e => setPeriode(e.target.value)}
              className="border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-300" />
          </div>
          {(isKetuaTim || isKasubag) && (
            <button onClick={() => { setShowModal(true); setForm(emptyForm); setEditingId(null); }}
              className="flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg text-sm transition">
              <Plus className="w-4 h-4" />
              {isKetuaTim ? 'Nilai Tahap 1' : 'Nilai Tahap 2'}
            </button>
          )}
        </div>

        <div className="overflow-x-auto border border-gray-100 rounded-xl">
          <table className="w-full text-sm border-collapse bg-white">
            <thead>
              <tr className="bg-[#f0f7ff]">
                {['NO','NIP','NAMA PEGAWAI','JABATAN','TAHAP','NILAI TOTAL','STATUS','AKSI'].map(h => (
                  <th key={h} className={`px-6 py-4 text-left text-[11px] font-extrabold text-[#2563eb] uppercase tracking-wider border-b border-gray-100 ${h === 'AKSI' ? 'text-center' : ''}`}>
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
                      {statusBadge(r.status)}
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex justify-center items-center gap-3">
                      {isKepala && r.status === 'submitted' && (
                        <button onClick={() => handleValidate([r.id])}
                          className="bg-green-600 hover:bg-green-700 text-white text-[10px] font-bold px-3 py-1.5 rounded-lg shadow-sm transition">
                          VALIDASI
                        </button>
                      )}
                      {!isPegawai && (
                        <>
                          <button onClick={() => handleEdit(r)} className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition">
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button onClick={() => handleDelete(r.id)} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={8} className="text-center py-16 text-gray-400 italic font-medium">Belum ada data penilaian</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal penilaian */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-sm shadow-xl">
            <h3 className="font-bold text-lg mb-4">
              {editingId ? 'Edit Penilaian' : (isKetuaTim ? 'Penilaian Tahap 1' : 'Penilaian Tahap 2')}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label className="text-xs font-medium text-gray-600">Pegawai *</label>
                <select value={form.user_id} onChange={e => setForm({ ...form, user_id: e.target.value })} required
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm mt-1 outline-none">
                  <option value="">-- Pilih Pegawai --</option>
                  {users.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                </select>
              </div>

              {isKetuaTim && (
                <>
                  {[['Kecepatan (0-100)','speed_score'], ['Kualitas (0-100)','quality_score'], ['Kontribusi (0-100)','contribution_score']].map(([l, k]) => (
                    <div key={k}>
                      <label className="text-xs font-medium text-gray-600">{l} *</label>
                      <input type="number" min="0" max="100" required value={form[k]}
                        onChange={e => setForm({ ...form, [k]: e.target.value })}
                        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm mt-1 outline-none focus:ring-2 focus:ring-blue-300" />
                    </div>
                  ))}
                </>
              )}

              {isKasubag && (
                <div>
                  <label className="text-xs font-medium text-gray-600">Nilai Disiplin (0-100) *</label>
                  <input type="number" min="0" max="100" required value={form.discipline_score}
                    onChange={e => setForm({ ...form, discipline_score: e.target.value })}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm mt-1 outline-none focus:ring-2 focus:ring-blue-300" />
                </div>
              )}

              <div>
                <label className="text-xs font-medium text-gray-600">Periode *</label>
                <input type="month" required value={form.periode}
                  onChange={e => setForm({ ...form, periode: e.target.value })}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm mt-1 outline-none focus:ring-2 focus:ring-blue-300" />
              </div>

              <div>
                <label className="text-xs font-medium text-gray-600">Catatan</label>
                <textarea value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm mt-1 outline-none h-16 resize-none focus:ring-2 focus:ring-blue-300" />
              </div>

              <div className="flex gap-3">
                <button type="button" onClick={() => setShowModal(false)}
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
