-- ============================================
-- DATA DUMMY / SEED BPS KABUPATEN SOLOK
-- Semua password: [role]123 (misal admin123, pegawai123, dst)
-- Hash bcrypt rounds=10 untuk password "password"
-- ============================================

INSERT INTO users (name, nip, email, password, role, pangkat, jabatan, unit_kerja) VALUES
('Administrator',       '000000000',        'admin@bps.go.id',      '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin',       '-',                    'Administrator',          'IT'),
('Budi Santoso',        '198501012010011001','pegawai@bps.go.id',    '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'pegawai',     'Penata Muda/IIIa',     'Statistisi Pertama',     'Statistik Produksi'),
('Siti Rahayu',         '198703152011012002','ketuatim@bps.go.id',   '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'pegawai',     'Penata/IIIc',          'Statistisi Muda',        'Statistik Sosial'),
('Drs. Ahmad Fauzi',    '197605202001011003','kasubag@bps.go.id',    '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'kasubag',     'Pembina/IVa',          'Ka. Sub Bagian Umum',    'Tata Usaha'),
('Dr. Hendra Wijaya',   '197201011998031001','kepalabps@bps.go.id',  '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'kepala_bps',  'Pembina Utama Muda/IVc','Kepala BPS',            'Pimpinan'),
('Rina Wati',           '199001012015012004','rina@bps.go.id',       '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'pegawai',     'Pengatur/IIc',         'Pengolah Data',          'Statistik Produksi'),
('Joko Susilo',         '199205102016011005','joko@bps.go.id',       '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'pegawai',     'Pengatur Muda/IIa',    'Pencacah',               'Statistik Sosial'),
-- 20 Pegawai Baru untuk Simulasi
('Eka Saputra', '199501012020011001', 'pegawai1@bps.go.id', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'pegawai', 'Penata Muda/IIIa', 'Statistisi Pertama', 'Statistik Produksi'),
('Dwi Lestari', '199602022021022002', 'pegawai2@bps.go.id', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'pegawai', 'Penata Muda/IIIa', 'Statistisi Pertama', 'Statistik Sosial'),
('Tri Handoko', '199703032022031003', 'pegawai3@bps.go.id', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'pegawai', 'Penata Muda/IIIa', 'Pranata Komputer Pertama', 'Statistik Sosial'),
('Catur Wibowo', '199804042023041004', 'pegawai4@bps.go.id', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'pegawai', 'Penata Muda/IIIa', 'Statistisi Pertama', 'Statistik Distribusi'),
('Pancawati', '199905052024052005', 'pegawai5@bps.go.id', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'pegawai', 'Penata Muda/IIIa', 'Statistisi Pertama', 'Statistik Distribusi'),
('Sadewa', '199406062019061006', 'pegawai6@bps.go.id', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'pegawai', 'Penata Muda/IIIa', 'Statistisi Pertama', 'Integrasi Pengolahan Data'),
('Sapto Nugroho', '199307072018071007', 'pegawai7@bps.go.id', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'pegawai', 'Penata Muda/IIIa', 'Statistisi Pertama', 'Integrasi Pengolahan Data'),
('Astuti', '199208082017082008', 'pegawai8@bps.go.id', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'pegawai', 'Penata Muda/IIIa', 'Statistisi Pertama', 'Statistik Neraca'),
('Nawa Murti', '199109092016092009', 'pegawai9@bps.go.id', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'pegawai', 'Penata Muda/IIIa', 'Statistisi Pertama', 'Statistik Neraca'),
('Dasa Satya', '199010102015101010', 'pegawai10@bps.go.id', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'pegawai', 'Penata/IIIc', 'Statistisi Ahli Muda', 'Tata Usaha'),
('Bambang Pamungkas', '198911112014111011', 'pegawai11@bps.go.id', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'pegawai', 'Penata Muda/IIIa', 'Statistisi Pertama', 'Statistik Produksi'),
('Christian Sugiono', '198812122013121012', 'pegawai12@bps.go.id', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'pegawai', 'Penata/IIIc', 'Statistisi Ahli Muda', 'Statistik Produksi'),
('Dian Sastrowardoyo', '198711112012112013', 'pegawai13@bps.go.id', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'pegawai', 'Penata Muda Tk. I/IIIb', 'Statistisi Pertama', 'Statistik Sosial'),
('Nicholas Saputra', '198610102011101014', 'pegawai14@bps.go.id', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'pegawai', 'Penata Muda Tk. I/IIIb', 'Statistisi Pertama', 'Statistik Sosial'),
('Reza Rahadian', '198509092010091015', 'pegawai15@bps.go.id', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'pegawai', 'Penata/IIIc', 'Statistisi Ahli Muda', 'Statistik Distribusi'),
('Laura Basuki', '198408082009082016', 'pegawai16@bps.go.id', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'pegawai', 'Penata/IIIc', 'Statistisi Ahli Muda', 'Statistik Distribusi'),
('Chelsea Islan', '199507072020072017', 'pegawai17@bps.go.id', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'pegawai', 'Penata Muda/IIIa', 'Statistisi Pertama', 'Integrasi Pengolahan Data'),
('Adinia Wirasti', '199306062018062018', 'pegawai18@bps.go.id', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'pegawai', 'Penata Muda Tk. I/IIIb', 'Statistisi Pertama', 'Statistik Neraca'),
('Tara Basro', '199205052017052019', 'pegawai19@bps.go.id', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'pegawai', 'Penata Muda/IIIa', 'Statistisi Pertama', 'Tata Usaha'),
('Chicco Jerikho', '199104042016041020', 'pegawai20@bps.go.id', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'pegawai', 'Penata Muda Tk. I/IIIb', 'Statistisi Pertama', 'Integrasi Pengolahan Data');

-- CATATAN: Hash di atas adalah untuk password "password"

INSERT INTO teams (team_name, leader_id, type) VALUES
('Tim Statistik Produksi', 3, 'adhoc'),
('Tim Statistik Sosial', 3, 'adhoc'),
-- 5 Tim Inti baru untuk simulasi
('Tim Protokoler', 3, 'inti'),
('Tim Bagian Umum', 8, 'inti'),
('Tim Humas & Sosial Media', 3, 'inti'),
('Tim PPID', 9, 'inti'),
('Tim SAKIP', 10, 'inti');

INSERT INTO team_members (team_id, user_id) VALUES
(1, 2), (1, 6),
(2, 7),
-- Anggota Tim Inti Protokoler (Termasuk Eka Saputra/8)
(3, 8), (3, 11), (3, 12), (3, 13),
-- Anggota Tim Bagian Umum (Termasuk Dwi Lestari/9)
(4, 9), (4, 14), (4, 15),
-- Anggota Tim Humas & Sosmed (Termasuk Tri Handoko/10)
(5, 10), (5, 16), (5, 17), (5, 18),
-- Anggota Tim PPID (Termasuk Laura Basuki/23 & Chelsea Islan/24)
(6, 19), (6, 23), (6, 24),
-- Anggota Tim SAKIP (Termasuk Adinia Wirasti/25, Tara Basro/26, Chicco Jerikho/27)
(7, 20), (7, 21), (7, 22), (7, 25), (7, 26), (7, 27);

-- ============================================
-- KEGIATAN UTAMA (ACTIVITIES)
-- ============================================
INSERT INTO activities (title, description, start_date, deadline, created_by, team_id, assigned_to, status) VALUES
-- Kegiatan Kuartal 2 (Q2 - April s/d Juni 2026), Deadline di Mei 2026
('Survei Tempat Halal Bi Halal',         'Pendataan tempat pelaksanaan halal bi halal seluruh kecamatan', '2026-04-01', '2026-05-15', 3, 1, 2, 'on_progress'),
('Pengelolaan Data Padi Desa Parongpong','Input dan validasi data produksi padi Desa Parongpong',         '2026-04-01', '2026-05-18', 3, 1, 6, 'on_progress'),
('Presentasi Progress Report',           'Persiapan dan pelaksanaan presentasi laporan kemajuan',          '2026-04-01', '2026-05-22', 3, 1, 2, 'on_progress'),
('Pendataan Susenas Q2',                 'Survei Sosial Ekonomi Nasional untuk modul konsumsi & pengeluaran','2026-04-01', '2026-05-25', 3, 2, 7, 'on_progress'),
('Protokoler Kunjungan Kerja Q2',        'Pendampingan pimpinan dalam kunjungan kerja eksternal',           '2026-04-01', '2026-05-28', 3, 3, 11, 'on_progress'),
('Pengadaan ATK Kantor Q2',              'Pembelian perlengkapan tulis kantor unit kerja umum',            '2026-04-01', '2026-05-29', 8, 4, 14, 'on_progress'),
('Rilis Pers Berita Q2',                 'Penyusunan naskah rilis inflasi daerah',                          '2026-04-01', '2026-05-30', 3, 5, 16, 'on_progress'),
('Layanan Informasi Publik Q2',          'Penyediaan data statistik untuk publik pemohon',                  '2026-04-01', '2026-05-31', 9, 6, 19, 'on_progress'),
('Penyusunan Dokumen SAKIP Q2',          'Penyusunan rancangan awal laporan akuntabilitas',                 '2026-04-01', '2026-05-31', 10, 7, 20, 'on_progress'),

-- Kegiatan Kuartal 1 (Q1 - Januari s/d Maret 2026)
('Penyusunan Publikasi Kecamatan Q1',    'Penyusunan dan rilis publikasi data statistik tingkat kecamatan', '2026-01-01', '2026-02-15', 3, 1, 2, 'selesai'),
('Survei KSA Padi Q1',                   'Pengambilan sampel foto lapangan Kerangka Sampel Area Padi',      '2026-01-01', '2026-02-28', 3, 1, 6, 'selesai'),
('Pendataan Susenas Q1',                 'Survei Sosial Ekonomi Nasional untuk modul konsumsi & pengeluaran','2026-01-01', '2026-03-10', 3, 2, 7, 'selesai'),
('Protokoler Kunjungan Kerja Q1',        'Pendampingan kunker kuartal I',                                   '2026-01-01', '2026-02-10', 3, 3, 11, 'selesai'),
('Penyusunan Jadwal Pimpinan Q1',        'Penyusunan agenda harian pimpinan BPS',                           '2026-01-01', '2026-02-20', 3, 3, 12, 'selesai'),
('Koordinasi Rapat Evaluasi Q1',         'Penyelenggaraan rapat kerja evaluasi triwulanan',                 '2026-01-01', '2026-03-05', 3, 3, 13, 'selesai'),
('Pengawalan Tamu VIP Q1',               'Pengawalan kedatangan perwakilan BPS RI',                         '2026-01-01', '2026-03-12', 3, 3, 8, 'selesai'),
('Pengadaan ATK Kantor Q1',              'Pengadaan perlengkapan kantor triwulan I',                        '2026-01-01', '2026-02-12', 8, 4, 14, 'selesai'),
('Pemeliharaan Gedung Q1',               'Servis fasilitas AC dan listrik ruang kerja utama',               '2026-01-01', '2026-02-25', 8, 4, 15, 'selesai'),
('Inventarisasi Aset Q1',                'Sensus barang milik negara unit tata usaha',                      '2026-01-01', '2026-03-15', 8, 4, 9, 'selesai'),
('Rilis Pers Berita Q1',                 'Rilis data statistik sosial ekonomi daerah Q1',                   '2026-01-01', '2026-02-18', 3, 5, 16, 'selesai'),
('Posting Media Sosial Q1',              'Pembuatan infografis publikasi untuk akun official',              '2026-01-01', '2026-02-28', 3, 5, 17, 'selesai'),
('Liputan Kegiatan BPS Q1',              'Dokumentasi audiovisual acara peresmian pojok statistik',         '2026-01-01', '2026-03-08', 3, 5, 18, 'selesai'),
('Buletin Bulanan Q1',                   'Penyusunan draf majalah internal BPS Solok Q1',                   '2026-01-01', '2026-03-20', 3, 5, 10, 'selesai'),
('Layanan Informasi Publik Q1',          'Pelayanan permohonan data sektoral di PST',                       '2026-01-01', '2026-02-22', 9, 6, 19, 'selesai'),
('Uji Konsekuensi PPID Q1',              'Analisis klasifikasi informasi publik yang dikecualikan',         '2026-01-01', '2026-03-02', 9, 6, 23, 'selesai'),
('Laporan Tahunan PPID Q1',              'Penyusunan berkas laporan kinerja PPID 2025',                     '2026-01-01', '2026-03-18', 9, 6, 24, 'selesai'),
('Penyusunan Dokumen SAKIP Q1',          'Penyusunan laporan akuntabilitas kinerja instansi pemerintah',   '2026-01-01', '2026-02-25', 10, 7, 20, 'selesai'),
('Evaluasi Rencana Aksi Q1',             'Evaluasi pencapaian target kinerja triwulan I',                   '2026-01-01', '2026-03-01', 10, 7, 21, 'selesai'),
('Pengukuran Kinerja SAKIP Q1',          'Pengisian aplikasi penilaian kinerja internal SAKIP',             '2026-01-01', '2026-03-10', 10, 7, 22, 'selesai'),
('Laporan Kinerja Instansi Q1',          'Penyusunan indikator utama keberhasilan sasaran strategis',       '2026-01-01', '2026-03-15', 10, 7, 25, 'selesai'),
('Bimbingan Teknis SAKIP Q1',            'Sosialisasi tata cara pengisian form capaian target',             '2026-01-01', '2026-03-22', 10, 7, 26, 'selesai'),
('Reviu Indikator Kinerja Q1',           'Analisis efisiensi kriteria pengukuran data sektoral',            '2026-01-01', '2026-03-28', 10, 7, 27, 'selesai');

-- ============================================
-- SUB-TUGAS (TASKS)
-- ============================================
INSERT INTO tasks (activity_id, title, assigned_to, weight, progress_percentage, status) VALUES
-- Sub-tugas Kegiatan 1 (Q2)
(1, 'Pendataan Lokasi Kecamatan A', 2, 50, 80, 'on_progress'),
(1, 'Validasi & Rekapitulasi Data', 6, 50, 90, 'on_progress'),
-- Sub-tugas Kegiatan 2 (Q2)
(2, 'Input Data Lapangan Padi', 6, 60, 40, 'on_progress'),
(2, 'Verifikasi & Laporan Padi', 2, 40, 0, 'pending'),
-- Sub-tugas Kegiatan 3 (Q2)
(3, 'Penyusunan Materi Slide Presentasi', 2, 100, 20, 'on_progress'),
-- Sub-tugas Kegiatan 4 (Q2)
(4, 'Survei Susenas Kecamatan B', 7, 100, 30, 'on_progress'),
-- Sub-tugas Kegiatan 5 (Q2)
(5, 'Protokol Acara Pembukaan Q2', 11, 100, 40, 'on_progress'),
-- Sub-tugas Kegiatan 6 (Q2)
(6, 'Pengadaan Kertas A4 Q2', 14, 100, 50, 'on_progress'),
-- Sub-tugas Kegiatan 7 (Q2)
(7, 'Draf Berita Inflasi Q2', 16, 100, 60, 'on_progress'),
-- Sub-tugas Kegiatan 8 (Q2)
(8, 'Portal Data Publik Q2', 19, 100, 70, 'on_progress'),
-- Sub-tugas Kegiatan 9 (Q2)
(9, 'Draf Renstra SAKIP Q2', 20, 100, 80, 'on_progress'),

-- Sub-tugas Kegiatan Q1 (Semua 100% Selesai)
(10, 'Pengumpulan Data Kecamatan Q1', 2, 100, 100, 'selesai'),
(11, 'Upload Foto Sampel KSA Q1', 6, 100, 100, 'selesai'),
(12, 'Listing Rumah Tangga Susenas Q1', 7, 100, 100, 'selesai'),
(13, 'Persiapan Rundown Kunker Q1', 11, 100, 100, 'selesai'),
(14, 'Agenda Harian Kepala Q1', 12, 100, 100, 'selesai'),
(15, 'Undangan Rapat Evaluasi Q1', 13, 100, 100, 'selesai'),
(16, 'Penjemputan Tamu VIP Q1', 8, 100, 100, 'selesai'),
(17, 'Administrasi Pengadaan ATK Q1', 14, 100, 100, 'selesai'),
(18, 'Pengecekan AC Aula Q1', 15, 100, 100, 'selesai'),
(19, 'Sensus BMD Tata Usaha Q1', 9, 100, 100, 'selesai'),
(20, 'Naskah Rilis Kemiskinan Q1', 16, 100, 100, 'selesai'),
(21, 'Desain Banner Media Sosial Q1', 17, 100, 100, 'selesai'),
(22, 'Dokumentasi Audiovisual Q1', 18, 100, 100, 'selesai'),
(23, 'Layouting Buletin Q1', 10, 100, 100, 'selesai'),
(24, 'Pengarsipan Dokumen PST Q1', 19, 100, 100, 'selesai'),
(25, 'Reviu Draf Informasi PPID Q1', 23, 100, 100, 'selesai'),
(26, 'Pemberkasan Laporan PPID Q1', 24, 100, 100, 'selesai'),
(27, 'Pengumpulan Indikator SAKIP Q1', 20, 100, 100, 'selesai'),
(28, 'Analisis Rencana Aksi Q1', 21, 100, 100, 'selesai'),
(29, 'Pengisian Aplikasi SAKIP Q1', 22, 100, 100, 'selesai'),
(30, 'Drafting LKjIP BPS Solok Q1', 25, 100, 100, 'selesai'),
(31, 'Bimtek Form Capaian Q1', 26, 100, 100, 'selesai'),
(32, 'Analisis IKU Sektoral Q1', 27, 100, 100, 'selesai');

-- ============================================
-- LOGBOOK HARIAN (TASK_LOGBOOKS)
-- ============================================
INSERT INTO task_logbooks (task_id, user_id, progress_percentage, notes) VALUES
(1, 2, 80, 'Data dari kecamatan A sudah terkumpul 80% dan sedang dirapikan.'),
(2, 6, 90, 'Proses rekapitulasi data selesai 90%, siap diajukan ke ketua tim.'),
(3, 6, 40, 'Progres input data lapangan padi sudah mencapai 40% dari total formulir.'),
(5, 2, 20, 'Baru menyusun outline presentasi dan slide latar belakang.'),
-- Logbook Q1 (semua 100% selesai)
(12, 2, 100, 'Selesai mengumpulkan data seluruh kecamatan untuk publikasi Q1.'),
(13, 6, 100, 'Seluruh foto KSA sudah diupload ke sistem pusat.'),
(14, 7, 100, 'Listing RT Susenas selesai 100%.'),
(15, 11, 100, 'Selesai menyusun rundown acara kunker.'),
(16, 12, 100, 'Agenda harian Kepala BPS telah terkoordinasi penuh.'),
(17, 13, 100, 'Seluruh undangan rapat evaluasi telah terkirim.'),
(18, 8, 100, 'Penjemputan Tamu VIP BPS RI terlaksana lancar.'),
(19, 14, 100, 'Pembelian dan penyerahan ATK triwulan I sukses.'),
(20, 15, 100, 'Fasilitas AC dan kelistrikan aula telah dipelihara.'),
(21, 9, 100, 'Inventarisasi sensus BMD telah rampung 100%.'),
(22, 16, 100, 'Naskah rilis kemiskinan dipublikasikan tepat waktu.'),
(23, 17, 100, 'Desain media sosial infografis selesai ter-publish.'),
(24, 18, 100, 'Liputan acara pojok statistik sukses.'),
(25, 10, 100, 'Layouting buletin internal telah dikirim ke percetakan.'),
(26, 19, 100, 'Arsip permohonan data PST telah tertata rapi.'),
(27, 23, 100, 'Uji konsekuensi PPID telah selesai dianalisis.'),
(28, 24, 100, 'Berkas laporan tahunan PPID dikirim ke BPS Provinsi.'),
(29, 20, 100, 'Indikator kinerja utama SAKIP terkumpul lengkap.'),
(30, 21, 100, 'Analisis evaluasi target kinerja diselesaikan.'),
(31, 22, 100, 'Pengisian data capaian SAKIP sukses di-submit.'),
(32, 25, 100, 'LKjIP Solok selesai disusun dengan baik.'),
(33, 26, 100, 'Bimbingan teknis pengisian form sukses diselenggarakan.'),
(34, 27, 100, 'Reviu indikator kinerja strategis selesai dievaluasi.');

-- ============================================
-- BOBOT PENILAIAN AKTIF (ADMIN CONFIG)
-- ============================================
INSERT INTO assessment_weights (kinerja_weight, perilaku_weight, presensi_weight) VALUES
(50, 30, 20);

-- ============================================
-- SEED PENILAIAN KUARTAL I (2026-Q1) - STATUS SUBMITTED (SIAP VALIDASI KEPALA BPS)
-- ============================================

-- 1. Evaluasi Kinerja (Rata-rata kegiatan)
INSERT INTO activity_evaluations (employee_id, activity_id, reviewer_id, period, speed_score, quality_score, contribution_score, responsibility_score, notes, status) VALUES
-- Budi Santoso & Rina Wati (DRAFT - Belum selesai penilaiannya)
(2, 10, 3, '2026-Q1', 88.00, 90.00, 85.00, 92.00, 'Sangat berdedikasi tinggi dalam penyusunan Publikasi Kecamatan Q1', 'draft'),
(6, 11, 3, '2026-Q1', 92.00, 88.00, 90.00, 88.00, 'Pekerjaan KSA selesai tepat waktu dan presisi', 'draft'),

-- Joko Susilo (SUBMITTED)
(7, 12, 3, '2026-Q1', 85.00, 85.00, 90.00, 85.00, 'Listing RT berjalan baik dan teratur', 'submitted'),

-- Anggota Tim Protokoler (Reviewer: 3)
(8,  16, 3, '2026-Q1', 88.00, 88.00, 88.00, 88.00, 'Kinerja protokoler sangat teratur', 'submitted'),
(11, 13, 3, '2026-Q1', 85.00, 87.00, 85.00, 88.00, 'Penyusunan jadwal pimpinan presisi', 'submitted'),
(12, 14, 3, '2026-Q1', 86.00, 85.00, 87.00, 86.00, 'Koordinasi harian berjalan kondusif', 'submitted'),
(13, 15, 3, '2026-Q1', 89.00, 88.00, 90.00, 89.00, 'Undangan terdistribusi tepat sasaran', 'submitted'),

-- Anggota Tim Bagian Umum (Reviewer: 8)
(9,  19, 8, '2026-Q1', 90.00, 90.00, 90.00, 90.00, 'Sensus BMD selesai 100%', 'submitted'),
(14, 17, 8, '2026-Q1', 85.00, 86.00, 85.00, 85.00, 'Administrasi pengadaan rapi', 'submitted'),
(15, 18, 8, '2026-Q1', 87.00, 88.00, 87.00, 88.00, 'Pemeliharaan gedung terawat', 'submitted'),

-- Anggota Tim Humas & Sosmed (Reviewer: 3)
(10, 23, 3, '2026-Q1', 88.00, 88.00, 88.00, 88.00, 'Penyusunan draf majalah terselesaikan', 'submitted'),
(16, 20, 3, '2026-Q1', 86.00, 86.00, 87.00, 87.00, 'Naskah rilis kemiskinan informatif', 'submitted'),
(17, 21, 3, '2026-Q1', 88.00, 89.00, 88.00, 89.00, 'Infografis media sosial estetik', 'submitted'),
(18, 22, 3, '2026-Q1', 91.00, 90.00, 91.00, 90.00, 'Liputan Pojok Statistik terdokumentasi baik', 'submitted'),

-- Anggota Tim PPID (Reviewer: 9)
(19, 24, 9, '2026-Q1', 89.00, 89.00, 89.00, 89.00, 'Arsip permohonan tertata rapi', 'submitted'),
(23, 25, 9, '2026-Q1', 88.00, 88.00, 88.00, 88.00, 'Analisis uji konsekuensi valid', 'submitted'),
(24, 26, 9, '2026-Q1', 87.00, 87.00, 88.00, 88.00, 'Laporan tahunan PPID dikirim tepat waktu', 'submitted'),

-- Anggota Tim SAKIP (Reviewer: 10)
(20, 27, 10, '2026-Q1', 89.00, 90.00, 89.00, 90.00, 'Pengumpulan indikator lengkap', 'submitted'),
(21, 28, 10, '2026-Q1', 88.00, 88.00, 88.00, 88.00, 'Rencana aksi selesai dianalisis', 'submitted'),
(22, 29, 10, '2026-Q1', 90.00, 90.00, 90.00, 90.00, 'Pengisian aplikasi SAKIP berhasil', 'submitted'),
(25, 30, 10, '2026-Q1', 92.00, 92.00, 92.00, 92.00, 'Draf LKjIP disusun dengan sangat baik', 'submitted'),
(26, 31, 10, '2026-Q1', 87.00, 88.00, 87.00, 88.00, 'Sosialisasi bimtek berjalan sukses', 'submitted'),
(27, 32, 10, '2026-Q1', 88.00, 88.00, 88.00, 88.00, 'Reviu indikator kinerja strategis selesai', 'submitted');

-- 2. Evaluasi Perilaku ASN (Ber-AKHLAK + Disiplin)
INSERT INTO behavior_evaluations (employee_id, reviewer_id, period, orientasi_pelayanan, akuntabilitas, kompetensi, harmonis, loyal, adaptif, kolaboratif, disiplin, notes, status) VALUES
-- Budi Santoso & Rina Wati (DRAFT)
(2, 3, '2026-Q1', 85, 90, 85, 88, 90, 85, 90, 88, 'Perilaku kerja sangat sopan, profesional, loyal, dan berintegritas.', 'draft'),
(6, 3, '2026-Q1', 90, 88, 90, 85, 90, 88, 92, 90, 'Memiliki kerjasama tim yang luar biasa dan inisiatif tinggi.', 'draft'),

-- Joko Susilo (SUBMITTED)
(7, 3, '2026-Q1', 88, 85, 88, 90, 85, 85, 88, 85, 'Sangat ramah, komunikatif, dan membantu kelancaran survei.', 'submitted'),

-- Pegawai Baru (Users 8-27, status = 'submitted')
(8,  3, '2026-Q1', 88, 88, 88, 88, 88, 88, 88, 88, 'Sikap kerja sangat berdedikasi tinggi.', 'submitted'),
(9,  8, '2026-Q1', 87, 87, 87, 87, 87, 87, 87, 87, 'Bertanggung jawab dan berdisiplin tinggi.', 'submitted'),
(10, 3, '2026-Q1', 86, 86, 86, 86, 86, 86, 86, 86, 'Selalu bekerjasama dengan baik.', 'submitted'),
(11, 3, '2026-Q1', 85, 85, 85, 85, 85, 85, 85, 85, 'Perilaku sopan and komunikatif.', 'submitted'),
(12, 3, '2026-Q1', 89, 89, 89, 89, 89, 89, 89, 89, 'Sangat loyal dan proaktif membantu.', 'submitted'),
(13, 3, '2026-Q1', 90, 90, 90, 90, 90, 90, 90, 90, 'Disiplin kehadiran dan etos kerja luar biasa.', 'submitted'),
(14, 8, '2026-Q1', 85, 85, 85, 85, 85, 85, 85, 85, 'Sikap kerja santun dan profesional.', 'submitted'),
(15, 8, '2026-Q1', 87, 87, 87, 87, 87, 87, 87, 87, 'Sangat membantu dalam pemeliharaan gedung.', 'submitted'),
(16, 3, '2026-Q1', 88, 88, 88, 88, 88, 88, 88, 88, 'Komunikasi publik yang ramah dan aktif.', 'submitted'),
(17, 3, '2026-Q1', 89, 89, 89, 89, 89, 89, 89, 89, 'Desain kreatif dan inovatif.', 'submitted'),
(18, 3, '2026-Q1', 90, 90, 90, 90, 90, 90, 90, 90, 'Kerjasama tim Humas sangat padu.', 'submitted'),
(19, 9, '2026-Q1', 89, 89, 89, 89, 89, 89, 89, 89, 'Pelayanan publik PPID sangat ramah.', 'submitted'),
(20, 10, '2026-Q1', 87, 87, 87, 87, 87, 87, 87, 87, 'Rapi dan teliti dalam administrasi.', 'submitted'),
(21, 10, '2026-Q1', 88, 88, 88, 88, 88, 88, 88, 88, 'Sikap akuntabel tinggi.', 'submitted'),
(22, 10, '2026-Q1', 89, 89, 89, 89, 89, 89, 89, 89, 'Inisiatif tinggi dalam reviu SAKIP.', 'submitted'),
(23, 9, '2026-Q1', 90, 90, 90, 90, 90, 90, 90, 90, 'Integritas dan dedikasi sangat baik.', 'submitted'),
(24, 9, '2026-Q1', 85, 85, 85, 85, 85, 85, 85, 85, 'Disiplin and bertanggung jawab.', 'submitted'),
(25, 10, '2026-Q1', 92, 92, 92, 92, 92, 92, 92, 92, 'Sikap kepemimpinan dan dedikasi luar biasa.', 'submitted'),
(26, 10, '2026-Q1', 88, 88, 88, 88, 88, 88, 88, 88, 'Komunikatif saat mengadakan bimtek.', 'submitted'),
(27, 10, '2026-Q1', 87, 87, 87, 87, 87, 87, 87, 87, 'Selalu menunjukkan sikap BerAKHLAK.', 'submitted');

-- 3. Evaluasi Presensi Kehadiran (Oleh Kasubag)
INSERT INTO attendance_evaluations (employee_id, reviewer_id, period, attendance_score, notes, status) VALUES
(2, 4, '2026-Q1', 96.00, 'Hadir penuh selama kuartal I, tanpa cuti/alasan sakit.', 'submitted'),
(6, 4, '2026-Q1', 90.00, 'Kehadiran sangat baik, tercatat 2 kali terlambat masuk.', 'submitted'),
(7, 4, '2026-Q1', 94.00, 'Disiplin kehadiran tinggi, kerja lembur saat Susenas.', 'submitted'),
(3, 4, '2026-Q1', 92.00, 'Tingkat kehadiran sangat disiplin, koordinasi tim kuartal I berjalan lancar.', 'submitted'),

-- Pegawai Baru (8-27, status = 'submitted')
(8,  4, '2026-Q1', 95.00, 'Kehadiran sangat tertib.', 'submitted'),
(9,  4, '2026-Q1', 94.00, 'Kehadiran disiplin tinggi.', 'submitted'),
(10, 4, '2026-Q1', 92.00, 'Hadir penuh tanpa absen.', 'submitted'),
(11, 4, '2026-Q1', 93.00, 'Hadir tepat waktu.', 'submitted'),
(12, 4, '2026-Q1', 95.00, 'Tingkat kehadiran prima.', 'submitted'),
(13, 4, '2026-Q1', 96.00, 'Kehadiran penuh selama triwulan.', 'submitted'),
(14, 4, '2026-Q1', 91.00, 'Tercatat 1 kali izin sakit.', 'submitted'),
(15, 4, '2026-Q1', 92.00, 'Kehadiran rutin sangat baik.', 'submitted'),
(16, 4, '2026-Q1', 93.00, 'Disiplin kehadiran terpuji.', 'submitted'),
(17, 4, '2026-Q1', 94.00, 'Hadir aktif di Humas.', 'submitted'),
(18, 4, '2026-Q1', 95.00, 'Kehadiran penuh tanpa terlambat.', 'submitted'),
(19, 4, '2026-Q1', 92.00, 'Sangat disiplin dan tepat waktu.', 'submitted'),
(20, 4, '2026-Q1', 93.00, 'Disiplin kehadiran sangat tinggi.', 'submitted'),
(21, 4, '2026-Q1', 94.00, 'Kehadiran rutin 100%.', 'submitted'),
(22, 4, '2026-Q1', 91.00, 'Tercatat 2 kali datang terlambat.', 'submitted'),
(23, 4, '2026-Q1', 95.00, 'Sangat rajin hadir penuh.', 'submitted'),
(24, 4, '2026-Q1', 93.00, 'Tingkat disiplin sangat baik.', 'submitted'),
(25, 4, '2026-Q1', 96.00, 'Kehadiran sempurna.', 'submitted'),
(26, 4, '2026-Q1', 94.00, 'Tertib dan selalu tepat waktu.', 'submitted'),
(27, 4, '2026-Q1', 93.00, 'Disiplin kerja luar biasa.', 'submitted');


-- ============================================
-- SEED PENILAIAN KUARTAL II (2026-Q2) - STATUS DRAFT (UNTUK DRAFTING PENILAIAN)
-- ============================================

-- 1. Evaluasi Kinerja (Draf Kegiatan)
INSERT INTO activity_evaluations (employee_id, activity_id, reviewer_id, period, speed_score, quality_score, contribution_score, responsibility_score, notes, status) VALUES
(2, 1, 3, '2026-Q2', 80.00, 85.00, 80.00, 85.00, 'Draft awal evaluasi kegiatan Halal Bi Halal', 'draft');

-- 2. Evaluasi Perilaku (Draf Perilaku)
INSERT INTO behavior_evaluations (employee_id, reviewer_id, period, orientasi_pelayanan, akuntabilitas, kompetensi, harmonis, loyal, adaptif, kolaboratif, disiplin, notes, status) VALUES
(2, 3, '2026-Q2', 80, 80, 80, 80, 80, 80, 80, 80, 'Draft perilaku awal untuk kuartal II.', 'draft');

-- 3. Evaluasi Presensi (Draf Presensi)
INSERT INTO attendance_evaluations (employee_id, reviewer_id, period, attendance_score, notes, status) VALUES
(2, 4, '2026-Q2', 90.00, 'Draft presensi sementara di Kuartal II.', 'draft');

-- ============================================
-- SEED VALIDASI PURE LEADER KEPALA BPS K1
-- ============================================
INSERT INTO behavior_evaluations (employee_id, reviewer_id, period, orientasi_pelayanan, akuntabilitas, kompetensi, harmonis, loyal, adaptif, kolaboratif, disiplin, notes, status) VALUES
(3, 5, '2026-Q1', 87.00, 87.00, 87.00, 87.00, 87.00, 87.00, 87.00, 87.00, 'Evaluasi perilaku kepemimpinan sangat solid dan disiplin.', 'submitted');

INSERT INTO final_assessments (employee_id, period, kinerja_score, perilaku_score, presensi_score, final_score, validated_by, validated_at, notes, status) VALUES
(3, '2026-Q1', 88.00, 87.00, 92.00, 88.50, 5, CURRENT_TIMESTAMP, 'Kepemimpinan sangat tangguh dalam mengawal data sektoral kuartal I.', 'validated');

