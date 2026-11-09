'use strict';
// Google Sheets CSV values stay strings, including NIP and leading-zero NIDN.
function parseLecturerCsv(csv, isPlp = false) {
  const rows = [];
  let row = [], field = '', quoted = false, closed = false;
  const endField = () => { row.push(field); field = ''; closed = false; };
  const endRow = () => { endField(); if (row.some(value => value.trim())) rows.push(row); row = []; };
  const text = csv.replace(/^\uFEFF/, '');
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (quoted) {
      if (ch === '"') {
        if (text[i + 1] === '"') { field += '"'; i++; }
        else { quoted = false; closed = true; }
      } else field += ch;
    } else if (ch === ',') endField();
    else if (ch === '\r' || ch === '\n') {
      if (ch === '\r' && text[i + 1] === '\n') i++;
      endRow();
    } else if (ch === '"' && !field && !closed) quoted = true;
    else {
      if (closed || ch === '"') throw Error('Format CSV tidak valid.');
      field += ch;
    }
  }
  if (quoted) throw Error('Format CSV tidak valid.');
  endRow();
  const headers = isPlp ? ['Nama dan gelar', 'NIP', 'Email'] : ['Nama dan gelar', 'NIP', 'NIDN', 'Bidang keilmuan', 'Email'];
  const keys = isPlp ? ['name', 'nip', 'email'] : ['name', 'nip', 'nidn', 'expertise', 'email'];
  const header = rows.shift()?.map(value => value.trim());
  if (!header || headers.some(value => header.filter(item => item === value).length !== 1)) throw Error('Kolom CSV tidak sesuai.');
  const indexes = headers.map(value => header.indexOf(value));
  return rows.map(values => {
    if (values.length !== header.length) throw Error('Baris CSV tidak lengkap.');
    return Object.fromEntries(keys.map((key, i) => [key, values[indexes[i]].trim()]));
  });
}
