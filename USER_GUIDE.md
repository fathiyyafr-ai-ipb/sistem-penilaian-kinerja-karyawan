# Panduan Pengguna (User Guide)
## Sistem Monitoring dan Penilaian Kinerja Pegawai BPS Kabupaten Solok (SIMONEV)

Selamat datang di Panduan Pengguna **SIMONEV**. Dokumen ini dirancang secara khusus untuk memandu Anda berdasarkan peran (*role*) yang Anda miliki di dalam sistem.

---

## 1. Akun Default Pengujian
Jika Anda sedang melakukan pengujian di lingkungan lokal (`localhost`), gunakan kredensial masuk berikut (semua password bawaan adalah **`password`**):

| Role | Alamat Email | Password | Kegunaan Utama |
| :--- | :--- | :--- | :--- |
| **Admin** | `admin@bps.go.id` | `password` | Manajemen master data Pegawai & Tim Kerja. |
| **Ketua Tim** | `ketuatim@bps.go.id` | `password` | Membuat kegiatan & menilai kinerja anggota tim (Tahap 1). |
| **Kasubag** | `kasubag@bps.go.id` | `password` | Menginput presensi bulanan & menilai staf umum (Tahap 2). |
| **Kepala BPS** | `kepalabps@bps.go.id` | `password` | Melakukan validasi final & menetapkan Employee of the Month. |
| **Pegawai** | `pegawai@bps.go.id` | `password` | Melaporkan progres kerja & mengunggah bukti laporan. |

---

## 2. Panduan untuk Masing-masing Role

### Peran 1: Administrator (Admin)
Sebagai Administrator, Anda memegang kendali penuh atas data master sistem (Pegawai dan Tim Kerja).

#### A. Mengelola Data Pegawai (Staf)
1. Masuk menggunakan akun Admin.
2. Navigasi ke menu **Kepegawaian** di panel samping (*sidebar*).
3. **Tambah Pegawai Baru**:
   * Klik tombol **Tambah Pegawai**.
   * Isi formulir lengkap: Nama, NIP, Email, Pangkat/Golongan, Jabatan, Unit Kerja, Sandi, dan pilih peran (`pegawai`, `kasubag`, atau `kepala_bps`).
   * Klik **Simpan**.
4. **Edit & Hapus Pegawai**:
   * Gunakan tombol **Pencil** di baris pegawai untuk memperbarui profil atau hak akses.
   * Gunakan tombol **Trash** merah untuk menghapus akun pegawai dari sistem (aksi ini aman karena didukung integritas database *cascade*).

#### B. Mengelola Tim Kerja
1. Masuk ke halaman **Kegiatan**.
2. Scroll ke bagian bawah halaman di bawah tabel kegiatan (**Manajemen Tim**).
3. Klik **Tambah Tim Baru**:
   * Berikan nama tim kerja (misal: *Tim Statistik Sosial*).
   * **Pilih Ketua Tim**: Pilih dari daftar pegawai (role `pegawai`). Pegawai dengan role **Kasubag** dan **Kepala BPS** tidak akan muncul di sini. Pegawai yang terpilih otomatis bertindak sebagai Ketua Tim.
   * **Pilih Anggota**: Centang nama-nama pegawai pelaksana. Kepala BPS, Kasubag, dan pegawai yang telah terpilih sebagai Ketua Tim di atas secara otomatis disembunyikan dari daftar anggota ini untuk menghindari redundansi.
   * Klik **Buat Tim**.
4. Anda dapat memperbarui anggota atau menghapus tim kerja kapan saja melalui ikon **Pencil** dan **Trash** pada kartu tim.

---

### Peran 2: Ketua Tim (Leader)
> [!NOTE]
> Peran **Ketua Tim** bukan lagi status peran tetap saat mendaftarkan akun pegawai baru. Siapa saja dengan peran **Pegawai** yang ditunjuk oleh Admin menjadi **Pemimpin Tim** pada suatu Tim Kerja akan secara otomatis memperoleh kapabilitas Ketua Tim secara dinamis untuk tim tersebut.

Sebagai Ketua Tim, tanggung jawab Anda adalah mendistribusikan kegiatan kerja, membagi sub-tugas secara adil, memantau kemajuan staf secara langsung, dan mengevaluasi kinerja anggota tim Anda.

