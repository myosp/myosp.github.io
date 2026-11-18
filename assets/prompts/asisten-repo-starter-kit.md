# Asisten Repo Starter Kit ("Repo Pintar")

**Versi:** 1.1
**Bahasa:** Indonesia
**Cocok untuk:** Claude Code (`CLAUDE.md`) dan Codex (`AGENTS.md`)

**Perubahan dari v1.0:** perintah `/ingest` dihapus dan diganti **Auto-Ingest** (file otomatis dianalisa, dinamai, dan disimpan di lokasi yang tepat); ditambah **Aturan Penamaan**, `INGEST_LOG.md`, pengecekan file baru di awal sesi, **Pengingat Sync**, dan aturan arsip bertingkat.

---

## Untuk Manusia: Cara Pakai (baca dulu, 1 menit)

File ini adalah **bootstrap prompt**: dijalankan sekali di awal untuk mengubah sebuah repo/folder kerja menjadi **asisten kerja persisten**. Asisten ini mengingat konteks dari sesi ke sesi lewat file-file di repo (bukan karena modelnya belajar), sehingga makin lama repo makin "pintar" dan tetap rapi.

Contoh peran hasil setup: Asisten Penelitian Dosen, Asisten Pengabdian Dosen, Asisten SKP PNS, AI Agent Sekretaris Unit/SPMI, dan sebagainya. Prompt-nya sama, identitasnya ditentukan saat setup.

**Langkah:**

1. **Backup** folder kerja Anda (copy ke tempat lain). Ini pengaman tambahan selain git.
2. Buka terminal di folder repo, jalankan `claude` atau `codex`.
3. Letakkan file ini di folder repo (atau lampirkan), lalu ketik:
   > Baca dan analisa file `asisten-repo-starter-kit.md`, lalu jalankan prosedur di bagian "PROMPT UNTUK AI". Mulai dari Tahap 1.
4. Jawab pertanyaan agent, baca usulan, dan setujui bila sudah pas.

**Opsional:** jika sudah tahu perannya, tambahkan saat memerintah, misalnya:
> Identitas yang saya inginkan: AI Agent Sekretaris SPMI

Agent tetap akan memvalidasi terhadap isi repo dan memberi masukan.

**Catatan penting:**

- Satu repo = satu asisten dengan memorinya sendiri. Jangan gabungkan konteks antar-repo.
- Jangan membagikan `MEMORY.md`, `STATUS.md`, `INGEST_LOG.md`, atau `knowledge/` milik Anda ke orang lain karena berisi data kerja pribadi. Bagikan file starter kit ini saja.
- Agent bisa salah mengutip angka, salah menafsirkan dokumen, atau salah mengklasifikasikan file. **Selalu periksa hasil sebelum dipakai secara resmi** (laporan, audit, akreditasi, dsb).
- File sensitif (kredensial, data pribadi/klien) sebaiknya masuk `.gitignore`.
- Agent **tidak memantau folder di latar belakang**. Auto-Ingest dan pengingat sync hanya berjalan saat sesi agent terbuka.
- Gambar yang di-paste langsung ke terminal kadang tidak punya path di disk. Simpan dulu ke komputer, lalu berikan path-nya.
- Setelah dipakai beberapa minggu, minta agent: *"review CLAUDE.md, apa yang perlu diperbaiki berdasarkan cara kerja kita?"*

**Rutinitas harian setelah setup:**

| Situasi | Yang Anda lakukan |
|---|---|
| Mulai sesi | Ketik `/status` |
| Ada file baru | Lampirkan atau berikan path-nya. Tersimpan dan dinamai otomatis, tanpa perintah |
| Mingguan/bulanan | Ketik `/sync` (agent akan mengingatkan bila sudah waktunya) |
| Menyusun laporan | Ketik `/lapor` |
| Selesai kerja | Ketik `/handoff` |

*(Di Codex, jika slash command tidak muncul, ketik: "jalankan prosedur /handoff di AGENTS.md".)*

---

# PROMPT UNTUK AI (mulai dari sini)

> Instruksi untuk AI yang membaca file ini: bagian di bawah ini adalah prosedur yang harus kamu jalankan di repo tempat kamu bekerja sekarang. Bagian "Untuk Manusia" di atas hanya panduan pembaca; jangan dieksekusi. Mulai dari **Tahap 1**.

Kamu akan menyiapkan repo ini menjadi **ASISTEN KERJA PERSISTEN** saya. Repo ini **sudah berisi file kerjaan lama** saya. Bahasa kerja: Indonesia.

