(function () {
  // Top bar logic
  const topbarCountEl = document.getElementById('topbarCount');
  const topbarJoinBtn = document.getElementById('topbarJoinBtn');
  let isPosting = false;
  let prefetchTimer = null;
  const SESSION_KEY = 'waitlistCount';
  /** @type {number|null} */
  let sessionStart = null;
  try {
    const saved = sessionStorage.getItem(SESSION_KEY);
    if (saved != null) sessionStart = Math.max(0, parseInt(saved, 10) || 0);
  } catch (_) {}

  async function fetchCount() {
    try {
      const r = await fetch('/api/waitlist', { cache: 'no-store' });
      if (!r.ok) throw new Error('Failed to fetch count');
      const data = await r.json();
      const newVal = Number(data.displayCount || 0);
      try { sessionStorage.setItem(SESSION_KEY, String(newVal)); } catch (_) {}
      if (prefetchTimer) { clearInterval(prefetchTimer); prefetchTimer = null; }
      animateCountTo(newVal, 360);
    } catch (e) {
      console.error(e);
    }
  }

  function animateCountTo(target, durationOverride) {
    if (!topbarCountEl) return;
    const current = Number((topbarCountEl.textContent || '0').replace(/[^0-9]/g, '')) || 0;
    if (!isFinite(target)) {
      topbarCountEl.textContent = '—';
      return;
    }
    const duration = typeof durationOverride === 'number' ? durationOverride : 650;
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
      // tuned inline confetti without deps
      const DURATION = 1700; // slower overall
      const PARTICLES = 80;
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
        p.style.top = '-8px';
        p.style.left = Math.random()*100 + 'vw';
        p.style.width = Math.random() < 0.5 ? '6px' : '8px';
        p.style.height = Math.random() < 0.5 ? '10px' : '12px';
        p.style.background = colors[Math.floor(Math.random()*colors.length)];
        p.style.transform = `rotate(${Math.random()*360}deg)`;
        p.style.willChange = 'transform, opacity';
        container.appendChild(p);
        const driftX = (Math.random() - 0.5) * 60; // less lateral drift
        const fallY = 70 + Math.random() * 85; // reach further down viewport
        const rot = (Math.random() - 0.5) * 270;
        const delay = Math.random() * 200; // stagger more
        p.animate([
          { transform: 'translate3d(0,0,0) rotate(0deg)', opacity: 1 },
          { transform: `translate3d(${driftX}vw, ${fallY}vh, 0) rotate(${rot}deg)`, opacity: 0 }
        ], { duration: DURATION + Math.random()*800, delay, easing: 'cubic-bezier(.2,.8,.2,1)' });
      }
      setTimeout(() => { container.remove(); }, DURATION + 1000);
    } catch (_) {}
  }

  // Prefetch strategy: start from cachedCount and slowly tick while fetching
  function startPrefetchTick() {
    if (!topbarCountEl) return;
    let temp = 0;
    topbarCountEl.textContent = '0';
    clearInterval(prefetchTimer);
    prefetchTimer = setInterval(() => {
      // slightly faster than before while waiting
      temp += Math.random() < 0.85 ? 1 : 2;
      topbarCountEl.textContent = temp.toLocaleString();
    }, 380);
  }

  async function initTopbar() {
    if (sessionStart != null) {
      // Show last session value, but do not start ticking until API lands
      if (topbarCountEl) topbarCountEl.textContent = sessionStart.toLocaleString();
      await fetchCount();
    } else {
      startPrefetchTick();
      try {
        await fetchCount();
      } finally {
        if (prefetchTimer) { clearInterval(prefetchTimer); prefetchTimer = null; }
      }
    }
  }

  // Initialize
  window.addEventListener('load', initTopbar);
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


