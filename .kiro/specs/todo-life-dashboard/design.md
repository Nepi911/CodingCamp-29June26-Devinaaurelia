# Design Document

## Overview

**To-Do List Life Dashboard** adalah SPA (*single-page application*) yang dibangun di atas tiga file: `index.html`, `css/style.css`, dan `js/app.js`. Tidak ada bundler, framework, atau dependensi eksternal. Semua state disimpan di LocalStorage dan di-render ulang ke DOM secara deklaratif setiap kali state berubah.

Arsitektur mengikuti pola **Module Pattern** — setiap fitur dikelola oleh satu modul JavaScript dengan state dan fungsi privatnya sendiri, diekspos melalui objek publik. Modul-modul ini diinisialisasi secara berurutan saat `DOMContentLoaded`.

---

## Architecture

### Struktur File

```
index.html          ← Markup, satu halaman, semua section ada di sini
css/style.css       ← Semua style: layout, komponen, dark mode, responsive
js/app.js           ← Semua logika: modul-modul dan inisialisasi
```

### Modul-Modul di `app.js`

```
app.js
├── StorageManager   ← Wrapper LocalStorage (get/set/remove + error handling)
├── ThemeManager     ← Light/dark toggle, baca/tulis preferensi tema
├── GreetingModule   ← Jam real-time, tanggal, sapaan dinamis, nama pengguna
├── TimerModule      ← Countdown 25 menit (Start/Stop/Reset)
├── TodoModule       ← CRUD tugas, duplikasi check, persistensi
├── QuickLinksModule ← CRUD tautan favorit, validasi URL, persistensi
└── init()           ← Entry point, memanggil semua modul.init() secara berurutan
```

### Alur Data

```
User Action → DOM Event → Module Handler → update State (plain object/array)
                                        → StorageManager.set(key, state)
                                        → render(state) → update DOM
```

State tidak pernah dibaca langsung dari DOM — selalu dari variabel state in-memory yang di-sync dengan LocalStorage.

---

## Components and Interfaces

### 1. StorageManager

```javascript
const StorageManager = {
  isAvailable: false,
  init(),       // test write/read/delete, set isAvailable, tampilkan warning jika gagal
  get(key, fallback),   // JSON.parse; returns fallback jika gagal/tidak ada
  set(key, value),      // JSON.stringify; silent fail jika tidak tersedia
  remove(key),          // hapus key; silent fail
};
```

### 2. ThemeManager

```javascript
const ThemeManager = {
  STORAGE_KEY: 'theme',
  currentTheme: 'light',
  init(),           // baca dari storage, apply sebelum render lain
  toggle(),         // balik tema, simpan ke storage, update tombol
  apply(theme),     // tambah/hapus class 'dark' pada document.body
  updateButton(),   // update teks/ikon tombol toggle
};
```

### 3. GreetingModule

```javascript
const GreetingModule = {
  STORAGE_KEY: 'userName',
  userName: '',
  intervalId: null,
  init(),
  tick(),
  getGreeting(hour),
  formatDate(date),
  saveName(name),
  render(),
};
```

### 4. TimerModule

```javascript
const TimerModule = {
  TOTAL_SECONDS: 1500,
  remaining: 1500,
  isRunning: false,
  intervalId: null,
  init(), start(), stop(), reset(), tick(), onFinish(), render(), format(secs),
};
```

### 5. TodoModule

```javascript
const TodoModule = {
  STORAGE_KEY: 'todos',
  todos: [],  // [{ id, text, completed }]
  init(), add(text), edit(id, newText), remove(id), toggle(id), save(), render(), isDuplicate(text, excludeId),
};
```

### 6. QuickLinksModule

```javascript
const QuickLinksModule = {
  STORAGE_KEY: 'quickLinks',
  links: [],  // [{ id, name, url }]
  init(), add(name, url), remove(id), save(), render(), isValidUrl(url),
};
```

---

## Data Models

### LocalStorage Keys

| Key | Type | Deskripsi |
|---|---|---|
| `"theme"` | `string` | `"light"` atau `"dark"` |
| `"userName"` | `string` | Nama pengguna (maks 50 karakter) |
| `"todos"` | `JSON array` | Array of Todo objects |
| `"quickLinks"` | `JSON array` | Array of Link objects |

### Todo Object

```json
{ "id": 1751760000000, "text": "Belajar JavaScript", "completed": false }
```

### Link Object

```json
{ "id": 1751760001000, "name": "MDN Web Docs", "url": "https://developer.mozilla.org" }
```

---

## HTML Structure

