'use strict';
(() => {
  const input = document.querySelector('#qr-url');
  const canvas = document.querySelector('#qr-canvas');
  const stage = document.querySelector('#qr-stage');
  const status = document.querySelector('#preview-status');
  const destination = document.querySelector('#qr-destination');
  const error = document.querySelector('#url-error');
  const download = document.querySelector('#download-qr');
  const copy = document.querySelector('#copy-qr');
  let logoData;
  let exportBlob;
  let currentUrl = '';
  let version = 0;
  let timer;
  let toastTimer;

  function notify(message) {
    const toast = document.querySelector('#qr-toast');
    toast.textContent = message;
    toast.classList.add('visible');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove('visible'), 4000);
  }
  function normalizedUrl(value) {
    const text = value.trim();
    if (!text) return null;
    if (/\s/.test(text)) throw Error('Tautan tidak boleh mengandung spasi.');
    const withScheme = /^[a-z][a-z\d+.-]*:/i.test(text) ? text : `https://${text}`;
    let url;
    try { url = new URL(withScheme); } catch { throw Error('Masukkan alamat tautan yang valid, misalnya myosp.github.io.'); }
    if (!['http:', 'https:'].includes(url.protocol)) throw Error('Gunakan tautan dengan awalan http:// atau https://.');
    if (!url.hostname || (!url.hostname.includes('.') && url.hostname !== 'localhost' && !url.hostname.startsWith('['))) throw Error('Masukkan alamat situs yang lengkap, misalnya myosp.github.io.');
    if (url.username || url.password) throw Error('Gunakan tautan tanpa nama pengguna atau kata sandi.');
    if (new TextEncoder().encode(url.href).length > 900) throw Error('Tautan terlalu panjang. Gunakan tautan yang lebih pendek (maksimal 900 byte).');
    return url.href;
  }
  function setError(message) {
    error.textContent = message || '';
    error.hidden = !message;
    input.setAttribute('aria-invalid', String(Boolean(message)));
  }
  function invalidate() {
    version++;
    clearTimeout(timer);
    exportBlob = undefined;
    download.disabled = true;
    copy.disabled = true;
    document.querySelector('#clear-url').hidden = !input.value;
  }
  function blobCanvas(blob) {
    return new Promise((resolve, reject) => {
      const image = new Image();
      const url = URL.createObjectURL(blob);
      image.onload = () => { URL.revokeObjectURL(url); resolve(image); };
      image.onerror = () => { URL.revokeObjectURL(url); reject(Error('Gambar QR tidak dapat dimuat.')); };
      image.src = url;
    });
  }
  async function generate(url, demo, ticket) {
    stage.setAttribute('aria-busy', 'true');
    status.textContent = 'Membuat kode QR…';
    try {
      if (typeof QRCodeStyling !== 'function') throw Error('Komponen QR tidak tersedia. Muat ulang halaman untuk mencoba kembali.');
      const qr = new QRCodeStyling({
        width: 1040, height: 1040, type: 'canvas', data: url, margin: 56,
        qrOptions: { errorCorrectionLevel: 'H' },
        dotsOptions: { type: 'square', color: '#17171d' },
        cornersSquareOptions: { type: 'square', color: '#17171d' },
        cornersDotOptions: { type: 'square', color: '#17171d' },
        backgroundOptions: { color: '#ffffff' },
        image: logoData,
        imageOptions: { hideBackgroundDots: true, imageSize: .20, margin: 10, crossOrigin: 'anonymous' }
      });
      const image = await blobCanvas(await qr.getRawData('png'));
      if (ticket !== version) return;
      // Keep QR pixels at their native size when framing to avoid blurring dense codes.
      const output = document.createElement('canvas');
      output.width = 1088; output.height = 1200;
      const context = output.getContext('2d');
      context.fillStyle = '#17171d'; context.fillRect(0, 0, 1088, 1200);
      context.drawImage(image, 24, 24);
      context.fillStyle = '#ffffff'; context.textAlign = 'center'; context.textBaseline = 'middle';
      context.font = 'bold 48px Arial, sans-serif'; context.fillText('SCAN ME', 544, 1129);
      const blob = await new Promise(resolve => output.toBlob(resolve, 'image/png'));
      if (ticket !== version) return;
      if (!blob) throw Error('Gambar tidak dapat dibuat. Silakan coba kembali.');
      canvas.getContext('2d').drawImage(output, 0, 0);
      canvas.setAttribute('aria-label', `${demo ? 'Contoh kode QR' : 'Kode QR'} menuju ${url}`);
      currentUrl = url;
      exportBlob = demo ? undefined : blob;
      download.disabled = demo; copy.disabled = demo;
      destination.textContent = url; destination.hidden = demo;
      status.textContent = demo ? 'Contoh pratinjau. Masukkan tautan untuk membuat kode QR.' : 'Kode QR siap diunduh. Periksa tautan tujuan sebelum dibagikan.';
      document.querySelector('#logo-badge').textContent = 'Logo kampus';
    } catch (failure) {
      if (ticket !== version) return;
      exportBlob = undefined; download.disabled = true; copy.disabled = true;
      canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height);
      status.textContent = failure.message || 'Kode QR tidak dapat dibuat. Silakan coba kembali.';
      destination.hidden = true;
    } finally {
      if (ticket === version) stage.setAttribute('aria-busy', 'false');
    }
  }
  function update(immediate = false) {
    invalidate();
    destination.hidden = true;
    stage.setAttribute('aria-busy', 'false');
    let url;
    try { url = normalizedUrl(input.value); setError(''); }
    catch (failure) {
      setError(failure.message);
      canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height);
      status.textContent = 'Perbaiki tautan untuk membuat kode QR.';
      return;
    }
    const ticket = version;
    status.textContent = url ? 'Memperbarui pratinjau…' : 'Menyiapkan contoh pratinjau…';
    timer = setTimeout(() => generate(url || 'https://myosp.github.io/', !url, ticket), immediate ? 0 : 250);
  }
  input.addEventListener('input', () => update());
  document.querySelector('#qr-form').addEventListener('submit', event => { event.preventDefault(); update(true); });
  document.querySelector('#clear-url').addEventListener('click', () => { input.value = ''; update(true); input.focus(); });
  download.addEventListener('click', () => {
    if (!exportBlob) return;
    const link = document.createElement('a');
    const url = URL.createObjectURL(exportBlob);
    link.href = url;
    const hostname = new URL(currentUrl).hostname.replace(/[^a-z\d.-]/gi, '-');
    link.download = `myosp-qr-${hostname}.png`;
    document.body.append(link); link.click(); link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 10000);
  });
  copy.addEventListener('click', async () => {
    if (!exportBlob) return;
    if (!navigator.clipboard?.write || typeof ClipboardItem === 'undefined') {
      notify('Penyalinan gambar tidak didukung peramban ini. Gunakan Unduh PNG.'); return;
    }
    try {
      await navigator.clipboard.write([new ClipboardItem({ 'image/png': exportBlob })]);
      notify('Gambar kode QR berhasil disalin.');
    } catch { notify('Gambar tidak dapat disalin. Izinkan akses papan klip atau gunakan Unduh PNG.'); }
  });
  async function initialize() {
    input.disabled = true;
    status.textContent = 'Memuat logo kampus…';
    try {
      const image = new Image();
      image.src = 'assets/logo-campus-qr.webp';
      await image.decode();
      logoData = image.src;
      input.disabled = false;
      update(true);
    } catch {
      status.textContent = 'Logo kampus tidak dapat dimuat. Muat ulang halaman untuk mencoba kembali.';
    }
  }
  initialize();
})();