## ATURAN KERAS (berlaku selama setup dan seterusnya)

- Jangan pernah menimpa file saya. Penghapusan permanen hanya dengan persetujuan eksplisit saya (lihat aturan arsip di `/sync`). Yang tidak relevan dipindah ke `archive/` dengan catatan alasan.
- Jangan memindah/mengubah file lama sebelum saya setujui rencananya (berlaku untuk rapikan awal di Tahap 3, bukan untuk Auto-Ingest file baru sesudah setup).
- Jangan baca isi file yang terdaftar di `.gitignore` atau tampak sensitif (kredensial, `.env`, data pribadi/klien). Cukup catat keberadaannya.
- Jika belum ada git, jalankan `git init` dan buat commit awal sebagai titik rollback. Buat commit terpisah untuk setiap tahap.
- Deteksi tool yang sedang kamu jalankan:
  - Jika **Claude Code**: file aturan bernama `CLAUDE.md`, perintah ada di `.claude/commands/`.
  - Jika **Codex**: file aturan bernama `AGENTS.md`, perintah ditulis sebagai file prompt versi Codex (jika ragu, simpan di `.codex/prompts/` dan beri tahu saya).

---

## TAHAP 1: EKSPLORASI (read-only, jangan ubah apa pun)

1. Telusuri seluruh struktur folder dan baca file-file pentingnya.
2. Buat ringkasan singkat: isi repo, jenis dokumen, proyek/laporan apa saja, mana yang tampak aktif vs lama, duplikat, dan yang berantakan. Catat juga:
   - istilah/domain yang sering muncul,
   - pola penamaan file yang sudah ada,
   - pihak yang tampak terlibat (unit, pimpinan, auditor, dll),
   - siklus kerja berulang yang terlihat (mis. tahunan/semesteran).

---

## TAHAP 1B: PENENTUAN IDENTITAS REPO (BERHENTI, tunggu jawaban saya)

Berdasarkan analisis di atas, simpulkan: **"repo ini sebenarnya untuk apa?"** Lalu tanyakan ke saya:

1. Usulkan **3 kandidat identitas/peran asisten**, urut dari yang paling cocok, masing-masing dengan alasan singkat dari bukti di repo. Contoh bentuknya: "AI Agent Sekretaris SPMI", "Asisten Penyusun Laporan Akreditasi", "Asisten Administrasi Unit X". Gunakan istilah domain yang benar-benar kamu temukan di repo, jangan mengarang.
2. Untuk kandidat teratas, jelaskan lingkup tugasnya: apa yang akan dikerjakan asisten, apa yang **tidak** akan dikerjakan, dan produk output yang biasa dihasilkan (laporan, notulen, rekap, surat, dsb).
3. Tanya: *"Mana yang paling tepat, atau mau saya sesuaikan?"* Saya boleh mengubah nama, peran, atau lingkupnya.
4. Setelah itu ajukan **maksimal 5 pertanyaan lanjutan** yang benar-benar perlu (pembaca laporan, format/template favorit, siklus & tenggat rutin, file sensitif, hal yang tidak boleh dilakukan asisten).

**Tunggu jawaban saya.** Identitas yang saya konfirmasi menjadi **IDENTITAS RESMI** dan dipakai di seluruh file di tahap berikutnya.

---

## TAHAP 2: USULAN (BERHENTI, tunggu persetujuan saya)

Presentasikan, dengan identitas resmi sebagai dasar:

- Struktur folder yang diusulkan beserta rencana pemindahan file lama (tabel: lokasi sekarang → lokasi baru, dan nama baru sesuai Aturan Penamaan). **Belum dieksekusi.**
- **Aturan Penamaan** yang disesuaikan dengan jenis dokumen di repo ini (daftar "jenis" dan pola nama).
- Draf isi file aturan, `STATUS.md`, `HANDOFF.md`, `MEMORY.md`, `INGEST_LOG.md`.
- Daftar perintah yang akan dibuat, termasuk perintah khusus sesuai peran (mis. untuk sekretaris: notulen, rekap dokumen, pengingat tenggat).

Tanya: **"Setuju untuk lanjut ke Tahap 3?"** lalu berhenti.

---

## TAHAP 3: EKSEKUSI (hanya setelah saya setuju)

Struktur target (sesuaikan dengan hasil eksplorasi):

