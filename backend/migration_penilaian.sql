-- ============================================================
-- MIGRATION: Redesign Tabel performance_reviews
-- Jalankan di psql atau DBeaver untuk meng-update schema DB
-- yang sudah berjalan (tanpa drop ulang seluruh database)
-- ============================================================

-- Langkah 1: Hapus data penilaian lama
TRUNCATE TABLE performance_reviews;

-- Langkah 2: Hapus kolom lama
ALTER TABLE performance_reviews DROP COLUMN IF EXISTS stage;
ALTER TABLE performance_reviews DROP COLUMN IF EXISTS discipline_score;
ALTER TABLE performance_reviews DROP COLUMN IF EXISTS notes;

-- Langkah 3: Tambah kolom baru
ALTER TABLE performance_reviews
  ADD COLUMN IF NOT EXISTS responsibility_score DECIMAL(5,2),
  ADD COLUMN IF NOT EXISTS reviewer_notes TEXT,
  ADD COLUMN IF NOT EXISTS kepala_notes TEXT,
  ADD COLUMN IF NOT EXISTS validated_by INT REFERENCES users(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS validated_at TIMESTAMP;

-- Langkah 4: Ubah constraint status
ALTER TABLE performance_reviews DROP CONSTRAINT IF EXISTS performance_reviews_status_check;
ALTER TABLE performance_reviews
  ALTER COLUMN status SET DEFAULT 'menunggu_validasi',
  ADD CONSTRAINT performance_reviews_status_check
    CHECK (status IN ('menunggu_validasi', 'tervalidasi'));

-- Selesai! Cek hasilnya:
-- SELECT column_name, data_type FROM information_schema.columns
-- WHERE table_name = 'performance_reviews';
