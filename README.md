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
<img width="916" height="938" alt="image" src="https://github.com/user-attachments/assets/65fda2cc-226f-4345-9a80-1cf4d93e0281" />

## Tampilan Fitur-fitur

### 1. Login
Sistem otentikasi pengguna berdasarkan Role (Admin, Pegawai, Ketua Tim, Kasubag, Kepala BPS).
![Tampilan Login] 
<img width="2399" height="1398" alt="image" src="https://github.com/user-attachments/assets/ab97e56d-6b7f-44c2-847e-5ac2310601c6" />

### 2. Dashboard / Beranda
Halaman utama yang menampilkan ringkasan performa dan notifikasi sistem.
![Tampilan Dashboard] 
<img width="2010" height="1172" alt="image" src="https://github.com/user-attachments/assets/5f9db19e-bacd-4371-947b-003c93605b75" />

### 3. Manajemen Kepegawaian (Admin)
Halaman bagi admin untuk mengelola master data pegawai, penugasan peran, dan unit kerja.
![Tampilan Manajemen Pegawai] 
<img width="2380" height="1400" alt="image" src="https://github.com/user-attachments/assets/0f7ff735-95ed-4dd4-9707-0c6914680547" />

### 4. Manajemen Tim Kerja
Fasilitas pembentukan tim (Inti/Ad-hoc) dan pengaturan ketua tim beserta anggotanya.
![Tampilan Manajemen Tim] 
<img width="2399" height="1396" alt="image" src="https://github.com/user-attachments/assets/4f81547f-73c0-49b4-9a9e-ff9f0f3c6b65" />

### 5. Manajemen Kegiatan & Logbook
Manajemen tugas dan target kuartal oleh ketua tim serta pelaporan logbook kegiatan oleh pegawai secara *real-time*.
![Tampilan Kegiatan & Logbook]
<img width="2380" height="1395" alt="image" src="https://github.com/user-attachments/assets/00280cf5-a26a-4991-bd54-341340e842bc" />
<img width="2398" height="1394" alt="image" src="https://github.com/user-attachments/assets/7aec620d-d501-4ad4-b3f1-2d2f72b3d76b" />

### 6. Penilaian
Halaman pengisian nilai kinerja kegiatan (Ketua Tim), nilai perilaku Ber-AKHLAK (Ketua Tim), dan nilai kehadiran (Kasubag).
![Tampilan Penilaian Tim]
<img width="2379" height="1397" alt="image" src="https://github.com/user-attachments/assets/fa268f53-e64b-4f62-98e2-2cf164c19bb5" />
<img width="2382" height="1397" alt="image" src="https://github.com/user-attachments/assets/33a79c10-b400-422e-a6e3-c43a1e3ae6cb" />

### 7. Validasi Pimpinan (Kepala BPS)
Halaman finalisasi nilai dengan kalkulasi bobot otomatis serta form pemberian *feedback* tertulis dari Kepala BPS.
![Tampilan Validasi Pimpinan]
<img width="2380" height="1394" alt="image" src="https://github.com/user-attachments/assets/26cd1eaa-69e1-49d1-89ad-be60d30fc4f6" />

### 8. Laporan & Peringkat (Employee of the Month)
Halaman visualisasi skor akhir pegawai dan panggung penganugerahan untuk *Best Employees* di setiap periode.
![Tampilan Laporan dan Employee of the Month]
<img width="2375" height="1396" alt="image" src="https://github.com/user-attachments/assets/ee5d5b33-3723-4d65-a0c7-919e7986ad45" />
<img width="2378" height="1395" alt="image" src="https://github.com/user-attachments/assets/ce49bca2-14fb-4090-82c6-40a58dd9e9e6" />

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
