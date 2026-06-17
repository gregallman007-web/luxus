/* ===================================================================
   LUXUS — site interactions
   header state · mobile menu · scroll-reveal · counters · hero shader
   =================================================================== */
(function(){
  'use strict';
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---- header scrolled state ---- */
  var header = document.querySelector('.site-header');
  function onScroll(){ if(header){ header.classList.toggle('scrolled', window.scrollY > 40); } }
  window.addEventListener('scroll', onScroll, {passive:true}); onScroll();

  /* ---- mobile menu ---- */
  var burger = document.querySelector('.burger');
  var mnav = document.querySelector('.mnav');
  function setMenu(open){
    if(!burger||!mnav) return;
    burger.classList.toggle('open', open);
    mnav.classList.toggle('open', open);
    document.body.style.overflow = open ? 'hidden' : '';
  }
  if(burger){ burger.addEventListener('click', function(){ setMenu(!mnav.classList.contains('open')); }); }
  if(mnav){ mnav.querySelectorAll('a').forEach(function(a){ a.addEventListener('click', function(){ setMenu(false); }); }); }

  /* ---- scroll reveal ---- */
  var reveals = [].slice.call(document.querySelectorAll('.reveal'));
  if(reduce || !('IntersectionObserver' in window)){
    reveals.forEach(function(el){ el.classList.add('in'); });
  } else {
    var io = new IntersectionObserver(function(entries){
      entries.forEach(function(en){
        if(en.isIntersecting){ en.target.classList.add('in'); io.unobserve(en.target); }
      });
    }, {threshold:0.14, rootMargin:'0px 0px -8% 0px'});
    reveals.forEach(function(el){ io.observe(el); });
  }

  /* ---- animated counters ---- */
  function animateCount(el){
    var raw = el.getAttribute('data-count');
    var target = parseFloat(raw);
    var suffix = el.getAttribute('data-suffix') || '';
    var prefix = el.getAttribute('data-prefix') || '';
    var decimals = (raw.split('.')[1]||'').length;
    if(reduce){ el.textContent = prefix+raw+suffix; return; }
    var dur = 1600, start = null;
    function tick(ts){
      if(start===null) start = ts;
      var p = Math.min((ts-start)/dur, 1);
      var eased = 1 - Math.pow(1-p, 3);
      var val = (target*eased).toFixed(decimals);
      el.textContent = prefix + val + suffix;
      if(p<1) requestAnimationFrame(tick);
      else el.textContent = prefix + raw + suffix;
    }
    requestAnimationFrame(tick);
  }
  var counters = [].slice.call(document.querySelectorAll('[data-count]'));
  if(counters.length){
    if(reduce || !('IntersectionObserver' in window)){
      counters.forEach(animateCount);
    } else {
      var cio = new IntersectionObserver(function(entries){
        entries.forEach(function(en){ if(en.isIntersecting){ animateCount(en.target); cio.unobserve(en.target); } });
      }, {threshold:0.6});
      counters.forEach(function(el){ cio.observe(el); });
    }
  }

  /* ---- hero entrance failsafe (never leave text hidden) ---- */
  setTimeout(function(){
    document.querySelectorAll('.hero .anim').forEach(function(e){ e.style.opacity='1'; e.style.transform='none'; });
    document.querySelectorAll('.hero h1 .ln > span').forEach(function(e){ e.style.transform='none'; });
  }, 2600);

  /* =================================================================
     LIQUID GOLD — hero WebGL shader (optimized, offscreen-pausing)
     ================================================================= */
  var holder = document.querySelector('.hero');
  var canvas = document.getElementById('gl');
  if(!holder || !canvas) return;
  var gl = canvas.getContext('webgl',{antialias:false,alpha:false,depth:false,stencil:false,preserveDrawingBuffer:true,powerPreference:'low-power'})
        || canvas.getContext('experimental-webgl',{alpha:false,preserveDrawingBuffer:true});
  window.__glStatus = {ctx:!!gl, err:null, frames:0};
  if(!gl){ holder.classList.add('no-gl'); window.__glStatus.err='no-webgl'; return; }

  var VERT='attribute vec2 a_pos;void main(){gl_Position=vec4(a_pos,0.0,1.0);}';
  var FRAG=[
    'precision mediump float;',
    'uniform vec2 u_res; uniform float u_time; uniform vec2 u_mouse; uniform float u_amp;',
    'vec2 hash2(vec2 p){p=vec2(dot(p,vec2(127.1,311.7)),dot(p,vec2(269.5,183.3)));return -1.0+2.0*fract(sin(p)*43758.5453123);}',
    'float noise(vec2 p){vec2 i=floor(p),f=fract(p);vec2 u=f*f*(3.0-2.0*f);',
    ' return mix(mix(dot(hash2(i+vec2(0.0,0.0)),f-vec2(0.0,0.0)),dot(hash2(i+vec2(1.0,0.0)),f-vec2(1.0,0.0)),u.x),',
    '            mix(dot(hash2(i+vec2(0.0,1.0)),f-vec2(0.0,1.0)),dot(hash2(i+vec2(1.0,1.0)),f-vec2(1.0,1.0)),u.x),u.y);}',
    'mat2 M=mat2(1.6,1.2,-1.2,1.6);',
    'float fbm(vec2 p){float v=0.0,a=0.5;for(int i=0;i<4;i++){v+=a*noise(p);p=M*p;a*=0.5;}return v;}',
    'float height(vec2 p,float t,out vec2 warp){',
    ' vec2 q=vec2(fbm(p*1.4+vec2(0.0,t)),fbm(p*1.4+vec2(5.2,1.3)-t));',
    ' warp=q; return fbm(p*1.4+1.9*q+vec2(1.4,3.1));}',
    'void main(){',
    ' vec2 fc=gl_FragCoord.xy; vec2 p=(fc-0.5*u_res)/u_res.y; float t=u_time*0.05;',
    ' vec2 m=(u_mouse-0.5*u_res)/u_res.y;',
    ' float md=length(p-m); p+=normalize(p-m+1e-4)*sin(md*16.0-u_time*2.2)*exp(-md*3.5)*0.045*u_amp;',
    ' vec2 warp; float h0=height(p,t,warp);',
    ' float band=p.x*0.62+p.y*0.4+warp.x*1.0+0.18;',
    ' float e=0.02; vec2 wt;',
    ' float hx=height(p+vec2(e,0.0),t,wt)-h0;',
    ' float hy=height(p+vec2(0.0,e),t,wt)-h0;',
    ' vec3 n=normalize(vec3(-hx,-hy,e*1.7));',
    ' vec3 L=normalize(vec3(0.55,0.6,0.85)); vec3 H=normalize(L+vec3(0.0,0.0,1.0));',
    ' float diff=clamp(dot(n,L),0.0,1.0); float spec=pow(clamp(dot(n,H),0.0,1.0),20.0);',
    ' float goldMask=smoothstep(0.62,0.02,abs(band));',
    ' float posFall=smoothstep(-0.24,0.46,p.x-p.y*0.42);',
    ' float hh=clamp(h0+0.5,0.0,1.0);',
    ' float g=goldMask*posFall*smoothstep(0.05,0.62,hh);',
    ' vec3 cDeep=vec3(0.400,0.305,0.160),cDark=vec3(0.557,0.439,0.243),cMid=vec3(0.761,0.627,0.416),cLight=vec3(0.949,0.886,0.745);',
    ' vec3 gold=mix(cDark,cMid,smoothstep(0.0,0.55,hh)); gold=mix(gold,cLight,smoothstep(0.55,0.96,hh));',
    ' gold=mix(cDeep,gold,smoothstep(0.0,0.28,hh));',
    ' gold=gold*(0.45+0.75*diff)+spec*vec3(1.0,0.94,0.8)*0.9;',
    ' vec3 black=vec3(0.027,0.027,0.029);',
    ' vec3 col=mix(black,gold,clamp(g,0.0,1.0));',
    ' col+=cMid*goldMask*posFall*0.05;',
    ' float vig=smoothstep(1.5,0.35,length(p*vec2(0.8,1.0))); col*=mix(0.72,1.06,vig);',
    ' float grain=(fract(sin(dot(fc,vec2(12.9898,78.233)))*43758.545)-0.5)*0.025; col+=grain;',
    ' gl_FragColor=vec4(col,1.0);',
    '}'
  ].join('\n');

  function compile(type,src){var s=gl.createShader(type);gl.shaderSource(s,src);gl.compileShader(s);
    return gl.getShaderParameter(s,gl.COMPILE_STATUS)?s:null;}
  var vs=compile(gl.VERTEX_SHADER,VERT), fs=compile(gl.FRAGMENT_SHADER,FRAG);
  if(!vs||!fs){ holder.classList.add('no-gl'); window.__glStatus.err='compile'; return; }
  var prog=gl.createProgram();gl.attachShader(prog,vs);gl.attachShader(prog,fs);gl.linkProgram(prog);
  if(!gl.getProgramParameter(prog,gl.LINK_STATUS)){ holder.classList.add('no-gl'); window.__glStatus.err='link'; return; }
  gl.useProgram(prog);
  var buf=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,buf);
  gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,3,-1,-1,3]),gl.STATIC_DRAW);
  var loc=gl.getAttribLocation(prog,'a_pos');gl.enableVertexAttribArray(loc);gl.vertexAttribPointer(loc,2,gl.FLOAT,false,0,0);
  var uRes=gl.getUniformLocation(prog,'u_res'),uTime=gl.getUniformLocation(prog,'u_time'),
      uMouse=gl.getUniformLocation(prog,'u_mouse'),uAmp=gl.getUniformLocation(prog,'u_amp');

  var DPR=Math.min(window.devicePixelRatio||1,1.5), QUALITY=0.85, scale=DPR*QUALITY;
  function resize(){
    var w=holder.clientWidth||window.innerWidth, h=holder.clientHeight||window.innerHeight;
    canvas.width=Math.max(2,Math.floor(w*scale)); canvas.height=Math.max(2,Math.floor(h*scale));
    gl.viewport(0,0,canvas.width,canvas.height);
  }
  window.addEventListener('resize',resize); resize();

  var mouse={x:canvas.width*0.72,y:canvas.height*0.5}, tgt={x:mouse.x,y:mouse.y};
  function onMove(cx,cy){var r=holder.getBoundingClientRect();tgt.x=(cx-r.left)*scale;tgt.y=(r.height-(cy-r.top))*scale;}
  window.addEventListener('pointermove',function(e){onMove(e.clientX,e.clientY);});
  window.addEventListener('touchmove',function(e){if(e.touches[0])onMove(e.touches[0].clientX,e.touches[0].clientY);},{passive:true});

  var amp=reduce?0.0:1.0, start=(window.performance&&performance.now)?performance.now():Date.now();
  function draw(t){
    mouse.x+=(tgt.x-mouse.x)*0.06; mouse.y+=(tgt.y-mouse.y)*0.06;
    gl.uniform2f(uRes,canvas.width,canvas.height);
    gl.uniform1f(uTime,t); gl.uniform2f(uMouse,mouse.x,mouse.y); gl.uniform1f(uAmp,amp);
    gl.drawArrays(gl.TRIANGLES,0,3);
    window.__glStatus.frames++;
  }
  window.__lxDraw=draw;
  draw(reduce?8.0:0.0); // guaranteed first frame

  var running=false, rafId=0;
  function loop(now){ if(!running) return; draw(((now||(performance.now?performance.now():Date.now()))-start)/1000); rafId=requestAnimationFrame(loop); }
  function startLoop(){ if(reduce) return; if(!running){ running=true; rafId=requestAnimationFrame(loop); } }
  function stopLoop(){ running=false; if(rafId) cancelAnimationFrame(rafId); }
  document.addEventListener('visibilitychange',function(){ document.hidden?stopLoop():startLoop(); });
  if('IntersectionObserver' in window){
    new IntersectionObserver(function(es){ es.forEach(function(en){ en.isIntersecting?startLoop():stopLoop(); }); },{threshold:0.02}).observe(holder);
  } else { startLoop(); }
  if(!document.hidden) startLoop();
})();
