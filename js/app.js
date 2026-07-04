'use strict';

/* ==========================================================================
   StorageManager — Safe LocalStorage wrapper
   ========================================================================== */
const StorageManager = {
  isAvailable: false,

  init() {
    const TEST_KEY = '__storage_test__';
    try {
      localStorage.setItem(TEST_KEY, '1');
      localStorage.getItem(TEST_KEY);
      localStorage.removeItem(TEST_KEY);
      this.isAvailable = true;
    } catch (e) {
      this.isAvailable = false;
      const warning = document.getElementById('storage-warning');
      if (warning) warning.classList.remove('hidden');
    }
  },

  get(key, fallback = null) {
    if (!this.isAvailable) return fallback;
    try {
      const raw = localStorage.getItem(key);
      if (raw === null) return fallback;
      return JSON.parse(raw);
    } catch (e) {
      return fallback;
    }
  },

  set(key, value) {
    if (!this.isAvailable) return;
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
      // silent fail (e.g. storage quota exceeded)
    }
  },

  remove(key) {
    if (!this.isAvailable) return;
    try {
      localStorage.removeItem(key);
    } catch (e) {
      // silent fail
    }
  },
};

/* ==========================================================================
   ThemeManager — Light / Dark mode
   ========================================================================== */
const ThemeManager = {
  STORAGE_KEY: 'theme',
  currentTheme: 'light',

  apply(theme) {
    this.currentTheme = theme;
    if (theme === 'dark') {
      document.body.classList.add('dark');
    } else {
      document.body.classList.remove('dark');
    }
  },

  updateButton() {
    const btn = document.getElementById('theme-toggle-btn');
    if (!btn) return;
    if (this.currentTheme === 'dark') {
      btn.textContent = '☀️';
      btn.setAttribute('aria-label', 'Beralih ke tema terang');
    } else {
      btn.textContent = '🌙';
      btn.setAttribute('aria-label', 'Beralih ke tema gelap');
    }
  },

  toggle() {
    const next = this.currentTheme === 'dark' ? 'light' : 'dark';
    this.apply(next);
    this.updateButton();
    StorageManager.set(this.STORAGE_KEY, next);
  },

  init() {
    const saved = StorageManager.get(this.STORAGE_KEY, 'light');
    const theme = saved === 'dark' ? 'dark' : 'light';
    this.apply(theme);
    this.updateButton();

    const btn = document.getElementById('theme-toggle-btn');
    if (btn) btn.addEventListener('click', () => this.toggle());
  },
};

/* ==========================================================================
   GreetingModule — Real-time clock, date, dynamic greeting, custom name
   ========================================================================== */
