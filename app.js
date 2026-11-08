'use strict';
const paths = {
 arrow: '<path d="M5 19 19 5M5 5h14v14"/>',
 document: '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6M8 12h8M8 16h5"/>',
 calendar: '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M16 3v4M8 3v4M3 11h18M8 15h2M14 15h2M8 18h2"/>',
 qr: '<rect x="3" y="3" width="6" height="6" rx="1"/><rect x="15" y="3" width="6" height="6" rx="1"/><rect x="3" y="15" width="6" height="6" rx="1"/><path d="M15 15h3v3h3v3h-6v-3M21 12v3M12 3v3M3 12h3M12 12h3M12 18v3"/>',
 search:'<circle cx="10.5" cy="10.5" r="6.5"/><path d="m16 16 4.5 4.5"/>',
 star:'<path d="m12 3 2.8 5.7 6.2.9-4.5 4.4 1.1 6.2-5.6-3-5.6 3 1.1-6.2L3 9.6l6.2-.9z"/>',
 link:'<path d="m10 13 4-4M8 16l-1 1a4 4 0 0 1-6-6l4-4a4 4 0 0 1 6 0M16 8l1-1a4 4 0 0 1 6 6l-4 4a4 4 0 0 1-6 0" transform="translate(1 0) scale(.9)"/>',
 sun:'<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M2 12h2M20 12h2M5 5l1.5 1.5M17.5 17.5 19 19M5 19l1.5-1.5M17.5 6.5 19 5"/>'
};
const icon = name => `<svg viewBox="0 0 24 24" aria-hidden="true">${paths[name] || paths.document}</svg>`;
const tools = [
 {id:'surat-izin',name:'Surat Izin',category:'administrasi',icon:'document',tone:'peach',description:'Penyusunan surat izin sesuai format administrasi.',detail:'Aplikasi yang direncanakan untuk membantu penyusunan surat izin bagi dosen dan tenaga kependidikan. Format, isian, dan keluaran dokumen masih dalam tahap perencanaan.'},
 {id:'surat-cuti',name:'Surat Cuti',category:'administrasi',icon:'calendar',tone:'sage',description:'Penyusunan surat cuti bagi dosen dan tenaga kependidikan.',detail:'Aplikasi yang direncanakan untuk membantu penyusunan surat cuti. Jenis cuti, format surat, dan isian dokumen masih dalam tahap perencanaan.'},
 {id:'qr-generator',name:'QR Code Generator',href:'qr-generator.html',category:'utilitas',icon:'qr',tone:'lavender',description:'Pembuatan kode QR dari tautan untuk berbagi informasi.',detail:'Utilitas yang direncanakan untuk menghasilkan kode QR dari tautan. Format unduhan dan pengaturan kode QR masih dalam tahap perencanaan.'}
];
const storage = { get(key,fallback){try{return JSON.parse(localStorage.getItem(key)) ?? fallback;}catch{return fallback;}},set(key,value){try{localStorage.setItem(key,JSON.stringify(value));return true;}catch{return false;}}};
let favorites = storage.get('osp-favorites',[]);
if(!Array.isArray(favorites)) favorites=[];
favorites = favorites.filter(id=>tools.some(tool=>tool.id===id));
let filter='all';
const search=document.querySelector('#tool-search');
const grid=document.querySelector('#tool-grid');
const dialog=document.querySelector('#detail-dialog');
let toastTimer;
function toast(message){const el=document.querySelector('#toast');el.textContent=message;el.classList.add('visible');clearTimeout(toastTimer);toastTimer=setTimeout(()=>el.classList.remove('visible'),3000);}
function render(){
 const query=search.value.trim().toLocaleLowerCase('id');
 const shown=tools.filter(t=>(filter==='all'||(filter==='favorites'?favorites.includes(t.id):t.category===filter))&&`${t.name} ${t.category} ${t.description}`.toLocaleLowerCase('id').includes(query));
 grid.innerHTML=shown.map((t,i)=>`<article class="tool-card ${t.tone}" style="--i:${i}"><${t.href?'a':'button'} class="tool-open" ${t.href?`href="${t.href}"`:`data-open="${t.id}"`} aria-label="${t.href?'Buka':'Lihat rencana'} ${t.name}"><div class="card-top"><span class="tool-icon">${icon(t.icon)}</span><span class="category-label">${t.category}</span></div><h3>${t.name}</h3><p>${t.description}</p><div class="card-bottom"><span class="coming-badge ${t.href?'available-badge':''}">${t.href?'Tersedia':'Segera hadir'}</span><span class="card-arrow" aria-hidden="true">${icon('arrow')}</span></div></${t.href?'a':'button'}><button class="favorite-button" data-favorite="${t.id}" aria-label="Favorit ${t.name}" aria-pressed="${favorites.includes(t.id)}" title="Simpan sebagai favorit">${icon('star')}</button></article>`).join('');
 document.querySelector('#result-count').textContent=`${shown.length} aplikasi · ${shown.filter(t=>t.href).length} tersedia`;
 const empty=document.querySelector('#empty-state');empty.hidden=shown.length>0;
 empty.querySelector('h3').textContent=filter==='favorites'&&!query?'Belum ada aplikasi favorit.':'Tidak ada aplikasi yang sesuai.';
 empty.querySelector('p').textContent=filter==='favorites'&&!query?'Pilih ikon bintang pada aplikasi untuk menyimpannya sebagai favorit di perangkat ini.':'Gunakan kata kunci lain atau pilih kategori yang berbeda.';
 document.querySelectorAll('[data-filter]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.filter===filter)));
}
function openDialog({label,title,description,note,iconName}){
 document.querySelector('#dialog-label').textContent=label;
 document.querySelector('#dialog-title').textContent=title;
 document.querySelector('#dialog-description').textContent=description;
 document.querySelector('#dialog-note').textContent=note;
 document.querySelector('#dialog-icon').innerHTML=icon(iconName);
 dialog.showModal();
}
document.querySelector('#search-icon').innerHTML=icon('search');
document.querySelector('#link-icon').innerHTML=icon('link');
document.querySelectorAll('[data-art-icon]').forEach(el=>el.innerHTML=icon(el.dataset.artIcon));
search.addEventListener('input',render);
document.querySelectorAll('[data-filter]').forEach(b=>b.addEventListener('click',()=>{filter=b.dataset.filter;render();}));
document.querySelector('#reset-filters').addEventListener('click',()=>{filter='all';search.value='';render();search.focus();});
grid.addEventListener('click',e=>{
 const favorite=e.target.closest('[data-favorite]');
 if(favorite){const id=favorite.dataset.favorite;const added=!favorites.includes(id);favorites=added?[...favorites,id]:favorites.filter(x=>x!==id);const persisted=storage.set('osp-favorites',favorites);render();document.querySelector(`[data-favorite="${id}"]`)?.focus({preventScroll:true});toast(persisted?(added?'Ditambahkan ke favorit di perangkat ini.':'Dihapus dari favorit.'):'Favorit diubah untuk sesi ini; penyimpanan browser tidak tersedia.');return;}
 const opener=e.target.closest('[data-open]');if(!opener)return;
 const tool=tools.find(t=>t.id===opener.dataset.open);
 openDialog({label:'DALAM RENCANA · SEGERA HADIR',title:tool.name,description:tool.detail,note:'Aplikasi ini belum dapat digunakan. Fitur akan tersedia setelah proses pengembangan dan pengujian selesai.',iconName:tool.icon});
});
document.querySelectorAll('[data-about]').forEach(button=>button.addEventListener('click',()=>openDialog({label:'INFORMASI APLIKASI',title:'Tentang MyOSP',description:'MyOSP merupakan portal aplikasi dan utilitas pendukung administrasi bagi dosen dan tenaga kependidikan D3 Otomasi Sistem Permesinan, Politeknik ATI Makassar.',note:'Akses tidak memerlukan akun. Daftar favorit disimpan pada peramban di perangkat pengguna. MyOSP tidak berafiliasi dengan Anthropic.',iconName:'sun'})));
document.querySelector('#close-dialog').addEventListener('click',()=>dialog.close());
document.querySelector('#dialog-done').addEventListener('click',()=>dialog.close());
dialog.addEventListener('click',e=>{if(e.target===dialog){const r=dialog.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)dialog.close();}});
document.addEventListener('keydown',e=>{const editing=e.target.closest('input,textarea,select,[contenteditable="true"]');if(!dialog.open&&!editing&&(e.key==='/'||((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='k'))){e.preventDefault();search.focus();search.scrollIntoView({block:'center'});}if(e.key==='Escape'&&document.activeElement===search){search.value='';render();search.blur();}});
render();
if('IntersectionObserver' in window&&!matchMedia('(prefers-reduced-motion: reduce)').matches){const observer=new IntersectionObserver(entries=>{entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add('revealed');observer.unobserve(entry.target);}});},{threshold:.08});document.querySelectorAll('.links-section').forEach(el=>{el.classList.add('reveal-ready');observer.observe(el);});}
// Render the asterisk as vector artwork instead of platform-dependent emoji.
const asterisk = `<svg viewBox="0 0 32 32" aria-hidden="true">${Array.from({length:6},(_,i)=>`<path d="M16 3v26" transform="rotate(${i*30} 16 16)"/>`).join('')}</svg>`;
document.querySelectorAll('.tiny-star,.wip-icon,.star-one,.footer-brand>span,.paper-logo').forEach(el=>{el.innerHTML=asterisk;});

// SVG arrows stay legible even when the device lacks the Unicode glyph.
document.querySelectorAll('span').forEach(el=>{if(el.textContent.trim()==='↗'){el.innerHTML=icon('arrow');}});
