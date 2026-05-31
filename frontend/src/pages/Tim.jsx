import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import { 
  Users, 
  Plus, 
  Pencil, 
  Trash2, 
  AlertCircle, 
  CheckCircle,
  X
} from 'lucide-react';
import { Navigate } from 'react-router-dom';

export default function Tim() {
  const { user } = useAuth();
  
  // State
  const [teams, setTeams] = useState([]);
  const [users, setUsers] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  
  // Modals
  const [showTeamModal, setShowTeamModal] = useState(false);
  const [editingTeamId, setEditingTeamId] = useState(null);
  const [teamForm, setTeamForm] = useState({ 
    team_name: '', 
    leader_id: '', 
    type: 'inti', 
    is_active: true, 
    members: [] 
  });
  
  // Filtering
  const [filterType, setFilterType] = useState('all'); // 'all', 'inti', 'adhoc'
  const [filterStatus, setFilterStatus] = useState('active'); // 'all', 'active', 'inactive'

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Permissions checking
  const isAdmin = user?.role === 'admin';
  const isKetuaTim = user?.is_leader;
  const isPegawai = user?.role === 'pegawai' && !isKetuaTim;
  
  const canManageTeam = user?.role === 'kasubag' || user?.role === 'kepala_bps' || isAdmin;
  const canViewPage = canManageTeam || isKetuaTim;
  
  // Redirect if unauthorized
  if (!canViewPage) {
    return <Navigate to="/" replace />;
  }

  const fetchData = async () => {
    setLoading(true);
    setErrorMsg('');
    try {
      const tRes = await api.get('/teams');
      setTeams(tRes.data);
      
      const uRes = await api.get('/users');
      const nonAdmins = uRes.data.filter(u => u.role !== 'admin');
      setUsers(nonAdmins);
      setAllUsers(nonAdmins);
    } catch (err) {
      console.error(err);
      setErrorMsg('Gagal memuat data tim atau pegawai.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreateTeam = async (e) => {
    e.preventDefault();
    if (!teamForm.team_name.trim() || !teamForm.leader_id) {
      alert('Nama Tim dan Ketua Tim wajib diisi!');
      return;
    }

    setLoading(true);
    setErrorMsg('');
    setSuccessMsg('');
    try {
      if (editingTeamId) {
        await api.put(`/teams/${editingTeamId}`, teamForm);
        setSuccessMsg('Tim berhasil diperbarui!');
      } else {
        await api.post('/teams', teamForm);
        setSuccessMsg('Tim berhasil dibuat!');
      }
      setShowTeamModal(false);
      setEditingTeamId(null);
      setTeamForm({ team_name: '', leader_id: '', type: 'inti', is_active: true, members: [] });
      fetchData();
    } catch (err) {
      console.error(err);
      setErrorMsg(err.response?.data?.message || 'Gagal menyimpan tim.');
    } finally {
      setLoading(false);
    }
  };

  const handleEditTeam = (team) => {
    setEditingTeamId(team.id);
    setTeamForm({
      team_name: team.team_name,
      leader_id: team.leader_id || '',
      type: team.type || 'inti',
      is_active: team.is_active !== undefined ? team.is_active : true,
      members: team.members ? team.members.map(m => m.id) : []
    });
    setShowTeamModal(true);
  };

  const handleDeleteTeam = async (id) => {
    if (!confirm('Hapus tim ini secara permanen?')) return;
    setLoading(true);
    setErrorMsg('');
    setSuccessMsg('');
    try {
      await api.delete(`/teams/${id}`);
      setSuccessMsg('Tim berhasil dihapus.');
      fetchData();
    } catch (err) {
      console.error(err);
      setErrorMsg(err.response?.data?.message || 'Gagal menghapus tim.');
    } finally {
      setLoading(false);
    }
  };

  const displayedTeams = teams.filter(team => {
    // 1. Otorisasi filter
    let matchAccess = false;
    if (canManageTeam) matchAccess = true;
    else if (isKetuaTim) {
      const isLeader = team.leader_id === user?.id;
      const isMember = team.members?.some(m => m.id === user?.id);
      matchAccess = isLeader || isMember;
    }

    if (!matchAccess) return false;

    // 2. Tipe filter
    if (filterType !== 'all' && team.type !== filterType) return false;

    // 3. Status filter
    if (filterStatus === 'active' && !team.is_active) return false;
    if (filterStatus === 'inactive' && team.is_active) return false;

    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
        <div>
          <h2 className="text-2xl font-extrabold text-gray-800">
            {canManageTeam ? 'Manajemen Tim Kerja' : 'Daftar Tim Saya'}
          </h2>
        </div>
        
        {canManageTeam && (
          <button 
            onClick={() => { 
              setEditingTeamId(null); 
              setTeamForm({ team_name: '', leader_id: '', type: 'inti', is_active: true, members: [] }); 
              setShowTeamModal(true); 
            }}
            className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-sm px-5 py-3 rounded-xl shadow-md transition"
          >
            <Plus className="w-4 h-4" />
            Tambah Tim Baru
          </button>
        )}
      </div>

      {/* Filtering Bar */}
      <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Tipe:</span>
          <button
            onClick={() => setFilterType('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
              filterType === 'all' 
                ? 'bg-gray-900 text-white shadow-sm' 
                : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
            }`}
          >
            Semua
          </button>
          <button
            onClick={() => setFilterType('inti')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
              filterType === 'inti' 
                ? 'bg-emerald-600 text-white shadow-sm' 
                : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
            }`}
          >
            Tim Inti
          </button>
          <button
            onClick={() => setFilterType('adhoc')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
              filterType === 'adhoc' 
                ? 'bg-violet-600 text-white shadow-sm' 
                : 'bg-violet-50 text-violet-700 hover:bg-violet-100'
            }`}
          >
            Tim Ad-hoc
          </button>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Status:</span>
          <button
            onClick={() => setFilterStatus('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
              filterStatus === 'all' 
                ? 'bg-gray-900 text-white shadow-sm' 
                : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
            }`}
          >
            Semua
          </button>
          <button
            onClick={() => setFilterStatus('active')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
              filterStatus === 'active' 
                ? 'bg-blue-600 text-white shadow-sm' 
                : 'bg-blue-50 text-blue-700 hover:bg-blue-100'
            }`}
          >
            Aktif
          </button>
          <button
            onClick={() => setFilterStatus('inactive')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
              filterStatus === 'inactive' 
                ? 'bg-gray-500 text-white shadow-sm' 
                : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
            }`}
          >
            Non-aktif
          </button>
        </div>
      </div>

      {/* Messages */}
      {errorMsg && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl flex items-center gap-3">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <p className="text-sm font-medium">{errorMsg}</p>
        </div>
      )}
      {successMsg && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-3 rounded-xl flex items-center gap-3">
          <CheckCircle className="w-5 h-5 flex-shrink-0" />
          <p className="text-sm font-medium">{successMsg}</p>
        </div>
      )}

      {/* Grid of Teams */}
      {loading && teams.length === 0 ? (
        <div className="text-center py-20 text-gray-500 font-medium">Memuat data tim...</div>
      ) : displayedTeams.length === 0 ? (
        <div className="bg-white rounded-2xl p-16 text-center shadow-sm border border-gray-100">
          <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-gray-700">Belum Ada Tim</h3>
          <p className="text-gray-400 mt-1 max-w-sm mx-auto">
            {canManageTeam 
              ? 'Sistem belum memiliki tim kerja yang terbentuk sesuai filter ini. Silakan klik tombol Tambah Tim Baru di atas.' 
              : 'Anda saat ini belum terdaftar di tim kerja mana pun.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {displayedTeams.map(team => (
            <div key={team.id} className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm hover:shadow-md transition relative group">
              {canManageTeam && (
                <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                  <button 
                    onClick={() => handleEditTeam(team)} 
                    className="p-1.5 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition" 
                    title="Edit Tim"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => handleDeleteTeam(team.id)} 
                    className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition" 
                    title="Hapus Tim"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              )}
              
              <div className="flex items-center gap-3 mb-4 pr-16">
                <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center shrink-0 border border-blue-100">
                  <Users className="w-6 h-6 text-blue-500" />
                </div>
                <div>
                  <h3 className="font-extrabold text-gray-800 text-base mb-0.5">{team.team_name}</h3>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {/* Badge Tipe Tim */}
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                      team.type === 'inti' 
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                        : 'bg-violet-50 text-violet-700 border border-violet-200'
                    }`}>
                      {team.type === 'inti' ? 'Inti' : 'Ad-hoc'}
                    </span>
                    {/* Badge Status */}
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                      team.is_active
                        ? 'bg-blue-50 text-blue-700 border border-blue-200' 
                        : 'bg-gray-100 text-gray-500 border border-gray-200'
                    }`}>
                      {team.is_active ? 'Aktif' : 'Non-aktif'}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 font-medium mt-2">
                    Ketua: <span className="text-blue-600 font-bold">{team.leader_name}</span>
                  </p>
                </div>
              </div>
              
              <div>
                <p className="text-[11px] font-black text-gray-400 uppercase tracking-wider mb-2.5">
                  Anggota Tim ({team.members?.length || 0})
                </p>
                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {team.members?.map(m => (
                    <div key={m.id} className="flex items-center gap-2.5 text-sm bg-gray-50 p-2 rounded-xl border border-gray-100">
                      <div className="w-6.5 h-6.5 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold text-[10px]">
                        {m.name.charAt(0)}
                      </div>
                      <span className="text-gray-700 font-bold truncate text-xs">{m.name}</span>
                    </div>
                  ))}
                  {(!team.members || team.members.length === 0) && (
                    <p className="text-xs text-gray-400 italic py-1">Belum ada anggota terdaftar</p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tim Modal */}
      {showTeamModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-8 w-full max-w-md shadow-2xl border border-gray-100 max-h-[90vh] flex flex-col animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-extrabold text-xl text-gray-800">
                {editingTeamId ? 'Edit Struktur Tim' : 'Buat Tim Kerja Baru'}
              </h3>
              <button 
                onClick={() => setShowTeamModal(false)}
                className="p-1 hover:bg-gray-100 rounded-lg"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            
            <form onSubmit={handleCreateTeam} className="space-y-4 flex-1 overflow-y-auto pr-1">
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Nama Tim</label>
                <input 
                  placeholder="Contoh: Tim Statistik Sosial" 
                  required 
                  value={teamForm.team_name}
                  onChange={e => setTeamForm({ ...teamForm, team_name: e.target.value })}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition-all font-semibold" 
                />
              </div>

              <div>
                <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Tipe Tim</label>
                <select 
                  required 
                  value={teamForm.type} 
                  onChange={e => setTeamForm({ ...teamForm, type: e.target.value })}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-100 font-bold"
                >
                  <option value="inti">Tim Inti</option>
                  <option value="adhoc">Tim Ad-hoc</option>
                </select>
              </div>

              {editingTeamId && (
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Status Keaktifan</label>
                  <select 
                    required 
                    value={teamForm.is_active ? 'active' : 'inactive'} 
                    onChange={e => setTeamForm({ ...teamForm, is_active: e.target.value === 'active' })}
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-100 font-bold"
                  >
                    <option value="active">Aktif</option>
                    <option value="inactive">Non-aktif</option>
                  </select>
                </div>
              )}
              
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Ketua Tim</label>
                <select 
                  required 
                  value={teamForm.leader_id} 
                  onChange={e => {
                    const leaderId = e.target.value;
                    setTeamForm({
                      ...teamForm,
                      leader_id: leaderId,
                      // Automatically remove the new leader from members check to avoid redundancy
                      members: teamForm.members.filter(id => parseInt(id) !== parseInt(leaderId))
                    });
                  }}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-100 font-bold"
                >
                  <option value="">- Pilih Ketua -</option>
                  {allUsers.filter(u => u.role === 'pegawai').map(u => (
                    <option key={u.id} value={u.id}>{u.name}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Pilih Anggota</label>
                <div className="border border-gray-200 rounded-xl p-3.5 max-h-48 overflow-y-auto space-y-2">
                  {users
                    .filter(u => u.role === 'pegawai' && parseInt(u.id) !== parseInt(teamForm.leader_id))
                    .map(u => (
                      <label key={u.id} className="flex items-center gap-3 p-2.5 hover:bg-slate-50 rounded-xl cursor-pointer border border-transparent hover:border-gray-150 transition">
                        <input 
                          type="checkbox"
                          checked={teamForm.members.includes(u.id)}
                          onChange={(e) => {
                            const newMembers = e.target.checked 
                              ? [...teamForm.members, u.id]
                              : teamForm.members.filter(id => id !== u.id);
                            setTeamForm({ ...teamForm, members: newMembers });
                          }}
                          className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500 border-gray-300 cursor-pointer" 
                        />
                        <div>
                          <p className="text-xs font-bold text-gray-700 leading-tight">{u.name}</p>
                          <p className="text-[10px] text-gray-400 font-semibold">{u.jabatan || 'Staf Pelaksana'}</p>
                        </div>
                      </label>
                    ))}
                  {users.filter(u => u.role === 'pegawai' && parseInt(u.id) !== parseInt(teamForm.leader_id)).length === 0 && (
                    <p className="text-xs text-gray-400 text-center py-4">Tidak ada pegawai pelaksana tersedia</p>
                  )}
                </div>
              </div>
              
              <div className="flex gap-4 pt-4 sticky bottom-0 bg-white">
                <button 
                  type="button" 
                  onClick={() => setShowTeamModal(false)}
                  className="flex-1 border border-gray-200 rounded-xl py-3 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition"
                >
                  Batal
                </button>
                <button 
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-blue-600 text-white rounded-xl py-3 text-sm font-extrabold hover:bg-blue-700 shadow-md transition"
                >
                  {editingTeamId ? 'Simpan' : 'Buat Tim'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
