/* ═══════════════════════════════════════════════════════
   NEXTO — Landing Page JavaScript
   ═══════════════════════════════════════════════════════ */
'use strict';

const $ = (s, c = document) => c.querySelector(s);
const $$ = (s, c = document) => [...c.querySelectorAll(s)];

/* ══════════════════════════════════
   1. NAV — scroll + mobile burger
══════════════════════════════════ */
(function initNav() {
  const nav    = $('#nav');
  const burger = $('#burger');
  const menu   = $('#mobileMenu');
  if (!nav) return;

  window.addEventListener('scroll', () => {
    nav.classList.toggle('scrolled', window.scrollY > 36);
  }, { passive: true });

  burger?.addEventListener('click', () => {
    menu.classList.toggle('open');
    const open = menu.classList.contains('open');
    const spans = $$('span', burger);
    if (open) {
      spans[0].style.transform = 'rotate(45deg) translate(5px,5px)';
      spans[1].style.opacity = '0';
      spans[2].style.transform = 'rotate(-45deg) translate(5px,-5px)';
    } else {
      spans.forEach(s => { s.style.transform = ''; s.style.opacity = ''; });
    }
  });

  // Close menu on link click
  $$('.nav__mobile a').forEach(a => {
    a.addEventListener('click', () => {
      menu.classList.remove('open');
      const spans = $$('span', burger);
      spans.forEach(s => { s.style.transform = ''; s.style.opacity = ''; });
    });
  });
})();

/* ══════════════════════════════════
   2. AOS — Animate on Scroll
══════════════════════════════════ */
(function initAOS() {
  const els = $$('[data-aos]');
  if (!els.length) return;

  const obs = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      const delay = parseInt(e.target.getAttribute('data-aos-delay') || '0', 10);
      setTimeout(() => e.target.classList.add('aos-animate'), delay);
      obs.unobserve(e.target);
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -48px 0px' });

  els.forEach(el => obs.observe(el));
})();

/* ══════════════════════════════════
   3. DEMO TABS
══════════════════════════════════ */
(function initDemoTabs() {
  const tabs   = $$('.dtab');
  const panels = $$('.dpanel');
  if (!tabs.length) return;

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const id = tab.getAttribute('data-tab');
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');

      panels.forEach(p => {
        if (p.id === `tab-${id}`) {
          p.style.opacity = '0';
          p.classList.add('active');
          requestAnimationFrame(() => requestAnimationFrame(() => {
            p.style.transition = 'opacity .35s ease';
            p.style.opacity = '1';
          }));
        } else {
          p.classList.remove('active');
          p.style.opacity = '';
          p.style.transition = '';
        }
      });
    });
  });
})();

/* ══════════════════════════════════
   4. FAQ ACCORDION
══════════════════════════════════ */
(function initFAQ() {
  const items = $$('.faq-item');
  items.forEach(item => {
    $('.faq-q', item)?.addEventListener('click', () => {
      const wasOpen = item.classList.contains('open');
      items.forEach(i => i.classList.remove('open'));
      if (!wasOpen) item.classList.add('open');
    });
  });
})();

/* ══════════════════════════════════
   5. WAITLIST FORM
══════════════════════════════════ */
(function initForm() {
  const form    = $('#wlForm');
  const success = $('#wlSuccess');
  const spotsEl = $('#wl-spots');
  if (!form) return;

  // Cosmetic spot countdown
  let spots = 187;
  const tickSpots = setInterval(() => {
    if (spots <= 172) { clearInterval(tickSpots); return; }
    spots -= Math.floor(Math.random() * 2);
    if (spotsEl) spotsEl.textContent = spots;
  }, 10000);

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const nameEl  = form.querySelector('#wl-name');
    const emailEl = form.querySelector('#wl-email');
    let valid = true;

    [nameEl, emailEl].forEach(inp => {
      if (!inp.value.trim()) { shakeEl(inp); valid = false; }
    });
    if (!valid) return;

    const btn  = form.querySelector('[type="submit"]');
    const txt  = btn.querySelector('.btn-txt');
    const orig = txt.textContent;

    btn.disabled = true;
    txt.textContent = 'Garantindo sua vaga...';
    btn.style.opacity = '.75';

    await new Promise(r => setTimeout(r, 1800));

    const payload = {
      name:      nameEl.value.trim(),
      email:     emailEl.value.trim(),
      challenge: (form.querySelector('[name="ch"]:checked') || {}).value || '',
      ts:        new Date().toISOString(),
    };
    console.info('[Nexto] Lead:', payload);

    form.style.display = 'none';
    success.style.display = 'block';

    if (spotsEl) { spots = Math.max(spots - 1, 170); spotsEl.textContent = spots; }
    btn.disabled = false;
    txt.textContent = orig;
    btn.style.opacity = '';

    triggerConfetti();
  });

  function shakeEl(el) {
    el.style.borderColor = '#FF4D5A';
    el.style.animation = 'shake .4s ease';
    setTimeout(() => { el.style.borderColor = ''; el.style.animation = ''; }, 500);
  }
})();

