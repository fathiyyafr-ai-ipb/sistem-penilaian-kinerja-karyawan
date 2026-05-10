import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import { Plus, Pencil, Trash2, CheckCircle, Eye, X, ClipboardList } from 'lucide-react';

const EMPTY_FORM = {
  user_id: '', speed_score: '', quality_score: '',
  contribution_score: '', responsibility_score: '',
  reviewer_notes: '', periode: ''
};

const SCORE_FIELDS = [
  { key: 'speed_score',          label: 'Kecepatan Pengerjaan' },
  { key: 'quality_score',        label: 'Kualitas Pekerjaan' },
  { key: 'contribution_score',   label: 'Kontribusi Tim' },
  { key: 'responsibility_score', label: 'Tanggung Jawab' },
];

function avg(f) {
  const vals = SCORE_FIELDS.map(s => +f[s.key]).filter(v => !isNaN(v) && v !== 0);
  if (vals.length < 4) return '-';
  return (vals.reduce((a, b) => a + b, 0) / 4).toFixed(2);
}

function StatusBadge({ status }) {
  const cfg = status === 'tervalidasi'
    ? 'bg-emerald-100 text-emerald-700 border-emerald-200'
    : 'bg-amber-100 text-amber-700 border-amber-200';
  const label = status === 'tervalidasi' ? '✓ Tervalidasi' : '⏳ Menunggu Validasi';
  return <span className={`text-[11px] font-bold px-3 py-1 rounded-full border ${cfg}`}>{label}</span>;
}