const GreetingModule = {
  STORAGE_KEY: 'userName',
  userName: '',
  intervalId: null,

  getGreeting(hour) {
    if (hour >= 5 && hour < 12)  return 'Selamat Pagi';
    if (hour >= 12 && hour < 15) return 'Selamat Siang';
    if (hour >= 15 && hour < 19) return 'Selamat Sore';
    return 'Selamat Malam';
  },

  formatDate(date) {
    return date.toLocaleDateString('id-ID', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  },

  formatTime(date) {
    const h = String(date.getHours()).padStart(2, '0');
    const m = String(date.getMinutes()).padStart(2, '0');
    const s = String(date.getSeconds()).padStart(2, '0');
    return `${h}:${m}:${s}`;
  },

  render() {
    const now = new Date();
    const clockEl = document.getElementById('clock');
    const dateEl = document.getElementById('date');
    const greetingEl = document.getElementById('greeting-text');

    if (clockEl) clockEl.textContent = this.formatTime(now);
    if (dateEl) dateEl.textContent = this.formatDate(now);
    if (greetingEl) {
      const greeting = this.getGreeting(now.getHours());
      greetingEl.textContent = this.userName
        ? `${greeting}, ${this.userName}! 👋`
        : `${greeting}! 👋`;
    }
  },

  tick() {
    this.render();
  },

  saveName(name) {
    const trimmed = name.trim();
    const errorEl = document.getElementById('name-error');

    if (trimmed.length > 50) {
      if (errorEl) errorEl.textContent = 'Nama tidak boleh lebih dari 50 karakter.';
      return;
    }

    this.userName = trimmed;
    StorageManager.set(this.STORAGE_KEY, trimmed);
    this.render();
    if (errorEl) errorEl.textContent = '';
  },

  init() {
    this.userName = StorageManager.get(this.STORAGE_KEY, '');

    const nameInput = document.getElementById('name-input');
    if (nameInput && this.userName) nameInput.value = this.userName;

    // Render immediately — don't wait 1 second
    this.tick();

    // Clear old interval guard (safety)
    if (this.intervalId) clearInterval(this.intervalId);
    this.intervalId = setInterval(() => this.tick(), 1000);

    // Event listeners
    const saveBtn = document.getElementById('save-name-btn');
    if (saveBtn) {
      saveBtn.addEventListener('click', () => {
        const input = document.getElementById('name-input');
        if (input) this.saveName(input.value);
      });
    }

    if (nameInput) {
      nameInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          this.saveName(nameInput.value);
        }
      });
      nameInput.addEventListener('input', () => {
        const errorEl = document.getElementById('name-error');
        if (errorEl) errorEl.textContent = '';
      });
    }
  },
};

/* ==========================================================================
   TimerModule — Pomodoro 25-minute countdown
   ========================================================================== */
const TimerModule = {
  TOTAL_SECONDS: 25 * 60,
  remaining: 25 * 60,
  isRunning: false,
  intervalId: null,

  format(secs) {
    const m = String(Math.floor(secs / 60)).padStart(2, '0');
    const s = String(secs % 60).padStart(2, '0');
    return `${m}:${s}`;
  },

  render() {
    const display = document.getElementById('timer-display');
    const startBtn = document.getElementById('timer-start');
    const stopBtn = document.getElementById('timer-stop');

    if (display) display.textContent = this.format(this.remaining);

    if (startBtn) {
      startBtn.disabled = this.isRunning || this.remaining === 0;
    }
    if (stopBtn) {
      stopBtn.disabled = !this.isRunning;
    }
  },

  onFinish() {
    const display = document.getElementById('timer-display');
    const notification = document.getElementById('timer-notification');
    const startBtn = document.getElementById('timer-start');

    if (display) display.classList.add('finished');
    if (startBtn) startBtn.disabled = true;

    if (notification) {
      notification.textContent = '🎉 Sesi Fokus Selesai! Saatnya istirahat sejenak.';
      notification.classList.remove('hidden');
      // Keep notification visible (user dismisses via Reset)
    }
  },

  tick() {
    this.remaining--;
    if (this.remaining <= 0) {
      this.remaining = 0;
      clearInterval(this.intervalId);
      this.intervalId = null;
      this.isRunning = false;
      this.render();
      this.onFinish();
      return;
    }
    this.render();
  },

  start() {
    if (this.isRunning) return;
    if (this.remaining === 0) {
      // Show hint to reset first
      const notification = document.getElementById('timer-notification');
      if (notification) {
        notification.textContent = '⚠️ Timer sudah selesai. Tekan Reset untuk memulai lagi.';
        notification.classList.remove('hidden');
      }
      return;
    }
    this.isRunning = true;
    // Guard: clear any stale interval
    if (this.intervalId) clearInterval(this.intervalId);
    this.intervalId = setInterval(() => this.tick(), 1000);
    this.render();
  },

  stop() {
    if (!this.isRunning) return;
    clearInterval(this.intervalId);
    this.intervalId = null;
    this.isRunning = false;
    this.render();
  },

  reset() {
    this.stop();
    this.remaining = this.TOTAL_SECONDS;
    this.isRunning = false;

    const display = document.getElementById('timer-display');
    const notification = document.getElementById('timer-notification');

    if (display) display.classList.remove('finished');
    if (notification) notification.classList.add('hidden');

    this.render();
  },

  init() {
    this.render();

    const startBtn = document.getElementById('timer-start');
    const stopBtn = document.getElementById('timer-stop');
    const resetBtn = document.getElementById('timer-reset');

    if (startBtn) startBtn.addEventListener('click', () => this.start());
    if (stopBtn)  stopBtn.addEventListener('click', () => this.stop());
    if (resetBtn) resetBtn.addEventListener('click', () => this.reset());
  },
};

