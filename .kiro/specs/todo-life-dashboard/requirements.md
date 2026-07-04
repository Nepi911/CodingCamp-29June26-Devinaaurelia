# Requirements Document

## Introduction

**To-Do List Life Dashboard** adalah aplikasi web satu halaman (*single-page application*) yang dibangun menggunakan HTML, CSS, dan Vanilla JavaScript tanpa framework eksternal. Aplikasi ini menyediakan ruang kerja pribadi yang terintegrasi, menggabungkan tampilan waktu real-time dengan sapaan dinamis, timer fokus bergaya Pomodoro, pengelolaan tugas (to-do list), dan panel tautan favorit. Seluruh data pengguna disimpan secara persisten menggunakan Browser LocalStorage API sehingga tidak memerlukan server backend. Aplikasi berjalan pada satu halaman yang responsif di perangkat mobile maupun desktop, serta mendukung tema terang dan gelap.

---

## Glossary

- **Dashboard**: Halaman utama tunggal (`index.html`) yang menampung semua komponen fitur.
- **Greeting_Section**: Komponen antarmuka yang menampilkan jam real-time, tanggal hari ini, nama pengguna, dan sapaan dinamis.
- **Focus_Timer**: Komponen antarmuka yang menyediakan hitungan mundur 25 menit bergaya Pomodoro.
- **Todo_Manager**: Komponen yang mengelola daftar tugas: tambah, edit, hapus, dan tandai selesai.
- **QuickLinks_Panel**: Komponen yang mengelola panel tautan favorit: tambah dan hapus tautan.
- **Theme_Manager**: Komponen yang mengelola preferensi tema terang/gelap.
- **LocalStorage**: Browser LocalStorage API yang digunakan sebagai media penyimpanan data persisten di sisi klien.
- **Tugas**: Satu item pekerjaan yang dibuat pengguna dalam Todo_Manager.
- **Tautan**: Satu item URL favorit yang ditambahkan pengguna ke QuickLinks_Panel.
- **Sesi_Fokus**: Satu siklus hitungan mundur 25 menit dalam Focus_Timer.
- **Tema_Aktif**: Preferensi tampilan pengguna, bernilai `"light"` atau `"dark"`.
- **Nama_Pengguna**: Nama yang diatur oleh pengguna untuk ditampilkan pada sapaan di Greeting_Section.
- **App**: Keseluruhan aplikasi To-Do List Life Dashboard.

---

## Requirements

### Kebutuhan 1: Tampilan Jam dan Tanggal Real-Time

**User Story:** Sebagai pengguna, saya ingin melihat jam dan tanggal saat ini secara real-time, agar saya selalu mengetahui waktu tanpa harus membuka aplikasi lain.

#### Kriteria Penerimaan

1. WHEN halaman Dashboard dimuat, THE Greeting_Section SHALL segera menampilkan jam saat itu dalam format HH:MM:SS (jam 24 jam, dua digit per segmen).
2. WHEN halaman Dashboard dimuat, THE Greeting_Section SHALL menampilkan tanggal hari ini dalam format nama hari, tanggal bulan tahun (contoh: "Senin, 29 Juni 2026") menggunakan locale Bahasa Indonesia.
3. WHEN detik berubah, THE Greeting_Section SHALL memperbarui tampilan jam secara otomatis setiap 1 detik tanpa memuat ulang halaman.

---

### Kebutuhan 2: Sapaan Dinamis Berdasarkan Waktu

**User Story:** Sebagai pengguna, saya ingin mendapatkan sapaan yang relevan dengan waktu saat ini, agar pengalaman menggunakan Dashboard terasa lebih personal.

#### Kriteria Penerimaan

1. WHEN jam saat ini berada di rentang 05:00–11:59, THE Greeting_Section SHALL menampilkan teks sapaan "Selamat Pagi".
2. WHEN jam saat ini berada di rentang 12:00–14:59, THE Greeting_Section SHALL menampilkan teks sapaan "Selamat Siang".
3. WHEN jam saat ini berada di rentang 15:00–18:59, THE Greeting_Section SHALL menampilkan teks sapaan "Selamat Sore".
4. WHEN jam saat ini berada di rentang 19:00–23:59 atau 00:00–04:59, THE Greeting_Section SHALL menampilkan teks sapaan "Selamat Malam".
5. WHEN detik berubah dan jam berpindah ke rentang kategori yang berbeda (misal dari 11:59 ke 12:00), THE Greeting_Section SHALL memperbarui teks sapaan secara otomatis tanpa memuat ulang halaman.
6. WHEN halaman Dashboard dimuat, THE Greeting_Section SHALL menampilkan teks sapaan yang sesuai dengan jam saat itu sebelum render selesai.

