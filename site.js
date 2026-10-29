var yEl=document.getElementById('y');if(yEl)yEl.textContent=new Date().getFullYear();
// Light that follows the pointer across each glass surface
document.querySelectorAll('.glass').forEach(function(el){
  el.addEventListener('pointermove', function(e){
    var r = el.getBoundingClientRect();
    el.style.setProperty('--mx', (e.clientX - r.left) + 'px');
    el.style.setProperty('--my', (e.clientY - r.top) + 'px');
  });
});

// Sliding glass lens in the nav
(function(){
  var nav=document.querySelector('nav'),lens=nav.querySelector('.lens');
  var links=[].slice.call(nav.querySelectorAll('a'));
  var ids=['top','projects','skills','about','contact'];
  var cur=nav.querySelector('[data-current]')||links[0],at=null,hover=false;

  // Refraction only where backdrop-filter accepts SVG filters (Chromium)
  var uad=navigator.userAgentData;
  if(uad&&uad.brands&&uad.brands.some(function(b){return /Chromium/.test(b.brand)})){
    var svg="<svg xmlns='http://www.w3.org/2000/svg' width='300' height='60' viewBox='0 0 300 60' preserveAspectRatio='none'><defs>"
      +"<linearGradient id='r' x1='0' x2='1' y1='0' y2='0'><stop offset='0' stop-color='rgb(255,0,0)'/><stop offset='.25' stop-color='rgb(128,0,0)'/><stop offset='.75' stop-color='rgb(128,0,0)'/><stop offset='1' stop-color='rgb(0,0,0)'/></linearGradient>"
      +"<linearGradient id='g' x1='0' x2='0' y1='0' y2='1'><stop offset='0' stop-color='rgb(0,255,0)'/><stop offset='.3' stop-color='rgb(0,128,0)'/><stop offset='.7' stop-color='rgb(0,128,0)'/><stop offset='1' stop-color='rgb(0,0,0)'/></linearGradient></defs>"
      +"<rect width='300' height='60' fill='black'/><rect width='300' height='60' fill='url(#r)'/><rect width='300' height='60' fill='url(#g)' style='mix-blend-mode:screen'/></svg>";
    document.getElementById('lgmap').setAttribute('href','data:image/svg+xml,'+encodeURIComponent(svg));
    document.documentElement.classList.add('refract');
  }

  function size(w,h){
    var f=document.getElementById('lg'),i=document.getElementById('lgmap');
    [f,i].forEach(function(el){el.setAttribute('width',w);el.setAttribute('height',h)});
  }
  function place(a,instant){
    if(a===at&&!instant)return;
    lens.style.left=a.offsetLeft+'px';
    lens.style.width=a.offsetWidth+'px';
    size(a.offsetWidth,lens.offsetHeight||40);
    if (!instant && matchMedia('(hover: hover) and (pointer: fine)').matches) {
      lens.classList.remove('squish');
      void lens.offsetWidth;
      lens.classList.add('squish');
    }
    at=a;
  }
  function init(){
    lens.style.transition='none';at=null;place(cur,true);
    requestAnimationFrame(function(){requestAnimationFrame(function(){lens.style.transition=''})});
  }
  function setCur(a){
    if(a===cur)return;
    cur.classList.remove('on');cur=a;cur.classList.add('on');
    if(!hover)place(cur);
    if(nav.scrollWidth>nav.clientWidth)nav.scrollTo({left:a.offsetLeft-24,behavior:'smooth'});
  }
  links.forEach(function(a){
    a.addEventListener('pointerenter',function(){hover=true;place(a)});
    a.addEventListener('focus',function(){place(a)});
    a.addEventListener('click',function(){setCur(a)});
  });
  nav.addEventListener('pointerleave',function(){hover=false;place(cur)});
  nav.addEventListener('focusout',function(){place(cur)});

  var tick=false;
  function spy(){
    tick=false;var y=window.scrollY,idx=0;
    ids.forEach(function(id,n){
      var el=document.getElementById(id);
      if(id!=='top'&&el&&el.getBoundingClientRect().top<=window.innerHeight*0.4)idx=n;
    });
    if(window.innerHeight+y>=document.documentElement.scrollHeight-4)idx=ids.length-1;
    setCur(links[idx]);
  }
  var home=!!document.getElementById('projects');
  if(home)window.addEventListener('scroll',function(){if(!tick){tick=true;requestAnimationFrame(spy)}},{passive:true});
  window.addEventListener('resize',init);
  window.addEventListener('load',function(){init();if(home)spy()});
  cur.classList.add('on');init();
})();