#### A. Membuat Kegiatan & Mengelola Sub-Tugas Kerja
> [!NOTE]
> **Batasan Kelola Tugas**: Sebagai Ketua Tim, Anda hanya diperbolehkan mengelola sub-tugas (tombol **KELOLA TUGAS**) pada kegiatan yang didelegasikan kepada tim pimpinan Anda atau kegiatan yang Anda buat sendiri. Admin, Kepala BPS, dan Kasubag memiliki wewenang penuh mengelola sub-tugas pada seluruh kegiatan secara global.
> 
1. Buka halaman **Kegiatan** di menu sidebar.
2. Klik tombol **Buat Kegiatan** di sudut kanan atas:
   * Masukkan **Judul Kegiatan** dan **Deskripsi** instruksi tugas.
   * Tetapkan tanggal **Deadline Penugasan**.
   * **Penugasan**: Pilih kelompok (**Tim**) yang Anda pimpin atau pilih secara langsung ke individu (**Staf**).
   * Klik **Simpan Kegiatan**.
3. **Membagi Sub-Tugas (Granular Division)**:
   * Pada tabel Kegiatan, klik baris kegiatan (milik tim Anda) untuk membuka jendela **Detail & Sub-Tugas**.
   * Klik tombol biru **KELOLA TUGAS** di kanan daftar sub-tugas.
   * Klik **TAMBAH SUB-TUGAS BARU** untuk membuat sub-tugas baru.
   * Masukkan **Judul Sub-Tugas**.
   * **Pilih Penanggung Jawab (PJ)**: Pilih nama pegawai pelaksana (anggota tim, termasuk Anda sendiri sebagai Ketua Tim).
   * **Tentukan Bobot (%)**: Masukkan persentase bobot kontribusi sub-tugas tersebut.
   * **Validasi Bobot**: Akumulasi bobot semua sub-tugas yang dimasukkan harus **tepat 100%**. Jika totalnya kurang atau lebih dari 100%, sistem akan menolak penyimpanan.
   * Klik **Simpan Sub-Tugas**.

#### B. Memantau (Monitoring) Progres Staf & Linimasa Log-Book
1. Pada tabel Kegiatan, klik baris kegiatan yang ingin Anda pantau.
2. Jendela *pop-up* **Detail & Sub-Tugas** akan terbuka menyajikan data secara real-time.
3. Anda dapat memantau:
   * Persentase progres masing-masing sub-tugas yang dikerjakan oleh staf pelaksana.
   * Total progress akumulatif kegiatan utama yang dihitung secara otomatis sebagai rata-rata terbobot dari sub-tugas.
4. **Melihat Riwayat Harian (Log-Book)**:
   * Klik ikon **Buku Terbuka (BookOpen)** di baris sub-tugas yang ingin dipantau.
   * Linimasa **Riwayat Catatan Harian (Log-Book)** akan terbuka ke bawah, menampilkan siapa yang memperbarui, kapan diperbarui, catatan progres tertulis, serta klik tombol tautan **LIHAT BUKTI DUKUNG** untuk memeriksa dan mengunduh berkas laporan bukti pengerjaan staf pelaksana.

#### C. Memberikan Penilaian Kinerja Anggota (Tahap 1)
1. Buka menu **Penilaian** di sidebar.
2. Di halaman **Penilaian Baru**, pilih nama anggota tim Anda yang ingin dinilai.
3. Tentukan periode penilaian (misal: `2026-05`).
4. Berikan nilai numerik (skala `0 - 100`) untuk 4 metrik:
   * **Kecepatan** (Speed): Kerapihan waktu pengerjaan staf.
   * **Kualitas** (Quality): Akurasi dan kebersihan hasil pekerjaan staf.
   * **Kontribusi** (Contribution): Keaktifan kolaborasi staf dalam tim.
   * **Tanggung Jawab** (Responsibility): Kedisiplinan dan tanggung jawab.
5. Tulis catatan evaluasi Anda di kolom **Catatan Penilai**.
6. Klik **Kirim Penilaian**. Penilaian Anda akan tersimpan dengan status `menunggu_validasi` menunggu tinjauan Kepala BPS.

---

### Peran 3: Kepala Sub Bagian Umum (Kasubag)
Sebagai Kasubag Umum, Anda bertugas mengelola presensi kumulatif staf bulanan serta mengevaluasi kinerja pegawai non-tim (staf umum lintas sektor).