/* ==========================================================================
   TodoModule — CRUD with duplicate prevention and LocalStorage persistence
   ========================================================================== */
const TodoModule = {
  STORAGE_KEY: 'todos',
  todos: [],

  save() {
    StorageManager.set(this.STORAGE_KEY, this.todos);
  },

  isDuplicate(text, excludeId = null) {
    const normalized = text.trim().toLowerCase();
    return this.todos.some(
      (t) => t.text.trim().toLowerCase() === normalized && t.id !== excludeId
    );
  },

  showError(message) {
    const errorEl = document.getElementById('todo-error');
    if (errorEl) errorEl.textContent = message;
  },

  clearError() {
    const errorEl = document.getElementById('todo-error');
    if (errorEl) errorEl.textContent = '';
  },

  render() {
    const list = document.getElementById('todo-list');
    const emptyEl = document.getElementById('todo-empty');
    if (!list) return;

    list.innerHTML = '';

    if (this.todos.length === 0) {
      if (emptyEl) emptyEl.classList.remove('hidden');
      return;
    }
    if (emptyEl) emptyEl.classList.add('hidden');

    this.todos.forEach((todo) => {
      const li = document.createElement('li');
      li.className = 'todo-item';
      li.dataset.id = todo.id;

      // Checkbox
      const checkbox = document.createElement('input');
      checkbox.type = 'checkbox';
      checkbox.className = 'todo-checkbox';
      checkbox.checked = todo.completed;
      checkbox.setAttribute('aria-label', `Tandai selesai: ${todo.text}`);
      checkbox.addEventListener('change', () => this.toggle(todo.id));

      // Text span
      const span = document.createElement('span');
      span.className = 'todo-text' + (todo.completed ? ' completed' : '');
      span.textContent = todo.text;

      // Action buttons container
      const actions = document.createElement('div');
      actions.className = 'todo-actions';

      // Edit button
      const editBtn = document.createElement('button');
      editBtn.className = 'btn btn-secondary btn-sm';
      editBtn.textContent = '✏️';
      editBtn.setAttribute('aria-label', `Edit tugas: ${todo.text}`);
      editBtn.addEventListener('click', () => this.enterEditMode(li, todo));

      // Delete button
      const deleteBtn = document.createElement('button');
      deleteBtn.className = 'btn btn-danger btn-sm';
      deleteBtn.textContent = '🗑️';
      deleteBtn.setAttribute('aria-label', `Hapus tugas: ${todo.text}`);
      deleteBtn.addEventListener('click', () => this.remove(todo.id));

      actions.appendChild(editBtn);
      actions.appendChild(deleteBtn);

      li.appendChild(checkbox);
      li.appendChild(span);
      li.appendChild(actions);
      list.appendChild(li);
    });
  },

  enterEditMode(li, todo) {
    // Replace span with input, replace buttons with Save/Cancel
    li.innerHTML = '';

    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.className = 'todo-checkbox';
    checkbox.checked = todo.completed;
    checkbox.disabled = true;

    const editInput = document.createElement('input');
    editInput.type = 'text';
    editInput.className = 'todo-edit-input';
    editInput.value = todo.text;
    editInput.maxLength = 200;
    editInput.setAttribute('aria-label', 'Edit teks tugas');

    const actions = document.createElement('div');
    actions.className = 'todo-actions';

    const saveBtn = document.createElement('button');
    saveBtn.className = 'btn btn-primary btn-sm';
    saveBtn.textContent = '💾';
    saveBtn.setAttribute('aria-label', 'Simpan perubahan');
    saveBtn.addEventListener('click', () => this.edit(todo.id, editInput.value));

    const cancelBtn = document.createElement('button');
    cancelBtn.className = 'btn btn-secondary btn-sm';
    cancelBtn.textContent = '✖';
    cancelBtn.setAttribute('aria-label', 'Batal edit');
    cancelBtn.addEventListener('click', () => this.render());

    actions.appendChild(saveBtn);
    actions.appendChild(cancelBtn);

    li.appendChild(checkbox);
    li.appendChild(editInput);
    li.appendChild(actions);

    editInput.focus();
    editInput.select();

    // Enter = save, Escape = cancel
    editInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') this.edit(todo.id, editInput.value);
      if (e.key === 'Escape') this.render();
    });
  },

  add(text) {
    const trimmed = text.trim();

    if (!trimmed) {
      this.showError('Tugas tidak boleh kosong.');
      return;
    }
    if (trimmed.length > 200) {
      this.showError('Tugas tidak boleh lebih dari 200 karakter.');
      return;
    }
    if (this.isDuplicate(trimmed)) {
      this.showError('Tugas sudah ada dalam daftar.');
      return;
    }

    this.clearError();
    this.todos.push({ id: Date.now(), text: trimmed, completed: false });
    this.save();
    this.render();

    const input = document.getElementById('todo-input');
    if (input) input.value = '';
  },

  toggle(id) {
    const todo = this.todos.find((t) => t.id === id);
    if (!todo) return;
    todo.completed = !todo.completed;
    this.save();
    this.render();
  },

  remove(id) {
    const todo = this.todos.find((t) => t.id === id);
    if (!todo) return;
    if (!window.confirm(`Hapus tugas "${todo.text}"?`)) return;
    this.todos = this.todos.filter((t) => t.id !== id);
    this.save();
    this.render();
  },

  edit(id, newText) {
    const trimmed = newText.trim();
    const errorEl = document.getElementById('todo-error');

    const showEditError = (msg) => {
      // Show error in main error span
      if (errorEl) errorEl.textContent = msg;
    };

    if (!trimmed) {
      showEditError('Tugas tidak boleh kosong.');
      return;
    }
    if (trimmed.length > 200) {
      showEditError('Tugas tidak boleh lebih dari 200 karakter.');
      return;
    }
    if (this.isDuplicate(trimmed, id)) {
      showEditError('Tugas sudah ada dalam daftar.');
      return;
    }

    const todo = this.todos.find((t) => t.id === id);
    if (!todo) return;

    todo.text = trimmed;
    if (errorEl) errorEl.textContent = '';
    this.save();
    this.render();
  },

  init() {
    this.todos = StorageManager.get(this.STORAGE_KEY, []);
    // Validate loaded data is array
    if (!Array.isArray(this.todos)) this.todos = [];
    this.render();

    const addBtn = document.getElementById('todo-add-btn');
    const input = document.getElementById('todo-input');

    if (addBtn) {
      addBtn.addEventListener('click', () => {
        if (input) this.add(input.value);
      });
    }

    if (input) {
      input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') this.add(input.value);
      });
      input.addEventListener('input', () => this.clearError());
    }
  },
};

