'use strict';
(() => {
  const header = document.querySelector('.header');
  if (!header) return;
  let lastY = Math.max(0, window.scrollY), anchor = lastY, ticking = false;
  function update() {
    const y = Math.max(0, window.scrollY);
    const delta = y - lastY;
    if ((delta > 0 && y < anchor) || (delta < 0 && y > anchor)) anchor = lastY;
    if (y <= header.offsetHeight) {
      header.classList.remove('header-hidden');
      anchor = y;
    } else if (y - anchor >= 12 && !header.contains(document.activeElement)) {
      header.classList.add('header-hidden');
      anchor = y;
    } else if (anchor - y >= 12) {
      header.classList.remove('header-hidden');
      anchor = y;
    }
    lastY = y;
    ticking = false;
  }
  window.addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(update); } }, { passive: true });
  header.addEventListener('focusin', () => header.classList.remove('header-hidden'));
})();