---

### Kebutuhan 3: Kustomisasi Nama Pengguna pada Sapaan

**User Story:** Sebagai pengguna, saya ingin mengatur nama saya sendiri yang ditampilkan pada sapaan, agar Dashboard terasa lebih personal.

#### Kriteria Penerimaan

1. WHEN halaman Dashboard dimuat, THE Greeting_Section SHALL menampilkan elemen input teks dan tombol simpan untuk mengatur Nama_Pengguna (maksimal 50 karakter).
2. WHEN pengguna memasukkan Nama_Pengguna yang tidak kosong dan tidak melebihi 50 karakter lalu menekan tombol simpan, THE Greeting_Section SHALL menampilkan nama tersebut sebagai bagian dari teks sapaan (contoh: "Selamat Pagi, Devina!").
3. WHEN Nama_Pengguna yang valid disimpan, THE App SHALL menyimpan Nama_Pengguna ke LocalStorage dengan kunci `"userName"`.
4. WHEN halaman Dashboard dimuat dan kunci `"userName"` tersedia di LocalStorage, THE Greeting_Section SHALL memuat dan menampilkan Nama_Pengguna tersebut secara otomatis sebelum konten halaman dirender sepenuhnya.
5. IF Nama_Pengguna kosong atau belum diatur, THEN THE Greeting_Section SHALL menampilkan sapaan generik tanpa nama dalam format `[Waktu_Sapaan]!` (contoh: "Selamat Pagi!").
6. IF Nama_Pengguna yang dimasukkan melebihi 50 karakter, THEN THE Greeting_Section SHALL menolak penyimpanan dan menampilkan pesan kesalahan kepada pengguna.
7. IF LocalStorage tidak dapat diakses saat menyimpan Nama_Pengguna, THEN THE Greeting_Section SHALL tetap menampilkan nama yang baru dimasukkan untuk sesi saat ini tanpa persistensi.

---

### Kebutuhan 4: Focus Timer 25 Menit (Pomodoro)

**User Story:** Sebagai pengguna, saya ingin menggunakan timer fokus 25 menit, agar saya dapat bekerja dengan metode Pomodoro untuk meningkatkan produktivitas.

#### Kriteria Penerimaan

1. WHEN halaman Dashboard dimuat, THE Focus_Timer SHALL menampilkan hitungan mundur awal sebesar 25:00 (dua puluh lima menit nol detik) dalam format MM:SS.
2. WHEN pengguna menekan tombol Start dan WHILE timer tidak sedang berjalan dan nilai saat ini lebih dari 00:00, THE Focus_Timer SHALL memulai hitungan mundur dari nilai saat itu.
3. WHILE timer sedang berjalan, THE Focus_Timer SHALL memperbarui tampilan hitungan mundur setiap 1 detik secara akurat.
4. WHEN pengguna menekan tombol Stop dan WHILE timer sedang berjalan, THE Focus_Timer SHALL menghentikan hitungan mundur dan mempertahankan nilai saat itu.
5. WHEN pengguna menekan tombol Reset, THE Focus_Timer SHALL menghentikan hitungan mundur jika sedang berjalan dan mengembalikan tampilan ke 25:00.
6. WHEN hitungan mundur mencapai 00:00, THE Focus_Timer SHALL menghentikan timer secara otomatis.
7. WHEN hitungan mundur mencapai 00:00, THE Focus_Timer SHALL menampilkan elemen notifikasi visual yang terlihat dan tetap tampil selama minimal 3 detik untuk memberitahu pengguna bahwa Sesi_Fokus telah selesai.
8. IF pengguna menekan tombol Start saat tampilan menunjukkan 00:00, THEN THE Focus_Timer SHALL tidak memulai timer dan menampilkan instruksi agar pengguna menekan Reset terlebih dahulu.
9. WHEN hitungan mundur mencapai 00:00, THE Focus_Timer SHALL menonaktifkan tombol Start hingga pengguna menekan Reset.

---

### Kebutuhan 5: Pengelolaan Tugas (To-Do List)

**User Story:** Sebagai pengguna, saya ingin menambah, mengedit, menghapus, dan menandai tugas sebagai selesai, agar saya dapat mengelola daftar pekerjaan saya dengan efektif.

#### Kriteria Penerimaan

