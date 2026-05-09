# Sistem Monitoring dan Penilaian Kinerja Pegawai
## Badan Pusat Statistik Kabupaten Solok

---

## Struktur Folder

```
bps-kinerja/
├── backend/
│   ├── config/db.js
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── userController.js
│   │   ├── teamController.js
│   │   ├── activityController.js
│   │   ├── progressController.js
│   │   ├── attendanceController.js
│   │   ├── reviewController.js
│   │   └── eomController.js
│   ├── middleware/auth.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── users.js
│   │   ├── teams.js
│   │   ├── activities.js
│   │   ├── progress.js
│   │   ├── attendance.js
│   │   ├── reviews.js
│   │   └── employeeOfMonth.js
│   ├── uploads/          ← folder upload laporan
│   ├── schema.sql
│   ├── seed.sql
│   ├── .env.example
│   ├── package.json
│   └── server.js
└── frontend/
    ├── src/
    │   ├── components/Layout.jsx
    │   ├── context/AuthContext.jsx
    │   ├── pages/
    │   │   ├── Login.jsx
    │   │   ├── Home.jsx
    │   │   ├── Kepegawaian.jsx
    │   │   ├── Kegiatan.jsx
    │   │   ├── Monitoring.jsx
    │   │   ├── Penilaian.jsx
    │   │   └── Laporan.jsx
    │   ├── utils/api.js
    │   ├── App.jsx
    │   ├── main.jsx
    │   └── index.css
    ├── index.html
    ├── package.json
    ├── vite.config.js
    ├── tailwind.config.js
    └── postcss.config.js
```

---

## Cara Menjalankan Project

### Prasyarat
- Node.js v18+
- MySQL 8+
- npm atau yarn

### 1. Setup Database MySQL

```bash
mysql -u root -p < backend/schema.sql
mysql -u root -p bps_kinerja < backend/seed.sql
```

### 2. Setup Backend

```bash
cd backend
npm install

# Salin file env dan isi konfigurasi
cp .env.example .env
# Edit .env: isi DB_PASSWORD sesuai MySQL Anda

# Jalankan server
npm run dev
```

Backend berjalan di: http://localhost:5000

### 3. Setup Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend berjalan di: http://localhost:3000

---

## Akun Default

| Email | Password | Role |
|-------|----------|------|
| admin@bps.go.id | password | admin |
| pegawai@bps.go.id | password | pegawai |
| ketuatim@bps.go.id | password | ketua_tim |
| kasubag@bps.go.id | password | kasubag |
| kepalabps@bps.go.id | password | kepala_bps |

> **Catatan:** Password default adalah `password`. Untuk keamanan, ubah password setelah pertama kali login.

---

## API Endpoints

| Method | Endpoint | Role | Keterangan |
|--------|----------|------|------------|
| POST | /api/auth/login | - | Login |
| GET | /api/auth/profile | semua | Profil saya |
| GET | /api/users | admin,kasubag,kepala | Daftar pegawai |
| POST | /api/users | admin | Tambah pegawai |
| PUT | /api/users/:id | admin | Edit pegawai |
| DELETE | /api/users/:id | admin | Hapus pegawai |
| GET | /api/teams | semua | Daftar tim |
| POST | /api/teams | admin | Buat tim |
| POST | /api/teams/add-member | admin | Tambah anggota |
| GET | /api/activities | semua | Daftar kegiatan |
| POST | /api/activities | ketua_tim | Buat kegiatan |
| PUT | /api/activities/:id | semua | Update kegiatan |
| GET | /api/progress | semua | Data progress |
| POST | /api/progress | semua | Input progress |
| GET | /api/attendance | semua | Data presensi |
| POST | /api/attendance | kasubag | Input presensi |
| GET | /api/reviews | semua | Data penilaian |
| POST | /api/reviews/stage1 | ketua_tim | Nilai tahap 1 |
| POST | /api/reviews/stage2 | kasubag | Nilai tahap 2 |
| POST | /api/reviews/validate | kepala_bps | Validasi final |
| GET | /api/employee-of-month | semua | EoM data |
| POST | /api/employee-of-month/determine | kepala_bps | Tentukan EoM |

---

## Teknologi

- **Frontend**: React 18 + Vite + Tailwind CSS + Recharts
- **Backend**: Node.js + Express.js
- **Database**: Postgre
- **Auth**: JWT + bcrypt
- **Upload**: Multer
