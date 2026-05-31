import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import { Link } from 'react-router-dom';
import { Trophy, Printer } from 'lucide-react';

export default function Laporan() {
  const { user }                  = useAuth();
  const [reviews, setReviews]     = useState([]);
  const [eom,     setEom]         = useState([]);
  const [periode, setPeriode]     = useState('2026-Q2');
  const [printData, setPrintData] = useState(null);

  useEffect(() => {
    const fetchAll = async () => {
      if (!periode) return;
      try {
        const [rRes, eRes] = await Promise.all([
          api.get(`/assessments/bps/review?period=${periode}`),
          api.get(`/assessments/top-3?period=${periode}`),
        ]);
        setReviews(rRes.data.review || []);
        
        // Map EOM top 3 fields for compatibility
        setEom(eRes.data.map(item => ({
          id: item.id,
          name: item.employee_name,
          jabatan: item.jabatan || 'Staf Pelaksana',
          total_score: item.final_score ? parseFloat(item.final_score).toFixed(2) : '0.00',
          period: item.period
        })));
      } catch (err) {
        console.error(err);
      }
    };
    fetchAll();
  }, [periode]);

  useEffect(() => {
    if (printData) {
      const timer = setTimeout(() => {
        window.print();
        setPrintData(null);
      }, 600);
      return () => clearTimeout(timer);
    }
  }, [printData]);

  const handlePrint = async (employeeId) => {
    try {
      const res = await api.get(`/assessments/report-detail?employee_id=${employeeId}&period=${periode}`);
      setPrintData(res.data);
    } catch (err) {
      alert('Gagal mengambil detail penilaian untuk dicetak.');
    }
  };

  const statusBadge = (s) => {
    const isDone = s === 'validated' || s === 'published';
    const cfg = isDone
      ? 'bg-emerald-50 text-emerald-600 border-emerald-100'
      : 'bg-amber-50 text-amber-600 border-amber-100';
    const label = isDone ? '✓ Tervalidasi' : '⏳ Menunggu';
    return <span className={`text-[10px] font-extrabold uppercase tracking-wider px-3 py-1 rounded-full border ${cfg}`}>{label}</span>;
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
    return new Date(dateStr).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
  };

  const getRatingLabel = (score) => {
    const val = parseFloat(score || 0);
    if (val >= 90) return 'Sangat Baik';
    if (val >= 80) return 'Baik';
    if (val >= 60) return 'Butuh Perbaikan';
    return 'Dibawah Ekspektasi';
  };

  const getCurvePeak = (score) => {
    const val = parseFloat(score || 0);
    if (val >= 90) return 435;
    if (val >= 80) return 365;
    if (val >= 60) return 260;
    return 130;
  };

  return (
    <div className="space-y-6">
      {/* ── Filter periode ── */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-extrabold text-gray-800">Laporan Kinerja</h2>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-500 font-medium">Periode</span>
          <select value={periode} onChange={e => setPeriode(e.target.value)}
            className="border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-300 bg-white font-bold text-gray-700">
            <option value="2026-Q1">2026 - Kuartal I (Q1)</option>
            <option value="2026-Q2">2026 - Kuartal II (Q2)</option>
            <option value="2026-Q3">2026 - Kuartal III (Q3)</option>
            <option value="2026-Q4">2026 - Kuartal IV (Q4)</option>
          </select>
        </div>
      </div>

      {/* ── Tabel Penilaian ── */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
        <div className="px-6 py-4 border-b border-gray-100">
          <h3 className="font-bold text-gray-700">Rekap Penilaian Kinerja</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-[#f0f7ff]">
                {['No','NIP','Nama Pegawai','Jabatan','Kinerja','Perilaku','Presensi','Nilai Akhir','Status','Aksi'].map(h => (
                  <th key={h} className="px-6 py-4 text-left text-[11px] font-extrabold text-[#2563eb] uppercase tracking-wider border-b border-gray-100">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {reviews.map((r, i) => (
                <tr key={r.employee_id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-4 text-gray-400 font-medium">{i + 1}</td>
                  <td className="px-6 py-4 font-mono text-[11px] text-gray-500 font-bold">{r.nip || '-'}</td>
                  <td className="px-6 py-4 font-bold text-gray-800">{r.employee_name}</td>
                  <td className="px-6 py-4 text-gray-600 text-xs">{r.jabatan || 'Staf Pelaksana'}</td>
                  <td className="px-6 py-4 text-gray-700 font-bold">{r.kinerja_score ? r.kinerja_score.toFixed(2) : '-'}</td>
                  <td className="px-6 py-4 text-gray-700 font-bold">{r.perilaku_score ? r.perilaku_score.toFixed(2) : '-'}</td>
                  <td className="px-6 py-4 text-gray-700 font-bold">{r.presensi_score ? r.presensi_score.toFixed(2) : '-'}</td>
                  <td className="px-6 py-4">
                    <span className="font-extrabold text-blue-600 text-base">{r.final_score ? r.final_score.toFixed(2) : '-'}</span>
                  </td>
                  <td className="px-6 py-4">{statusBadge(r.validation_status)}</td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => handlePrint(r.employee_id)}
                      disabled={r.validation_status !== 'published'}
                      title={r.validation_status === 'published' ? 'Cetak Rapor Kinerja' : 'Laporan belum di-finalisasi'}
                      className={`p-1.5 rounded-lg border transition ${
                        r.validation_status === 'published'
                          ? 'bg-blue-50 text-blue-600 border-blue-200 hover:bg-blue-100 shadow-sm'
                          : 'bg-gray-50 text-gray-400 border-gray-100 opacity-40 cursor-not-allowed'
                      }`}
                    >
                      <Printer className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
              {reviews.length === 0 && (
                <tr><td colSpan={10} className="text-center py-16 text-gray-400 italic">Belum ada data laporan untuk periode ini</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Employee of the Month Banner ── */}
      {eom.length > 0 && (
        <div className="bg-gradient-to-br from-yellow-50 via-amber-50 to-orange-50 border border-yellow-200 rounded-2xl p-6">
          <div className="flex items-center gap-2 mb-5">
            <Trophy className="w-5 h-5 text-yellow-500" />
            <h3 className="font-bold text-gray-800">🏆 Employee of the Month</h3>
            <Link to="/employee-of-month"
              className="ml-auto text-xs text-blue-500 hover:text-blue-700 font-medium underline underline-offset-2">
              Lihat Detail Ranking →
            </Link>
          </div>
          <div className="grid grid-cols-3 gap-4">
            {eom.slice(0, 3).map((e, i) => (
              <div key={e.id || i} className={`rounded-2xl p-5 text-center border-2 ${
                i === 0 ? 'bg-white border-yellow-300 shadow-lg shadow-yellow-100'
                : i === 1 ? 'bg-white border-gray-200 shadow'
                : 'bg-white border-orange-200 shadow'
              }`}>
                <div className="relative inline-block mb-2">
                  <div className={`w-16 h-16 rounded-full flex items-center justify-center text-xl font-black text-white ${
                    i === 0 ? 'bg-gradient-to-br from-yellow-400 to-amber-500'
                    : i === 1 ? 'bg-gradient-to-br from-slate-400 to-gray-500'
                    : 'bg-gradient-to-br from-orange-400 to-amber-600'
                  }`}>
                    {e.name?.charAt(0)}
                  </div>
                  <span className={`absolute -top-1 -right-1 rounded-full w-7 h-7 flex items-center justify-center text-xs font-black text-white shadow ${
                    i === 0 ? 'bg-yellow-500' : i === 1 ? 'bg-gray-400' : 'bg-orange-400'
                  }`}>
                    {i === 0 ? '👑' : i + 1}
                  </span>
                </div>
                <p className="font-bold text-gray-800 text-sm leading-tight">{e.name}</p>
                <p className="text-xs text-gray-500 mt-0.5">{e.jabatan}</p>
                <p className="text-2xl font-black text-blue-600 mt-2">{e.total_score}</p>
                <p className="text-xs text-gray-400">Periode: {e.period}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── PRINT CONTENT (Only visible on printing window via @media print) ── */}
      {printData && (
        <div id="print-section" className="hidden print:block p-8 bg-white text-black font-sans leading-tight text-[11px] border border-black">
          <style>{`
            @media print {
              body * {
                visibility: hidden;
              }
              #print-section, #print-section * {
                visibility: visible;
              }
              #print-section {
                position: absolute;
                left: 0;
                top: 0;
                width: 100%;
                background: white;
                color: black;
              }
              header, aside, footer, nav, button, select {
                display: none !important;
              }
            }
          `}</style>

          {/* Header Judul */}
          <div className="text-center mb-6 space-y-1">
            <h1 className="text-lg font-black tracking-wide text-black">EVALUASI KINERJA PEGAWAI</h1>
            <h2 className="text-sm font-bold text-black">PENDEKATAN HASIL KERJA KUALITATIF</h2>
            <p className="text-xs font-semibold text-black uppercase">PERIODE: {periode.includes('Q1') ? 'KUARTAL I (Q1)' : periode.includes('Q2') ? 'KUARTAL II (Q2)' : periode.includes('Q3') ? 'KUARTAL III (Q3)' : 'KUARTAL IV (Q4)'} TAHUN 2026</p>
          </div>

          {/* Tabel Identitas Dua Kolom */}
          <table className="w-full border-collapse border border-black mb-6 text-[10px]">
            <tbody>
              <tr className="bg-white text-[10.5px]">
                <td className="border border-black p-2 font-bold w-[4%] text-center">No</td>
                <td className="border border-black p-2 font-bold w-[46%] text-center uppercase" colSpan={2}>Pegawai yang Dinilai</td>
                <td className="border border-black p-2 font-bold w-[4%] text-center">No</td>
                <td className="border border-black p-2 font-bold w-[46%] text-center uppercase" colSpan={2}>Pejabat Penilai Kinerja</td>
              </tr>
              <tr>
                <td className="border border-black p-2 font-bold text-center">1</td>
                <td className="border border-black p-2 font-bold w-[12%]">Nama</td>
                <td className="border border-black p-2 w-[34%]">{printData.employee.name}</td>
                <td className="border border-black p-2 font-bold text-center">1</td>
                <td className="border border-black p-2 font-bold w-[12%]">Nama</td>
                <td className="border border-black p-2 w-[34%]">{printData.evaluator.name}</td>
              </tr>
              <tr>
                <td className="border border-black p-2 font-bold text-center">2</td>
                <td className="border border-black p-2 font-bold">NIP</td>
                <td className="border border-black p-2 font-mono">{printData.employee.nip || '-'}</td>
                <td className="border border-black p-2 font-bold text-center">2</td>
                <td className="border border-black p-2 font-bold">NIP</td>
                <td className="border border-black p-2 font-mono">{printData.evaluator.nip || '-'}</td>
              </tr>
              <tr>
                <td className="border border-black p-2 font-bold text-center">3</td>
                <td className="border border-black p-2 font-bold">Pangkat/Gol</td>
                <td className="border border-black p-2">{printData.employee.pangkat || 'Penata Muda / III/a'}</td>
                <td className="border border-black p-2 font-bold text-center">3</td>
                <td className="border border-black p-2 font-bold">Pangkat/Gol</td>
                <td className="border border-black p-2">{printData.evaluator.pangkat || 'Pembina Tk. I / IV/b'}</td>
              </tr>
              <tr>
                <td className="border border-black p-2 font-bold text-center">4</td>
                <td className="border border-black p-2 font-bold">Jabatan</td>
                <td className="border border-black p-2">{printData.employee.jabatan}</td>
                <td className="border border-black p-2 font-bold text-center">4</td>
                <td className="border border-black p-2 font-bold">Jabatan</td>
                <td className="border border-black p-2">{printData.evaluator.jabatan}</td>
              </tr>
              <tr>
                <td className="border border-black p-2 font-bold text-center">5</td>
                <td className="border border-black p-2 font-bold">Unit Kerja</td>
                <td className="border border-black p-2">{printData.employee.unit_kerja}</td>
                <td className="border border-black p-2 font-bold text-center">5</td>
                <td className="border border-black p-2 font-bold">Unit Kerja</td>
                <td className="border border-black p-2">{printData.evaluator.unit_kerja}</td>
              </tr>
            </tbody>
          </table>

          {/* Capaian Organisasi */}
          <div className="border border-black p-3 bg-white mb-6 rounded-lg text-xs space-y-1">
            <p className="font-bold text-black">CAPAIAN KINERJA ORGANISASI</p>
            <p className="text-black font-black text-sm uppercase">PREDIKAT: BAIK</p>
          </div>

          {/* Pola Distribusi Predikat (Bell Curve SVG) */}
          <div className="border border-black rounded-xl p-5 mb-6 text-center bg-white max-w-2xl mx-auto page-break-inside-avoid">
            <h4 className="text-[11px] font-black uppercase text-black mb-3">
              KURVA DISTRIBUSI PREDIKAT KINERJA PEGAWAI DENGAN CAPAIAN KINERJA ORGANISASI BAIK
            </h4>
            <div className="relative inline-block w-full max-w-[500px]">
              <svg viewBox="0 0 500 170" className="w-full h-36">
                {/* Horizontal Baseline */}
                <line x1="40" y1="130" x2="460" y2="130" stroke="#000000" strokeWidth="2" />
                
                {/* Curve */}
                <path d="M 40 125 C 120 125, 170 120, 220 90 C 270 60, 310 30, 365 30 C 400 30, 420 90, 460 125" fill="none" stroke="#000000" strokeWidth="3" />
                
                {/* Dotted indicator for employee's rating based on score */}
                <line 
                  x1={getCurvePeak(printData.final_assessment?.final_score)} 
                  y1="25" 
                  x2={getCurvePeak(printData.final_assessment?.final_score)} 
                  y2="130" 
                  stroke="#000000" 
                  strokeWidth="2" 
                  strokeDasharray="3 3" 
                />
                
                {/* Dotted indicator label box */}
                <rect 
                  x={getCurvePeak(printData.final_assessment?.final_score) - 25} 
                  y="5" 
                  width="50" 
                  height="18" 
                  rx="3" 
                  fill="#ffffff" 
                  stroke="#000000" 
                  strokeWidth="1.5" 
                />
                <text 
                  x={getCurvePeak(printData.final_assessment?.final_score)} 
                  y="17" 
                  fill="#000000" 
                  fontSize="8.5" 
                  fontWeight="black" 
                  textAnchor="middle"
                >
                  {printData.final_assessment?.final_score ? parseFloat(printData.final_assessment.final_score).toFixed(2) : '0.00'}
                </text>

                {/* X-Axis labels */}
                <text x="75" y="145" fill="#000000" fontSize="8" textAnchor="middle">Sangat Kurang</text>
                <text x="160" y="145" fill="#000000" fontSize="8" textAnchor="middle">Kurang/Misconduct</text>
                <text x="260" y="145" fill="#000000" fontSize="8" textAnchor="middle">Butuh Perbaikan</text>
                <text x="365" y="145" fill="#000000" fontSize="8.5" fontWeight="black" textAnchor="middle">Baik</text>
                <text x="435" y="145" fill="#000000" fontSize="8" textAnchor="middle">Sangat Baik</text>
              </svg>
            </div>
            <p className="text-[10px] text-black italic mt-2">
              Garis putus-putus hitam menunjukkan posisi pencapaian nilai akhir pegawai periode ini ({printData.final_assessment?.final_score ? getRatingLabel(printData.final_assessment.final_score) : 'Baik'}).
            </p>
          </div>

          {/* BAGIAN I: HASIL KERJA */}
          <div className="space-y-3 mb-6 page-break-inside-avoid">
            <h3 className="text-xs font-black uppercase text-black border-b border-black pb-1">I. HASIL KERJA (KINERJA - BOBOT {printData.weights.kinerja_weight}%)</h3>
            <h4 className="text-[11px] font-bold text-black">A. UTAMA (Sasaran Kerja Pegawai & Bukti Dukung)</h4>
            
            <table className="w-full border-collapse border border-black text-[10px]">
              <thead>
                <tr className="border-b border-black font-bold">
                  <th className="border border-black p-2 w-[4%] text-center">No</th>
                  <th className="border border-black p-2 w-[28%] text-left">Rencana Hasil Kerja Utama</th>
                  <th className="border border-black p-2 w-[24%] text-left">Indikator Kinerja Individu & Target</th>
                  <th className="border border-black p-2 w-[24%] text-left">Realisasi Berdasarkan Bukti Dukung</th>
                  <th className="border border-black p-2 w-[20%] text-left">Umpan Balik Pimpinan</th>
                </tr>
              </thead>
              <tbody>
                {printData.activities.map((act, idx) => (
                  <tr key={act.activity_id} className="align-top">
                    <td className="border border-black p-2 text-center font-semibold">{idx + 1}</td>
                    <td className="border border-black p-2">
                      <p className="font-bold text-black">{act.title}</p>
                      <p className="text-black mt-1 leading-normal text-[9px]">{act.description || '-'}</p>
                    </td>
                    <td className="border border-black p-2 space-y-1">
                      <p className="font-semibold text-black">• Kuantitas & Kualitas:</p>
                      <p className="text-black leading-relaxed pl-2">Terselesaikannya kegiatan 100% dan tepat waktu sesuai standar operasional BPS Solok.</p>
                      <p className="font-semibold text-black mt-1">• Target:</p>
                      <p className="text-black pl-2">1 Laporan kegiatan tuntas pada akhir kuartal.</p>
                    </td>
                    <td className="border border-black p-2 space-y-2">
                      <div>
                        <span className="font-bold text-black border border-black px-1.5 py-0.5 rounded text-[9px]">
                          Realisasi: {act.realization_percentage}%
                        </span>
                      </div>
                      <p className="text-black leading-normal italic">"{act.realization_notes}"</p>
                      {act.proof_link && (
                        <p className="text-black font-semibold truncate mt-1 text-[8.5px]">
                          🔗 Bukti: <span className="underline">{act.proof_link}</span>
                        </p>
                      )}
                    </td>
                    <td className="border border-black p-2">
                      <p className="font-semibold text-black">Skor: <span className="font-bold text-black">{parseFloat(act.avg_score).toFixed(2)}</span></p>
                      <p className="text-black italic mt-1 leading-normal">"{act.evaluation_notes || 'Sesuai ekspektasi, kualitas pekerjaan memuaskan.'}"</p>
                    </td>
                  </tr>
                ))}
                {printData.activities.length === 0 && (
                  <tr>
                    <td colSpan={5} className="border border-black p-4 text-center text-black italic">Belum ada kegiatan yang terevaluasi untuk kuartal ini</td>
                  </tr>
                )}
              </tbody>
            </table>
            
            {/* Rating Hasil Kerja */}
            <div className="flex justify-between items-center bg-white border border-black p-2.5 rounded text-xs">
              <span className="font-bold text-black">RATING HASIL KERJA (KINERJA)</span>
              <span className="font-black text-black border border-black px-3 py-1 rounded">
                NILAI: {printData.final_assessment?.kinerja_score ? parseFloat(printData.final_assessment.kinerja_score).toFixed(2) : '0.00'} ({printData.final_assessment?.kinerja_score ? getRatingLabel(printData.final_assessment.kinerja_score) : 'Sesuai Ekspektasi'})
              </span>
            </div>
          </div>

          {/* BAGIAN II: PERILAKU KERJA */}
          <div className="space-y-3 mb-6 page-break-inside-avoid">
            <h3 className="text-xs font-black uppercase text-black border-b border-black pb-1">II. PERILAKU KERJA (BOBOT {printData.weights.perilaku_weight}%)</h3>
            
            <table className="w-full border-collapse border border-black text-[10px]">
              <thead>
                <tr className="border-b border-black font-bold">
                  <th className="border border-black p-2 w-[4%] text-center">No</th>
                  <th className="border border-black p-2 w-[36%] text-left">Aspek Perilaku Core Values ASN</th>
                  <th className="border border-black p-2 w-[60%] text-left">Ekspektasi Khusus Pimpinan & Umpan Balik Berkelanjutan</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ['Orientasi Pelayanan', [
                    'Memahami dan memenuhi kebutuhan masyarakat.',
                    'Ramah, cekatan, solutif, dan dapat diandalkan.',
                    'Melakukan perbaikan tiada henti.'
                  ], printData.behavior?.orientasi_pelayanan],
                  ['Akuntabilitas', [
                    'Melaksanakan tugas dengan jujur, bertanggung jawab, cermat, disiplin, dan berintegritas tinggi.',
                    'Menggunakan kekayaan dan barang milik negara secara bertanggung jawab, efektif, dan efisien.',
                    'Tidak menyalahgunakan kewenangan jabatan.'
                  ], printData.behavior?.akuntabilitas],
                  ['Kompetensi', [
                    'Meningkatkan kompetensi diri untuk menjawab tantangan yang selalu berubah.',
                    'Membantu orang lain belajar.',
                    'Melaksanakan tugas dengan kualitas terbaik.'
                  ], printData.behavior?.kompetensi],
                  ['Harmonis', [
                    'Menghargai setiap orang apapun latar belakangnya.',
                    'Suka menolong orang lain.',
                    'Membangun lingkungan kerja yang kondusif.'
                  ], printData.behavior?.harmonis],
                  ['Loyal', [
                    'Memegang teguh ideologi Pancasila, UUD 1945, NKRI, serta pemerintahan yang sah.',
                    'Menjaga nama baik sesama ASN, pimpinan, instansi, dan negara.',
                    'Menjaga rahasia jabatan dan negara.'
                  ], printData.behavior?.loyal],
                  ['Adaptif', [
                    'Cepat menyesuaikan diri menghadapi perubahan.',
                    'Terus berinovasi dan mengembangkan kreativitas.',
                    'Bertindak proaktif.'
                  ], printData.behavior?.adaptif],
                  ['Kolaboratif', [
                    'Memberi kesempatan kepada berbagai pihak untuk berkontribusi.',
                    'Terbuka dalam bekerja sama untuk menghasilkan nilai tambah.',
                    'Menggerakkan pemanfaatan berbagai sumber daya untuk tujuan bersama.'
                  ], printData.behavior?.kolaboratif],
                  ['Disiplin', [
                    'Memahuhi jam kerja kantor secara konsisten.',
                    'Menyelesaikan tugas kelompok/tim tepat waktu.',
                    'Menerapkan budaya kerja 5S secara konsisten.'
                  ], printData.behavior?.disiplin]
                ].map(([title, points, score], idx) => (
                  <tr key={title} className="align-top">
                    <td className="border border-black p-2 text-center font-semibold">{idx + 1}</td>
                    <td className="border border-black p-2">
                      <p className="font-bold text-black text-[10px]">{title}</p>
                      <ul className="list-disc list-outside pl-4 mt-1 space-y-0.5 text-[8.5px] text-black leading-normal">
                        {points.map((p, pIdx) => <li key={pIdx}>{p}</li>)}
                      </ul>
                    </td>
                    <td className="border border-black p-2 flex flex-col justify-between h-full min-h-[50px]">
                      <p className="font-bold text-black">Skor Aspek: <span className="text-black font-extrabold">{score ? parseFloat(score).toFixed(2) : '0.00'}</span></p>
                      <p className="text-black italic mt-1 text-[9px] leading-relaxed">
                        • Pimpinan: {score >= 90 
                          ? `Sangat proaktif dan menunjukkan teladan yang baik dalam aspek ${title}.`
                          : score >= 80
                          ? `Menunjukkan penerapan sikap ${title} yang solid dan stabil di tim.`
                          : `Penerapan sikap ${title} cukup baik, perlu terus konsisten ditingkatkan.`
                        }
                      </p>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            
            {/* Rating Perilaku Kerja */}
            <div className="flex justify-between items-center bg-white border border-black p-2.5 rounded text-xs">
              <span className="font-bold text-black">RATING PERILAKU KERJA (PERILAKU)</span>
              <span className="font-black text-black border border-black px-3 py-1 rounded">
                NILAI: {printData.final_assessment?.perilaku_score ? parseFloat(printData.final_assessment.perilaku_score).toFixed(2) : '0.00'} ({printData.final_assessment?.perilaku_score ? getRatingLabel(printData.final_assessment.perilaku_score) : 'Sesuai Ekspektasi'})
              </span>
            </div>
          </div>

          {/* BAGIAN III: EVALUASI PRESENSI */}
          <div className="space-y-3 mb-6 page-break-inside-avoid">
            <h3 className="text-xs font-black uppercase text-black border-b border-black pb-1">III. EVALUASI PRESENSI (BOBOT {printData.weights.presensi_weight}%)</h3>
            <div className="border border-black rounded-lg p-3 space-y-2 text-xs">
              <div className="flex justify-between font-semibold text-black">
                <span>Rincian Kehadiran Periode Terpilih:</span>
                <span className="text-black font-bold">Skor Presensi: {printData.final_assessment?.presensi_score ? parseFloat(printData.final_assessment.presensi_score).toFixed(2) : '0.00'}</span>
              </div>
              <p className="text-black font-medium leading-relaxed bg-white p-2 rounded">
                Pegawai bersangkutan mencatatkan kehadiran sebanyak <b className="text-black">{printData.attendance.detail?.hadir ?? 22}/22</b> hari kerja, dengan catatan pelanggaran terlambat sebanyak <b className="text-black">{printData.attendance.detail?.terlambat ?? 0}</b> kali, kehadiran rapat <b className="text-black">{printData.attendance.detail?.hadir_rapat ?? 0}</b> kali, dan upacara bendera <b className="text-black">{printData.attendance.detail?.hadir_upacara ?? 0}</b> kali.
              </p>
            </div>
          </div>

          {/* BAGIAN IV: KEPUTUSAN NILAI AKHIR & KOMENTAR PIMPINAN */}
          <div className="space-y-3 mb-8 page-break-inside-avoid">
            <h3 className="text-xs font-black uppercase text-black border-b border-black pb-1">IV. KEPUTUSAN EVALUASI AKHIR (TOTAL SCORE)</h3>
            <div className="grid grid-cols-3 border border-black rounded-lg divide-x divide-black text-center text-xs">
              <div className="p-3 space-y-1">
                <p className="font-semibold text-black uppercase text-[9px]">Nilai Akhir Terbobot</p>
                <p className="text-2xl font-black text-black">{printData.final_assessment?.final_score ? parseFloat(printData.final_assessment.final_score).toFixed(2) : '0.00'}</p>
              </div>
              <div className="p-3 space-y-1">
                <p className="font-semibold text-black uppercase text-[9px]">Predikat Kinerja Akhir</p>
                <p className="text-base font-black text-black uppercase mt-1">
                  {printData.final_assessment?.final_score ? getRatingLabel(printData.final_assessment.final_score) : 'BAIK'}
                </p>
              </div>
              <div className="p-3 text-left space-y-1">
                <p className="font-semibold text-black uppercase text-[9px] text-center">Catatan Evaluasi / Rekomendasi Pimpinan</p>
                <p className="text-[10px] text-black italic leading-normal">
                  "{printData.final_assessment?.notes || 'Kinerja sangat baik dan disiplin presensi luar biasa. Pertahankan kontribusi positif Anda untuk BPS Solok.'}"
                </p>
              </div>
            </div>
          </div>

          {/* FOOTER & TANDA TANGAN */}
          <div className="mt-12 text-xs flex justify-between text-center pt-8 border-t border-black page-break-inside-avoid">
            <div className="w-[40%] space-y-14">
              <p className="text-black">Pegawai yang Dinilai,</p>
              <div className="space-y-1">
                <p className="font-bold underline uppercase text-black">{printData.employee.name}</p>
                <p className="text-black font-mono text-[9px]">NIP. {printData.employee.nip || '-'}</p>
              </div>
            </div>
            <div className="w-[45%] space-y-14">
              <div>
                <p className="text-black mb-0.5">Solok, {formatDate(printData.final_assessment?.validated_at)}</p>
                <p className="text-black">Pejabat Penilai Kinerja,</p>
              </div>
              <div className="space-y-1">
                <p className="font-bold underline uppercase text-black">{printData.evaluator.name}</p>
                <p className="text-black font-mono text-[9px]">NIP. {printData.evaluator.nip || '-'}</p>
              </div>
            </div>
          </div>

        </div>
      )}
    </div>
  );
}