#### A. Menginput Presensi Bulanan Pegawai
1. Navigasi ke halaman **Laporan** atau submenu **Presensi**.
2. Klik tombol **Input Presensi**:
   * Pilih nama **Pegawai** dan tentukan **Periode Bulan** (format `YYYY-MM`).
   * Isi jumlah hari kumulatif selama bulan tersebut:
     - *Hadir*: Jumlah hari masuk kerja.
     - *Terlambat*: Jumlah hari terlambat datang.
     - *Pulang Cepat*: Jumlah hari pulang sebelum jam kantor berakhir.
     - *Hadir Rapat*: Jumlah kehadiran rapat dinas.
     - *Hadir Upacara*: Jumlah kehadiran upacara bendera wajib.
   * Klik **Simpan**. Sistem akan mendeteksi jika data presensi pegawai tersebut sudah ada di periode yang sama dan langsung memperbaruinya (*upsert*).

#### B. Memberikan Penilaian Kinerja (Tahap 2)
1. Masuk ke menu **Penilaian**.
2. Alur penilaian sama dengan Ketua Tim, namun Anda ditugaskan menilai staf reguler BPS secara luas.
3. Masukkan 4 skor metrik kinerja, periode penilaian, dan catatan penilai.
4. Klik **Kirim Penilaian** untuk mengirim draf ke Kepala BPS.

---

### Peran 4: Kepala BPS (Pimpinan)
Sebagai Kepala BPS, Anda adalah pengambil keputusan tertinggi yang bertugas memvalidasi seluruh evaluasi kinerja dan merilis penghargaan *Employee of the Month*.

#### A. Memvalidasi Draf Penilaian Kinerja
1. Buka menu **Penilaian** di sidebar.
2. Anda akan disajikan daftar draf penilaian kerja pegawai dari seluruh Ketua Tim dan Kasubag yang berstatus `menunggu_validasi`.
3. **Validasi Satu-per-satu**:
   * Klik tombol **Pencil** di samping penilaian untuk memeriksa rincian skor.
   * Anda dapat menulis instruksi/masukan pimpinan pada kolom **Catatan Kepala BPS (Revisi/Apresiasi)**.
   * Klik **Validasi** untuk mengesahkan draf tersebut menjadi status `tervalidasi`.
4. **Validasi Sekaligus (Bulk Validation)**:
   * Centang kotak pilih pada beberapa draf penilaian di tabel.
   * Klik tombol **Validasi Massal (Bulk Validate)** di atas tabel untuk mengesahkan semuanya secara instan.

#### B. Menetapkan Employee of the Month (EOM)
1. Navigasi ke menu **Employee of the Month** di sidebar.
2. Pilih periode bulan yang ingin Anda tetapkan (misal: `2026-05`).
3. Klik tombol **Hitung Ranking Live**:
   * Sistem akan memproses dan menampilkan urutan peringkat pegawai secara *real-time* berdasarkan nilai rata-rata dari seluruh penilaian yang berstatus **`tervalidasi`** di periode tersebut.
   * Jika ada skor kembar (*tie*), sistem otomatis menyaring menggunakan urutan skor Tanggung Jawab dan Kontribusi tertinggi.
4. Jika urutan dirasa sudah akurat dan objektif, klik tombol **Kunci & Tetapkan EOM**:
   * Sistem secara resmi akan mengunci dan menyimpan **Top 3** pegawai terbaik periode tersebut ke database.
   * Penghargaan Top 3 EOM ini kini dapat dilihat secara transparan oleh seluruh staf di beranda utama aplikasi.

---

### Peran 5: Pegawai (Staf Pelaksana)
Sebagai Pegawai, Anda fokus pada pengerjaan sub-tugas yang didelegasikan oleh atasan, melaporkan progresnya secara berkala melalui catatan harian (log-book), serta meninjau evaluasi kinerja pribadi Anda yang telah disahkan.

> [!NOTE]
> **Batasan Akses**: 
> 1. **Penyaringan Kegiatan**: Anda hanya dapat melihat daftar kegiatan di mana Anda terlibat langsung (sebagai penanggung jawab, pembuat, pemimpin tim, atau anggota tim pelaksana).
> 2. **Log-Book Mandiri**: Anda hanya diperbolehkan membuat dan mengedit log-book (kemajuan/bukti) khusus pada sub-tugas yang ditugaskan kepada Anda secara personal (ditandai tombol **LAPOR** hijau). Anda tidak dapat mencatat kemajuan untuk tugas pegawai lain.

