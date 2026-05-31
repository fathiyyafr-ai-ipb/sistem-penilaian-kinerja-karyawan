-- ============================================
-- SCHEMA DATABASE BPS KINERJA PEGAWAI (PostgreSQL)
-- ============================================

DROP TABLE IF EXISTS notifications CASCADE;
DROP TABLE IF EXISTS final_assessments CASCADE;
DROP TABLE IF EXISTS attendance_evaluations CASCADE;
DROP TABLE IF EXISTS behavior_evaluations CASCADE;
DROP TABLE IF EXISTS activity_evaluations CASCADE;
DROP TABLE IF EXISTS assessment_weights CASCADE;
DROP TABLE IF EXISTS task_logbooks CASCADE;
DROP TABLE IF EXISTS tasks CASCADE;
DROP TABLE IF EXISTS activity_progress CASCADE;
DROP TABLE IF EXISTS activities CASCADE;
DROP TABLE IF EXISTS team_members CASCADE;
DROP TABLE IF EXISTS teams CASCADE;
DROP TABLE IF EXISTS users CASCADE;

CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  nip VARCHAR(30) UNIQUE,
  email VARCHAR(100) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  role VARCHAR(20) DEFAULT 'pegawai' CHECK (role IN ('admin','pegawai','kasubag','kepala_bps')),
  pangkat VARCHAR(50),
  jabatan VARCHAR(100),
  unit_kerja VARCHAR(100),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE teams (
  id SERIAL PRIMARY KEY,
  team_name VARCHAR(100) NOT NULL,
  leader_id INT,
  type VARCHAR(20) DEFAULT 'inti' CHECK (type IN ('inti', 'adhoc')),
  is_active BOOLEAN DEFAULT TRUE,
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
  start_date DATE,
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

CREATE TABLE assessment_weights (
  id SERIAL PRIMARY KEY,
  kinerja_weight INT NOT NULL DEFAULT 50 CHECK (kinerja_weight >= 0 AND kinerja_weight <= 100),
  perilaku_weight INT NOT NULL DEFAULT 30 CHECK (perilaku_weight >= 0 AND perilaku_weight <= 100),
  presensi_weight INT NOT NULL DEFAULT 20 CHECK (presensi_weight >= 0 AND presensi_weight <= 100),
  active BOOLEAN DEFAULT TRUE,
  CHECK (kinerja_weight + perilaku_weight + presensi_weight = 100)
);

CREATE TABLE activity_evaluations (
  id SERIAL PRIMARY KEY,
  employee_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  activity_id INT NOT NULL REFERENCES activities(id) ON DELETE CASCADE,
  reviewer_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  period VARCHAR(10) NOT NULL, -- Format: YYYY-Q# (contoh: 2026-Q1)
  speed_score DECIMAL(5,2) DEFAULT 0,
  quality_score DECIMAL(5,2) DEFAULT 0,
  contribution_score DECIMAL(5,2) DEFAULT 0,
  responsibility_score DECIMAL(5,2) DEFAULT 0,
  notes TEXT,
  status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'submitted')),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(employee_id, activity_id)
);

CREATE TABLE behavior_evaluations (
  id SERIAL PRIMARY KEY,
  employee_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  reviewer_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  period VARCHAR(10) NOT NULL,
  orientasi_pelayanan DECIMAL(5,2) DEFAULT 0,
  akuntabilitas DECIMAL(5,2) DEFAULT 0,
  kompetensi DECIMAL(5,2) DEFAULT 0,
  harmonis DECIMAL(5,2) DEFAULT 0,
  loyal DECIMAL(5,2) DEFAULT 0,
  adaptif DECIMAL(5,2) DEFAULT 0,
  kolaboratif DECIMAL(5,2) DEFAULT 0,
  disiplin DECIMAL(5,2) DEFAULT 0,
  notes TEXT,
  status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'submitted')),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(employee_id, period)
);

CREATE TABLE attendance_evaluations (
  id SERIAL PRIMARY KEY,
  employee_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  reviewer_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  period VARCHAR(10) NOT NULL,
  attendance_score DECIMAL(5,2) DEFAULT 0,
  notes TEXT,
  status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'submitted')),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(employee_id, period)
);

CREATE TABLE final_assessments (
  id SERIAL PRIMARY KEY,
  employee_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  period VARCHAR(10) NOT NULL,
  kinerja_score DECIMAL(5,2) DEFAULT 0,
  perilaku_score DECIMAL(5,2) DEFAULT 0,
  presensi_score DECIMAL(5,2) DEFAULT 0,
  final_score DECIMAL(5,2) DEFAULT 0,
  validated_by INT REFERENCES users(id) ON DELETE SET NULL,
  validated_at TIMESTAMP,
  notes TEXT, -- Catatan Kepala BPS
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'validated', 'published')),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(employee_id, period)
);

CREATE TABLE notifications (
  id SERIAL PRIMARY KEY,
  user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE tasks (
  id SERIAL PRIMARY KEY,
  activity_id INT NOT NULL REFERENCES activities(id) ON DELETE CASCADE,
  title VARCHAR(200) NOT NULL,
  assigned_to INT REFERENCES users(id) ON DELETE SET NULL,
  weight INT NOT NULL CHECK (weight >= 0 AND weight <= 100),
  progress_percentage INT DEFAULT 0 CHECK (progress_percentage >= 0 AND progress_percentage <= 100),
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending','on_progress','selesai')),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE task_logbooks (
  id SERIAL PRIMARY KEY,
  task_id INT NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  progress_percentage INT NOT NULL CHECK (progress_percentage >= 0 AND progress_percentage <= 100),
  notes TEXT NOT NULL,
  file_report VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
