/* ═══════════════════════════════════════════════════════
   FITTO — Landing Page JavaScript
   ═══════════════════════════════════════════════════════ */

'use strict';

/* ── Utility ──────────────────────────────────────────── */
const $ = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];

/* ═══════════════════════════════════════
   1. NAV — scroll behavior
═══════════════════════════════════════ */
(function initNav() {
  const nav = $('#nav');
  if (!nav) return;

  const onScroll = () => {
    nav.classList.toggle('scrolled', window.scrollY > 40);
  };

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
})();


/* ═══════════════════════════════════════
   2. AOS — Animate On Scroll (custom, no lib)
═══════════════════════════════════════ */
(function initAOS() {
  const elements = $$('[data-aos]');
  if (!elements.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const el = entry.target;
        const delay = parseInt(el.getAttribute('data-aos-delay') || '0', 10);
        setTimeout(() => el.classList.add('aos-animate'), delay);
        observer.unobserve(el);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

  elements.forEach(el => observer.observe(el));
})();


/* ═══════════════════════════════════════
   3. DEMO TABS
═══════════════════════════════════════ */
(function initDemoTabs() {
  const tabs   = $$('.demo-tab');
  const panels = $$('.demo-panel');
  if (!tabs.length) return;

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const target = tab.getAttribute('data-tab');

      // Update tabs
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');

      // Update panels with fade
      panels.forEach(p => {
        if (p.id === `tab-${target}`) {
          p.style.opacity = '0';
          p.classList.add('active');
          requestAnimationFrame(() => {
            requestAnimationFrame(() => {
              p.style.transition = 'opacity 0.4s ease';
              p.style.opacity = '1';
            });
          });
        } else {
          p.classList.remove('active');
          p.style.opacity = '';
          p.style.transition = '';
        }
      });
    });
  });
})();


/* ═══════════════════════════════════════
   4. FAQ ACCORDION
═══════════════════════════════════════ */
(function initFAQ() {
  const items = $$('.faq-item');
  if (!items.length) return;

  items.forEach(item => {
    const btn = $('.faq-q', item);
    btn.addEventListener('click', () => {
      const isOpen = item.classList.contains('open');

      // Close all
      items.forEach(i => i.classList.remove('open'));

      // Open clicked (if was closed)
      if (!isOpen) item.classList.add('open');
    });
  });
})();


/* ═══════════════════════════════════════
   5. WAITLIST FORM
═══════════════════════════════════════ */
(function initWaitlistForm() {
  const form    = $('#waitlistForm');
  const success = $('#formSuccess');
  const spotsEl = $('#spots-left');
  if (!form) return;

  // Countdown spots — cosmetic UX trick
  let spots = 243;
  const tick = setInterval(() => {
    if (spots <= 230) { clearInterval(tick); return; }
    spots -= Math.floor(Math.random() * 2);
    if (spotsEl) spotsEl.textContent = spots;
  }, 8000);

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const nameEl  = form.querySelector('#name');
    const emailEl = form.querySelector('#email');

    // Basic validation
    let valid = true;
    [nameEl, emailEl].forEach(input => {
      if (!input.value.trim()) {
        shakeInput(input);
        valid = false;
      }
    });
    if (!valid) return;

    const submitBtn  = form.querySelector('[type="submit"]');
    const btnText    = submitBtn.querySelector('.btn-text');
    const origText   = btnText.textContent;

    // Loading state
    submitBtn.disabled = true;
    btnText.textContent = 'Garantindo sua vaga...';
    submitBtn.style.opacity = '.8';

    // Simulate API call
    await new Promise(r => setTimeout(r, 1800));

    // Collect data (would normally POST to API)
    const data = {
      name:      nameEl.value.trim(),
      email:     emailEl.value.trim(),
      challenge: (form.querySelector('[name="challenge"]:checked') || {}).value || 'not_selected',
      timestamp: new Date().toISOString(),
    };
    console.info('[Fitto] Lead captured:', data);

    // Show success
    form.style.display = 'none';
    success.style.display = 'block';

    // Update spots cosmetically
    if (spotsEl) {
      spots = Math.max(spots - 1, 228);
      spotsEl.textContent = spots;
    }

    // Reset button just in case
    submitBtn.disabled = false;
    btnText.textContent = origText;
    submitBtn.style.opacity = '';

    // Confetti burst
    triggerConfetti();
  });

  function shakeInput(input) {
    input.style.borderColor = 'var(--brand-danger)';
    input.style.animation = 'none';
    requestAnimationFrame(() => {
      input.style.animation = 'shake 0.4s ease';
    });
    setTimeout(() => {
      input.style.borderColor = '';
      input.style.animation = '';
    }, 600);
  }
})();

