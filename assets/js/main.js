(() => {
  'use strict';

  /* ------------------------------------------------------------ */
  /* Header: solid background after scroll, active link tracking   */
  /* ------------------------------------------------------------ */
  const header = document.getElementById('siteHeader');
  const navLinks = document.querySelectorAll('.nav-pills a');
  const sections = [...document.querySelectorAll('main section[id]')];
  
  const counters = document.querySelectorAll('.count-up');
  const counterIO = new IntersectionObserver((entries)=>{
    entries.forEach(entry=>{
      if(!entry.isIntersecting) return;
      const el = entry.target;
      const target = parseInt(el.dataset.target, 10);
      const suffix = el.dataset.suffix || '';
      const dur = 1200; const start = performance.now();
      function tick(now){
        const p = Math.min(1, (now - start) / dur);
        const eased = 1 - Math.pow(1 - p, 3);
        el.textContent = Math.round(eased * target) + suffix;
        if(p < 1) requestAnimationFrame(tick);
      }
      requestAnimationFrame(tick);
      counterIO.unobserve(el);
    });
  }, {threshold:.6});
  counters.forEach(c=>counterIO.observe(c));

  const heroVisualParallax = document.querySelector('.hero-visual');
  const heroSection = document.getElementById('inicio');

  function onScroll() {
    header.classList.toggle('is-scrolled', window.scrollY > 12);

    if (heroVisualParallax && heroSection) {
      const rect = heroSection.getBoundingClientRect();
      if (rect.bottom > 0 && rect.top < window.innerHeight) {
        const shift = Math.max(-24, Math.min(24, window.scrollY * 0.08));
        heroVisualParallax.style.setProperty('--py', shift + 'px');
      }
    }
  }

  const scrollState = { ticking: false };
  window.addEventListener('scroll', () => {
    if (!scrollState.ticking) {
      window.requestAnimationFrame(() => {
        onScroll();
        scrollState.ticking = false;
      });
      scrollState.ticking = true;
    }
  }, { passive: true });
  onScroll();

  /* ------------------------------------------------------------ */
  /* Active nav link tracking while scrolling                     */
  /* ------------------------------------------------------------ */
  if (sections.length && navLinks.length) {
    const sectionIO = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const id = entry.target.id;
        navLinks.forEach((link) => {
          link.classList.toggle('is-active', link.getAttribute('href') === '#' + id);
        });
      });
    }, { rootMargin: '-45% 0px -45% 0px', threshold: 0 });
    sections.forEach((section) => sectionIO.observe(section));
  }

  document.querySelectorAll('.btn').forEach(btn=>{
    btn.addEventListener('mousemove', (e)=>{
      const r = btn.getBoundingClientRect();
      btn.style.setProperty('--mx', ((e.clientX - r.left) / r.width * 100) + '%');
      btn.style.setProperty('--my', ((e.clientY - r.top) / r.height * 100) + '%');
    });
  });




  /* ------------------------------------------------------------ */
  /* Mobile menu                                                   */
  /* ------------------------------------------------------------ */
  const navToggle = document.getElementById('navToggle');
  const mobileMenu = document.getElementById('mobileMenu');
  const mobileMenuClose = document.getElementById('mobileMenuClose');

  function openMenu() {
    mobileMenu.classList.add('is-open');
    navToggle.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';
  }
  function closeMenu() {
    mobileMenu.classList.remove('is-open');
    navToggle.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  }
  navToggle?.addEventListener('click', openMenu);
  mobileMenuClose?.addEventListener('click', closeMenu);
  mobileMenu?.querySelectorAll('a').forEach((a) => a.addEventListener('click', closeMenu));

  /* ------------------------------------------------------------ */
  /* Login modal (dashboard-mockup variant only; no-op elsewhere)  */
  /* ------------------------------------------------------------ */
  const loginTrigger = document.getElementById('loginTrigger');
  const loginModal = document.getElementById('loginModal');
  const loginModalClose = document.getElementById('loginModalClose');
  const loginBadge = loginModal?.querySelector('.login-badge');

  function openLoginModal() {
    loginModal.classList.add('is-open');
    document.body.style.overflow = 'hidden';
    loginModal.querySelector('input, select, button:not(.modal-close)')?.focus();
    // restart the badge's pop-in animation each time the modal opens
    if (loginBadge) {
      loginBadge.style.animation = 'none';
      void loginBadge.offsetWidth;
      loginBadge.style.animation = '';
    }
  }
  function closeLoginModal() {
    loginModal.classList.remove('is-open');
    document.body.style.overflow = '';
    loginTrigger?.focus();
  }
  if (loginTrigger && loginModal) {
    loginTrigger.addEventListener('click', openLoginModal);
    loginModalClose?.addEventListener('click', closeLoginModal);
    loginModal.addEventListener('click', (e) => {
      if (e.target === loginModal) closeLoginModal();
    });
  }

  /* ------------------------------------------------------------ */
  /* Login modal: show/hide password                               */
  /* ------------------------------------------------------------ */
  const toggleClave = document.getElementById('toggleClaveLogin');
  const clavePass = document.getElementById('loginPass');
  toggleClave?.addEventListener('click', () => {
    const showing = clavePass.type === 'text';
    clavePass.type = showing ? 'password' : 'text';
    toggleClave.classList.toggle('is-showing', !showing);
  });

  /* ------------------------------------------------------------ */
  /* Contact form + footer newsletter: no backend yet, just stop   */
  /* the page from reloading                                       */
  /* ------------------------------------------------------------ */
  document.getElementById('contactForm')?.addEventListener('submit', (e) => {
    e.preventDefault();
  });
  document.getElementById('newsletterForm')?.addEventListener('submit', (e) => {
    e.preventDefault();
  });

  /* ------------------------------------------------------------ */
  /* Scroll-reveal: transform + opacity only, IntersectionObserver  */
  /* ------------------------------------------------------------ */
  const revealTargets = document.querySelectorAll('[data-reveal]');
  if ('IntersectionObserver' in window && revealTargets.length) {
    const revealObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.18, rootMargin: '0px 0px -8% 0px' });
    revealTargets.forEach((el) => revealObserver.observe(el));
  } else {
    revealTargets.forEach((el) => el.classList.add('is-visible'));
  }

  /* ------------------------------------------------------------ */
  /* Hero card: pointer-driven tilt (desktop only, motion-safe)     */
  /* ------------------------------------------------------------ */
  const heroCard = document.getElementById('heroCard');
  const heroVisual = heroCard?.closest('.hero-visual');

  if (heroCard && heroVisual && window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
    let raf = null;
    let targetX = -8, targetY = 4, curX = -8, curY = 4;

    heroVisual.addEventListener('mousemove', (e) => {
      const rect = heroVisual.getBoundingClientRect();
      const px = (e.clientX - rect.left) / rect.width - 0.5;
      const py = (e.clientY - rect.top) / rect.height - 0.5;
      targetY = px * 16;
      targetX = -py * 14 - 4;
      if (!raf) raf = requestAnimationFrame(tick);
    });

    heroVisual.addEventListener('mouseleave', () => {
      targetX = -8;
      targetY = 4;
      if (!raf) raf = requestAnimationFrame(tick);
    });

    function tick() {
      curX += (targetX - curX) * 0.08;
      curY += (targetY - curY) * 0.08;
      heroCard.style.transform = `rotateX(${curX}deg) rotateY(${curY}deg)`;
      if (Math.abs(targetX - curX) > 0.05 || Math.abs(targetY - curY) > 0.05) {
        raf = requestAnimationFrame(tick);
      } else {
        raf = null;
      }
    }
  }

  document.addEventListener('DOMContentLoaded', () => {
    const fadeContainer = document.querySelector('.hero-fade-container');
    
    if (fadeContainer) {
      const mockup = fadeContainer.querySelector('.hero-face-mockup');
      const logo = fadeContainer.querySelector('.hero-face-logo');
      
      if (mockup && logo) {
        // Estado inicial
        mockup.classList.add('is-visible');
        logo.classList.remove('is-visible');

        // Ciclo cada 3.5 segundos (da tiempo a ver la imagen fija y hacer el fade suave)
        setInterval(() => {
          if (mockup.classList.contains('is-visible')) {
            mockup.classList.remove('is-visible');
            logo.classList.add('is-visible');
          } else {
            logo.classList.remove('is-visible');
            mockup.classList.add('is-visible');
          }
        }, 3500);
      }
    }
  });


  /* ------------------------------------------------------------ */
  /* Escape key closes mobile menu / login modal                   */
  /* ------------------------------------------------------------ */
  document.addEventListener('keydown', (e) => {
    if (e.key !== 'Escape') return;
    closeMenu();
    if (loginModal?.classList.contains('is-open')) closeLoginModal();
  });


})();
