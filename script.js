(function () {
  // Top bar logic
  const topbarCountEl = document.getElementById('topbarCount');
  const topbarJoinBtn = document.getElementById('topbarJoinBtn');
  let isPosting = false;

  async function fetchCount() {
    try {
      const r = await fetch('/api/waitlist', { cache: 'no-store' });
      if (!r.ok) throw new Error('Failed to fetch count');
      const data = await r.json();
      const newVal = Number(data.displayCount || 0);
      animateCountTo(newVal);
    } catch (e) {
      console.error(e);
    }
  }

  function animateCountTo(target) {
    if (!topbarCountEl) return;
    const current = Number((topbarCountEl.textContent || '0').replace(/[^0-9]/g, '')) || 0;
    if (!isFinite(target)) {
      topbarCountEl.textContent = '—';
      return;
    }
    const duration = 450;
    const start = performance.now();
    const diff = target - current;
    function frame(now) {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      const value = Math.round(current + diff * eased);
      topbarCountEl.textContent = value.toLocaleString();
      if (t < 1) {
        requestAnimationFrame(frame);
      } else {
        // subtle bump
        topbarCountEl.classList.add('count-bump');
        setTimeout(() => topbarCountEl.classList.remove('count-bump'), 260);
      }
    }
    requestAnimationFrame(frame);
  }

  async function onJoinClick() {
    if (isPosting) return;
    try {
      isPosting = true;
      if (topbarJoinBtn) {
        topbarJoinBtn.disabled = true;
        topbarJoinBtn.textContent = 'Joining…';
      }
      await fetch('/api/join-success', { method: 'POST' });
      // confetti (desktop only)
      if (window.innerWidth >= 768) oneShotConfetti();
      setTimeout(fetchCount, 1100);
    } catch (e) {
      console.error(e);
    } finally {
      isPosting = false;
      if (topbarJoinBtn) {
        topbarJoinBtn.disabled = false;
        topbarJoinBtn.textContent = 'Join the Waitlist';
      }
    }
  }

  function oneShotConfetti() {
    try {
      // tiny inline confetti without deps
      const DURATION = 900;
      const PARTICLES = 60;
      const container = document.createElement('div');
      container.style.position = 'fixed';
      container.style.left = '0';
      container.style.top = '0';
      container.style.width = '100%';
      container.style.height = '0';
      container.style.overflow = 'visible';
      container.style.pointerEvents = 'none';
      document.body.appendChild(container);
      const colors = ['#4C9BE8','#7FB5E6','#A3C8F2','#F9D976','#F39C6B'];
      for (let i = 0; i < PARTICLES; i++) {
        const p = document.createElement('div');
        p.style.position = 'absolute';
        p.style.top = '0px';
        p.style.left = Math.random()*100 + 'vw';
        p.style.width = '8px';
        p.style.height = '12px';
        p.style.background = colors[Math.floor(Math.random()*colors.length)];
        p.style.transform = `rotate(${Math.random()*360}deg)`;
        p.style.willChange = 'transform, opacity';
        container.appendChild(p);
        const x = (Math.random() - 0.5) * 120;
        const y = 80 + Math.random() * 120;
        const rot = (Math.random() - 0.5) * 360;
        const delay = Math.random() * 100;
        p.animate([
          { transform: 'translate3d(0,0,0) rotate(0deg)', opacity: 1 },
          { transform: `translate3d(${x}vw, ${y}vh, 0) rotate(${rot}deg)`, opacity: 0 }
        ], { duration: DURATION + Math.random()*400, delay, easing: 'cubic-bezier(.2,.7,.2,1)' });
      }
      setTimeout(() => { container.remove(); }, DURATION + 500);
    } catch (_) {}
  }

  // Initialize
  window.addEventListener('load', fetchCount);
  topbarJoinBtn?.addEventListener('click', onJoinClick);
  const scenarios = [
    '“When is the Abundance Face and Body Mask Coming Back in Stock!!! I\'ve Run Out!”',
    '“Is the Abundance Mask restocking soon? My skin misses it 😭”',
    '“When can I buy the Abundance Mask again?”'
  ];

  const typingTarget = document.getElementById('typingTarget');
  const caret = document.querySelector('.quote-input__caret');

  function randomDelay(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  async function typeText(text) {
    typingTarget.textContent = '';
    for (let i = 0; i < text.length; i++) {
      typingTarget.textContent += text[i];
      await new Promise((r) => setTimeout(r, randomDelay(20, 85)));
      // occasional pause like a human
      if (Math.random() < 0.05) {
        await new Promise((r) => setTimeout(r, randomDelay(220, 500)));
      }
    }
  }

  async function backspaceText() {
    const text = typingTarget.textContent;
    for (let i = text.length - 1; i >= 0; i--) {
      typingTarget.textContent = text.slice(0, i);
      await new Promise((r) => setTimeout(r, randomDelay(10, 35)));
    }
  }

  async function playLoop() {
    let index = 0;
    // Accessibility: hide caret from AT, visual only
    if (caret) caret.setAttribute('aria-hidden', 'true');
    while (true) {
      const text = scenarios[index % scenarios.length];
      await typeText(text);
      await new Promise((r) => setTimeout(r, 1350));
      await backspaceText();
      await new Promise((r) => setTimeout(r, 450));
      index++;
    }
  }

  // start after a short delay so fonts load
  window.addEventListener('load', () => setTimeout(playLoop, 300));

  // Email form: basic client-side UX only
  const form = document.getElementById('emailForm');
  const helper = document.getElementById('formHelper');
  form?.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = /** @type {HTMLInputElement} */ (document.getElementById('email'))?.value || '';
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      if (helper) { helper.textContent = 'Please enter a valid email to join the waitlist.'; helper.style.color = '#a33a3a'; }
      return;
    }
    if (helper) { helper.textContent = 'Thanks! You\'re on the waitlist — we\'ll be in touch soon.'; helper.style.color = '#2a6b40'; }
    form.reset();
  });
})();


