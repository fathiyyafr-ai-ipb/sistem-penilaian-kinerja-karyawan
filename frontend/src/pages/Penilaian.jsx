import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import { 
  Plus, 
  Pencil, 
  Trash2, 
  CheckCircle, 
  Eye, 
  X, 
  ClipboardList,
  Calendar,
  Award,
  Trophy,
  Sliders,
  Settings,
  TrendingUp,
  User,
  Heart,
  CalendarDays,
  FileText,
  AlertCircle
} from 'lucide-react';

const BEHAVIOR_ASPECTS = [
  { key: 'orientasi_pelayanan', label: 'Orientasi Pelayanan' },
  { key: 'akuntabilitas', label: 'Akuntabilitas' },
  { key: 'kompetensi', label: 'Kompetensi' },
  { key: 'harmonis', label: 'Harmonis' },
  { key: 'loyal', label: 'Loyal' },
  { key: 'adaptif', label: 'Adaptif' },
  { key: 'kolaboratif', label: 'Kolaboratif' },
  { key: 'disiplin', label: 'Disiplin' }
];

function getPredicate(score) {
  const val = parseFloat(score);
  if (isNaN(val)) return 'N/A';
  if (val >= 90) return { label: 'SANGAT BAIK', color: 'text-emerald-600 bg-emerald-50 border-emerald-200' };
  if (val >= 80) return { label: 'BAIK', color: 'text-blue-600 bg-blue-50 border-blue-200' };
  if (val >= 70) return { label: 'CUKUP', color: 'text-amber-600 bg-amber-50 border-amber-200' };
  if (val >= 60) return { label: 'KURANG', color: 'text-orange-600 bg-orange-50 border-orange-200' };
  return { label: 'SANGAT KURANG', color: 'text-red-600 bg-red-50 border-red-200' };
}