#### A. Melaporkan Progres Sub-Tugas & Input Log-Book Harian
1. Buka halaman **Kegiatan** di sidebar Anda.
2. Anda akan melihat daftar kegiatan di mana Anda terlibat.
3. Klik baris kegiatan atau tombol **Mata (Eye)** pada kegiatan yang bersangkutan untuk membuka popup **Detail & Sub-Tugas**.
4. Cari sub-tugas yang didelegasikan kepada Anda (sub-tugas milik Anda akan menampilkan tombol hijau **LAPOR**).
5. Klik **LAPOR** untuk membuka panel pelaporan **Log-Book**:
   * **Progress Proyek Saat Ini**: Geser *slider* progress untuk menyesuaikan tingkat penyelesaian sub-tugas Anda secara presisi (skala `0 - 100%`).
   * **Catatan Log-Book Pekerjaan**: Tuliskan ringkasan kemajuan atau kendala konkret pengerjaan yang Anda lakukan hari ini.
   * **Bukti Dukung**: Pilih berkas hasil kerja pendukung Anda (bisa berupa Gambar hasil kerja, dokumen laporan PDF, dokumen Excel, dll).
   * Klik **Kirim Laporan Log-Book**. Progress sub-tugas dan progress total kegiatan utama akan langsung ter-update secara otomatis di tingkat atasan.

#### B. Mengubah / Mengedit Catatan Log-Book
Jika ada kesalahan penulisan catatan harian atau salah mengunggah file bukti dukung, Anda dapat mengubahnya kembali:
1. Pada popup pelaporan sub-tugas, lihat bagian bawah di daftar **Riwayat Catatan Kerja Saya**.
2. Cari entri log-book yang ingin Anda ubah, lalu klik tombol **Pencil (Edit)** di pojok kanan atas kartu log-book tersebut.
3. Form pengeditan warna kuning akan aktif:
   * Anda dapat memperbarui persentase progress, mengubah catatan penjelasan, atau memilih berkas bukti dukung baru untuk menggantikan file lama.
   * Klik **Simpan Perubahan** untuk mengesahkan pembaruan, atau **Batal** untuk membatalkannya.

#### C. Meninjau Hasil Penilaian Kinerja & Presensi
1. Buka menu **Penilaian** untuk melihat riwayat penilaian bulanan pribadi Anda.
2. Hasil penilaian hanya akan tampil di sini apabila statusnya telah disetujui dan berstatus **`tervalidasi`** oleh Kepala BPS (setelah difinalisasi/publish).
3. Anda dapat melihat grafik rincian 4 skor Anda, total nilai rata-rata, nama penilai, serta catatan khusus/masukan yang diberikan oleh Kepala BPS untuk pengembangan karir Anda.
4. Buka menu **Laporan** untuk melihat rekapitulasi data kehadiran bulanan Anda.

---

## 3. Dasbor Utama Terpadu (Unified Home Dashboard)

SIMONEV telah mengintegrasikan modul pemantauan (**Monitoring**) langsung ke dalam halaman **Beranda (Home)** untuk menghadirkan dasbor satu-pintu (*one-stop dashboard*). Halaman monitoring mandiri telah dihapus untuk mengoptimalkan ruang visual dan meniadakan area kosong (*blank space*).

### A. Komponen Dasbor untuk Semua Pengguna
1. **Statistik Kegiatan Tim / Individu**: Menampilkan grafik atau diagram garis progres kegiatan real-time. Jika Anda adalah pegawai biasa, Anda akan melihat progres tugas personal Anda. Jika Anda adalah Ketua Tim/Atasan, Anda akan melihat rekapitulasi progres tim kerja Anda.
2. **Radial Chart Kehadiran (Presensi)**: Grafik lingkaran modern yang menunjukkan tingkat persentase kehadiran bulanan Anda.
3. **Sorotan Best Employee (EOM)**: Penayangan khusus Top 3 *Employee of the Month* terpilih pada periode aktif yang telah disahkan oleh Kepala BPS.
4. **Linimasa Aktivitas & Log-Book Terbaru**: Panel terpadu yang memuat tugas-tugas aktif dan log progres kerja harian yang baru saja dikirim oleh staf (bagi Atasan) atau progres kerja Anda sendiri (bagi Pegawai).
5. **Tren Kinerja Personal**: Grafik tren perkembangan akumulasi nilai kinerja total Anda dari waktu ke waktu (Kuartal ke Kuartal).

