(function(){
  function init(el){
    if(!el) return;
    var id = el.id.replace('amorosa-topbar-','');
    var countEl = document.getElementById('topbarCount-'+id);
    var btn = document.getElementById('topbarJoinBtn-'+id);
    var textDesktop = el.querySelector('.topbar__text--desktop');
    var textMobile = el.querySelector('.topbar__text--mobile');

    var desktopText = el.getAttribute('data-desktop-text') || '';
    var mobileText = el.getAttribute('data-mobile-text') || '';
    var showMobileCta = el.getAttribute('data-show-mobile-cta') === 'true';
    var sticky = el.getAttribute('data-sticky') === 'true';
    var confetti = el.getAttribute('data-confetti') === 'true';
    var apiBase = el.getAttribute('data-api-base') || '';
    var pollInterval = parseInt(el.getAttribute('data-poll-interval')||'60',10);
    if(textDesktop) textDesktop.textContent = desktopText;
    if(textMobile) textMobile.textContent = mobileText;
    if(!showMobileCta) el.setAttribute('data-show-mobile-cta','false');
    if(!sticky) el.setAttribute('data-sticky','false');

    var API = {
      waitlist: (apiBase||'') + '/api/waitlist',
      join: (apiBase||'') + '/api/join-success'
    };

    var isPosting = false;
    var prefetchTimer = null;
    var pollTimer = null;
    var lastFetchTs = 0;
    var SESSION_KEY = 'waitlistCount';
    var sessionStart = null;
    try{ var saved = sessionStorage.getItem(SESSION_KEY); if(saved!=null) sessionStart = Math.max(0, parseInt(saved,10)||0);}catch(_){ }

    function animateCountTo(target, duration){
      if(!countEl) return;
      var current = Number((countEl.textContent||'0').replace(/[^0-9]/g,''))||0;
      if(!isFinite(target)){ countEl.textContent = '—'; return; }
      var start = performance.now();
      var diff = target - current;
      var dur = typeof duration==='number'? duration : 360;
      function frame(now){
        var t = Math.min(1, (now - start)/dur);
        var eased = 1 - Math.pow(1 - t, 3);
        var value = Math.round(current + diff * eased);
        countEl.textContent = value.toLocaleString();
        if(t<1){ requestAnimationFrame(frame); }
        else { countEl.classList.add('count-bump'); setTimeout(function(){ countEl.classList.remove('count-bump'); }, 260); }
      }
      requestAnimationFrame(frame);
    }

    function startPrefetchTick(){
      if(!countEl) return;
      var temp = 0; countEl.textContent = '0';
      clearInterval(prefetchTimer);
      prefetchTimer = setInterval(function(){ temp += Math.random()<0.85 ? 1 : 2; countEl.textContent = temp.toLocaleString(); }, 380);
    }

    function oneShotConfetti(){
      try{
        if(!confetti) return;
        if(window.innerWidth < 768) return;
        var DURATION = 1700;
        var PARTICLES = 80;
        var container = document.createElement('div');
        container.style.position='fixed'; container.style.left='0'; container.style.top='0'; container.style.width='100%'; container.style.height='0'; container.style.overflow='visible'; container.style.pointerEvents='none';
        document.body.appendChild(container);
        var colors=['#4C9BE8','#7FB5E6','#A3C8F2','#F9D976','#F39C6B'];
        for(var i=0;i<PARTICLES;i++){
          var p=document.createElement('div'); p.style.position='absolute'; p.style.top='-8px'; p.style.left=(Math.random()*100)+'vw'; p.style.width=(Math.random()<0.5?'6px':'8px'); p.style.height=(Math.random()<0.5?'10px':'12px'); p.style.background=colors[Math.floor(Math.random()*colors.length)]; p.style.transform='rotate('+ (Math.random()*360)+'deg)'; p.style.willChange='transform, opacity'; container.appendChild(p);
          var driftX = (Math.random()-0.5)*60; var fallY = 70+Math.random()*85; var rot=(Math.random()-0.5)*270; var delay=Math.random()*200;
          p.animate([{transform:'translate3d(0,0,0) rotate(0deg)',opacity:1},{transform:'translate3d('+driftX+'vw,'+fallY+'vh,0) rotate('+rot+'deg)',opacity:0}],{duration:DURATION+Math.random()*800,delay:delay,easing:'cubic-bezier(.2,.8,.2,1)'});
        }
        setTimeout(function(){ container.remove(); }, DURATION+1000);
      }catch(_){ }
    }

    function fetchCount(){
      return fetch(API.waitlist, { cache: 'no-store', credentials: 'omit' })
        .then(function(r){ if(!r.ok) throw new Error('Fetch failed'); return r.json(); })
        .then(function(data){ var val = Number(data.displayCount||0); try{ sessionStorage.setItem(SESSION_KEY, String(val)); }catch(_){ } if(prefetchTimer){ clearInterval(prefetchTimer); prefetchTimer=null;} animateCountTo(val, 360); lastFetchTs=Date.now(); })
        .catch(function(e){ console.error(e); });
    }

    function startPolling(){
      clearInterval(pollTimer);
      pollTimer = setInterval(function(){ if(document.hidden) return; fetchCount(); }, Math.max(15000, pollInterval*1000));
      document.addEventListener('visibilitychange', function(){ if(!document.hidden && Date.now()-lastFetchTs > Math.max(15000, pollInterval*1000)-1000){ fetchCount(); } });
    }

    function onJoin(){
      if(isPosting) return; isPosting = true; if(btn){ btn.disabled=true; btn.textContent='Joining…'; }
      fetch(API.join, { method:'POST', credentials:'omit' })
        .then(function(r){ if(!r.ok) throw new Error('join failed'); if(window.innerWidth>=768) oneShotConfetti(); setTimeout(fetchCount,1100); })
        .catch(function(e){ console.error(e); })
        .finally(function(){ isPosting=false; if(btn){ btn.disabled=false; btn.textContent = (el.getAttribute('data-cta-label')||'Join the Waitlist'); } });
    }

    // init
    if(sessionStart!=null){ if(countEl) countEl.textContent = sessionStart.toLocaleString(); fetchCount().then(startPolling); }
    else { startPrefetchTick(); fetchCount().then(function(){ if(prefetchTimer){ clearInterval(prefetchTimer); prefetchTimer=null; } startPolling(); }); }
    if(btn) btn.addEventListener('click', onJoin);
  }

  document.addEventListener('DOMContentLoaded', function(){
    var els = document.querySelectorAll('.amorosa-topbar');
    for(var i=0;i<els.length;i++) init(els[i]);
  });
})();


