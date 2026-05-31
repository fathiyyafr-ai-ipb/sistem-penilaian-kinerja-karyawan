import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import { 
  ClipboardList, 
  Search, 
  CheckCircle, 
  AlertCircle, 
  Calendar,
  Users,
  Lock,
  Globe,
  MessageSquare,
  HelpCircle,
  X,
  Sparkles
} from 'lucide-react';

export default function PenilaianBps() {
  const { user } = useAuth();
  const [period, setPeriod] = useState('2026-Q2');
  const [reviewData, setReviewData] = useState([]);
  const [weights, setWeights] = useState({ kinerja_weight: 50, perilaku_weight: 30, presensi_weight: 20 });
  const [searchQuery, setSearchQuery] = useState('');
  
  // Validation modal state
  const [selectedEmp, setSelectedEmp] = useState(null);
  const [validationNotes, setValidationNotes] = useState('');
  const [pureLeaderKinerja, setPureLeaderKinerja] = useState(0);
  const [pureLeaderPerilaku, setPureLeaderPerilaku] = useState(0);
  
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const loadBpsReview = async () => {
    setLoading(true);
    setErrorMsg('');
    setSuccessMsg('');
    try {
      const res = await api.get(`/assessments/bps/review?period=${period}`);
      setReviewData(res.data.review);
      if (res.data.weights) {
        setWeights(res.data.weights);
      }
    } catch (err) {
      console.error('Gagal mengambil data review BPS:', err);
      setErrorMsg('Gagal memuat rekapitulasi penilaian. Pastikan role Anda adalah Kepala BPS.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBpsReview();
  }, [period]);

  const handleOpenValidateModal = (emp) => {
    setSelectedEmp(emp);
    setValidationNotes(emp.bps_notes || '');
    if (emp.is_pure_leader) {
      setPureLeaderKinerja(emp.kinerja_score || 0);
      setPureLeaderPerilaku(emp.perilaku_score || 0);
    }
  };

  const handleSaveValidation = async (e) => {
    e.preventDefault();
    if (!selectedEmp) return;

    setActionLoading(true);
    setErrorMsg('');
    setSuccessMsg('');
    try {
      const payload = {
        employee_id: selectedEmp.employee_id,
        period,
        notes: validationNotes
      };
      if (selectedEmp.is_pure_leader) {
        payload.kinerja_score = parseFloat(pureLeaderKinerja);
        payload.perilaku_score = parseFloat(pureLeaderPerilaku);
      }
      await api.post('/assessments/bps/validate', payload);
      setSuccessMsg(`Berhasil memvalidasi penilaian untuk ${selectedEmp.employee_name}`);
      setSelectedEmp(null);
      loadBpsReview();
    } catch (err) {
      console.error('Gagal memvalidasi pegawai:', err);
      setErrorMsg(err.response?.data?.message || 'Gagal memvalidasi penilaian.');
    } finally {
      setActionLoading(false);
    }
  };

  const handlePublishPeriod = async () => {
    const pendingCount = reviewData.filter(emp => emp.validation_status === 'pending').length;
    
    if (pendingCount > 0) {
      const confirmText = "Semua penilaian karyawan akan tervalidasi.\n\nApakah Anda ingin melanjutkan?";
      if (!confirm(confirmText)) {
        return;
      }
    } else {
      if (!confirm(`Apakah Anda yakin ingin mempublikasikan penilaian kuartal ${period}? \n\nHal ini akan mengunci seluruh nilai yang telah divalidasi dan merilis kartu nilai beserta predikat Best Employee ke seluruh pegawai BPS Kabupaten Solok.`)) {
        return;
      }
    }

    setActionLoading(true);
    setErrorMsg('');
    setSuccessMsg('');
    try {
      const res = await api.post('/assessments/bps/publish', { period });
      setSuccessMsg(res.data.message || `Berhasil menerbitkan penilaian untuk periode ${period}.`);
      loadBpsReview();
    } catch (err) {
      console.error('Gagal mempublikasikan kuartal:', err);
      setErrorMsg(err.response?.data?.message || 'Gagal mempublikasikan penilaian kuartal.');
    } finally {
      setActionLoading(false);
    }
  };

  // Helper status badge styling
  const getComponentStatusBadge = (status) => {
    if (status === 'submitted') {
      return <span className="text-[10px] font-extrabold px-2 py-0.5 bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-full">Submitted</span>;
    }
    if (status === 'draft') {
      return <span className="text-[10px] font-extrabold px-2 py-0.5 bg-amber-100 text-amber-700 border border-amber-200 rounded-full">Draft</span>;
    }
    return <span className="text-[10px] font-extrabold px-2 py-0.5 bg-gray-100 text-gray-500 border border-gray-200 rounded-full">Pending</span>;
  };

  const getValidationBadge = (status) => {
    if (status === 'published') {
      return <span className="text-[11px] font-bold px-3 py-1 bg-gradient-to-r from-amber-500 to-yellow-500 text-white rounded-full border border-amber-300 shadow-sm flex items-center gap-1 w-max">★ Published</span>;
    }
    if (status === 'validated') {
      return <span className="text-[11px] font-bold px-3 py-1 bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-full flex items-center gap-1 w-max">✓ Validated</span>;
    }
    return <span className="text-[11px] font-bold px-3 py-1 bg-gray-100 text-gray-600 border border-gray-200 rounded-full flex items-center gap-1 w-max">⏳ Pending</span>;
  };

  // Filters
  const filteredData = reviewData.filter(emp => 
    emp.employee_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (emp.nip && emp.nip.includes(searchQuery))
  );

  // Statistics calculations
  const totalCount = reviewData.length;
  const readyCount = reviewData.filter(emp => emp.can_validate && emp.validation_status === 'pending').length;
  const validatedCount = reviewData.filter(emp => emp.validation_status === 'validated').length;
  const publishedCount = reviewData.filter(emp => emp.validation_status === 'published').length;
  
  // Overall completion progress percentage
  const totalComponents = totalCount * 3;
  const submittedComponentsCount = reviewData.reduce((acc, emp) => {
    let count = 0;
    if (emp.kinerja_status === 'submitted') count++;
    if (emp.perilaku_status === 'submitted') count++;
    if (emp.presensi_status === 'submitted') count++;
    return acc + count;
  }, 0);
  
  const completionPercentage = totalComponents > 0 ? Math.round((submittedComponentsCount / totalComponents) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* ── HEADER & FINALISASI ── */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
        <div>
          <h2 className="text-2xl font-extrabold text-gray-800 font-sans flex items-center gap-2">
            Validasi Pimpinan (Kepala BPS)
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Verifikasi keselarasan 3 komponen penilaian pegawai dan publikasikan secara resmi ke seluruh staf BPS.
          </p>
        </div>
        
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-3 bg-gray-50 border border-gray-200 rounded-xl px-4 py-2">
            <Calendar className="w-5 h-5 text-blue-600" />
            <select 
              value={period} 
              onChange={(e) => setPeriod(e.target.value)}
              className="font-bold text-sm text-gray-800 bg-transparent outline-none cursor-pointer"
            >
              <option value="2026-Q1">2026 - Kuartal I (Q1)</option>
              <option value="2026-Q2">2026 - Kuartal II (Q2)</option>
              <option value="2026-Q3">2026 - Kuartal III (Q3)</option>
              <option value="2026-Q4">2026 - Kuartal IV (Q4)</option>
            </select>
          </div>

          <button
            onClick={handlePublishPeriod}
            disabled={loading || actionLoading || validatedCount === 0}
            className="flex items-center justify-center gap-2 bg-gradient-to-r from-blue-700 to-indigo-700 hover:from-blue-800 hover:to-indigo-800 text-white font-extrabold text-sm px-5 py-3 rounded-xl shadow-md transition disabled:opacity-50"
          >
            <Globe className="w-4 h-4" />
            FINALISASI & PUBLISH
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

      {/* ── METRIC BLOCK ── */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl p-5 text-white shadow-md relative overflow-hidden">
          <p className="text-sm font-medium opacity-80 text-white">Total Staf Dinilai</p>
          <p className="text-3xl font-black mt-1">{totalCount}</p>
        </div>
        <div className="bg-gradient-to-br from-amber-500 to-orange-500 rounded-2xl p-5 text-white shadow-md relative overflow-hidden">
          <p className="text-sm font-medium opacity-80 text-white">Siap Validasi (Komplit)</p>
          <p className="text-3xl font-black mt-1">{readyCount} <span className="text-xs font-normal opacity-85">Pegawai</span></p>
        </div>
        <div className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl p-5 text-white shadow-md relative overflow-hidden">
          <p className="text-sm font-medium opacity-80 text-white">Tervalidasi / Published</p>
          <p className="text-3xl font-black mt-1">{validatedCount + publishedCount} <span className="text-xs font-normal opacity-85">/ {totalCount} Pegawai</span></p>
        </div>
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
          <p className="text-sm font-bold text-gray-500">Progress Kelengkapan Data</p>
          <div className="flex items-center gap-3 mt-2">
            <div className="w-full bg-gray-100 rounded-full h-3">
              <div 
                className="bg-blue-600 h-3 rounded-full transition-all duration-500" 
                style={{ width: `${completionPercentage}%` }}
              />
            </div>
            <span className="font-extrabold text-blue-600 text-lg">{completionPercentage}%</span>
          </div>
          <p className="text-[10px] text-gray-400 mt-1 font-semibold">
            {submittedComponentsCount} dari {totalComponents} berkas komponen telah disubmit atasan.
          </p>
        </div>
      </div>

      {/* Weights Indicator */}
      <div className="bg-gray-50 border border-gray-100 rounded-2xl px-6 py-4 flex flex-wrap gap-6 items-center">
        <span className="text-xs font-extrabold text-slate-500 uppercase tracking-wider">
          ⚙️ Bobot Nilai Akhir Aktif:
        </span>
        <div className="flex gap-4">
          <span className="text-sm text-gray-700">Kinerja: <strong>{weights.kinerja_weight}%</strong></span>
          <span className="text-sm text-gray-700">Perilaku: <strong>{weights.perilaku_weight}%</strong></span>
          <span className="text-sm text-gray-700">Presensi: <strong>{weights.presensi_weight}%</strong></span>
        </div>
      </div>

      {/* ── TABLE CARD ── */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {/* Table Filter */}
        <div className="p-6 border-b border-gray-100 bg-gray-50/50 flex flex-col sm:flex-row justify-between items-center gap-4">
          <h3 className="font-extrabold text-gray-800 text-sm">Tabel Pengesahan Hasil Penilaian</h3>
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
            <input 
              type="text" 
              placeholder="Cari nama atau NIP pegawai..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm outline-none focus:ring-2 focus:ring-blue-300 bg-white"
            />
          </div>
        </div>

        {/* Main Table */}
        <div className="overflow-x-auto">
          {loading ? (
            <div className="text-center py-20 text-gray-500 font-medium">Memuat data review...</div>
          ) : filteredData.length === 0 ? (
            <div className="text-center py-20 text-gray-400 italic">
              {searchQuery ? 'Tidak ada data yang cocok dengan kata kunci pencarian.' : 'Belum ada data pegawai.'}
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-gray-100">
                  <th className="px-5 py-4 text-left text-xs font-extrabold text-slate-500 uppercase tracking-wider w-16">No</th>
                  <th className="px-5 py-4 text-left text-xs font-extrabold text-slate-500 uppercase tracking-wider">Nama / NIP</th>
                  <th className="px-5 py-4 text-left text-xs font-extrabold text-slate-500 uppercase tracking-wider">Jabatan</th>
                  <th className="px-5 py-4 text-center text-xs font-extrabold text-slate-500 uppercase tracking-wider">Kinerja ({weights.kinerja_weight}%)</th>
                  <th className="px-5 py-4 text-center text-xs font-extrabold text-slate-500 uppercase tracking-wider">Perilaku ({weights.perilaku_weight}%)</th>
                  <th className="px-5 py-4 text-center text-xs font-extrabold text-slate-500 uppercase tracking-wider">Presensi ({weights.presensi_weight}%)</th>
                  <th className="px-5 py-4 text-center text-xs font-extrabold text-slate-500 uppercase tracking-wider bg-blue-50/20">Nilai Terbobot</th>
                  <th className="px-5 py-4 text-left text-xs font-extrabold text-slate-500 uppercase tracking-wider">Status Validasi</th>
                  <th className="px-5 py-4 text-center text-xs font-extrabold text-slate-500 uppercase tracking-wider w-40">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filteredData.map((emp, i) => {
                  return (
                    <tr key={emp.employee_id} className="hover:bg-slate-50/30 transition-colors">
                      <td className="px-5 py-4 text-gray-400 font-bold">{i + 1}</td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 bg-gray-100 rounded-full flex items-center justify-center font-bold text-sm text-gray-600 flex-shrink-0">
                            {emp.employee_name.charAt(0)}
                          </div>
                          <div>
                            <p className="font-bold text-gray-800 leading-tight">{emp.employee_name}</p>
                            <p className="text-[11px] text-gray-400 font-mono mt-0.5">{emp.nip || '-'}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4 text-xs font-semibold text-gray-600">{emp.jabatan || 'Staf Pelaksana'}</td>
                      
                      {/* Kinerja component */}
                      <td className="px-5 py-4 text-center">
                        <p className="font-bold text-gray-700">{emp.kinerja_score ? emp.kinerja_score.toFixed(2) : '-'}</p>
                        <div className="mt-1">{getComponentStatusBadge(emp.kinerja_status)}</div>
                      </td>
                      
                      {/* Perilaku component */}
                      <td className="px-5 py-4 text-center">
                        <p className="font-bold text-gray-700">{emp.perilaku_score ? emp.perilaku_score.toFixed(2) : '-'}</p>
                        <div className="mt-1">{getComponentStatusBadge(emp.perilaku_status)}</div>
                      </td>
                      
                      {/* Presensi component */}
                      <td className="px-5 py-4 text-center">
                        <p className="font-bold text-gray-700">{emp.presensi_score ? emp.presensi_score.toFixed(2) : '-'}</p>
                        <div className="mt-1">{getComponentStatusBadge(emp.presensi_status)}</div>
                      </td>
                      
                      {/* Live Calculated Final Weighted Score */}
                      <td className="px-5 py-4 text-center bg-blue-50/30">
                        <span className="text-blue-700 font-extrabold text-base">{emp.final_score ? emp.final_score.toFixed(2) : '-'}</span>
                      </td>

                      <td className="px-5 py-4">
                        {getValidationBadge(emp.validation_status)}
                      </td>
                      
                      <td className="px-5 py-4 text-center">
                        {emp.validation_status === 'published' ? (
                          <span className="text-xs text-gray-400 italic">Locked</span>
                        ) : emp.validation_status === 'validated' ? (
                          <button
                            onClick={() => handleOpenValidateModal(emp)}
                            disabled={actionLoading}
                            className="text-xs font-semibold text-blue-600 hover:text-blue-800 transition underline"
                          >
                            Ubah Catatan
                          </button>
                        ) : emp.can_validate ? (
                          <button
                            onClick={() => handleOpenValidateModal(emp)}
                            disabled={actionLoading}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-3.5 py-2 rounded-xl transition shadow-sm flex items-center gap-1.5 mx-auto"
                          >
                            <CheckCircle className="w-3.5 h-3.5" />
                            Validasi
                          </button>
                        ) : (
                          <div className="flex items-center justify-center gap-1 text-[11px] font-semibold text-amber-600 bg-amber-50 border border-amber-100 rounded-lg py-1 px-2.5 w-max mx-auto" title="Menunggu berkas disubmit oleh Ketua Tim & Kasubag">
                            <Lock className="w-3 h-3 flex-shrink-0" />
                            Belum Lengkap
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* ── MODAL: VALIDASI PENILAIAN ── */}
      {selectedEmp && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="bg-gradient-to-r from-blue-700 to-indigo-700 px-6 py-5 flex items-center justify-between text-white">
              <div>
                <h3 className="font-extrabold text-lg">Validasi Penilaian Staf</h3>
                <p className="text-xs opacity-85 mt-0.5">{selectedEmp.employee_name} — NIP: {selectedEmp.nip || '-'}</p>
              </div>
              <button 
                onClick={() => setSelectedEmp(null)} 
                className="p-1 hover:bg-white/20 rounded-lg transition"
              >
                <X className="w-5 h-5 text-white" />
              </button>
            </div>

            <form onSubmit={handleSaveValidation} className="p-6 space-y-5">
              {selectedEmp.is_pure_leader ? (
                // Pure leader direct inputs
                <div className="space-y-4">
                  <div className="bg-amber-50 border border-amber-200 text-amber-800 text-xs px-3.5 py-2.5 rounded-xl font-bold">
                    ℹ️ Pegawai ini adalah Kepala Tim (Pure Leader) yang dinilai langsung oleh Kepala BPS untuk Kinerja dan Perilaku.
                  </div>
                  <div>
                    <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Skor Kinerja (50%)</label>
                    <input 
                      type="number" 
                      min="0" 
                      max="100" 
                      step="0.01" 
                      required 
                      value={pureLeaderKinerja} 
                      onChange={e => setPureLeaderKinerja(e.target.value)}
                      className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-100 font-bold"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Skor Perilaku (30%)</label>
                    <input 
                      type="number" 
                      min="0" 
                      max="100" 
                      step="0.01" 
                      required 
                      value={pureLeaderPerilaku} 
                      onChange={e => setPureLeaderPerilaku(e.target.value)}
                      className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-100 font-bold"
                    />
                  </div>
                  <div className="bg-blue-50/60 rounded-2xl p-4 border border-blue-100 space-y-1.5 text-xs text-gray-600">
                    <div className="flex justify-between">
                      <span>Presensi ({weights.presensi_weight}%)</span>
                      <span className="font-bold text-gray-800">{selectedEmp.presensi_score ? selectedEmp.presensi_score.toFixed(2) : '-'}</span>
                    </div>
                    <div className="border-t border-blue-200 pt-2.5 flex justify-between items-center">
                      <span className="text-xs font-extrabold text-blue-800">Nilai Akhir Terbobot</span>
                      <span className="text-2xl font-black text-blue-800">
                        {((parseFloat(pureLeaderKinerja || 0) * (weights.kinerja_weight / 100)) + 
                          (parseFloat(pureLeaderPerilaku || 0) * (weights.perilaku_weight / 100)) + 
                          (parseFloat(selectedEmp.presensi_score || 0) * (weights.presensi_weight / 100))).toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              ) : (
                // Regular employee read-only breakdown
                <div className="bg-blue-50/60 rounded-2xl p-4 border border-blue-100 space-y-2.5">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-blue-700">Rincian Komponen Terbobot</h4>
                  <div className="space-y-1.5 text-xs text-gray-600">
                    <div className="flex justify-between">
                      <span>1. Rata-rata Kinerja ({weights.kinerja_weight}%)</span>
                      <span className="font-bold text-gray-800">{selectedEmp.kinerja_score ? selectedEmp.kinerja_score.toFixed(2) : '-'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>2. Rata-rata Perilaku ({weights.perilaku_weight}%)</span>
                      <span className="font-bold text-gray-800">{selectedEmp.perilaku_score ? selectedEmp.perilaku_score.toFixed(2) : '-'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>3. Kehadiran Presensi ({weights.presensi_weight}%)</span>
                      <span className="font-bold text-gray-800">{selectedEmp.presensi_score ? selectedEmp.presensi_score.toFixed(2) : '-'}</span>
                    </div>
                  </div>
                  <div className="border-t border-blue-200 pt-2.5 flex justify-between items-center">
                    <span className="text-xs font-extrabold text-blue-800">Nilai Akhir Terbobot</span>
                    <span className="text-2xl font-black text-blue-800">{selectedEmp.final_score ? selectedEmp.final_score.toFixed(2) : '-'}</span>
                  </div>
                </div>
              )}

              <div className="space-y-1.5">
                <label className="text-sm font-bold text-gray-800 flex items-center gap-1.5">
                  <MessageSquare className="w-4 h-4 text-gray-500" />
                  Catatan Validasi Kepala BPS
                </label>
                <textarea
                  rows={3}
                  value={validationNotes}
                  onChange={(e) => setValidationNotes(e.target.value)}
                  placeholder="Berikan saran, apresiasi, atau rekomendasi perbaikan untuk karyawan bersangkutan (opsional)..."
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-300 resize-none"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button 
                  type="button" 
                  onClick={() => setSelectedEmp(null)}
                  className="flex-1 border border-gray-200 rounded-xl py-2.5 text-sm font-bold hover:bg-gray-50 transition"
                >
                  Batal
                </button>
                <button 
                  type="submit" 
                  disabled={actionLoading}
                  className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl py-2.5 text-sm font-extrabold transition disabled:opacity-50 shadow-sm"
                >
                  {actionLoading ? 'Memproses...' : 'Setujui & Validasi'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