---

## 4. Panduan Mencetak Lembar Evaluasi Kinerja (A4 Monochrome PDF)

Sebagai pimpinan (Ketua Tim, Kasubag, Kepala BPS, Admin) maupun pegawai pelaksana, Anda dapat mencetak/menyimpan dokumen resmi **Lembar Evaluasi Kinerja** dalam format hitam-putih formal (*monochrome*) ukuran A4 untuk keperluan berkas fisik/tanda tangan basah.

### A. Cara Mengunduh / Mencetak Laporan
1. Masuk ke menu **Laporan** di sidebar.
2. Pada tabel daftar pegawai, Anda akan melihat kolom **Aksi** di paling kanan setiap baris.
3. Cari nama pegawai dan periode kuartal yang diinginkan.
4. Klik ikon **Download / Printer** di kolom Aksi.
   > [!IMPORTANT]
   > **Syarat Cetak Laporan**: Ikon cetak laporan hanya dapat diklik dan aktif **apabila status penilaian periode kuartal tersebut telah secara resmi difinalisasi (dipublish)** oleh Kepala BPS. Jika belum difinalisasi, tombol akan dinonaktifkan (disabled) dengan tooltip informasi.
5. Jendela cetak bawaan browser (*Print Dialog*) akan otomatis terbuka.
6. Pada pengaturan cetak browser Anda:
   - Pilih opsi **Save as PDF** untuk menyimpan sebagai dokumen digital, atau pilih mesin printer fisik Anda.
   - Atur ukuran kertas ke **A4**.
   - Centang opsi **Background graphics** agar garis batas tabel dan kurva SVG bell-curve ter-render secara sempurna.
   - Klik **Print** atau **Save**.

### B. Isi & Desain Lembar Evaluasi Kinerja (Standar Monochrome)
Dokumen cetak ini didesain secara khusus untuk mengabaikan sidebar navigasi, header bar, serta tombol aksi, dan mengubah warna antarmuka menjadi hitam-putih formal (*monochrome*) bergaris tegas:
* **Identitas Resmi**: Menampilkan nama instansi, judul lembar evaluasi, periode, data pegawai yang dinilai, serta data atasan penilai.
* **Kurva Bell-Curve SVG**: Kurva distribusi normal dinamis yang secara visual menandai letak koordinat skor akhir pegawai di atas grafik kurva lonceng.
* **Tabel Evaluasi Kinerja**: Daftar kegiatan, uraian log-book bukti pengerjaan, persentase sub-tugas, dan nilai rata-rata kinerja.
* **Tabel Evaluasi Perilaku**: Penilaian 8 nilai utama ASN (BerAKHLAK + Disiplin) lengkap dengan catatan penilai.
* **Tabel Presensi**: Rekapitulasi kehadiran, keterlambatan, pulang cepat, rapat, upacara, dan skor presensi final.
* **Total Nilai Terbobot**: Skor akhir terbobot berdasarkan bobot persentase aktif (kinerja, perilaku, presensi) disertai umpan balik/catatan Kepala BPS.
* **Ruang Tanda Tangan**: Kolom penandatanganan formal di bagian paling bawah untuk pengesahan tertulis.

---

## 5. Keamanan & Visibilitas Menu Sidebar Dinamis

Untuk menjaga kebersihan antarmuka (*UI hygiene*) dan mencegah salah guna menu yang tidak relevan, SIMONEV menerapkan **Dynamic Menu Filtering** pada sidebar navigasi:
* **Menu "Nilai Saya" (My Score)**: Hanya ditampilkan kepada pegawai reguler dan Ketua Tim (karena mereka dinilai dan dievaluasi).
* **Penyembunyian Otomatis**: Bagi pengguna yang login sebagai **Admin**, **Kepala BPS**, dan **Kasubag**, menu "Nilai Saya" akan **disembunyikan secara otomatis** dari sidebar, karena peran-peran administratif ini tidak menjadi objek evaluasi kinerja bulanan/kuartalan di dalam sistem.
