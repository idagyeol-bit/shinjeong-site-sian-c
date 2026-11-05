/* 신정개발 메인 첫 화면 — 큰 틀 'story': 3D 작업 이야기 (시안C 26차, three.js r160 · 저장소 js/vendor/three 만 사용, 바깥 주소 없음)
   기술소개서(2025) 19쪽 'Robot-Tank Cleaning System' 절차 여섯 단계를 64초 한 바퀴로 보여 준다.
   01 System 설치 → 02 1차 Washing(Vacuum Car) → 03 내부 Cleaning(로봇 투입 · 제어 차량 CCTV 원격 조정 · 1차 회수)
   → 04 2차 Washing(전면 Jet Nozzle) → 05 Final Cleaning(작업자) → 06 폐기물 처리
   - 모든 움직임은 시각 t 하나로 정해진다(같은 t 는 언제나 같은 화면). 확인용 주소 변수: ?t=초(그 순간에 멈춤) · ?q=high|mid|low(화질) · ?wait=ms
   - 사람 = 뼈대 모형(assets/models/xbot.glb, 걷기 · 서기 동작) · 로봇 = assets/models/robot5-hero.glb · 빛 = assets/hdr/quarry_01_1k.hdr
   - WebGL 이 없거나 모형을 못 받으면 .h3d 에 is-fallback 을 달아 사진(HF01)만 남긴다. '움직임 줄이기' 설정이면 34초 장면 한 장으로 멈춘다.
   - 화면 밖으로 나가거나 탭이 숨으면 멈춘다(배터리). 자리(경로)는 이 파일의 위치(js/)를 기준으로 찾으므로 test/ 같은 시안 폴더에서도 그대로 돈다. */