// Cursor halo, smooth scroll, and parallax (mouse and trackpad devices only)
(function(){
  if(!matchMedia('(hover:hover) and (pointer:fine)').matches)return;
  var reduce=matchMedia('(prefers-reduced-motion:reduce)').matches;
  var root=document.documentElement;
  var halo=document.createElement('div');halo.className='halo';halo.innerHTML='<i></i>';
  var dot=document.createElement('div');dot.className='dot';
  document.body.appendChild(halo);document.body.appendChild(dot);

  var mx=innerWidth/2,my=innerHeight/2,hx=mx,hy=my,sx=0,sy=0,seen=false,k=reduce?1:.16;
  var flow=document.getElementById('flowg'),wing=document.getElementById('wingp'),hero=document.querySelector('.hero-card');

  addEventListener('pointermove',function(e){
    mx=e.clientX;my=e.clientY;
    if(!seen){seen=true;hx=mx;hy=my;root.classList.add('fx')}
    halo.classList.add('on');dot.classList.add('on');
    var t=e.target.closest&&e.target.closest('a,button,.card');
    halo.classList.toggle('hot',!!t);
  },{passive:true});
  root.addEventListener('mouseleave',function(){halo.classList.remove('on');dot.classList.remove('on')});
  addEventListener('pointerdown',function(){halo.classList.add('down')});
  addEventListener('pointerup',function(){halo.classList.remove('down')});

  function frame(){
    hx+=(mx-hx)*k;hy+=(my-hy)*k;
    dot.style.transform='translate3d('+mx+'px,'+my+'px,0) translate(-50%,-50%)';
    halo.style.transform='translate3d('+hx+'px,'+hy+'px,0) translate(-50%,-50%)';
    if(!reduce){
      sx+=((mx/innerWidth-.5)-sx)*.06;sy+=((my/innerHeight-.5)-sy)*.06;
      var y=Math.min(scrollY,1400);
      flow.style.transform='translate('+(-sx*20)+'px,'+(-y*.07-sy*16)+'px)';
      wing.style.transform='translate('+(sx*40)+'px,'+(-y*.10+sy*26)+'px)';
      if(hero&&hero.getBoundingClientRect().bottom>0){
        hero.style.transform='perspective(1000px) rotateY('+(sx*3)+'deg) rotateX('+(-sy*3)+'deg)';
      }
    }
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);

  if(reduce)return;
  // Inertial smooth scrolling
  root.classList.add('smooth');
  var cur=scrollY,target=scrollY,run=false;
  function max(){return root.scrollHeight-innerHeight}
  function go(){
    cur+=(target-cur)*.09;
    if(Math.abs(target-cur)<.4){cur=target;run=false}
    scrollTo(0,cur);
    if(run)requestAnimationFrame(go);
  }
  function start(){if(!run){run=true;requestAnimationFrame(go)}}
  addEventListener('wheel',function(e){
    if(e.ctrlKey||Math.abs(e.deltaX)>Math.abs(e.deltaY))return;
    e.preventDefault();
    if(!run){cur=target=scrollY}
    var d=e.deltaMode===1?e.deltaY*32:e.deltaMode===2?e.deltaY*innerHeight:e.deltaY;
    target=Math.max(0,Math.min(max(),target+d));
    start();
  },{passive:false});
  addEventListener('scroll',function(){if(!run){cur=target=scrollY}},{passive:true});
  document.addEventListener('click',function(e){
    var a=e.target.closest&&e.target.closest('a[href^="#"]');
    if(!a)return;
    var h=a.getAttribute('href'),el=document.getElementById(h.slice(1));
    if(!el)return;
    e.preventDefault();
    cur=scrollY;
    target=h==='#top'?0:Math.max(0,Math.min(max(),el.getBoundingClientRect().top+scrollY-90));
    start();
    history.replaceState(null,'',h);
  });
})();

// Project gallery with lightbox
(function(){
  var sec=document.getElementById('gallery-section');
  if(!sec)return;
  var lb,list,i,x0=0;
  function live(){return [].slice.call(sec.querySelectorAll('.shot img'))}
  addEventListener('load',function(){if(!live().length)sec.hidden=true});
  function show(n){
    i=(n+list.length)%list.length;
    var im=lb.querySelector('img');im.src=list[i].src;im.alt=list[i].alt;
  }
  function close(){if(lb){lb.remove();lb=null;document.removeEventListener('keydown',key)}}
  function key(e){
    if(e.key==='Escape')close();
    if(e.key==='ArrowLeft')show(i-1);
    if(e.key==='ArrowRight')show(i+1);
  }
  function open(n){
    list=live();
    lb=document.createElement('div');lb.className='lb';
    lb.setAttribute('role','dialog');lb.setAttribute('aria-modal','true');lb.setAttribute('aria-label','Photo viewer');
    lb.innerHTML='<img alt=""><button class="lbb x" type="button">Close</button><button class="lbb p" type="button">Previous</button><button class="lbb n" type="button">Next</button>';
    document.body.appendChild(lb);show(n);
    lb.addEventListener('click',function(e){
      var c=e.target.classList;
      if(c.contains('p'))show(i-1);
      else if(c.contains('n'))show(i+1);
      else if(c.contains('x')||e.target===lb)close();
    });
    lb.addEventListener('touchstart',function(e){x0=e.touches[0].clientX},{passive:true});
    lb.addEventListener('touchend',function(e){var d=e.changedTouches[0].clientX-x0;if(Math.abs(d)>50)show(d>0?i-1:i+1)});
    document.addEventListener('keydown',key);
  }
  sec.addEventListener('click',function(e){
    var b=e.target.closest('.shot');if(!b)return;
    var im=b.querySelector('img');open(live().indexOf(im));
  });
})();