1. WHEN pengguna memasukkan teks tugas sepanjang 1–200 karakter dan mengonfirmasi penambahan, THE Todo_Manager SHALL menambahkan Tugas baru ke daftar dengan status belum selesai.
2. IF teks tugas yang dimasukkan kosong, THEN THE Todo_Manager SHALL menolak penambahan dan menampilkan pesan kesalahan kepada pengguna.
3. WHEN pengguna menekan tombol edit pada sebuah Tugas, THE Todo_Manager SHALL menampilkan antarmuka edit yang sudah terisi teks Tugas saat itu sebagai nilai awal.
4. WHEN pengguna menyimpan hasil edit Tugas dengan teks yang tidak kosong dan tidak melebihi 200 karakter, THE Todo_Manager SHALL memperbarui teks Tugas dengan nilai baru.
5. IF teks Tugas yang disimpan saat edit kosong, THEN THE Todo_Manager SHALL menolak penyimpanan dan menampilkan pesan kesalahan kepada pengguna.
6. WHEN pengguna menekan tombol hapus pada sebuah Tugas, THE Todo_Manager SHALL meminta konfirmasi pengguna sebelum menghapus Tugas tersebut dari daftar secara permanen.
7. WHEN pengguna menandai sebuah Tugas yang belum selesai, THE Todo_Manager SHALL mengubah status Tugas tersebut menjadi selesai dan menampilkan teks tugas dengan garis coret (*strikethrough*).
8. WHEN pengguna menandai kembali Tugas yang sudah selesai, THE Todo_Manager SHALL mengubah status Tugas tersebut kembali menjadi belum selesai dan menghapus tampilan garis coret.
9. WHEN daftar Tugas berubah (tambah, edit, hapus, atau ubah status), THE App SHALL menyimpan seluruh daftar Tugas ke LocalStorage dengan kunci `"todos"`.
10. WHEN halaman Dashboard dimuat dan kunci `"todos"` tersedia di LocalStorage, THE Todo_Manager SHALL memuat dan menampilkan seluruh Tugas yang tersimpan beserta statusnya.
11. IF data pada kunci `"todos"` di LocalStorage rusak atau tidak dapat diparsing, THEN THE Todo_Manager SHALL mengabaikan data tersebut dan menampilkan daftar kosong.

---

### Kebutuhan 6: Pencegahan Duplikasi Tugas

**User Story:** Sebagai pengguna, saya ingin sistem mencegah penambahan tugas duplikat, agar daftar tugas saya tetap bersih dan tidak redundan.

#### Kriteria Penerimaan

1. WHEN pengguna mencoba menambahkan Tugas baru, THE Todo_Manager SHALL membandingkan teks input (setelah *trim* spasi di awal/akhir) dengan seluruh teks Tugas yang ada secara *case-insensitive*.
2. IF teks Tugas baru (setelah *trim*) sama persis secara *case-insensitive* dengan teks Tugas yang sudah ada, THEN THE Todo_Manager SHALL menolak penambahan, menampilkan pesan peringatan "Tugas sudah ada dalam daftar" kepada pengguna, dan mempertahankan teks input agar pengguna dapat memperbaikinya.
3. WHEN pengguna menyimpan hasil edit Tugas, THE Todo_Manager SHALL membandingkan teks yang diedit (setelah *trim*) secara *case-insensitive* dengan seluruh Tugas lain yang ada (tidak termasuk Tugas yang sedang diedit).
4. IF teks hasil edit sama persis secara *case-insensitive* dengan teks Tugas lain yang berbeda, THEN THE Todo_Manager SHALL menolak penyimpanan, menampilkan pesan peringatan "Tugas sudah ada dalam daftar" kepada pengguna, dan mempertahankan teks di antarmuka edit.

---

### Kebutuhan 7: Pengelolaan Tautan Favorit (Quick Links)

**User Story:** Sebagai pengguna, saya ingin menambah dan menghapus tautan favorit, agar saya dapat mengakses situs yang sering dikunjungi dengan cepat dari Dashboard.

#### Kriteria Penerimaan