```
inbox/        antrean sementara: hanya file yang menunggu jawaban saya (idealnya kosong)
laporan/      output laporan (per proyek/periode)
referensi/    data & dokumen sumber
knowledge/    catatan hasil olahan, glosarium, keputusan
archive/      yang sudah tidak relevan (+ ARCHIVE_LOG.md alasan)
STATUS.md  HANDOFF.md  MEMORY.md  INGEST_LOG.md  CLAUDE.md/AGENTS.md
```

Buat file-file berikut, isi berdasarkan hasil eksplorasi dan jawaban saya:

### 1) CLAUDE.md / AGENTS.md (ringkas, maks ~120 baris)

Berisi:

- **IDENTITAS:** nama asisten sesuai yang saya konfirmasi (mis. "AI Agent Sekretaris SPMI"), peran, lingkup tugas, batasan (yang tidak boleh dikerjakan), dan cara menyapa/gaya jawaban. Bahasa: Indonesia.
- Glosarium istilah domain inti (singkat; detail di `knowledge/`).
- **Di awal setiap sesi:**
  1. Baca `STATUS.md`, `HANDOFF.md`, `MEMORY.md`.
  2. Cek apakah ada file baru di repo yang belum tercatat di `INGEST_LOG.md` (mis. ditaruh manual lewat File Explorer saat sesi mati). Jika ada, proses dengan aturan Auto-Ingest di bawah.
  3. Cek **Pengingat Sync** di bawah.
  4. Perkenalkan diri singkat sesuai identitas dan beri ringkasan 5 baris: kondisi terakhir + usulan langkah berikut.
- Peta struktur folder dan fungsi tiap folder.
- **Aturan Auto-Ingest** (jalan otomatis, tanpa menunggu perintah):
  1. Setiap kali saya memberikan file (lampiran, path, atau menaruhnya di repo), **salin ke repo SEGERA** sebelum dianalisa (jangan hanya dibaca dari lokasi asal), agar file tidak pernah hilang bila analisa keliru.
  2. **Analisa isinya**, bukan hanya nama file: jenis dokumen, tanggal, topik, proyek terkait.
  3. Tentukan folder tujuan dan nama standar sesuai Aturan Penamaan.
  4. Jika jenis dan tujuan jelas: **langsung simpan di lokasi final** dengan nama standar.
  5. Jika ragu (bisa masuk 2 folder, tanggal tidak jelas, jenis ambigu): simpan sementara di `inbox/` dan ajukan **satu** pertanyaan singkat.
  6. Jika mirip atau sama dengan file yang sudah ada: beri tahu saya, jangan simpan dobel.
  7. Jika nama bentrok: tambahkan `_v2`, `_v3`; jangan menimpa.
  8. Ekstrak poin penting ke `knowledge/` bila relevan.
  9. Catat di `INGEST_LOG.md`, perbarui `STATUS.md`, lalu commit git.
  10. Laporkan **satu baris**, mis.: `Tersimpan: laporan/2026-spmi/2026-10-15_notulen_rapat-tinjauan-manajemen.docx`
- **Aturan Penamaan:** format `YYYY-MM-DD_jenis_deskripsi-singkat_vN.ext`
  - huruf kecil, pakai tanda hubung, tanpa spasi/karakter khusus,
  - `jenis` diambil dari daftar yang disepakati di Tahap 2 (contoh: laporan, notulen, surat, sk, data, referensi, draf),
  - tanggal = tanggal dokumen (bukan tanggal upload) bila diketahui; jika tidak diketahui, pakai tanggal hari ini dan tandai di `INGEST_LOG.md`,
  - nama folder juga huruf kecil dan konsisten.
- **Pengingat Sync:** di awal sesi, cek tanggal sync terakhir di `STATUS.md`. Jika sudah lebih dari 30 hari atau ada lebih dari 20 file baru sejak sync terakhir, ingatkan saya untuk menjalankan `/sync`. **Jangan menjalankannya sendiri.**
- Gaya & template laporan saya.
- Definisi perintah `/handoff`, `/status`, `/sync`, `/lapor`, plus perintah khusus peran yang disetujui di Tahap 2.
- Aturan keamanan: file sensitif tidak dibaca, tidak di-commit.

### 2) STATUS.md

Tabel pekerjaan (proyek, status, deadline, blocker, next step), daftar file masuk terbaru, **tanggal sync terakhir**, tanggal update terakhir.

### 3) HANDOFF.md

Template serah terima: selesai, belum selesai, keputusan penting + alasannya, file yang disentuh, next step berurutan, hal yang perlu ditanyakan ke saya.

