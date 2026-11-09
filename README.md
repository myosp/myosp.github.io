# myOSP

Portal tools dan informasi untuk dosen dan tenaga kependidikan D3 Otomasi Sistem Permesinan, Politeknik ATI Makassar.

## Jalankan secara lokal

```sh
python3 -m http.server 8000
```

Buka `http://localhost:8000`. Situs ini statis dan tidak memerlukan instalasi atau proses build.

## Fitur

- Data dosen: cari, salin, dan lihat Google Sheet. Data PLP: cari, salin, dan unduh data Excel.
- Surat cuti dan surat izin keluar: isi formulir, unduh PDF, atau cetak.
- QR Code Generator.
- Kategori PROMPT DEWA dan Link Penting siap diisi.

Data formulir diproses di perangkat melalui browser.

## Pemeliharaan

- `app.js`: daftar dan kategori tools di beranda.
- Data dosen dikelola di Google Sheet **Data Dosen OSP**, tab **Dosen**, dalam folder **Website MyOSP**. Kolom: Nama dan gelar, NIP, NIDN, Bidang keilmuan, Email. Pertahankan format Teks biasa pada kolom NIP dan NIDN, termasuk saat menempelkan data baru.
- Publikasikan tab Dosen melalui File → Bagikan → Publikasikan ke web → CSV, dengan publikasi ulang otomatis aktif. URL CSV publik tersimpan pada `data-csv-url` di `dosen.html`. Perubahan Sheet akan muncul setelah Google memperbarui publikasi dan halaman dimuat ulang.
- `assets/data/plp.json`: data PLP. Simpan NIP sebagai string agar angkanya tetap utuh.
- `assets/vendor/`: pustaka lokal dan lisensinya.

GitHub Pages menyajikan situs dari branch `main` dan direktori root. Favorit tersimpan di browser pengguna.
