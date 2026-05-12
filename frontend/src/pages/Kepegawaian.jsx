import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import { Plus, Pencil, Trash2 } from 'lucide-react';

const emptyForm = {
  name: '', nip: '', email: '', password: '',
  role: 'pegawai', pangkat: '', jabatan: '', unit_kerja: ''
};

export default function Kepegawaian() {
  const { user }                    = useAuth();
  const [users, setUsers]           = useState([]);
  const [periode, setPeriode]       = useState('');
  const [showModal, setShowModal]   = useState(false);
  const [form, setForm]             = useState(emptyForm);
  const [editId, setEditId]         = useState(null);
  const [loading, setLoading]       = useState(false);

  const fetchUsers = async () => {
    try { const res = await api.get('/users'); setUsers(res.data); }
    catch (err) { console.error(err); }
  };

  useEffect(() => { fetchUsers(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (editId) await api.put(`/users/${editId}`, form);
      else        await api.post('/users', form);
      setShowModal(false);
      setForm(emptyForm);
      setEditId(null);
      fetchUsers();
    } catch (err) {
      alert(err.response?.data?.message || 'Terjadi kesalahan');
    } finally { setLoading(false); }
  };

  const handleEdit = (u) => {
    setForm({ ...u, password: '' });
    setEditId(u.id);
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!confirm('Hapus pegawai ini?')) return;
    try {
      await api.delete(`/users/${id}`);
      alert('Pegawai berhasil dihapus');
      fetchUsers();
    } catch (err) {
      alert(err.response?.data?.message || 'Gagal menghapus pegawai');
    }
  };

  const isAdmin = user?.role === 'admin';

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="bg-gray-100 border border-gray-300 px-4 py-2 rounded-lg font-semibold text-sm">Periode</div>
          <input type="month" value={periode} onChange={e => setPeriode(e.target.value)}
            className="border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-300" />
        </div>
        {isAdmin && (
          <button onClick={() => { setShowModal(true); setForm(emptyForm); setEditId(null); }}
            className="flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition">
            <Plus className="w-4 h-4" /> Tambah Pegawai Baru
          </button>
        )}
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="bg-blue-50">
              {['No','NIP','Nama Pegawai','Unit Kerja','Jabatan','Role','Status Penilaian','Aksi'].map(h => (
                <th key={h} className="px-3 py-3 text-left text-xs font-semibold text-gray-600 border border-blue-100">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {users.map((u, i) => (
              <tr key={u.id} className="hover:bg-gray-50 border-b border-gray-100">
                <td className="px-3 py-3 border border-gray-100">{i + 1}</td>
                <td className="px-3 py-3 border border-gray-100 font-mono text-xs">{u.nip || '-'}</td>
                <td className="px-3 py-3 border border-gray-100 font-medium">{u.name}</td>
                <td className="px-3 py-3 border border-gray-100">{u.unit_kerja || '-'}</td>
                <td className="px-3 py-3 border border-gray-100">{u.jabatan || '-'}</td>
                <td className="px-3 py-3 border border-gray-100">
                  <span className="bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded-full">{u.role}</span>
                </td>
                <td className="px-3 py-3 border border-gray-100">
                  <span className="bg-gray-200 text-gray-600 text-xs px-3 py-1 rounded-full">Belum</span>
                </td>
                <td className="px-3 py-3 border border-gray-100">
                  {isAdmin && (
                    <div className="flex gap-2">
                      <button onClick={() => handleEdit(u)} className="text-green-600 hover:text-green-800 transition">
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleDelete(u.id)} className="text-red-500 hover:text-red-700 transition">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
            {users.length === 0 && (
              <tr><td colSpan={8} className="text-center py-8 text-gray-400">Belum ada data pegawai</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modal tambah / edit */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-xl">
            <h3 className="font-bold text-lg mb-4">{editId ? 'Edit' : 'Tambah'} Pegawai</h3>
            <form onSubmit={handleSubmit} className="space-y-3">
              {[
                ['Nama Lengkap','name','text',true],
                ['NIP','nip','text',false],
                ['Email','email','email',true],
                ['Pangkat/Golongan','pangkat','text',false],
                ['Jabatan','jabatan','text',false],
                ['Unit Kerja','unit_kerja','text',false],
              ].map(([label, key, type, req]) => (
                <div key={key}>
                  <label className="text-xs font-medium text-gray-600">{label}{req && ' *'}</label>
                  <input type={type} value={form[key]} required={req}
                    onChange={e => setForm({ ...form, [key]: e.target.value })}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm mt-1 outline-none focus:ring-2 focus:ring-blue-300" />
                </div>
              ))}
              <div>
                <label className="text-xs font-medium text-gray-600">Password {editId && '(kosongkan jika tidak diubah)'}</label>
                <input type="password" value={form.password} required={!editId}
                  onChange={e => setForm({ ...form, password: e.target.value })}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm mt-1 outline-none focus:ring-2 focus:ring-blue-300" />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-600">Role</label>
                <select value={form.role} onChange={e => setForm({ ...form, role: e.target.value })}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm mt-1 outline-none">
                  {['admin','pegawai','ketua_tim','kasubag','kepala_bps'].map(r => (
                    <option key={r} value={r}>{r}</option>
                  ))}
                </select>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)}
                  className="flex-1 border border-gray-300 rounded-lg py-2 text-sm hover:bg-gray-50">Batal</button>
                <button type="submit" disabled={loading}
                  className="flex-1 bg-blue-600 text-white rounded-lg py-2 text-sm hover:bg-blue-700 disabled:opacity-60">
                  {loading ? 'Menyimpan...' : 'Simpan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