(function () {
  'use strict';
  var box = document.querySelector('.h3d'); if (!box) return;
  var wrap = box.querySelector('.h3d__gl');
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var me = (document.currentScript && document.currentScript.src) || new URL('js/hero-story.js', document.baseURI).href, root = new URL('../', me).href, base = root + 'js/vendor/three/';
  var Q = new URLSearchParams(location.search); function qn(k, d) { var v = parseFloat(Q.get(k)); return isNaN(v) ? d : v; }
  function webglOk() { try { var c = document.createElement('canvas'); return !!(window.WebGLRenderingContext && (c.getContext('webgl2') || c.getContext('webgl'))); } catch (e) { return false; } }
  if (!webglOk()) { box.classList.add('is-fallback'); return; }
  var mods = ['three.module.min.js', 'loaders/GLTFLoader.js', 'objects/Sky.js', 'geometries/RoundedBoxGeometry.js', 'postprocessing/EffectComposer.js', 'postprocessing/RenderPass.js', 'postprocessing/GTAOPass.js', 'postprocessing/UnrealBloomPass.js', 'postprocessing/SMAAPass.js', 'postprocessing/OutputPass.js', 'loaders/RGBELoader.js', 'utils/SkeletonUtils.js', 'postprocessing/BokehPass.js', 'postprocessing/ShaderPass.js'];
  Promise.all(mods.map(function (m) { return import(base + m); })).then(function (m) {
    var THREE = m[0], GLTFLoader = m[1].GLTFLoader, Sky = m[2].Sky, RBox = m[3].RoundedBoxGeometry, EffectComposer = m[4].EffectComposer, RenderPass = m[5].RenderPass, GTAOPass = m[6].GTAOPass, UnrealBloomPass = m[7].UnrealBloomPass, SMAAPass = m[8].SMAAPass, OutputPass = m[9].OutputPass, RGBELoader = m[10].RGBELoader, skClone = m[11].clone, BokehPass = m[12].BokehPass, ShaderPass = m[13].ShaderPass;
    var V3 = THREE.Vector3, PI = Math.PI, TAU = PI * 2;
    var W = wrap.clientWidth, H = wrap.clientHeight, mobile = W < 700;
    var quality = Q.get('q') || (mobile ? 'mid' : 'high');
    var renderer = new THREE.WebGLRenderer({ antialias: quality === 'low', powerPreference: 'high-performance' });
    var pr = qn('pr', Math.min(window.devicePixelRatio || 1, quality === 'high' ? 1.5 : 1.25)); renderer.setPixelRatio(pr); renderer.setSize(W, H);
    renderer.outputColorSpace = THREE.SRGBColorSpace; renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = qn('exp', 0.62);
    renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    wrap.insertBefore(renderer.domElement, wrap.firstChild);
    var scene = new THREE.Scene();
    var seed = 9127; function rnd() { seed |= 0; seed = seed + 0x6D2B79F5 | 0; var t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }
    function hash(i) { var x = Math.sin(i * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); }
    function clamp(x, a, b) { return x < a ? a : x > b ? b : x; }
    function sstep(a, b, x) { var k = clamp((x - a) / (b - a), 0, 1); return k * k * (3 - 2 * k); }
    function lerp(a, b, k) { return a + (b - a) * k; }
    function easeIO(k) { return -(Math.cos(PI * clamp(k, 0, 1)) - 1) / 2; }

    /* ===== 하늘 · 해 · 환경 ===== */
    var sky = new Sky(); sky.scale.setScalar(4000); scene.add(sky);
    function skyU(s) { var u = s.material.uniforms; u.turbidity.value = 2.0; u.rayleigh.value = 1.35; u.mieCoefficient.value = 0.004; u.mieDirectionalG.value = 0.8; return u; }
    var sunDir = new V3().setFromSphericalCoords(1, THREE.MathUtils.degToRad(90 - qn('el', 36)), THREE.MathUtils.degToRad(qn('az', 32)));
    skyU(sky).sunPosition.value.copy(sunDir);
    var pm = new THREE.PMREMGenerator(renderer); var envScene = new THREE.Scene(); var sky2 = new Sky(); sky2.scale.setScalar(4000); skyU(sky2).sunPosition.value.copy(sunDir); envScene.add(sky2);
    scene.environment = pm.fromScene(envScene, 0, 0.1, 1000).texture;
    var hdrOk = false; new RGBELoader().load(new URL(box.getAttribute('data-hdr') || 'assets/hdr/quarry_01_1k.hdr', root).href, function (tex) { tex.mapping = THREE.EquirectangularReflectionMapping; scene.environment = pm.fromEquirectangular(tex).texture; tex.dispose(); pm.dispose(); hdrOk = true; begin(); }, undefined, function () { hdrOk = true; begin(); });
    scene.fog = new THREE.Fog(0xbfcedc, 80, 260);
    scene.add(new THREE.HemisphereLight(0xcfdff0, 0x6f7376, 0.12));
    var sun = new THREE.DirectionalLight(0xfff0dc, 2.6); var sunT = new V3(-6, 0, 2); sun.position.copy(sunDir).multiplyScalar(70).add(sunT); sun.target.position.copy(sunT); scene.add(sun.target); sun.castShadow = true;
    sun.shadow.mapSize.set(qn('sm', 2048), qn('sm', 2048)); var sc = sun.shadow.camera; sc.left = -27; sc.right = 27; sc.top = 24; sc.bottom = -22; sc.near = 20; sc.far = 140; sun.shadow.bias = -0.0003; sun.shadow.normalBias = 0.025; sun.shadow.radius = 2.5; scene.add(sun);

    /* ===== 질감 ===== */
    function cnv(w, h) { var c = document.createElement('canvas'); c.width = w; c.height = h || w; return c; }
    function ctex(c, srgb, rep) { var t = new THREE.CanvasTexture(c); if (srgb) t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; if (rep) { t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(rep, rep); } return t; }
    function noiseC(size, b, amp) { var c = cnv(size), g = c.getContext('2d'), im = g.createImageData(size, size), d = im.data; for (var i = 0; i < size * size; i++) { var n = clamp(b + (rnd() - 0.5) * amp, 0, 255); d[i * 4] = d[i * 4 + 1] = d[i * 4 + 2] = n; d[i * 4 + 3] = 255; } g.putImageData(im, 0, 0); return c; }
    var concreteN = ctex(noiseC(256, 150, 60), false, 26), asphaltN = ctex(noiseC(256, 120, 70), false, 30), fineN = ctex(noiseC(128, 128, 90), false, 3);
    function normalFromHeight(c, strength) {   // 높이 캔버스 → 법선 지도
      var w = c.width, h = c.height, g = c.getContext('2d'), d = g.getImageData(0, 0, w, h).data, o = cnv(w, h), og = o.getContext('2d'), im = og.createImageData(w, h), od = im.data;
      function hgt(x, y) { x = (x + w) % w; y = (y + h) % h; return d[(y * w + x) * 4] / 255; }
      for (var y = 0; y < h; y++) for (var x = 0; x < w; x++) { var dx = (hgt(x + 1, y) - hgt(x - 1, y)) * strength, dy = (hgt(x, y + 1) - hgt(x, y - 1)) * strength; var l = Math.sqrt(dx * dx + dy * dy + 1); var i = (y * w + x) * 4; od[i] = (-dx / l * 0.5 + 0.5) * 255; od[i + 1] = (-dy / l * 0.5 + 0.5) * 255; od[i + 2] = (1 / l * 0.5 + 0.5) * 255; od[i + 3] = 255; }
      og.putImageData(im, 0, 0); return o;
    }
    function blurC(c, px) { var o = cnv(c.width, c.height), g = o.getContext('2d'); g.filter = 'blur(' + px + 'px)'; g.drawImage(c, 0, 0); return o; }
    var concreteNM = ctex(normalFromHeight(blurC(noiseC(256, 128, 160), 1.2), 2.2), false, 26), asphaltNM = ctex(normalFromHeight(blurC(noiseC(256, 128, 200), 0.8), 2.6), false, 30), fineNM = ctex(normalFromHeight(blurC(noiseC(128, 128, 200), 0.6), 1.6), false, 3);
    function grime(top, bot, streaks, w, h) {
      var c = cnv(w || 512, h || 512), g = c.getContext('2d'); w = c.width; h = c.height; var gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, top); gr.addColorStop(0.7, top); gr.addColorStop(1, bot); g.fillStyle = gr; g.fillRect(0, 0, w, h);
      for (var i = 0; i < streaks; i++) { var x = rnd() * w, sw = 2 + rnd() * 6, y0 = h * (0.3 + rnd() * 0.5), a = 0.04 + rnd() * 0.1, sg = g.createLinearGradient(0, y0, 0, h); sg.addColorStop(0, 'rgba(60,58,52,0)'); sg.addColorStop(1, 'rgba(60,58,52,' + a + ')'); g.fillStyle = sg; g.fillRect(x, y0, sw, h - y0); }
      return c;
    }
    function tagTex(lines, bg, fg, w, h, border) {
      var c = cnv(w || 512, h || 256), g = c.getContext('2d'); g.fillStyle = bg; g.fillRect(0, 0, c.width, c.height);
      if (border) { g.strokeStyle = border; g.lineWidth = c.width * 0.05; g.strokeRect(0, 0, c.width, c.height); }
      g.fillStyle = fg; g.textAlign = 'center'; g.textBaseline = 'middle';
      lines.forEach(function (l) { g.font = l[1] + ' ' + l[2] + 'px "Noto Sans KR","Noto Sans CJK KR","Apple SD Gothic Neo","Malgun Gothic",Arial,sans-serif'; g.fillText(l[0], c.width / 2, l[3] * c.height); });
      return ctex(c, true);
    }
    // 탱크 외벽: 도장 · 용접선 · 남색 띠 · 설비 번호(T-101)
    var TR = 6, TY0 = 0.3, TH = 7.2, TY1 = TY0 + TH;
    var shellC = (function () {
      var c = grime('#e6e8e8', '#c3c6c4', 160, 2048, 512), g = c.getContext('2d'), w = 2048, h = 512, py = function (y) { return (1 - (y - TY0) / TH) * h; };
      g.fillStyle = 'rgba(120,126,130,.35)'; [1.5, 3.3, 5.1].forEach(function (y) { g.fillRect(0, py(y), w, 2); });
      for (var k = 0; k < 4; k++) { var y0 = k * 1.8 + TY0, y1 = y0 + 1.8, off = (k % 2) * 0.5; for (var s = 0; s < 6; s++) { var x = ((s + off) / 6) * w; g.fillRect(x, py(Math.min(y1, TY1)), 2, py(y0) - py(Math.min(y1, TY1))); } }
      g.fillStyle = '#1b3550'; g.fillRect(0, py(7.05), w, py(6.85) - py(7.05));
      var u = (360 - 84) / 360 * w; g.fillStyle = '#173a5a'; g.font = '900 64px Arial, Helvetica, sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.save(); g.translate(u, py(4.6)); g.scale(0.62, 1.25); g.fillText('T-101', 0, 0); g.restore();
      return c;
    })();
    var shellNM = (function () {
      var c = cnv(2048, 512), g = c.getContext('2d'); g.fillStyle = '#808080'; g.fillRect(0, 0, 2048, 512); var py = function (y) { return (1 - (y - TY0) / TH) * 512; };
      var n = noiseC(256, 128, 60); g.globalAlpha = 0.5; for (var x = 0; x < 2048; x += 256) for (var y = 0; y < 512; y += 256) g.drawImage(n, x, y); g.globalAlpha = 1;
      g.fillStyle = '#5a5a5a'; [1.5, 3.3, 5.1].forEach(function (y) { g.fillRect(0, py(y) - 2, 2048, 5); }); g.fillStyle = '#a8a8a8'; [1.5, 3.3, 5.1].forEach(function (y) { g.fillRect(0, py(y) - 4, 2048, 2); g.fillRect(0, py(y) + 3, 2048, 2); });
      for (var k = 0; k < 4; k++) { var y0 = k * 1.8 + TY0, y1 = Math.min(TY1, y0 + 1.8), off = (k % 2) * 0.5; for (var sgm = 0; sgm < 6; sgm++) { var xx = ((sgm + off) / 6) * 2048; g.fillStyle = '#5a5a5a'; g.fillRect(xx - 2, py(y1), 5, py(y0) - py(y1)); g.fillStyle = '#a8a8a8'; g.fillRect(xx - 4, py(y1), 2, py(y0) - py(y1)); g.fillRect(xx + 3, py(y1), 2, py(y0) - py(y1)); } }
      for (var b = 0; b < 240; b++) { var bx2 = rnd() * 2048, by2 = rnd() * 512, br = 8 + rnd() * 30, rg2 = g.createRadialGradient(bx2, by2, 0, bx2, by2, br); var lv = rnd() < 0.5 ? 150 : 110; rg2.addColorStop(0, 'rgba(' + lv + ',' + lv + ',' + lv + ',.6)'); rg2.addColorStop(1, 'rgba(128,128,128,0)'); g.fillStyle = rg2; g.fillRect(bx2 - br, by2 - br, br * 2, br * 2); }
      var t = ctex(normalFromHeight(blurC(c, 0.8), 2.4), false); return t;
    })();
    var innerC = (function () {
      var c = cnv(1024, 256), g = c.getContext('2d'), gr = g.createLinearGradient(0, 0, 0, 256); gr.addColorStop(0, '#6a5e52'); gr.addColorStop(0.6, '#55493e'); gr.addColorStop(0.86, '#3a3129'); gr.addColorStop(0.9, '#211b16'); gr.addColorStop(1, '#17130f'); g.fillStyle = gr; g.fillRect(0, 0, 1024, 256);
      for (var i = 0; i < 260; i++) { var x = rnd() * 1024, y0 = rnd() * 200, a = 0.05 + rnd() * 0.12; g.fillStyle = 'rgba(30,24,18,' + a + ')'; g.fillRect(x, y0, 1 + rnd() * 3, 256 - y0); }
      for (var j = 0; j < 90; j++) { g.fillStyle = 'rgba(140,90,50,' + (0.05 + rnd() * 0.08) + ')'; g.beginPath(); g.arc(rnd() * 1024, rnd() * 220, 3 + rnd() * 14, 0, TAU); g.fill(); }
      return c;
    })();
    var M = (function () {
      function mat(c, r, mt, x) { var o = { color: c, roughness: r == null ? 0.6 : r, metalness: mt == null ? 0.1 : mt }; if (x) for (var k in x) o[k] = x[k]; return new THREE.MeshStandardMaterial(o); }
      var shellT = ctex(shellC, true); var innerT = ctex(innerC, true);
      return {
        mat: mat,
        shell: mat(0xffffff, 0.48, 0.18, { map: shellT, normalMap: shellNM, normalScale: new THREE.Vector2(0.7, 0.7), roughnessMap: ctex(noiseC(256, 150, 90), false, 8) }), inner: mat(0xffffff, 0.8, 0.15, { map: innerT, side: THREE.BackSide, normalMap: fineNM, normalScale: new THREE.Vector2(0.5, 0.5) }),
        roof: mat(0xd4d7d6, 0.55, 0.15, { map: ctex(grime('#d9dcdb', '#c4c7c5', 40), true) }), roofIn: mat(0x4a4038, 0.9, 0.1, { side: THREE.BackSide }),
        cut: mat(0x3b434a, 0.45, 0.6), patch: mat(0xc8cbca, 0.55, 0.12), patchIn: mat(0x2a231d, 0.9, 0.1),
        steel: mat(0x98a1a8, 0.45, 0.7, { roughnessMap: ctex(noiseC(128, 140, 100), false, 2) }), steelDark: mat(0x535b62, 0.55, 0.55), galv: mat(0x8e979e, 0.38, 0.8, { roughnessMap: ctex(noiseC(128, 130, 120), false, 2) }), navy: mat(0x1b3550, 0.5, 0.2),
        coil: mat(0x3d352d, 0.55, 0.45), sludgeC: mat(0x2a2016, 0.95, 0), coilClean: mat(0x6e6a64, 0.4, 0.6),
        white: mat(0xf2f3f3, 0.4, 0.08, { map: ctex(grime('#f3f4f4', '#cfd2d0', 30), true) }), teal: mat(0xffffff, 0.4, 0.2, { map: ctex(grime('#1d5f68', '#163f46', 24), true) }), mint: mat(0x3fb3a6, 0.42, 0.15),
        yellow: mat(0xd99a12, 0.55, 0.15), orange: mat(0xd9611f, 0.5, 0.2), red: mat(0xa9372f, 0.5, 0.25), blue: mat(0x2d5f93, 0.5, 0.3), pipe: mat(0x7c8790, 0.45, 0.65),
        ground: mat(0x8f9599, 1.0, 0, { normalMap: concreteNM }), pad: mat(0x9ea4a8, 0.98, 0, { normalMap: concreteNM }), road: mat(0x474d53, 0.97, 0, { normalMap: asphaltNM }),
        tyre: mat(0x24292d, 0.92, 0), hub: mat(0xcfd6dd, 0.35, 0.7), glass: mat(0x5e86a8, 0.08, 0.3), dark: mat(0x22262a, 0.85, 0.1), black: mat(0x15181b, 0.6, 0.2),
        hose: mat(0x2d3640, 0.62, 0.05, { normalMap: fineNM }), far: mat(0xbac5cf, 0.9, 0), farTank: mat(0xc9d1d8, 0.7, 0.1, { normalMap: shellNM, normalScale: new THREE.Vector2(0.5, 0.5) }),
        leaf: mat(0x4e7c48, 0.95, 0), leaf2: mat(0x3f6a3b, 0.95, 0), leaf3: mat(0x5d8b50, 0.95, 0), trunk: mat(0x5a4533, 0.95, 0),
        skin: mat(0xe9c4a2, 0.75, 0), cover: mat(0x2b3f57, 0.82, 0.02), vest: mat(0xe8731c, 0.7, 0), refl: mat(0xdfe3e6, 0.3, 0.4), helmet: mat(0xf4f3ee, 0.3, 0.1), helmetY: mat(0xf0b323, 0.35, 0.1),
        boot: mat(0x1d2024, 0.7, 0.05), glove: mat(0x8f8a7c, 0.85, 0), wallIn: mat(0xb9c1c8, 0.85, 0, { side: THREE.BackSide }), desk: mat(0x3a4148, 0.6, 0.2), chair: mat(0x23282d, 0.7, 0.05),
        lampW: mat(0xffffff, 0.3, 0, { emissive: 0xfff2d0, emissiveIntensity: 1.2 }), lampIn: mat(0xffffff, 0.3, 0, { emissive: 0xffe2b0, emissiveIntensity: 3.5 }),
        pallet: mat(0x8b6a45, 0.9, 0), chute: mat(0x8d969d, 0.38, 0.75, { bumpMap: fineN, bumpScale: 0.25 }), signY: mat(0xf2c21b, 0.6, 0.05), scba: mat(0xc7ccd0, 0.3, 0.8), mask: mat(0x1c2126, 0.25, 0.2)
      };
    })();
    function add(o, p, noShadow) { if (!noShadow) { o.castShadow = true; o.receiveShadow = true; } (p || scene).add(o); return o; }
    function mesh(g, m, x, y, z, p) { var o = new THREE.Mesh(g, m); o.position.set(x || 0, y || 0, z || 0); return add(o, p); }
    function bx(w, h, d, m, x, y, z, p, r) { return mesh(r ? new RBox(w, h, d, 3, r) : new THREE.BoxGeometry(w, h, d), m, x, y, z, p); }
    function cyl(r, h, m, x, y, z, p, seg, rt, open) { return mesh(new THREE.CylinderGeometry(rt == null ? r : rt, r, h, seg || 32, 1, !!open), m, x, y, z, p); }
    function sph(r, m, x, y, z, p, ws) { return mesh(new THREE.SphereGeometry(r, ws || 32, Math.round((ws || 32) * 0.66)), m, x, y, z, p); }
    function cap(r, l, m, x, y, z, p) { return mesh(new THREE.CapsuleGeometry(r, l, 6, 14), m, x, y, z, p); }
    function tor(R, r, m, x, y, z, p, seg, arc) { return mesh(new THREE.TorusGeometry(R, r, 10, seg || 48, arc || TAU), m, x, y, z, p); }
    function beam(a, b, s, m, p) { var d = new V3().subVectors(b, a), L = d.length(), o = bx(s, s, L, m, (a.x + b.x) / 2, (a.y + b.y) / 2, (a.z + b.z) / 2, p); o.lookAt(o.position.clone().add(d)); if (p) { o.lookAt(p.localToWorld(o.position.clone().add(d))); } return o; }
    function tube(pts, r, m, p, seg) { return add(new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts, false, 'centripetal'), seg || 48, r, 10, false), m), p); }
    var dummy = new THREE.Object3D();
    function inst(geo, m, list) { var im = new THREE.InstancedMesh(geo, m, list.length); im.castShadow = im.receiveShadow = true; list.forEach(function (e, i) { dummy.position.set(e[0], e[1], e[2]); dummy.rotation.set(e[3] || 0, e[4] || 0, e[5] || 0); dummy.scale.set(1, 1, 1); dummy.updateMatrix(); im.setMatrixAt(i, dummy.matrix); }); scene.add(im); return im; }

    /* ===== 바닥 · 길 ===== */
    var ground = new THREE.Mesh(new THREE.PlaneGeometry(500, 500), M.ground); ground.rotation.x = -PI / 2; ground.receiveShadow = true; scene.add(ground);
    var road = new THREE.Mesh(new THREE.PlaneGeometry(120, 7), M.road); road.rotation.x = -PI / 2; road.position.set(-6, 0.006, 19); road.receiveShadow = true; scene.add(road);
    (function () { var c = cnv(2048, 128), g = c.getContext('2d'); g.fillStyle = '#e4e4de'; g.fillRect(0, 4, 2048, 3); g.fillRect(0, 121, 2048, 3); g.fillStyle = '#dcb23a'; for (var x = 0; x < 2048; x += 48) g.fillRect(x, 62, 28, 4); var l = new THREE.Mesh(new THREE.PlaneGeometry(120, 7), new THREE.MeshStandardMaterial({ map: ctex(c, true), transparent: true, roughness: 1 })); l.rotation.x = -PI / 2; l.position.set(-6, 0.012, 19); scene.add(l); })();
    bx(120, 0.16, 0.3, M.pad, -6, 0.08, 15.35); // 연석

    /* ===== 탱크 T-101 (단면이 열리는 저장 탱크) ===== */
    var tank = new THREE.Group(); scene.add(tank);
    cyl(TR + 0.38, TY0, M.pad, 0, TY0 / 2, 0, tank, 96);                  // 링월 기초
    var plate = mesh(new THREE.CircleGeometry(TR, 96), M.steelDark, 0, TY0 - 0.004, 0, tank); plate.rotation.x = -PI / 2;
    var MW = { y: 0.85, r: 0.45, sill: 0.64 }, gapH = Math.asin(0.56 / TR);
    function arcGeo(r, y0, y1, a0, a1, rTop) {
      var len = a1 - a0, seg = Math.max(6, Math.round(len / TAU * 144)); var g = new THREE.CylinderGeometry(rTop == null ? r : rTop, r, y1 - y0, seg, 1, true, a0, len); g.translate(0, (y0 + y1) / 2, 0);
      var uv = g.attributes.uv, pos = g.attributes.position; for (var i = 0; i < uv.count; i++) { var ix = i % (seg + 1), th = a0 + ix / seg * len; uv.setXY(i, th / TAU, (pos.getY(i) - TY0) / TH); } return g;
    }
    var shellParts = [], curCut = -1, cutEdges = [], rafters = [];
    function buildShell(a) {
      shellParts.forEach(function (o) { tank.remove(o); o.geometry.dispose(); }); shellParts = [];
      var A0 = a, A1 = TAU - a, mw = 1.5 * PI;
      [[1.5, TY1, A0, A1], [TY0, 1.5, A0, mw - gapH], [TY0, 1.5, mw + gapH, A1]].forEach(function (s) {
        if (s[3] - s[2] < 0.001) return; var g = arcGeo(TR, s[0], s[1], s[2], s[3]);
        var o = add(new THREE.Mesh(g, M.shell), tank); shellParts.push(o); var i = add(new THREE.Mesh(g, M.inner), tank); i.castShadow = false; shellParts.push(i);
      });
      var rg = arcGeo(TR + 0.06, TY1, TY1 + 1.0, A0, A1, 0.55); var ro = add(new THREE.Mesh(rg, M.roof), tank); shellParts.push(ro); var ri = add(new THREE.Mesh(rg, M.roofIn), tank); ri.castShadow = false; shellParts.push(ri);
      var show = a > 0.004; cutEdges.forEach(function (e, k) { e.visible = show; var th = k % 2 ? -a : a; if (k < 2) { e.position.set(TR * Math.sin(th), (TY0 + TY1) / 2, TR * Math.cos(th)); e.rotation.set(0, th, 0); } else { e.position.set((TR + 0.55) / 2 * Math.sin(th), TY1 + 0.5, (TR + 0.55) / 2 * Math.cos(th)); e.rotation.set(Math.atan2(1.0, TR - 0.55), th, 0, 'YXZ'); } });
      rafters.forEach(function (rf) { var d = Math.abs(((rf.userData.th + PI) % TAU) - PI); rf.visible = d > a + 0.06; });
      curCut = a;
    }
    cutEdges.push(bx(0.05, TH, 0.09, M.cut, 0, 0, 0, tank), bx(0.05, TH, 0.09, M.cut, 0, 0, 0, tank));
    var rl = Math.hypot(TR - 0.55, 1.0); cutEdges.push(bx(0.05, 0.09, rl, M.cut, 0, 0, 0, tank), bx(0.05, 0.09, rl, M.cut, 0, 0, 0, tank));
    cutEdges.forEach(function (e) { e.rotation.order = 'YXZ'; });
    // 기둥 · 서까래 · 꼭대기
    cyl(0.13, TY1 + 0.95 - TY0, M.steelDark, 0, (TY0 + TY1 + 0.95) / 2, 0, tank, 16);
    for (var k = 0; k < 18; k++) { var th = (k + 0.5) / 18 * TAU, a1 = new V3(0.35 * Math.sin(th), TY1 + 0.9, 0.35 * Math.cos(th)), b1 = new V3((TR - 0.05) * Math.sin(th), TY1 + 0.04, (TR - 0.05) * Math.cos(th)); var rf = beam(a1, b1, 0.1, M.steelDark, tank); rf.castShadow = false; rf.userData.th = th; rafters.push(rf); }
    cyl(0.6, 0.12, M.roof, 0, TY1 + 1.02, 0, tank, 24); cyl(0.22, 0.5, M.steel, 0, TY1 + 1.3, 0, tank, 16); cyl(0.3, 0.06, M.steelDark, 0, TY1 + 1.56, 0, tank, 16);
    // 맨홀 둘레 판(구멍) · 목 · 플랜지 · 볼트 · 열린 덮개 · 데빗
    (function () {
      var s = new THREE.Shape(); s.moveTo(-0.57, TY0); s.lineTo(0.57, TY0); s.lineTo(0.57, 1.5); s.lineTo(-0.57, 1.5); s.lineTo(-0.57, TY0); var hpath = new THREE.Path(); hpath.absarc(0, MW.y, MW.r, 0, TAU, true); s.holes.push(hpath);
      var sg = new THREE.ShapeGeometry(s, 24); var po = add(new THREE.Mesh(sg, M.patch), tank); po.rotation.y = -PI / 2; po.position.x = -TR + 0.012;
      var pi2 = add(new THREE.Mesh(sg, M.patchIn), tank); pi2.rotation.y = PI / 2; pi2.position.x = -TR + 0.03; pi2.castShadow = false;
      var neck = cyl(MW.r, 0.42, M.steel, -TR - 0.16, MW.y, 0, tank, 40, null, true); neck.rotation.z = PI / 2; neck.material = M.steel;
      var neckIn = cyl(MW.r - 0.01, 0.42, M.patchIn, -TR - 0.16, MW.y, 0, tank, 40, null, true); neckIn.rotation.z = PI / 2; neckIn.material = M.patchIn.clone(); neckIn.material.side = THREE.BackSide;
      var fl = tor(MW.r + 0.06, 0.055, M.steel, -TR - 0.37, MW.y, 0, tank, 48); fl.rotation.y = PI / 2;
      for (var b = 0; b < 16; b++) { var ab = b / 16 * TAU; var bo = cyl(0.022, 0.1, M.steelDark, -TR - 0.4, MW.y + Math.sin(ab) * (MW.r + 0.07), Math.cos(ab) * (MW.r + 0.07), tank, 6); bo.rotation.z = PI / 2; }
      var cover = cyl(MW.r + 0.1, 0.05, M.steel, -TR - 0.98, MW.y, -0.86, tank, 40); cover.quaternion.setFromUnitVectors(new V3(0, 1, 0), new V3(0.45, 0, 1).normalize());
      cyl(0.04, 1.5, M.galv, -TR - 0.42, TY0 + 0.75 + 0.2, -0.62, tank, 10); beam(new V3(-TR - 0.42, 1.65, -0.62), new V3(-TR - 0.98, 1.65, -0.86), 0.06, M.galv, tank); cyl(0.02, 0.3, M.galv, -TR - 0.98, 1.48, -0.86, tank, 6);
      // 바깥 경사판(chute)과 안쪽 경사판: 로봇이 맨홀 높이까지 올라갔다 바닥으로 내려간다
      var cL = Math.hypot(2.5, MW.sill), ch = bx(1.0, 0.04, cL, M.chute, -TR - 0.37 - 1.25, MW.sill / 2, 0, tank); ch.rotation.set(0, PI / 2, 0); ch.rotateX(-Math.atan2(MW.sill, 2.5));
      [-0.5, 0.5].forEach(function (zz) { var r = bx(0.04, 0.08, cL, M.galv, -TR - 0.37 - 1.25, MW.sill / 2 + 0.06, zz, tank); r.rotation.set(0, PI / 2, 0); r.rotateX(-Math.atan2(MW.sill, 2.5)); });
      for (var lgi = 0; lgi < 3; lgi++) { var lx = -TR - 0.37 - 2.5 + 0.6 + lgi * 0.8, ly = MW.sill * (lx + TR + 0.37 + 2.5) / 2.5; [-0.42, 0.42].forEach(function (zz) { cyl(0.025, ly, M.galv, lx, ly / 2, zz, tank, 6); }); }
      var iL = Math.hypot(1.3, MW.sill - TY0), ir = bx(0.9, 0.04, iL, M.chute, -TR + 0.05 + 0.65, (MW.sill + TY0) / 2, 0, tank); ir.rotation.set(0, PI / 2, 0); ir.rotateX(Math.atan2(MW.sill - TY0, 1.3));
      bx(0.8, 0.04, 0.9, M.chute, -TR - 0.16, MW.sill - 0.02, 0, tank);
    })();
    // 바닥 배수 노즐(1차 Washing 연결)
    var drainTh = -125 / 180 * PI, drainP = new V3((TR + 0.55) * Math.sin(drainTh), 0.62, (TR + 0.55) * Math.cos(drainTh));
    (function () { var g = new THREE.Group(); g.position.set(TR * Math.sin(drainTh), 0, TR * Math.cos(drainTh)); g.rotation.y = drainTh; tank.add(g); var n = cyl(0.11, 0.6, M.steel, 0, 0.62, 0.3, g, 20); n.rotation.x = PI / 2; var f = cyl(0.17, 0.05, M.steel, 0, 0.62, 0.58, g, 20); f.rotation.x = PI / 2; cyl(0.13, 0.22, M.red, 0, 0.62, 0.42, g, 16); cyl(0.025, 0.25, M.steel, 0, 0.82, 0.42, g, 6); tor(0.11, 0.02, M.red, 0, 0.95, 0.42, g, 20).rotation.x = PI / 2; })();
    // 나선 계단(뒤쪽) · 꼭대기 발판
    (function () {
      var n = 64, steps = [], pts = [], pts2 = [];
      for (var s = 0; s < n; s++) { var k = s / (n - 1), th = (110 + k * 150) / 180 * PI, y = 0.4 + k * (TY1 - 0.4), r = TR + 0.42; steps.push([r * Math.sin(th), y, r * Math.cos(th), 0, th, 0]); pts.push(new V3((r + 0.38) * Math.sin(th), y + 0.95, (r + 0.38) * Math.cos(th))); pts2.push(new V3((r + 0.38) * Math.sin(th), y - 0.08, (r + 0.38) * Math.cos(th))); }
      inst(new THREE.BoxGeometry(0.26, 0.04, 0.78), M.galv, steps); tube(pts, 0.025, M.yellow, null, 160); tube(pts2, 0.05, M.steelDark, null, 160);
      for (var p2 = 0; p2 < n; p2 += 4) cyl(0.02, 1.0, M.yellow, pts[p2].x, pts[p2].y - 0.5, pts[p2].z, null, 6);
    })();
    // 탱크 안: 가열 코일(바닥) · 작업등
    var coils = [];
    [-4.4, -3.1, -1.75, -0.35, 1.4, 2.8, 4.1].forEach(function (z) {
      var half = Math.min(3.4, Math.sqrt(TR * TR - z * z) - 1.1); if (half < 0.8) return; var c = cyl(0.05, half * 2, M.coil, 0, TY0 + 0.2, z, tank, 12); c.rotation.z = PI / 2; coils.push(c);
      [-half, half].forEach(function (x) { var e = cyl(0.05, 0.2, M.coil, x, TY0 + 0.1, z, tank, 10); coils.push(e); });
      for (var x = -half + 0.6; x < half; x += 1.2) coils.push(bx(0.05, 0.16, 0.16, M.steelDark, x, TY0 + 0.08, z, tank));
    });
    var inLamps = [];
    [[-2.6, 5.4, -2.8], [2.4, 5.0, -3.2], [-0.2, 5.6, -4.4]].forEach(function (p) { cyl(0.008, TY1 + 0.6 - p[1], M.black, p[0], (TY1 + 0.6 + p[1]) / 2, p[2], tank, 4); cyl(0.12, 0.28, M.steelDark, p[0], p[1], p[2], tank, 16); var g2 = cyl(0.1, 0.12, M.lampIn, p[0], p[1] - 0.18, p[2], tank, 16); g2.castShadow = false; var L = new THREE.PointLight(0xffe6c0, 5, 9, 1.7); L.position.set(p[0], p[1] - 0.4, p[2]); tank.add(L); inLamps.push(L); });

    /* ===== 슬러지 바닥(높이 · 색 · 거칠기 캔버스를 매 프레임 다시 칠한다) ===== */
    var SC = 512, SPAN = 12.0; function cx(x) { return (x + SPAN / 2) / SPAN * SC; } var mpx = SC / SPAN;
    var baseD = cnv(SC), baseC = cnv(SC), alphaC = cnv(SC);
    (function () {
      var g = baseD.getContext('2d'); g.fillStyle = '#000'; g.fillRect(0, 0, SC, SC); g.save(); g.beginPath(); g.arc(SC / 2, SC / 2, (TR - 0.02) * mpx, 0, TAU); g.clip();
      g.fillStyle = 'rgb(150,150,150)'; g.fillRect(0, 0, SC, SC);
      var rg = g.createRadialGradient(SC / 2, SC / 2, TR * 0.55 * mpx, SC / 2, SC / 2, TR * mpx); rg.addColorStop(0, 'rgba(255,255,255,0)'); rg.addColorStop(1, 'rgba(255,255,255,.45)'); g.fillStyle = rg; g.fillRect(0, 0, SC, SC);
      for (var i = 0; i < 520; i++) { var x = rnd() * SC, y = rnd() * SC, r = 6 + rnd() * 46, l = rnd() < 0.55 ? 255 : 0, a = 0.05 + rnd() * 0.12, b = g.createRadialGradient(x, y, 0, x, y, r); b.addColorStop(0, 'rgba(' + l + ',' + l + ',' + l + ',' + a + ')'); b.addColorStop(1, 'rgba(' + l + ',' + l + ',' + l + ',0)'); g.fillStyle = b; g.fillRect(x - r, y - r, r * 2, r * 2); }
      g.restore();
      var c = baseC.getContext('2d'); c.fillStyle = '#2c2117'; c.fillRect(0, 0, SC, SC); var cols = ['#3a2b1d', '#1c150f', '#4a3825', '#5a4530', '#2f2a21', '#43321f'];
      for (var j = 0; j < 700; j++) { var x2 = rnd() * SC, y2 = rnd() * SC, r2 = 4 + rnd() * 40, b2 = c.createRadialGradient(x2, y2, 0, x2, y2, r2); var col = cols[j % cols.length]; b2.addColorStop(0, col); b2.addColorStop(1, col + '00'); c.globalAlpha = 0.25 + rnd() * 0.35; c.fillStyle = b2; c.fillRect(x2 - r2, y2 - r2, r2 * 2, r2 * 2); }
      c.globalAlpha = 1; for (var s2 = 0; s2 < 900; s2++) { c.fillStyle = 'rgba(' + (60 + rnd() * 50 | 0) + ',' + (50 + rnd() * 40 | 0) + ',' + (40 + rnd() * 30 | 0) + ',.5)'; c.fillRect(rnd() * SC, rnd() * SC, 1 + rnd() * 2, 1 + rnd() * 2); }
      var a = alphaC.getContext('2d'); a.fillStyle = '#000'; a.fillRect(0, 0, SC, SC); a.fillStyle = '#fff'; a.beginPath(); a.arc(SC / 2, SC / 2, (TR - 0.03) * mpx, 0, TAU); a.fill();
    })();
    var cD = cnv(SC), cC = cnv(SC), cR = cnv(SC), gD = cD.getContext('2d'), gC = cC.getContext('2d'), gR = cR.getContext('2d');
    var tD = ctex(cD, false), tC = ctex(cC, true), tR = ctex(cR, false), tA = ctex(alphaC, false);
    var sludgeMat = new THREE.MeshStandardMaterial({ color: 0xffffff, map: tC, displacementMap: tD, displacementScale: 0.27, bumpMap: tD, bumpScale: 3.0, roughnessMap: tR, roughness: 1, metalness: 0.0, envMapIntensity: 0.55, alphaMap: tA, alphaTest: 0.5 });
    var sludge = new THREE.Mesh(new THREE.PlaneGeometry(SPAN, SPAN, 200, 200), sludgeMat); sludge.rotation.x = -PI / 2; sludge.position.y = TY0 + 0.002; sludge.receiveShadow = true; tank.add(sludge);
    function strokePath(g, pts, w, style) { if (pts.length < 2) return; g.strokeStyle = style; g.lineWidth = w * mpx; g.lineCap = 'round'; g.lineJoin = 'round'; g.beginPath(); g.moveTo(cx(pts[0].x), cx(pts[0].z)); for (var i = 1; i < pts.length; i++) g.lineTo(cx(pts[i].x), cx(pts[i].z)); g.stroke(); }
    var lastPaint = '';
    function paintSludge(level, clean, wash, key) {
      if (key === lastPaint) return; lastPaint = key;
      gD.globalCompositeOperation = 'source-over'; gD.globalAlpha = 1; gD.drawImage(baseD, 0, 0); gD.fillStyle = 'rgba(0,0,0,' + (1 - level).toFixed(3) + ')'; gD.fillRect(0, 0, SC, SC);
      gC.globalAlpha = 1; gC.drawImage(baseC, 0, 0); gR.fillStyle = '#787878'; gR.fillRect(0, 0, SC, SC);
      if (level < 0.999) { gC.fillStyle = 'rgba(70,64,56,' + ((1 - level) * 0.45).toFixed(3) + ')'; gC.fillRect(0, 0, SC, SC); }
      gD.filter = 'blur(3px)'; strokePath(gD, clean, 1.0, 'rgba(0,0,0,.75)'); gD.filter = 'none'; strokePath(gD, clean, 0.66, '#030303');
      gC.filter = 'blur(2px)'; strokePath(gC, clean, 0.98, 'rgba(66,64,60,.85)'); gC.filter = 'none'; strokePath(gC, clean, 0.62, '#5d6266');
      strokePath(gR, clean, 0.9, '#a8a8a8');
      if (wash.length > 1) { gC.filter = 'blur(3px)'; strokePath(gC, wash, 1.5, 'rgba(118,126,133,.95)'); gC.filter = 'none'; strokePath(gR, wash, 1.6, '#262626'); gD.filter = 'blur(3px)'; strokePath(gD, wash, 1.6, '#000'); gD.filter = 'none'; }
      tD.needsUpdate = tC.needsUpdate = tR.needsUpdate = true;
    }

    /* ===== 다른 탱크 · 방유제 · 파이프랙 · 먼 설비 · 나무 ===== */
    (function () {
      function farTank(x, z, r, h, tag) { cyl(r + 0.3, 0.3, M.pad, x, 0.15, z, null, 64).castShadow = false; var s = cyl(r, h, M.farTank, x, 0.3 + h / 2, z, null, 64); var rf = cyl(0.5, 0.9, M.roof, x, 0.3 + h + 0.45, z, null, 64, null); rf.geometry = new THREE.CylinderGeometry(0.5, r + 0.05, 0.9, 64); tor(r + 0.01, 0.06, M.navy, x, h - 0.4, z, null, 96).rotation.x = PI / 2; if (tag) { var t = new THREE.Mesh(new THREE.PlaneGeometry(2.2, 0.9), new THREE.MeshStandardMaterial({ map: tagTex([[tag, '900', 120, 0.52]], '#e7eaea', '#173a5a'), roughness: 0.6 })); t.position.set(x, h * 0.62, z + r + 0.02); scene.add(t); } return s; }
      farTank(19, -5, 5, 7, 'T-102'); farTank(-4, -24, 7, 8.5, 'T-103'); farTank(20, -26, 6, 8, null);
      function dike(x0, z0, x1, z1) { var h = 0.9, t = 0.3; bx(x1 - x0, h, t, M.pad, (x0 + x1) / 2, h / 2, z0); bx(x1 - x0, h, t, M.pad, (x0 + x1) / 2, h / 2, z1); bx(t, h, z1 - z0, M.pad, x0, h / 2, (z0 + z1) / 2); bx(t, h, z1 - z0, M.pad, x1, h / 2, (z0 + z1) / 2); }
      dike(11, -13, 27, 3); dike(-15, -34, 30, -14);
      var z0 = -11.5; for (var x = -24; x <= 8; x += 4) { bx(0.24, 4.2, 0.24, M.steelDark, x, 2.1, z0); bx(2.2, 0.2, 0.2, M.steelDark, x, 4.2, z0); bx(2.2, 0.14, 0.14, M.steelDark, x, 2.4, z0); }
      [[-0.8, 0.16, M.pipe], [-0.3, 0.12, M.blue], [0.2, 0.1, M.yellow], [0.75, 0.18, M.pipe]].forEach(function (p) { var c = cyl(p[1], 33, p[2], -8, 4.45, z0 + p[0], null, 20); c.rotation.z = PI / 2; });
      [[-34, -30, 1.6, 12], [-26, -40, 1.1, 9], [38, -36, 1.4, 13], [44, -30, 1.0, 8], [8, -48, 2.2, 10], [-46, -24, 1.3, 10]].forEach(function (p) { var c = cyl(p[2], p[3], M.far, p[0], p[3] / 2, p[1], null, 24); c.castShadow = false; });
      bx(14, 3.4, 5, M.far, -36, 1.7, -14).castShadow = false; bx(10, 4.6, 5, M.far, 40, 2.3, -18).castShadow = false;
      [[-30, 4, 1.6], [-27, 9, 1.3], [-31, 13, 1.5], [26, 9, 1.6], [30, 13, 1.3], [33, 6, 1.5], [12, 24, 1.4], [-22, 26, 1.5], [3, 27, 1.3], [-12, 27, 1.6]].forEach(function (p, i) {
        cyl(0.14, 1.5, M.trunk, p[0], 0.75, p[1], null, 8); var ms = [M.leaf, M.leaf2, M.leaf3]; sph(p[2], ms[i % 3], p[0], 1.4 + p[2] * 0.9, p[1], null, 20).scale.set(1, 0.9, 1); sph(p[2] * 0.7, ms[(i + 1) % 3], p[0] + p[2] * 0.5, 1.2 + p[2] * 1.2, p[1] + 0.2, null, 16); sph(p[2] * 0.6, ms[(i + 2) % 3], p[0] - p[2] * 0.45, 1.1 + p[2] * 1.1, p[1] - 0.3, null, 16);
      });
      // 작업 구역 펜스 · 라바콘
      var posts = [], panels = []; for (var i = 0; i < 10; i++) { var x2 = -22 + i * 2.0; posts.push([x2, 0.52, 14.6], [x2 + 1.96, 0.52, 14.6]); panels.push([x2 + 0.98, 0.6, 14.6]); }
      inst(new THREE.CylinderGeometry(0.03, 0.03, 1.05, 8), M.blue, posts); inst(new THREE.BoxGeometry(1.9, 0.9, 0.03), M.blue, panels);
      [[-8.3, 2.5], [-10.4, -2.2], [-7.8, -2.4], [-6.9, 1.9], [-12.6, 7.2], [-6.5, 8.5]].forEach(function (c) { cyl(0.17, 0.52, M.orange, c[0], 0.26, c[1], null, 16, 0.045); cyl(0.18, 0.06, M.white, c[0], 0.32, c[1], null, 16, 0.08); bx(0.4, 0.03, 0.4, M.dark, c[0], 0.015, c[1]); });
      // 밀폐공간 표지판
      var sg = new THREE.Group(); sg.position.set(-8.0, 0, -1.9); sg.rotation.y = 0.55; scene.add(sg); cyl(0.03, 1.5, M.galv, 0, 0.75, 0, sg, 8); bx(0.36, 0.04, 0.36, M.dark, 0, 0.02, 0, sg);
      var pl = new THREE.Mesh(new THREE.PlaneGeometry(0.7, 0.5), new THREE.MeshStandardMaterial({ map: tagTex([['밀폐공간', '900', 92, 0.36], ['관계자 외 출입 금지', '700', 44, 0.7]], '#f2c21b', '#111', 512, 366, '#111'), roughness: 0.6 })); pl.position.set(0, 1.3, 0.03); sg.add(pl); var plb = bx(0.72, 0.52, 0.02, M.dark, 0, 1.3, 0.005, sg);
    })();

    /* ===== 차량: 진공흡입차(Vacuum Car) · 제어 차량(OCV) ===== */
    function wheel(x, y, z, p, r, w) { r = r || 0.5; w = w || 0.36; var t = cyl(r, w, M.tyre, x, y, z, p, 36); t.rotation.x = PI / 2; var h = cyl(r * 0.6, w + 0.02, M.hub, x, y, z, p, 24); h.rotation.x = PI / 2; var c = cyl(r * 0.2, w + 0.05, M.steelDark, x, y, z, p, 12); c.rotation.x = PI / 2; return t; }
    var VAC = new V3(-17.5, 0, 4.2);
    var vac = (function () {
      var g = new THREE.Group(); g.position.copy(VAC); scene.add(g);
      bx(8.8, 0.3, 2.3, M.dark, 0, 0.7, 0, g); bx(8.9, 0.1, 0.35, M.steelDark, 0, 0.55, 1.15, g); bx(8.9, 0.1, 0.35, M.steelDark, 0, 0.55, -1.15, g);
      bx(2.15, 2.3, 2.36, M.white, -3.15, 1.95, 0, g, 0.14); bx(2.17, 0.5, 2.38, M.teal, -3.15, 1.05, 0, g); bx(0.06, 0.95, 2.0, M.glass, -4.23, 2.4, 0, g); bx(0.8, 0.7, 0.05, M.glass, -2.95, 2.35, 1.185, g); bx(0.8, 0.7, 0.05, M.glass, -2.95, 2.35, -1.185, g);
      bx(0.12, 0.28, 2.3, M.steelDark, -4.26, 0.78, 0, g, 0.04); bx(0.08, 0.2, 0.5, M.lampW, -4.25, 1.2, 0.75, g); bx(0.08, 0.2, 0.5, M.lampW, -4.25, 1.2, -0.75, g); cyl(0.07, 1.6, M.steelDark, -2.2, 3.4, 1.0, g, 12);
      var tk = cyl(1.22, 5.3, M.teal, 1.0, 2.2, 0, g, 56); tk.rotation.z = PI / 2; sph(1.22, M.teal, -1.65, 2.2, 0, g).scale.set(0.4, 1, 1); sph(1.22, M.teal, 3.65, 2.2, 0, g).scale.set(0.4, 1, 1);
      [-1.0, 0.6, 2.2].forEach(function (x) { tor(1.235, 0.045, M.steel, x, 2.2, 0, g, 72).rotation.set(0, PI / 2, 0); });
      cyl(0.5, 0.3, M.steel, 1.4, 3.5, 0, g, 24); cyl(0.55, 0.06, M.steelDark, 1.4, 3.68, 0, g, 24); cyl(0.3, 0.35, M.steel, -0.4, 3.5, 0, g, 20);
      for (var i = -1.3; i <= 3.3; i += 1.15) cyl(0.025, 0.95, M.yellow, i, 3.9, 0.95, g, 6); bx(4.9, 0.03, 0.03, M.yellow, 1.0, 4.37, 0.95, g); bx(4.9, 0.03, 0.03, M.yellow, 1.0, 3.95, 0.95, g);
      bx(1.6, 0.7, 0.6, M.steelDark, -0.6, 0.95, 1.1, g, 0.03); bx(1.2, 0.7, 0.6, M.steelDark, 2.3, 0.95, 1.1, g, 0.03); bx(1.6, 0.7, 0.6, M.steelDark, -0.6, 0.95, -1.1, g, 0.03);
      var d1 = cyl(0.8, 0.06, M.steel, 4.35, 2.1, 0.36, g, 40); d1.rotation.x = PI / 2; var d2 = cyl(0.8, 0.06, M.steel, 4.35, 2.1, -0.36, g, 40); d2.rotation.x = PI / 2;
      for (var k = 0; k < 6; k++) tor(0.4 + k * 0.065, 0.055, M.hose, 4.35, 2.1, -0.25 + k * 0.1, g, 40);
      cyl(0.05, 0.9, M.steelDark, 4.35, 2.1, 0, g, 10).rotation.x = PI / 2; bx(0.12, 1.3, 0.12, M.steelDark, 4.35, 1.45, 0.5, g); bx(0.12, 1.3, 0.12, M.steelDark, 4.35, 1.45, -0.5, g);
      // 뒤 흡입구(1차 Washing 호스) · 조작반
      var pt = cyl(0.12, 0.5, M.steel, 4.5, 0.7, -0.3, g, 16); pt.rotation.z = PI / 2; cyl(0.16, 0.05, M.steel, 4.76, 0.7, -0.3, g, 16).rotation.z = PI / 2;
      bx(0.1, 0.55, 0.7, M.steelDark, 4.55, 1.2, -0.75, g); var gauge = cyl(0.09, 0.03, M.white, 4.61, 1.33, -0.6, g, 20); gauge.rotation.z = PI / 2; bx(0.03, 0.12, 0.3, M.red, 4.61, 1.08, -0.9, g);
      wheel(-3.0, 0.55, 1.2, g, 0.55); wheel(-3.0, 0.55, -1.2, g, 0.55); wheel(1.5, 0.55, 1.2, g, 0.55); wheel(1.5, 0.55, -1.2, g, 0.55); wheel(2.85, 0.55, 1.2, g, 0.55); wheel(2.85, 0.55, -1.2, g, 0.55);
      return g;
    })();
    var REEL = new V3(VAC.x + 4.35, 2.1, VAC.z), VPORT = new V3(VAC.x + 4.8, 0.7, VAC.z - 0.3);
    // 1차 Washing 호스(흡입차 → 탱크 바닥 배수 노즐): 줄무늬가 흐른다
    var flowC = cnv(64, 16); (function () { var g = flowC.getContext('2d'); g.fillStyle = '#2d3640'; g.fillRect(0, 0, 64, 16); g.fillStyle = '#3a4652'; g.fillRect(0, 0, 10, 16); })();
    var flowT = ctex(flowC, true); flowT.wrapS = flowT.wrapT = THREE.RepeatWrapping; flowT.repeat.set(60, 1);
    var hose1 = tube([VPORT.clone().add(new V3(0.3, 0, 0)), new V3(VPORT.x + 0.9, 0.3, VPORT.z - 0.3), new V3(VPORT.x + 1.6, 0.06, VPORT.z - 1.4), new V3(-7.6, 0.06, -3.4), new V3(drainP.x - 0.8, 0.06, drainP.z - 0.2), new V3(drainP.x - 0.3, 0.35, drainP.z), drainP.clone()], 0.065, new THREE.MeshStandardMaterial({ color: 0xffffff, map: flowT, roughness: 0.62, metalness: 0.05 }), null, 120);

    var OCV = new V3(-17.6, 0, 11.2), OCVfloor = 1.05;
    var ocv = (function () {
      var g = new THREE.Group(); g.position.copy(OCV); scene.add(g);
      bx(6.6, 0.24, 1.9, M.dark, 0.3, 0.68, 0, g);
      bx(1.85, 1.6, 2.1, M.white, -2.25, 1.55, 0, g, 0.12); bx(1.87, 0.36, 2.12, M.navy, -2.25, 1.0, 0, g); bx(0.06, 0.78, 1.8, M.glass, -3.17, 1.9, 0, g); bx(0.7, 0.55, 0.04, M.glass, -2.15, 1.9, 1.06, g); bx(0.7, 0.55, 0.04, M.glass, -2.15, 1.9, -1.06, g);
      bx(0.1, 0.18, 0.5, M.lampW, -3.2, 1.08, 0.7, g); bx(0.1, 0.18, 0.5, M.lampW, -3.2, 1.08, -0.7, g); bx(0.12, 0.24, 2.0, M.steelDark, -3.22, 0.72, 0, g, 0.04);
      // 적재함(뒤가 열린 작업실): 바깥 판 5장 + 안쪽 벽
      var x0 = -1.3, x1 = 2.6, L = x1 - x0, cxm = (x0 + x1) / 2, h = 2.0, y0 = OCVfloor;
      bx(L, 0.08, 2.2, M.white, cxm, y0 - 0.04, 0, g); bx(L, 0.08, 2.2, M.white, cxm, y0 + h + 0.04, 0, g);
      bx(L, h, 0.06, M.white, cxm, y0 + h / 2, 1.1, g); bx(L, h, 0.06, M.white, cxm, y0 + h / 2, -1.1, g); bx(0.06, h, 2.2, M.white, x0, y0 + h / 2, 0, g);
      bx(L, 0.3, 0.07, M.navy, cxm, y0 + 0.5, 1.12, g); bx(L, 0.3, 0.07, M.navy, cxm, y0 + 0.5, -1.12, g);
      var inW = new THREE.Mesh(new THREE.BoxGeometry(L - 0.12, h - 0.06, 2.08), M.wallIn); inW.position.set(cxm, y0 + h / 2, 0); g.add(inW); inW.receiveShadow = true;
      bx(L - 0.1, 0.02, 2.05, M.dark, cxm, y0 + 0.01, 0, g);
      var d1 = bx(0.05, h, 1.08, M.white, x1 + 0.18, y0 + h / 2, 1.61, g); d1.rotation.y = 0.35; var d2 = bx(0.05, h, 1.08, M.white, x1 + 0.18, y0 + h / 2, -1.61, g); d2.rotation.y = PI - 0.35;
      bx(0.5, 0.06, 0.8, M.galv, x1 + 0.3, 0.55, 0, g); bx(0.5, 0.06, 0.8, M.galv, x1 + 0.6, 0.25, 0, g);
      // 책상 · 모니터 3대 · 의자 · 천장등
      bx(0.6, 0.05, 1.9, M.desk, x0 + 0.36, y0 + 0.75, 0, g); bx(0.56, 0.72, 0.05, M.desk, x0 + 0.36, y0 + 0.36, 0.9, g); bx(0.56, 0.72, 0.05, M.desk, x0 + 0.36, y0 + 0.36, -0.9, g);
            var led = bx(1.2, 0.03, 0.3, M.lampW, cxm, y0 + h - 0.03, 0, g); led.castShadow = false;
      var L1 = new THREE.PointLight(0xe8f0ff, 2.0, 5, 1.6); L1.position.set(cxm, y0 + h - 0.3, 0); g.add(L1);
      bx(0.5, 0.5, 0.5, M.chair, 0.35, y0 + 0.25, 0, g, 0.05); bx(0.1, 0.42, 0.46, M.chair, 0.6, y0 + 0.68, 0, g, 0.04);
      cyl(0.03, 1.1, M.steelDark, -1.8, 2.9, 0.6, g, 8); sph(0.08, M.orange, -1.8, 3.45, 0.6, g);
      wheel(-2.1, 0.5, 0.98, g); wheel(-2.1, 0.5, -0.98, g); wheel(1.8, 0.5, 0.98, g); wheel(1.8, 0.5, -0.98, g);
      return g;
    })();
    var monMats = [], mons = [];
    function monitor(lx, ly, lz, w, h2, ry, matx) { var fr = bx(0.04, h2 + 0.04, w + 0.04, M.black, lx, ly, lz, ocv); fr.rotation.y = ry; var s = new THREE.Mesh(new THREE.PlaneGeometry(w, h2), matx); s.position.set(lx + 0.022 * Math.cos(ry), ly, lz - 0.022 * Math.sin(ry)); s.rotation.y = PI / 2 + ry; ocv.add(s); mons.push(s); cyl(0.02, 0.2, M.black, lx - 0.04, ly - h2 / 2 - 0.1, lz, ocv, 6); return s; }

    /* ===== 사람(관절 인형): 걷기 · 들기 · 쪼그려 앉기 · 의자 · 검지기 · 손전등 ===== */
    /* 사람: 리깅 모형(xbot) + 실제 걷기/서기 동작 + 뼈 위에 덧씌우는 자세(들기 · 쪼그리기 · 조종 · 손전등) */
    var xbot = null, xclips = null, people = [];
    function person(o) { var root = new THREE.Group(); scene.add(root); var w = { root: root, o: o || {}, B: null, seed: rnd() * 5, hand: new THREE.Group(), handL: new THREE.Group() }; people.push(w); return w; }
    function rigPeople() {
      people.forEach(function (w) {
        var m = skClone(xbot); m.traverse(function (o) { if (o.isMesh) { o.castShadow = o.receiveShadow = true; o.frustumCulled = false; o.material = o.material.clone(); if (o.material.name.indexOf('Joints') >= 0) { o.material.color.set(0x1b2026); o.material.roughness = 0.6; o.material.metalness = 0.1; } else { o.material.color.set(w.o.vest === false ? 0x3a4b5e : 0x2b3f57); o.material.roughness = 0.9; o.material.metalness = 0; o.material.normalMap = fineNM; o.material.normalScale = new THREE.Vector2(0.25, 0.25); } } });
        w.root.add(m); w.model = m; var B = {}; m.traverse(function (o) { if (o.isBone) B[o.name.replace('mixamorig', '')] = o; }); w.B = B;
        w.mixer = new THREE.AnimationMixer(m); w.act = {}; ['idle', 'walk'].forEach(function (n) { var a = w.mixer.clipAction(THREE.AnimationClip.findByName(xclips, n)); a.play(); w.act[n] = a; });
        var k = 1 / B.Head.getWorldScale(new V3()).x;
        function att(obj, bone, x, y, z) { obj.scale.multiplyScalar(k); obj.position.set(x * k, y * k, z * k); bone.add(obj); return obj; }
        if (w.o.hair) { var hr = sph(0.112, M.black, 0, 0, 0, null, 20); hr.scale.set(1, 0.9, 1.05); att(hr, B.Head, 0, 0.105, -0.01); }
        else { var hm = sph(0.145, w.o.helmetMat || M.helmet, 0, 0, 0, null, 24); hm.scale.set(1, 0.82, 1.06); att(hm, B.Head, 0, 0.1, 0.01); var brim = cyl(0.165, 0.016, w.o.helmetMat || M.helmet, 0, 0, 0, null, 28); brim.scale.set(1, 1, 1.2); att(brim, B.Head, 0, 0.055, 0.03); }
        if (w.o.vest !== false) { var vs = bx(0.36, 0.34, 0.25, M.vest, 0, 0, 0, null, 0.04); att(vs, B.Spine2, 0, 0.02, 0.0); var r1 = bx(0.365, 0.03, 0.255, M.refl, 0, 0, 0, null); att(r1, B.Spine2, 0, -0.05, 0); var r2 = bx(0.365, 0.03, 0.255, M.refl, 0, 0, 0, null); att(r2, B.Spine2, 0, 0.09, 0); }
        if (w.o.scba) { var tk = cyl(0.085, 0.55, M.scba, 0, 0, 0, null, 16); att(tk, B.Spine2, 0, 0.0, -0.2); var bp = bx(0.3, 0.46, 0.05, M.black, 0, 0, 0, null, 0.02); att(bp, B.Spine2, 0, 0.0, -0.14); var mk = bx(0.2, 0.17, 0.09, M.mask, 0, 0, 0, null, 0.04); att(mk, B.Head, 0, 0.06, 0.11); var vz = bx(0.15, 0.08, 0.03, M.glass, 0, 0, 0, null, 0.01); att(vz, B.Head, 0, 0.085, 0.155); }
        att(w.hand, B.RightHand, 0.0, 0.08, 0.02); att(w.handL, B.LeftHand, 0, 0.08, 0.02);
        w.model.position.y = 0;
      });
    }
    function pose(w, p) {
      if (!w.B) return; var B = w.B, amp = clamp(p.amp || 0, 0, 1), cr = p.crouch || 0, carry = p.carry || 0;
      var wk = w.act.walk, id = w.act.idle, wd = wk.getClip().duration, idd = id.getClip().duration;
      wk.setEffectiveWeight(amp); id.setEffectiveWeight(1 - amp); wk.time = ((((p.ph || 0) / TAU) % 1) + 1) % 1 * wd; id.time = (((p.t || 0) * 0.85 + w.seed) % idd + idd) % idd; w.mixer.update(0);
      B.Spine.rotation.x += 0.55 * cr + (p.lean || 0); B.Head.rotation.x += (p.look || 0) - 0.35 * cr; B.Head.rotation.y += (p.turn || 0);
      B.LeftUpLeg.rotation.x -= 1.15 * cr; B.RightUpLeg.rotation.x -= 1.15 * cr; B.LeftLeg.rotation.x += 2.0 * cr; B.RightLeg.rotation.x += 2.0 * cr;
      w.model.position.y = -0.46 * cr - (p.sit ? 0.42 : 0);
      if (p.sit) { B.LeftUpLeg.rotation.x -= 1.5; B.RightUpLeg.rotation.x -= 1.5; B.LeftLeg.rotation.x += 1.5; B.RightLeg.rotation.x += 1.5; }
      if (carry) { B.LeftArm.rotation.x -= 0.85 * carry; B.RightArm.rotation.x -= 0.85 * carry; B.LeftForeArm.rotation.x -= 0.45 * carry; B.RightForeArm.rotation.x -= 0.45 * carry; B.LeftArm.rotation.y -= 0.15 * carry; B.RightArm.rotation.y += 0.15 * carry; }
      if (p.arms === 'front') { B.LeftArm.rotation.x -= 0.7; B.RightArm.rotation.x -= 0.7; B.LeftForeArm.rotation.x -= 0.8; B.RightForeArm.rotation.x -= 0.8; }
      if (p.arms === 'remote') { var j = Math.sin((p.t || 0) * 2.1) * 0.05; B.LeftArm.rotation.x -= 0.45 + j; B.RightArm.rotation.x -= 0.45 - j; B.LeftArm.rotation.y -= 0.35; B.RightArm.rotation.y += 0.35; B.LeftForeArm.rotation.x -= 1.25; B.RightForeArm.rotation.x -= 1.25; }
      if (p.arms === 'detector' || p.arms === 'lamp') { B.RightArm.rotation.x -= 0.95; B.RightForeArm.rotation.x -= 0.5; B.RightArm.rotation.y += 0.1; }
      if (p.arms === 'panel') { B.RightArm.rotation.x -= 1.05; B.RightForeArm.rotation.x -= 0.35; }
    }
    // 이동 궤적: [t, x, z, yaw(라디안, +z 가 앞), 자세, 덧붙임]
    function track(keys, t) {
      if (t <= keys[0][0]) return { x: keys[0][1], z: keys[0][2], yaw: keys[0][3], k: keys[0], ph: 0, amp: 0 };
      var dist = 0;
      for (var i = 0; i < keys.length - 1; i++) {
        var a = keys[i], b = keys[i + 1], L = Math.hypot(b[1] - a[1], b[2] - a[2]);
        if (t < b[0]) { var u = (t - a[0]) / (b[0] - a[0]), e = L > 0.05 ? u : easeIO(u); var dyaw = ((b[3] - a[3] + PI) % TAU + TAU) % TAU - PI; var sp = L / (b[0] - a[0]);
          return { x: lerp(a[1], b[1], e), z: lerp(a[2], b[2], e), yaw: a[3] + dyaw * clamp(u * 2.5, 0, 1), k: u < 0.5 ? a : b, ph: (dist + L * u) / 1.25 * TAU, amp: L > 0.05 ? clamp(sp / 1.1, 0, 1) * sstep(0, 0.12, u) * (1 - sstep(0.88, 1, u)) : 0 }; }
        dist += L;
      }
      var z2 = keys[keys.length - 1]; return { x: z2[1], z: z2[2], yaw: z2[3], k: z2, ph: 0, amp: 0 };
    }
    function chuteY(x, z) { if (Math.abs(z) > 0.6) return 0; var X0 = -TR - 0.37 - 2.5, X1 = -TR - 0.37, X2 = -TR + 0.05, X3 = X2 + 1.3; if (x < X0) return 0; if (x < X1) return MW.sill * (x - X0) / 2.5; if (x < X2) return MW.sill; if (x < X3) return MW.sill - (MW.sill - TY0) * (x - X2) / 1.3; return x < TR ? TY0 : 0; }

    var W1 = person(), W2 = person(), W3 = person({ helmetMat: M.helmetY }), W4 = person({ vest: false, hair: true }), W5 = person({ scba: true });
    bx(0.07, 0.13, 0.04, M.signY, 0, 0.02, 0.04, W3.hand, 0.01); bx(0.05, 0.03, 0.01, M.black, 0, 0.05, 0.065, W3.hand);
    var remote = bx(0.3, 0.07, 0.18, M.signY, -0.12, 0.0, 0.06, W4.hand, 0.02); [-0.2, -0.04].forEach(function (x) { cyl(0.011, 0.07, M.black, x, 0.05, 0.06, W4.hand, 6); });
    var lamp5 = cyl(0.035, 0.17, M.steelDark, 0, 0.02, 0.06, W5.hand, 10); lamp5.rotation.x = PI / 2; var lampSpot = new THREE.SpotLight(0xfff3dc, 0, 9, 0.5, 0.6, 1.4); lampSpot.position.set(0, 0.02, 0.1); W5.hand.add(lampSpot); var lampTgt = new THREE.Object3D(); lampTgt.position.set(0, -0.7, 2.2); W5.hand.add(lampTgt); lampSpot.target = lampTgt;
    new GLTFLoader().load(new URL(box.getAttribute('data-human') || 'assets/models/xbot.glb', root).href, function (g) { xbot = g.scene; xclips = g.animations; rigPeople(); begin(); }, undefined, function () { xbot = 'fail'; begin(); });
    W4.root.position.set(OCV.x + 0.35, OCVfloor, OCV.z); W4.root.rotation.y = -PI / 2;

    /* ===== 로봇 · 경로 · 호스 · CCTV ===== */
    var robot = new THREE.Group(); robot.rotation.order = 'YZX'; scene.add(robot); var RL = 0.9, rH = 0.42;
    var beacon = new THREE.MeshStandardMaterial({ color: 0x2f6fb3, emissive: 0x3f8fe0, emissiveIntensity: 2 }); var bc = sph(0.03, beacon, -0.18, 0.47, 0.18, robot, 12); bc.castShadow = false;
    var head = new THREE.SpotLight(0xfff4de, 0, 10, 0.7, 0.55, 1.2); head.position.set(0.46, 0.25, 0); head.target.position.set(3, -0.2, 0); robot.add(head); robot.add(head.target);
    var rcam = new THREE.PerspectiveCamera(72, 16 / 9, 0.05, 80); rcam.rotation.order = 'YXZ'; rcam.rotation.set(-0.2, -PI / 2, 0); rcam.position.set(0.36, 0.4, 0); robot.add(rcam);
    var rear = new V3(-0.4, 0.36, 0), nozzle = new V3(0.46, 0.33, 0);
    var loaded = false;
    new GLTFLoader().load(new URL(box.getAttribute('data-model') || 'assets/models/robot5-hero.glb', root).href, function (gltf) {
      var mdl = gltf.scene; mdl.traverse(function (o) { if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; if (o.material) { if (o.material.map) o.material.map.anisotropy = 8; o.material.envMapIntensity = 0.6; } } });
      var bb = new THREE.Box3().setFromObject(mdl), size = bb.getSize(new V3()), mid = bb.getCenter(new V3()); var k = RL / size.x; mdl.scale.setScalar(k); mdl.position.set(-mid.x * k, -bb.min.y * k, -mid.z * k); rH = size.y * k;
      robot.add(mdl); rear.set(-RL * 0.44, rH * 0.82, 0); rcam.position.set(RL * 0.36, rH * 0.95, 0); nozzle.set(RL * 0.5, rH * 0.62, 0); loaded = true; box.classList.add('is-model'); begin();
    }, undefined, function () { bx(0.9, 0.3, 0.55, M.orange, 0, 0.27, 0, robot, 0.04); bx(0.95, 0.16, 0.16, M.dark, 0, 0.08, 0.3, robot); bx(0.95, 0.16, 0.16, M.dark, 0, 0.08, -0.3, robot); loaded = true; begin(); });
    var pallet = bx(1.1, 0.14, 0.9, M.pallet, 0, 0.07, 0); var STAGE = new V3(-11.4, 0.14, 0.0); pallet.position.set(STAGE.x, 0.07, STAGE.z);
    function dense(list, step) { var out = []; for (var i = 0; i < list.length - 1; i++) { var a = list[i], b = list[i + 1], n = Math.max(1, Math.ceil(a.distanceTo(b) / step)); for (var j = 0; j < n; j++) out.push(a.clone().lerp(b, j / n)); } out.push(list[list.length - 1].clone()); return out; }
    function arcPts(cxp, cz, r, a0, a1, y, n) { var o = []; for (var i = 1; i < n; i++) { var a = a0 + (a1 - a0) * i / n; o.push(new V3(cxp + r * Math.sin(a), y, cz + r * Math.cos(a))); } return o; }
    var CH0 = -TR - 0.37 - 2.5;
    var drivePts = dense([new V3(CH0 - 0.75, 0, 0), new V3(CH0, 0, 0), new V3(-TR - 0.37, MW.sill, 0), new V3(-TR + 0.05, MW.sill, 0), new V3(-TR + 1.35, TY0, 0), new V3(-4.45, TY0, 0)], 0.12);
    var driveC = new THREE.CatmullRomCurve3(drivePts, false, 'catmullrom', 0.2), driveL = driveC.getLength();
    var LZ1 = 0.7, LZ2 = 2.1, XR = 4.3, XL = -3.9, Ru = (LZ2 - LZ1) / 2;
    var lanePts = dense([new V3(-4.45, TY0, 0), new V3(-3.9, TY0, 0.25), new V3(-3.4, TY0, LZ1), new V3(XR, TY0, LZ1)], 0.15).concat(arcPts(XR, LZ1 + Ru, Ru, PI, 0, TY0, 14).map(function (p) { return p; }), dense([new V3(XR, TY0, LZ2), new V3(XL, TY0, LZ2)], 0.15));
    // 반원: 중심(XR, LZ1+Ru), sin/cos 정의상 a=π → (XR, LZ1) , a=π/2 → (XR+Ru, ..) , a=0 → (XR, LZ2)
    lanePts = lanePts.filter(function (p, i, arr) { return i === 0 || p.distanceTo(arr[i - 1]) > 0.02; });
    var laneC = new THREE.CatmullRomCurve3(lanePts, false, 'catmullrom', 0.3), laneL = laneC.getLength();
    var WASH0 = new V3(-3.3, TY0, LZ2), WASH1 = new V3(0.4, TY0, LZ2);
    var T = { carry0: 11.6, carry1: 13.9, drop: 14.5, drive0: 14.8, drive1: 20.8, fast: 41, lanesEnd: 44.6, wash0: 45.2, wash1: 50.8, out: 51.5, total: 64 };
    function laneDist(t) { if (t < T.drive1) return 0; var vN = 0.42, dN = vN * (T.fast - T.drive1); if (t < T.fast) return vN * (t - T.drive1); if (t < T.lanesEnd) { var k = (t - T.fast) / (T.lanesEnd - T.fast); return dN + (laneL - dN) * (k * (1.6 - 0.6 * k)); } return laneL; }
    var rp = new V3(), rt = new V3(), tmpV = new V3(), tmpV2 = new V3();
    function robotAt(t, out) {
      out.inside = false; out.lift = 0; out.ph = 'stage';
      if (t < T.carry0 || t >= T.out) { out.pos.copy(STAGE); out.dir.set(1, 0, 0); out.ph = 'stage'; return out; }
      var A = STAGE.clone(), B = new V3(CH0 - 0.75, 0, 0);
      if (t < T.drive0) {
        var lift = t < T.carry0 + 0.4 ? sstep(T.carry0, T.carry0 + 0.4, t) : t < T.carry1 ? 1 : 1 - sstep(T.carry1, T.drop, t);
        var u = sstep(T.carry0 + 0.3, T.carry1, t); out.pos.lerpVectors(A, B, u); out.pos.y = lerp(lerp(STAGE.y, 0, u), 0.44, lift); out.dir.set(1, 0, 0); out.lift = lift; out.ph = 'carry'; return out;
      }
      if (t < T.drive1) { var d = driveL * easeIO((t - T.drive0) / (T.drive1 - T.drive0)); var uu = clamp(d / driveL, 0.0005, 0.9995); driveC.getPointAt(uu, out.pos); driveC.getTangentAt(uu, out.dir); out.ph = 'drive'; out.inside = out.pos.x > -TR + 0.3; out.d = d; return out; }
      if (t < T.wash0) { var ld = laneDist(t), u2 = clamp(ld / laneL, 0.0005, 0.9995); laneC.getPointAt(u2, out.pos); laneC.getTangentAt(u2, out.dir); out.ph = 'lane'; out.inside = true; out.d = ld; return out; }
      var k3 = easeIO((t - T.wash0) / (T.wash1 - T.wash0)); out.pos.lerpVectors(WASH0, WASH1, k3); out.dir.set(1, 0, 0); out.ph = 'wash'; out.inside = true; return out;
    }
    var RS = { pos: new V3(), dir: new V3(1, 0, 0) };
    var hoseFlowT = ctex((function () { var c = cnv(128, 16), g = c.getContext('2d'); g.fillStyle = '#2d3640'; g.fillRect(0, 0, 128, 16); g.fillStyle = '#4a5560'; g.fillRect(0, 0, 14, 16); g.fillStyle = '#1f262d'; g.fillRect(64, 0, 10, 16); return c; })(), true); hoseFlowT.wrapS = hoseFlowT.wrapT = THREE.RepeatWrapping;
    var hoseMesh = null, hoseMat = new THREE.MeshStandardMaterial({ color: 0xffffff, map: hoseFlowT, roughness: 0.62, metalness: 0.05, normalMap: fineNM, normalScale: new THREE.Vector2(0.6, 0.6) });
    var chunks = []; for (var ck = 0; ck < 36; ck++) { var cm = mesh(new THREE.DodecahedronGeometry(0.04 + hash(ck) * 0.07, 0), ck % 3 ? M.sludgeC : M.black, 0, -5, 0); cm.scale.set(1, 0.55 + hash(ck + 9) * 0.5, 1); cm.userData.noAO = true; chunks.push(cm); }
    function sampleCurve(c, L, d0, d1, step, yAdd) { var o = []; if (d1 - d0 < step * 0.5) return o; for (var d = d0; d < d1; d += step) { var p = c.getPointAt(clamp(d / L, 0, 1)); p.y += yAdd; o.push(p); } return o; }
    function buildHose(t) {
      var rw = robot.localToWorld(tmpV.copy(rear)); var back = tmpV2.copy(RS.dir).setY(0).normalize().multiplyScalar(-0.42).add(rw); back.y = Math.max((RS.inside ? TY0 : chuteY(back.x, back.z)) + 0.06, rw.y - 0.22);
      var pts = [new V3(REEL.x + 0.3, REEL.y - 0.55, REEL.z + 0.45), new V3(REEL.x + 0.55, 0.9, REEL.z + 0.7), new V3(REEL.x + 0.8, 0.06, REEL.z + 0.2)];
      if (RS.ph === 'stage' || RS.ph === 'carry') { pts.push(new V3(lerp(REEL.x + 0.8, back.x, 0.5), 0.06, lerp(REEL.z, back.z, 0.6) + 0.5)); }
      else {
        pts.push(new V3(CH0 - 1.6, 0.06, 1.3), new V3(CH0 - 1.1, 0.06, 0.18));
        if (RS.ph === 'drive') pts = pts.concat(sampleCurve(driveC, driveL, 0.3, RS.d - 0.75, 0.45, 0.06));
        else { pts = pts.concat(sampleCurve(driveC, driveL, 0.3, driveL - 0.2, 0.45, 0.06)); if (RS.ph === 'lane') pts = pts.concat(sampleCurve(laneC, laneL, 0.3, RS.d - 0.75, 0.55, 0.05)); else pts.push(new V3(-4.2, TY0 + 0.05, 0.6), new V3(-4.05, TY0 + 0.05, 1.5)); }
      }
      pts.push(back.clone(), rw.clone());
      var clean = [pts[0]]; for (var i = 1; i < pts.length; i++) if (pts[i].distanceTo(clean[clean.length - 1]) > 0.12 || i === pts.length - 1) clean.push(pts[i]);
      var hc = new THREE.CatmullRomCurve3(clean, false, 'centripetal'); var geo = new THREE.TubeGeometry(hc, Math.min(420, clean.length * 6), 0.05, 10, false); hoseFlowT.repeat.set(hc.getLength() / 0.42, 1);
      if (!hoseMesh) { hoseMesh = add(new THREE.Mesh(geo, hoseMat)); } else { hoseMesh.geometry.dispose(); hoseMesh.geometry = geo; }
    }

    /* ===== 입자: 물줄기 · 물보라 · 흡입되는 찌꺼기 · 탱크 안 가스 ===== */
    function dotTex(soft) { var c = cnv(64), g = c.getContext('2d'), r = g.createRadialGradient(32, 32, 0, 32, 32, 32); r.addColorStop(0, 'rgba(255,255,255,1)'); r.addColorStop(soft ? 0.25 : 0.55, 'rgba(255,255,255,' + (soft ? 0.5 : 0.9) + ')'); r.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = r; g.fillRect(0, 0, 64, 64); return ctex(c, true); }
    var dotT = dotTex(false), softT = dotTex(true);
    function pts(n, size, color, opacity, map) { var g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(new Float32Array(n * 3), 3)); var p = new THREE.Points(g, new THREE.PointsMaterial({ size: size, color: color, map: map, transparent: true, opacity: opacity, depthWrite: false, sizeAttenuation: true })); p.frustumCulled = false; scene.add(p); return p; }
    var JET = pts(900, 0.03, 0xe6f2ff, 0.95, dotT), SPL = pts(180, 0.035, 0xdfeefa, 0.85, dotT), MIST = pts(46, 0.9, 0xeef5fb, 0.13, softT), SUCK = pts(90, 0.06, 0x2a2119, 1.0, dotT), GAS = pts(90, 2.0, 0x9a9672, 0.08, softT);
    var gasBase = []; for (var gi = 0; gi < 90; gi++) { var ga = rnd() * TAU, gr2 = Math.sqrt(rnd()) * 5.0; gasBase.push([gr2 * Math.sin(ga), TY0 + 0.4 + rnd() * 2.4, gr2 * Math.cos(ga), rnd() * TAU]); }
    var nzW = new V3(), fwd = new V3(), side = new V3(); var core = new THREE.Mesh(new THREE.BufferGeometry(), new THREE.MeshStandardMaterial({ color: 0xeaf4ff, roughness: 0.1, metalness: 0, transparent: true, opacity: 0.55, emissive: 0x6c8aa8, emissiveIntensity: 0.4, depthWrite: false })); core.userData.noAO = true; core.frustumCulled = false; scene.add(core);
    function updParticles(t, washOn, suckOn, gas) {
      robot.localToWorld(nzW.copy(nozzle)); fwd.copy(RS.dir).setY(0).normalize(); side.set(-fwd.z, 0, fwd.x);
      var a = JET.geometry.attributes.position.array, s = SPL.geometry.attributes.position.array, mi = MIST.geometry.attributes.position.array;
      JET.visible = SPL.visible = MIST.visible = core.visible = washOn > 0.01; core.material.opacity = 0.5 * washOn; JET.material.opacity = 0.95 * washOn; SPL.material.opacity = 0.85 * washOn; MIST.material.opacity = 0.13 * washOn;
      if (JET.visible) {
        var sweep = Math.sin(t * 2.3) * 0.32, up = 0.05 + 0.06 * Math.sin(t * 1.3), dir = fwd.clone().applyAxisAngle(new V3(0, 1, 0), sweep); var vy = up * 7.0, vh = 7.0;
        for (var i = 0; i < 900; i++) { var hsh = hash(i), age = ((t * 2.4 + hsh * 7.31) % 1) * 0.42, jx = (hash(i + 7) - 0.5) * 0.12, jy = (hash(i + 13) - 0.5) * 0.1; var px = nzW.x + (dir.x + side.x * jx) * vh * age, pz = nzW.z + (dir.z + side.z * jx) * vh * age, py = nzW.y + (vy + jy * 6) * age - 4.9 * age * age; if (py < TY0 + 0.02) py = TY0 + 0.02 + hash(i + 3) * 0.05; a[i * 3] = px; a[i * 3 + 1] = py; a[i * 3 + 2] = pz; }
        var tHit = 0.34, hx = nzW.x + dir.x * vh * tHit, hz = nzW.z + dir.z * vh * tHit;
        for (var j = 0; j < 180; j++) { var ag = ((t * 3.1 + hash(j + 50) * 5.7) % 1), ang = hash(j + 90) * TAU, sp = 0.5 + hash(j + 31) * 1.4; s[j * 3] = hx + Math.cos(ang) * sp * ag * 0.8; s[j * 3 + 2] = hz + Math.sin(ang) * sp * ag * 0.8; s[j * 3 + 1] = TY0 + 0.02 + (2.2 * ag - 4.9 * ag * ag) * (0.5 + hash(j + 71)); }
        for (var q = 0; q < 46; q++) { var ag2 = ((t * 0.5 + hash(q + 200)) % 1); mi[q * 3] = hx + (hash(q + 3) - 0.5) * 2.0 + side.x * ag2 * 0.5; mi[q * 3 + 1] = TY0 + 0.2 + ag2 * 1.1; mi[q * 3 + 2] = hz + (hash(q + 9) - 0.5) * 2.0 + side.z * ag2 * 0.5; }
        JET.geometry.attributes.position.needsUpdate = SPL.geometry.attributes.position.needsUpdate = MIST.geometry.attributes.position.needsUpdate = true;
        var cpts = []; for (var cc = 0; cc <= 12; cc++) { var ta = cc / 12 * tHit; cpts.push(new V3(nzW.x + dir.x * vh * ta, Math.max(TY0 + 0.03, nzW.y + vy * ta - 4.9 * ta * ta), nzW.z + dir.z * vh * ta)); } if (core.geometry) core.geometry.dispose(); core.geometry = new THREE.TubeGeometry(new THREE.CatmullRomCurve3(cpts), 24, 0.018, 6, false);
      }
      var front2 = robot.localToWorld(tmpV.set(RL * 0.55, 0.0, 0));
      for (var ci = 0; ci < chunks.length; ci++) { var ch = chunks[ci]; if (suckOn < 0.01) { ch.visible = false; continue; } ch.visible = true; var ag4 = ((t * 0.9 + hash(ci + 600) * 4.1) % 1), sx2 = (hash(ci + 610) - 0.5) * 0.9, dd2 = 0.95 * (1 - ag4 * ag4); ch.position.set(front2.x + fwd.x * dd2 + side.x * sx2 * (1 - ag4 * 0.8), TY0 + 0.03 + (0.02 + hash(ci + 620) * 0.14) * (1 - ag4) + ag4 * 0.08, front2.z + fwd.z * dd2 + side.z * sx2 * (1 - ag4 * 0.8)); var sc3 = (1 - ag4 * 0.85); ch.scale.set(sc3, sc3 * (0.55 + hash(ci + 9) * 0.5), sc3); ch.rotation.set(ag4 * 6 + ci, ci * 0.7, ag4 * 3); }
      SUCK.visible = suckOn > 0.01; if (SUCK.visible) { var k = SUCK.geometry.attributes.position.array, front = robot.localToWorld(tmpV.set(RL * 0.55, 0.08, 0)); for (var n = 0; n < 90; n++) { var ag3 = ((t * 1.3 + hash(n + 400) * 3.3) % 1), sx = (hash(n + 410) - 0.5) * 0.7, dd = (1 - ag3) * 0.55; k[n * 3] = front.x + fwd.x * dd + side.x * sx * (1 - ag3); k[n * 3 + 1] = TY0 + 0.05 + hash(n + 420) * 0.12 * (1 - ag3) + 0.06; k[n * 3 + 2] = front.z + fwd.z * dd + side.z * sx * (1 - ag3); } SUCK.geometry.attributes.position.needsUpdate = true; }
      GAS.visible = gas > 0.01; GAS.material.opacity = 0.08 * gas; if (GAS.visible) { var g2 = GAS.geometry.attributes.position.array; for (var m2 = 0; m2 < 90; m2++) { var b = gasBase[m2]; g2[m2 * 3] = b[0] + Math.sin(t * 0.21 + b[3]) * 0.4; g2[m2 * 3 + 1] = b[1] + Math.sin(t * 0.17 + b[3] * 2) * 0.15; g2[m2 * 3 + 2] = b[2] + Math.cos(t * 0.19 + b[3]) * 0.4; } GAS.geometry.attributes.position.needsUpdate = true; }
    }

    /* ===== 이야기(장면) · 카메라 ===== */
    var SHOTS = [
      { t0: 0, t1: 5, step: 0, where: '설비 밖', title: 'System 설치', desc: '현장 적용 가능성을 검토하고, 사전 Test를 거쳐 장비를 놓습니다.', ap: 0.6, k: [[0, [-21, 15.5, 33], [-4.6, 1.6, 2.4], 31], [1, [-17, 11.5, 28], [-5.2, 1.3, 2.8], 31]] },
      { t0: 5, t1: 11, step: 1, where: '설비 밖', title: '1차 Washing', desc: 'Vacuum Car(흡입차)로 탱크 바깥에서 잔여 물질을 먼저 빼냅니다.', ap: 1.6, k: [[0, [-0.4, 2.0, -10.2], [-7.4, 0.7, -1.4], 34], [1, [-1.8, 1.7, -9.4], [-10.0, 0.9, 1.0], 34]] },
      { t0: 11, t1: 20, step: 2, where: '설비 안 · 로봇', title: '로봇 투입', desc: '작업자가 들어가기 전에, 로봇이 먼저 맨홀로 들어갑니다.', pip: [15.8, 20], ap: 1.4, k: [[0, [-12.2, 1.6, 5.2], [-9.8, 0.55, 0.3], 33], [0.5, [-10.6, 1.5, 4.6], [-8.4, 0.55, 0.15], 33], [1, [-9.6, 1.45, 3.9], [-6.6, 0.75, 0], 32]] },
      { t0: 20, t1: 27, lin: true, step: 2, where: '설비 밖 · 사람', title: '원격 조정', desc: '작업자는 제어 차량에서 CCTV 화면으로 탱크 안을 보며 조종합니다.', ap: 1.2, k: [[0, [OCV.x + 5.2, 2.6, OCV.z + 0.5], [OCV.x - 0.95, 1.95, OCV.z - 0.3], 34], [0.66, [OCV.x + 4.0, 2.5, OCV.z + 0.4], [OCV.x - 0.95, 2.0, OCV.z - 0.2], 33], [1, [OCV.x + 0.05, 2.42, OCV.z + 0.42], [OCV.x - 0.98, 2.12, OCV.z - 0.05], 30]] },
      { t0: 27, t1: 33, step: 2, where: '설비 안 · 로봇', title: '내부 Cleaning — 1차 회수', desc: '탱크를 열어 보면: 로봇이 바닥의 슬러지를 빨아들여 호스로 밖에 보냅니다.', ap: 0.5, k: [[0, [4.6, 9.4, 12.4], [-1.0, 0.5, 1.0], 34], [1, [3.0, 7.4, 10.2], [-0.6, 0.4, 1.3], 34]] },
      { t0: 33, t1: 41, follow: true, step: 2, where: '설비 안 · 로봇', title: '빨아들이는 것 — 바닥의 슬러지와 잔류 위험 물질', desc: '흡입구 앞의 슬러지가 호스로 빨려 들어가고, 지나간 자리에는 바닥이 드러납니다.', ap: 3.2, k: [[0, [-1.7, 0.8, 1.9], [0.95, 0.1, -0.25], 36], [1, [-1.4, 0.65, 2.1], [1.0, 0.08, -0.3], 34]] },
      { t0: 41, t1: 45, step: 2, where: '설비 안 · 로봇', title: '내부 Cleaning — 빠르게 보기', desc: '줄을 맞춰 바닥 전체를 훑습니다. 슬러지 높이가 내려가고 가열 코일이 드러납니다.', pip: [41, 45], ff: [41, 44.6], ap: 0.5, k: [[0, [2.2, 8.0, 7.8], [-0.4, 0.4, 1.2], 34], [1, [1.0, 8.6, 6.2], [-0.2, 0.4, 1.4], 34]] },
      { t0: 45, t1: 51, follow: true, step: 3, where: '설비 안 · 로봇', title: '2차 Washing', desc: '전면 Jet Nozzle로 바닥과 벽을 씻어 위험 물질을 최소로 줄입니다.', pip: [45.4, 50.8], ap: 2.2, k: [[0, [-1.7, 1.25, 2.6], [1.5, 0.25, 0], 40], [1, [-1.3, 1.1, 2.4], [1.9, 0.2, 0], 40]] },
      { t0: 51, t1: 57, step: 4, where: '설비 안 · 작업자', title: 'Final Cleaning', desc: '위험 물질이 줄어든 뒤에야 작업자가 들어가 남은 것을 마무리합니다.', ap: 1.4, k: [[0, [1.2, 2.0, 4.1], [-5.0, 0.95, 0.0], 38], [1, [0.6, 1.9, 3.6], [-5.0, 0.9, -0.2], 38]] },
      { t0: 57, t1: 64, step: 5, where: '', title: '폐기물 처리', desc: '폐기물량은 줄고, 처리 기간은 짧아집니다.', quote: 60, ap: 0.4, k: [[0, [-3.5, 8.5, 21], [-3.2, 1.2, 0.2], 32], [1, [-12, 18, 33], [-5, 1.6, 1.4], 32]] }
    ];
    var camera = new THREE.PerspectiveCamera(32, W / H, 0.08, 900); scene.add(camera);
    var SHIFT = mobile ? 0 : qn('shift', 0.34);
    function setView() { if (SHIFT > 0) { camera.aspect = W * (1 + SHIFT) / H; camera.setViewOffset(W * (1 + SHIFT), H, 0, 0, W, H); } else { camera.aspect = W / H; camera.clearViewOffset(); } camera.updateProjectionMatrix(); }
    setView();
    var cp = new V3(), cl = new V3();
    function shotAt(t) { for (var i = 0; i < SHOTS.length; i++) if (t < SHOTS[i].t1) return i; return SHOTS.length - 1; }
    function camAt(S, t) {
      var u = clamp((t - S.t0) / (S.t1 - S.t0), 0, 1), k = S.k; if (!S.lin) u = easeIO(u); var i = 0; while (i < k.length - 2 && u > k[i + 1][0]) i++;
      var a = k[i], b = k[i + 1], e = clamp((u - a[0]) / (b[0] - a[0]), 0, 1); if (S.lin && i === k.length - 2) e = e * e * e; else if (S.lin) e = easeIO(e);
      cp.set(lerp(a[1][0], b[1][0], e), lerp(a[1][1], b[1][1], e), lerp(a[1][2], b[1][2], e)); cl.set(lerp(a[2][0], b[2][0], e), lerp(a[2][1], b[2][1], e), lerp(a[2][2], b[2][2], e)); var fov = lerp(a[3], b[3], e);
      if (mobile) { var refA = 1.74, aspect = W / H; fov = 2 * Math.atan(Math.tan(fov * PI / 360) * refA / aspect * 0.78) * 180 / PI; var mf = S.step === 2 && S.t0 === 22 ? 1.0 : 1.04; cp.sub(cl).multiplyScalar(mf).add(cl); }
      if (S.follow) { var yaw = Math.atan2(-RS.dir.z, RS.dir.x); cp.applyAxisAngle(new V3(0, 1, 0), yaw); cl.applyAxisAngle(new V3(0, 1, 0), yaw); cp.add(RS.pos); cl.add(RS.pos); cp.y += Math.sin(t * 1.7) * 0.012; cp.x += Math.sin(t * 1.1 + 2) * 0.01; }
      if (Q.get('dbgcam')) { rcam.updateWorldMatrix(true, false); cp.setFromMatrixPosition(rcam.matrixWorld); cl.set(0, 0, -1).applyMatrix4(rcam.matrixWorld); fov = 72; }
      camera.fov = fov; camera.position.copy(cp); camera.lookAt(cl); camera.updateProjectionMatrix();
      var d = cp.distanceTo(cl); scene.fog.near = Math.max(30, d * 3.2); scene.fog.far = Math.max(120, d * 9);
      if (bokeh) { bokeh.uniforms.focus.value = d; bokeh.uniforms.aperture.value = (S.ap || 1) * 0.0001; } if (grain) grain.uniforms.time.value = t;
    }

    /* ===== 후처리 ===== */
    var composer = null, aoPass = null, bokeh = null, grain = null;
    if (quality !== 'low') {
      composer = new EffectComposer(renderer); composer.setPixelRatio(pr); composer.setSize(W, H); composer.addPass(new RenderPass(scene, camera));
      if (quality === 'high') {
        aoPass = new GTAOPass(scene, camera, W, H); aoPass.output = GTAOPass.OUTPUT.Default;
        aoPass.updateGtaoMaterial({ radius: 0.45, distanceExponent: 1.4, thickness: 0.7, scale: 1.0, samples: qn('aos', 12), distanceFallOff: 1, screenSpaceRadius: false }); aoPass.updatePdMaterial({ lumaPhi: 10, depthPhi: 2, normalPhi: 3, radius: 5, rings: 2, samples: 16 }); aoPass.blendIntensity = 0.8;
        aoPass.overrideVisibility = function () { var cache = this._visibilityCache; this.scene.traverse(function (o) { cache.set(o, o.visible); if (o.isPoints || o.isLine || o.userData.noAO) o.visible = false; }); };
        composer.addPass(aoPass);
      }
      if (quality === 'high' && !Q.get('nodof')) { bokeh = new BokehPass(scene, camera, { focus: 10, aperture: 0.0001, maxblur: 0.0065 }); composer.addPass(bokeh); }
      composer.addPass(new UnrealBloomPass(new THREE.Vector2(W, H), 0.14, 0.55, 0.9)); composer.addPass(new OutputPass()); composer.addPass(new SMAAPass(W * pr, H * pr));
      grain = new ShaderPass({ uniforms: { tDiffuse: { value: null }, time: { value: 0 }, amount: { value: qn('grain', 0.035) }, vig: { value: 0.3 } }, vertexShader: 'varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }', fragmentShader: 'uniform sampler2D tDiffuse; uniform float time, amount, vig; varying vec2 vUv; float h(vec2 p){ return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453); } void main(){ vec4 c = texture2D(tDiffuse, vUv); float n = h(floor(vUv * vec2(1920.0, 1200.0)) + fract(time) * 37.0) - 0.5; c.rgb += n * amount * (1.0 - c.rgb * 0.6); float d = distance(vUv, vec2(0.5)); c.rgb *= 1.0 - smoothstep(0.42, 0.95, d) * vig; gl_FragColor = c; }' }); composer.addPass(grain);
    }
    // CCTV: 로봇 카메라 → 렌더 타깃 → 제어 차량 모니터 · 화면 속 작은 창(PIP)
    var rtv = new THREE.WebGLRenderTarget(qn('rtw', 640), qn('rtw', 640) * 9 / 16, { type: THREE.HalfFloatType });
    var camMat = new THREE.MeshBasicMaterial({ map: rtv.texture, toneMapped: true, color: new THREE.Color(2.4, 2.4, 2.4) }), mapMat = new THREE.MeshBasicMaterial({ map: tC, color: 0xb9c3cc });
    var deskX = -1.3 + 0.32, monY = OCVfloor + 1.13;
    monitor(deskX, monY, 0, 0.64, 0.38, 0, camMat); monitor(deskX + 0.08, monY, 0.62, 0.48, 0.3, 0.42, mapMat); monitor(deskX + 0.08, monY, -0.62, 0.48, 0.3, -0.42, camMat);
    var pipScene = new THREE.Scene(), pipCam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 2), pipQuad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), new THREE.MeshBasicMaterial({ map: rtv.texture, depthTest: false, depthWrite: false, color: new THREE.Color(1.5, 1.5, 1.5) })); pipQuad.position.z = -1; pipScene.add(pipQuad);
    var pipEl = box.querySelector('.h3s__pip');

    /* ===== 글 · 단계 표시 ===== */
    var capEl = box.querySelector('.h3s__cap'), whereEl = box.querySelector('.h3s__where'), titleEl = box.querySelector('.h3s__t'), descEl = box.querySelector('.h3s__d'), stepEls = [].slice.call(box.querySelectorAll('.h3s__steps li')), veil = box.querySelector('.h3s__veil'), ffEl = box.querySelector('.h3s__ff'), quoteEl = box.querySelector('.h3s__q');
    var stepSpan = [[0, 5], [5, 11], [11, 45], [45, 51.5], [51.5, 57], [57, 64]], lastShot = -1;
    function overlay(t, si) {
      var S = SHOTS[si];
      if (si !== lastShot) { lastShot = si; if (whereEl) { whereEl.textContent = S.where; whereEl.style.display = S.where ? '' : 'none'; } if (titleEl) titleEl.textContent = S.title; if (descEl) descEl.textContent = S.desc; stepEls.forEach(function (li, i) { li.classList.toggle('is-on', i === S.step); li.classList.toggle('is-done', i < S.step); }); }
      var fadeIn = sstep(S.t0 + 0.15, S.t0 + 0.75, t), fadeOut = 1 - sstep(S.t1 - 0.45, S.t1 - 0.1, t), qOn = S.quote ? sstep(S.quote, S.quote + 0.6, t) : 0;
      if (capEl) { capEl.style.opacity = (fadeIn * fadeOut).toFixed(3); var cin = capEl.querySelector('.h3s__in'); if (cin) cin.style.opacity = (1 - qOn).toFixed(3); }
      if (quoteEl) quoteEl.style.opacity = (qOn * fadeOut).toFixed(3);
      stepEls.forEach(function (li, i) { var sp = stepSpan[i], f = clamp((t - sp[0]) / (sp[1] - sp[0]), 0, 1); var bar = li.querySelector('i'); if (bar) bar.style.transform = 'scaleX(' + (i < S.step ? 1 : i === S.step ? f : 0).toFixed(4) + ')'; });
      var v = 0; [0, 5, 11, 20, 33, 41, 45, 51, 57, 64].forEach(function (c) { v = Math.max(v, t < c ? 0.5 * sstep(c - 0.22, c, t) : 0.5 * (1 - sstep(c, c + 0.35, t))); });
      v = Math.max(v, t < 27 ? sstep(26.35, 27, t) : 1 - sstep(27, 27.7, t));
      if (veil) veil.style.opacity = v.toFixed(3);
      if (ffEl) ffEl.style.opacity = (S.ff ? sstep(S.ff[0], S.ff[0] + 0.3, t) * (1 - sstep(S.ff[1] - 0.2, S.ff[1], t)) : 0).toFixed(3);
      var pip = S.pip ? sstep(S.pip[0], S.pip[0] + 0.4, t) * (1 - sstep(S.pip[1] - 0.35, S.pip[1], t)) : 0;
      if (pipEl) { pipEl.style.opacity = pip.toFixed(3); var tm = pipEl.querySelector('.h3s__tc'); if (tm) { var sec = Math.floor(t * 23 + 812), hh = '00', mm = ('0' + Math.floor(sec / 60) % 60).slice(-2), ss = ('0' + sec % 60).slice(-2); tm.textContent = '14:' + mm + ':' + ss; } }
      return pip;
    }

    /* ===== 한 프레임 ===== */
    function cutAt(t) { var open = 65 / 180 * PI; if (t < 27.4) return 0; if (t < 30.2) return open * easeIO((t - 27.4) / 2.8); if (t < 58.5) return open; if (t < 61.5) return open * (1 - easeIO((t - 58.5) / 3)); return 0; }
    function render(t) {
      t = ((t % T.total) + T.total) % T.total; if (!loaded) return;
      var si = shotAt(t), S = SHOTS[si];
      var a = Math.round(cutAt(t) * 1000) / 1000; if (a !== curCut) buildShell(a);
      robotAt(t, RS); robot.position.copy(RS.pos); var hd = Math.hypot(RS.dir.x, RS.dir.z) || 1; robot.rotation.y = Math.atan2(-RS.dir.z, RS.dir.x); robot.rotation.z = Math.atan2(RS.dir.y, hd); robot.rotation.x = RS.ph === 'carry' ? Math.sin(t * 5) * 0.012 : 0;
      robot.visible = !(RS.ph === 'stage' && t >= T.out && si === 6 && false);
      var inside = RS.inside; head.intensity = (t > T.drive0 + 0.6 && t < T.out) ? 14 : 0; beacon.emissiveIntensity = (Math.floor(t * 1.6) % 2) ? 2.6 : 0.3;
      // 사람들
      var c0 = T.carry0, perp = new V3(0, 0, 1);
      function carrier(w, sd, keysBefore, keysAfter) {
        var st, pz;
        if (t >= c0 - 0.4 && t < T.drop + 0.1) { var pos = RS.pos; st = { x: pos.x - 0.05, z: pos.z + sd * 0.6, yaw: PI / 2, ph: (pos.x - STAGE.x) / 1.1 * TAU, amp: RS.lift > 0.5 && t < T.carry1 ? 0.55 : 0 }; pose(w, { t: t, ph: st.ph, amp: st.amp, carry: 1, crouch: 0.75 * (1 - RS.lift) }); }
        else { st = track(t < c0 ? keysBefore : keysAfter, t); pose(w, { t: t, ph: st.ph, amp: st.amp, crouch: st.k[5] || 0, arms: st.k[4], lean: st.k[6] || 0 }); }
        w.root.position.set(st.x, chuteY(st.x, st.z), st.z); w.root.rotation.y = st.yaw;
      }
      carrier(W1, 1, [[0, -9.0, 8.6, -2.8, '', 0], [3.6, -11.2, 2.2, -2.6, '', 0], [4.6, -11.9, 0.95, PI, '', 0], [5.0, -11.9, 0.95, PI, '', 0], [6.4, -11.9, 0.95, PI, 'front', 0.55], [11.0, -11.9, 0.95, PI, 'front', 0.55], [11.2, -11.45, 0.6, PI / 2, '', 0]],
        [[T.drop + 0.1, -9.65, 0.6, PI / 2, '', 0.6], [15.4, -9.7, 0.9, 2.4, '', 0], [16.4, -9.15, -0.85, PI / 2, 'front', 0.45], [T.out - 0.01, -9.15, -0.85, PI / 2, 'front', 0.45], [T.out, -12.1, 0.9, PI, '', 0], [64, -12.1, 0.9, PI, '', 0]]);
      carrier(W2, -1, [[0, -9.6, 9.4, -2.6, '', 0], [3.6, -11.8, 6.0, -2.4, '', 0], [4.6, -12.3, 3.35, -PI / 2, 'panel', 0], [8.6, -12.3, 3.35, -PI / 2, 'panel', 0], [10.2, -12.4, -0.9, PI, '', 0], [11.1, -11.45, -0.6, PI / 2, '', 0]],
        [[T.drop + 0.1, -9.65, -0.6, PI / 2, '', 0.6], [16.2, -10.7, -1.6, 1.1, '', 0], [T.out - 0.01, -10.7, -1.6, 1.1, '', 0], [T.out, -12.3, -0.9, PI / 2, '', 0], [64, -12.3, -0.9, PI / 2, '', 0]]);
      W3.root.position.set(-7.35, 0, -1.4); W3.root.rotation.y = 0.62; pose(W3, { t: t, arms: 'detector', look: 0.1, turn: Math.sin(t * 0.4) * 0.15 });
      pose(W4, { sit: true, arms: 'remote', t: t, look: -0.05, lean: -0.08 });
      var s5 = t >= T.out ? track([[T.out, -5.55, 0.02, PI / 2, 'lamp', 0.75], [53.0, -4.75, 0.05, PI / 2, 'lamp', 0], [55.4, -3.5, 0.55, 2.1, 'lamp', 0], [57.0, -3.1, 0.9, 1.4, 'lamp', 0], [64, -3.1, 0.9, 1.4, 'lamp', 0]], t) : null;
      W5.root.visible = !!s5; if (s5) { W5.root.position.set(s5.x, chuteY(s5.x, s5.z), s5.z); W5.root.rotation.y = s5.yaw; pose(W5, { t: t, ph: s5.ph, amp: s5.amp, crouch: (s5.k[5] || 0) * (1 - sstep(T.out, 53.0, t)), arms: 'lamp', turn: Math.sin(t * 0.9) * 0.25 }); lampSpot.intensity = 14; } else lampSpot.intensity = 0;
      buildHose(t);
      // 슬러지
      var level = t < T.drive1 ? 1 : t < T.lanesEnd ? lerp(1, 0.34, sstep(T.drive1, T.lanesEnd, t)) : lerp(0.34, 0.16, sstep(T.wash0, T.wash1, t)); if (t >= T.out || t < 0.01) level = t >= T.out ? 0.12 : 1;
      var clean = [], wash = [];
      if (RS.ph === 'drive') clean = sampleCurve(driveC, driveL, driveL - 1.3, RS.d, 0.2, 0).filter(function (p) { return p.x > -TR + 0.3; });
      if (RS.ph === 'lane' || RS.ph === 'wash' || t >= T.out) { clean = sampleCurve(driveC, driveL, driveL - 1.3, driveL, 0.2, 0).concat(sampleCurve(laneC, laneL, 0, RS.ph === 'lane' ? RS.d : laneL, 0.2, 0)); }
      if (RS.ph === 'lane' || RS.ph === 'drive') { var fr = robot.localToWorld(new V3(RL * 0.3, 0, 0)); clean.push(fr); }
      if (RS.ph === 'wash') { wash = [WASH0.clone(), RS.pos.clone().add(new V3(0.9, 0, 0))]; } if (t >= T.out) { wash = [WASH0.clone(), WASH1.clone().add(new V3(0.9, 0, 0))]; }
      paintSludge(level, clean, wash, level.toFixed(3) + '|' + clean.length + '|' + (clean.length ? clean[clean.length - 1].x.toFixed(2) + clean[clean.length - 1].z.toFixed(2) : '') + '|' + wash.length + (wash.length ? wash[1].x.toFixed(2) : ''));
      coils.forEach(function (c) { c.material = level < 0.5 && t > T.wash0 ? M.coilClean : M.coil; });
      var washOn = RS.ph === 'wash' ? sstep(T.wash0 + 0.3, T.wash0 + 0.8, t) * (1 - sstep(T.wash1 - 0.3, T.wash1, t)) : 0, suckOn = RS.ph === 'lane' ? 1 : RS.ph === 'drive' && RS.inside ? 0.6 : 0;
      var gas = t < T.drive1 ? 1 : t < T.wash1 ? lerp(1, 0, sstep(T.drive1, T.wash1, t)) : 0; if (t >= T.out) gas = 0;
      updParticles(t, washOn, suckOn, gas);
      flowT.offset.x = -(t * 1.6) % 1; hoseFlowT.offset.x = (RS.inside || RS.ph === 'lane' || RS.ph === 'wash') ? -(t * 1.3) % 1 : 0; inLamps.forEach(function (L) { L.intensity = 5; });
      // 카메라
      camAt(S, t);
      // CCTV 렌더 타깃(제어 차량 화면이 보이거나 PIP 가 켜질 때만)
      var needRT = si === 3 || (S.pip && t >= S.pip[0] - 0.2 && t <= S.pip[1] + 0.2);
      if (needRT) { var gv = GAS.visible, mv = MIST.visible, sv2 = SUCK.visible; GAS.visible = MIST.visible = SUCK.visible = false; mons.forEach(function (m3) { m3.visible = false; }); renderer.setRenderTarget(rtv); renderer.render(scene, rcam); renderer.setRenderTarget(null); mons.forEach(function (m3) { m3.visible = true; }); GAS.visible = gv; MIST.visible = mv; SUCK.visible = sv2; }
      var pip = overlay(t, si);
      if (composer) composer.render(); else renderer.render(scene, camera);
      if (pip > 0.01 && pipEl) {
        var cr = renderer.domElement.getBoundingClientRect(), r = pipEl.getBoundingClientRect(), x = r.left - cr.left, y = cr.bottom - r.bottom; pipQuad.material.opacity = pip; pipQuad.material.transparent = pip < 0.99;
        renderer.autoClear = false; renderer.clearDepth(); renderer.setScissorTest(true); renderer.setViewport(x, y, r.width, r.height); renderer.setScissor(x, y, r.width, r.height); renderer.render(pipScene, pipCam); renderer.setScissorTest(false); renderer.setViewport(0, 0, W, H); renderer.autoClear = true;
      }
    }

    /* ===== 시간 · 시작 · 크기 ===== */
    var t0 = performance.now(), visible = true, raf = 0, begun = false, fixedT = qn('t', -1);
    window.__renderAt = function (tt) { fixedT = tt; render(tt); return true; };
    function loop(now) { render((now - t0) / 1000 + qn('t0', 0)); if (visible && fixedT < 0) raf = requestAnimationFrame(loop); }
    function begin() { if (begun || !loaded || !xbot || !hdrOk) return; begun = true; box.classList.add('is-ready'); if (fixedT >= 0 || reduce) { render(fixedT >= 0 ? fixedT : 34); box.classList.add('is-paused'); return; } t0 = performance.now(); raf = requestAnimationFrame(loop); }
    setTimeout(function () { loaded = true; if (!xbot) xbot = 'fail'; hdrOk = true; begin(); }, qn('wait', 8000));
    if ('IntersectionObserver' in window) new IntersectionObserver(function (es) { es.forEach(function (e) { var v = e.isIntersecting; if (v && !visible && fixedT < 0 && begun && !reduce) { visible = true; raf = requestAnimationFrame(loop); } visible = v; if (!v) cancelAnimationFrame(raf); }); }, { threshold: 0.05 }).observe(box);
    function resize() { W = wrap.clientWidth; H = wrap.clientHeight; if (!W || !H) return; renderer.setSize(W, H); if (composer) composer.setSize(W, H); if (aoPass) aoPass.setSize(W, H); setView(); if (fixedT >= 0 || reduce) render(fixedT >= 0 ? fixedT : 34); }
    window.addEventListener('resize', resize);
    document.addEventListener('visibilitychange', function () { if (document.hidden) cancelAnimationFrame(raf); else if (visible && begun && fixedT < 0 && !reduce) raf = requestAnimationFrame(loop); });
  }).catch(function (e) { console.warn('hero3d story', e); box.classList.add('is-fallback'); });
})();
