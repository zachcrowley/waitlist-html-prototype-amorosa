(function(){
  var G = typeof window !== 'undefined' ? (window.__COUNTDOWN__SETTINGS || {}) : {};
  if (!G.enabled) return;
  function excluded(){
    try{
      var ex = Array.isArray(G.excludeHandles) ? G.excludeHandles : (G.excludeHandles||'').split(',').map(function(s){return s.trim();}).filter(Boolean);
      var path = (location.pathname||'').replace(/^\/+|\/+$/g,'');
      var tmpl = (window.Shopify && window.Shopify.theme && window.Shopify.theme.name) ? (document.documentElement.getAttribute('data-template')||'') : '';
      return ex.some(function(h){ return path.indexOf(h) !== -1 || tmpl.indexOf(h) !== -1; });
    }catch(e){ return false; }
  }
  if (excluded()) return;
  var root = document.createElement('div');
  root.id = 'waitlist-countdown-root';
  document.addEventListener('DOMContentLoaded', function(){
    var hiddenAt = 0; try { hiddenAt = Number(localStorage.getItem('amorosa_countdown_hidden')||0); } catch(e){}
    if (Date.now() - hiddenAt < 7*24*60*60*1000) root.classList.add('collapsed');
    document.body.appendChild(root);
    render();
    if (!root.classList.contains('collapsed')){
      root.classList.add('preopen'); setTimeout(function(){ root.classList.remove('preopen'); }, 250);
    }
  });

  function h(tag, cls, txt){ var el = document.createElement(tag); if (cls) el.className = cls; if (txt) el.textContent = txt; return el; }
  function getRemaining(targetMs){ var now=Date.now(),diff=Math.max(0,targetMs-now); var d=Math.floor(diff/86400000); diff-=d*86400000; var h=Math.floor(diff/3600000); diff-=h*3600000; var m=Math.floor(diff/60000); diff-=m*60000; var s=Math.floor(diff/1000); return {days:d,hours:h,minutes:m,seconds:s,done:targetMs<=now}; }
  function f2(n){ return String(Math.max(0,n)).padStart(2,'0'); }

  function render(){
    var targetMs = Date.parse(G.targetUtc || '2025-10-01T10:00:00Z');
    root.style.setProperty('--wl-navy', G.colors && G.colors.navy || '#113A5C');
    root.style.setProperty('--wl-bg', G.colors && G.colors.bg || '#F3FAFF');

    var bar = h('div','cd-bar');
    var inner = h('div','cd-inner');
    bar.appendChild(inner);
    var tab = h('button','cd-tab','Join The Exclusive Waitlist');
    root.appendChild(tab);

    var header = h('div','cd-header');
    header.appendChild(h('div','eyebrow', G.eyebrow || 'OCTOBER 1ST • 8:00PM (AEST)'));
    header.appendChild(h('div','title', G.title || 'Abundance Face & Body Mask Restock Launch'));

    var copy = h('div','cd-copy');
    var subDesktop = h('div','sub sub--desktop');
    subDesktop.innerHTML = (G.copyDesktop || 'Join the waitlist today<br>For early access before the General Public');
    var subMobile = h('div','sub sub--mobile');
    subMobile.innerHTML = (G.copyMobile || 'Join the waitlist today for early access<br>before the General Public');
    copy.append(subDesktop, subMobile);

    function card(label){ var c=h('div','cd-card'); var n=h('div','cd-num','00'); var l=h('div','cd-label',label); c.append(n,l); return {c:c,n:n}; }
    var timer = h('div','cd-timer'); var d=card('Days'), hh=card('Hours'), mm=card('Minutes'), ss=card('Seconds'); timer.append(d.c,hh.c,mm.c,ss.c);

    var cta = h('div','cd-cta');
    var formWrap = h('div','cta-form'); var input = h('input','cta-input'); input.type='email'; input.placeholder='Email Address'; formWrap.appendChild(input); cta.appendChild(formWrap);
    var btn = h('a','btn'); btn.href = G.ctaHref || '#waitlist'; cta.appendChild(btn);
    var err = h('div','cta-error'); err.style.display='none'; cta.appendChild(err);

    inner.append(header, h('div','cd-row').appendChild(copy).parentNode, timer, cta); // keep order similar
    root.appendChild(bar);

    var expanded=false;
    function isMobile(){ return matchMedia('(max-width: 900px)').matches; }
    function gap(){ var g=getComputedStyle(cta).gap||'12px'; var n=parseFloat(g); return isFinite(n)?n:12; }
    function applySizes(w,open){ if(isMobile()){ btn.style.width='100%'; return; } if(open){ var iT=Math.max(220, Math.round(w*0.58)); var bT=Math.max(160, Math.round(w-gap()-iT)); btn.style.width=bT+'px'; btn.style.flexBasis=bT+'px'; input.style.width=iT+'px'; formWrap.style.maxWidth=iT+'px'; } else { btn.style.width=Math.round(w)+'px'; btn.style.flexBasis=Math.round(w)+'px'; formWrap.style.maxWidth='0px'; } }
    function sync(){ if(isMobile()) { btn.style.width='100%'; return; } var w=timer.getBoundingClientRect().width; if(w>0) applySizes(w, expanded); }
    function setText(){ if(expanded) { btn.textContent='Join Now'; btn.setAttribute('aria-label','Join now'); } else { btn.textContent = isMobile()? 'Join the Waitlist':'Join the Waitlist today for Early Access'; btn.setAttribute('aria-label','Join the waitlist'); } }

    setText(); sync(); addEventListener('resize', function(){ setText(); sync(); });

    btn.addEventListener('click', function(e){ e.preventDefault(); if(!expanded){ expanded=true; var w=timer.getBoundingClientRect().width; if(w>0) applySizes(w,true); requestAnimationFrame(function(){ cta.classList.add('open'); sync(); }); setText(); err.style.display='none'; return; } var v=(input.value||'').trim(); var ok=/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v); if(!ok){ err.textContent='Please input an Email Address'; err.style.display='block'; } else { err.style.display='none'; /* Ready to submit */ } });
    input.addEventListener('input', function(){ if(err.style.display!=='none'){ var v=(input.value||'').trim(); if(/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) err.style.display='none'; } });

    // Countdown loop + a11y
    var live = h('div'); live.setAttribute('aria-live','polite'); live.style.position='absolute'; live.style.left='-9999px'; document.body.appendChild(live); var lastMin=-1; (function loop(){ var r=getRemaining(targetMs); d.n.textContent=String(r.days); hh.n.textContent=f2(r.hours); mm.n.textContent=f2(r.minutes); ss.n.textContent=f2(r.seconds); if(r.done){ d.n.textContent='0'; hh.n.textContent='00'; mm.n.textContent='00'; ss.n.textContent='00'; return; } var mins=r.days*24*60 + r.hours*60 + r.minutes; if(mins!==lastMin){ live.textContent=r.days+' days '+r.hours+' hours '+r.minutes+' minutes remaining'; lastMin=mins; } setTimeout(loop,1000); })();

    // Close / reopen
    var close = h('button','cd-close','×'); close.setAttribute('aria-label','Hide countdown'); bar.appendChild(close);
    close.addEventListener('click', function(){ try{ localStorage.setItem('amorosa_countdown_hidden', String(Date.now())); }catch(e){} root.classList.add('collapsed'); });
    tab.addEventListener('click', function(){ root.classList.remove('collapsed'); try{ localStorage.removeItem('amorosa_countdown_hidden'); }catch(e){} });
  }
})();