/* ══════════════════════════════════
   6. CONFETTI burst
══════════════════════════════════ */
function triggerConfetti() {
  const cols = ['#A25CFF','#4D8CFF','#26E38A','#FF9A3D','#F3F5FA','#22D3EE'];
  for (let i = 0; i < 70; i++) {
    const el = document.createElement('div');
    const sz = Math.random() * 9 + 4;
    const col = cols[Math.floor(Math.random() * cols.length)];
    const x   = Math.random() * window.innerWidth;
    const dur = Math.random() * 1400 + 900;
    const del = Math.random() * 500;
    Object.assign(el.style, {
      position: 'fixed', top: '-10px', left: x + 'px',
      width: sz + 'px', height: sz + 'px',
      background: col, borderRadius: Math.random() > .5 ? '50%' : '3px',
      pointerEvents: 'none', zIndex: '9999', opacity: '1',
      animation: `nxConfetti ${dur}ms ${del}ms ease-in forwards`,
    });
    document.body.appendChild(el);
    setTimeout(() => el.remove(), dur + del + 50);
  }
}
(function injectStyles() {
  const s = document.createElement('style');
  s.textContent = `
    @keyframes nxConfetti {
      0%   { transform: translateY(0) rotate(0deg); opacity: 1; }
      85%  { opacity: 1; }
      100% { transform: translateY(${window.innerHeight + 20}px) rotate(720deg); opacity: 0; }
    }
  `;
  document.head.appendChild(s);
})();

/* ══════════════════════════════════
   7. SCROLL TOP
══════════════════════════════════ */
(function initScrollTop() {
  const btn = $('#scrollTop');
  if (!btn) return;
  window.addEventListener('scroll', () => {
    btn.classList.toggle('visible', window.scrollY > 500);
  }, { passive: true });
  btn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
})();

/* ══════════════════════════════════
   8. SMOOTH SCROLL
══════════════════════════════════ */
(function initSmoothScroll() {
  $$('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      const target = document.querySelector(a.getAttribute('href'));
      if (!target) return;
      e.preventDefault();
      const top = target.getBoundingClientRect().top + window.scrollY - 74;
      window.scrollTo({ top, behavior: 'smooth' });
    });
  });
})();

/* ══════════════════════════════════
   9. WHATSAPP SHARE
══════════════════════════════════ */
function shareWA() {
  const txt = encodeURIComponent(
    '🚀 Entrei na lista de espera do Nexto — o primeiro app com médico, nutricionista e personal trainer integrados, todos os dias no seu bolso. Entre você também: ' + window.location.href
  );
  window.open(`https://wa.me/?text=${txt}`, '_blank');
}
window.shareWA = shareWA;

/* ══════════════════════════════════
   10. PROGRESS BARS ANIMATION
══════════════════════════════════ */
(function initProgressBars() {
  const bars = $$('.apc-bar-fill');
  if (!bars.length) return;

  const obs = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      const target = e.target.style.width;
      e.target.style.width = '0';
      requestAnimationFrame(() => {
        e.target.style.transition = 'width 1.4s cubic-bezier(.4,0,.2,1) .3s';
        e.target.style.width = target;
      });
      obs.unobserve(e.target);
    });
  }, { threshold: 0.5 });

  bars.forEach(b => obs.observe(b));
})();

/* ══════════════════════════════════
   11. RING ANIMATION
══════════════════════════════════ */
(function initRing() {
  const ring = document.querySelector('.ring circle:last-child');
  if (!ring) return;

  const obs = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      ring.style.transition = 'stroke-dashoffset 1.5s cubic-bezier(.4,0,.2,1) .5s';
      ring.style.strokeDashoffset = '72';
      obs.unobserve(ring);
    });
  }, { threshold: 0.5 });

  ring.style.strokeDashoffset = '201';
  obs.observe(ring);
})();

/* ══════════════════════════════════
   12. SPOTS BAR ANIMATE
══════════════════════════════════ */
(function initSpotsBar() {
  const fill = $('.wlf-fill');
  if (!fill) return;
  const obs = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      fill.style.width = '0';
      requestAnimationFrame(() => {
        fill.style.transition = 'width 1.2s cubic-bezier(.4,0,.2,1) .3s';
        fill.style.width = '85%';
      });
      obs.unobserve(fill);
    });
  }, { threshold: 0.5 });
  obs.observe(fill);
})();

