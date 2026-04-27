/* ═══════════════════════════════════════════════════════
   NEXTO — Landing Page JavaScript
   Mobile-optimised with swipe support
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

  function toggleMenu(open) {
    menu.classList.toggle('open', open);
    const spans = $$('span', burger);
    if (open) {
      spans[0].style.transform = 'rotate(45deg) translate(5px,5px)';
      spans[1].style.opacity = '0';
      spans[2].style.transform = 'rotate(-45deg) translate(5px,-5px)';
    } else {
      spans.forEach(s => { s.style.transform = ''; s.style.opacity = ''; });
    }
  }

  burger?.addEventListener('click', () => {
    const isOpen = menu.classList.contains('open');
    toggleMenu(!isOpen);
  });

  // Close menu on link click or outside tap
  $$('.nav__mobile a').forEach(a => {
    a.addEventListener('click', () => toggleMenu(false));
  });

  document.addEventListener('click', (e) => {
    if (menu.classList.contains('open') && !nav.contains(e.target)) {
      toggleMenu(false);
    }
  });
})();

/* ══════════════════════════════════
   2. AOS — Animate on Scroll
══════════════════════════════════ */
(function initAOS() {
  const els = $$('[data-aos]');
  if (!els.length) return;

  // Reduce motion for users who prefer it
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduced) {
    els.forEach(el => el.classList.add('aos-animate'));
    return;
  }

  const obs = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      const delay = parseInt(e.target.getAttribute('data-aos-delay') || '0', 10);
      // On mobile, reduce delays to feel snappier
      const mobileDelay = window.innerWidth < 768 ? Math.min(delay, 100) : delay;
      setTimeout(() => e.target.classList.add('aos-animate'), mobileDelay);
      obs.unobserve(e.target);
    });
  }, { threshold: 0.08, rootMargin: '0px 0px -32px 0px' });

  els.forEach(el => obs.observe(el));
})();

/* ══════════════════════════════════
   3. DEMO TABS + SWIPE SUPPORT
══════════════════════════════════ */
(function initDemoTabs() {
  const tabs      = $$('.dtab');
  const panels    = $$('.dpanel');
  const content   = $('.demo-content');
  if (!tabs.length || !content) return;

  let currentIdx = 0;

  function activateTab(idx) {
    if (idx < 0 || idx >= tabs.length) return;
    currentIdx = idx;
    const id = tabs[idx].getAttribute('data-tab');

    tabs.forEach((t, i) => t.classList.toggle('active', i === idx));

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

    // Scroll active tab button into view (for mobile horizontal scroll)
    tabs[idx].scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
  }

  tabs.forEach((tab, i) => {
    tab.addEventListener('click', () => activateTab(i));
  });

  // ── Touch/swipe support ──────────────────────────────
  let touchStartX = 0;
  let touchStartY = 0;
  let touchMoved  = false;

  content.addEventListener('touchstart', (e) => {
    touchStartX = e.touches[0].clientX;
    touchStartY = e.touches[0].clientY;
    touchMoved  = false;
  }, { passive: true });

  content.addEventListener('touchmove', (e) => {
    const dx = Math.abs(e.touches[0].clientX - touchStartX);
    const dy = Math.abs(e.touches[0].clientY - touchStartY);
    if (dx > dy && dx > 8) touchMoved = true;
  }, { passive: true });

  content.addEventListener('touchend', (e) => {
    if (!touchMoved) return;
    const dx = e.changedTouches[0].clientX - touchStartX;
    if (Math.abs(dx) < 40) return; // minimum swipe distance
    if (dx < 0) {
      activateTab(currentIdx + 1); // swipe left → next
    } else {
      activateTab(currentIdx - 1); // swipe right → prev
    }
  }, { passive: true });
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

  let spots = 187;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const nameEl  = form.querySelector('#wl-name');
    const emailEl = form.querySelector('#wl-email');
    let valid = true;

    [nameEl, emailEl].forEach(inp => {
      if (!inp.value.trim()) { shakeEl(inp); valid = false; }
    });
    if (!valid) return;

    // Validate email format
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailEl.value.trim())) {
      shakeEl(emailEl);
      return;
    }

    const btn  = form.querySelector('[type="submit"]');
    const txt  = btn.querySelector('.btn-txt');
    const orig = txt.textContent;

    btn.disabled = true;
    txt.textContent = 'Garantindo sua vaga...';
    btn.style.opacity = '.75';

    await new Promise(r => setTimeout(r, 1600));

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

    // Scroll to success on mobile
    if (window.innerWidth < 768) {
      success.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }

    triggerConfetti();
  });

  function shakeEl(el) {
    el.style.borderColor = '#FF4D5A';
    el.style.animation   = 'shake .4s ease';
    el.focus();
    setTimeout(() => { el.style.borderColor = ''; el.style.animation = ''; }, 600);
  }
})();

