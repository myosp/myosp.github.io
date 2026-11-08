# myOSP

Portal tools dan informasi untuk dosen dan tenaga kependidikan D3 Otomasi Sistem Permesinan, Politeknik ATI Makassar.

## Jalankan secara lokal

```sh
python3 -m http.server 8000
```

Buka `http://localhost:8000`. Situs ini statis dan tidak memerlukan instalasi atau proses build.

## Fitur

- Data dosen dan PLP: cari, salin, dan unduh data Excel.
- Surat cuti dan surat izin keluar: isi formulir, unduh PDF, atau cetak.
- QR Code Generator.
- Kategori PROMPT DEWA dan Link Penting siap diisi.

Data formulir diproses di perangkat melalui browser.

## Pemeliharaan

- `app.js`: daftar dan kategori tools di beranda.
- `assets/data/dosen.json` dan `assets/data/plp.json`: data dosen dan PLP. Simpan NIP dan NIDN sebagai string agar angkanya tetap utuh.
- `assets/vendor/`: pustaka lokal dan lisensinya.

GitHub Pages menyajikan situs dari branch `main` dan direktori root. Favorit tersimpan di browser pengguna.
