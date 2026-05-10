import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import { Eye, Upload, Plus, Users, FileText, CheckCircle, Clock, Pencil, Trash2 } from 'lucide-react';

export default function Kegiatan() {
  const { user }                          = useAuth();
  const [activities, setActivities]       = useState([]);
  const [teams, setTeams]                 = useState([]);
  const [users, setUsers]                 = useState([]);
  const [allUsers, setAllUsers]           = useState([]);
  const [periode, setPeriode]             = useState('');
  const [showTeamModal, setShowTeamModal] = useState(false);
  const [editingTeamId, setEditingTeamId] = useState(null);
  const [teamForm, setTeamForm]           = useState({ team_name: '', leader_id: '', members: [] });
  const [showModal, setShowModal]         = useState(false);
  const [showProgress, setShowProgress]   = useState(null);
  const [showMonitoring, setShowMonitoring] = useState(null);
  const [monitoringData, setMonitoringData] = useState([]);
  const [form, setForm]                   = useState({ title: '', description: '', deadline: '', team_id: '', assigned_to: '' });
  const [progressForm, setProgressForm]   = useState({ activity_id: '', progress_percentage: '', notes: '', file: null });
  const [editingId, setEditingId]         = useState(null);
  const [loadingMonitoring, setLoadingMonitoring] = useState(false);

  const fetchData = async () => {
    const [aRes, tRes] = await Promise.all([api.get('/activities'), api.get('/teams')]);
    setActivities(aRes.data);
    setTeams(tRes.data);
    try { 
      const uRes = await api.get('/users'); 
      const nonAdmins = uRes.data.filter(u => u.role !== 'admin');
      setUsers(nonAdmins); 
      setAllUsers(nonAdmins);
    } catch {}
  };

  useEffect(() => { fetchData(); }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await api.put(`/activities/${editingId}`, form);
      } else {
        await api.post('/activities', form);
      }
      setShowModal(false);
      setEditingId(null);
      setForm({ title: '', description: '', deadline: '', team_id: '', assigned_to: '' });
      fetchData();
    } catch (err) { alert(err.response?.data?.message || 'Gagal menyimpan kegiatan'); }
  };

  const handleCreateTeam = async (e) => {
    e.preventDefault();
    try {
      if (editingTeamId) {
        await api.put(`/teams/${editingTeamId}`, teamForm);
        alert('Tim berhasil diperbarui!');
      } else {
        await api.post('/teams', teamForm);
        alert('Tim berhasil dibuat!');
      }
      setShowTeamModal(false);
      setEditingTeamId(null);
      setTeamForm({ team_name: '', leader_id: '', members: [] });
      fetchData();
    } catch (err) { alert(err.response?.data?.message || 'Gagal menyimpan tim'); }
  };

  const handleEditTeam = (team) => {
    setEditingTeamId(team.id);
    setTeamForm({
      team_name: team.team_name,
      leader_id: team.leader_id || '',
      members: team.members ? team.members.map(m => m.id) : []
    });
    setShowTeamModal(true);
  };

  const handleDeleteTeam = async (id) => {
    if (!confirm('Hapus tim ini secara permanen?')) return;
    try {
      await api.delete(`/teams/${id}`);
      fetchData();
    } catch (err) { alert(err.response?.data?.message || 'Gagal menghapus tim'); }
  };

  const handleEdit = (act) => {
    setEditingId(act.id);
    setForm({
      title: act.title,
      description: act.description || '',
      deadline: act.deadline ? new Date(act.deadline).toISOString().split('T')[0] : '',
      team_id: act.team_id || '',
      assigned_to: act.assigned_to || ''
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!confirm('Hapus kegiatan ini?')) return;
    try {
      await api.delete(`/activities/${id}`);
      fetchData();
    } catch (err) { alert(err.response?.data?.message || 'Gagal menghapus kegiatan'); }
  };

  const handleProgressUpdate = async (e) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      formData.append('activity_id', progressForm.activity_id);
      formData.append('progress_percentage', progressForm.progress_percentage);
      formData.append('notes', progressForm.notes);
      if (progressForm.file) {
        formData.append('file_report', progressForm.file);
      }

      await api.post('/progress', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setShowProgress(null);
      fetchData();
    } catch (err) { alert(err.response?.data?.message || 'Gagal menyimpan progress'); }
  };

  const handleShowMonitoring = async (activity) => {
    if (isPegawai) return; // Pegawai tidak boleh monitoring orang lain
    setShowMonitoring(activity);
    setLoadingMonitoring(true);
    try {
      const res = await api.get(`/activities/${activity.id}/monitoring`);
      setMonitoringData(res.data);
    } catch (err) {
      console.error(err);
      alert('Gagal mengambil data monitoring');
    } finally {
      setLoadingMonitoring(false);
    }
  };

  const statusBadge = (status, progress) => {
    if (progress === 100 || status === 'selesai') {
      return <span className="bg-green-100 text-green-700 text-xs px-3 py-1 rounded-full font-medium flex items-center gap-1 w-fit"><CheckCircle className="w-3 h-3" /> Selesai</span>;
    }
    if (progress > 0 || status === 'on_progress') {
      return <span className="bg-yellow-100 text-yellow-700 text-xs px-3 py-1 rounded-full font-medium flex items-center gap-1 w-fit"><Clock className="w-3 h-3" /> On Progress</span>;
    }
    return <span className="bg-blue-100 text-blue-700 text-xs px-3 py-1 rounded-full font-medium flex items-center gap-1 w-fit">Pending</span>;
  };

  const isKetuaTim = user?.role === 'ketua_tim';
  const isPegawai  = user?.role === 'pegawai';
  const canManageTeam = user?.role === 'kasubag' || user?.role === 'kepala_bps';
  const canCreateActivity = isKetuaTim || canManageTeam || user?.role === 'admin';

  const displayedTeams = teams.filter(team => {
    if (canManageTeam || user?.role === 'admin') return true;
    if (isKetuaTim || isPegawai) {
      const isLeader = team.leader_id === user?.id;
      const isMember = team.members?.some(m => m.id === user?.id);
      return isLeader || isMember;
    }
    return false;
  });

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="bg-gray-100 border border-gray-300 px-4 py-2 rounded-lg font-semibold text-sm">Periode</div>
          <input type="month" value={periode} onChange={e => setPeriode(e.target.value)}
            className="border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-300" />
        </div>
        {canCreateActivity && (
          <button onClick={() => { setShowModal(true); setEditingId(null); setForm({ title: '', description: '', deadline: '', team_id: '', assigned_to: '' }); }}
            className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-sm transition">
            <Plus className="w-4 h-4" /> Buat Kegiatan
          </button>
        )}
      </div>

      <div className="overflow-x-auto border border-gray-100 rounded-xl">
        <table className="w-full text-sm border-collapse bg-white">
          <thead>
            <tr className="bg-[#f0f7ff]">
              <th className="px-6 py-4 text-left text-[11px] font-extrabold text-[#2563eb] uppercase tracking-wider border-b border-gray-100">NO</th>
              <th className="px-6 py-4 text-left text-[11px] font-extrabold text-[#2563eb] uppercase tracking-wider border-b border-gray-100">PENANGGUNG JAWAB</th>
              <th className="px-6 py-4 text-left text-[11px] font-extrabold text-[#2563eb] uppercase tracking-wider border-b border-gray-100">NAMA KEGIATAN</th>
              <th className="px-6 py-4 text-left text-[11px] font-extrabold text-[#2563eb] uppercase tracking-wider border-b border-gray-100">DEADLINE</th>
              <th className="px-6 py-4 text-left text-[11px] font-extrabold text-[#2563eb] uppercase tracking-wider border-b border-gray-100">PROGRESS</th>
              <th className="px-6 py-4 text-left text-[11px] font-extrabold text-[#2563eb] uppercase tracking-wider border-b border-gray-100">STATUS</th>
              <th className="px-6 py-4 text-center text-[11px] font-extrabold text-[#2563eb] uppercase tracking-wider border-b border-gray-100">AKSI</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {activities.map((act, i) => (
              <tr key={act.id} className="hover:bg-gray-50/50 transition-colors cursor-pointer group"
                onClick={() => isKetuaTim ? handleShowMonitoring(act) : (isPegawai && (setProgressForm({ activity_id: act.id, progress_percentage: '', notes: '', file: null }), setShowProgress(act)))}>
                <td className="px-6 py-5 text-gray-500 font-medium">{i + 1}</td>
                <td className="px-6 py-5">
                  <div className="flex flex-col">
                    <span className="font-bold text-gray-700 text-sm">{act.assigned_to_name || act.team_name || '-'}</span>
                    <span className="text-[10px] text-gray-400 uppercase font-bold tracking-tight mt-0.5">
                      {act.team_id ? 'TIM WORK' : 'INDIVIDU'}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-5 font-bold text-[#3b82f6] text-sm group-hover:text-blue-700 transition-colors">{act.title}</td>
                <td className="px-6 py-5 text-[13px] text-gray-600 font-medium">
                  {act.deadline ? new Date(act.deadline).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) : '-'}
                </td>
                <td className="px-6 py-5 w-40">
                  <div className="flex flex-col gap-1.5">
                    <span className="text-[11px] font-bold text-gray-500">{Math.round(act.total_progress)}%</span>
                    <div className="w-full bg-gray-100 rounded-full h-[6px]">
                      <div className={`h-full rounded-full transition-all duration-500 ${act.total_progress >= 100 ? 'bg-green-500' : 'bg-blue-600'}`} 
                        style={{ width: `${act.total_progress}%` }} />
                    </div>
                  </div>
                </td>
                <td className="px-6 py-5">
                  <div className="w-fit">
                    {statusBadge(act.status, act.total_progress)}
                  </div>
                </td>
                <td className="px-6 py-5" onClick={e => e.stopPropagation()}>
                  <div className="flex justify-center items-center gap-3">
                    {isPegawai && (
                      <button
                        onClick={() => { setProgressForm({ activity_id: act.id, progress_percentage: '', notes: '', file: null }); setShowProgress(act); }}
                        className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white text-[11px] font-bold px-3 py-2 rounded-lg shadow-sm transition">
                        <Upload className="w-3.5 h-3.5" /> UNGGAH BUKTI
                      </button>
                    )}
                    {(isKetuaTim || user?.role === 'admin' || user?.role === 'kepala_bps') && (
                      <>
                        <button 
                          onClick={(e) => { e.stopPropagation(); handleShowMonitoring(act); }}
                          className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-full transition shadow-sm border border-transparent hover:border-blue-100 bg-white"
                          title="Monitoring">
                          <Eye className="w-4 h-4" />
                        </button>
                        {canCreateActivity && (
                          <>
                            <button 
                              onClick={(e) => { e.stopPropagation(); handleEdit(act); }}
                              className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-full transition shadow-sm border border-transparent hover:border-green-100 bg-white"
                              title="Edit">
                              <Pencil className="w-4 h-4" />
                            </button>
                            <button 
                              onClick={(e) => { e.stopPropagation(); handleDelete(act.id); }}
                              className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-full transition shadow-sm border border-transparent hover:border-red-100 bg-white"
                              title="Hapus">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </>
                        )}
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
            {activities.length === 0 && (
              <tr><td colSpan={7} className="text-center py-16 text-gray-400 italic font-medium">Belum ada data kegiatan untuk periode ini</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {(displayedTeams.length > 0 || canManageTeam) && (
        <div className="mt-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-gray-800">{canManageTeam || user?.role === 'admin' ? 'Manajemen Tim' : 'Tim Saya'}</h2>
            {canManageTeam && (
              <button onClick={() => { setEditingTeamId(null); setTeamForm({ team_name: '', leader_id: '', members: [] }); setShowTeamModal(true); }}
                className="flex items-center gap-2 bg-indigo-500 hover:bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm transition">
                <Plus className="w-4 h-4" /> Tambah Tim Baru
              </button>
            )}
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {displayedTeams.map(team => (
              <div key={team.id} className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm hover:shadow-md transition relative group">
                {canManageTeam && (
                  <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                    <button onClick={() => handleEditTeam(team)} className="p-1.5 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition" title="Edit Tim">
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleDeleteTeam(team.id)} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition" title="Hapus Tim">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                )}
                <div className="flex items-center gap-3 mb-4 pr-16">
                  <div className="w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center shrink-0">
                    <Users className="w-6 h-6 text-indigo-500" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-800">{team.team_name}</h3>
                    <p className="text-xs text-gray-500 font-medium">Ketua: <span className="text-indigo-600">{team.leader_name}</span></p>
                  </div>
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-400 uppercase mb-2">Anggota ({team.members?.length || 0})</p>
                  <div className="space-y-2 max-h-32 overflow-y-auto pr-2">
                    {team.members?.map(m => (
                      <div key={m.id} className="flex items-center gap-2 text-sm bg-gray-50 p-2 rounded-lg">
                        <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold text-[10px]">
                          {m.name.charAt(0)}
                        </div>
                        <span className="text-gray-600 font-medium truncate">{m.name}</span>
                      </div>
                    ))}
                    {(!team.members || team.members.length === 0) && (
                      <p className="text-xs text-gray-400 italic">Belum ada anggota</p>
                    )}
                  </div>
                </div>
              </div>
            ))}
            {displayedTeams.length === 0 && (
              <div className="col-span-full text-center py-12 border-2 border-dashed border-gray-200 rounded-2xl">
                <p className="text-gray-400 font-medium">Belum ada tim yang terbentuk</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Modal buat kegiatan */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-8 w-full max-w-md shadow-2xl border border-gray-100">
            <h3 className="font-bold text-xl mb-6 text-gray-800">{editingId ? 'Edit Kegiatan' : 'Buat Kegiatan Baru'}</h3>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Judul Kegiatan</label>
                <input placeholder="Contoh: Survei Lokasi Pasar" required value={form.title}
                  onChange={e => setForm({ ...form, title: e.target.value })}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition-all" />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Deskripsi</label>
                <textarea placeholder="Berikan detail tugas jika diperlukan..." value={form.description}
                  onChange={e => setForm({ ...form, description: e.target.value })}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none h-24 resize-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition-all" />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Deadline Penugasan</label>
                <input type="date" required value={form.deadline}
                  onChange={e => setForm({ ...form, deadline: e.target.value })}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition-all" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Tim</label>
                  <select value={form.team_id} onChange={e => setForm({ ...form, team_id: e.target.value, assigned_to: '' })}
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-100">
                    <option value="">- Pilih Tim -</option>
                    {teams.map(t => <option key={t.id} value={t.id}>{t.team_name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Individu</label>
                  <select value={form.assigned_to} onChange={e => setForm({ ...form, assigned_to: e.target.value, team_id: '' })}
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-100">
                    <option value="">- Pilih User -</option>
                    {users.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                  </select>
                </div>
              </div>
              <div className="flex gap-4 pt-4">
                <button type="button" onClick={() => setShowModal(false)}
                  className="flex-1 border border-gray-200 rounded-xl py-3 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition">Batal</button>
                <button type="submit"
                  className="flex-1 bg-blue-600 text-white rounded-xl py-3 text-sm font-semibold hover:bg-blue-700 shadow-lg shadow-blue-200 transition">Simpan Kegiatan</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Monitoring Detail */}
      {showMonitoring && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl w-full max-w-4xl max-h-[90vh] overflow-hidden shadow-2xl flex flex-col">
            <div className="p-8 border-b border-gray-100 flex items-center justify-between bg-blue-50/50">
              <div>
                <h3 className="font-bold text-2xl text-gray-800">{showMonitoring.title}</h3>
                <div className="flex items-center gap-4 mt-2">
                  <span className="flex items-center gap-1.5 text-sm text-gray-500 font-medium">
                    <Users className="w-4 h-4" /> {showMonitoring.team_name || 'Penugasan Individu'}
                  </span>
                  <span className="text-gray-300">|</span>
                  <span className="flex items-center gap-1.5 text-sm text-gray-500 font-medium">
                    Total Progress: <b className="text-blue-600">{Math.round(showMonitoring.total_progress)}%</b>
                  </span>
                </div>
              </div>
              <button onClick={() => setShowMonitoring(null)} className="p-2 hover:bg-white rounded-full transition shadow-sm">
                <Plus className="w-6 h-6 rotate-45 text-gray-400" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-8 bg-gray-50/30">
              {loadingMonitoring ? (
                <div className="flex flex-col items-center justify-center py-20 gap-4">
                  <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
                  <p className="text-gray-500 font-medium">Memuat data monitoring...</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {monitoringData.map(member => (
                    <div key={member.id} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold">
                            {member.name.charAt(0)}
                          </div>
                          <div>
                            <h4 className="font-bold text-gray-800 leading-tight">{member.name}</h4>
                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">{member.jabatan || 'Pegawai'}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className={`text-xs font-bold px-2.5 py-1 rounded-lg ${member.progress >= 100 ? 'bg-green-100 text-green-600' : member.progress > 0 ? 'bg-yellow-100 text-yellow-600' : 'bg-gray-100 text-gray-400'}`}>
                            {member.progress}%
                          </span>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div>
                          <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">Catatan Progress</p>
                          <p className="text-sm text-gray-600 leading-relaxed italic">"{member.notes}"</p>
                        </div>
                        
                        <div className="flex items-center justify-between pt-2 border-t border-gray-50">
                          <div>
                            <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">Bukti Dukung</p>
                            {member.file_report ? (
                              <a href={`http://localhost:5000/uploads/${member.file_report}`} target="_blank" rel="noreferrer"
                                className="flex items-center gap-1.5 text-blue-500 font-bold text-xs hover:underline">
                                <FileText className="w-3.5 h-3.5" /> LIHAT DOKUMEN
                              </a>
                            ) : (
                              <span className="text-xs text-gray-300 font-medium italic">Belum ada bukti</span>
                            )}
                          </div>
                          <div className="text-right">
                            <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">Update Terakhir</p>
                            <p className="text-[10px] text-gray-500">
                              {member.updated_at ? new Date(member.updated_at).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' }) : '-'}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                  {monitoringData.length === 0 && (
                    <p className="col-span-full text-center py-10 text-gray-400">Tidak ada anggota yang ditugaskan.</p>
                  )}
                </div>
              )}
            </div>
            
            <div className="p-6 bg-white border-t border-gray-100 flex justify-end">
              <button onClick={() => setShowMonitoring(null)} className="px-6 py-2.5 bg-gray-800 text-white rounded-xl text-sm font-bold hover:bg-gray-900 transition">
                Tutup Monitoring
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal update progress / Unggah Bukti */}
      {showProgress && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-8 w-full max-w-sm shadow-2xl border border-gray-100">
            <h3 className="font-bold text-xl mb-1 text-gray-800">{isPegawai ? 'Unggah Bukti Tugas' : 'Update Progress'}</h3>
            <p className="text-sm text-gray-500 mb-6">{showProgress.title}</p>
            <form onSubmit={handleProgressUpdate} className="space-y-4">
              {isPegawai ? (
                <>
                  <div>
                    <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Status Penyelesaian *</label>
                    <select required value={progressForm.progress_percentage}
                      onChange={e => setProgressForm({ ...progressForm, progress_percentage: e.target.value })}
                      className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-100">
                      <option value="">- Pilih Status -</option>
                      <option value="0">Belum Selesai</option>
                      <option value="50">Sedang Dikerjakan (50%)</option>
                      <option value="100">Selesai (100%)</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">File Bukti (Gambar/PDF/Doc) *</label>
                    <input type="file" required={progressForm.progress_percentage === '100'}
                      onChange={e => setProgressForm({ ...progressForm, file: e.target.files[0] })}
                      className="w-full text-xs text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" />
                  </div>
                </>
              ) : (
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Progress (%) *</label>
                  <div className="flex items-center gap-3">
                    <input type="range" min="0" max="100" step="5" value={progressForm.progress_percentage}
                      onChange={e => setProgressForm({ ...progressForm, progress_percentage: e.target.value })}
                      className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600" />
                    <span className="text-sm font-bold text-blue-600 w-10">{progressForm.progress_percentage || 0}%</span>
                  </div>
                </div>
              )}
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Catatan / Keterangan</label>
                <textarea placeholder="Tuliskan perkembangan pekerjaan Anda..." value={progressForm.notes}
                  onChange={e => setProgressForm({ ...progressForm, notes: e.target.value })}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none h-24 resize-none focus:ring-2 focus:ring-blue-100 transition-all" />
              </div>
              <div className="flex gap-4 pt-4">
                <button type="button" onClick={() => setShowProgress(null)}
                  className="flex-1 border border-gray-200 rounded-xl py-3 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition">Batal</button>
                <button type="submit"
                  className="flex-1 bg-blue-600 text-white rounded-xl py-3 text-sm font-semibold hover:bg-blue-700 shadow-lg shadow-blue-200 transition">
                  {isPegawai ? 'Unggah Bukti' : 'Simpan Progress'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Modal buat tim */}
      {showTeamModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-8 w-full max-w-md shadow-2xl border border-gray-100 max-h-[90vh] flex flex-col">
            <h3 className="font-bold text-xl mb-6 text-gray-800">{editingTeamId ? 'Edit Tim' : 'Buat Tim Baru'}</h3>
            <form onSubmit={handleCreateTeam} className="space-y-4 flex-1 overflow-y-auto pr-2">
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Nama Tim</label>
                <input placeholder="Contoh: Tim Statistik Sosial" required value={teamForm.team_name}
                  onChange={e => setTeamForm({ ...teamForm, team_name: e.target.value })}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400 transition-all" />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Ketua Tim</label>
                <select required value={teamForm.leader_id} onChange={e => setTeamForm({ ...teamForm, leader_id: e.target.value })}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-indigo-100">
                  <option value="">- Pilih Ketua Tim -</option>
                  {allUsers.map(u => (
                    <option key={u.id} value={u.id}>{u.name} ({u.role})</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Pilih Anggota</label>
                <div className="border border-gray-200 rounded-xl p-3 max-h-48 overflow-y-auto space-y-2">
                  {users.map(u => (
                    <label key={u.id} className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg cursor-pointer transition">
                      <input type="checkbox"
                        checked={teamForm.members.includes(u.id)}
                        onChange={(e) => {
                          const newMembers = e.target.checked 
                            ? [...teamForm.members, u.id]
                            : teamForm.members.filter(id => id !== u.id);
                          setTeamForm({ ...teamForm, members: newMembers });
                        }}
                        className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500 border-gray-300" />
                      <div>
                        <p className="text-sm font-bold text-gray-700">{u.name}</p>
                        <p className="text-[10px] text-gray-400">{u.jabatan || 'Pegawai'}</p>
                      </div>
                    </label>
                  ))}
                  {users.length === 0 && <p className="text-xs text-gray-400 text-center py-2">Tidak ada pegawai tersedia</p>}
                </div>
              </div>
              <div className="flex gap-4 pt-4 sticky bottom-0 bg-white">
                <button type="button" onClick={() => setShowTeamModal(false)}
                  className="flex-1 border border-gray-200 rounded-xl py-3 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition">Batal</button>
                <button type="submit"
                  className="flex-1 bg-indigo-600 text-white rounded-xl py-3 text-sm font-semibold hover:bg-indigo-700 shadow-lg shadow-indigo-200 transition">
                  {editingTeamId ? 'Simpan Perubahan' : 'Buat Tim'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