/* Shake animation */
const shakeStyle = document.createElement('style');
shakeStyle.textContent = `
@keyframes shake {
  0%,100% { transform: translateX(0); }
  20%,60%  { transform: translateX(-6px); }
  40%,80%  { transform: translateX(6px); }
}
`;
document.head.appendChild(shakeStyle);


/* ═══════════════════════════════════════
   6. CONFETTI (lightweight, canvas-free)
═══════════════════════════════════════ */
function triggerConfetti() {
  const colors = ['#7C3AED', '#06B6D4', '#F59E0B', '#10B981', '#F8F8FF'];
  const container = document.body;

  for (let i = 0; i < 60; i++) {
    const el = document.createElement('div');
    const size = Math.random() * 8 + 4;
    const color = colors[Math.floor(Math.random() * colors.length)];
    const x = Math.random() * window.innerWidth;
    const duration = Math.random() * 1500 + 800;
    const delay = Math.random() * 400;

    Object.assign(el.style, {
      position: 'fixed',
      top: '-10px',
      left: x + 'px',
      width: size + 'px',
      height: size + 'px',
      background: color,
      borderRadius: Math.random() > .5 ? '50%' : '2px',
      pointerEvents: 'none',
      zIndex: 9999,
      opacity: '1',
      animation: `confetti-fall ${duration}ms ${delay}ms ease-in forwards`,
      transform: `rotate(${Math.random() * 360}deg)`,
    });

    container.appendChild(el);
    setTimeout(() => el.remove(), duration + delay + 100);
  }
}

const confettiStyle = document.createElement('style');
confettiStyle.textContent = `
@keyframes confetti-fall {
  0%   { transform: translateY(0) rotate(0deg); opacity: 1; }
  80%  { opacity: 1; }
  100% { transform: translateY(${window.innerHeight + 20}px) rotate(720deg); opacity: 0; }
}
`;
document.head.appendChild(confettiStyle);


/* ═══════════════════════════════════════
   7. SCROLL TO TOP button
═══════════════════════════════════════ */
(function initScrollTop() {
  const btn = $('#scrollTop');
  if (!btn) return;

  window.addEventListener('scroll', () => {
    btn.classList.toggle('visible', window.scrollY > 500);
  }, { passive: true });

  btn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
})();


/* ═══════════════════════════════════════
   8. SMOOTH SCROLL for anchor links
═══════════════════════════════════════ */
(function initSmoothScroll() {
  $$('a[href^="#"]').forEach(link => {
    link.addEventListener('click', e => {
      const target = document.querySelector(link.getAttribute('href'));
      if (!target) return;
      e.preventDefault();
      const navH = 72;
      const top  = target.getBoundingClientRect().top + window.scrollY - navH;
      window.scrollTo({ top, behavior: 'smooth' });
    });
  });
})();


/* ═══════════════════════════════════════
   9. SHARE — WhatsApp
═══════════════════════════════════════ */
function shareWhatsApp() {
  const text = encodeURIComponent(
    '🔥 Acabei de entrar na lista de espera do Fitto — um app de emagrecimento que finalmente se adapta à nossa vida real, sem culpa e sem recomeçar do zero. Entra você também: ' + window.location.href
  );
  window.open(`https://wa.me/?text=${text}`, '_blank');
}
window.shareWhatsApp = shareWhatsApp;


/* ═══════════════════════════════════════
   10. PROGRESS BAR animation on scroll
═══════════════════════════════════════ */
(function initProgressBars() {
  const bars = $$('.progress-fill, .spots-fill');
  if (!bars.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.animation = 'none';
        requestAnimationFrame(() => {
          entry.target.style.animation = '';
        });
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });

  bars.forEach(bar => observer.observe(bar));
})();


/* ═══════════════════════════════════════
   11. CHART BAR — animate heights on scroll
═══════════════════════════════════════ */
(function initChartBars() {
  const barContainers = $$('.chart-bars');
  if (!barContainers.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const bars = $$('.bar', entry.target);
      bars.forEach((bar, i) => {
        const targetH = bar.style.height;
        bar.style.height = '0%';
        setTimeout(() => {
          bar.style.transition = `height 0.7s cubic-bezier(.4,0,.2,1) ${i * 60}ms`;
          bar.style.height = targetH;
        }, 200);
      });
      observer.unobserve(entry.target);
    });
  }, { threshold: 0.4 });

  barContainers.forEach(c => observer.observe(c));
})();