export default function Penilaian() {
  const { user } = useAuth();
  const [period, setPeriod] = useState('2026-Q2');
  const [activeTab, setActiveTab] = useState('scorecard'); // 'scorecard' | 'admin-weights'
  
  // Pegawai Score Card states
  const [scoreSummary, setScoreSummary] = useState(null);
  const [scoreDetails, setScoreDetails] = useState(null);
  const [scoreError, setScoreError] = useState(false);
  const [loadingScore, setLoadingScore] = useState(false);
  
  // Top 3 Leaderboard states
  const [topEmployees, setTopEmployees] = useState([]);
  const [loadingLeaderboard, setLoadingLeaderboard] = useState(false);
  
  // Admin Weights states
  const [weights, setWeights] = useState({ kinerja_weight: 50, perilaku_weight: 30, presensi_weight: 20 });
  const [weightForm, setWeightForm] = useState({ kinerja_weight: 50, perilaku_weight: 30, presensi_weight: 20 });
  const [loadingWeights, setLoadingWeights] = useState(false);
  const [weightsSuccessMsg, setWeightsSuccessMsg] = useState('');
  const [weightsErrorMsg, setWeightsErrorMsg] = useState('');

  const isAdmin = user?.role === 'admin';

  // Load Pegawai Scores
  const loadMyScore = async () => {
    setLoadingScore(true);
    setScoreError(false);
    setScoreSummary(null);
    setScoreDetails(null);
    try {
      const res = await api.get(`/assessments/my-score?period=${period}`);
      setScoreSummary(res.data.summary);
      setScoreDetails(res.data.details);
    } catch (err) {
      console.error('Gagal mengambil skor saya:', err);
      setScoreError(true);
    } finally {
      setLoadingScore(false);
    }
  };

  // Load Top 3 Leaderboard
  const loadTop3 = async () => {
    setLoadingLeaderboard(true);
    try {
      const res = await api.get(`/assessments/top-3?period=${period}`);
      setTopEmployees(res.data);
    } catch (err) {
      console.error('Gagal mengambil data Top 3:', err);
    } finally {
      setLoadingLeaderboard(false);
    }
  };

  // Load Admin Weights
  const loadWeights = async () => {
    setLoadingWeights(true);
    try {
      const res = await api.get('/assessments/weights');
      setWeights(res.data);
      setWeightForm({
        kinerja_weight: res.data.kinerja_weight,
        perilaku_weight: res.data.perilaku_weight,
        presensi_weight: res.data.presensi_weight
      });
    } catch (err) {
      console.error('Gagal mengambil bobot penilaian:', err);
    } finally {
      setLoadingWeights(false);
    }
  };

  useEffect(() => {
    loadMyScore();
    loadTop3();
    if (isAdmin) {
      loadWeights();
    }
  }, [period]);

  // Handle weight adjustments
  const handleWeightChange = (field, value) => {
    const val = parseInt(value) || 0;
    setWeightForm(prev => ({
      ...prev,
      [field]: val
    }));
  };

  const handleSaveWeights = async (e) => {
    e.preventDefault();
    const sum = weightForm.kinerja_weight + weightForm.perilaku_weight + weightForm.presensi_weight;
    if (sum !== 100) {
      setWeightsErrorMsg(`Gagal menyimpan. Akumulasi bobot harus 100% (saat ini: ${sum}%)`);
      setWeightsSuccessMsg('');
      return;
    }

    setLoadingWeights(true);
    setWeightsErrorMsg('');
    setWeightsSuccessMsg('');
    try {
      const res = await api.put('/assessments/weights', weightForm);
      setWeightsSuccessMsg(res.data.message || 'Bobot penilaian berhasil diperbarui!');
      loadWeights();
    } catch (err) {
      console.error('Gagal menyimpan bobot:', err);
      setWeightsErrorMsg(err.response?.data?.message || 'Gagal menyimpan bobot penilaian.');
    } finally {
      setLoadingWeights(false);
    }
  };

  const predicateInfo = scoreSummary ? getPredicate(scoreSummary.final_score) : null;
  const weightsFormSum = weightForm.kinerja_weight + weightForm.perilaku_weight + weightForm.presensi_weight;

  return (
    <div className="space-y-6">
      {/* ── HEADER ── */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
        <div>
          <h2 className="text-2xl font-extrabold text-gray-800">Modul Penilaian Kinerja</h2>
          <p className="text-sm text-gray-500 mt-1">
            {isAdmin && 'Kelola bobot kriteria penilaian dinamis atau lihat visualisasi laporan nilai pegawai.'}
          </p>
        </div>
        
        <div className="flex flex-wrap items-center gap-3">
          {/* Admin Navigation Tabs */}
          {isAdmin && (
            <div className="flex bg-gray-200 p-1 rounded-xl mr-2">
              <button
                onClick={() => setActiveTab('scorecard')}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                  activeTab === 'scorecard' 
                    ? 'bg-white text-gray-800 shadow-sm' 
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                <Trophy className="w-3.5 h-3.5" />
                Score & Rankings
              </button>
              <button
                onClick={() => setActiveTab('admin-weights')}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                  activeTab === 'admin-weights' 
                    ? 'bg-white text-gray-800 shadow-sm' 
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                <Sliders className="w-3.5 h-3.5" />
                Bobot Nilai
              </button>
            </div>
          )}

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
        </div>
      </div>

      {/* ── VIEW FOR ADMIN WEIGHTS PANEL ── */}
      {isAdmin && activeTab === 'admin-weights' && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 max-w-2xl mx-auto space-y-6">
          <div className="flex items-center gap-3 border-b border-gray-100 pb-4">
            <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl">
              <Settings className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-extrabold text-gray-800 text-lg">Konfigurasi Bobot Penilaian Kuartal</h3>
              <p className="text-xs text-gray-500">Perubahan bobot akan langsung berdampak pada seluruh perhitungan nilai kuartal yang belum difinalisasi.</p>
            </div>
          </div>

          {weightsSuccessMsg && (
            <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-3 rounded-xl flex items-center gap-3">
              <CheckCircle className="w-5 h-5 flex-shrink-0" />
              <p className="text-sm font-medium">{weightsSuccessMsg}</p>
            </div>
          )}
          {weightsErrorMsg && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl flex items-center gap-3">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <p className="text-sm font-medium">{weightsErrorMsg}</p>
            </div>
          )}

          <form onSubmit={handleSaveWeights} className="space-y-6">
            <div className="space-y-5">
              {[
                { key: 'kinerja_weight', label: 'Bobot Evaluasi Kinerja (Rata-Rata Kegiatan)', desc: 'Mengukur ketuntasan dan kontribusi tugas di kuartal.' },
                { key: 'perilaku_weight', label: 'Bobot Nilai Perilaku (Ber-AKHLAK)', desc: 'Mengukur sikap, etika, dan keselarasan Core Values ASN.' },
                { key: 'presensi_weight', label: 'Bobot Presensi / Kehadiran', desc: 'Mengukur disiplin kehadiran kerja bulanan oleh Kasubag.' }
              ].map(item => (
                <div key={item.key} className="space-y-2">
                  <div className="flex justify-between items-end">
                    <div>
                      <label className="text-sm font-extrabold text-gray-800">{item.label}</label>
                      <p className="text-xs text-gray-400 mt-0.5">{item.desc}</p>
                    </div>
                    <div className="flex items-center gap-1">
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={weightForm[item.key]}
                        onChange={(e) => handleWeightChange(item.key, e.target.value)}
                        className="w-16 border border-gray-200 rounded-lg px-2 py-1 text-sm font-bold text-center outline-none focus:ring-2 focus:ring-blue-300"
                      />
                      <span className="text-sm font-bold text-gray-500">%</span>
                    </div>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={weightForm[item.key]}
                    onChange={(e) => handleWeightChange(item.key, e.target.value)}
                    className="w-full h-1.5 bg-gray-100 rounded-lg appearance-none cursor-pointer accent-blue-600"
                  />
                </div>
              ))}
            </div>

            {/* Sum indicator */}
            <div className={`p-4 rounded-xl flex justify-between items-center font-bold ${
              weightsFormSum === 100 
                ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' 
                : 'bg-red-50 text-red-700 border border-red-100'
            }`}>
              <span className="text-sm">Total Akumulasi Bobot</span>
              <span className="text-xl font-black">{weightsFormSum}% {weightsFormSum === 100 ? '(Valid)' : '(Harus 100%)'}</span>
            </div>

            <button
              type="submit"
              disabled={loadingWeights || weightsFormSum !== 100}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-extrabold py-3 rounded-xl shadow-md transition disabled:opacity-50"
            >
              {loadingWeights ? 'Menyimpan...' : 'Simpan Konfigurasi Bobot'}
            </button>
          </form>
        </div>
      )}

      {/* ── PEGAWAI VIEW: SCORECARD & LEADERBOARD ── */}
      {(!isAdmin || activeTab === 'scorecard') && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* PANEL KIRI: SCORE CARD & DETAIL (lg:col-span-8) */}
          <div className="lg:col-span-8 space-y-6">
            {loadingScore ? (
              <div className="bg-white rounded-2xl p-16 text-center shadow-sm border border-gray-100">
                <p className="text-gray-500 font-semibold text-sm">Memuat rapor hasil penilaian Anda...</p>
              </div>
            ) : scoreError || !scoreSummary ? (
              <div className="bg-white rounded-2xl p-16 text-center shadow-sm border border-gray-100 space-y-4">
                <ClipboardList className="w-16 h-16 text-gray-300 mx-auto" />
                <h3 className="text-lg font-bold text-gray-700">Hasil Penilaian Belum Tersedia</h3>
                <p className="text-sm text-gray-400 max-w-sm mx-auto">
                  Hasil penilaian kinerja kuartal terpilih ({period}) belum selesai diproses atau belum resmi diterbitkan oleh Kepala BPS.
                </p>
                <div className="inline-block bg-blue-50 border border-blue-100 text-blue-700 text-xs px-4 py-2 rounded-xl">
                  Notifikasi akan dikirim secara instan ke akun Anda setelah periode ini dirilis.
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                {/* ── CIRCULAR CARD / HIGHLIGHT CARD ── */}
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden grid grid-cols-1 md:grid-cols-12">
                  {/* Left part: Simple final score */}
                  <div className="md:col-span-5 bg-blue-50 border-r border-blue-100 p-8 flex flex-col items-center justify-center text-center">
                    <p className="text-sm font-bold uppercase tracking-wide text-gray-500">Nilai Akhir Terbobot</p>
                    
                    <div className="mt-4 mb-4">
                      <span className="text-6xl font-black text-blue-700">{parseFloat(scoreSummary.final_score).toFixed(2)}</span>
                    </div>

                    <span className={`text-xs font-bold px-4 py-1.5 rounded-full border ${predicateInfo?.color}`}>
                      {predicateInfo?.label}
                    </span>
                  </div>

                  {/* Right part: component breakdown & weights */}
                  <div className="md:col-span-7 p-6 flex flex-col justify-center space-y-4">
                    <h3 className="font-extrabold text-gray-800 text-sm border-b border-gray-100 pb-2">
                      Rincian Komponen Terbobot
                    </h3>
                    
                    <div className="space-y-3">
                      {[
                        { label: 'Kinerja (Rata-rata Kegiatan)', score: scoreSummary.kinerja_score, weight: weights.kinerja_weight, color: 'bg-blue-600' },
                        { label: 'Perilaku ASN (Ber-AKHLAK)', score: scoreSummary.perilaku_score, weight: weights.perilaku_weight, color: 'bg-indigo-600' },
                        { label: 'Disiplin Presensi / Kehadiran', score: scoreSummary.presensi_score, weight: weights.presensi_weight, color: 'bg-emerald-600' }
                      ].map((comp, idx) => {
                        const contribution = (parseFloat(comp.score || 0) * (comp.weight / 100)).toFixed(2);
                        return (
                          <div key={idx} className="space-y-1">
                            <div className="flex justify-between text-xs font-bold text-gray-600">
                              <span>{comp.label}</span>
                              <span className="text-gray-800">{comp.score ? parseFloat(comp.score).toFixed(2) : '0'} <span className="font-medium text-gray-400">x {comp.weight}% = {contribution}</span></span>
                            </div>
                            <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                              <div 
                                className={`${comp.color} h-2 rounded-full`}
                                style={{ width: `${comp.score || 0}%` }}
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                    
                    <p className="text-[10px] text-gray-400 font-semibold leading-tight pt-1">
                      * Hasil ini sah divalidasi oleh Kepala BPS pada {new Date(scoreSummary.validated_at).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' })}.
                    </p>
                  </div>
                </div>

                {/* ── EXPANDING DETAILS ── */}
                <div className="space-y-4">
                  {/* Detailed Kegiatan (Kinerja) */}
                  <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                    <div className="bg-gray-50 px-5 py-4 border-b border-gray-100 flex items-center gap-2">
                      <h4 className="font-extrabold text-gray-700 text-sm">Rincian Nilai Kinerja per Kegiatan</h4>
                    </div>
                    <div className="p-5">
                      {scoreDetails?.activities?.length === 0 ? (
                        <p className="text-gray-400 text-xs italic">Tidak ada kegiatan terekam di kuartal ini.</p>
                      ) : (
                        <div className="overflow-x-auto">
                          <table className="w-full text-xs text-left">
                            <thead>
                              <tr className="border-b border-gray-100 text-slate-500 font-bold">
                                <th className="pb-3 w-10">No</th>
                                <th className="pb-3">Judul Kegiatan</th>
                                <th className="pb-3 text-center">Kecepatan</th>
                                <th className="pb-3 text-center">Kualitas</th>
                                <th className="pb-3 text-center">Kontribusi</th>
                                <th className="pb-3 text-center">Tanggung Jawab</th>
                                <th className="pb-3 text-center font-bold text-blue-600">Rata-Rata</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                              {scoreDetails?.activities?.map((act, i) => {
                                const actAvg = ((parseFloat(act.speed_score || 0) + parseFloat(act.quality_score || 0) + parseFloat(act.contribution_score || 0) + parseFloat(act.responsibility_score || 0)) / 4).toFixed(2);
                                return (
                                  <tr key={i} className="hover:bg-slate-50/50">
                                    <td className="py-3 text-gray-400 font-bold">{i + 1}</td>
                                    <td className="py-3">
                                      <p className="font-bold text-gray-800">{act.activity_title}</p>
                                      {act.notes && <p className="text-[10px] text-gray-400 mt-0.5">Catatan: "{act.notes}"</p>}
                                    </td>
                                    <td className="py-3 text-center font-semibold text-gray-600">{parseFloat(act.speed_score || 0).toFixed(2)}</td>
                                    <td className="py-3 text-center font-semibold text-gray-600">{parseFloat(act.quality_score || 0).toFixed(2)}</td>
                                    <td className="py-3 text-center font-semibold text-gray-600">{parseFloat(act.contribution_score || 0).toFixed(2)}</td>
                                    <td className="py-3 text-center font-semibold text-gray-600">{parseFloat(act.responsibility_score || 0).toFixed(2)}</td>
                                    <td className="py-3 text-center font-bold text-blue-600">{actAvg}</td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Detailed Behavior (Perilaku) */}
                  <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                    <div className="bg-gray-50 px-5 py-4 border-b border-gray-100 flex items-center gap-2">
                      <h4 className="font-extrabold text-gray-700 text-sm">Rincian 8 Aspek Perilaku Ber-AKHLAK</h4>
                    </div>
                    <div className="p-5 space-y-4">
                      {scoreDetails?.behavior ? (
                        <>
                          <div className="grid grid-cols-2 gap-4">
                            {BEHAVIOR_ASPECTS.map(aspect => {
                              const score = scoreDetails.behavior[aspect.key];
                              return (
                                <div key={aspect.key} className="space-y-1 bg-gray-50/50 p-2.5 rounded-xl border border-gray-100">
                                  <div className="flex justify-between text-xs">
                                    <span className="font-bold text-gray-700">{aspect.label}</span>
                                    <span className="font-black text-indigo-600 font-mono">{score ? score : '-'}</span>
                                  </div>
                                  <div className="w-full bg-gray-200/60 h-1.5 rounded-full overflow-hidden">
                                    <div 
                                      className="bg-indigo-600 h-1.5 rounded-full"
                                      style={{ width: `${score || 0}%` }}
                                    />
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                          {scoreDetails.behavior.notes && (
                            <div className="bg-indigo-50/50 border border-indigo-100 rounded-xl p-3.5 text-xs text-indigo-800">
                              <strong>Catatan Perilaku Ketua Tim:</strong> "{scoreDetails.behavior.notes}"
                            </div>
                          )}
                        </>
                      ) : (
                        <p className="text-gray-400 text-xs italic">Detail perilaku belum disubmit oleh Ketua Tim.</p>
                      )}
                    </div>
                  </div>

                  {/* Detailed Attendance */}
                  <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                    <div className="bg-gray-50 px-5 py-4 border-b border-gray-100 flex items-center gap-2">
                      <CalendarDays className="w-4 h-4 text-emerald-600" />
                      <h4 className="font-extrabold text-gray-700 text-sm">Rincian Disiplin & Presensi</h4>
                    </div>
                    <div className="p-5">
                      {scoreDetails?.attendance ? (
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                          <div className="space-y-1">
                            <p className="text-xs text-gray-500">Skor kehadiran final yang diinput oleh Kasubag:</p>
                            {scoreDetails.attendance.notes && (
                              <p className="text-xs text-gray-700 italic bg-gray-50 px-3 py-2 rounded-lg border border-gray-100">
                                Catatan: "{scoreDetails.attendance.notes}"
                              </p>
                            )}
                          </div>
                          <div className="bg-emerald-50 border border-emerald-100 text-emerald-700 rounded-2xl p-4 text-center min-w-28 shadow-sm">
                            <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-600">Skor Kehadiran</p>
                            <p className="text-2xl font-black mt-0.5">{scoreDetails.attendance.attendance_score}</p>
                          </div>
                        </div>
                      ) : (
                        <p className="text-gray-400 text-xs italic">Detail kehadiran belum dimasukkan oleh Kasubag.</p>
                      )}
                    </div>
                  </div>

                  {/* Catatan Kepala BPS */}
                  {scoreSummary.notes && (
                    <div className="bg-amber-50 border border-amber-200 text-amber-900 rounded-2xl p-5 shadow-sm space-y-1.5">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-amber-700 flex items-center gap-1.5">
                        <FileText className="w-4 h-4" />
                        Catatan & Arahan Kepala BPS
                      </h4>
                      <p className="text-sm italic leading-relaxed">"{scoreSummary.notes}"</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* PANEL KANAN: LEADERBOARD BEST EMPLOYEE (lg:col-span-4) */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="bg-gradient-to-r from-blue-700 to-indigo-700 px-5 py-4 border-b border-gray-100 flex items-center gap-2 text-white">
                <Trophy className="w-4 h-4 text-amber-300" />
                <h3 className="font-extrabold text-white text-sm">Best Employee (Top 3)</h3>
              </div>
              
              <div className="p-5">
                {loadingLeaderboard ? (
                  <p className="text-center py-8 text-gray-400 text-xs">Memuat peringkat terbaik...</p>
                ) : topEmployees.length === 0 ? (
                  <div className="text-center py-8 text-gray-400 space-y-2">
                    <Award className="w-10 h-10 text-gray-200 mx-auto" />
                    <p className="text-xs italic">Leaderboard belum dirilis untuk kuartal ini.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {/* Visual Podium representation or ranking cards */}
                    {topEmployees.map((emp, index) => {
                      const medalColors = [
                        'bg-yellow-50 text-yellow-600 border-yellow-200 ring-yellow-400/20', // Gold
                        'bg-slate-50 text-slate-600 border-slate-200 ring-slate-400/20',     // Silver
                        'bg-amber-50 text-amber-700 border-amber-200 ring-amber-500/20'      // Bronze
                      ];
                      const medalLabels = ['🥇 1st', '🥈 2nd', '🥉 3rd'];

                      return (
                        <div 
                          key={emp.id} 
                          className={`flex items-center justify-between p-4 rounded-2xl border border-gray-100 shadow-sm relative overflow-hidden transition-transform hover:-translate-y-0.5 ${
                            emp.employee_id === user?.id ? 'bg-blue-50/50 border-blue-200 ring-2 ring-blue-600/10' : ''
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            {/* Avatar or Medal */}
                            <div className={`w-10 h-10 rounded-full flex flex-col items-center justify-center font-bold text-[10px] border shadow-sm ${medalColors[index] || 'bg-gray-50 text-gray-500'}`}>
                              <span className="font-extrabold">{medalLabels[index] ? medalLabels[index].split(' ')[1] : `${index+1}`}</span>
                            </div>

                            <div>
                              <p className="font-bold text-gray-800 text-xs">{emp.employee_name} {emp.employee_id === user?.id && <span className="text-[10px] font-extrabold text-blue-600 bg-blue-100/70 border border-blue-200 rounded px-1.5 ml-1">Saya</span>}</p>
                              <p className="text-[10px] text-gray-400 font-mono mt-0.5">{emp.nip || '-'}</p>
                              <p className="text-[10px] text-gray-500 truncate max-w-[150px] mt-0.5">{emp.jabatan || 'Staf Pelaksana'}</p>
                            </div>
                          </div>

                          <div className="text-right">
                            <p className="text-base font-black text-blue-700">{parseFloat(emp.final_score).toFixed(2)}</p>
                            <p className="text-[9px] text-gray-400 font-semibold uppercase">Nilai Akhir</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
