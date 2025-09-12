(function () {
  const scenarios = [
    '“When is the Abundance Face and Body Mask Coming Back in Stock!!! I\'ve Run out!”',
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


