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
  const logoFile = document.querySelector('#logo-file');
  const logoError = document.querySelector('#logo-error');
  let logoData;
  let exportBlob;
  let currentUrl = '';
  let version = 0;
  let timer;
  let toastTimer;
  let logoVersion = 0;

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
        width: 1024, height: 1024, type: 'canvas', data: url, margin: 56,
        qrOptions: { errorCorrectionLevel: 'H' },
        dotsOptions: { type: 'rounded', color: '#17171d' },
        cornersSquareOptions: { type: 'extra-rounded', color: '#17171d' },
        cornersDotOptions: { type: 'square', color: '#17171d' },
        backgroundOptions: { color: '#ffffff' },
        image: logoData,
        imageOptions: { hideBackgroundDots: true, imageSize: .18, margin: 8, crossOrigin: 'anonymous' }
      });
      const image = await blobCanvas(await qr.getRawData('png'));
      if (ticket !== version) return;
      // Compose the frame separately, preserving the QR's white quiet zone.
      const output = document.createElement('canvas');
      output.width = 1088; output.height = 1200;
      const context = output.getContext('2d');
      context.fillStyle = '#17171d'; context.fillRect(0, 0, 1088, 1200);
      context.drawImage(image, 24, 24, 1040, 1040);
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
      document.querySelector('#logo-badge').textContent = logoData ? 'Dengan logo' : 'Tanpa logo';
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
  logoFile.addEventListener('change', async () => {
    const file = logoFile.files[0];
    const ticket = ++logoVersion;
    logoError.hidden = true;
    if (!file) return;
    try {
      if (!['image/png', 'image/jpeg', 'image/webp'].includes(file.type)) throw Error('Gunakan file PNG, JPG, atau WebP.');
      if (file.size > 2 * 1024 * 1024) throw Error('Ukuran logo melebihi 2 MB. Pilih file yang lebih kecil.');
      const image = await blobCanvas(file);
      if (ticket !== logoVersion) return;
      if (!image.naturalWidth || !image.naturalHeight || image.naturalWidth > 6000 || image.naturalHeight > 6000) throw Error('Dimensi gambar tidak valid atau melebihi 6000 piksel.');
      const logo = document.createElement('canvas'); logo.width = 256; logo.height = 256;
      const context = logo.getContext('2d'); context.fillStyle = '#ffffff'; context.fillRect(0, 0, 256, 256);
      const scale = Math.min(236 / image.naturalWidth, 236 / image.naturalHeight);
      const width = image.naturalWidth * scale, height = image.naturalHeight * scale;
      context.drawImage(image, (256 - width) / 2, (256 - height) / 2, width, height);
      logoData = logo.toDataURL('image/webp', .9);
      document.querySelector('#logo-thumbnail').src = logoData;
      document.querySelector('#logo-name').textContent = file.name;
      document.querySelector('#logo-selection').hidden = false;
      update(true);
    } catch (failure) {
      if (ticket !== logoVersion) return;
      logoError.textContent = failure.message || 'Logo tidak dapat dibaca.'; logoError.hidden = false;
    } finally { if (ticket === logoVersion) logoFile.value = ''; }
  });
  document.querySelector('#remove-logo').addEventListener('click', () => {
    ++logoVersion; logoData = undefined;
    document.querySelector('#logo-selection').hidden = true;
    document.querySelector('#logo-thumbnail').removeAttribute('src');
    logoError.hidden = true;
    update(true);
  });
  update(true);
})();
