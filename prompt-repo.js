'use strict';
(() => {
  const source = 'assets/prompts/asisten-repo-starter-kit.md';
  const text = document.querySelector('#prompt-text');
  const copy = document.querySelector('#copy-prompt');
  const status = document.querySelector('#prompt-status');
  const error = document.querySelector('#prompt-error');
  const content = document.querySelector('#prompt-content');
  let resetTimer;
  async function load() {
    copy.disabled = true;
    error.hidden = true;
    content.setAttribute('aria-busy', 'true');
    status.textContent = 'Memuat prompt…';
    try {
      const response = await fetch(source, { cache: 'no-cache' });
      if (!response.ok) throw Error('Prompt tidak tersedia');
      const markdown = await response.text();
      if (!markdown.trim() || !/^# (?:Pecut AI|Asisten Repo Starter Kit[^\r\n]*)(?:\r?\n|$)/.test(markdown)) throw Error('Format prompt tidak sesuai');
      text.value = markdown;
      copy.disabled = false;
      status.textContent = 'Siap disalin · Markdown asli tetap utuh.';
    } catch {
      status.textContent = 'Prompt belum tersedia.';
      error.hidden = false;
    } finally {
      content.setAttribute('aria-busy', 'false');
    }
  }
  copy.addEventListener('click', async () => {
    let copied = false;
    if (navigator.clipboard?.writeText && window.isSecureContext) {
      try { await navigator.clipboard.writeText(text.value); copied = true; } catch { /* Use selection below. */ }
    }
    if (!copied) {
      document.querySelector('#prompt-preview').open = true;
      text.focus();
      text.select();
      text.setSelectionRange(0, text.value.length);
      try { copied = document.execCommand('copy'); } catch { /* Leave the prompt selected for manual copy. */ }
    }
    clearTimeout(resetTimer);
    if (copied) {
      copy.querySelector('span').textContent = 'Tersalin!';
      status.textContent = 'Tersalin! Tempel ke percakapan agent di repo Anda.';
      resetTimer = setTimeout(() => { copy.querySelector('span').textContent = 'Salin prompt'; }, 2500);
    } else {
      status.textContent = 'Prompt sudah dipilih. Gunakan menu Salin di perangkat Anda atau tekan Ctrl/Cmd+C.';
    }
  });
  document.querySelector('#retry-prompt').addEventListener('click', load);
  load();
})();
