/* ============================================================
   NCERT GAME — main.js
   ============================================================ */

/* ── Tab Switcher ─────────────────────────────────────────── */
function switchTab(stream, classNum) {
  // Hide all panels for this stream
  const panel11 = document.getElementById(stream + '-11');
  const panel12 = document.getElementById(stream + '-12');
  if (panel11) panel11.classList.remove('active');
  if (panel12) panel12.classList.remove('active');

  // Show selected panel
  const target = document.getElementById(stream + '-' + classNum);
  if (target) target.classList.add('active');

  // Update tab button styles
  const tabs = document.querySelectorAll(
    '#' + stream + ' .tab-btn, .stream-section.' + stream + '-stream .tab-btn'
  );

  // Find the buttons within the right stream section
  const streamSection = document.querySelector('.' + stream + '-stream');
  if (!streamSection) return;

  const streamTabs = streamSection.querySelectorAll('.tab-btn');
  const activeClass = 'active-' + stream;

  streamTabs.forEach((btn, i) => {
    btn.classList.remove(activeClass);
    // index 0 = class 11, index 1 = class 12
    if ((classNum === '11' && i === 0) || (classNum === '12' && i === 1)) {
      btn.classList.add(activeClass);
    }
  });
}

/* ── Smooth scroll for nav links ──────────────────────────── */
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    const target = document.querySelector(this.getAttribute('href'));
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
});

/* ── Navbar active link on scroll ─────────────────────────── */
const sections = document.querySelectorAll('[id]');
const navLinks = document.querySelectorAll('.nav-links a');

window.addEventListener('scroll', () => {
  let current = '';
  sections.forEach(section => {
    const sectionTop = section.offsetTop - 100;
    if (window.scrollY >= sectionTop) {
      current = section.getAttribute('id');
    }
  });

  navLinks.forEach(link => {
    link.classList.remove('active');
    if (link.getAttribute('href') === '#' + current) {
      link.classList.add('active');
    }
  });
});

/* ── Navbar shadow on scroll ──────────────────────────────── */
const navbar = document.querySelector('.navbar');
window.addEventListener('scroll', () => {
  if (window.scrollY > 20) {
    navbar.style.borderBottomColor = 'rgba(255,255,255,0.1)';
  } else {
    navbar.style.borderBottomColor = 'rgba(255,255,255,0.07)';
  }
});

/* ── Fade-in cards on scroll (Intersection Observer) ─────── */
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.style.opacity = '1';
      entry.target.style.transform = 'translateY(0)';
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.1 });

// Apply to subject cards and stat items
document.querySelectorAll('.subject-card, .stat').forEach((el, i) => {
  el.style.opacity = '0';
  el.style.transform = 'translateY(24px)';
  el.style.transition = `opacity 0.5s ease ${i * 0.06}s, transform 0.5s ease ${i * 0.06}s`;
  observer.observe(el);
});

/* ── Console welcome message ──────────────────────────────── */
console.log('%c🎮 NCERT Game', 'font-size:20px; font-weight:bold; color:#00e5ff;');
console.log('%cLearn through play. Built for Class 11 & 12.', 'color:#9090a8;');
