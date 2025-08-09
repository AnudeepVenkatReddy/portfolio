// Starfield background
(function initStars() {
  const canvas = document.getElementById('stars');
  const ctx = canvas.getContext('2d');
  let width, height, stars;
  function resize() {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
    stars = Array.from({ length: Math.min(220, Math.floor(width * height / 18000)) }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      z: Math.random() * 0.6 + 0.4,
      r: Math.random() * 1.5 + 0.3
    }));
  }
  function draw() {
    ctx.clearRect(0, 0, width, height);
    for (const s of stars) {
      ctx.fillStyle = `rgba(200,210,255,${s.z})`;
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx.fill();
      s.x += 0.05 * s.z;
      if (s.x > width + 2) s.x = -2;
    }
    requestAnimationFrame(draw);
  }
  window.addEventListener('resize', resize);
  resize();
  draw();
})();

// Typed roles animation
const roles = [
  'Embedded IoT Developer',
  'VLSI Methodology Intern',
  'UVM • SystemVerilog Enthusiast',
  'Full‑Stack Web Developer'
];
(function typeLoop() {
  const el = document.querySelector('.typed');
  let idx = 0;
  function typeNext() {
    const text = roles[idx % roles.length];
    el.textContent = '';
    anime({
      targets: { count: 0 },
      count: text.length,
      duration: 1300,
      easing: 'easeInOutQuad',
      round: 1,
      update(anim) {
        const n = anim.animations[0].currentValue;
        el.textContent = text.slice(0, n);
      },
      complete() {
        setTimeout(() => erase(text), 1100);
      }
    });
  }
  function erase(text) {
    anime({
      targets: { count: text.length },
      count: 0,
      duration: 700,
      easing: 'easeInOutQuad',
      round: 1,
      update(anim) {
        const n = anim.animations[0].currentValue;
        el.textContent = text.slice(0, n);
      },
      complete() {
        idx += 1; typeNext();
      }
    });
  }
  typeNext();
})();

// Theme toggle
const themeToggle = document.getElementById('themeToggle');
const prefersLight = window.matchMedia('(prefers-color-scheme: light)').matches;
const saved = localStorage.getItem('theme');
if (saved) document.documentElement.classList.toggle('light', saved === 'light');
else if (prefersLight) document.documentElement.classList.add('light');
themeToggle.addEventListener('click', () => {
  document.documentElement.classList.toggle('light');
  localStorage.setItem('theme', document.documentElement.classList.contains('light') ? 'light' : 'dark');
});

// Footer year
document.getElementById('year').textContent = new Date().getFullYear();

// Scroll-triggered reveal animations
(function initScrollReveal() {
  const revealSections = document.querySelectorAll('.reveal-on-scroll');
  const animator = (el) => {
    el.classList.add('revealed');
    anime({
      targets: el.querySelectorAll('.card, .experience, .edu, .contact-tile, .pill, .chip, p, ul, h3, h4'),
      translateY: [20, 0],
      opacity: [0, 1],
      duration: 700,
      delay: anime.stagger(40, { start: 80 }),
      easing: 'easeOutQuad'
    });
  };
  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        animator(entry.target);
        io.unobserve(entry.target);
      }
    });
  }, { rootMargin: '0px 0px -10% 0px', threshold: 0.1 });
  revealSections.forEach((s) => io.observe(s));
})();

// Skill hover popovers
(function initSkillPopovers() {
  const descriptions = {
    python: 'Scripting, data handling, and quick prototyping. Used in the eco‑mobility project and for tooling.',
    'embedded-c': 'Bare‑metal microcontroller programming. Built the Gas Leakage Detector (sensors, GSM, interrupts).',
    systemverilog: 'Verification (UVM), writing testbenches, assertions, and functional coverage for ALU verification.',
    verilog: 'RTL design basics and simulation as part of VLSI methodology internship.',
    sql: 'Designing schema, writing queries for analytics dashboards.',
    html: 'Semantic structure and accessibility for responsive web UIs.',
    css: 'Modern layouts, responsive design, theming, and animations.',
    javascript: 'Front‑end interactivity, API integration, and data visualization.',
    git: 'Branching strategies, PR workflows, and code reviews.',
    docker: 'Containerization for reproducible dev environments.',
    vscode: 'Daily editor with extensions for linting, debugging, and productivity.'
  };
  const chips = document.querySelectorAll('.chip[data-skill]');
  let pop; let activeChip = null;
  function placePopover(chip, preferAbove = false) {
    const rect = chip.getBoundingClientRect();
    const margin = 10;
    const maxLeft = window.innerWidth - 340;
    let left = Math.min(Math.max(rect.left, margin), maxLeft);
    let top;
    const spaceBelow = window.innerHeight - rect.bottom;
    const spaceAbove = rect.top;
    const willPlaceAbove = preferAbove || spaceBelow < 120 && spaceAbove > spaceBelow;
    if (willPlaceAbove) {
      top = rect.top - (pop.offsetHeight + 12);
      pop.style.transformOrigin = 'bottom left';
      pop.style.setProperty('--arrowTop', `${pop.offsetHeight - 4}px`);
    } else {
      top = rect.bottom + 12;
      pop.style.transformOrigin = 'top left';
      pop.style.setProperty('--arrowTop', `-6px`);
    }
    Object.assign(pop.style, { left: `${left}px`, top: `${Math.max(margin, top)}px` });
    // arrow
    pop.style.setProperty('--arrowLeft', `${Math.min(rect.width / 2, 140)}px`);
    pop.style.setProperty('--arrowDisplay', 'block');
  }
  function show(e, chip) {
    const key = chip.getAttribute('data-skill');
    const desc = descriptions[key];
    if (!desc) return;
    if (!pop) {
      pop = document.createElement('div');
      pop.className = 'skill-popover';
      document.body.appendChild(pop);
    }
    pop.innerHTML = `<h5>${chip.textContent}</h5><p>${desc}</p>`;
    placePopover(chip);
    pop.style.opacity = 0; pop.style.transform = 'scale(0.96)';
    anime({ targets: pop, opacity: 1, translateY: [6, 0], scale: [0.98, 1], duration: 160, easing: 'easeOutQuad' });
    activeChip = chip;
  }
  function hide() {
    if (!pop) return;
    anime({ targets: pop, opacity: 0, duration: 120, easing: 'linear', complete: () => pop && pop.remove() });
    pop = null; activeChip = null;
  }
  chips.forEach((chip) => {
    chip.addEventListener('click', (e) => {
      e.stopPropagation();
      if (activeChip === chip) { hide(); return; }
      show(e, chip);
    });
    chip.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        if (activeChip === chip) { hide(); }
        else { show(e, chip); }
      }
    });
  });
  document.addEventListener('click', (e) => {
    if (!activeChip) return;
    // Close when clicking anywhere else
    hide();
  });
  // Close popover on scroll
  window.addEventListener('scroll', () => { if (pop) hide(); }, { passive: true });
  window.addEventListener('resize', () => pop && placePopover(activeChip, false));
})();


