import './styles.css';
import { getRemaining, format2 } from './countdown';

function createEl<K extends keyof HTMLElementTagNameMap>(tag: K, cls?: string, text?: string) {
  const el = document.createElement(tag);
  if (cls) el.className = cls;
  if (text) el.textContent = text;
  return el;
}

export default function init() {
  const mount = document.getElementById('amorosa-countdown');
  if (!mount) return;
  // Respect hidden state for 7 days
  try {
    const hiddenAt = localStorage.getItem('amorosa_countdown_hidden');
    if (hiddenAt && Date.now() - Number(hiddenAt) < 7*24*60*60*1000) {
      mount.classList.add('collapsed');
    }
  } catch {}

  const targetAttr = mount.getAttribute('data-target-utc') || '2025-10-01T10:00:00Z';
  const ctaHref = mount.getAttribute('data-cta-href') || '#waitlist';
  const targetMs = Date.parse(targetAttr);

  const bar = createEl('div', 'cd-bar');
  const inner = createEl('div', 'cd-inner');
  bar.appendChild(inner);
  const reopenTab = createEl('button','cd-tab');
  reopenTab.textContent = 'Join The Exclusive Waitlist';
  // Place tab outside the transformed bar so it remains visible when collapsed
  mount.appendChild(reopenTab);

  // Header row
  const header = createEl('div','cd-header');
  header.appendChild(createEl('div','eyebrow','OCTOBER 1ST • 8:00PM (AEST)'));
  header.appendChild(createEl('div','title','Abundance Face & Body Mask Restock Launch'));

  // Left copy (supporting only)
  const copy = createEl('div', 'cd-copy');
  const subDesktop = createEl('div','sub sub--desktop');
  subDesktop.innerHTML = '<b>Join the waitlist today!</b><br>For early access before the <b>General Public</b> and <b>Special Goodies</b> to be shared soon!';
  const subMobile = createEl('div','sub sub--mobile');
  subMobile.innerHTML = 'Join the waitlist today!<br>For early access before the <b>General Public</b>...<br>and <b>Special Goodies</b> to be shared soon!';
  copy.append(subDesktop, subMobile);

  // Timer
  const timer = createEl('div','cd-timer');
  function makeCard(label:string){
    const c = createEl('div','cd-card');
    const num = createEl('div','cd-num','00');
    num.setAttribute('data-label', label);
    const lab = createEl('div','cd-label', label);
    c.append(num, lab); return { c, num };
  }
  const d = makeCard('Days');
  const h = makeCard('Hours');
  const m = makeCard('Minutes');
  const s = makeCard('Seconds');
  timer.append(d.c,h.c,m.c,s.c);

  // CTA
  const ctaWrap = createEl('div','cd-cta');
  // Sliding form container (desktop: slides from right to left; mobile: slides up)
  const formWrap = createEl('div','cta-form');
  const input = createEl('input','cta-input') as HTMLInputElement;
  input.type = 'email'; input.placeholder = 'Email Address'; input.setAttribute('aria-label','Email Address');
  formWrap.appendChild(input);
  ctaWrap.appendChild(formWrap);

  const btn = createEl('a','btn') as HTMLAnchorElement;
  btn.href = ctaHref; btn.setAttribute('aria-label','Join the waitlist');
  ctaWrap.append(btn);
  // No close control in prototype per requirement

  // Row for description and timer side by side
  const row = createEl('div','cd-row');
  row.append(copy, timer);

  inner.append(header, row, ctaWrap);
  mount.appendChild(bar);

  // Live region (polite)
  const live = createEl('div');
  live.setAttribute('aria-live','polite');
  live.style.position='absolute'; live.style.left='-9999px';
  document.body.appendChild(live);

  let lastAnnounceMin = -1;
  function render(){
    const r = getRemaining(targetMs);
    d.num.textContent = String(r.days);
    h.num.textContent = format2(r.hours);
    m.num.textContent = format2(r.minutes);
    s.num.textContent = format2(r.seconds);
    if (r.done){
      d.num.textContent = '0'; h.num.textContent = '00'; m.num.textContent='00'; s.num.textContent='00';
      btn.textContent = 'Shop Now'; btn.setAttribute('aria-label','Shop now');
      return; // stop updating
    }
    const nowMin = r.days*24*60 + r.hours*60 + r.minutes;
    if (nowMin !== lastAnnounceMin){
      live.textContent = `${r.days} days ${r.hours} hours ${r.minutes} minutes remaining`;
      lastAnnounceMin = nowMin;
    }
    setTimeout(render, 1000);
  }
  render();

  // Set initial CTA text based on viewport and sync width to timer on desktop
  function isMobile(){ return window.matchMedia('(max-width: 900px)').matches; }
  function updateCtaText(){
    if (isMobile()) {
      btn.textContent = 'Join the Waitlist';
    } else {
      btn.textContent = 'Join the Waitlist today for Early Access';
    }
  }
  function syncBtnWidth(){
    if (isMobile()) { btn.style.width = '100%'; return; }
    const timerWidth = timer.getBoundingClientRect().width;
    if (timerWidth > 0) {
      // Default: match timer width
      let target = Math.round(timerWidth);
      // When input is visible, make button slightly smaller so input and button appear balanced
      if (ctaWrap.classList.contains('open')) {
        target = Math.max(220, Math.round(timerWidth * 0.9));
      }
      btn.style.width = `${target}px`;
      input.style.width = `${target}px`;
      // Keep reserved space for the sliding form
      formWrap.style.maxWidth = `${target}px`;
    }
  }
  updateCtaText();
  syncBtnWidth();
  window.addEventListener('resize', () => { updateCtaText(); syncBtnWidth(); });

  // Interactions
  btn.addEventListener('click', (e) => {
    e.preventDefault();
    // Desktop: reserve space by shrinking the button first, then open form on next frame
    if (!isMobile()) {
      const timerWidth = timer.getBoundingClientRect().width;
      if (timerWidth > 0) {
        const target = Math.max(220, Math.round(timerWidth * 0.9));
        btn.style.width = `${target}px`;
        formWrap.style.maxWidth = `${target}px`;
        input.style.width = `${target}px`;
      }
      requestAnimationFrame(() => ctaWrap.classList.add('open'));
    } else {
      ctaWrap.classList.add('open');
    }
    btn.textContent = 'Join Now';
    btn.setAttribute('aria-label','Join now');
    setTimeout(() => input.focus(), 200);
    syncBtnWidth();
  });

  const close = createEl('button','cd-close cd-close-abs','×');
  close.setAttribute('aria-label','Hide countdown');
  bar.appendChild(close);
  close.addEventListener('click', () => {
    try { localStorage.setItem('amorosa_countdown_hidden', String(Date.now())); } catch {}
    mount.classList.add('collapsed');
  });
  reopenTab.addEventListener('click', () => {
    mount.classList.remove('collapsed');
    try { localStorage.removeItem('amorosa_countdown_hidden'); } catch {}
  });
}

// Auto-init when used directly in Vite demo
init();