export default function Penilaian() {
  const { user } = useAuth();
  const [reviews, setReviews]           = useState([]);
  const [subordinates, setSubordinates] = useState([]);
  const [periode, setPeriode]           = useState('');
  const [showModal, setShowModal]       = useState(false);
  const [showDetail, setShowDetail]     = useState(null);
  const [showEditKepala, setShowEditKepala] = useState(null);
  const [form, setForm]                 = useState(EMPTY_FORM);
  const [editingId, setEditingId]       = useState(null);
  const [kepalaEdit, setKepalaEdit]     = useState({ kepala_notes: '', speed_score: '', quality_score: '', contribution_score: '', responsibility_score: '' });
  const [loading, setLoading]           = useState(false);

  const isAtasan  = ['ketua_tim','kasubag','admin'].includes(user?.role);
  const isKepala  = user?.role === 'kepala_bps';
  const isPegawai = user?.role === 'pegawai';

  const load = async () => {
    try {
      const rRes = await api.get('/reviews');
      setReviews(rRes.data);
    } catch (err) {
      console.error('Failed to load reviews:', err);
    }

    if (isAtasan) {
      try {
        const sRes = await api.get('/reviews/subordinates');
        setSubordinates(sRes.data);
      } catch (err) {
        console.error('Failed to load subordinates:', err);
      }
    }
  };

  useEffect(() => { load(); }, []);

  const openAdd = () => { setEditingId(null); setForm(EMPTY_FORM); setShowModal(true); };
  const openEdit = (r) => {
    setEditingId(r.id);
    setForm({
      user_id: r.user_id, speed_score: r.speed_score || '',
      quality_score: r.quality_score || '', contribution_score: r.contribution_score || '',
      responsibility_score: r.responsibility_score || '',
      reviewer_notes: r.reviewer_notes || '', periode: r.periode || ''
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.user_id) return alert('Pilih pegawai terlebih dahulu');
    setLoading(true);
    try {
      if (editingId) {
        await api.put(`/reviews/${editingId}`, form);
      } else {
        await api.post('/reviews', { ...form, periode: form.periode || new Date().toISOString().slice(0,7) });
      }
      setShowModal(false); load();
    } catch (err) {
      alert(err.response?.data?.message || 'Gagal menyimpan');
    } finally { setLoading(false); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Hapus penilaian ini?')) return;
    try { await api.delete(`/reviews/${id}`); load(); }
    catch (err) { alert(err.response?.data?.message || 'Gagal menghapus'); }
  };

  const handleValidate = async (id) => {
    if (!confirm('Validasi penilaian ini?')) return;
    try { await api.post(`/reviews/${id}/validate`); load(); }
    catch (err) { alert(err.response?.data?.message || 'Gagal validasi'); }
  };

  const handleKepalaEdit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.put(`/reviews/${showEditKepala.id}`, {
        ...kepalaEdit,
        periode: showEditKepala.periode
      });
      setShowEditKepala(null); load();
    } catch (err) {
      alert(err.response?.data?.message || 'Gagal memperbarui');
    } finally { setLoading(false); }
  };

  const openKepalaEdit = (r) => {
    setKepalaEdit({
      kepala_notes: r.kepala_notes || '',
      speed_score: r.speed_score || '',
      quality_score: r.quality_score || '',
      contribution_score: r.contribution_score || '',
      responsibility_score: r.responsibility_score || '',
    });
    setShowEditKepala(r);
  };

  const filtered = reviews.filter(r => !periode || r.periode === periode);

  const totalAll        = filtered.length;
  const totalValidated  = filtered.filter(r => r.status === 'tervalidasi').length;
  const totalPending    = filtered.filter(r => r.status === 'menunggu_validasi').length;

  return (
    <div className="space-y-6">
      {/* ── HEADER ── */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-extrabold text-gray-800">Penilaian Kinerja</h2>
          <p className="text-sm text-gray-500 mt-0.5">
            {isPegawai ? 'Hasil penilaian kinerja Anda' : isKepala ? 'Validasi seluruh penilaian dari atasan' : 'Buat dan kelola penilaian pegawai Anda'}
          </p>
        </div>
        {isAtasan && (
          <button onClick={openAdd}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl text-sm font-semibold shadow transition">
            <Plus className="w-4 h-4" /> Beri Penilaian
          </button>
        )}
      </div>

      {/* ── STAT CARDS (kepala & atasan) ── */}
      {!isPegawai && (
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: 'Total Penilaian',       val: totalAll,       color: 'from-blue-500 to-blue-600' },
            { label: 'Menunggu Validasi',      val: totalPending,   color: 'from-amber-400 to-orange-500' },
            { label: 'Sudah Tervalidasi',      val: totalValidated, color: 'from-emerald-500 to-teal-600' },
          ].map(c => (
            <div key={c.label} className={`bg-gradient-to-br ${c.color} rounded-2xl p-5 text-white shadow-lg`}>
              <p className="text-sm font-medium opacity-80">{c.label}</p>
              <p className="text-4xl font-black mt-1">{c.val}</p>
            </div>
          ))}
        </div>
      )}

      {/* ── PEGAWAI: kartu hasil ── */}
      {isPegawai && filtered.length === 0 && (
        <div className="bg-white rounded-2xl p-16 text-center shadow-sm border border-gray-100">
          <ClipboardList className="w-14 h-14 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-400 font-medium">Belum ada hasil penilaian yang tervalidasi</p>
        </div>
      )}

      {isPegawai && filtered.map(r => (
        <div key={r.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4 flex items-center justify-between">
            <div>
              <p className="text-white font-bold text-lg">Periode {r.periode}</p>
              <p className="text-blue-100 text-sm">Dinilai oleh: {r.reviewer_name} ({r.reviewer_jabatan || r.reviewer_role})</p>
            </div>
            <StatusBadge status={r.status} />
          </div>
          <div className="p-6 grid grid-cols-2 gap-4">
            {SCORE_FIELDS.map(s => (
              <div key={s.key} className="bg-gray-50 rounded-xl p-4">
                <p className="text-xs text-gray-500 font-medium">{s.label}</p>
                <p className="text-3xl font-black text-blue-600 mt-1">{r[s.key] ?? '-'}</p>
              </div>
            ))}
            <div className="col-span-2 bg-blue-50 rounded-xl p-4 flex items-center justify-between">
              <p className="text-sm font-bold text-blue-700">Nilai Rata-Rata</p>
              <p className="text-4xl font-black text-blue-700">{r.total_score}</p>
            </div>
            {r.reviewer_notes && (
              <div className="col-span-2 bg-gray-50 rounded-xl p-4">
                <p className="text-xs font-semibold text-gray-500 mb-1">Catatan Penilai</p>
                <p className="text-sm text-gray-700">{r.reviewer_notes}</p>
              </div>
            )}
            {r.kepala_notes && (
              <div className="col-span-2 bg-emerald-50 border border-emerald-200 rounded-xl p-4">
                <p className="text-xs font-semibold text-emerald-600 mb-1">Catatan Kepala BPS</p>
                <p className="text-sm text-emerald-800">{r.kepala_notes}</p>
              </div>
            )}
          </div>
        </div>
      ))}

      {/* ── TABEL PENILAIAN (atasan & kepala) ── */}
      {!isPegawai && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
            <h3 className="font-bold text-gray-700">Daftar Penilaian</h3>
            <input type="month" value={periode} onChange={e => setPeriode(e.target.value)}
              className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm outline-none focus:ring-2 focus:ring-blue-300" />
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50">
                  {['No','Pegawai','Jabatan','Penilai','Kec','Kua','Kont','TJ','Rata-rata','Periode','Status','Aksi'].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-[11px] font-extrabold text-slate-500 uppercase tracking-wide border-b border-slate-100">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map((r, i) => (
                  <tr key={r.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="px-4 py-4 text-gray-400 font-medium">{i+1}</td>
                    <td className="px-4 py-4">
                      <p className="font-bold text-gray-800">{r.user_name}</p>
                      <p className="text-[11px] text-gray-400 font-mono">{r.nip || '-'}</p>
                    </td>
                    <td className="px-4 py-4 text-gray-600 text-xs">{r.jabatan || '-'}</td>
                    <td className="px-4 py-4 text-gray-600 text-xs">{r.reviewer_name}</td>
                    <td className="px-4 py-4 font-bold text-gray-700">{r.speed_score}</td>
                    <td className="px-4 py-4 font-bold text-gray-700">{r.quality_score}</td>
                    <td className="px-4 py-4 font-bold text-gray-700">{r.contribution_score}</td>
                    <td className="px-4 py-4 font-bold text-gray-700">{r.responsibility_score}</td>
                    <td className="px-4 py-4">
                      <span className="text-blue-600 font-extrabold text-base">{r.total_score}</span>
                    </td>
                    <td className="px-4 py-4 text-gray-500 text-xs">{r.periode}</td>
                    <td className="px-4 py-4"><StatusBadge status={r.status} /></td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-1.5">
                        <button onClick={() => setShowDetail(r)}
                          className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition" title="Detail">
                          <Eye className="w-4 h-4" />
                        </button>
                        {/* Ketua/Kasubag: edit & hapus jika belum tervalidasi dan milik sendiri */}
                        {isAtasan && r.reviewer_id === user?.id && r.status !== 'tervalidasi' && (
                          <>
                            <button onClick={() => openEdit(r)}
                              className="p-1.5 text-gray-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition" title="Edit">
                              <Pencil className="w-4 h-4" />
                            </button>
                            <button onClick={() => handleDelete(r.id)}
                              className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition" title="Hapus">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </>
                        )}
                        {/* Kepala BPS */}
                        {isKepala && r.status === 'menunggu_validasi' && (
                          <>
                            <button onClick={() => openKepalaEdit(r)}
                              className="p-1.5 text-gray-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition" title="Edit & Catatan">
                              <Pencil className="w-4 h-4" />
                            </button>
                            <button onClick={() => handleValidate(r.id)}
                              className="flex items-center gap-1 bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-bold px-2.5 py-1.5 rounded-lg transition" title="Validasi">
                              <CheckCircle className="w-3 h-3" /> Validasi
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr><td colSpan={12} className="text-center py-16 text-gray-400 italic">Belum ada data penilaian</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── MODAL: Buat / Edit Penilaian (Atasan) ── */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl flex flex-col max-h-[95vh]">
            <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-gray-100 flex-shrink-0">
              <h3 className="font-bold text-lg text-gray-800">{editingId ? 'Edit Penilaian' : 'Beri Penilaian'}</h3>
              <button onClick={() => setShowModal(false)} className="p-1 hover:bg-gray-100 rounded-lg">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            <div className="overflow-y-auto p-6">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="text-xs font-semibold text-gray-600">Pegawai *</label>
                  <select value={form.user_id} onChange={e => setForm({...form, user_id: e.target.value})} required
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm mt-1 outline-none focus:ring-2 focus:ring-blue-300">
                    <option value="">-- Pilih Pegawai --</option>
                    {subordinates.map(u => <option key={u.id} value={u.id}>{u.name} {u.jabatan ? `(${u.jabatan})` : ''}</option>)}
                  </select>
                </div>
                {SCORE_FIELDS.map(s => (
                  <div key={s.key}>
                    <label className="text-xs font-semibold text-gray-600">{s.label} (0–100) *</label>
                    <input type="number" min="0" max="100" required value={form[s.key]}
                      onChange={e => setForm({...form, [s.key]: e.target.value})}
                      className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm mt-1 outline-none focus:ring-2 focus:ring-blue-300" />
                  </div>
                ))}
                {/* Preview rata-rata */}
                <div className="bg-blue-50 rounded-xl px-4 py-3 flex justify-between items-center">
                  <span className="text-sm font-semibold text-blue-700">Nilai Rata-Rata</span>
                  <span className="text-2xl font-black text-blue-700">{avg(form)}</span>
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-600">Catatan Penilai</label>
                  <textarea value={form.reviewer_notes} onChange={e => setForm({...form, reviewer_notes: e.target.value})}
                    rows={3} className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm mt-1 outline-none focus:ring-2 focus:ring-blue-300 resize-none" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-600">Periode *</label>
                  <input type="month" required value={form.periode} onChange={e => setForm({...form, periode: e.target.value})}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm mt-1 outline-none focus:ring-2 focus:ring-blue-300" />
                </div>
                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={() => setShowModal(false)}
                    className="flex-1 border border-gray-200 rounded-xl py-2.5 text-sm font-medium hover:bg-gray-50 transition">Batal</button>
                  <button type="submit" disabled={loading}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white rounded-xl py-2.5 text-sm font-bold transition disabled:opacity-50">
                    {loading ? 'Menyimpan...' : 'Simpan'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL: Edit & Catatan Kepala BPS ── */}
      {showEditKepala && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl">
            <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-gray-100">
              <div>
                <h3 className="font-bold text-lg text-gray-800">Revisi Penilaian</h3>
                <p className="text-xs text-gray-400">{showEditKepala.user_name} — Periode {showEditKepala.periode}</p>
              </div>
              <button onClick={() => setShowEditKepala(null)} className="p-1 hover:bg-gray-100 rounded-lg">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            <form onSubmit={handleKepalaEdit} className="p-6 space-y-4">
              {SCORE_FIELDS.map(s => (
                <div key={s.key}>
                  <label className="text-xs font-semibold text-gray-600">{s.label} (0–100)</label>
                  <input type="number" min="0" max="100" value={kepalaEdit[s.key]}
                    onChange={e => setKepalaEdit({...kepalaEdit, [s.key]: e.target.value})}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm mt-1 outline-none focus:ring-2 focus:ring-blue-300" />
                </div>
              ))}
              <div className="bg-blue-50 rounded-xl px-4 py-3 flex justify-between items-center">
                <span className="text-sm font-semibold text-blue-700">Rata-Rata Baru</span>
                <span className="text-2xl font-black text-blue-700">{avg(kepalaEdit)}</span>
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-600">Catatan Kepala BPS</label>
                <textarea value={kepalaEdit.kepala_notes} onChange={e => setKepalaEdit({...kepalaEdit, kepala_notes: e.target.value})}
                  rows={3} placeholder="Tambahkan catatan revisi (opsional)..."
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm mt-1 outline-none focus:ring-2 focus:ring-blue-300 resize-none" />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowEditKepala(null)}
                  className="flex-1 border border-gray-200 rounded-xl py-2.5 text-sm font-medium hover:bg-gray-50 transition">Batal</button>
                <button type="submit" disabled={loading}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white rounded-xl py-2.5 text-sm font-bold transition disabled:opacity-50">
                  {loading ? 'Menyimpan...' : 'Simpan Revisi'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── MODAL: Detail Penilaian ── */}
      {showDetail && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-t-2xl px-6 py-5 flex items-center justify-between">
              <div>
                <h3 className="text-white font-bold text-lg">{showDetail.user_name}</h3>
                <p className="text-blue-100 text-sm">{showDetail.jabatan || '-'} • Periode {showDetail.periode}</p>
              </div>
              <button onClick={() => setShowDetail(null)} className="p-1.5 hover:bg-white/20 rounded-lg transition">
                <X className="w-5 h-5 text-white" />
              </button>
            </div>
            <div className="p-6 space-y-3">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-gray-500">Penilai: <b>{showDetail.reviewer_name}</b></span>
                <StatusBadge status={showDetail.status} />
              </div>
              {SCORE_FIELDS.map(s => (
                <div key={s.key} className="flex justify-between items-center bg-gray-50 rounded-xl px-4 py-3">
                  <span className="text-sm text-gray-600">{s.label}</span>
                  <span className="font-black text-gray-800 text-lg">{showDetail[s.key] ?? '-'}</span>
                </div>
              ))}
              <div className="flex justify-between items-center bg-blue-600 rounded-xl px-4 py-3">
                <span className="text-sm font-bold text-white">Nilai Rata-Rata</span>
                <span className="font-black text-white text-2xl">{showDetail.total_score}</span>
              </div>
              {showDetail.reviewer_notes && (
                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="text-xs font-bold text-gray-500 mb-1">Catatan Penilai</p>
                  <p className="text-sm text-gray-700">{showDetail.reviewer_notes}</p>
                </div>
              )}
              {showDetail.kepala_notes && (
                <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4">
                  <p className="text-xs font-bold text-emerald-600 mb-1">Catatan Kepala BPS</p>
                  <p className="text-sm text-emerald-800">{showDetail.kepala_notes}</p>
                </div>
              )}
              {showDetail.validated_by_name && (
                <p className="text-xs text-gray-400 text-center pt-1">
                  Divalidasi oleh <b>{showDetail.validated_by_name}</b> pada {new Date(showDetail.validated_at).toLocaleDateString('id-ID')}
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
