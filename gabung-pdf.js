'use strict';
(() => {
  const input = document.querySelector('#pilih-file'), drop = document.querySelector('#drop-area'), list = document.querySelector('#file-list'), section = document.querySelector('#list-section'), merge = document.querySelector('#merge'), clear = document.querySelector('#clear'), message = document.querySelector('#message');
  let files = [], busy = false, dragged = null, nextId = 0;
  const size = bytes => bytes < 1024 * 1024 ? `${Math.max(1, Math.round(bytes / 1024))} KB` : `${(bytes / 1024 / 1024).toFixed(1)} MB`;
  function render(focusId, focusAction) {
    document.querySelector('#file-count').textContent = `${files.length} file`;
    const warning = document.querySelector('#size-warning');
    warning.hidden = files.reduce((total, entry) => total + entry.file.size, 0) <= 50000000;
    warning.textContent = 'Total file cukup besar, proses mungkin lebih lama di perangkat ini.';
    section.hidden = files.length === 0; merge.disabled = busy || files.length < 2; input.disabled = busy; clear.disabled = busy;
    drop.setAttribute('aria-disabled', String(busy)); list.replaceChildren();
    files.forEach((entry, index) => {
      const row = document.createElement('li'); row.className = 'file-row'; row.draggable = !busy; row.dataset.id = entry.id;
      const num = document.createElement('span'); num.className = 'file-number'; num.textContent = String(index + 1).padStart(2, '0'); num.setAttribute('aria-hidden','true');
      const details = document.createElement('div'); details.className = 'file-details'; const name = document.createElement('div'); name.className = 'file-name'; name.textContent = entry.file.name; const length = document.createElement('div'); length.className = 'file-size'; length.textContent = size(entry.file.size); details.append(name, length);
      const actions = document.createElement('div'); actions.className = 'file-actions';
      [['up','↑','Pindahkan ke atas'],['down','↓','Pindahkan ke bawah'],['remove','×','Hapus']].forEach(([action, symbol, label]) => { const button = document.createElement('button'); button.type='button'; button.dataset.action=action; button.textContent=symbol; button.setAttribute('aria-label', `${label}: ${entry.file.name}`); button.disabled=busy || (action==='up' && index===0) || (action==='down' && index===files.length-1); actions.append(button); });
      row.append(num,details,actions); list.append(row);
    });
    if (focusId != null) { const row = [...list.children].find(el => el.dataset.id === String(focusId)); (row?.querySelector(`[data-action="${focusAction}"]:not(:disabled)`) || row?.querySelector('button:not(:disabled)'))?.focus(); }
  }
  function add(incoming) {
    if (busy) return;
    const accepted = [], rejected = [];
    for (const file of incoming) { if (/\.pdf$/i.test(file.name) || file.type === 'application/pdf') accepted.push({id:nextId++,file}); else rejected.push(file.name); }
    files.push(...accepted); input.value=''; message.textContent = rejected.length ? 'Hanya file PDF yang bisa ditambahkan.' : ''; render();
  }
  input.addEventListener('change', () => add(input.files));
  for (const type of ['dragenter','dragover']) drop.addEventListener(type, e => { e.preventDefault(); if (!busy) drop.classList.add('drag-over'); });
  for (const type of ['dragleave','drop']) drop.addEventListener(type, e => { e.preventDefault(); drop.classList.remove('drag-over'); });
  drop.addEventListener('drop', e => add(e.dataTransfer.files));
  clear.addEventListener('click', () => { files=[]; message.textContent=''; render(); input.focus(); });
  list.addEventListener('click', e => { const button=e.target.closest('button[data-action]'); if (!button || busy) return; const row=button.closest('li'), index=files.findIndex(x => String(x.id)===row.dataset.id); if(index<0) return; const id=files[index].id, action=button.dataset.action; if(action==='remove') { files.splice(index,1); render(); if(!files.length) input.focus(); } else { const to=index+(action==='up'?-1:1); if(to<0 || to>=files.length) return; [files[index],files[to]]=[files[to],files[index]]; render(id,action); } message.textContent=''; });
  list.addEventListener('dragstart', e => { const row=e.target.closest('li'); if(!row || busy) return; dragged=row.dataset.id; e.dataTransfer.effectAllowed='move'; e.dataTransfer.setData('text/plain',dragged); row.classList.add('dragging'); });
  list.addEventListener('dragover', e => { if(dragged !== null) { e.preventDefault(); e.dataTransfer.dropEffect='move'; } });
  list.addEventListener('drop', e => { if(dragged === null || busy) return; e.preventDefault(); const row=e.target.closest('li'); if(!row) return; const from=files.findIndex(x=>String(x.id)===dragged), to=files.findIndex(x=>String(x.id)===row.dataset.id); if(from>=0 && to>=0 && from!==to) { const [item]=files.splice(from,1); files.splice(to,0,item); } dragged=null; render(); });
  list.addEventListener('dragend', () => { dragged=null; render(); });
  merge.addEventListener('click', async () => {
    if (busy || files.length < 2) return;
    if (!window.PDFLib?.PDFDocument) { message.textContent='Pembuat PDF belum tersedia. Muat ulang halaman dan coba lagi.'; return; }
    busy=true; message.textContent=''; merge.textContent='Menggabungkan…'; render();
    try {
      const output=await PDFLib.PDFDocument.create();
      for (const entry of files) {
        let source;
        try { source=await PDFLib.PDFDocument.load(await entry.file.arrayBuffer()); }
        catch (error) { const locked=error?.name === 'EncryptedPDFError' || /encrypted/i.test(error?.message || ''); throw new Error(locked ? `“${entry.file.name}” terkunci. Buka atau hapus kata sandinya dulu.` : `“${entry.file.name}” tidak bisa dibaca. Periksa file PDF tersebut.`); }
        if (!source.getPageCount()) throw new Error(`“${entry.file.name}” tidak memiliki halaman.`);
        const pages=await output.copyPages(source,source.getPageIndices()); pages.forEach(page=>output.addPage(page));
      }
      const bytes=await output.save(); const url=URL.createObjectURL(new Blob([bytes],{type:'application/pdf'})); const a=document.createElement('a'); a.href=url; a.download='gabungan.pdf'; document.body.append(a); a.click(); a.remove(); setTimeout(()=>URL.revokeObjectURL(url),60000); message.textContent='PDF berhasil digabungkan dan diunduh.';
    } catch (error) { message.textContent=error.message || 'PDF belum bisa digabungkan. Coba lagi.'; }
    finally { busy=false; merge.textContent='Gabungkan PDF'; render(); }
  });
  render();
})();
