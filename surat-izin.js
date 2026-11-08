'use strict';
(() => {
  const $ = s => document.querySelector(s);
  const form = $('#form'), fields = $('#form-fields'), team = $('#team'), memberInput = $('#anggota'), applicantInput = $('#pemohon');
  const start = $('#mulai'), end = $('#selesai'), reason = $('#keperluan'), preview = $('#preview');
  const supervisor = { name: 'Ir. Mutmainnah, S.T., M.T.', nip: '198805112018012001' };
  let people = [], applicant = null, members = [], assets = null, previewUrl = '', timer;
  const clean = value => value.trim().replace(/\s+/g, ' ');
  const normalize = value => value.normalize('NFKD').replace(/[\u0300-\u036f]/g, '').toLocaleLowerCase('id').replace(/[^\p{L}\p{N}]+/gu, ' ').trim();
  function today() { const parts = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Makassar', year: 'numeric', month: '2-digit', day: '2-digit' }).formatToParts(new Date()); const v = Object.fromEntries(parts.map(p => [p.type, p.value])); return `${v.year}-${v.month}-${v.day}`; }
  function date(value, weekday = false) { if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return ''; const d = new Date(`${value}T12:00:00Z`); if (Number.isNaN(d.getTime())) return ''; const s = new Intl.DateTimeFormat('id-ID', { ...(weekday ? {weekday:'long'} : {}), day:'numeric', month:'long', year:'numeric', timeZone:'UTC' }).format(d); return s[0].toLocaleUpperCase('id') + s.slice(1); }
  function base64(buffer) { const bytes = new Uint8Array(buffer); let result = ''; for (let i = 0; i < bytes.length; i += 32768) result += String.fromCharCode(...bytes.subarray(i, i + 32768)); return btoa(result); }
  function model() { return { applicant, members: team.checked ? members : [], kind: form.elements.jenis.value, date: date($('#tanggal').value, true), start: start.value, end: end.value, reason: clean(reason.value), created: date($('#dibuat').value) }; }
  function pdf(data) {
    const doc = new window.jspdf.jsPDF({unit:'mm', format:'a4', compress:true, putOnlyUsedFonts:true});
    doc.addFileToVFS('Regular.ttf', base64(assets[0])); doc.addFont('Regular.ttf', 'LetterSans', 'normal');
    doc.addFileToVFS('Bold.ttf', base64(assets[1])); doc.addFont('Bold.ttf', 'LetterSans', 'bold');
    doc.addImage(new Uint8Array(assets[2]), 'PNG', 7, 8, 196, 196 * 203 / 1584);
    doc.setFont('LetterSans', 'bold'); doc.setFontSize(13); doc.text('FORMULIR IZIN', 105, 46, {align:'center'});
    doc.setFont('LetterSans', 'normal'); doc.setFontSize(10.5); doc.text('Untuk keperluan:', 105, 56, {align:'center'});
    ['Dinas Luar','Tugas Luar','Pribadi'].forEach((label,i) => { const x = 40 + i * 49; doc.rect(x, 61, 4, 4); if(data.kind === label) { doc.line(x+.7,63,x+1.7,64); doc.line(x+1.7,64,x+3.6,61.7); } doc.text(label, x+6, 64.5); });
    let y = 76;
    function space(height) { if (y + height > 278) { doc.addPage(); y = 20; } }
    function text(value, x = 29, width = 150) { const lines = doc.splitTextToSize(value, width); space(lines.length * 4.7 + 2); doc.text(lines, x, y, {lineHeightFactor:1.3}); y += lines.length * 4.7 + 2; }
    function row(label,value) { const lines = doc.splitTextToSize(value || '—', 111); space(lines.length * 4.7 + 2); doc.text(label, 36, y); doc.text(':', 68, y); doc.text(lines, 71, y, {lineHeightFactor:1.3}); y += Math.max(7, lines.length * 4.7 + 2); }
    text('Yang bertanda tangan di bawah ini:');
    row('Nama', data.applicant?.name || 'Nama pemohon'); row('NIP', data.applicant?.nip || '—'); row('Jabatan', data.applicant?.role ? `${data.applicant.role} Otomasi Sistem Permesinan` : '—');
    if (data.members.length) { y += 2; text('Bersama anggota tim:'); data.members.forEach((person,i) => { space(15); text(`${i+1}. ${person.name}`, 36, 140); text(`NIP. ${person.nip} · ${person.role}`, 41, 135); }); }
    y += 2; text('Mengajukan permohonan izin meninggalkan kantor pada jam kerja:');
    row('Hari/Tanggal', data.date || 'Tanggal izin'); row('Jam', data.start && data.end ? `${data.start} - ${data.end}` : 'Jam keluar - kembali'); row('Keperluan', data.reason || 'Keperluan izin');
    space(68); y += 3; doc.text(`Makassar, ${data.created || 'Tanggal dibuat'}`, 181, y, {align:'right'}); y += 8;
    doc.text(['Mengetahui,','Atasan Langsung'], 65, y, {align:'center',lineHeightFactor:1.3}); doc.text('Pemohon,', 151, y, {align:'center'}); y += 29;
    function signature(name, nip, x) { doc.setFont('LetterSans','bold'); let size = 10.5; doc.setFontSize(size); while(doc.getTextWidth(name) > 74 && size > 7) doc.setFontSize(size -= .25); doc.text(name,x,y,{align:'center'}); const w = doc.getTextWidth(name); doc.line(x-w/2,y+0.7,x+w/2,y+0.7); doc.setFont('LetterSans','normal'); doc.setFontSize(10); doc.text(`NIP. ${nip}`,x,y+5,{align:'center'}); }
    signature(supervisor.name,supervisor.nip,65); signature(data.applicant?.name || 'Nama pemohon',data.applicant?.nip || '—',151);
    y += 16; space(14); doc.setFontSize(9.5); text('Catatan: Permohonan izin berlaku apabila disetujui oleh atasan langsung.');
    return doc;
  }
  function update() {
    $('#team-fields').hidden = !team.checked;
    $('#member-error').hidden = !team.checked || members.length > 0;
    const badTime = !!(start.value && end.value && end.value <= start.value);
    end.setCustomValidity(badTime ? 'Jam kembali harus setelah jam keluar pada hari yang sama.' : ''); $('#time-error').hidden = !badTime;
    reason.setCustomValidity(reason.value && !clean(reason.value) ? 'Isi keperluan izin.' : '');
    $('#tanggal-day').textContent = date($('#tanggal').value, true); $('#dibuat-day').textContent = date($('#dibuat').value, true);
    const list = $('#members'); list.replaceChildren(); members.forEach(person => { const li = document.createElement('li'), name = document.createElement('span'), remove = document.createElement('button'); name.textContent = person.name; remove.type='button'; remove.textContent='×'; remove.setAttribute('aria-label', `Hapus ${person.name}`); remove.addEventListener('click', () => { members = members.filter(p => p.nip !== person.nip); update(); }); li.append(name,remove); list.append(li); });
    if (!assets || !window.jspdf) return;
    clearTimeout(timer); timer = setTimeout(() => { try { const url = URL.createObjectURL(pdf(model()).output('blob')); preview.src = `${url}#toolbar=0&navpanes=0&view=FitH`; const old = previewUrl; previewUrl = url; if (old) setTimeout(() => URL.revokeObjectURL(old), 1000); } catch (error) { console.error(error); } }, 200);
  }
  function picker(input, box, isMember) {
    const menu = box.querySelector('.person-menu'), list = menu.querySelector('ul'), message = menu.querySelector('p'); let matches = [], active = -1;
    function close() { menu.hidden = true; input.setAttribute('aria-expanded','false'); input.removeAttribute('aria-activedescendant'); active=-1; }
    function paint() { [...list.children].forEach((item,i) => item.setAttribute('aria-selected', String(i === active))); if(active >= 0) input.setAttribute('aria-activedescendant', list.children[active].id); else input.removeAttribute('aria-activedescendant'); }
    function render() { const terms = normalize(input.value).split(/\s+/).filter(Boolean); matches = people.filter(p => (!isMember || (p.nip !== applicant?.nip && !members.some(m => m.nip === p.nip))) && (!(!isMember && members.some(m => m.nip === p.nip))) && terms.every(t => normalize(`${p.name} ${p.nip}`).includes(t))).slice(0,5); list.replaceChildren(); matches.forEach((p,i) => { const li=document.createElement('li'); li.id=`${input.id}-option-${i}`; li.setAttribute('role','option'); li.textContent=p.name; li.addEventListener('pointerdown', e => e.preventDefault()); li.addEventListener('click', () => choose(p)); list.append(li); }); message.textContent = matches.length ? '' : 'Nama tidak ditemukan. Coba kata kunci lain.'; message.hidden = !!matches.length; active=terms.length && matches.length ? 0 : -1; menu.hidden=false; input.setAttribute('aria-expanded','true'); paint(); }
    function choose(person) { if (!person) return; if (isMember) { members.push(person); input.value=''; } else { applicant=person; input.value=person.name; input.setCustomValidity(''); } close(); update(); input.focus(); }
    input.addEventListener('focus',render); input.addEventListener('input',() => { if(!isMember) { applicant=null; input.setCustomValidity(input.value ? 'Pilih nama dari daftar.' : ''); update(); } render(); });
    input.addEventListener('keydown', e => { if(e.key==='ArrowDown'||e.key==='ArrowUp') { e.preventDefault(); if(menu.hidden) render(); if(matches.length) { active = active < 0 ? 0 : (active + (e.key==='ArrowDown'?1:-1) + matches.length)%matches.length; paint(); } } else if(e.key==='Enter'&&!menu.hidden) { e.preventDefault(); if(active>=0) choose(matches[active]); } else if(e.key==='Escape') close(); else if(e.key==='Tab') close(); });
    document.addEventListener('pointerdown',e => { if(!box.contains(e.target)) close(); });
  }
  function ready() { update(); if (!form.reportValidity()) return false; if(team.checked && !members.length) { $('#member-error').hidden=false; memberInput.focus(); return false; } return true; }
  function notify(message) { const el=$('#toast'); el.textContent=message; el.classList.add('visible'); setTimeout(() => el.classList.remove('visible'),4000); }
  async function load() { fields.disabled=true; $('#load-error').hidden=true; try { const paths=['assets/data/dosen.json','assets/data/plp.json','assets/fonts/LiberationSans-Regular.ttf','assets/fonts/LiberationSans-Bold.ttf','assets/kop-poltek-atim.png']; const responses=await Promise.all(paths.map(p=>fetch(p))); if(responses.some(r=>!r.ok)||!window.jspdf?.jsPDF) throw Error(); const [dosen,plp]=await Promise.all(responses.slice(0,2).map(r=>r.json())); assets=await Promise.all(responses.slice(2).map(r=>r.arrayBuffer())); people=[...dosen.map(p=>({...p,role:'Dosen'})),...plp.map(p=>({...p,role:'PLP'}))].sort((a,b)=>a.name.localeCompare(b.name,'id')); const boss=people.find(p=>p.nip===supervisor.nip); if(!boss) throw Error(); supervisor.name=boss.name; fields.disabled=false; update(); } catch(e) { $('#load-error').hidden=false; } }
  picker(applicantInput,$('#pemohon-box'),false); picker(memberInput,$('#anggota-box'),true);
  form.addEventListener('input',update); form.addEventListener('change',update);
  document.querySelectorAll('[data-today]').forEach(button=>button.addEventListener('click',()=> { const input=document.getElementById(button.dataset.today); input.value=today(); update(); input.focus(); }));
  $('#retry').addEventListener('click',load);
  form.addEventListener('submit',e=> { e.preventDefault(); if(!ready()) return; try { pdf(model()).save(`surat-izin-${$('#tanggal').value}.pdf`); notify('PDF berhasil dibuat.'); } catch { notify('PDF belum bisa dibuat. Coba lagi.'); } });
  $('#print').addEventListener('click',()=> { if(!ready()) return; try { const doc=pdf(model()); doc.autoPrint(); const url=URL.createObjectURL(doc.output('blob')); const win=window.open(url,'_blank'); if(!win) { URL.revokeObjectURL(url); notify('Izinkan pop-up untuk mencetak, atau unduh PDF.'); } else setTimeout(()=>URL.revokeObjectURL(url),60000); } catch { notify('Surat belum bisa dicetak. Coba unduh PDF.'); } });
  $('#dibuat').value=today(); load();
})();
