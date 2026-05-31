import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import { 
  ClipboardList, 
  Search, 
  Save, 
  Send, 
  CheckCircle, 
  AlertCircle, 
  Calendar,
  Users,
  Clock,
  ThumbsUp,
  FileSpreadsheet
} from 'lucide-react';

export default function PenilaianPresensi() {
  const { user } = useAuth();
  const [period, setPeriod] = useState('2026-Q2');
  const [employees, setEmployees] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Track changes made by user: employee_id -> { score, notes }
  const [changes, setChanges] = useState({});
  
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const loadAttendance = async () => {
    setLoading(true);
    setErrorMsg('');
    setSuccessMsg('');
    try {
      const res = await api.get(`/assessments/kasubag/attendance?period=${period}`);
      setEmployees(res.data);
      
      // Initialize local state of attendance inputs
      const initialChanges = {};
      res.data.forEach(emp => {
        initialChanges[emp.employee_id] = {
          attendance_score: emp.attendance_score !== null ? Math.round(emp.attendance_score) : '',
          notes: emp.notes || '',
          status: emp.evaluation_status || 'draft'
        };
      });
      setChanges(initialChanges);
    } catch (err) {
      console.error('Gagal mengambil data presensi:', err);
      setErrorMsg('Gagal memuat daftar presensi pegawai. Pastikan role Anda adalah Kasubag.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAttendance();
  }, [period]);

  const handleScoreChange = (empId, val) => {
    // Validate score is within 0-100
    if (val !== '') {
      const score = parseFloat(val);
      if (score < 0 || score > 100 || isNaN(score)) return;
    }
    setChanges(prev => ({
      ...prev,
      [empId]: {
        ...prev[empId],
        attendance_score: val
      }
    }));
  };

  const handleNotesChange = (empId, val) => {
    setChanges(prev => ({
      ...prev,
      [empId]: {
        ...prev[empId],
        notes: val
      }
    }));
  };

  // Save single employee attendance
  const saveSingle = async (empId, submitStatus) => {
    const input = changes[empId];
    if (input.attendance_score === '') {
      alert('Mohon masukkan skor presensi (0 - 100) terlebih dahulu!');
      return;
    }
    
    if (submitStatus === 'submitted' && !confirm('Apakah Anda yakin ingin men-submit penilaian presensi ini? Data yang disubmit akan dikirim ke Kepala BPS dan tidak dapat diubah lagi.')) {
      return;
    }

    setActionLoading(true);
    setErrorMsg('');
    setSuccessMsg('');
    try {
      await api.post('/assessments/kasubag/attendance', {
        employee_id: empId,
        period,
        attendance_score: input.attendance_score,
        notes: input.notes,
        status: submitStatus
      });
      
      setSuccessMsg(`Penilaian presensi berhasil disimpan sebagai ${submitStatus === 'submitted' ? 'Submitted' : 'Draft'}`);
      loadAttendance();
    } catch (err) {
      console.error('Gagal menyimpan presensi:', err);
      setErrorMsg(err.response?.data?.message || 'Gagal menyimpan penilaian presensi.');
    } finally {
      setActionLoading(false);
    }
  };

  // Bulk Save/Submit for all non-submitted rows
  const handleBulkAction = async (submitStatus) => {
    const targets = employees.filter(emp => emp.evaluation_status !== 'submitted');
    
    if (targets.length === 0) {
      alert('Semua pegawai sudah berstatus Submitted!');
      return;
    }

    // Verify all targets have valid scores
    const invalid = targets.some(emp => changes[emp.employee_id].attendance_score === '');
    if (invalid) {
      alert('Ada pegawai yang belum diisi skor presensinya. Mohon isi skor untuk seluruh pegawai terlebih dahulu!');
      return;
    }

    if (submitStatus === 'submitted' && !confirm(`Apakah Anda yakin ingin men-submit ${targets.length} penilaian presensi sekaligus? Penilaian akan dikirim ke Kepala BPS dan terkunci.`)) {
      return;
    }

    setActionLoading(true);
    setErrorMsg('');
    setSuccessMsg('');
    
    try {
      const promises = targets.map(emp => {
        const input = changes[emp.employee_id];
        return api.post('/assessments/kasubag/attendance', {
          employee_id: emp.employee_id,
          period,
          attendance_score: input.attendance_score,
          notes: input.notes,
          status: submitStatus
        });
      });

      await Promise.all(promises);
      setSuccessMsg(`Berhasil menyimpan massal ${targets.length} pegawai sebagai ${submitStatus === 'submitted' ? 'Submitted' : 'Draft'}`);
      loadAttendance();
    } catch (err) {
      console.error('Gagal melakukan aksi massal presensi:', err);
      setErrorMsg('Terjadi kesalahan saat memproses penyimpanan massal. Beberapa data mungkin gagal disimpan.');
    } finally {
      setActionLoading(false);
    }
  };

  // Filters
  const filteredEmployees = employees.filter(emp => 
    emp.employee_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (emp.nip && emp.nip.includes(searchQuery))
  );

  // Statistics
  const totalCount = employees.length;
  const submittedCount = employees.filter(e => e.evaluation_status === 'submitted').length;
  const draftCount = employees.filter(e => e.evaluation_status === 'draft').length;
  const pendingCount = totalCount - submittedCount - draftCount;

  return (
    <div className="space-y-6">
      {/* ── HEADER & PERIOD ── */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
        <div>
          <h2 className="text-2xl font-extrabold text-gray-800">Evaluasi Presensi (Kasubag)</h2>
          <p className="text-sm text-gray-500 mt-1">
            Inputkan skor kehadiran (presensi) 0 - 100 karyawan BPS Kabupaten Solok untuk perhitungan nilai akhir kuartal.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Calendar className="w-5 h-5 text-blue-600" />
          <span className="text-sm font-semibold text-gray-600">Periode Kuartal:</span>
          <select 
            value={period} 
            onChange={(e) => setPeriod(e.target.value)}
            className="border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-bold text-gray-800 outline-none focus:ring-2 focus:ring-blue-300 bg-gray-50 cursor-pointer"
          >
            <option value="2026-Q1">2026 - Kuartal I (Q1)</option>
            <option value="2026-Q2">2026 - Kuartal II (Q2)</option>
            <option value="2026-Q3">2026 - Kuartal III (Q3)</option>
            <option value="2026-Q4">2026 - Kuartal IV (Q4)</option>
          </select>
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
        {[
          { label: 'Total Pegawai', val: totalCount, color: 'from-blue-500 to-blue-600', icon: Users },
          { label: 'Belum Dinilai', val: pendingCount, color: 'from-gray-500 to-gray-600', icon: Clock },
          { label: 'Disimpan Draft', val: draftCount, color: 'from-amber-400 to-orange-500', icon: ClipboardList },
          { label: 'Submitted', val: submittedCount, color: 'from-emerald-500 to-teal-600', icon: ThumbsUp }
        ].map((c, i) => (
          <div key={i} className={`bg-gradient-to-br ${c.color} rounded-2xl p-5 text-white shadow-md relative overflow-hidden`}>
            <p className="text-sm font-medium opacity-80 text-white">{c.label}</p>
            <p className="text-3xl font-black mt-1">{c.val}</p>
            <c.icon className="absolute right-4 bottom-4 w-10 h-10 opacity-15 text-white" />
          </div>
        ))}
      </div>

      {/* ── TABLE CARD ── */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {/* Table Filter and Bulk Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-between p-6 gap-4 border-b border-gray-100 bg-gray-50/50">
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

          <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
            <button
              onClick={() => handleBulkAction('draft')}
              disabled={loading || actionLoading || employees.length === 0}
              className="flex items-center justify-center gap-2 border border-gray-200 hover:bg-gray-50 text-gray-700 bg-white text-xs font-bold px-4 py-2.5 rounded-xl transition shadow-sm disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              Simpan Draft Massal
            </button>
            <button
              onClick={() => handleBulkAction('submitted')}
              disabled={loading || actionLoading || employees.length === 0}
              className="flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-5 py-2.5 rounded-xl transition shadow-md disabled:opacity-50"
            >
              <Send className="w-4 h-4" />
              Submit Semua
            </button>
          </div>
        </div>

        {/* Main Table */}
        <div className="overflow-x-auto">
          {loading ? (
            <div className="text-center py-20 text-gray-500 font-medium">Memuat data presensi...</div>
          ) : filteredEmployees.length === 0 ? (
            <div className="text-center py-20 text-gray-400 italic">
              {searchQuery ? 'Tidak ada pegawai yang cocok dengan kata kunci pencarian.' : 'Belum ada data pegawai.'}
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-gray-100">
                  <th className="px-6 py-4 text-left text-xs font-extrabold text-slate-500 uppercase tracking-wider w-16">No</th>
                  <th className="px-6 py-4 text-left text-xs font-extrabold text-slate-500 uppercase tracking-wider">Nama / NIP</th>
                  <th className="px-6 py-4 text-left text-xs font-extrabold text-slate-500 uppercase tracking-wider">Jabatan</th>
                  <th className="px-6 py-4 text-left text-xs font-extrabold text-slate-500 uppercase tracking-wider w-40">Skor Presensi (0-100)</th>
                  <th className="px-6 py-4 text-left text-xs font-extrabold text-slate-500 uppercase tracking-wider">Catatan Kehadiran</th>
                  <th className="px-6 py-4 text-center text-xs font-extrabold text-slate-500 uppercase tracking-wider w-36">Status</th>
                  <th className="px-6 py-4 text-center text-xs font-extrabold text-slate-500 uppercase tracking-wider w-48">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filteredEmployees.map((emp, i) => {
                  const input = changes[emp.employee_id] || { attendance_score: '', notes: '', status: 'draft' };
                  const isSubmitted = emp.evaluation_status === 'submitted';
                  
                  return (
                    <tr key={emp.employee_id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4 text-gray-400 font-bold">{i + 1}</td>
                      <td className="px-6 py-4">
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
                      <td className="px-6 py-4 text-xs font-medium text-gray-600">{emp.jabatan || 'Staf Pelaksana'}</td>
                      <td className="px-6 py-4">
                        <input 
                          type="number" 
                          min="0"
                          max="100"
                          disabled={isSubmitted || actionLoading}
                          value={input.attendance_score}
                          onChange={(e) => handleScoreChange(emp.employee_id, e.target.value)}
                          placeholder="Nilai 0-100"
                          className="w-full border border-gray-200 disabled:bg-gray-50 disabled:text-gray-500 rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-300 font-bold"
                        />
                      </td>
                      <td className="px-6 py-4">
                        <input 
                          type="text" 
                          disabled={isSubmitted || actionLoading}
                          value={input.notes}
                          onChange={(e) => handleNotesChange(emp.employee_id, e.target.value)}
                          placeholder="Masukkan keterangan kehadiran (opsional)..."
                          className="w-full border border-gray-200 disabled:bg-gray-50 disabled:text-gray-500 rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-300 resize-none"
                        />
                      </td>
                      <td className="px-6 py-4 text-center">
                        {isSubmitted ? (
                          <span className="text-[11px] font-bold px-3 py-1 bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-full">
                            ✓ Submitted
                          </span>
                        ) : emp.evaluation_status === 'draft' ? (
                          <span className="text-[11px] font-bold px-3 py-1 bg-amber-100 text-amber-700 border border-amber-200 rounded-full">
                            ⏳ Draft
                          </span>
                        ) : (
                          <span className="text-[11px] font-bold px-3 py-1 bg-gray-100 text-gray-600 border border-gray-200 rounded-full">
                            Pending
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-center">
                        {!isSubmitted ? (
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => saveSingle(emp.employee_id, 'draft')}
                              disabled={actionLoading}
                              title="Simpan sebagai draft"
                              className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl border border-gray-100 transition"
                            >
                              <Save className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => saveSingle(emp.employee_id, 'submitted')}
                              disabled={actionLoading}
                              title="Submit final"
                              className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-3 py-2 rounded-xl transition shadow-sm"
                            >
                              <Send className="w-3.5 h-3.5" />
                              Submit
                            </button>
                          </div>
                        ) : (
                          <span className="text-xs text-gray-400 italic">Evaluasi terkunci</span>
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
    </div>
  );
}