/* ══════════════════════════════════
   13. LIVE SPOTS COUNTER
══════════════════════════════════ */
(function initLiveCounter() {
  const el = $('#wl-spots');
  if (!el) return;
  function drop() {
    const delay = 18000 + Math.random() * 20000;
    setTimeout(() => {
      const cur = parseInt(el.textContent, 10);
      if (cur <= 170) return;
      el.textContent = cur - 1;
      el.style.transition = 'color .3s';
      el.style.color = '#FF9A3D';
      setTimeout(() => el.style.color = '', 1500);
      drop();
    }, delay);
  }
  drop();
})();

/* ══════════════════════════════════
   14. PARALLAX HERO ORBS
══════════════════════════════════ */
(function initParallax() {
  if (window.innerWidth < 768) return;
  const orbs = $$('.hero__orb');
  let ticking = false;
  window.addEventListener('mousemove', e => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      const cx = (e.clientX / window.innerWidth - .5) * 40;
      const cy = (e.clientY / window.innerHeight - .5) * 40;
      orbs[0] && (orbs[0].style.transform = `translate(${cx * .5}px,${cy * .5}px)`);
      orbs[1] && (orbs[1].style.transform = `translate(${-cx * .35}px,${-cy * .35}px)`);
      ticking = false;
    });
  }, { passive: true });
})();

/* ══════════════════════════════════
   15. PAIN CARDS — emoji bounce on hover
══════════════════════════════════ */
(function initPainCards() {
  $$('.pain-card').forEach(card => {
    card.addEventListener('mouseenter', () => {
      const em = card.querySelector('.pain-emoji');
      if (!em) return;
      em.style.transform = 'scale(1.25) rotate(-6deg)';
      em.style.transition = 'transform .3s ease';
    });
    card.addEventListener('mouseleave', () => {
      const em = card.querySelector('.pain-emoji');
      if (em) em.style.transform = '';
    });
  });
})();

/* ══════════════════════════════════
   16. RADIO — keyboard support
══════════════════════════════════ */
(function initRadios() {
  $$('.wl-opt').forEach(opt => {
    opt.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        const inp = opt.querySelector('input');
        if (inp) inp.checked = true;
      }
    });
  });
})();

/* ══════════════════════════════════
   17. NOTIFICATION CARD — cosmetic typing
══════════════════════════════════ */
(function initNotifTyping() {
  const notif = document.querySelector('.app-notif-card');
  if (!notif) return;

  const messages = [
    { av: '👩‍⚕️', name: 'Juliana (Nutricionista)', msg: 'Ajustei seu plano para hoje — você tem uma quarta corrida. 🥗' },
    { av: '👨‍🏋️', name: 'Lucas (Personal)', msg: 'Treino de hoje: 25 min lower body. Pode fazer às 17h! 💪' },
    { av: '👨‍⚕️', name: 'Dr. Rafael (Médico)', msg: 'Seus marcadores estão ótimos. Continue assim! 🩺' },
    { av: '🤖', name: 'Nexto AI', msg: 'Você está 78% do seu objetivo semanal. Bora! 🚀' },
  ];

  let idx = 0;
  setInterval(() => {
    idx = (idx + 1) % messages.length;
    const m = messages[idx];
    const av = notif.querySelector('.notif-avatar');
    const name = notif.querySelector('.notif-body strong');
    const msg  = notif.querySelector('.notif-body p');

    notif.style.transition = 'opacity .3s ease';
    notif.style.opacity = '0';
    setTimeout(() => {
      if (av) av.textContent = m.av;
      if (name) name.textContent = m.name;
      if (msg) msg.textContent = m.msg;
      notif.style.opacity = '1';
    }, 320);
  }, 4000);
})();

/* ══════════════════════════════════
   18. INPUT LABEL HIGHLIGHT
══════════════════════════════════ */
(function initInputFocus() {
  $$('.wl-field input').forEach(inp => {
    const label = inp.closest('.wl-field')?.querySelector('label');
    inp.addEventListener('focus', () => { if (label) label.style.color = '#A25CFF'; });
    inp.addEventListener('blur',  () => { if (label) label.style.color = ''; });
  });
})();

/* ══════════════════════════════════
   19. ACTIVE NAV LINKS on scroll
══════════════════════════════════ */
(function initActiveNav() {
  const sections = $$('section[id]');
  const links    = $$('.nav__links a[href^="#"]');
  if (!sections.length || !links.length) return;

  const obs = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        links.forEach(l => l.classList.toggle(
          'nav-active', l.getAttribute('href') === `#${e.target.id}`
        ));
      }
    });
  }, { threshold: 0.4 });

  sections.forEach(s => obs.observe(s));
})();

/* ══════════════════════════════════
   20. READY LOG
══════════════════════════════════ */
(function onReady() {
  console.log(
    '%c⬡ Nexto%c — landing page pronta.',
    'color:#A25CFF;font-weight:900;font-size:16px;',
    'color:#A7AFBE;font-size:13px;'
  );
})();
