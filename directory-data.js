'use strict';
const directorySources = {
  dosen: 'https://docs.google.com/spreadsheets/d/e/2PACX-1vScik3DKnPzr0YNrbbDmhPDr5ee_3f4JFN1jRxDfZwdHxgRynvqEjvK9MRklX7F5o-OnX_FdB-Ey-7v/pub?gid=1113264425&single=true&output=csv',
  plp: 'https://docs.google.com/spreadsheets/d/e/2PACX-1vSK5tG4G0v7bEM4QHN8Y2LPgnm5YTJa01Fo_EkHcgk-zZiNErQyrDwumWKjT7f59OSYV-vTOeeYuqsR/pub?gid=974922281&single=true&output=csv'
};
function validDirectoryData(data, kind) {
  const required = kind === 'plp' ? ['name', 'nip'] : ['name', 'nip', 'nidn', 'expertise', 'email'];
  return Array.isArray(data) && data.length > 0 && data.every(person => person &&
    required.every(key => typeof person[key] === 'string' && person[key].trim()) &&
    (person.email == null || typeof person.email === 'string'));
}
async function refreshDirectoryData(kind, signal) {
  for (let attempt = 0; attempt < 2; attempt++) {
    const abort = new AbortController();
    const cancel = () => abort.abort();
    const timeout = setTimeout(cancel, 15000);
    signal?.addEventListener('abort', cancel, { once: true });
    try {
      if (signal?.aborted) throw Error('Pemuatan dibatalkan.');
      const response = await fetch(directorySources[kind], { cache: 'no-cache', signal: abort.signal });
      if (!response.ok) throw Error('Data tidak tersedia.');
      const data = parseLecturerCsv(await response.text(), kind === 'plp');
      if (!validDirectoryData(data, kind)) throw Error('Format data tidak valid.');
      try { localStorage.setItem(`myosp-directory-v1-${kind}`, JSON.stringify({ source: directorySources[kind], data })); }
      catch { /* Storage may be disabled or full; live data remains usable. */ }
      return data;
    } catch (error) {
      if (signal?.aborted || attempt === 1) throw error;
    } finally {
      clearTimeout(timeout);
      signal?.removeEventListener('abort', cancel);
    }
  }
}
async function loadDirectoryData(kind, signal, onUpdate) {
  let cached;
  try {
    const entry = JSON.parse(localStorage.getItem(`myosp-directory-v1-${kind}`));
    if (entry?.source === directorySources[kind] && validDirectoryData(entry.data, kind)) cached = entry.data;
  } catch { /* Ignore unavailable storage or invalid cache. */ }
  if (cached) {
    // Show the last successful result immediately, then refresh from Sheets.
    void refreshDirectoryData(kind, signal).then(data => {
      if (JSON.stringify(data) !== JSON.stringify(cached)) onUpdate?.(data);
    }).catch(() => { /* Keep usable cached data when Google is slow or offline. */ });
    return cached;
  }
  return refreshDirectoryData(kind, signal);
}