```html
<body class="">
  <div id="storage-warning" class="hidden">...</div>
  <header>
    <span id="theme-toggle-btn">🌙</span>
  </header>
  <main>
    <section id="greeting-section">
      <div id="clock"></div>
      <div id="date"></div>
      <div id="greeting-text"></div>
      <input id="name-input" maxlength="50" />
      <button id="save-name-btn">Simpan</button>
      <span id="name-error" class="error"></span>
    </section>
    <section id="timer-section">
      <div id="timer-display">25:00</div>
      <div id="timer-notification" class="hidden"></div>
      <button id="timer-start">Start</button>
      <button id="timer-stop">Stop</button>
      <button id="timer-reset">Reset</button>
    </section>
    <section id="todo-section">
      <input id="todo-input" maxlength="200" />
      <button id="todo-add-btn">Tambah</button>
      <span id="todo-error" class="error"></span>
      <ul id="todo-list"></ul>
    </section>
    <section id="quicklinks-section">
      <input id="link-name-input" maxlength="100" />
      <input id="link-url-input" />
      <button id="link-add-btn">Tambah</button>
      <span id="link-error" class="error"></span>
      <div id="links-container"></div>
    </section>
  </main>
</body>
```

---

## CSS Architecture

### Custom Properties

```css
:root {
  --bg-primary: #f0f4f8;
  --bg-secondary: #e2e8f0;
  --text-primary: #1a202c;
  --text-secondary: #718096;
  --accent: #6366f1;
  --accent-hover: #4f46e5;
  --border: #e2e8f0;
  --error: #e53e3e;
  --success: #38a169;
  --card-bg: #ffffff;
  --shadow: 0 2px 8px rgba(0,0,0,0.08);
}
body.dark {
  --bg-primary: #1a202c;
  --bg-secondary: #2d3748;
  --text-primary: #f7fafc;
  --text-secondary: #a0aec0;
  --accent: #818cf8;
  --accent-hover: #6366f1;
  --border: #4a5568;
  --error: #fc8181;
  --card-bg: #2d3748;
  --shadow: 0 2px 8px rgba(0,0,0,0.4);
}
```

### Layout

- Desktop ≥768px: CSS Grid dua kolom
- Mobile <768px: satu kolom, media query `@media (max-width: 767px)`
- Tombol minimal 44×44px di mobile

---

## Initialization Order

```javascript
document.addEventListener('DOMContentLoaded', () => {
  StorageManager.init();    // 1. cek localStorage
  ThemeManager.init();      // 2. terapkan tema SEBELUM render lain
  GreetingModule.init();    // 3. clock + nama
  TimerModule.init();       // 4. timer 25:00
  TodoModule.init();        // 5. daftar tugas
  QuickLinksModule.init();  // 6. panel link
});
```

---

## Error Handling

**Lapisan 1 — Storage:** `init()` dengan try/catch. Jika gagal, banner peringatan ditampilkan. Semua `set()`/`get()` wrapped try/catch, silent fail.

**Lapisan 2 — Validasi Input:** Pesan error inline di elemen `<span class="error">`. Dihapus saat pengguna mengetik kembali. Validasi: kosong, panjang maks, format URL, duplikasi.

**Lapisan 3 — Data Corrupt:** `JSON.parse` dalam try/catch, fallback ke `[]` atau `''` jika gagal.

---

## Correctness Properties

### Property 1: Theme Consistency
`document.body.classList.contains('dark')` selalu mencerminkan `ThemeManager.currentTheme === 'dark'`.

**Validates: Requirements 8.2, 8.4**

### Property 2: Clock Single Interval
`GreetingModule.intervalId` tidak pernah lebih dari satu — `clearInterval` dipanggil sebelum `setInterval` baru.

**Validates: Requirements 1.3, 2.5**

### Property 3: Timer Single Interval
`TimerModule.intervalId` tidak pernah lebih dari satu. `remaining` tidak pernah negatif.

**Validates: Requirements 4.3, 4.6, 4.9**

### Property 4: Todo Uniqueness
Tidak ada dua item di `todos` dengan `text.trim().toLowerCase()` yang sama.

**Validates: Requirements 6.1, 6.2, 6.3, 6.4**

### Property 5: Storage Sync
Setiap mutasi state selalu diikuti `save()` sebelum handler selesai.

**Validates: Requirements 5.9, 7.6, 9.2**

---

## Testing Strategy

### Fungsional
- [ ] Jam berdetak setiap detik, format HH:MM:SS
- [ ] Sapaan berubah saat jam melewati 05:00, 12:00, 15:00, 19:00
- [ ] Nama tersimpan dan muncul setelah reload
- [ ] Timer Start/Stop/Reset bekerja benar
- [ ] Timer mencapai 00:00 → notifikasi muncul → Start nonaktif
- [ ] CRUD tugas bekerja + tersimpan setelah reload
- [ ] Duplikasi tugas ditolak dengan pesan
- [ ] CRUD quick links bekerja + tersimpan setelah reload
- [ ] Link terbuka di tab baru
- [ ] URL invalid ditolak

### Tema
- [ ] Toggle dark mode mengubah seluruh halaman
- [ ] Tema tersimpan dan diterapkan tanpa flash saat reload

### Responsif
- [ ] 320px: satu kolom, tidak ada horizontal scroll
- [ ] 768px+: dua kolom

### Edge Cases
- [ ] localStorage diblokir → banner muncul, app berfungsi
- [ ] Tugas kosong/spasi saja → ditolak
- [ ] Reload berulang → data konsisten
