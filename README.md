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
- PDF: gabungkan, kecilkan, tambahkan teks atau tanda tangan, dan ambil halaman.
- Kategori PROMPT DEWA dan Link Penting siap diisi.

Formulir dan file PDF diproses di perangkat melalui browser. PDF terkunci perlu dibuka terlebih dahulu. Hasil kompresi dapat mengubah halaman menjadi gambar, sehingga teksnya tidak dapat dicari atau disalin. Periksa hasil sebelum digunakan.

## Pemeliharaan

- `app.js`: daftar dan kategori tools di beranda.
- `assets/data/dosen.json` dan `assets/data/plp.json`: data dosen dan PLP. Simpan NIP dan NIDN sebagai string agar angkanya tetap utuh.
- `assets/vendor/`: pustaka lokal dan lisensinya.

GitHub Pages menyajikan situs dari branch `main` dan direktori root. Favorit tersimpan di browser pengguna.
