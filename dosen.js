'use strict';
(() => {
  const grid = document.querySelector('#lecturer-grid');
  const search = document.querySelector('#lecturer-search');
  const filter = document.querySelector('#expertise-filter');
  const count = document.querySelector('#lecturer-count');
  const reset = document.querySelector('#reset-directory');
  const empty = document.querySelector('#no-lecturers');
  const loadError = document.querySelector('#directory-error');
  const manual = document.querySelector('#manual-copy');
  const manualValue = document.querySelector('#manual-copy-value');
  const labels = { name: 'nama dan gelar', nip: 'NIP', nidn: 'NIDN', expertise: 'bidang keilmuan', email: 'email' };
  const copyIcon = '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="8" y="8" width="13" height="13" rx="2"/><path d="M16 8V3H3v13h5"/></svg>';
  const checkIcon = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m5 12 4 4L19 6"/></svg>';
  const feedbackTimers = new WeakMap();
  let lecturers = [];
  let toastTimer;
  function el(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = text;
    return node;
  }
  function copyButton(index, key, withValue = true) {
    const person = lecturers[index];
    const button = el('button', withValue ? `copy-field${['nip', 'nidn'].includes(key) ? ' numeric' : ''}` : 'copy-name');
    button.type = 'button';
    button.dataset.copy = key;
    button.dataset.person = String(index);
    button.setAttribute('aria-label', `Salin ${labels[key]}: ${person[key]}${key === 'name' ? '' : ` — ${person.name}`}`);
    button.title = `Salin ${labels[key]}`;
    if (withValue) button.append(el('span', '', person[key]));
    const artwork = el('span', 'copy-artwork');
    artwork.innerHTML = copyIcon;
    button.append(artwork);
    return button;
  }
  function card(person, index) {
    const article = el('article', 'lecturer-card');
    article.setAttribute('aria-labelledby', `lecturer-name-${index}`);
    const heading = el('div', 'lecturer-card-header');
    heading.append(el('span', 'lecturer-number', String(index + 1).padStart(2, '0')));
    const name = el('div', 'lecturer-name');
    name.append(el('span', '', 'NAMA DAN GELAR'));
    const title = el('h2', '', person.name);
    title.id = `lecturer-name-${index}`;
    name.append(title);
    heading.append(name, copyButton(index, 'name', false));
    const fields = el('dl', 'lecturer-fields');
    for (const key of ['nip', 'nidn', 'expertise', 'email']) {
      const field = el('div', `lecturer-field ${key}${['expertise', 'email'].includes(key) ? ' full-width' : ''}`);
      field.append(el('dt', '', key === 'expertise' ? 'Bidang keilmuan' : key === 'email' ? 'Email' : labels[key]));
      const value = el('dd');
      value.append(copyButton(index, key));
      field.append(value);
      fields.append(field);
    }
    article.append(heading, fields);
    return article;
  }
  function render() {
    const words = search.value.trim().toLocaleLowerCase('id').split(/\s+/).filter(Boolean);
    const selected = filter.value;
    const fragment = document.createDocumentFragment();
    let visible = 0;
    lecturers.forEach((person, index) => {
      const text = Object.values(person).join(' ').toLocaleLowerCase('id');
      if ((!selected || person.expertise === selected) && words.every(word => text.includes(word))) {
        fragment.append(card(person, index));
        visible++;
      }
    });
    grid.replaceChildren(fragment);
    empty.hidden = visible > 0;
    reset.hidden = !words.length && !selected;
    count.textContent = `Menampilkan ${visible} dari ${lecturers.length} dosen`;
  }
  async function load() {
    search.disabled = true; filter.disabled = true;
    grid.setAttribute('aria-busy', 'true');
    loadError.hidden = true; empty.hidden = true;
    count.textContent = 'Memuat data dosen…';
    const abort = new AbortController();
    const timeout = setTimeout(() => abort.abort(), 12000);
    try {
      const response = await fetch('assets/data/dosen.json', { cache: 'no-cache', signal: abort.signal });
      if (!response.ok) throw Error('Data tidak tersedia.');
      const data = await response.json();
      if (!Array.isArray(data) || !data.length || data.some(person => !person || Object.keys(labels).some(key => typeof person[key] !== 'string' || !person[key].trim()))) throw Error('Format data tidak valid.');
      lecturers = data;
      document.querySelector('.directory-total strong').textContent = String(data.length);
      filter.replaceChildren(new Option('Semua bidang keilmuan', ''));
      const expertise = [...new Set(data.map(person => person.expertise))].sort((a, b) => a.localeCompare(b, 'id'));
      expertise.forEach(value => filter.add(new Option(value, value)));
      search.disabled = false; filter.disabled = false;
      render();
    } catch {
      grid.replaceChildren(); loadError.hidden = false; reset.hidden = true;
      count.textContent = 'Data belum tersedia.';
    } finally { clearTimeout(timeout); grid.setAttribute('aria-busy', 'false'); }
  }
  function notify(message) {
    const toast = document.querySelector('#directory-toast');
    toast.textContent = message;
    toast.classList.add('visible');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove('visible'), 3500);
  }
  async function writeClipboard(text) {
    if (navigator.clipboard?.writeText && window.isSecureContext) {
      try { await navigator.clipboard.writeText(text); return true; } catch { /* Try the user-initiated browser copy fallback. */ }
    }
    const previousFocus = document.activeElement;
    const area = el('textarea');
    area.value = text;
    area.readOnly = true;
    area.style.cssText = 'position:fixed;left:-9999px;top:0;opacity:0';
    document.body.append(area);
    let copied = false;
    try { area.focus(); area.select(); copied = document.execCommand('copy'); } catch { /* Manual selection remains available. */ }
    finally { area.remove(); previousFocus?.focus({ preventScroll: true }); }
    return copied;
  }
  grid.addEventListener('click', async event => {
    const button = event.target.closest('button[data-copy]');
    if (!button || !grid.contains(button)) return;
    const person = lecturers[Number(button.dataset.person)];
    const key = button.dataset.copy;
    if (!person || !Object.hasOwn(labels, key)) return;
    const text = person[key];
    if (await writeClipboard(text)) {
      clearTimeout(feedbackTimers.get(button));
      button.dataset.copied = 'true';
      button.title = 'Tersalin';
      button.querySelector('.copy-artwork').innerHTML = checkIcon;
      feedbackTimers.set(button, setTimeout(() => {
        delete button.dataset.copied;
        button.title = `Salin ${labels[key]}`;
        button.querySelector('.copy-artwork').innerHTML = copyIcon;
      }, 2000));
      notify(`${labels[key][0].toUpperCase() + labels[key].slice(1)} berhasil disalin.`);
    } else {
      document.querySelector('#manual-copy-label').textContent = `${labels[key]} — ${person.name}`;
      manualValue.value = text;
      if (!manual.open) manual.showModal();
      manualValue.focus(); manualValue.select();
    }
  });
  function resetFilters() { search.value = ''; filter.value = ''; render(); search.focus(); }
  search.addEventListener('input', render);
  filter.addEventListener('change', render);
  reset.addEventListener('click', resetFilters);
  document.querySelector('#show-all').addEventListener('click', resetFilters);
  document.querySelector('#retry-load').addEventListener('click', load);
  document.querySelector('#close-manual').addEventListener('click', () => manual.close());
  document.querySelector('#select-manual').addEventListener('click', () => { manualValue.focus(); manualValue.select(); });
  document.addEventListener('keydown', event => {
    const editing = event.target.closest('input,textarea,select,[contenteditable="true"]');
    if (!manual.open && !search.disabled && !editing && (event.key === '/' || ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k'))) {
      event.preventDefault(); search.focus(); search.scrollIntoView({ block: 'center' });
    }
    if (event.key === 'Escape' && document.activeElement === search) { resetFilters(); }
  });
  load();
})();
