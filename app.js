'use strict';
const paths = {
 people: '<circle cx="9" cy="8" r="3"/><path d="M3 21v-2a6 6 0 0 1 12 0v2M16 5a3 3 0 0 1 0 6M18 15a5 5 0 0 1 3 4v2"/>',
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
 {id:'surat-izin',name:'Surat Izin',category:'administrasi',icon:'document',tone:'peach',description:'Bikin surat izin tanpa ribet.',detail:'Buat surat izin dengan format yang akan disesuaikan untuk kebutuhan OSP.'},
 {id:'surat-cuti',name:'Surat Cuti',href:'surat-cuti.html',category:'administrasi',icon:'calendar',tone:'sage',description:'Isi data, unduh PDF, atau langsung cetak.'},
 {id:'qr-generator',name:'QR Code Generator',href:'qr-generator.html',category:'utilitas',icon:'qr',tone:'lavender',description:'Ubah link jadi kode QR, lalu unduh.',detail:'Utilitas yang direncanakan untuk menghasilkan kode QR dari tautan. Format unduhan dan pengaturan kode QR masih dalam tahap perencanaan.'},
 {id:'data-dosen',name:'Data Dosen OSP',href:'dosen.html',category:'informasi',icon:'people',tone:'sage',description:'Copy data dosen langsung, biar nggak typo.'},
 {id:'data-plp',name:'Data PLP OSP',href:'plp.html',category:'informasi',icon:'people',tone:'sage',description:'Copy nama, NIP, dan email PLP OSP.'}
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
 const shown=tools.filter(t=>(filter==='all'||(filter==='favorites'?favorites.includes(t.id):t.category===filter))&&`${t.name} ${t.category} ${t.description}`.toLocaleLowerCase('id').includes(query)).sort((a,b)=>a.name.localeCompare(b.name,'id',{sensitivity:'base',numeric:true}));
 grid.innerHTML=shown.map((t,i)=>`<article class="tool-card ${t.tone}" style="--i:${i}"><${t.href?'a':'button'} class="tool-open" ${t.href?`href="${t.href}"${t.external?' target="_blank" rel="noopener noreferrer"':''}`:`data-open="${t.id}"`} aria-label="${t.href?'Buka':'Lihat rencana'} ${t.name}${t.external?' (buka di tab baru)':''}"><div class="card-top"><span class="tool-icon">${icon(t.icon)}</span><span class="category-label">${t.category==='utilitas'?'Tools':t.category==='informasi'?'Data & Info':t.category==='tautan'?'Link Penting':t.category}</span></div><h3>${t.name}${t.external?` <span class="external-indicator" aria-hidden="true">${icon('arrow')}</span>`:''}</h3><p>${t.description}</p></${t.href?'a':'button'}><button class="favorite-button" data-favorite="${t.id}" aria-label="Favorit ${t.name}" aria-pressed="${favorites.includes(t.id)}" title="Simpan sebagai favorit">${icon('star')}</button></article>`).join('');
 document.querySelector('#result-count').textContent=`${shown.length} pilihan`;
 const empty=document.querySelector('#empty-state');empty.hidden=shown.length>0;
 empty.querySelector('h3').textContent=filter==='favorites'&&!query?'Belum ada favorit.':filter==='tautan'&&!query?'Belum ada link penting.':'Belum ketemu nih.';
 empty.querySelector('p').textContent=filter==='favorites'&&!query?'Tekan ikon bintang untuk menyimpan favorit.':filter==='tautan'&&!query?'Link penting akan ditambahkan di sini.':'Coba kata kunci atau kategori lain.';
 document.querySelectorAll('[data-filter]').forEach(b=>{b.setAttribute('aria-pressed',String(b.dataset.filter===filter));const badge=b.querySelector('span:not(.filter-star)');if(badge)badge.textContent=String(b.dataset.filter==='all'?tools.length:tools.filter(t=>t.category===b.dataset.filter).length);});
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
search.addEventListener('input',render);
document.querySelectorAll('[data-filter]').forEach(b=>b.addEventListener('click',()=>{filter=b.dataset.filter;render();}));
document.querySelector('#reset-filters').addEventListener('click',()=>{filter='all';search.value='';render();search.focus();});
grid.addEventListener('click',e=>{
 const favorite=e.target.closest('[data-favorite]');
 if(favorite){const id=favorite.dataset.favorite;const added=!favorites.includes(id);favorites=added?[...favorites,id]:favorites.filter(x=>x!==id);const persisted=storage.set('osp-favorites',favorites);render();document.querySelector(`[data-favorite="${id}"]`)?.focus({preventScroll:true});toast(persisted?(added?'Ditambahkan ke favorit di perangkat ini.':'Dihapus dari favorit.'):'Favorit diubah untuk sesi ini; penyimpanan browser tidak tersedia.');return;}
 const opener=e.target.closest('[data-open]');if(!opener)return;
 const tool=tools.find(t=>t.id===opener.dataset.open);
 openDialog({label:'DALAM RENCANA · SEGERA HADIR',title:tool.name,description:tool.detail,note:'Masih disiapkan, ya.',iconName:tool.icon});
});
document.querySelectorAll('[data-about]').forEach(button=>button.addEventListener('click',()=>openDialog({label:'TENTANG MYOSP',title:'Tentang myOSP',description:'myOSP adalah tempat kumpul tools dan informasi untuk dosen dan tendik D3 Otomasi Sistem Permesinan, Politeknik ATI Makassar.',note:'Nggak perlu login. Favorit tersimpan di browser perangkat ini.',iconName:'sun'})));
document.querySelector('#close-dialog').addEventListener('click',()=>dialog.close());
document.querySelector('#dialog-done').addEventListener('click',()=>dialog.close());
dialog.addEventListener('click',e=>{if(e.target===dialog){const r=dialog.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)dialog.close();}});
document.addEventListener('keydown',e=>{const editing=e.target.closest('input,textarea,select,[contenteditable="true"]');if(!dialog.open&&!editing&&(e.key==='/'||((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='k'))){e.preventDefault();search.focus();search.scrollIntoView({block:'center'});}if(e.key==='Escape'&&document.activeElement===search){search.value='';render();search.blur();}});
render();

// SVG arrows stay legible even when the device lacks the Unicode glyph.
document.querySelectorAll('span').forEach(el=>{if(el.textContent.trim()==='↗'){el.innerHTML=icon('arrow');}});

// Keep the animated heading readable for assistive technology and reduced-motion users.
(() => {
 const display=document.querySelector('[data-typewriter]');
 if(!display)return;
 const words=['Sat-Set','Aura Farming','Slay'];
 const motion=window.matchMedia('(prefers-reduced-motion: reduce)');
 let index=0,letters=words[0].length,deleting=true,timer;
 function step(){
  if(motion.matches||document.hidden)return;
  const current=words[index];
  if(deleting){
   letters--;
   display.textContent=current.slice(0,letters);
   if(letters===0){index=(index+1)%words.length;deleting=false;timer=setTimeout(step,300);}
   else timer=setTimeout(step,65);
  }else{
   letters++;
   display.textContent=words[index].slice(0,letters);
   if(letters===words[index].length){deleting=true;timer=setTimeout(step,2400);}
   else timer=setTimeout(step,110);
  }
 }
 function reset(){clearTimeout(timer);index=0;letters=words[0].length;deleting=true;display.textContent=words[0];if(!motion.matches&&!document.hidden)timer=setTimeout(step,2600);}
 if(motion.addEventListener)motion.addEventListener('change',reset);else motion.addListener(reset);
 document.addEventListener('visibilitychange',reset);
 reset();
})();

// Move the illustration slightly slower than the page during scrolling.
(() => {
 const illustration=document.querySelector('.home-illustration');
 if(!illustration)return;
 const motion=window.matchMedia('(prefers-reduced-motion: reduce)');
 let frame=0;
 function paint(){frame=0;if(motion.matches){illustration.style.removeProperty('--hero-parallax');return;}illustration.style.setProperty('--hero-parallax',`${Math.min(window.scrollY*.06,18).toFixed(1)}px`);}
 function schedule(){if(!frame)frame=requestAnimationFrame(paint);}
 window.addEventListener('scroll',schedule,{passive:true});
 if(motion.addEventListener)motion.addEventListener('change',schedule);else motion.addListener(schedule);
 schedule();
})();
