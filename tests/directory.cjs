const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const context = vm.createContext({});
vm.runInContext(fs.readFileSync('directory-csv.js', 'utf8'), context);
const parse = text => JSON.parse(JSON.stringify(context.parseLecturerCsv(text)));
const headers = 'Nama dan gelar,NIP,NIDN,Bidang keilmuan,Email';
test('CSV handles BOM, commas, escaped quotes, multiline fields and identifier strings', () => {
  assert.deepEqual(parse('\uFEFF' + headers + '\r\n"Nama, S.T.",198805112018012001,0911058802,"Bidang ""A""\nB",mail@example.com\r\n\r\n'), [{name:'Nama, S.T.',nip:'198805112018012001',nidn:'0911058802',expertise:'Bidang "A"\nB',email:'mail@example.com'}]);
});
test('CSV maps reordered columns and ignores blank rows', () => {
  assert.deepEqual(parse('NIDN,Email,Nama dan gelar,NIP,Bidang keilmuan\n0123,a@b,Nama,001,Bidang\n,,,,\n'), [{name:'Nama',nip:'001',nidn:'0123',expertise:'Bidang',email:'a@b'}]);
});
test('CSV rejects sign-in HTML, missing or duplicate headers and malformed rows', () => {
  for (const value of ['<html>Sign in</html>', headers+',NIP\n', headers+'\nNama,001', headers+'\n"unterminated', headers+'\n"Nama"x,1,2,A,a@b']) assert.throws(() => parse(value));
});
