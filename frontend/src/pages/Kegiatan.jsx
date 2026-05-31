import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import { 
  Eye, Upload, Plus, Users, FileText, CheckCircle, Clock, 
  Pencil, Trash2, ChevronDown, ChevronRight, BookOpen, 
  Trash, Check, X, Download, PlusCircle 
} from 'lucide-react';

export default function Kegiatan() {
  const { user }                          = useAuth();
  const [activities, setActivities]       = useState([]);
  const [teams, setTeams]                 = useState([]);
  const [users, setUsers]                 = useState([]);
  const [allUsers, setAllUsers]           = useState([]);
  const [periode, setPeriode]             = useState('2026-Q2');
  const [filterStatus, setFilterStatus]   = useState('all');
  const [filterTeam, setFilterTeam]       = useState('all');
  const [filterPic, setFilterPic]         = useState('all');
  // Kegiatan modals
  const [showModal, setShowModal]         = useState(false);
  const [form, setForm]                   = useState({ title: '', description: '', start_date: '', deadline: '', team_id: '', assigned_to: '' });
  const [editingId, setEditingId]         = useState(null);
  
  // NEW: Unified Detail & Sub-Tugas Modals
  const [selectedActivity, setSelectedActivity] = useState(null);
  const [activityTasks, setActivityTasks]       = useState([]);
  const [loadingTasks, setLoadingTasks]         = useState(false);
  const [expandedTaskId, setExpandedTaskId]     = useState(null); // to view logbooks in detail modal
  
  // NEW: Bulk Manage Sub-Tugas Modal (Atasan)
  const [showManageTasksModal, setShowManageTasksModal] = useState(false);
  const [localTasks, setLocalTasks]                     = useState([]); // [{ id, title, assigned_to, weight }]
  const [loadingManageTasks, setLoadingManageTasks]     = useState(false);

  // NEW: Logbook Modals (Pegawai)
  const [showLogbookModal, setShowLogbookModal] = useState(false);
  const [selectedTask, setSelectedTask]         = useState(null);
  const [taskLogbooks, setTaskLogbooks]         = useState([]);
  const [logbookForm, setLogbookForm]           = useState({ progress_percentage: '', notes: '', file: null });
  const [loadingLogbook, setLoadingLogbook]     = useState(false);
  const [editingLogbookId, setEditingLogbookId] = useState(null); // to edit existing logbook
  const [editLogbookForm, setEditLogbookForm]   = useState({ progress_percentage: '', notes: '', file: null });

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
      setForm({ title: '', description: '', start_date: '', deadline: '', team_id: '', assigned_to: '' });
      fetchData();
    } catch (err) { alert(err.response?.data?.message || 'Gagal menyimpan kegiatan'); }
  };  const handleEdit = (act) => {
    setEditingId(act.id);
    setForm({
      title: act.title,
      description: act.description || '',
      start_date: act.start_date ? new Date(act.start_date).toISOString().split('T')[0] : '',
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

  const isKetuaTim = user?.role === 'ketua_tim' || user?.is_leader;
  const isPegawai  = user?.role === 'pegawai' && !user?.is_leader;
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

  // NEW: Unified Detail fetch
  const handleShowActivityDetail = async (act) => {
    setSelectedActivity(act);
    setExpandedTaskId(null);
    setLoadingTasks(true);
    try {
      const res = await api.get(`/activities/${act.id}/tasks`);
      setActivityTasks(res.data);
    } catch (err) {
      alert('Gagal mengambil data sub-tugas');
    } finally {
      setLoadingTasks(false);
    }
  };

  // NEW: Get eligible assignees for sub-tasks based on activity team/individual setup
  const getEligibleAssignees = (act) => {
    if (!act) return [];
    if (act.team_id) {
      const team = teams.find(t => t.id === act.team_id);
      if (team) {
        const list = [];
        // leader
        if (team.leader_id) {
          const leader = allUsers.find(u => u.id === team.leader_id);
          if (leader) list.push({ id: team.leader_id, name: `${leader.name} (Ketua Tim)` });
        }
        // members
        if (team.members) {
          team.members.forEach(m => {
            if (!list.some(l => l.id === m.id)) {
              list.push({ id: m.id, name: m.name });
            }
          });
        }
        return list;
      }
    }
    // Individual activity or fallback
    const list = [];
    if (act.assigned_to) {
      const u = allUsers.find(u => u.id === act.assigned_to);
      if (u) list.push({ id: act.assigned_to, name: u.name });
    }
    if (act.created_by) {
      const u = allUsers.find(u => u.id === act.created_by);
      if (u && !list.some(l => l.id === act.created_by)) {
        list.push({ id: act.created_by, name: `${u.name} (Pembuat)` });
      }
    }
    return list;
  };

  // NEW: Manage local sub-tasks
  const handleOpenManageTasks = () => {
    setLocalTasks(
      activityTasks.map(t => ({
        id: t.id,
        title: t.title,
        assigned_to: t.assigned_to || '',
        weight: t.weight
      }))
    );
    setShowManageTasksModal(true);
  };

  const handleAddLocalTask = () => {
    setLocalTasks([...localTasks, { title: '', assigned_to: '', weight: 0 }]);
  };

  const handleRemoveLocalTask = (idx) => {
    setLocalTasks(localTasks.filter((_, i) => i !== idx));
  };

  const handleLocalTaskChange = (idx, field, val) => {
    const updated = [...localTasks];
    updated[idx][field] = val;
    setLocalTasks(updated);
  };

  const sumWeights = localTasks.reduce((acc, curr) => acc + parseInt(curr.weight || 0), 0);

  const handleSaveTasks = async (e) => {
    e.preventDefault();
    if (localTasks.length > 0 && sumWeights !== 100) {
      return alert(`Akumulasi bobot tugas harus tepat 100%! Progres saat ini: ${sumWeights}%`);
    }
    setLoadingManageTasks(true);
    try {
      await api.post(`/activities/${selectedActivity.id}/tasks`, { tasks: localTasks });
      alert('Sub-tugas berhasil disimpan!');
      setShowManageTasksModal(false);
      fetchData(); // reload main table
      // reload details
      const res = await api.get(`/activities/${selectedActivity.id}/tasks`);
      setActivityTasks(res.data);
    } catch (err) {
      alert(err.response?.data?.message || 'Gagal menyimpan sub-tugas');
    } finally {
      setLoadingManageTasks(false);
    }
  };

  // NEW: Logbook operations
  const handleOpenLogbook = async (task) => {
    setSelectedTask(task);
    setLogbookForm({ progress_percentage: task.progress_percentage || 0, notes: '', file: null });
    setEditingLogbookId(null);
    setLoadingLogbook(true);
    setShowLogbookModal(true);
    try {
      const res = await api.get(`/progress?task_id=${task.id}`);
      setTaskLogbooks(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingLogbook(false);
    }
  };

  const handleCreateLogbook = async (e) => {
    e.preventDefault();
    setLoadingLogbook(true);
    try {
      const fd = new FormData();
      fd.append('task_id', selectedTask.id);
      fd.append('progress_percentage', logbookForm.progress_percentage);
      fd.append('notes', logbookForm.notes);
      if (logbookForm.file) {
        fd.append('file_report', logbookForm.file);
      }

      await api.post('/progress', fd, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      // Reload logbooks
      const res = await api.get(`/progress?task_id=${selectedTask.id}`);
      setTaskLogbooks(res.data);

      // Reset form
      setLogbookForm({ progress_percentage: 0, notes: '', file: null });

      // Refresh parent detailed views
      fetchData();
      const tRes = await api.get(`/activities/${selectedActivity.id}/tasks`);
      setActivityTasks(tRes.data);
    } catch (err) {
      alert(err.response?.data?.message || 'Gagal menyimpan logbook');
    } finally {
      setLoadingLogbook(false);
    }
  };

  const handleStartEditLogbook = (log) => {
    setEditingLogbookId(log.id);
    setEditLogbookForm({
      progress_percentage: log.progress_percentage,
      notes: log.notes,
      file: null
    });
  };

  const handleUpdateLogbook = async (e) => {
    e.preventDefault();
    setLoadingLogbook(true);
    try {
      const fd = new FormData();
      fd.append('progress_percentage', editLogbookForm.progress_percentage);
      fd.append('notes', editLogbookForm.notes);
      if (editLogbookForm.file) {
        fd.append('file_report', editLogbookForm.file);
      }

      await api.put(`/progress/${editingLogbookId}`, fd, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      setEditingLogbookId(null);

      // Reload logbooks
      const res = await api.get(`/progress?task_id=${selectedTask.id}`);
      setTaskLogbooks(res.data);

      // Refresh parent detailed views
      fetchData();
      const tRes = await api.get(`/activities/${selectedActivity.id}/tasks`);
      setActivityTasks(tRes.data);
    } catch (err) {
      alert(err.response?.data?.message || 'Gagal mengedit logbook');
    } finally {
      setLoadingLogbook(false);
    }
  };

  // Expand a task in activity detail to view timeline (monitoring)
  const toggleExpandTask = async (taskId) => {
    if (expandedTaskId === taskId) {
      setExpandedTaskId(null);
    } else {
      setExpandedTaskId(taskId);
      try {
        const res = await api.get(`/progress?task_id=${taskId}`);
        setTaskLogbooks(res.data);
      } catch (err) {
        console.error(err);
      }
    }
  };

  const statusBadge = (status, progress) => {
    if (progress >= 100 || status === 'selesai') {
      return <span className="bg-green-100 text-green-700 text-xs px-2.5 py-1 rounded-full font-medium flex items-center gap-1 w-fit border border-green-200"><CheckCircle className="w-3.5 h-3.5" /> Selesai</span>;
    }
    if (progress > 0 || status === 'on_progress') {
      return <span className="bg-amber-100 text-amber-700 text-xs px-2.5 py-1 rounded-full font-medium flex items-center gap-1 w-fit border border-amber-200"><Clock className="w-3.5 h-3.5" /> On Progress</span>;
    }
    return <span className="bg-blue-100 text-blue-700 text-xs px-2.5 py-1 rounded-full font-medium flex items-center gap-1 w-fit border border-blue-200">Pending</span>;
  };

  const getQuarterFromDate = (dateString) => {
    if (!dateString) return null;
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return null;
    const year = d.getFullYear();
    const month = d.getMonth();
    const quarter = Math.floor(month / 3) + 1;
    return `${year}-Q${quarter}`;
  };

  const filteredActivities = activities.filter(act => {
    // 1. Filter Periode
    if (periode && getQuarterFromDate(act.deadline) !== periode) return false;

    // 2. Filter Status
    if (filterStatus !== 'all' && act.status !== filterStatus) return false;

    // 3. Filter Tim
    if (filterTeam !== 'all' && parseInt(act.team_id) !== parseInt(filterTeam)) return false;

    // 4. Filter PIC
    if (filterPic !== 'all' && parseInt(act.assigned_to) !== parseInt(filterPic)) return false;

    return true;
  });

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm">
      {/* Header & Create Button */}
      <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-gray-800">Daftar Kegiatan</h2>
          <p className="text-xs text-gray-400 mt-0.5">Kelola dan pantau seluruh progres kegiatan taktis BPS Solok.</p>
        </div>
        {canCreateActivity && (
          <button onClick={() => { setShowModal(true); setEditingId(null); setForm({ title: '', description: '', start_date: '', deadline: '', team_id: '', assigned_to: '' }); }}
            className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl text-sm font-extrabold transition shadow-md hover:scale-102">
            <Plus className="w-4.5 h-4.5" /> Buat Kegiatan
          </button>
        )}
      </div>

      {/* Modern Filter Panel */}
      <div className="bg-slate-50/50 p-4 rounded-xl border border-slate-100 mb-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Filter Periode */}
        <div className="flex flex-col gap-1">
          <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Periode Rilis</label>
          <select value={periode} onChange={e => setPeriode(e.target.value)}
            className="border border-gray-200 rounded-lg px-3 py-2 text-xs outline-none focus:ring-2 focus:ring-blue-100 font-bold bg-white w-full">
            <option value="">Semua Periode</option>
            <option value="2026-Q1">2026 - Kuartal I (Q1)</option>
            <option value="2026-Q2">2026 - Kuartal II (Q2)</option>
            <option value="2026-Q3">2026 - Kuartal III (Q3)</option>
            <option value="2026-Q4">2026 - Kuartal IV (Q4)</option>
          </select>
        </div>

        {/* Filter Status */}
        <div className="flex flex-col gap-1">
          <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Status Progres</label>
          <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
            className="border border-gray-200 rounded-lg px-3 py-2 text-xs outline-none focus:ring-2 focus:ring-blue-100 font-bold bg-white w-full">
            <option value="all">Semua Status</option>
            <option value="pending">Pending</option>
            <option value="on_progress">On Progress</option>
            <option value="selesai">Selesai</option>
          </select>
        </div>

        {/* Filter Tim */}
        <div className="flex flex-col gap-1">
          <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Filter Tim</label>
          <select value={filterTeam} onChange={e => setFilterTeam(e.target.value)}
            className="border border-gray-200 rounded-lg px-3 py-2 text-xs outline-none focus:ring-2 focus:ring-blue-100 font-bold bg-white w-full">
            <option value="all">Semua Tim</option>
            {teams.map(t => <option key={t.id} value={t.id}>{t.team_name}</option>)}
          </select>
        </div>

        {/* Filter Penanggung Jawab */}
        <div className="flex flex-col gap-1">
          <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Penanggung Jawab (PIC)</label>
          <select value={filterPic} onChange={e => setFilterPic(e.target.value)}
            className="border border-gray-200 rounded-lg px-3 py-2 text-xs outline-none focus:ring-2 focus:ring-blue-100 font-bold bg-white w-full">
            <option value="all">Semua Pegawai</option>
            {users.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
          </select>
        </div>
      </div>

      <div className="overflow-x-auto border border-gray-100 rounded-xl shadow-inner">
        <table className="w-full text-sm border-collapse bg-white">
          <thead>
            <tr className="bg-[#f0f7ff]">
              <th className="px-6 py-4 text-left text-[11px] font-extrabold text-[#2563eb] uppercase tracking-wider border-b border-gray-100">NO</th>
              <th className="px-6 py-4 text-left text-[11px] font-extrabold text-[#2563eb] uppercase tracking-wider border-b border-gray-100">PENANGGUNG JAWAB</th>
              <th className="px-6 py-4 text-left text-[11px] font-extrabold text-[#2563eb] uppercase tracking-wider border-b border-gray-100">TIM</th>
              <th className="px-6 py-4 text-left text-[11px] font-extrabold text-[#2563eb] uppercase tracking-wider border-b border-gray-100">NAMA KEGIATAN</th>
              <th className="px-6 py-4 text-left text-[11px] font-extrabold text-[#2563eb] uppercase tracking-wider border-b border-gray-100">DEADLINE</th>
              <th className="px-6 py-4 text-left text-[11px] font-extrabold text-[#2563eb] uppercase tracking-wider border-b border-gray-100">PROGRESS</th>
              <th className="px-6 py-4 text-left text-[11px] font-extrabold text-[#2563eb] uppercase tracking-wider border-b border-gray-100">STATUS</th>
              <th className="px-6 py-4 text-center text-[11px] font-extrabold text-[#2563eb] uppercase tracking-wider border-b border-gray-100">AKSI</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {filteredActivities.map((act, i) => (
              <tr key={act.id} className="hover:bg-blue-50/20 transition-colors cursor-pointer group"
                onClick={() => handleShowActivityDetail(act)}>
                <td className="px-6 py-5 text-gray-500 font-medium">{i + 1}</td>
                <td className="px-6 py-5">
                  <div className="flex flex-col">
                    <span className="font-bold text-gray-700 text-sm">{act.assigned_to_name || '-'}</span>
                    <span className="text-[10px] text-gray-400 uppercase font-bold tracking-tight mt-0.5">
                      PIC
                    </span>
                  </div>
                </td>
                <td className="px-6 py-5">
                  <div className="flex flex-col">
                    <span className="font-bold text-gray-700 text-sm">{act.team_name || 'Penugasan Individu'}</span>
                    <span className="text-[10px] text-gray-400 uppercase font-bold tracking-tight mt-0.5">
                      {act.team_id ? 'TIM WORK' : 'INDIVIDU'}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-5 font-bold text-[#3b82f6] text-sm group-hover:text-blue-700 transition-colors">{act.title}</td>
                <td className="px-6 py-5">
                  <div className="flex flex-col gap-0.5">
                    <span className="text-[13px] text-gray-700 font-bold">
                      {act.deadline ? new Date(act.deadline).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) : '-'}
                    </span>
                    {act.start_date && (
                      <span className="text-[10px] text-gray-400 font-semibold">
                        Mulai: {new Date(act.start_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </span>
                    )}
                  </div>
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
                    <button 
                      onClick={() => handleShowActivityDetail(act)}
                      className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-full transition shadow-sm border border-transparent hover:border-blue-100 bg-white"
                      title="Lihat Detail & Tugas">
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
      {/* Modal buat kegiatan */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in">
          <div className="bg-white rounded-2xl p-8 w-full max-w-md shadow-2xl border border-gray-100">
            <h3 className="font-bold text-xl mb-6 text-gray-800">{editingId ? 'Edit Kegiatan' : 'Buat Kegiatan Baru'}</h3>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Judul Kegiatan</label>
                <input placeholder="Contoh: Survei Lokasi Pasar" required value={form.title}
                  onChange={e => setForm({ ...form, title: e.target.value })}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition-all font-semibold" />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Deskripsi</label>
                <textarea placeholder="Berikan detail tugas jika diperlukan..." value={form.description}
                  onChange={e => setForm({ ...form, description: e.target.value })}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none h-24 resize-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition-all font-medium" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Tanggal Mulai</label>
                  <input type="date" required value={form.start_date}
                    onChange={e => setForm({ ...form, start_date: e.target.value })}
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition-all font-semibold" />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Deadline Penugasan</label>
                  <input type="date" required value={form.deadline}
                    onChange={e => setForm({ ...form, deadline: e.target.value })}
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition-all font-semibold" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Tim *</label>
                  <select required value={form.team_id} 
                    onChange={e => {
                      const teamId = parseInt(e.target.value);
                      const selectedTeam = teams.find(t => t.id === teamId);
                      const leaderId = selectedTeam ? selectedTeam.leader_id : '';
                      setForm({ ...form, team_id: e.target.value, assigned_to: leaderId || '' });
                    }}
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-100 font-bold bg-white">
                    <option value="">- Pilih Tim -</option>
                    {displayedTeams.map(t => <option key={t.id} value={t.id}>{t.team_name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Individu \ PIC *</label>
                  <select required disabled={!form.team_id} value={form.assigned_to} 
                    onChange={e => setForm({ ...form, assigned_to: e.target.value })}
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-100 disabled:bg-gray-50 disabled:text-gray-400 font-bold bg-white">
                    <option value="">- Pilih PIC -</option>
                    {form.team_id && (() => {
                      const selectedTeam = teams.find(t => t.id === parseInt(form.team_id));
                      if (!selectedTeam) return null;
                      const list = [];
                      if (selectedTeam.leader_id) {
                        const leader = allUsers.find(u => u.id === selectedTeam.leader_id);
                        if (leader) list.push({ id: selectedTeam.leader_id, name: `${leader.name} (Ketua Tim)` });
                      }
                      if (selectedTeam.members) {
                        selectedTeam.members.forEach(m => {
                          if (!list.some(l => l.id === m.id)) {
                            list.push({ id: m.id, name: m.name });
                          }
                        });
                      }
                      return list.map(u => <option key={u.id} value={u.id}>{u.name}</option>);
                    })()}
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

      {/* NEW: Unified Detail, Monitoring, and Sub-Tugas Modal */}
      {selectedActivity && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-white rounded-3xl w-full max-w-4xl max-h-[90vh] overflow-hidden shadow-2xl flex flex-col border border-gray-100">
            {/* Modal Header */}
            <div className="p-8 border-b border-gray-100 flex items-center justify-between bg-blue-50/40">
              <div>
                <h3 className="font-extrabold text-2xl text-gray-800 leading-tight">{selectedActivity.title}</h3>
                <div className="flex flex-wrap items-center gap-4 mt-2">
                  <span className="flex items-center gap-1.5 text-xs text-gray-500 font-bold uppercase tracking-wider">
                    <Users className="w-4 h-4 text-gray-400" /> {selectedActivity.team_name || 'Penugasan Individu'}
                  </span>
                  <span className="text-gray-300">|</span>
                  <span className="flex items-center gap-1.5 text-xs text-gray-500 font-bold uppercase">
                    Deadline: <b className="text-red-500">{selectedActivity.deadline ? new Date(selectedActivity.deadline).toLocaleDateString('id-ID', { dateStyle: 'medium' }) : '-'}</b>
                  </span>
                  <span className="text-gray-300">|</span>
                  <span className="flex items-center gap-1.5 text-xs text-gray-500 font-bold">
                    Progres: <b className="text-blue-600">{Math.round(selectedActivity.total_progress)}%</b>
                  </span>
                </div>
              </div>
              <button onClick={() => setSelectedActivity(null)} className="p-2 hover:bg-white rounded-full transition shadow-sm border border-gray-100 bg-white">
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-8 bg-gray-50/20">
              {selectedActivity.description && (
                <div className="mb-6 bg-white p-4 rounded-xl border border-gray-100">
                  <h4 className="text-xs font-bold text-gray-400 uppercase mb-1">Deskripsi Kegiatan</h4>
                  <p className="text-sm text-gray-600 leading-relaxed">{selectedActivity.description}</p>
                </div>
              )}

              {/* Sub-Tugas Section */}
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-extrabold text-gray-700 text-base">Daftar Sub-Tugas Kerja</h4>
                {/* Atasan/Admin can manage tasks */}
                {((['admin', 'kasubag', 'kepala_bps'].includes(user?.role) || 
                  (isKetuaTim && (
                    parseInt(selectedActivity.created_by) === parseInt(user.id) ||
                    parseInt(selectedActivity.team_leader_id) === parseInt(user.id)
                  )))) && (
                  <button onClick={handleOpenManageTasks}
                    className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-3.5 py-2 rounded-xl shadow transition">
                    <Pencil className="w-3.5 h-3.5" /> KELOLA TUGAS
                  </button>
                )}
              </div>

              {loadingTasks ? (
                <div className="flex flex-col items-center justify-center py-16 gap-3">
                  <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
                  <p className="text-xs text-gray-500 font-medium">Memuat data sub-tugas...</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {activityTasks.map(task => {
                    const isMyTask = parseInt(task.assigned_to) === parseInt(user?.id);
                    const isExpanded = expandedTaskId === task.id;

                    return (
                      <div key={task.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition overflow-hidden">
                        {/* Task summary block */}
                        <div className="p-5 flex flex-wrap items-center justify-between gap-4">
                          <div className="flex-1 min-w-[200px]">
                            <h5 className="font-extrabold text-gray-800 text-sm">{task.title}</h5>
                            <div className="flex items-center gap-3 mt-1.5">
                              <span className="text-[10px] bg-slate-100 text-slate-600 font-bold px-2 py-0.5 rounded uppercase">
                                PJ: {task.assigned_to_name || 'Tidak ada'}
                              </span>
                              <span className="text-[10px] bg-blue-50 text-blue-600 font-bold px-2 py-0.5 rounded">
                                Bobot: {task.weight}%
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center gap-4 flex-shrink-0">
                            {/* Progress bar */}
                            <div className="flex flex-col gap-1 w-24">
                              <span className="text-[10px] font-bold text-gray-500">{task.progress_percentage}%</span>
                              <div className="w-full bg-gray-100 rounded-full h-[4px]">
                                <div className={`h-full rounded-full ${task.progress_percentage >= 100 ? 'bg-green-500' : 'bg-blue-500'}`}
                                  style={{ width: `${task.progress_percentage}%` }} />
                              </div>
                            </div>
                            
                            {/* Status badge */}
                            <div className="w-24 flex justify-end">
                              {statusBadge(task.status, task.progress_percentage)}
                            </div>

                            {/* Actions */}
                            <div className="flex items-center gap-1.5">
                              {/* Pegawai reports to their assigned task */}
                              {isMyTask && (
                                <button onClick={() => handleOpenLogbook(task)}
                                  className="flex items-center gap-1 bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold px-3 py-1.5 rounded-lg shadow-sm transition">
                                  <Upload className="w-3 h-3" /> LAPOR
                                </button>
                              )}
                              {/* Open Logbook history (all roles can view, only for monitored or own) */}
                              <button onClick={() => toggleExpandTask(task.id)}
                                className={`p-1.5 rounded-lg transition border border-gray-100 ${isExpanded ? 'bg-blue-50 text-blue-600' : 'text-gray-400 hover:bg-gray-50'}`}
                                title="Lihat Riwayat Log-book">
                                <BookOpen className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        </div>

                        {/* Expanded logbook timeline */}
                        {isExpanded && (
                          <div className="bg-slate-50/50 border-t border-slate-50 p-6 space-y-4">
                            <h6 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Riwayat Catatan Harian (Log-Book)</h6>
                            {taskLogbooks.length === 0 ? (
                              <p className="text-xs text-gray-400 italic">Belum ada catatan log-book untuk sub-tugas ini.</p>
                            ) : (
                              <div className="relative border-l-2 border-blue-200 pl-4 space-y-4 ml-2">
                                {taskLogbooks.map(log => (
                                  <div key={log.id} className="relative">
                                    {/* Timeline point */}
                                    <div className="absolute -left-[21px] top-1.5 w-2.5 h-2.5 bg-blue-500 rounded-full ring-4 ring-white" />
                                    
                                    <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-xs">
                                      <div className="flex items-center justify-between mb-1.5">
                                        <div className="flex items-center gap-2">
                                          <span className="font-bold text-xs text-gray-700">{log.user_name}</span>
                                          <span className="text-[10px] text-gray-400 font-medium">
                                            {new Date(log.created_at).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' })}
                                          </span>
                                        </div>
                                        <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
                                          Progres: {log.progress_percentage}%
                                        </span>
                                      </div>
                                      <p className="text-xs text-gray-600 leading-relaxed italic">"{log.notes}"</p>
                                      
                                      {log.file_report && (
                                        <div className="mt-2.5 pt-2 border-t border-gray-50 flex items-center justify-between">
                                          <a href={`/uploads/${log.file_report}`} target="_blank" rel="noreferrer"
                                            className="flex items-center gap-1 text-[10px] font-bold text-blue-600 hover:underline">
                                            <FileText className="w-3.5 h-3.5" /> LIHAT BUKTI DUKUNG
                                          </a>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                  {activityTasks.length === 0 && (
                    <div className="text-center py-12 bg-white border-2 border-dashed border-gray-200 rounded-2xl">
                      <p className="text-xs text-gray-400 italic">Belum ada daftar sub-tugas yang dibuat untuk kegiatan ini.</p>
                      {((isKetuaTim && parseInt(selectedActivity.created_by) === parseInt(user.id)) || user?.role === 'admin') && (
                        <button onClick={handleOpenManageTasks}
                          className="mt-3 inline-flex items-center gap-1.5 bg-blue-500 hover:bg-blue-600 text-white text-xs font-bold px-4 py-2 rounded-xl transition">
                          <PlusCircle className="w-4 h-4" /> BUAT SUB-TUGAS PERTAMA
                        </button>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-6 bg-white border-t border-gray-100 flex justify-end flex-shrink-0">
              <button onClick={() => setSelectedActivity(null)} className="px-6 py-2.5 bg-gray-800 text-white rounded-xl text-sm font-bold hover:bg-gray-900 transition">
                Tutup Detail
              </button>
            </div>
          </div>
        </div>
      )}

      {/* NEW: Bulk Manage Sub-Tugas Modal (Atasan) */}
      {showManageTasksModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-white rounded-3xl w-full max-w-xl max-h-[85vh] overflow-hidden shadow-2xl flex flex-col border border-gray-100">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-slate-50">
              <div>
                <h3 className="font-extrabold text-lg text-gray-800">Kelola Sub-Tugas Kerja</h3>
                <p className="text-xs text-gray-400 mt-0.5">{selectedActivity?.title}</p>
              </div>
              <button onClick={() => setShowManageTasksModal(false)} className="p-2 hover:bg-gray-100 rounded-full transition bg-white border border-gray-100">
                <X className="w-4 h-4 text-gray-400" />
              </button>
            </div>

            <form onSubmit={handleSaveTasks} className="flex-1 flex flex-col overflow-hidden">
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                <div className="flex justify-between items-center bg-blue-50/50 p-4 rounded-xl border border-blue-100/50">
                  <span className="text-xs font-bold text-blue-700">Akumulasi Bobot Harus 100%:</span>
                  <span className={`text-sm font-black px-3 py-1 rounded-lg ${sumWeights === 100 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {sumWeights}% / 100%
                  </span>
                </div>

                <div className="space-y-3">
                  {localTasks.map((t, idx) => (
                    <div key={idx} className="bg-slate-50/60 p-4 rounded-xl border border-slate-100 space-y-3 relative group">
                      <button type="button" onClick={() => handleRemoveLocalTask(idx)}
                        className="absolute top-2 right-2 text-gray-300 hover:text-red-500 p-1 rounded-lg transition"
                        title="Hapus Sub-Tugas">
                        <Trash className="w-4 h-4" />
                      </button>

                      <div className="grid grid-cols-1 gap-2">
                        <label className="text-[10px] font-bold text-gray-400 uppercase block">Judul Sub-Tugas *</label>
                        <input type="text" placeholder="Masukkan judul sub-tugas..." required value={t.title}
                          onChange={e => handleLocalTaskChange(idx, 'title', e.target.value)}
                          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-xs outline-none focus:ring-2 focus:ring-blue-100 bg-white" />
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="text-[10px] font-bold text-gray-400 uppercase block mb-1">Penanggung Jawab *</label>
                          <select required value={t.assigned_to}
                            onChange={e => handleLocalTaskChange(idx, 'assigned_to', e.target.value)}
                            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-xs outline-none bg-white">
                            <option value="">- Pilih Staf -</option>
                            {getEligibleAssignees(selectedActivity).map(u => (
                              <option key={u.id} value={u.id}>{u.name}</option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="text-[10px] font-bold text-gray-400 uppercase block mb-1">Bobot (%) *</label>
                          <input type="number" min="1" max="100" placeholder="0" required value={t.weight || ''}
                            onChange={e => handleLocalTaskChange(idx, 'weight', e.target.value)}
                            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-xs outline-none focus:ring-2 focus:ring-blue-100 bg-white" />
                        </div>
                      </div>
                    </div>
                  ))}

                  <button type="button" onClick={handleAddLocalTask}
                    className="w-full border border-dashed border-gray-300 hover:border-blue-500 rounded-xl py-3 text-xs font-bold text-gray-400 hover:text-blue-500 bg-white hover:bg-blue-50/20 transition flex items-center justify-center gap-1.5">
                    <PlusCircle className="w-4 h-4" /> TAMBAH SUB-TUGAS BARU
                  </button>
                </div>
              </div>

              <div className="p-6 bg-white border-t border-gray-100 flex gap-3 flex-shrink-0">
                <button type="button" onClick={() => setShowManageTasksModal(false)}
                  className="flex-1 border border-gray-200 rounded-xl py-2.5 text-xs font-bold text-gray-600 hover:bg-gray-50 transition">
                  Batal
                </button>
                <button type="submit" disabled={loadingManageTasks}
                  className="flex-1 bg-blue-600 text-white rounded-xl py-2.5 text-xs font-bold hover:bg-blue-700 transition shadow disabled:opacity-50">
                  {loadingManageTasks ? 'Menyimpan...' : 'Simpan Sub-Tugas'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* NEW: Pegawai Logbook & Progress Update Modal */}
      {showLogbookModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-white rounded-3xl w-full max-w-lg max-h-[85vh] overflow-hidden shadow-2xl flex flex-col border border-gray-100">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-emerald-50/30">
              <div>
                <h3 className="font-extrabold text-lg text-gray-800">Pelaporan Harian (Log-Book)</h3>
                <p className="text-xs text-gray-400 mt-0.5">{selectedTask?.title} (Bobot: {selectedTask?.weight}%)</p>
              </div>
              <button onClick={() => setShowLogbookModal(false)} className="p-2 hover:bg-gray-100 rounded-full transition bg-white border border-gray-100">
                <X className="w-4 h-4 text-gray-400" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* Form Input Baru (Hanya jika tidak sedang mengedit logbook) */}
              {!editingLogbookId && (
                <form onSubmit={handleCreateLogbook} className="bg-slate-50/50 p-5 rounded-2xl border border-slate-100 space-y-4">
                  <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wide">Input Catatan Kerja Baru</h4>
                  <div className="grid grid-cols-1 gap-1">
                    <label className="text-[10px] font-bold text-gray-500 uppercase">Progress Proyek Saat Ini ({logbookForm.progress_percentage || 0}%) *</label>
                    <div className="flex items-center gap-3">
                      <input type="range" min="0" max="100" step="5" required value={logbookForm.progress_percentage}
                        onChange={e => setLogbookForm({ ...logbookForm, progress_percentage: e.target.value })}
                        className="flex-1 h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-emerald-600" />
                      <span className="text-xs font-bold text-emerald-600 w-10 text-right">{logbookForm.progress_percentage || 0}%</span>
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-gray-500 uppercase mb-1 block">Catatan Log-Book Pekerjaan *</label>
                    <textarea placeholder="Tuliskan detail pekerjaan harian Anda di sini..." required value={logbookForm.notes}
                      onChange={e => setLogbookForm({ ...logbookForm, notes: e.target.value })}
                      className="w-full border border-gray-200 rounded-xl px-4 py-2 text-xs outline-none h-20 resize-none focus:ring-2 focus:ring-emerald-100 transition-all bg-white" />
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-gray-500 uppercase mb-1 block">Bukti Dukung (PDF/Dokumen/Gambar)</label>
                    <input type="file" onChange={e => setLogbookForm({ ...logbookForm, file: e.target.files[0] })}
                      className="w-full text-xs text-gray-400 file:mr-4 file:py-1.5 file:px-3 file:rounded-full file:border-0 file:text-[10px] file:font-semibold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100" />
                  </div>

                  <button type="submit" disabled={loadingLogbook}
                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl py-2.5 text-xs font-bold transition shadow-sm disabled:opacity-50">
                    {loadingLogbook ? 'Menyimpan...' : 'Kirim Laporan Log-Book'}
                  </button>
                </form>
              )}

              {/* Form EDIT Logbook yang Sedang Aktif */}
              {editingLogbookId && (
                <form onSubmit={handleUpdateLogbook} className="bg-amber-50/40 p-5 rounded-2xl border border-amber-100 space-y-4">
                  <div className="flex justify-between items-center">
                    <h4 className="text-xs font-bold text-amber-800 uppercase tracking-wide">Edit Catatan Kerja</h4>
                    <button type="button" onClick={() => setEditingLogbookId(null)} className="text-xs text-gray-400 hover:text-gray-600 font-bold">
                      Batal Edit
                    </button>
                  </div>
                  
                  <div className="grid grid-cols-1 gap-1">
                    <label className="text-[10px] font-bold text-amber-800 uppercase">Progress Proyek ({editLogbookForm.progress_percentage || 0}%) *</label>
                    <div className="flex items-center gap-3">
                      <input type="range" min="0" max="100" step="5" required value={editLogbookForm.progress_percentage}
                        onChange={e => setEditLogbookForm({ ...editLogbookForm, progress_percentage: e.target.value })}
                        className="flex-1 h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-amber-600" />
                      <span className="text-xs font-bold text-amber-600 w-10 text-right">{editLogbookForm.progress_percentage || 0}%</span>
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-amber-800 uppercase mb-1 block">Catatan Log-Book Pekerjaan *</label>
                    <textarea placeholder="Edit detail pekerjaan harian Anda..." required value={editLogbookForm.notes}
                      onChange={e => setEditLogbookForm({ ...editLogbookForm, notes: e.target.value })}
                      className="w-full border border-amber-200 rounded-xl px-4 py-2 text-xs outline-none h-20 resize-none focus:ring-2 focus:ring-amber-100 transition-all bg-white" />
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-amber-800 uppercase mb-1 block">Ganti Bukti Dukung (Opsional)</label>
                    <input type="file" onChange={e => setEditLogbookForm({ ...editLogbookForm, file: e.target.files[0] })}
                      className="w-full text-xs text-gray-400 file:mr-4 file:py-1.5 file:px-3 file:rounded-full file:border-0 file:text-[10px] file:font-semibold file:bg-amber-50 file:text-amber-700 hover:file:bg-amber-100" />
                  </div>

                  <div className="flex gap-2">
                    <button type="button" onClick={() => setEditingLogbookId(null)}
                      className="flex-1 border border-gray-300 rounded-xl py-2 text-xs font-bold text-gray-600 hover:bg-white bg-transparent transition">
                      Batal
                    </button>
                    <button type="submit" disabled={loadingLogbook}
                      className="flex-1 bg-amber-600 hover:bg-amber-700 text-white rounded-xl py-2 text-xs font-bold transition shadow-sm disabled:opacity-50">
                      {loadingLogbook ? 'Menyimpan...' : 'Simpan Perubahan'}
                    </button>
                  </div>
                </form>
              )}

              {/* Logbook History */}
              <div className="space-y-3">
                <h4 className="text-xs font-extrabold text-gray-500 uppercase tracking-wide">Daftar Riwayat Catatan Kerja Saya</h4>
                {taskLogbooks.length === 0 ? (
                  <p className="text-xs text-gray-400 italic">Belum ada catatan log-book yang diinput.</p>
                ) : (
                  <div className="space-y-3">
                    {taskLogbooks.map(log => (
                      <div key={log.id} className="bg-slate-50/50 p-4 rounded-xl border border-slate-100 space-y-2 relative group">
                        {/* Edit Button */}
                        {parseInt(log.user_id) === parseInt(user.id) && parseInt(selectedTask?.assigned_to) === parseInt(user?.id) && !editingLogbookId && (
                          <button onClick={() => handleStartEditLogbook(log)}
                            className="absolute top-3.5 right-4 p-1 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded transition"
                            title="Edit Catatan Log-Book ini">
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                        )}

                        <div className="flex justify-between items-center">
                          <span className="text-[10px] text-gray-400 font-bold">
                            {new Date(log.created_at).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' })}
                          </span>
                          <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">
                            Progres: {log.progress_percentage}%
                          </span>
                        </div>
                        <p className="text-xs text-gray-600 italic">"{log.notes}"</p>
                        {log.file_report && (
                          <a href={`/uploads/${log.file_report}`} target="_blank" rel="noreferrer"
                            className="inline-flex items-center gap-1 text-[10px] font-bold text-blue-600 hover:underline">
                            <FileText className="w-3 h-3" /> Bukti Dukung
                          </a>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="p-6 bg-white border-t border-gray-100 flex justify-end">
              <button onClick={() => setShowLogbookModal(false)} className="px-6 py-2.5 bg-gray-800 text-white rounded-xl text-xs font-bold hover:bg-gray-900 transition">
                Tutup Log-Book
              </button>
            </div>
          </div>
        </div>
      )}    </div>
  );
}
