-- ============================================
-- SCHEMA DATABASE BPS KINERJA PEGAWAI (PostgreSQL)
-- ============================================

CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  nip VARCHAR(30) UNIQUE,
  email VARCHAR(100) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  role VARCHAR(20) DEFAULT 'pegawai' CHECK (role IN ('admin','pegawai','ketua_tim','kasubag','kepala_bps')),
  pangkat VARCHAR(50),
  jabatan VARCHAR(100),
  unit_kerja VARCHAR(100),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE teams (
  id SERIAL PRIMARY KEY,
  team_name VARCHAR(100) NOT NULL,
  leader_id INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (leader_id) REFERENCES users(id) ON DELETE SET NULL
);

CREATE TABLE team_members (
  id SERIAL PRIMARY KEY,
  team_id INT NOT NULL,
  user_id INT NOT NULL,
  UNIQUE (team_id, user_id),
  FOREIGN KEY (team_id) REFERENCES teams(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE activities (
  id SERIAL PRIMARY KEY,
  title VARCHAR(200) NOT NULL,
  description TEXT,
  deadline DATE,
  created_by INT,
  team_id INT,
  assigned_to INT,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending','on_progress','selesai')),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
  FOREIGN KEY (team_id) REFERENCES teams(id) ON DELETE SET NULL,
  FOREIGN KEY (assigned_to) REFERENCES users(id) ON DELETE SET NULL
);

CREATE TABLE activity_progress (
  id SERIAL PRIMARY KEY,
  activity_id INT NOT NULL,
  user_id INT NOT NULL,
  progress_percentage INT DEFAULT 0 CHECK (progress_percentage >= 0 AND progress_percentage <= 100),
  notes TEXT,
  file_report VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (activity_id) REFERENCES activities(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE attendance (
  id SERIAL PRIMARY KEY,
  user_id INT NOT NULL,
  hadir INT DEFAULT 0,
  terlambat INT DEFAULT 0,
  pulang_cepat INT DEFAULT 0,
  hadir_rapat INT DEFAULT 0,
  hadir_upacara INT DEFAULT 0,
  periode VARCHAR(20) NOT NULL,
  UNIQUE (user_id, periode),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE performance_reviews (
  id SERIAL PRIMARY KEY,
  user_id INT NOT NULL,              -- pegawai yang dinilai
  reviewer_id INT NOT NULL,          -- ketua_tim / kasubag yang menilai
  speed_score DECIMAL(5,2),          -- Kecepatan Pengerjaan (0-100)
  quality_score DECIMAL(5,2),        -- Kualitas Pekerjaan (0-100)
  contribution_score DECIMAL(5,2),   -- Kontribusi Tim (0-100)
  responsibility_score DECIMAL(5,2), -- Tanggung Jawab (0-100)
  total_score DECIMAL(5,2),          -- Rata-rata 4 komponen
  reviewer_notes TEXT,               -- Catatan dari penilai (atasan)
  kepala_notes TEXT,                 -- Catatan revisi dari Kepala BPS
  status VARCHAR(30) DEFAULT 'menunggu_validasi'
    CHECK (status IN ('menunggu_validasi', 'tervalidasi')),
  validated_by INT,                  -- id kepala_bps yang memvalidasi
  validated_at TIMESTAMP,
  periode VARCHAR(20),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (reviewer_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (validated_by) REFERENCES users(id) ON DELETE SET NULL
);

CREATE TABLE employee_of_month (
  id SERIAL PRIMARY KEY,
  user_id INT NOT NULL,
  total_score DECIMAL(5,2),
  period VARCHAR(20) NOT NULL,
  validated_by INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (validated_by) REFERENCES users(id) ON DELETE SET NULL
);
