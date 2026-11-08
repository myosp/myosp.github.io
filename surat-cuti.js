'use strict';
(() => {
  const form = document.querySelector('#leave-form');
  const fields = document.querySelector('#form-fields');
  const lecturer = document.querySelector('#nama-dosen');
  const personBox = document.querySelector('#person-combobox');
  const personMenu = document.querySelector('#person-menu');
  const personResults = document.querySelector('#person-results');
  const personMessage = document.querySelector('#person-menu-message');
  const clearPerson = document.querySelector('#clear-person');
  const start = document.querySelector('#tanggal-mulai');
  const end = document.querySelector('#tanggal-selesai');
  const reason = document.querySelector('#alasan');
  const created = document.querySelector('#tanggal-surat');
  const endField = document.querySelector('#end-date-field');
  const endError = document.querySelector('#akhir-error');
  const download = document.querySelector('#download-pdf');
  const loadError = document.querySelector('#load-error');
  const sheet = document.querySelector('#letter-paper');
  const paperShell = document.querySelector('#paper-shell');
  const supervisor = { name: 'Ir. Mutmainnah, S.T., M.T.', nip: '198805112018012001' };
  const fixedUnit = 'Politeknik ATI Makassar';
  const dateFormatter = new Intl.DateTimeFormat('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' });
  const dateOnlyFormatter = new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' });
  let lecturers = [];
  let selectedNip = '';
  let suggestions = [];
  let activeSuggestion = -1;
  let pdfAssets;
  let toastTimer;

  function todayInMakassar() {
    const parts = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Makassar', year: 'numeric', month: '2-digit', day: '2-digit' }).formatToParts(new Date());
    const values = Object.fromEntries(parts.map(part => [part.type, part.value]));
    return `${values.year}-${values.month}-${values.day}`;
  }
  function dateObject(value) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
    const [y, m, d] = value.split('-').map(Number);
    const date = new Date(Date.UTC(y, m - 1, d, 12));
    return date.getUTCFullYear() === y && date.getUTCMonth() === m - 1 && date.getUTCDate() === d ? date : null;
  }
  function displayDate(value, withDay = true) {
    const date = dateObject(value);
    if (!date) return '';
    const text = (withDay ? dateFormatter : dateOnlyFormatter).format(date);
    return text.charAt(0).toLocaleUpperCase('id') + text.slice(1);
  }
  function isRange() { return form.elements.period.value === 'range'; }
  function clean(value) { return value.trim().replace(/\s+/g, ' '); }
  function selectedPerson() { return lecturers.find(person => person.nip === selectedNip); }
  function leaveDates() {
    const first = displayDate(start.value);
    if (!first) return '';
    if (!isRange()) return first;
    const last = displayDate(end.value);
    return last ? `${first} s.d. ${last}` : `${first} s.d. …`;
  }
  function model() {
    const person = selectedPerson();
    return { name: person?.name || '', nip: person?.nip || '', position: person?.role || '', unit: fixedUnit, dates: leaveDates(), reason: clean(reason.value), created: displayDate(created.value, false), createdIso: created.value };
  }
  function setText(id, value, fallback) { document.querySelector(id).textContent = value || fallback; }
  function validateText() {
    reason.setCustomValidity(reason.value && !clean(reason.value) ? 'Isi alasan izin atau cuti.' : '');
  }
  function validateRange() {
    const bad = isRange() && Boolean(start.value && end.value && end.value < start.value);
    end.setCustomValidity(bad ? 'Tanggal selesai tidak boleh sebelum tanggal mulai.' : '');
    end.setAttribute('aria-invalid', String(bad));
    endError.hidden = !bad;
    endError.textContent = bad ? 'Tanggal selesai tidak boleh sebelum tanggal mulai.' : '';
    return !bad;
  }
  function syncPeriod() {
    const range = isRange();
    endField.hidden = !range;
    end.disabled = !range;
    end.required = range;
    end.min = start.value || '1900-01-01';
    document.querySelector('#tanggal-mulai-label').innerHTML = `${range ? 'Mulai tanggal' : 'Tanggal izin'} <span aria-hidden="true">*</span>`;
    validateRange();
  }
  function fitLetterContent() {
    const note = sheet.querySelector('.letter-note');
    sheet.classList.remove('compact');
    function overflow() {
      const paperRect = sheet.getBoundingClientRect();
      const noteRect = note.getBoundingClientRect();
      const margin = paperRect.width * 4 / 210;
      return noteRect.bottom > paperRect.bottom - margin;
    }
    if (overflow()) sheet.classList.add('compact');
    return !overflow();
  }
  function update() {
    syncPeriod(); validateText();
    const data = model();
    setText('#preview-name', data.name, 'Nama pemohon');
    setText('#preview-position', data.position, 'Jabatan');
    setText('#preview-unit', data.unit, 'Unit kerja');
    setText('#preview-period', data.dates, 'Tanggal izin');
    setText('#preview-reason', data.reason, 'Alasan izin atau cuti');
    setText('#preview-date', data.created, 'Tanggal dibuat');
    setText('#preview-signature', data.name, 'Nama pemohon');
    document.querySelector('#preview-nip').textContent = data.nip ? `NIP. ${data.nip}` : 'NIP. —';
    document.querySelector('#mulai-day').textContent = displayDate(start.value);
    document.querySelector('#akhir-day').textContent = isRange() ? displayDate(end.value) : '';
    document.querySelector('#surat-day').textContent = displayDate(created.value);
    document.querySelector('#reason-count').textContent = String(reason.value.length);
    if (data.reason && !fitLetterContent()) reason.setCustomValidity('Isi surat terlalu panjang untuk satu halaman A4. Ringkas alasan atau unit kerja.');
    requestAnimationFrame(fitPreview);
  }
  function fitPreview() {
    const width = paperShell.clientWidth;
    if (!width || !sheet.offsetWidth) return;
    const scale = Math.min(1, width / sheet.offsetWidth);
    sheet.style.transform = `scale(${scale})`;
    paperShell.style.height = `${Math.ceil(sheet.offsetHeight * scale)}px`;
  }
  async function loadLecturers() {
    fields.disabled = true;
    loadError.hidden = true;
    try {
      const paths = ['assets/data/dosen.json', 'assets/data/plp.json'];
      const lists = await Promise.all(paths.map(async path => {
        const response = await fetch(path, { cache: 'no-cache' });
        if (!response.ok) throw Error('Data tidak tersedia');
        const data = await response.json();
        if (!Array.isArray(data) || !data.length || data.some(person => !person || typeof person.name !== 'string' || !person.name.trim() || typeof person.nip !== 'string' || !/^\d{18}$/.test(person.nip))) throw Error('Data pemohon tidak valid');
        return data;
      }));
      const [dosen, plp] = lists;
      const supervisorRecord = dosen.find(person => person.nip === supervisor.nip);
      if (!supervisorRecord) throw Error('Data atasan langsung tidak ditemukan');
      const combined = [
        ...dosen.map(person => ({ ...person, role: 'Dosen' })),
        ...plp.map(person => ({ ...person, role: 'PLP' }))
      ];
      if (new Set(combined.map(person => person.nip)).size !== combined.length) throw Error('NIP pemohon tidak unik');
      supervisor.name = supervisorRecord.name;
      document.querySelector('#preview-supervisor').textContent = supervisor.name;
      lecturers = combined.sort((a, b) => a.name.localeCompare(b.name, 'id', { sensitivity: 'base', numeric: true }));
      selectedNip = '';
      lecturer.value = '';
      lecturer.setCustomValidity('');
      clearPerson.hidden = true;
      closePersonMenu();
      fields.disabled = false;
      update();
    } catch {
      loadError.hidden = false;
      fields.disabled = true;
    }
  }
  function toast(message) {
    const el = document.querySelector('#leave-toast'); el.textContent = message; el.classList.add('visible');
    clearTimeout(toastTimer); toastTimer = setTimeout(() => el.classList.remove('visible'), 5000);
  }
  function ready() {
    update();
    return form.reportValidity() && validateRange();
  }
  function toBase64(buffer) {
    const bytes = new Uint8Array(buffer); let binary = '';
    for (let i = 0; i < bytes.length; i += 0x8000) binary += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
    return btoa(binary);
  }
  async function getPdfAssets() {
    if (!pdfAssets) {
      pdfAssets = Promise.all(['assets/fonts/LiberationSans-Regular.ttf', 'assets/fonts/LiberationSans-Bold.ttf', 'assets/kop-poltek-atim.png'].map(async path => {
        const response = await fetch(path);
        if (!response.ok) throw Error('Berkas pendukung PDF belum tersedia.');
        return response.arrayBuffer();
      })).catch(error => { pdfAssets = undefined; throw error; });
    }
    return pdfAssets;
  }
  function createPdf(data, assets, compact = false) {
    if (!window.jspdf?.jsPDF) throw Error('Pembuat PDF belum tersedia. Muat ulang halaman dan coba lagi.');
    const doc = new window.jspdf.jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4', compress: true, putOnlyUsedFonts: true });
    doc.addFileToVFS('LetterSans-Regular.ttf', toBase64(assets[0]));
    doc.addFont('LetterSans-Regular.ttf', 'LetterSans', 'normal');
    doc.addFileToVFS('LetterSans-Bold.ttf', toBase64(assets[1]));
    doc.addFont('LetterSans-Bold.ttf', 'LetterSans', 'bold');
    doc.addImage(new Uint8Array(assets[2]), 'PNG', 7, 8, 196, 196 * 203 / 1584);
    doc.setTextColor(0, 0, 0);
    doc.setFont('LetterSans', 'bold'); doc.setFontSize(13);
    doc.text('PERMOHONAN IZIN TIDAK MASUK KERJA / CUTI', 105, 48, { align: 'center' });
    doc.setFont('LetterSans', 'normal'); doc.setFontSize(11);
    let y = compact ? 61 : 67;
    doc.text('Yang bertanda tangan di bawah ini, saya :', 29, y); y += compact ? 8 : 11;
    function row(label, value) {
      const lines = doc.splitTextToSize(value, 113);
      doc.text(label, 37, y); doc.text(':', 68, y); doc.text(lines, 71, y, { lineHeightFactor: 1.35 });
      y += Math.max(compact ? 9 : 12, lines.length * 5.3 + (compact ? 3 : 6));
    }
    row('Nama', data.name); row('Jabatan', data.position); row('Unit Kerja', data.unit);
    y += 1; doc.text('Mengajukan Permohonan Izin tidak masuk kerja pada :', 29, y); y += compact ? 8 : 11;
    row('Hari/Tanggal', data.dates); row('Dengan alasan', data.reason);
    y += 1;
    const closing = doc.splitTextToSize('Demikian permohonan izin saya ajukan. Atas perhatian dan pengertian Bapak/Ibu, saya ucapkan terimakasih.', 152);
    doc.text(closing, 29, y, { lineHeightFactor: 1.35 }); y += closing.length * 5.3 + (compact ? 2 : 4);
    doc.text(`Makassar, ${data.created}`, 181, y, { align: 'right' }); y += compact ? 8 : 11;
    const sigTop = y;
    doc.text(['Mengetahui,', 'Atasan Langsung'], 68, sigTop, { align: 'center', lineHeightFactor: 1.25 });
    doc.text('Pemohon,', 151, sigTop, { align: 'center' });
    y = sigTop + (compact ? 29 : 36);
    function signatureName(name, x) {
      let size = 11; doc.setFont('LetterSans', 'bold'); doc.setFontSize(size);
      while (doc.getTextWidth(name) > 75 && size > 7.5) { size -= .25; doc.setFontSize(size); }
      const width = doc.getTextWidth(name);
      doc.text(name, x, y, { align: 'center' });
      doc.setLineWidth(.2); doc.line(x - width / 2, y + 1, x + width / 2, y + 1);
    }
    signatureName(supervisor.name, 68); signatureName(data.name, 151);
    doc.setFont('LetterSans', 'normal'); doc.setFontSize(10.5);
    doc.text(`NIP. ${supervisor.nip}`, 68, y + 5, { align: 'center' });
    doc.text(`NIP. ${data.nip}`, 151, y + 5, { align: 'center' });
    y += compact ? 17 : 24; doc.setFontSize(10); doc.text('Catatan :', 29, y); y += 5;
    const note = doc.splitTextToSize('Permohonan izin ini diserahkan ke Kabag Kepegawaian sebelum izin tidak masuk kantor (kecuali sakit).', 152);
    doc.text(note, 29, y, { lineHeightFactor: 1.3 });
    if (y + note.length * 5 > 287) {
      if (!compact) return createPdf(data, assets, true);
      throw Error('Isi surat terlalu panjang untuk satu halaman A4. Ringkas alasan atau unit kerja.');
    }
    return doc;
  }
  function normalizeSearch(value) {
    return value.normalize('NFKD').replace(/[\u0300-\u036f]/g, '').toLocaleLowerCase('id').replace(/[^\p{L}\p{N}]+/gu, ' ').trim();
  }
  function closePersonMenu() {
    personMenu.hidden = true;
    lecturer.setAttribute('aria-expanded', 'false');
    lecturer.removeAttribute('aria-activedescendant');
    activeSuggestion = -1;
  }
  function paintActiveSuggestion() {
    for (let index = 0; index < personResults.children.length; index++) {
      personResults.children[index].setAttribute('aria-selected', String(index === activeSuggestion));
    }
    if (activeSuggestion >= 0 && personResults.children[activeSuggestion]) lecturer.setAttribute('aria-activedescendant', personResults.children[activeSuggestion].id);
    else lecturer.removeAttribute('aria-activedescendant');
  }
  function renderSuggestions() {
    if (fields.disabled) return;
    const terms = normalizeSearch(lecturer.value).split(/\s+/).filter(Boolean);
    const matching = lecturers.filter(person => {
      const searchable = normalizeSearch(`${person.name} ${person.nip}`);
      return terms.every(term => searchable.includes(term));
    });
    suggestions = matching.slice(0, 5);
    activeSuggestion = terms.length && suggestions.length ? 0 : -1;
    const fragment = document.createDocumentFragment();
    suggestions.forEach((person, index) => {
      const item = document.createElement('li');
      item.id = `person-option-${index}`;
      item.dataset.nip = person.nip;
      item.setAttribute('role', 'option');
      item.textContent = person.name;
      fragment.append(item);
    });
    personResults.replaceChildren(fragment);
    personMessage.textContent = !matching.length ? 'Nama nggak ketemu. Coba kata kunci lain.' : matching.length > 5 ? 'Ketik nama lebih lengkap untuk mempersempit hasil.' : '';
    personMessage.hidden = !personMessage.textContent;
    personMenu.hidden = false;
    lecturer.setAttribute('aria-expanded', 'true');
    paintActiveSuggestion();
  }
  function choosePerson(person) {
    if (!person) return;
    selectedNip = person.nip;
    lecturer.value = person.name;
    lecturer.setCustomValidity('');
    clearPerson.hidden = false;
    closePersonMenu();
    update();
    lecturer.focus({ preventScroll: true });
  }
  lecturer.addEventListener('focus', renderSuggestions);
  lecturer.addEventListener('input', () => {
    selectedNip = '';
    lecturer.setCustomValidity(lecturer.value ? 'Pilih nama dari daftar yang muncul.' : '');
    clearPerson.hidden = !lecturer.value;
    renderSuggestions();
  });
  lecturer.addEventListener('invalid', renderSuggestions);
  lecturer.addEventListener('keydown', event => {
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault();
      if (personMenu.hidden) renderSuggestions();
      if (suggestions.length) {
        const direction = event.key === 'ArrowDown' ? 1 : -1;
        activeSuggestion = activeSuggestion < 0 ? (direction > 0 ? 0 : suggestions.length - 1) : (activeSuggestion + direction + suggestions.length) % suggestions.length;
        paintActiveSuggestion();
      }
    } else if (event.key === 'Enter' && !personMenu.hidden) {
      event.preventDefault();
      if (activeSuggestion >= 0) choosePerson(suggestions[activeSuggestion]);
    } else if (event.key === 'Escape' && !personMenu.hidden) {
      event.preventDefault(); closePersonMenu();
    } else if (event.key === 'Tab') {
      if (!selectedNip && lecturer.value.trim()) {
        const exact = lecturers.filter(person => normalizeSearch(person.name) === normalizeSearch(lecturer.value));
        if (exact.length === 1) choosePerson(exact[0]);
      }
      closePersonMenu();
    }
  });
  personResults.addEventListener('pointerdown', event => event.preventDefault());
  personResults.addEventListener('click', event => {
    const option = event.target.closest('[role="option"]');
    if (option) choosePerson(lecturers.find(person => person.nip === option.dataset.nip));
  });
  document.addEventListener('pointerdown', event => { if (!personBox.contains(event.target)) closePersonMenu(); });
  clearPerson.addEventListener('click', () => {
    selectedNip = ''; lecturer.value = ''; lecturer.setCustomValidity(''); clearPerson.hidden = true;
    update(); lecturer.focus(); renderSuggestions();
  });
  form.addEventListener('input', update);
  form.addEventListener('change', update);
  for (const [button, field] of [['#today-start', start], ['#today-end', end], ['#today', created]]) {
    document.querySelector(button).addEventListener('click', () => { field.value = todayInMakassar(); update(); field.focus(); });
  }
  document.querySelector('#retry-data').addEventListener('click', loadLecturers);
  form.addEventListener('submit', async event => {
    event.preventDefault();
    if (!ready()) return;
    const data = model();
    const compact = sheet.classList.contains('compact');
    download.disabled = true;
    try {
      const doc = createPdf(data, await getPdfAssets(), compact);
      const safeName = data.name.replace(/[^a-z0-9]+/gi, '-').replace(/^-|-$/g, '').toLowerCase();
      doc.save(`surat-cuti-${safeName}-${data.createdIso}.pdf`);
      toast('PDF berhasil dibuat.');
    } catch (error) { toast(error.message || 'PDF belum bisa dibuat. Coba lagi atau gunakan Cetak.'); }
    finally { download.disabled = false; }
  });
  document.querySelector('#print-letter').addEventListener('click', () => { if (ready()) window.print(); });
  window.addEventListener('resize', fitPreview, { passive: true });
  if ('ResizeObserver' in window) new ResizeObserver(fitPreview).observe(paperShell);
  if (document.fonts?.ready) document.fonts.ready.then(() => { fitPreview(); update(); });
  created.value = todayInMakassar();
  syncPeriod();
  loadLecturers();
  requestAnimationFrame(fitPreview);
})();