/* ═══════════════════════════════════════
   12. IDENTIFICATION CARDS — hover stagger
═══════════════════════════════════════ */
(function initIdCards() {
  const cards = $$('.id-card');
  cards.forEach((card, i) => {
    card.addEventListener('mouseenter', () => {
      const emoji = card.querySelector('.id-emoji');
      if (!emoji) return;
      emoji.style.transform = 'scale(1.2) rotate(-5deg)';
      emoji.style.transition = 'transform 0.3s ease';
    });
    card.addEventListener('mouseleave', () => {
      const emoji = card.querySelector('.id-emoji');
      if (!emoji) return;
      emoji.style.transform = '';
    });
  });
})();


/* ═══════════════════════════════════════
   13. RADIO OPTION — keyboard support
═══════════════════════════════════════ */
(function initRadioOptions() {
  const radios = $$('.radio-option');
  radios.forEach(opt => {
    opt.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        const input = opt.querySelector('input[type="radio"]');
        if (input) {
          input.checked = true;
          input.dispatchEvent(new Event('change', { bubbles: true }));
        }
      }
    });
  });
})();


/* ═══════════════════════════════════════
   14. LIVE COUNTER — social proof
       (cosmetic urgency micro-loop)
═══════════════════════════════════════ */
(function initLiveCounter() {
  const spotsEl = $('#spots-left');
  if (!spotsEl) return;

  // Trigger a "someone just joined" micro-drop every ~25–45s
  function scheduleDrop() {
    const delay = (Math.random() * 20000) + 25000;
    setTimeout(() => {
      const current = parseInt(spotsEl.textContent, 10);
      if (current <= 225) return;
      spotsEl.textContent = current - 1;
      spotsEl.style.color = 'var(--brand-accent)';
      spotsEl.style.transition = 'color 0.3s';
      setTimeout(() => { spotsEl.style.color = ''; }, 1500);
      scheduleDrop();
    }, delay);
  }
  scheduleDrop();
})();


/* ═══════════════════════════════════════
   15. TYPED HEADLINE effect (hero)
       Adds a blinking cursor feel
═══════════════════════════════════════ */
(function initHeroEntrance() {
  const hero = $('.hero');
  if (!hero) return;

  // Trigger entrance after a brief delay
  setTimeout(() => {
    $$('[data-aos]', hero).forEach(el => {
      // AOS observer will pick them up naturally
    });
  }, 100);
})();


/* ═══════════════════════════════════════
   16. FORM — input micro-animation on focus
═══════════════════════════════════════ */
(function initInputEffects() {
  $$('.form-group input').forEach(input => {
    const label = input.closest('.form-group')?.querySelector('label');

    input.addEventListener('focus', () => {
      if (label) label.style.color = 'var(--brand-primary)';
    });
    input.addEventListener('blur', () => {
      if (label) label.style.color = '';
    });
  });
})();


/* ═══════════════════════════════════════
   17. PARALLAX — hero glows (subtle)
═══════════════════════════════════════ */
(function initParallax() {
  const glows = $$('.hero__glow');
  if (!glows.length || window.innerWidth < 768) return;

  let ticking = false;
  window.addEventListener('mousemove', e => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      const cx = (e.clientX / window.innerWidth  - 0.5) * 30;
      const cy = (e.clientY / window.innerHeight - 0.5) * 30;
      glows[0] && (glows[0].style.transform = `translate(${cx * .6}px, ${cy * .6}px)`);
      glows[1] && (glows[1].style.transform = `translate(${-cx * .4}px, ${-cy * .4}px)`);
      ticking = false;
    });
  }, { passive: true });
})();


/* ═══════════════════════════════════════
   18. ACTIVE NAV LINK on scroll
═══════════════════════════════════════ */
(function initActiveNav() {
  const sections = $$('section[id]');
  const navLinks = $$('.nav a[href^="#"]');
  if (!sections.length || !navLinks.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.id;
        navLinks.forEach(link => {
          link.classList.toggle('active', link.getAttribute('href') === `#${id}`);
        });
      }
    });
  }, { threshold: 0.4 });

  sections.forEach(s => observer.observe(s));
})();


/* ═══════════════════════════════════════
   19. SPOTS BAR — animate fill
═══════════════════════════════════════ */
(function initSpotsBar() {
  const fill = $('.spots-fill');
  if (!fill) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const targetW = fill.style.width || '81%';
        fill.style.width = '0';
        requestAnimationFrame(() => {
          fill.style.transition = 'width 1.2s cubic-bezier(.4,0,.2,1) 0.3s';
          fill.style.width = targetW;
        });
        observer.unobserve(fill);
      }
    });
  }, { threshold: 0.5 });

  observer.observe(fill);
})();


/* ═══════════════════════════════════════
   20. PAGE INIT — log
═══════════════════════════════════════ */
(function onReady() {
  console.log(
    '%c🔷 Fitto%c — Landing Page carregada com sucesso.',
    'color:#7C3AED;font-weight:900;font-size:16px;',
    'color:#A0A0B8;font-size:13px;'
  );
})();
