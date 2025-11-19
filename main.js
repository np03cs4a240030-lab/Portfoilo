// main.js
// Handles theme toggle (persisted), mobile nav open/close, tab switching, reveal on scroll, and form submit.

(function () {
  const LS_KEY = 'site-theme'; // 'dark' or 'light'
  const body = document.body;
  const html = document.documentElement;
  const themeToggle = document.getElementById('themeToggle');
  const themeIcon = themeToggle ? themeToggle.querySelector('.theme-icon') : null;

  // --- Theme logic ---
  function setTheme(theme, withFade = true) {
    if (withFade) {
      html.classList.add('theme-fading');
      window.setTimeout(() => html.classList.remove('theme-fading'), 420);
    }

    if (theme === 'light') {
      body.classList.add('light');
      themeToggle && themeToggle.classList.add('active');
      themeToggle && themeToggle.setAttribute('aria-pressed', 'true');
      if (themeIcon) themeIcon.textContent = '☀️';
    } else {
      body.classList.remove('light');
      themeToggle && themeToggle.classList.remove('active');
      themeToggle && themeToggle.setAttribute('aria-pressed', 'false');
      if (themeIcon) themeIcon.textContent = '🌙';
    }

    try { localStorage.setItem(LS_KEY, theme); } catch (e) { /* ignore */ }
  }

  function initTheme() {
    let saved = null;
    try { saved = localStorage.getItem(LS_KEY); } catch (e) { saved = null; }
    const prefersLight = window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches;
    // default to dark if nothing saved (per your request)
    const initial = saved || (prefersLight ? 'light' : 'dark');
    setTheme(initial, false);
  }

  function toggleTheme() {
    const isLight = body.classList.contains('light');
    const target = isLight ? 'dark' : 'light';
    // quick fade
    html.classList.add('theme-fading');
    setTheme(target, false);
    setTimeout(() => html.classList.remove('theme-fading'), 420);
  }

  // attach toggle
  if (themeToggle) {
    initTheme();
    themeToggle.addEventListener('click', (e) => {
      e.preventDefault();
      toggleTheme();
    });
  } else {
    initTheme();
  }

  // --- Reveal on scroll (IntersectionObserver) ---
  const reveals = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && reveals.length) {
    const revealObserver = new IntersectionObserver((entries, obs) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in-view');
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });

    reveals.forEach((el, i) => {
      el.style.transitionDelay = `${Math.min(200, i * 60)}ms`;
      revealObserver.observe(el);
    });
  } else {
    reveals.forEach(el => el.classList.add('in-view'));
  }

  // --- Year in footer ---
  try {
    const yearEl = document.getElementById('year');
    if (yearEl) yearEl.innerText = new Date().getFullYear();
  } catch (e) { /* ignore */ }

  // --- Tabs ---
  try {
    const tabLinks = document.querySelectorAll('.tab-link');
    const tabPanels = document.querySelectorAll('.tab-panel');
    tabLinks.forEach(btn => {
      btn.addEventListener('click', (e) => {
        tabLinks.forEach(b => b.classList.remove('active'));
        tabPanels.forEach(p => p.classList.remove('active'));
        btn.classList.add('active');
        const id = btn.getAttribute('data-target');
        if (id) {
          const target = document.getElementById(id);
          if (target) target.classList.add('active');
        }
      });
    });
  } catch (e) { console.warn(e); }

  // --- Mobile Navigation Toggle ---
  document.addEventListener('DOMContentLoaded', () => {
    const nav = document.getElementById('nav');
    const navToggle = document.getElementById('navToggle');
    const navClose = document.getElementById('navClose');
    const navLinks = document.querySelectorAll('.nav-link');

    function openNav() {
      if (!nav) return;
      nav.classList.add('open');
      nav.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
      navToggle && navToggle.setAttribute('aria-expanded', 'true');
      // focus the first nav link for a11y
      if (navLinks.length) navLinks[0].focus();
    }

    function closeNav() {
      if (!nav) return;
      nav.classList.remove('open');
      nav.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
      navToggle && navToggle.setAttribute('aria-expanded', 'false');
      navToggle && navToggle.focus();
    }

    if (navToggle && nav) {
      navToggle.addEventListener('click', (e) => {
        e.stopPropagation();
        openNav();
      });
    }

    if (navClose && nav) {
      navClose.addEventListener('click', (e) => {
        e.stopPropagation();
        closeNav();
      });
    }

    navLinks.forEach(link => {
      link.addEventListener('click', () => closeNav());
    });

    // Close nav on escape
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') closeNav();
    });

    // Click outside nav closes (on mobile overlay)
    document.addEventListener('click', (e) => {
      if (!nav) return;
      if (!nav.classList.contains('open')) return;
      // if click is outside nav content area close
      const inside = nav.contains(e.target) || (navToggle && navToggle.contains(e.target));
      if (!inside) closeNav();
    });
  });

  // --- Active nav link on scroll ---
  try {
    const sections = document.querySelectorAll('section, header');
    const navLinks = document.querySelectorAll('.nav-link');
    function setActiveNav() {
      let index = sections.length;
      while(--index && window.scrollY + 140 < sections[index].offsetTop) {}
      navLinks.forEach(link => link.classList.remove('active'));
      const id = sections[index].id || 'top';
      const active = document.querySelector('.nav-link[href="#' + id + '"]');
      if(active) active.classList.add('active');
    }
    setActiveNav();
    window.addEventListener('scroll', setActiveNav);
  } catch (e) { console.warn(e); }

  // --- Scroll to top button ---
  try {
    const scrollTopBtn = document.getElementById('scrollTop');
    function toggleScrollTop() {
      if(window.scrollY > 400) scrollTopBtn.classList.add('visible');
      else scrollTopBtn.classList.remove('visible');
    }
    window.addEventListener('scroll', toggleScrollTop);
    scrollTopBtn && scrollTopBtn.addEventListener('click', () => window.scrollTo({top:0, behavior:'smooth'}));
  } catch (e) { console.warn(e); }

  // --- Contact form submit (your Google Script kept) ---
  try {
    const scriptURL = 'https://script.google.com/macros/s/AKfycbyEbTwt1drFj15QfzLLRq0uuspWEg5fVOcMsKPxW-6vvoVy3cNYqOELom0Kn3fMzDNIPg/exec'
    const form = document.forms['submit-to-google-sheet']
    const msg = document.getElementById("msg")
    if (form) {
      form.addEventListener('submit', e => {
        e.preventDefault()
        fetch(scriptURL, { method: 'POST', body: new FormData(form)})
          .then(response => {
            msg.innerText = "Message sent — thank you!";
            form.reset();
            setTimeout(()=> msg.innerText = '', 4000);
          })
          .catch(error => {
            console.error('Error!', error.message)
            msg.innerText = "Error sending message.";
            setTimeout(()=> msg.innerText = '', 4000);
          })
      });
    }
  } catch (e) { console.warn(e); }

})();
