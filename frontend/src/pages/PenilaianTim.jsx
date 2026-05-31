import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import { 
  ClipboardList, 
  User, 
  Activity, 
  Award, 
  Save, 
  Send, 
  CheckCircle, 
  AlertCircle, 
  Calendar,
  Sliders,
  ChevronRight,
  TrendingUp,
  MessageSquare
} from 'lucide-react';

const BEHAVIOR_ASPECTS = [
  { key: 'orientasi_pelayanan', label: 'Orientasi Pelayanan', desc: 'Komitmen memberikan pelayanan prima demi kepuasan masyarakat.' },
  { key: 'akuntabilitas', label: 'Akuntabilitas', desc: 'Bertanggung jawab atas kepercayaan yang diberikan.' },
  { key: 'kompetensi', label: 'Kompetensi', desc: 'Terus belajar dan mengembangkan kapabilitas.' },
  { key: 'harmonis', label: 'Harmonis', desc: 'Saling peduli dan menghargai perbedaan.' },
  { key: 'loyal', label: 'Loyal', desc: 'Dedikasi dan mengutamakan kepentingan Bangsa dan Negara.' },
  { key: 'adaptif', label: 'Adaptif', desc: 'Terus berinovasi dan antusias dalam menggerakkan ataupun menghadapi perubahan.' },
  { key: 'kolaboratif', label: 'Kolaboratif', desc: 'Membangun kerja sama yang sinergis.' },
  { key: 'disiplin', label: 'Disiplin', desc: 'Kepatuhan terhadap peraturan, waktu, dan etos kerja.' }
];

