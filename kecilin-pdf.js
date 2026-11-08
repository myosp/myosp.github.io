import * as pdfjs from './assets/vendor/pdfjs/pdf.min.mjs';
pdfjs.GlobalWorkerOptions.workerSrc = './assets/vendor/pdfjs/pdf.worker.min.mjs';
const $ = selector => document.querySelector(selector);
const input = $('#file'), drop = $('#drop'), button = $('#compress'), status = $('#status'), result = $('#result');
let selected = null, resultUrl = '', busy = false;
const profiles = [{scale:1.5,quality:.85},{scale:1.25,quality:.75},{scale:1,quality:.65},{scale:.85,quality:.55},{scale:.7,quality:.45},{scale:.55,quality:.38}];
function format(bytes) { return bytes >= 1000000 ? `${(bytes/1000000).toFixed(2)} MB` : `${(bytes/1000).toFixed(1)} KB`; }
function clearResult() { result.hidden=true; if(resultUrl) URL.revokeObjectURL(resultUrl); resultUrl=''; }
function choose(file) { if (busy || !file) return; clearResult(); status.textContent=''; status.classList.remove('error'); if (!/\.pdf$/i.test(file.name) && file.type !== 'application/pdf') { selected=null; $('#size-warning').hidden=true; input.value=''; $('#file-name').textContent='Pilih atau tarik file ke sini'; $('#file-size').textContent='Format PDF'; button.disabled=true; status.textContent='Pilih file PDF, ya.'; status.classList.add('error'); return; } selected=file; $('#size-warning').hidden=file.size<=50000000; $('#file-name').textContent=file.name; $('#file-size').textContent=format(file.size); button.disabled=false; }
input.addEventListener('change',()=>choose(input.files[0]));
for(const type of ['dragenter','dragover']) drop.addEventListener(type,event=>{event.preventDefault(); if(!busy) drop.classList.add('drag-over');});
for(const type of ['dragleave','drop']) drop.addEventListener(type,event=>{event.preventDefault();drop.classList.remove('drag-over');});
drop.addEventListener('drop',event=>choose(event.dataTransfer.files[0]));
document.querySelectorAll('[name=target]').forEach(radio=>radio.addEventListener('change',()=>{clearResult();status.textContent='';}));
function canvasJpeg(canvas,quality) { return new Promise((resolve,reject)=>canvas.toBlob(blob=>blob ? resolve(blob.arrayBuffer()) : reject(new Error('Gambar halaman belum bisa dibuat.')), 'image/jpeg',quality)); }
async function makePdf(document, profile, pass) {
 const output=await PDFLib.PDFDocument.create();
 for(let number=1; number<=document.numPages; number++) {
  status.textContent=`Mencoba kompresi ${pass}/${profiles.length} · halaman ${number}/${document.numPages}…`;
  const page=await document.getPage(number), original=page.getViewport({scale:1}), viewport=page.getViewport({scale:Math.min(profile.scale, 2200/Math.max(original.width,original.height))});
  const canvas=window.document.createElement('canvas'); canvas.width=Math.max(1,Math.ceil(viewport.width)); canvas.height=Math.max(1,Math.ceil(viewport.height));
  const context=canvas.getContext('2d',{alpha:false}); if(!context) throw new Error('Perangkat belum bisa memproses halaman PDF.');
  try { context.fillStyle='#fff'; context.fillRect(0,0,canvas.width,canvas.height); await page.render({canvasContext:context,viewport,background:'#ffffff'}).promise; const image=await output.embedJpg(await canvasJpeg(canvas,profile.quality)); const newPage=output.addPage([original.width,original.height]); newPage.drawImage(image,{x:0,y:0,width:original.width,height:original.height}); }
  finally { canvas.width=0; canvas.height=0; page.cleanup(); }
 }
 return output.save();
}
button.addEventListener('click',async()=>{
 if(!selected||busy) return; clearResult(); busy=true; button.disabled=true; input.disabled=true; document.querySelectorAll('[name=target]').forEach(el=>el.disabled=true); status.classList.remove('error'); status.textContent='Membaca PDF…';
 let task;
 try {
  if (!window.PDFLib?.PDFDocument) throw new Error('Pembuat PDF belum tersedia. Muat ulang halaman dan coba lagi.');
  const file=selected, target=Number(document.querySelector('[name=target]:checked').value), original=new Uint8Array(await file.arrayBuffer());
  task=pdfjs.getDocument({data:original.slice(), cMapUrl:'./assets/vendor/pdfjs/cmaps/', cMapPacked:true, standardFontDataUrl:'./assets/vendor/pdfjs/standard_fonts/', wasmUrl:'./assets/vendor/pdfjs/wasm/'});
  const pdfDocument=await task.promise; if(!pdfDocument.numPages) throw new Error('PDF tidak memiliki halaman.');
  let best=original, rasterized=false;
  if(original.length >= target) { for(let i=0;i<profiles.length;i++) { const candidate=await makePdf(pdfDocument,profiles[i],i+1); if(candidate.length < best.length) {best=candidate;rasterized=true;} if(best.length < target) break; } }
  const achieved=best.length < target; resultUrl=URL.createObjectURL(new Blob([best],{type:'application/pdf'})); $('#view').href=resultUrl; $('#download').href=resultUrl;
  $('#result-size').textContent=`Ukuran awal ${format(original.length)} → hasil ${format(best.length)}.`;
  $('#result-note').textContent=original.length < target ? 'File awal sudah memenuhi target, jadi tidak perlu dikompresi.' : achieved ? 'Target tercapai. Buka hasil dan periksa keterbacaannya.' : 'Target belum tercapai. Ini hasil terkecil yang bisa dibuat; periksa keterbacaannya.';
  if(rasterized) $('#result-note').textContent+=' Halaman diubah menjadi gambar; teks tidak bisa dicari atau disalin.';
  else if(original.length >= target) $('#result-note').textContent+=' File asli dipertahankan karena hasil kompresi tidak lebih kecil.';
  result.hidden=false; status.textContent='Selesai.';
 } catch(error) { status.classList.add('error'); status.textContent=error?.name==='PasswordException' ? 'PDF terkunci. Buka atau hapus kata sandinya dulu.' : error?.name==='InvalidPDFException' ? 'File PDF tidak bisa dibaca. Periksa file dan coba lagi.' : (error?.message || 'PDF belum bisa diproses. Periksa file dan coba lagi.'); }
 finally { if(task) await task.destroy(); busy=false; input.disabled=false; button.disabled=!selected; document.querySelectorAll('[name=target]').forEach(el=>el.disabled=false); }
});
