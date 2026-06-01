# Sistem Penilaian Kinerja Karyawan (Badan Pusat Statistik Kabupaten Solok)

## Anggota Kelompok
1. Fathiyya Fitriani Refananda - M0405241013
2. Jonathan Seth Saloh - M040524014
3. Siti Khodijah Nailah - M0405241015

## Tentang Sistem
Sistem Penilaian Kinerja Karyawan ini adalah aplikasi berbasis web yang dirancang khusus untuk **Badan Pusat Statistik (BPS) Kabupaten Solok**. 

Sistem ini dibuat untuk memfasilitasi proses pemantauan tugas, logbook harian, serta evaluasi kinerja pegawai secara objektif, transparan, dan terukur berdasarkan indikator kinerja kegiatan dan aspek perilaku Ber-AKHLAK.

**Sistem ini diperuntukkan bagi:**
- **Pegawai:** Untuk mengelola tugas harian, mengisi logbook, dan melihat rapor penilaian (Employee of the Month).
- **Ketua Tim:** Untuk memanajemen kegiatan tim dan memberikan penilaian kecepatan, kualitas, kontribusi, serta perilaku Ber-AKHLAK kepada anggotanya.
- **Kasubag:** Untuk memberikan penilaian terkait tingkat kedisiplinan dan presensi (kehadiran) pegawai.
- **Kepala BPS:** Untuk meninjau, memberikan catatan, dan memvalidasi (finalisasi) seluruh penilaian yang secara otomatis menentukan predikat dan *Employee of the Month*.
- **Admin:** Untuk mengelola master data pegawai, tim, dan konfigurasi bobot penilaian.

## Class Diagram (Entity Relationship Diagram)
Berikut adalah struktur skema database PostgreSQL yang digunakan di dalam sistem ini:

```mermaid
erDiagram
    users {
        int id PK
        varchar name
        varchar nip
        varchar email
        varchar password
        varchar role
        varchar pangkat
        varchar jabatan
        varchar unit_kerja
        timestamp created_at
    }

    teams {
        int id PK
        varchar team_name
        int leader_id FK "users(id)"
        varchar type
        boolean is_active
        timestamp created_at
    }

    team_members {
        int id PK
        int team_id FK "teams(id)"
        int user_id FK "users(id)"
    }

    activities {
        int id PK
        varchar title
        text description
        date start_date
        date deadline
        int created_by FK "users(id)"
        int team_id FK "teams(id)"
        int assigned_to FK "users(id)"
        varchar status
        timestamp created_at
    }

    tasks {
        int id PK
        int activity_id FK "activities(id)"
        varchar title
        int assigned_to FK "users(id)"
        int weight
        int progress_percentage
        varchar status
        timestamp created_at
    }

    task_logbooks {
        int id PK
        int task_id FK "tasks(id)"
        int user_id FK "users(id)"
        int progress_percentage
        text notes
        varchar file_report
        timestamp created_at
        timestamp updated_at
    }

    activity_progress {
        int id PK
        int activity_id FK "activities(id)"
        int user_id FK "users(id)"
        int progress_percentage
        text notes
        varchar file_report
        timestamp created_at
    }

    assessment_weights {
        int id PK
        int kinerja_weight
        int perilaku_weight
        int presensi_weight
        boolean active
    }

    activity_evaluations {
        int id PK
        int employee_id FK "users(id)"
        int activity_id FK "activities(id)"
        int reviewer_id FK "users(id)"
        varchar period
        decimal speed_score
        decimal quality_score
        decimal contribution_score
        decimal responsibility_score
        text notes
        varchar status
        timestamp created_at
        timestamp updated_at
    }

    behavior_evaluations {
        int id PK
        int employee_id FK "users(id)"
        int reviewer_id FK "users(id)"
        varchar period
        decimal orientasi_pelayanan
        decimal akuntabilitas
        decimal kompetensi
        decimal harmonis
        decimal loyal
        decimal adaptif
        decimal kolaboratif
        decimal disiplin
        text notes
        varchar status
        timestamp created_at
        timestamp updated_at
    }

    attendance_evaluations {
        int id PK
        int employee_id FK "users(id)"
        int reviewer_id FK "users(id)"
        varchar period
        decimal attendance_score
        text notes
        varchar status
        timestamp created_at
        timestamp updated_at
    }

    final_assessments {
        int id PK
        int employee_id FK "users(id)"
        varchar period
        decimal kinerja_score
        decimal perilaku_score
        decimal presensi_score
        decimal final_score
        int validated_by FK "users(id)"
        timestamp validated_at
        text notes
        varchar status
        timestamp created_at
        timestamp updated_at
    }

    notifications {
        int id PK
        int user_id FK "users(id)"
        text message
        boolean is_read
        timestamp created_at
    }

    %% Relationships
    users ||--o{ teams : "memimpin"
    users ||--o{ team_members : "tergabung dalam"
    teams ||--o{ team_members : "berisi"
    
    users ||--o{ activities : "membuat"
    users ||--o{ activities : "ditugaskan ke"
    teams ||--o{ activities : "memiliki kegiatan"
    
    activities ||--o{ activity_progress : "mencatat progress"
    users ||--o{ activity_progress : "melaporkan"
    
    activities ||--o{ tasks : "dibagi menjadi"
    users ||--o{ tasks : "ditugaskan ke"
    
    tasks ||--o{ task_logbooks : "memiliki log harian"
    users ||--o{ task_logbooks : "dicatat oleh"
    
    users ||--o{ activity_evaluations : "dievaluasi kinerjanya"
    users ||--o{ activity_evaluations : "dinilai oleh"
    activities ||--o{ activity_evaluations : "menjadi dasar evaluasi"
    
    users ||--o{ behavior_evaluations : "dievaluasi perilakunya"
    users ||--o{ behavior_evaluations : "dinilai oleh"
    
    users ||--o{ attendance_evaluations : "dievaluasi presensinya"
    users ||--o{ attendance_evaluations : "dinilai oleh"
    
    users ||--o{ final_assessments : "mendapatkan hasil akhir"
    users ||--o{ final_assessments : "divalidasi oleh"
    
    users ||--o{ notifications : "menerima notifikasi"
```