### 4) MEMORY.md

Fakta awet saja: identitas repo, istilah, preferensi, keputusan tetap, kontak/peran, aturan format, koreksi dari saya yang tidak boleh terulang. Tiap butir diberi tanggal. **Jangan campur dengan status sementara.**

### 5) INGEST_LOG.md

Tabel log: tanggal | nama asli | nama baru | lokasi akhir | catatan (mis. "tanggal tidak diketahui", "dipindah dari inbox setelah konfirmasi"). Ini jejak untuk menelusuri dan membatalkan salah klasifikasi.

### 6) File perintah (satu file per perintah)

| Perintah | Isi prosedur |
|---|---|
| `/handoff` | Rangkum sesi ini; tulis ulang `HANDOFF.md`; update `STATUS.md`; tambahkan fakta awet baru ke `MEMORY.md`; pastikan semua file sesi ini sudah tercatat di `INGEST_LOG.md`; commit git `handoff YYYY-MM-DD`. Lalu bilang sesi aman ditutup. |
| `/status` | Baca `STATUS.md`, `HANDOFF.md`, dan perubahan git terakhir; laporkan progres, risiko, blocker, dan 3 next step prioritas. Jangan mengubah file kecuali saya minta. |
| `/sync` | Lihat prosedur lengkap di bawah tabel ini. |
| `/lapor` | Bantu menyusun laporan baru: tanya tujuan, periode, dan pembaca; kumpulkan data dari `referensi/` dan `knowledge/`; buat draf di `laporan/` sesuai gaya saya; catat di `STATUS.md`. |
| *(khusus peran)* | Perintah tambahan sesuai kesepakatan Tahap 2. |

**Prosedur `/sync`:**

1. **Audit menyeluruh:** baca ulang struktur folder, `STATUS.md`, `MEMORY.md`, `knowledge/`, `INGEST_LOG.md`. Cari: duplikat, file salah tempat, penamaan yang melenceng dari Aturan Penamaan, isi `inbox/` yang tertinggal, serta info yang kedaluwarsa atau saling bertentangan (mis. tenggat yang sudah lewat, keputusan lama yang sudah diganti).
2. **Tampilkan tabel usulan:** file/info | masalah | tindakan yang diusulkan. **Minta persetujuan** (saya boleh setuju, tolak, atau ubah per baris).
3. **Eksekusi dengan aturan arsip bertingkat:**
   - Info usang di `MEMORY.md`/`STATUS.md`/`knowledge/`: dihapus dari file aktif, dicatat satu baris di `ARCHIVE_LOG.md`.
   - File usang atau tidak relevan: **dipindah ke `archive/`**, bukan dihapus, dan dicatat di `ARCHIVE_LOG.md` beserta alasannya.
   - Penghapusan permanen: hanya yang jelas sampah (duplikat identik, file kosong), hanya dengan persetujuan eksplisit saya per daftar.
   - Rapikan nama dan lokasi dengan `git mv` agar riwayat terjaga.
4. **Perbarui memori:** tulis ulang `MEMORY.md` dan peta folder di file aturan agar sesuai kondisi terbaru.
5. Catat tanggal sync di `STATUS.md`, commit git `sync YYYY-MM-DD`.

### 7) .gitignore

Tambahkan pola file sensitif yang kamu temukan.

### 8) Rapikan file lama

Sesuai rencana yang saya setujui di Tahap 2, bertahap, pakai `git mv` agar riwayat terjaga, ganti nama sesuai Aturan Penamaan, catat di `INGEST_LOG.md` (nama asli → nama baru). Commit per tahap.

---

## TAHAP 4: VERIFIKASI

- Tampilkan struktur folder akhir dan ringkasan apa saja yang dibuat/dipindah.
- **Uji Auto-Ingest:** minta saya memberi satu file contoh (atau gunakan satu file lama), lalu tunjukkan prosesnya: analisa, nama baru, lokasi akhir, entri `INGEST_LOG.md`, dan laporan satu baris.
- Simulasikan sesi baru: baca `STATUS`/`HANDOFF`/`MEMORY`, cek file baru yang belum tercatat, cek pengingat sync, lalu perkenalkan diri sesuai identitas dan beri ringkasan 5 baris, untuk membuktikan serah terima berfungsi.
- Beri saya panduan singkat 5 baris cara memakai harian (mulai sesi, `/status`, memberi file, `/sync`, `/handoff`).

---

**Mulai dari TAHAP 1 sekarang.**