/* ==========================================================================
   QuickLinksModule — Favorite links panel
   ========================================================================== */
const QuickLinksModule = {
  STORAGE_KEY: 'quickLinks',
  links: [],

  isValidUrl(url) {
    return url.startsWith('http://') || url.startsWith('https://');
  },

  save() {
    StorageManager.set(this.STORAGE_KEY, this.links);
  },

  showError(message) {
    const errorEl = document.getElementById('link-error');
    if (errorEl) errorEl.textContent = message;
  },

  clearError() {
    const errorEl = document.getElementById('link-error');
    if (errorEl) errorEl.textContent = '';
  },

  render() {
    const container = document.getElementById('links-container');
    const emptyEl = document.getElementById('links-empty');
    if (!container) return;

    container.innerHTML = '';

    if (this.links.length === 0) {
      if (emptyEl) emptyEl.classList.remove('hidden');
      return;
    }
    if (emptyEl) emptyEl.classList.add('hidden');

    this.links.forEach((link) => {
      const chip = document.createElement('div');
      chip.className = 'link-chip';

      const anchor = document.createElement('a');
      anchor.href = link.url;
      anchor.textContent = link.name;
      anchor.className = 'link-anchor';
      anchor.target = '_blank';
      anchor.rel = 'noopener noreferrer';
      anchor.title = link.url;
      anchor.setAttribute('aria-label', `Buka ${link.name} di tab baru`);

      const removeBtn = document.createElement('button');
      removeBtn.textContent = '✕';
      removeBtn.className = 'btn-icon btn-sm';
      removeBtn.style.cssText = 'background:none;border:none;padding:0 0 0 2px;font-size:0.75rem;min-width:auto;min-height:auto;color:var(--text-secondary);';
      removeBtn.setAttribute('aria-label', `Hapus link ${link.name}`);
      removeBtn.addEventListener('click', (e) => {
        e.preventDefault();
        this.remove(link.id);
      });

      chip.appendChild(anchor);
      chip.appendChild(removeBtn);
      container.appendChild(chip);
    });
  },

  add(name, url) {
    const trimmedName = name.trim();
    const trimmedUrl = url.trim();

    if (!trimmedName) {
      this.showError('Nama tautan tidak boleh kosong.');
      return;
    }
    if (!trimmedUrl || !this.isValidUrl(trimmedUrl)) {
      this.showError('URL harus diawali dengan http:// atau https://');
      return;
    }

    this.clearError();
    this.links.push({ id: Date.now(), name: trimmedName, url: trimmedUrl });
    this.save();
    this.render();

    const nameInput = document.getElementById('link-name-input');
    const urlInput = document.getElementById('link-url-input');
    if (nameInput) nameInput.value = '';
    if (urlInput) urlInput.value = '';
  },

  remove(id) {
    this.links = this.links.filter((l) => l.id !== id);
    this.save();
    this.render();
  },

  init() {
    this.links = StorageManager.get(this.STORAGE_KEY, []);
    if (!Array.isArray(this.links)) this.links = [];
    this.render();

    const addBtn = document.getElementById('link-add-btn');
    const nameInput = document.getElementById('link-name-input');
    const urlInput = document.getElementById('link-url-input');

    if (addBtn) {
      addBtn.addEventListener('click', () => {
        const name = nameInput ? nameInput.value : '';
        const url = urlInput ? urlInput.value : '';
        this.add(name, url);
      });
    }

    if (nameInput) {
      nameInput.addEventListener('input', () => this.clearError());
      nameInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && urlInput) urlInput.focus();
      });
    }

    if (urlInput) {
      urlInput.addEventListener('input', () => this.clearError());
      urlInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          const name = nameInput ? nameInput.value : '';
          this.add(name, urlInput.value);
        }
      });
    }
  },
};

/* ==========================================================================
   App Initialization — Order matters: Storage → Theme → all modules
   ========================================================================== */
document.addEventListener('DOMContentLoaded', () => {
  // 1. Check localStorage availability first
  StorageManager.init();

  // 2. Apply theme BEFORE anything is rendered to prevent flash of wrong theme
  ThemeManager.init();

  // 3. Start the clock and greeting
  GreetingModule.init();

  // 4. Timer
  TimerModule.init();

  // 5. Todo list
  TodoModule.init();

  // 6. Quick links
  QuickLinksModule.init();
});