1. WHEN pengguna memasukkan nama Tautan (1–100 karakter) dan URL yang valid kemudian mengonfirmasi penambahan, THE QuickLinks_Panel SHALL menambahkan Tautan baru ke panel.
2. IF URL yang dimasukkan tidak dimulai dengan `http://` atau `https://`, THEN THE QuickLinks_Panel SHALL menolak penambahan dan menampilkan pesan kesalahan "URL harus diawali dengan http:// atau https://" kepada pengguna.
3. IF nama Tautan yang dimasukkan kosong, THEN THE QuickLinks_Panel SHALL menolak penambahan dan menampilkan pesan kesalahan "Nama tautan tidak boleh kosong" kepada pengguna.
4. WHEN pengguna menekan tombol hapus pada sebuah Tautan, THE QuickLinks_Panel SHALL menghapus Tautan tersebut dari panel.
5. WHEN pengguna mengeklik sebuah Tautan, THE App SHALL membuka URL tersebut di tab browser baru (menggunakan atribut `target="_blank"` dan `rel="noopener noreferrer"`).
6. WHEN daftar Tautan berubah (tambah atau hapus), THE App SHALL menyimpan seluruh daftar Tautan ke LocalStorage dengan kunci `"quickLinks"`.
7. WHEN halaman Dashboard dimuat dan kunci `"quickLinks"` tersedia di LocalStorage, THE QuickLinks_Panel SHALL memuat dan menampilkan seluruh Tautan yang tersimpan; IF data rusak atau tidak valid, THEN THE QuickLinks_Panel SHALL mengabaikan data tersebut dan menampilkan panel kosong.

---

### Kebutuhan 8: Light/Dark Mode Toggle

**User Story:** Sebagai pengguna, saya ingin beralih antara tema terang dan gelap, agar tampilan Dashboard nyaman digunakan dalam berbagai kondisi pencahayaan.

#### Kriteria Penerimaan

1. THE Dashboard SHALL menyediakan tombol toggle untuk berpindah antara Tema_Aktif `"light"` dan `"dark"`.
2. WHEN pengguna menekan tombol toggle tema, THE Theme_Manager SHALL menerapkan kelas CSS yang sesuai pada elemen `<body>` untuk mengaktifkan tema yang dipilih.
3. WHEN pengguna menekan tombol toggle tema, THE App SHALL menyimpan nilai Tema_Aktif ke LocalStorage dengan kunci `"theme"`.
4. WHEN halaman Dashboard dimuat dan kunci `"theme"` tersedia di LocalStorage, THE Theme_Manager SHALL menerapkan Tema_Aktif yang tersimpan secara otomatis.
5. IF kunci `"theme"` tidak tersedia di LocalStorage, THEN THE Theme_Manager SHALL menerapkan tema terang (`"light"`) sebagai default.
6. WHEN Tema_Aktif adalah `"dark"`, THE Dashboard SHALL menampilkan ikon atau label yang menunjukkan opsi beralih ke tema terang.
7. WHEN Tema_Aktif adalah `"light"`, THE Dashboard SHALL menampilkan ikon atau label yang menunjukkan opsi beralih ke tema gelap.

---

### Kebutuhan 9: Persistensi Data dan Integritas LocalStorage

**User Story:** Sebagai pengguna, saya ingin semua pengaturan dan data saya tersimpan secara otomatis, agar saya tidak kehilangan pekerjaan saat menutup atau memuat ulang browser.

#### Kriteria Penerimaan

1. THE App SHALL menggunakan LocalStorage sebagai satu-satunya mekanisme penyimpanan data persisten.
2. WHEN halaman Dashboard dimuat, THE App SHALL memuat semua data yang tersimpan (tugas, tautan, nama pengguna, dan tema) dari LocalStorage sebelum merender antarmuka.
3. IF LocalStorage tidak dapat diakses atau operasi baca/tulis gagal, THEN THE App SHALL menampilkan pesan informasi kepada pengguna bahwa penyimpanan data tidak tersedia dan fitur akan berjalan tanpa persistensi.

---

### Kebutuhan 10: Tampilan Responsif

**User Story:** Sebagai pengguna, saya ingin Dashboard dapat digunakan dengan nyaman di perangkat mobile maupun desktop, agar saya dapat mengaksesnya dari mana saja.

#### Kriteria Penerimaan

1. THE Dashboard SHALL menampilkan tata letak yang dapat digunakan pada lebar layar mulai dari 320px hingga 1920px.
2. WHEN lebar layar kurang dari 768px, THE Dashboard SHALL menyesuaikan tata letak komponen ke tampilan satu kolom (*single-column layout*).
3. WHILE lebar layar 768px atau lebih, THE Dashboard SHALL menampilkan tata letak multi-kolom yang memanfaatkan ruang layar yang tersedia.
4. THE App SHALL menggunakan hanya HTML, CSS, dan Vanilla JavaScript tanpa library atau framework eksternal.
