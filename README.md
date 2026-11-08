# myOSP

Portal aplikasi dan utilitas pendukung administrasi untuk dosen dan tenaga kependidikan D3 Otomasi Sistem Permesinan, Politeknik ATI Makassar.

## Menjalankan secara lokal

Dari direktori repository:

```sh
python3 -m http.server 8000
```

Buka `http://localhost:8000`. Tidak ada dependensi aplikasi, instalasi paket, atau langkah build. Gunakan checkout yang tersedia; tidak perlu membuat Git worktree.

## Struktur

- `index.html`: beranda, bagian tautan penting, dan dialog.
- `styles.css`: tema terang, layout responsif, dan motion dengan dukungan `prefers-reduced-motion`.
- `app.js`: katalog tools, pencarian, kategori, favorit, dan interaksi keyboard.
- `assets/`: ikon dan font lokal. Lisensi font tersedia di `assets/fonts/`.

Daftar aplikasi berada pada array `tools` di `app.js`. QR Code Generator tersedia di `qr-generator.html`. Surat Izin dan Surat Cuti masih dalam perencanaan; kartu membuka penjelasan rencana. Kategori Tautan belum berisi link. Untuk menambahkan tautan eksternal ke array `tools`, gunakan `category: 'tautan'`, `href` URL tujuan, serta `external: true`; kartu menampilkan ikon tautan keluar dan membuka tab baru. Jumlah kategori diperbarui otomatis.

Favorit disimpan di `localStorage` pada perangkat pengguna. Jika penyimpanan tidak tersedia, antarmuka tetap berjalan dan favorit hanya berlaku selama sesi. Tidak ada login, backend, analitik, atau pengiriman data formulir.

## Pemeriksaan manual

- Cari nama tool; pastikan kategori dan pencarian bekerja bersamaan. Uji hasil kosong dan tombol reset.
- Simpan favorit, pilih kategori Favorit saya, dan muat ulang untuk memeriksa persistensi.
- Buka kartu atau Tentang; tutup dengan tombol atau Escape dan periksa fokus kembali.
- Tekan `/` atau `Ctrl/Cmd+K` untuk menuju pencarian. Semua kontrol dapat dijangkau dengan Tab.
- Periksa layar HP, tablet, dan desktop serta pengaturan sistem untuk mengurangi animasi.

## GitHub Pages

Situs siap disajikan langsung dari root repository. Setelah perubahan digabungkan atau didorong ke `main`, atur **Settings → Pages → Deploy from a branch → main / (root)** bila belum aktif. File `.nojekyll` memastikan aset statis disajikan langsung. Deployment tidak dilakukan otomatis oleh proses pengembangan lokal.

Gaya visual mengikuti referensi fadhlyid.github.io: Inter, Source Serif 4, latar krem, dan terracotta. myOSP tidak berafiliasi dengan Anthropic.

## QR Code Generator

Buka `qr-generator.html` melalui server lokal. Masukkan tautan HTTP(S); awalan HTTPS ditambahkan untuk alamat tanpa protokol. Pratinjau awal adalah contoh dan tidak dapat diunduh sebelum pengguna memasukkan tautan.

- Unduhan PNG berukuran 1088 × 1200 piksel, termasuk bingkai dan label SCAN ME.
- Penyalinan PNG memerlukan HTTPS atau localhost dan dukungan Clipboard API. Bila akses ditolak, gunakan Unduh PNG.
- Logo kampus dimuat otomatis dari `assets/logo-campus-qr.webp`. Versi ini hanya menghapus margin transparan dari `assets/logo-campus.webp`, tanpa mengubah piksel pada lambang. Tidak ada pengaturan atau unggahan logo pada halaman generator. Logo berasal dari berkas PNG yang diberikan pengguna dan dikonversi ke WebP lossless: 28.214 → 15.880 byte, dengan piksel RGBA identik.
- QR menggunakan tingkat koreksi kesalahan H, margin putih, dan logo dengan ukuran terbatas untuk menjaga keterbacaan. Pindai hasil unduhan sebelum distribusi.
- Tautan dibatasi 900 byte setelah normalisasi. Tidak ada pelacakan atau pengalihan melalui server myOSP.

Library `qr-code-styling` 1.9.2 disertakan secara lokal di `assets/vendor/qr-code-styling/`. Bundle berasal dari paket npm resmi dan menyertakan `qrcode-generator`. Lisensi keduanya disertakan. Aplikasi tetap statis, tanpa instalasi paket atau proses build.

Pemeriksaan browser yang dilakukan: tautan dari beranda, penambahan HTTPS, validasi URL, decoding QR dengan decoder independen jsQR (tautan pendek, parameter, tautan panjang, dan logo berwarna), pemuatan logo kampus otomatis, unduhan PNG, Clipboard API, serta layout pada lebar 320–1440 piksel.

## Data Dosen OSP

Halaman `dosen.html` memuat 17 identitas dosen dari `assets/data/dosen.json`, sesuai daftar yang diberikan pengguna berdasarkan Proposal PKM 2025. Data tidak dinormalisasi atau dikoreksi secara otomatis. NIP dan NIDN disimpan sebagai **string** agar angka panjang serta nol di depan tetap utuh.

Setiap kartu menyediakan lima tombol salin terpisah: nama dan gelar, NIP, NIDN, bidang keilmuan, dan email. Clipboard hanya berisi nilai yang dipilih, tanpa label atau baris tambahan. Pencarian mencakup kelima bagian dan dapat digabungkan dengan filter bidang keilmuan. Urutan dan nomor dosen mengikuti daftar sumber, termasuk ketika hasil difilter.

Penyalinan menggunakan Clipboard API pada HTTPS/localhost, dengan fallback penyalinan browser. Jika keduanya tidak tersedia, dialog menyediakan teks yang sudah dipilih untuk disalin manual. Kegagalan pemuatan data menampilkan pesan dan tombol coba ulang.

Untuk memperbarui identitas, edit nilai di `assets/data/dosen.json` berdasarkan konfirmasi pemilik data. Pertahankan ejaan, gelar, tanda baca, dan tipe string seluruh nomor identitas. Tidak ada backend atau instalasi tambahan yang diperlukan.
