/* ============================================================
   CYBERPUNK PORTFOLIO — интерактив
   ============================================================ */
(function () {
  'use strict';

  /* ---------- Шапка при скролле ---------- */
  const header = document.getElementById('header');
  const onScroll = () => header.classList.toggle('is-scrolled', window.scrollY > 40);
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---------- Мобильное меню ---------- */
  const burger = document.getElementById('burger');
  const nav = document.getElementById('nav');
  burger.addEventListener('click', () => {
    const open = nav.classList.toggle('is-open');
    burger.classList.toggle('is-open', open);
    document.body.style.overflow = open ? 'hidden' : '';
  });
  nav.querySelectorAll('a').forEach((a) =>
    a.addEventListener('click', () => {
      nav.classList.remove('is-open');
      burger.classList.remove('is-open');
      document.body.style.overflow = '';
    })
  );

  /* ---------- Появление блоков при скролле ---------- */
  const revealEls = document.querySelectorAll('.reveal');
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          e.target.classList.add('is-visible');
          io.unobserve(e.target);
        }
      });
    },
    { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
  );
  revealEls.forEach((el) => io.observe(el));

  /* ---------- Счётчики в hero ---------- */
  const counters = document.querySelectorAll('[data-count]');
  const animateCount = (el) => {
    const target = +el.dataset.count;
    const duration = 1600;
    const start = performance.now();
    const tick = (now) => {
      const p = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(target * eased);
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  };
  const cio = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting) {
        animateCount(e.target);
        cio.unobserve(e.target);
      }
    });
  });
  counters.forEach((c) => cio.observe(c));

  /* ---------- Свечение за курсором ---------- */
  const glow = document.getElementById('cursorGlow');
  if (glow && window.matchMedia('(hover: hover)').matches) {
    let gx = window.innerWidth / 2, gy = window.innerHeight / 2, tx = gx, ty = gy;
    window.addEventListener('mousemove', (e) => { tx = e.clientX; ty = e.clientY; }, { passive: true });
    const loop = () => {
      gx += (tx - gx) * 0.12;
      gy += (ty - gy) * 0.12;
      glow.style.transform = `translate(${gx - 150}px, ${gy - 150}px)`;
      requestAnimationFrame(loop);
    };
    loop();
  }

  /* ---------- Частицы на canvas ---------- */
  const canvas = document.getElementById('particles');
  if (canvas && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    const ctx = canvas.getContext('2d');
    let w, h, particles = [];
    const COLORS = ['0,240,255', '255,0,229', '138,43,226'];

    const resize = () => {
      w = canvas.width = window.innerWidth;
      h = canvas.height = window.innerHeight;
      const count = Math.min(90, Math.floor((w * h) / 18000));
      particles = Array.from({ length: count }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        r: Math.random() * 1.6 + 0.4,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3,
        c: COLORS[Math.floor(Math.random() * COLORS.length)],
        a: Math.random() * 0.5 + 0.2,
      }));
    };
    window.addEventListener('resize', resize);
    resize();

    const draw = () => {
      ctx.clearRect(0, 0, w, h);
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0) p.x = w; if (p.x > w) p.x = 0;
        if (p.y < 0) p.y = h; if (p.y > h) p.y = 0;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${p.c},${p.a})`;
        ctx.shadowBlur = 8;
        ctx.shadowColor = `rgba(${p.c},0.8)`;
        ctx.fill();

        // линии между близкими частицами
        for (let j = i + 1; j < particles.length; j++) {
          const q = particles[j];
          const dx = p.x - q.x, dy = p.y - q.y;
          const d = dx * dx + dy * dy;
          if (d < 130 * 130) {
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(q.x, q.y);
            ctx.strokeStyle = `rgba(${p.c},${(1 - Math.sqrt(d) / 130) * 0.15})`;
            ctx.lineWidth = 0.6;
            ctx.shadowBlur = 0;
            ctx.stroke();
          }
        }
      }
      requestAnimationFrame(draw);
    };
    draw();
  }

  /* ---------- Лайтбокс ---------- */
  const works = Array.from(document.querySelectorAll('.work'));
  const lb = document.getElementById('lightbox');
  const lbImg = document.getElementById('lightboxImg');
  const lbTitle = document.getElementById('lightboxTitle');
  const lbDesc = document.getElementById('lightboxDesc');
  let current = 0;

  const openLb = (i) => {
    const w = works[i];
    const img = w.querySelector('img');
    if (w.querySelector('.work__img').classList.contains('is-fallback')) return; // нет картинки — не открываем
    current = i;
    lbImg.src = img.src;
    lbImg.alt = img.alt;
    lbTitle.textContent = w.dataset.title || '';
    lbDesc.textContent = w.dataset.desc || '';
    lb.classList.add('is-open');
    lb.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  };
  const closeLb = () => {
    lb.classList.remove('is-open');
    lb.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  };
  const stepLb = (dir) => {
    let next = current;
    for (let k = 0; k < works.length; k++) {
      next = (next + dir + works.length) % works.length;
      if (!works[next].querySelector('.work__img').classList.contains('is-fallback')) break;
    }
    openLb(next);
  };

  works.forEach((w, i) => w.addEventListener('click', () => openLb(i)));
  document.getElementById('lightboxClose').addEventListener('click', closeLb);
  document.getElementById('lightboxPrev').addEventListener('click', (e) => { e.stopPropagation(); stepLb(-1); });
  document.getElementById('lightboxNext').addEventListener('click', (e) => { e.stopPropagation(); stepLb(1); });
  lb.addEventListener('click', (e) => { if (e.target === lb) closeLb(); });
  document.addEventListener('keydown', (e) => {
    if (!lb.classList.contains('is-open')) return;
    if (e.key === 'Escape') closeLb();
    if (e.key === 'ArrowLeft') stepLb(-1);
    if (e.key === 'ArrowRight') stepLb(1);
  });

  /* ---------- Год в футере ---------- */
  document.getElementById('year').textContent = new Date().getFullYear();
})();
