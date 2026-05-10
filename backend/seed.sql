-- ============================================
-- DATA DUMMY / SEED
-- Semua password: [role]123 (misal admin123, pegawai123, dst)
-- Hash bcrypt rounds=10 untuk password "password"
-- ============================================

INSERT INTO users (name, nip, email, password, role, pangkat, jabatan, unit_kerja) VALUES
('Administrator',       '000000000',        'admin@bps.go.id',      '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin',       '-',                    'Administrator',          'IT'),
('Budi Santoso',        '198501012010011001','pegawai@bps.go.id',    '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'pegawai',     'Penata Muda/IIIa',     'Statistisi Pertama',     'Statistik Produksi'),
('Siti Rahayu',         '198703152011012002','ketuatim@bps.go.id',   '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'ketua_tim',   'Penata/IIIc',          'Statistisi Muda',        'Statistik Sosial'),
('Drs. Ahmad Fauzi',    '197605202001011003','kasubag@bps.go.id',    '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'kasubag',     'Pembina/IVa',          'Ka. Sub Bagian Umum',    'Tata Usaha'),
('Dr. Hendra Wijaya',   '197201011998031001','kepalabps@bps.go.id',  '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'kepala_bps',  'Pembina Utama Muda/IVc','Kepala BPS',            'Pimpinan'),
('Rina Wati',           '199001012015012004','rina@bps.go.id',       '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'pegawai',     'Pengatur/IIc',         'Pengolah Data',          'Statistik Produksi'),
('Joko Susilo',         '199205102016011005','joko@bps.go.id',       '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'pegawai',     'Pengatur Muda/IIa',    'Pencacah',               'Statistik Sosial');

-- CATATAN: Hash di atas adalah untuk password "password"

INSERT INTO teams (team_name, leader_id) VALUES
('Tim Statistik Produksi', 3),
('Tim Statistik Sosial', 3);

INSERT INTO team_members (team_id, user_id) VALUES
(1, 2), (1, 6),
(2, 7);

INSERT INTO activities (title, description, deadline, created_by, team_id, assigned_to, status) VALUES
('Survei Tempat Halal Bi Halal',         'Pendataan tempat pelaksanaan halal bi halal seluruh kecamatan', '2025-05-15', 3, 1, 2, 'on_progress'),
('Pengelolaan Data Padi Desa Parongpong','Input dan validasi data produksi padi Desa Parongpong',         '2025-05-18', 3, 1, 6, 'on_progress'),
('Presentasi Progress Report',           'Persiapan dan pelaksanaan presentasi laporan kemajuan',          '2025-05-22', 3, 1, 2, 'pending');

INSERT INTO activity_progress (activity_id, user_id, progress_percentage, notes) VALUES
(1, 2, 85, 'Data sudah terkumpul 85%, tinggal validasi'),
(2, 6, 40, 'Sedang proses input data'),
(3, 2, 20, 'Baru membuat outline presentasi');

INSERT INTO attendance (user_id, hadir, terlambat, pulang_cepat, hadir_rapat, hadir_upacara, periode) VALUES
(2, 22, 4, 1, 3, 2, '2025-05'),
(6, 20, 2, 0, 3, 2, '2025-05'),
(7, 21, 1, 0, 2, 1, '2025-05');

INSERT INTO performance_reviews (user_id, reviewer_id, speed_score, quality_score, contribution_score, responsibility_score, total_score, reviewer_notes, status, periode) VALUES
(2, 3, 85, 88, 82, 90, 86.25, 'Kinerja baik, perlu peningkatan kecepatan', 'menunggu_validasi', '2025-05'),
(6, 3, 78, 80, 75, 82, 78.75, 'Cukup baik, perlu bimbingan lebih',         'menunggu_validasi', '2025-05'),
(7, 4, 72, 76, 70, 74, 73.00, 'Kinerja standar, disiplin masih perlu ditingkatkan', 'tervalidasi', '2025-05');