## Tampilan Fitur-fitur

### 1. Login
Sistem otentikasi pengguna berdasarkan Role (Admin, Pegawai, Ketua Tim, Kasubag, Kepala BPS).
![Tampilan Login]

### 2. Dashboard / Beranda
Halaman utama yang menampilkan ringkasan performa dan notifikasi sistem.
![Tampilan Dashboard]
### 3. Manajemen Kepegawaian (Admin)
Halaman bagi admin untuk mengelola master data pegawai, penugasan peran, dan unit kerja.
![Tampilan Manajemen Pegawai]

### 4. Manajemen Tim Kerja
Fasilitas pembentukan tim (Inti/Ad-hoc) dan pengaturan ketua tim beserta anggotanya.
![Tampilan Manajemen Tim]

### 5. Manajemen Kegiatan & Logbook
Manajemen tugas harian dan target kuartal serta pelaporan logbook kegiatan oleh pegawai secara *real-time*.
![Tampilan Kegiatan & Logbook]

### 6. Evaluasi & Penilaian
Halaman pengisian evaluasi kinerja kegiatan (Ketua Tim), perilaku Ber-AKHLAK (Ketua Tim), dan nilai kehadiran (Kasubag).
![Tampilan Penilaian Tim]

### 7. Validasi Pimpinan (Kepala BPS)
Halaman finalisasi nilai dengan kalkulasi bobot otomatis serta form pemberian *feedback* tertulis dari Kepala BPS.
![Tampilan Validasi Pimpinan]

### 8. Laporan & Peringkat (Employee of the Month)
Halaman visualisasi skor akhir pegawai dan panggung penganugerahan untuk *Best Employees* di setiap periode.
![Tampilan Laporan / Employee of the Month]

## Requirements
Sebelum menginisiasi proyek ini, pastikan sistem Anda telah terinstal:
- **Node.js** (Versi 18 atau yang lebih baru)
- **PostgreSQL** (Versi 12 atau yang lebih baru)
- **npm** atau **yarn** (sebagai *package manager*)

## Instalasi & Cara Menjalankan

### 1. Clone Repository & Setup Database
1. Buka terminal dan lakukan *clone*:
   ```bash
   git clone https://github.com/fathiyyafr-ai-ipb/sistem-penilaian-kinerja-karyawan.git
   cd sistem-penilaian-kinerja-karyawan
   ```
2. Buka klien PostgreSQL Anda (misalnya pgAdmin/psql) dan buat database baru bernama `bps_kinerja`.
3. Jalankan *query* yang terdapat di dalam file `backend/schema.sql` untuk membuat seluruh tabel, lalu jalankan `backend/seed.sql` untuk memasukkan data-data contoh (dummy).

### 2. Konfigurasi & Menjalankan Backend
1. Masuk ke direktori backend:
   ```bash
   cd backend
   npm install
   ```
2. Salin file environment:
   ```bash
   cp .env.example .env
   ```
3. Buka file `.env` dan atur kredensial koneksi PostgreSQL Anda:
   ```env
   DB_USER=postgres
   DB_PASSWORD=password_anda
   DB_NAME=bps_kinerja
   DB_PORT=5432
   ```
4. Mulai server backend:
   ```bash
   npm run dev
   ```
   *(Backend akan merespons melalui `http://localhost:5000`)*

### 3. Konfigurasi & Menjalankan Frontend
1. Buka tab terminal baru dan arahkan ke direktori frontend:
   ```bash
   cd frontend
   npm install
   ```
2. Mulai server frontend:
   ```bash
   npm run dev
   ```
   *(Frontend dapat diakses di `http://localhost:3000` atau URL lain yang dimunculkan oleh Vite)*

### Akun Sandi Default (Testing)
Untuk keperluan pengujian aplikasi, silakan masuk menggunakan kredensial bawaan berikut:
- **Admin**: `admin@bps.go.id` (Pass: `password`)
- **Pegawai**: `pegawai@bps.go.id` (Pass: `password`)
- **Ketua Tim**: `ketuatim@bps.go.id` (Pass: `password`)
- **Kasubag**: `kasubag@bps.go.id` (Pass: `password`)
- **Kepala BPS**: `kepalabps@bps.go.id` (Pass: `password`)
