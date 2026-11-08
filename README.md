# MyOSP

Portal aplikasi dan utilitas pendukung administrasi untuk dosen dan tenaga kependidikan D3 Otomasi Sistem Permesinan, Politeknik ATI Makassar.

## Menjalankan secara lokal

Dari direktori repository:

```sh
python3 -m http.server 8000
```

Buka `http://localhost:8000`. Tidak ada dependensi aplikasi, instalasi paket, atau langkah build. Gunakan checkout yang tersedia; tidak perlu membuat Git worktree.

## Struktur

- `index.html`: beranda, bagian tautan penting, dan dialog.
- `styles.css`: tema terang/gelap, layout responsif, dan motion dengan dukungan `prefers-reduced-motion`.
- `app.js`: katalog tools, pencarian, kategori, favorit, dan interaksi keyboard.
- `assets/`: ikon dan font lokal. Lisensi font tersedia di `assets/fonts/`.

Daftar rencana tools berada pada array `tools` di `app.js`. Surat Izin, Surat Cuti, dan QR Code Generator **belum berfungsi**; kartu membuka penjelasan rencana. Tautan penting belum diisi agar tidak mengarahkan pengguna ke tujuan sementara.

Favorit dan preferensi tema disimpan di `localStorage` pada perangkat pengguna. Jika penyimpanan tidak tersedia, antarmuka tetap berjalan dan favorit hanya berlaku selama sesi. Tidak ada login, backend, analitik, atau pengiriman data formulir.

## Pemeriksaan manual

- Cari nama tool; pastikan kategori dan pencarian bekerja bersamaan. Uji hasil kosong dan tombol reset.
- Simpan favorit, pilih kategori Favorit saya, dan muat ulang untuk memeriksa persistensi.
- Ganti tema dan muat ulang. Buka kartu atau Tentang; tutup dengan tombol atau Escape dan periksa fokus kembali.
- Tekan `/` atau `Ctrl/Cmd+K` untuk menuju pencarian. Semua kontrol dapat dijangkau dengan Tab.
- Periksa layar HP, tablet, dan desktop serta pengaturan sistem untuk mengurangi animasi.

## GitHub Pages

Situs siap disajikan langsung dari root repository. Setelah perubahan digabungkan atau didorong ke `main`, atur **Settings → Pages → Deploy from a branch → main / (root)** bila belum aktif. File `.nojekyll` memastikan aset statis disajikan langsung. Deployment tidak dilakukan otomatis oleh proses pengembangan lokal.

Gaya visual mengikuti referensi fadhlyid.github.io: Inter, Source Serif 4, latar krem, dan terracotta. MyOSP tidak berafiliasi dengan Anthropic.