/* ══════════════════════════════════
   6. CONFETTI burst
══════════════════════════════════ */
function triggerConfetti() {
  const cols = ['#A25CFF','#4D8CFF','#26E38A','#FF9A3D','#F3F5FA','#22D3EE'];
  const count = window.innerWidth < 480 ? 40 : 70; // fewer on small screens
  for (let i = 0; i < count; i++) {
    const el  = document.createElement('div');
    const sz  = Math.random() * 9 + 4;
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
   8. SMOOTH SCROLL (nav links)
══════════════════════════════════ */
(function initSmoothScroll() {
  $$('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      const href = a.getAttribute('href');
      if (!href || href === '#') return;
      const target = document.querySelector(href);
      if (!target) return;
      e.preventDefault();
      const offset = window.innerWidth < 768 ? 70 : 80;
      const top = target.getBoundingClientRect().top + window.scrollY - offset;
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
  }, { threshold: 0.4 });

  bars.forEach(b => obs.observe(b));
})();

/* ══════════════════════════════════
   11. RING ANIMATION
══════════════════════════════════ */
(function initRing() {
  const rings = $$('.ring circle:last-child');
  if (!rings.length) return;

  const obs = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      e.target.style.transition = 'stroke-dashoffset 1.5s cubic-bezier(.4,0,.2,1) .5s';
      e.target.style.strokeDashoffset = '72';
      obs.unobserve(e.target);
    });
  }, { threshold: 0.4 });

  rings.forEach(r => {
    r.style.strokeDashoffset = '201';
    obs.observe(r);
  });
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
  }, { threshold: 0.4 });
  obs.observe(fill);
})();

/* ══════════════════════════════════
   13. LIVE SPOTS COUNTER
══════════════════════════════════ */
(function initLiveCounter() {
  const el = $('#wl-spots');
  if (!el) return;
  function drop() {
    const delay = 18000 + Math.random() * 22000;
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
   14. PARALLAX HERO ORBS (desktop only)
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
   15. PAIN CARDS — emoji bounce on hover/tap
══════════════════════════════════ */
(function initPainCards() {
  $$('.pain-card').forEach(card => {
    function bounceEmoji() {
      const em = card.querySelector('.pain-emoji');
      if (!em) return;
      em.style.transform = 'scale(1.25) rotate(-6deg)';
      em.style.transition = 'transform .3s ease';
      setTimeout(() => { em.style.transform = ''; }, 400);
    }
    card.addEventListener('mouseenter', bounceEmoji);
    card.addEventListener('touchstart', bounceEmoji, { passive: true });
  });
})();

/* ══════════════════════════════════
   16. RADIO — keyboard support
══════════════════════════════════ */
(function initRadios() {
  $$('.wl-opt').forEach(opt => {
    opt.setAttribute('tabindex', '0');
    opt.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        const inp = opt.querySelector('input');
        if (inp) inp.checked = true;
      }
    });
    // Also handle tap directly on label
    opt.addEventListener('click', () => {
      const inp = opt.querySelector('input');
      if (inp) inp.checked = true;
    });
  });
})();

/* ══════════════════════════════════
   17. NOTIFICATION CARD — cycling messages
══════════════════════════════════ */
(function initNotifTyping() {
  // Cycle all notification cards (desktop + mobile)
  const notifCards = $$('.app-notif-card');
  if (!notifCards.length) return;

  const messages = [
    { av: '👩‍⚕️', name: 'Juliana (Nutricionista)', msg: 'Ajustei seu plano para hoje — você tem uma quarta corrida. 🥗' },
    { av: '👨‍🏋️', name: 'Lucas (Personal)', msg: 'Treino de hoje: 25 min lower body. Pode fazer às 17h! 💪' },
    { av: '👨‍⚕️', name: 'Dr. Rafael (Médico)', msg: 'Seus marcadores estão ótimos. Continue assim! 🩺' },
    { av: '🤖',   name: 'Nexto AI', msg: 'Você está 78% do seu objetivo semanal. Bora! 🚀' },
  ];

  let idx = 0;

  function cycleNotif(notif) {
    idx = (idx + 1) % messages.length;
    const m    = messages[idx];
    const av   = notif.querySelector('.notif-avatar');
    const name = notif.querySelector('.notif-body strong');
    const msg  = notif.querySelector('.notif-body p');

    notif.style.transition = 'opacity .3s ease';
    notif.style.opacity = '0';
    setTimeout(() => {
      if (av)   av.textContent   = m.av;
      if (name) name.textContent = m.name;
      if (msg)  msg.textContent  = m.msg;
      notif.style.opacity = '1';
    }, 320);
  }

  notifCards.forEach(notif => {
    setInterval(() => cycleNotif(notif), 4000);
  });
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
  }, { threshold: 0.35 });

  sections.forEach(s => obs.observe(s));
})();

/* ══════════════════════════════════
   20. MOBILE MOCKUP — floating notif animation
══════════════════════════════════ */
(function initMobileNotifs() {
  const notif1 = $('.mob-notif--1');
  const notif2 = $('.mob-notif--2');
  if (!notif1 || !notif2) return;

  // Subtle entrance pulse animation via JS
  function pulseCard(el, delay) {
    setTimeout(() => {
      el.style.transition = 'transform .6s cubic-bezier(.4,0,.2,1), box-shadow .6s ease';
      el.style.transform  = 'translateY(-3px) scale(1.02)';
      el.style.boxShadow  = '0 12px 40px rgba(162,92,255,.25), 0 0 0 1px rgba(255,255,255,.06)';
      setTimeout(() => {
        el.style.transform = '';
        el.style.boxShadow = '';
      }, 600);
    }, delay);
  }

  // Pulse notifs periodically to draw attention
  setInterval(() => {
    pulseCard(notif1, 0);
    pulseCard(notif2, 800);
  }, 5000);
})();

/* ══════════════════════════════════
   21. READY LOG
══════════════════════════════════ */
(function onReady() {
  console.log(
    '%c⬡ Nexto%c — landing page pronta.',
    'color:#A25CFF;font-weight:900;font-size:16px;',
    'color:#A7AFBE;font-size:13px;'
  );
})();
