/* Luxus — "The Alchemy" liquid-gold WebGL hero.
   Self-contained WebGL1 fragment shader: molten champagne metal flowing through
   a black field, reacting to the pointer. Falls back gracefully + respects
   prefers-reduced-motion. Designed to drop into an Elementor HTML block. */
(function(){
  var canvas = document.getElementById('gl');
  var gl = canvas.getContext('webgl', {antialias:true, preserveDrawingBuffer:true, alpha:false})
        || canvas.getContext('experimental-webgl', {preserveDrawingBuffer:true});
  window.__glStatus = {ctx:!!gl, vert:null, frag:null, link:null, err:null};

  if(!gl){
    canvas.style.background = 'radial-gradient(60% 80% at 78% 60%, #6e5630 0%, #2a2218 30%, #0a0a0a 70%)';
    window.__glStatus.err = 'no-webgl';
    return;
  }

  var VERT = [
    'attribute vec2 a_pos;',
    'void main(){ gl_Position = vec4(a_pos,0.0,1.0); }'
  ].join('\n');

  var FRAG = [
    'precision highp float;',
    'uniform vec2 u_res; uniform float u_time; uniform vec2 u_mouse; uniform float u_amp;',
    'vec2 hash2(vec2 p){ p=vec2(dot(p,vec2(127.1,311.7)),dot(p,vec2(269.5,183.3))); return -1.0+2.0*fract(sin(p)*43758.5453123); }',
    'float noise(vec2 p){ vec2 i=floor(p),f=fract(p); vec2 u=f*f*(3.0-2.0*f);',
    '  return mix(mix(dot(hash2(i+vec2(0.0,0.0)),f-vec2(0.0,0.0)),dot(hash2(i+vec2(1.0,0.0)),f-vec2(1.0,0.0)),u.x),',
    '             mix(dot(hash2(i+vec2(0.0,1.0)),f-vec2(0.0,1.0)),dot(hash2(i+vec2(1.0,1.0)),f-vec2(1.0,1.0)),u.x),u.y); }',
    'mat2 M=mat2(1.6,1.2,-1.2,1.6);',
    'float fbm(vec2 p){ float v=0.0,a=0.5; for(int i=0;i<6;i++){ v+=a*noise(p); p=M*p; a*=0.5; } return v; }',
    'float height(vec2 p, float t, out vec2 warp){',
    '  vec2 q=vec2(fbm(p*1.4+vec2(0.0,t)), fbm(p*1.4+vec2(5.2,1.3)-t));',
    '  vec2 r=vec2(fbm(p*1.4+2.0*q+vec2(1.7,9.2)+0.15*t), fbm(p*1.4+2.0*q+vec2(8.3,2.8)-0.12*t));',
    '  warp=r; return fbm(p*1.4+3.0*r); }',
    'void main(){',
    '  vec2 fc=gl_FragCoord.xy; vec2 p=(fc-0.5*u_res)/u_res.y; float t=u_time*0.05;',
    '  vec2 m=(u_mouse-0.5*u_res)/u_res.y;',
    '  float md=length(p-m); p+= normalize(p-m+1e-4)*sin(md*16.0-u_time*2.2)*exp(-md*3.5)*0.05*u_amp;',
    '  vec2 warp; float h=height(p,t,warp);',
    '  float e=0.012; vec2 w2;',
    '  float hx=height(p+vec2(e,0.0),t,w2)-height(p-vec2(e,0.0),t,w2);',
    '  float hy=height(p+vec2(0.0,e),t,w2)-height(p-vec2(0.0,e),t,w2);',
    '  vec3 n=normalize(vec3(-hx,-hy,e*2.2));',
    '  vec3 L=normalize(vec3(0.55,0.6,0.85)); vec3 V=vec3(0.0,0.0,1.0); vec3 H=normalize(L+V);',
    '  float diff=clamp(dot(n,L),0.0,1.0); float spec=pow(clamp(dot(n,H),0.0,1.0),22.0);',
    '  float band=p.x*0.62+p.y*0.4+warp.x*1.0+0.18;',
    '  float goldMask=smoothstep(0.62,0.02,abs(band));',
    '  float posFall=smoothstep(-0.24,0.46,p.x - p.y*0.42);',
    '  float hh=clamp(h+0.5,0.0,1.0);',
    '  float g=goldMask*posFall*smoothstep(0.05,0.62,hh);',
    '  vec3 cDeep=vec3(0.400,0.305,0.160); vec3 cDark=vec3(0.557,0.439,0.243);',
    '  vec3 cMid=vec3(0.761,0.627,0.416); vec3 cLight=vec3(0.949,0.886,0.745);',
    '  vec3 gold=mix(cDark,cMid,smoothstep(0.0,0.55,hh)); gold=mix(gold,cLight,smoothstep(0.55,0.96,hh));',
    '  gold=mix(cDeep,gold,smoothstep(0.0,0.28,hh));',
    '  gold=gold*(0.45+0.75*diff)+spec*vec3(1.0,0.94,0.8)*0.9;',
    '  vec3 black=vec3(0.027,0.027,0.029);',
    '  vec3 col=mix(black,gold,clamp(g,0.0,1.0));',
    '  col+=cMid*goldMask*posFall*0.05;',           // ambient gold bloom
    '  float vig=smoothstep(1.5,0.35,length(p*vec2(0.8,1.0))); col*=mix(0.72,1.06,vig);',
    '  float grain=(fract(sin(dot(fc,vec2(12.9898,78.233)))*43758.545)-0.5)*0.025; col+=grain;',
    '  gl_FragColor=vec4(col,1.0);',
    '}'
  ].join('\n');

  function compile(type,src,key){
    var s=gl.createShader(type); gl.shaderSource(s,src); gl.compileShader(s);
    var ok=gl.getShaderParameter(s,gl.COMPILE_STATUS);
    window.__glStatus[key]= ok?'ok':gl.getShaderInfoLog(s);
    return ok?s:null;
  }
  var vs=compile(gl.VERTEX_SHADER,VERT,'vert');
  var fs=compile(gl.FRAGMENT_SHADER,FRAG,'frag');
  if(!vs||!fs){ window.__glStatus.err='compile'; return; }
  var prog=gl.createProgram(); gl.attachShader(prog,vs); gl.attachShader(prog,fs); gl.linkProgram(prog);
  window.__glStatus.link = gl.getProgramParameter(prog,gl.LINK_STATUS)?'ok':gl.getProgramInfoLog(prog);
  if(!gl.getProgramParameter(prog,gl.LINK_STATUS)){ window.__glStatus.err='link'; return; }
  gl.useProgram(prog);

  var buf=gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER,buf);
  gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1, 3,-1, -1,3]),gl.STATIC_DRAW);
  var loc=gl.getAttribLocation(prog,'a_pos'); gl.enableVertexAttribArray(loc);
  gl.vertexAttribPointer(loc,2,gl.FLOAT,false,0,0);

  var uRes=gl.getUniformLocation(prog,'u_res'), uTime=gl.getUniformLocation(prog,'u_time'),
      uMouse=gl.getUniformLocation(prog,'u_mouse'), uAmp=gl.getUniformLocation(prog,'u_amp');

  var DPR=Math.min(window.devicePixelRatio||1, 2);
  function resize(){
    var w=canvas.clientWidth||window.innerWidth, h=canvas.clientHeight||window.innerHeight;
    canvas.width=Math.floor(w*DPR); canvas.height=Math.floor(h*DPR);
    gl.viewport(0,0,canvas.width,canvas.height);
  }
  window.addEventListener('resize',resize); resize();

  var mouse={x:canvas.width*0.7,y:canvas.height*0.5}, tgt={x:mouse.x,y:mouse.y};
  function onMove(cx,cy){ tgt.x=cx*DPR; tgt.y=(canvas.clientHeight-cy)*DPR; }
  window.addEventListener('pointermove',function(e){ onMove(e.clientX,e.clientY); });
  window.addEventListener('touchmove',function(e){ if(e.touches[0]) onMove(e.touches[0].clientX,e.touches[0].clientY); },{passive:true});

  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var amp = reduce?0.0:1.0;
  var start=performance.now(); var frozenTime= reduce? 8.0 : null;

  function draw(t){
    mouse.x += (tgt.x-mouse.x)*0.06; mouse.y += (tgt.y-mouse.y)*0.06;
    gl.uniform2f(uRes,canvas.width,canvas.height);
    gl.uniform1f(uTime,t);
    gl.uniform2f(uMouse,mouse.x,mouse.y);
    gl.uniform1f(uAmp,amp);
    gl.drawArrays(gl.TRIANGLES,0,3);
    window.__glStatus.frames=(window.__glStatus.frames||0)+1;
  }
  window.__lxDraw=draw; // verification hook (forces a frame even when rAF is paused)

  function frame(now){
    var t = frozenTime!==null ? frozenTime : (now-start)/1000;
    draw(t);
    if(frozenTime===null) requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);

  // ---- GSAP entrance ----
  if(window.gsap && !reduce){
    var tl=gsap.timeline({defaults:{ease:'power3.out'}});
    tl.from('.alc .word',{y:-18,opacity:0,duration:1.0},0.1)
      .from('.alc .nav a',{y:-12,opacity:0,duration:0.7,stagger:0.05},0.2)
      .from('.alc .k span',{yPercent:120,opacity:0,duration:0.9},0.3)
      .from('.alc h1 .ln > span',{yPercent:120,duration:1.1,stagger:0.12},'-=0.5')
      .from('.alc .lede',{y:18,opacity:0,duration:0.9},'-=0.5')
      .from('.alc .cta-row a',{y:18,opacity:0,duration:0.8,stagger:0.1},'-=0.5')
      .from('.alc .vcap',{opacity:0,duration:1.0},'-=0.6')
      .from('.alc .scrollcue',{opacity:0,duration:1.0},'-=0.4');
  }
})();