export default function PenilaianTim() {
  const { user } = useAuth();
  const [period, setPeriod] = useState('2026-Q2');
  const [employees, setEmployees] = useState([]);
  const [selectedEmpId, setSelectedEmpId] = useState(null);
  const [activeTab, setActiveTab] = useState('performance'); // 'performance' | 'behavior'
  
  // Activities state
  const [activities, setActivities] = useState([]);
  const [activityForm, setActivityForm] = useState({}); // activityId -> scores & notes
  
  // Behavior state
  const [behaviorForm, setBehaviorForm] = useState({
    orientasi_pelayanan: 80,
    akuntabilitas: 80,
    kompetensi: 80,
    harmonis: 80,
    loyal: 80,
    adaptif: 80,
    kolaboratif: 80,
    disiplin: 80,
    notes: '',
    status: 'draft'
  });
  
  const [loading, setLoading] = useState(false);
  const [loadingEmployees, setLoadingEmployees] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Fetch employees and status under this leader
  const fetchEmployeesData = async () => {
    setLoadingEmployees(true);
    setErrorMsg('');
    try {
      // Get employees' behavior data to list their statuses
      const behaviorRes = await api.get(`/assessments/leader/behavior?period=${period}`);
      setEmployees(behaviorRes.data);
      
      if (behaviorRes.data.length > 0 && !selectedEmpId) {
        setSelectedEmpId(behaviorRes.data[0].employee_id);
      }
    } catch (err) {
      console.error('Gagal mengambil daftar pegawai:', err);
      setErrorMsg('Gagal memuat daftar anggota tim. Pastikan Anda terdaftar sebagai Ketua Tim.');
    } finally {
      setLoadingEmployees(false);
    }
  };

  useEffect(() => {
    fetchEmployeesData();
  }, [period]);

  // Fetch activities and behavior details for the selected employee
  const fetchEmployeeDetails = async () => {
    if (!selectedEmpId) return;
    setLoading(true);
    setErrorMsg('');
    setSuccessMsg('');
    try {
      // 1. Get Kinerja (Activities)
      const actRes = await api.get(`/assessments/leader/activities?period=${period}`);
      // Filter for this specific employee
      const empActs = actRes.data.filter(a => a.employee_id === selectedEmpId);
      setActivities(empActs);

      // Populate activityForm
      const initialForm = {};
      empActs.forEach(act => {
        initialForm[act.activity_id] = {
          speed_score: act.speed_score || '',
          quality_score: act.quality_score || '',
          contribution_score: act.contribution_score || '',
          responsibility_score: act.responsibility_score || '',
          notes: act.notes || '',
          status: act.evaluation_status || 'draft'
        };
      });
      setActivityForm(initialForm);

      // 2. Get Behavior
      const behRes = await api.get(`/assessments/leader/behavior?period=${period}`);
      const empBeh = behRes.data.find(b => b.employee_id === selectedEmpId);
      if (empBeh && empBeh.evaluation_id) {
        setBehaviorForm({
          orientasi_pelayanan: Math.round(empBeh.orientasi_pelayanan) || 80,
          akuntabilitas: Math.round(empBeh.akuntabilitas) || 80,
          kompetensi: Math.round(empBeh.kompetensi) || 80,
          harmonis: Math.round(empBeh.harmonis) || 80,
          loyal: Math.round(empBeh.loyal) || 80,
          adaptif: Math.round(empBeh.adaptif) || 80,
          kolaboratif: Math.round(empBeh.kolaboratif) || 80,
          disiplin: Math.round(empBeh.disiplin) || 80,
          notes: empBeh.notes || '',
          status: empBeh.evaluation_status || 'draft'
        });
      } else {
        // Reset to default values
        setBehaviorForm({
          orientasi_pelayanan: 80,
          akuntabilitas: 80,
          kompetensi: 80,
          harmonis: 80,
          loyal: 80,
          adaptif: 80,
          kolaboratif: 80,
          disiplin: 80,
          notes: '',
          status: 'draft'
        });
      }
    } catch (err) {
      console.error('Gagal mengambil detail evaluasi pegawai:', err);
      setErrorMsg('Gagal memuat detail kegiatan atau perilaku pegawai.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployeeDetails();
  }, [selectedEmpId, period]);

  const selectedEmp = employees.find(e => e.employee_id === selectedEmpId);

  // Kinerja input handlers
  const handleActivityScoreChange = (actId, field, value) => {
    setActivityForm(prev => ({
      ...prev,
      [actId]: {
        ...prev[actId],
        [field]: value
      }
    }));
  };

  const handleSaveActivity = async (actId, submitStatus) => {
    const data = activityForm[actId];
    if (!data.speed_score || !data.quality_score || !data.contribution_score || !data.responsibility_score) {
      alert('Mohon isi semua nilai komponen evaluasi kegiatan!');
      return;
    }

    setLoading(true);
    setErrorMsg('');
    setSuccessMsg('');
    try {
      await api.post('/assessments/leader/activities', {
        employee_id: selectedEmpId,
        activity_id: actId,
        period,
        speed_score: data.speed_score,
        quality_score: data.quality_score,
        contribution_score: data.contribution_score,
        responsibility_score: data.responsibility_score,
        notes: data.notes,
        status: submitStatus
      });
      setSuccessMsg(`Evaluasi kegiatan berhasil disimpan sebagai ${submitStatus === 'submitted' ? 'Submitted' : 'Draft'}`);
      
      // Reload current details and employee status
      fetchEmployeeDetails();
      fetchEmployeesData();
    } catch (err) {
      console.error('Gagal menyimpan evaluasi kegiatan:', err);
      setErrorMsg(err.response?.data?.message || 'Gagal menyimpan evaluasi kegiatan.');
    } finally {
      setLoading(false);
    }
  };

  // Behavior input handlers
  const handleBehaviorSliderChange = (key, value) => {
    if (behaviorForm.status === 'submitted') return; // Read-only if submitted
    setBehaviorForm(prev => ({
      ...prev,
      [key]: parseInt(value)
    }));
  };

  const handleSaveBehavior = async (submitStatus) => {
    if (submitStatus === 'submitted' && !confirm('Apakah Anda yakin ingin men-submit evaluasi Perilaku ini? Data yang telah di-submit akan dikirim ke Kepala BPS dan tidak dapat diubah lagi.')) {
      return;
    }

    setLoading(true);
    setErrorMsg('');
    setSuccessMsg('');
    try {
      await api.post('/assessments/leader/behavior', {
        employee_id: selectedEmpId,
        period,
        ...behaviorForm,
        status: submitStatus
      });
      setSuccessMsg(`Evaluasi perilaku berhasil disimpan sebagai ${submitStatus === 'submitted' ? 'Submitted' : 'Draft'}`);
      
      // Reload current details and employee list status
      fetchEmployeeDetails();
      fetchEmployeesData();
    } catch (err) {
      console.error('Gagal menyimpan evaluasi perilaku:', err);
      setErrorMsg(err.response?.data?.message || 'Gagal menyimpan evaluasi perilaku.');
    } finally {
      setLoading(false);
    }
  };

  // Helper: Live average calculations
  const calculateActivityAvg = (actId) => {
    const data = activityForm[actId];
    if (!data) return '-';
    const s = parseFloat(data.speed_score || 0);
    const q = parseFloat(data.quality_score || 0);
    const c = parseFloat(data.contribution_score || 0);
    const r = parseFloat(data.responsibility_score || 0);
    if (!s || !q || !c || !r) return '-';
    return ((s + q + c + r) / 4).toFixed(2);
  };

  const calculateBehaviorAvg = () => {
    const keys = BEHAVIOR_ASPECTS.map(a => a.key);
    const total = keys.reduce((acc, k) => acc + (behaviorForm[k] || 0), 0);
    return (total / keys.length).toFixed(2);
  };

  // Count evaluation completion rate for the team
  const totalEmployees = employees.length;
  const submittedBehaviors = employees.filter(e => e.evaluation_status === 'submitted').length;

  return (
    <div className="space-y-6">
      {/* ── HEADER & PERIOD SELECTOR ── */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
        <div>
          <h2 className="text-2xl font-extrabold text-gray-800">Evaluasi Karyawan (Ketua Tim)</h2>
          <p className="text-sm text-gray-500 mt-1">
            Berikan evaluasi kinerja kegiatan dan nilai perilaku Ber-AKHLAK bagi anggota tim Anda.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Calendar className="w-5 h-5 text-blue-600" />
          <span className="text-sm font-semibold text-gray-600">Periode Kuartal:</span>
          <select 
            value={period} 
            onChange={(e) => {
              setPeriod(e.target.value);
              setSelectedEmpId(null);
            }}
            className="border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-bold text-gray-800 outline-none focus:ring-2 focus:ring-blue-300 bg-gray-50 cursor-pointer"
          >
            <option value="2026-Q1">2026 - Kuartal I (Q1)</option>
            <option value="2026-Q2">2026 - Kuartal II (Q2)</option>
            <option value="2026-Q3">2026 - Kuartal III (Q3)</option>
            <option value="2026-Q4">2026 - Kuartal IV (Q4)</option>
          </select>
        </div>
      </div>

      {/* Alert Messages */}
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

      {/* ── METRIC BLOCK ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-5 text-white shadow-md">
          <p className="text-sm font-medium opacity-80 text-white">Total Anggota Tim</p>
          <p className="text-3xl font-black mt-1">{totalEmployees}</p>
        </div>
        <div className="bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-2xl p-5 text-white shadow-md">
          <p className="text-sm font-medium opacity-80 text-white">Evaluasi Perilaku Submitted</p>
          <p className="text-3xl font-black mt-1">{submittedBehaviors} <span className="text-sm font-normal opacity-85">/ {totalEmployees} Pegawai</span></p>
        </div>
        <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl p-5 text-white shadow-md">
          <p className="text-sm font-medium opacity-80 text-white">Progress Penyelesaian Evaluasi</p>
          <div className="flex items-center gap-3 mt-2">
            <div className="w-full bg-white/25 rounded-full h-2.5">
              <div 
                className="bg-white h-2.5 rounded-full transition-all duration-500" 
                style={{ width: `${totalEmployees > 0 ? (submittedBehaviors / totalEmployees) * 100 : 0}%` }}
              />
            </div>
            <span className="font-bold text-lg">{totalEmployees > 0 ? Math.round((submittedBehaviors / totalEmployees) * 100) : 0}%</span>
          </div>
        </div>
      </div>

      {totalEmployees === 0 ? (
        <div className="bg-white rounded-2xl p-16 text-center shadow-sm border border-gray-100">
          <ClipboardList className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-gray-700">Tidak Ada Anggota Tim</h3>
          <p className="text-gray-400 mt-1 max-w-md mx-auto">
            Sistem tidak mendeteksi adanya anggota tim pelaksana yang berada di bawah kepemimpinan Anda pada periode ini.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* ── LEFT COLUMN: STAFF LIST (lg:col-span-4) ── */}
          <div className="lg:col-span-4 space-y-4">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="bg-gray-50 px-5 py-4 border-b border-gray-100">
                <h3 className="font-bold text-gray-700 text-sm">Daftar Anggota Tim</h3>
              </div>
              
              {loadingEmployees ? (
                <div className="p-8 text-center text-gray-400 text-sm">Memuat daftar pegawai...</div>
              ) : (
                <div className="divide-y divide-gray-100 max-h-[550px] overflow-y-auto">
                  {employees.map(emp => {
                    const isSelected = emp.employee_id === selectedEmpId;
                    const isBehSubmitted = emp.evaluation_status === 'submitted';
                    
                    return (
                      <button
                        key={emp.employee_id}
                        onClick={() => setSelectedEmpId(emp.employee_id)}
                        className={`w-full text-left px-5 py-4 flex items-center justify-between transition-colors hover:bg-slate-50 ${
                          isSelected ? 'bg-blue-50/70 border-r-4 border-blue-600' : ''
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${
                            isSelected ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600'
                          }`}>
                            {emp.employee_name?.charAt(0)}
                          </div>
                          <div>
                            <p className="font-bold text-gray-800 text-sm">{emp.employee_name}</p>
                            <p className="text-xs text-gray-400 font-mono mt-0.5">{emp.nip || 'Tanpa NIP'}</p>
                            <p className="text-xs text-gray-500 mt-0.5 truncate max-w-[180px]">{emp.jabatan || 'Staf Pelaksana'}</p>
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
                          {isBehSubmitted ? (
                            <span className="text-[10px] font-bold px-2 py-0.5 bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-full">
                              Submitted
                            </span>
                          ) : (
                            <span className="text-[10px] font-bold px-2 py-0.5 bg-amber-100 text-amber-700 border border-amber-200 rounded-full">
                              {emp.evaluation_status === 'draft' ? 'Draft' : 'Pending'}
                            </span>
                          )}
                          <ChevronRight className={`w-4 h-4 text-gray-400 transition-transform ${isSelected ? 'translate-x-1 text-blue-600' : ''}`} />
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* ── RIGHT COLUMN: EVALUATION FORM PANEL (lg:col-span-8) ── */}
          <div className="lg:col-span-8 space-y-6">
            {selectedEmpId && selectedEmp ? (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                {/* Employee Header Info */}
                <div className="bg-slate-50 px-6 py-5 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <User className="w-6 h-6 text-blue-600" />
                    <div>
                      <h3 className="font-extrabold text-gray-800 text-base">{selectedEmp.employee_name}</h3>
                      <p className="text-xs text-gray-500">{selectedEmp.jabatan || 'Pegawai BPS'} • NIP: {selectedEmp.nip || '-'}</p>
                    </div>
                  </div>
                  
                  {/* Tabs */}
                  <div className="flex bg-gray-200 p-1 rounded-xl">
                    <button
                      onClick={() => setActiveTab('performance')}
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                        activeTab === 'performance' 
                          ? 'bg-white text-gray-800 shadow-sm' 
                          : 'text-gray-600 hover:text-gray-800'
                      }`}
                    >
                      <Activity className="w-3.5 h-3.5" />
                      Kinerja Kegiatan ({activities.length})
                    </button>
                    <button
                      onClick={() => setActiveTab('behavior')}
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                        activeTab === 'behavior' 
                          ? 'bg-white text-gray-800 shadow-sm' 
                          : 'text-gray-600 hover:text-gray-800'
                      }`}
                    >
                      <Award className="w-3.5 h-3.5" />
                      Perilaku Ber-AKHLAK
                    </button>
                  </div>
                </div>

                <div className="p-6">
                  {/* TAB 1: KINERJA KEGIATAN */}
                  {activeTab === 'performance' && (
                    <div className="space-y-6">
                      {activities.length === 0 ? (
                        <div className="text-center py-12 border border-dashed border-gray-200 rounded-2xl bg-gray-50">
                          <ClipboardList className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                          <p className="text-gray-500 font-semibold text-sm">Tidak ada kegiatan pada kuartal ini</p>
                          <p className="text-xs text-gray-400 mt-1 max-w-sm mx-auto">
                            Pegawai ini tidak memiliki tugas atau kegiatan dengan deadline di periode kuartal terpilih ({period}).
                          </p>
                        </div>
                      ) : (
                        <div className="space-y-6">
                          <div className="bg-blue-50 border border-blue-100 rounded-xl px-4 py-3 text-xs text-blue-800">
                            <strong>Info:</strong> Nilai kinerja diisi per kegiatan. Penilaian kinerja final akan diambil dari rata-rata nilai seluruh kegiatan pegawai pada kuartal ini.
                          </div>
                          
                          {activities.map(act => {
                            const formData = activityForm[act.activity_id] || {};
                            const isSubmitted = formData.status === 'submitted';
                            const avgVal = calculateActivityAvg(act.activity_id);
                            
                            return (
                              <div key={act.activity_id} className="border border-gray-100 rounded-2xl p-5 shadow-sm space-y-4 hover:border-blue-100 transition-colors">
                                <div className="flex items-start justify-between gap-4">
                                  <div>
                                    <h4 className="font-extrabold text-gray-800 text-sm">{act.activity_title}</h4>
                                    <div className="flex items-center gap-3 mt-1">
                                      <span className="text-[10px] font-bold text-gray-400 font-mono">
                                        ID KEGIATAN: #{act.activity_id}
                                      </span>
                                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                                        act.activity_status === 'selesai' 
                                          ? 'bg-green-100 text-green-700' 
                                          : 'bg-blue-100 text-blue-700'
                                      }`}>
                                        Status: {act.activity_status}
                                      </span>
                                      {isSubmitted && (
                                        <span className="text-[10px] font-bold px-2 py-0.5 bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-full">
                                          ✓ Submitted
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                  
                                  {/* Rata-rata Kinerja Kegiatan */}
                                  <div className="bg-blue-50 text-blue-700 px-3.5 py-2 rounded-xl text-center flex-shrink-0">
                                    <p className="text-[10px] font-bold uppercase tracking-wider">Rata-rata</p>
                                    <p className="text-xl font-black">{avgVal}</p>
                                  </div>
                                </div>

                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
                                  {[
                                    { key: 'speed_score', label: 'Kecepatan' },
                                    { key: 'quality_score', label: 'Kualitas' },
                                    { key: 'contribution_score', label: 'Kontribusi' },
                                    { key: 'responsibility_score', label: 'Tanggung Jawab' }
                                  ].map(field => (
                                    <div key={field.key} className="space-y-1">
                                      <label className="text-[11px] font-semibold text-gray-500">{field.label} (0-100)</label>
                                      <input 
                                        type="number"
                                        min="0"
                                        max="100"
                                        disabled={isSubmitted || loading}
                                        value={formData[field.key] || ''}
                                        onChange={(e) => handleActivityScoreChange(act.activity_id, field.key, e.target.value)}
                                        className="w-full border border-gray-200 disabled:bg-gray-50 disabled:text-gray-500 rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-300 font-bold"
                                        placeholder="0"
                                      />
                                    </div>
                                  ))}
                                </div>

                                <div className="space-y-1">
                                  <label className="text-[11px] font-semibold text-gray-500">Catatan Khusus Kegiatan</label>
                                  <textarea 
                                    rows={2}
                                    disabled={isSubmitted || loading}
                                    value={formData.notes || ''}
                                    onChange={(e) => handleActivityScoreChange(act.activity_id, 'notes', e.target.value)}
                                    placeholder="Tambahkan catatan khusus mengenai pencapaian kegiatan ini (opsional)..."
                                    className="w-full border border-gray-200 disabled:bg-gray-50 disabled:text-gray-500 rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-300 resize-none"
                                  />
                                </div>

                                {!isSubmitted && (
                                  <div className="flex items-center justify-end gap-2.5 pt-2">
                                    <button
                                      type="button"
                                      disabled={loading}
                                      onClick={() => handleSaveActivity(act.activity_id, 'draft')}
                                      className="flex items-center gap-1.5 text-xs text-gray-600 hover:text-gray-800 font-bold border border-gray-200 px-3 py-2 rounded-xl hover:bg-gray-50 transition"
                                    >
                                      <Save className="w-3.5 h-3.5" />
                                      Simpan Draft
                                    </button>
                                    <button
                                      type="button"
                                      disabled={loading}
                                      onClick={() => handleSaveActivity(act.activity_id, 'submitted')}
                                      className="flex items-center gap-1.5 text-xs text-white bg-blue-600 hover:bg-blue-700 font-bold px-4 py-2 rounded-xl transition shadow-sm"
                                    >
                                      <Send className="w-3.5 h-3.5" />
                                      Submit
                                    </button>
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  )}

                  {/* TAB 2: PERILAKU ASN BER-AKHLAK */}
                  {activeTab === 'behavior' && (
                    <div className="space-y-6">
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-indigo-50 border border-indigo-100 rounded-2xl px-5 py-4 gap-4">
                        <div>
                          <h4 className="font-extrabold text-indigo-900 text-sm">Nilai Perilaku Rata-Rata</h4>
                          <p className="text-xs text-indigo-700 mt-0.5">Rata-rata kumulatif dari 8 nilai aspek perilaku di bawah.</p>
                        </div>
                        <div className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-xl font-black text-2xl shadow-sm">
                          <TrendingUp className="w-5 h-5" />
                          {calculateBehaviorAvg()}
                        </div>
                      </div>

                      {behaviorForm.status === 'submitted' && (
                        <div className="bg-emerald-50 border border-emerald-100 text-emerald-800 px-4 py-3 rounded-xl flex items-center gap-3 text-xs">
                          <CheckCircle className="w-5 h-5 text-emerald-600" />
                          <span>Evaluasi Perilaku telah <strong>Submitted</strong> ke Kepala BPS. Formulir bersifat terkunci (read-only).</span>
                        </div>
                      )}

                      <div className="space-y-5 pt-2">
                        {BEHAVIOR_ASPECTS.map(aspect => {
                          const val = behaviorForm[aspect.key] || 0;
                          return (
                            <div key={aspect.key} className="space-y-1.5">
                              <div className="flex justify-between items-end">
                                <div>
                                  <label className="text-sm font-bold text-gray-800">{aspect.label}</label>
                                  <p className="text-[11px] text-gray-500 leading-tight">{aspect.desc}</p>
                                </div>
                                <span className="w-12 text-right text-sm font-extrabold text-indigo-600 font-mono bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100">
                                  {val}
                                </span>
                              </div>
                              <div className="flex items-center gap-4">
                                <input
                                  type="range"
                                  min="0"
                                  max="100"
                                  disabled={behaviorForm.status === 'submitted' || loading}
                                  value={val}
                                  onChange={(e) => handleBehaviorSliderChange(aspect.key, e.target.value)}
                                  className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600 disabled:opacity-60"
                                />
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      <div className="space-y-1.5 pt-2">
                        <label className="text-sm font-bold text-gray-800 flex items-center gap-1.5">
                          <MessageSquare className="w-4 h-4 text-gray-500" />
                          Catatan Perilaku
                        </label>
                        <textarea
                          rows={3}
                          disabled={behaviorForm.status === 'submitted' || loading}
                          value={behaviorForm.notes}
                          onChange={(e) => setBehaviorForm(prev => ({ ...prev, notes: e.target.value }))}
                          placeholder="Berikan catatan mengenai perilaku, etos kerja, atau sikap teladan pegawai selama kuartal ini (opsional)..."
                          className="w-full border border-gray-200 disabled:bg-gray-50 disabled:text-gray-500 rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-300 resize-none"
                        />
                      </div>

                      {behaviorForm.status !== 'submitted' && (
                        <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
                          <button
                            type="button"
                            disabled={loading}
                            onClick={() => handleSaveBehavior('draft')}
                            className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-800 font-bold border border-gray-200 px-4 py-2.5 rounded-xl hover:bg-gray-50 transition"
                          >
                            <Save className="w-4 h-4" />
                            Simpan Draft
                          </button>
                          <button
                            type="button"
                            disabled={loading}
                            onClick={() => handleSaveBehavior('submitted')}
                            className="flex items-center gap-2 text-sm text-white bg-indigo-600 hover:bg-indigo-700 font-bold px-6 py-2.5 rounded-xl transition shadow-md"
                          >
                            <Send className="w-4 h-4" />
                            Submit Final Perilaku
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-2xl p-16 text-center shadow-sm border border-gray-100">
                <User className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-bold text-gray-700">Pilih Anggota Tim</h3>
                <p className="text-gray-400 mt-1 max-w-sm mx-auto">
                  Pilih salah satu anggota tim pelaksana di samping untuk memulai pengisian evaluasi kinerja kegiatan atau nilai perilaku.
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
