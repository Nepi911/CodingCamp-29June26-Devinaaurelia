# Implementation Plan: To-Do List Life Dashboard

## Overview

Implementasi dalam 10 task berurutan mengikuti dependensi: HTML skeleton → CSS variables → StorageManager → modul fitur (paralel) → CSS layout lengkap → integrasi. Semua kode ditulis di tiga file yang sudah ada.

## Tasks

- [ ] 1. Buat struktur markup `index.html`: doctype HTML5, meta charset & viewport, title "Life Dashboard", link style.css dan app.js (defer), div#storage-warning.hidden, header dengan button#theme-toggle-btn, main dengan empat section (#greeting-section, #timer-section, #todo-section, #quicklinks-section), dan semua elemen input/button/span/ul/div sesuai design document.
  - **Requires:** (none)
  - **Requirements:** 1.1, 4.1, 5.1, 7.1, 8.1

- [ ] 2. Di css/style.css, definisikan CSS custom properties light mode di :root (--bg-primary, --bg-secondary, --text-primary, --text-secondary, --accent, --accent-hover, --border, --error, --card-bg, --shadow) dan override di body.dark; tambahkan CSS reset box-sizing dan style global body.
  - **Requires:** Task 1
  - **Requirements:** 8.2, 10.5

- [ ] 3. Implementasikan StorageManager di js/app.js: init() dengan try/catch test dummy (tampilkan #storage-warning jika gagal), get(key, fallback) dengan JSON.parse + fallback, set(key, value) dengan JSON.stringify + silent fail, remove(key) + silent fail.
  - **Requires:** Task 1
  - **Requirements:** 9.1, 9.3, 9.4, 9.5

- [ ] 4. Implementasikan ThemeManager di js/app.js: apply(theme) tambah/hapus class 'dark' pada body, updateButton() update ikon ☀️/🌙, toggle() balik tema+simpan, init() baca storage default 'light'+apply+updateButton; pasang event listener click pada #theme-toggle-btn.
  - **Requires:** Task 3
  - **Requirements:** 8.1, 8.2, 8.3, 8.4, 8.5, 8.6, 8.7

- [ ] 5. Implementasikan GreetingModule di js/app.js: getGreeting(hour) returns Pagi/Siang/Sore/Malam, formatDate(date) locale id-ID, render() update #clock/#date/#greeting-text, tick() new Date+render, saveName(name) validasi maks 50 kar+simpan+render, init() muat userName+tick()+setInterval 1000ms; pasang event listener pada #save-name-btn dan #name-input (clear error).
  - **Requires:** Task 3
  - **Requirements:** 1.1, 1.2, 1.3, 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7

- [ ] 6. Implementasikan TimerModule di js/app.js: format(secs) MM:SS zero-pad, render() update #timer-display+state tombol, onFinish() tampilkan #timer-notification minimal 3 detik+nonaktifkan Start, tick() remaining--+cek 0, start() guard isRunning||remaining===0, stop() clearInterval, reset() stop+1500+sembunyikan notifikasi+aktifkan Start, init() render 25:00; pasang event listener ketiga tombol.
  - **Requires:** Task 3
  - **Requirements:** 4.1, 4.2, 4.3, 4.4, 4.5, 4.6, 4.7, 4.8, 4.9

- [ ] 7. Implementasikan TodoModule di js/app.js: isDuplicate(text, excludeId) trim+toLowerCase, save(), render() buat ulang semua li dengan checkbox/span-teks/tombol-edit/tombol-hapus + mode edit inline (input pre-filled+Simpan+Batal), add(text) validasi kosong+panjang 200+duplikat, toggle(id), remove(id) window.confirm, edit(id, newText) validasi kosong+panjang+duplikat, init() muat dari storage; pasang event listener #todo-add-btn + Enter key + clear error.
  - **Requires:** Task 3
  - **Requirements:** 5.1, 5.2, 5.3, 5.4, 5.5, 5.6, 5.7, 5.8, 5.9, 5.10, 5.11, 6.1, 6.2, 6.3, 6.4

- [ ] 8. Implementasikan QuickLinksModule di js/app.js: isValidUrl(url) startsWith http:// atau https://, save(), render() buat ulang semua anchor (target=_blank rel=noopener) + tombol hapus, add(name, url) validasi nama kosong+URL invalid, remove(id), init() muat dari storage; pasang event listener #link-add-btn + clear error.
  - **Requires:** Task 3
  - **Requirements:** 7.1, 7.2, 7.3, 7.4, 7.5, 7.6, 7.7

- [ ] 9. Implementasikan layout lengkap di css/style.css: grid dua kolom main ≥768px, satu kolom <768px, style card setiap section (bg card+border-radius+padding+shadow), clock (font besar monospace), timer-display (font sangat besar), todo list item (flexbox, .completed = line-through+opacity), quick links (flexbox wrap+chip), tombol/input min 44×44px di mobile, style .error dan #storage-warning, .hidden, no horizontal overflow.
  - **Requires:** Task 2
  - **Requirements:** 10.1, 10.2, 10.3, 10.4, 10.6

- [ ] 10. Tambahkan DOMContentLoaded di akhir js/app.js: StorageManager.init() → ThemeManager.init() → GreetingModule.init() → TimerModule.init() → TodoModule.init() → QuickLinksModule.init(); verifikasi ThemeManager pertama untuk mencegah flash of wrong theme.
  - **Requires:** Task 4, Task 5, Task 6, Task 7, Task 8, Task 9
  - **Requirements:** 9.1, 9.2

## Task Dependency Graph

```json
{
  "waves": [
    { "wave": 1, "tasks": [1] },
    { "wave": 2, "tasks": [2, 3] },
    { "wave": 3, "tasks": [4, 5, 6, 7, 8, 9] },
    { "wave": 4, "tasks": [10] }
  ]
}
```

## Notes

- ThemeManager.init() harus pertama di antara modul UI — mencegah flash of wrong theme.
- Setiap modul hanya bergantung pada StorageManager, tidak ada coupling antar modul fitur.
- ID item menggunakan Date.now() — cukup untuk SPA single-user.
- window.confirm() untuk konfirmasi hapus tugas agar tetap sederhana.
- Semua pesan error ditampilkan inline (bukan alert).
