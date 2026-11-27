// carlos-humanes v2 «la web respira». Todo es mejora progresiva: sin JS la página se lee entera.
(function () {
  'use strict';

  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var raf = window.requestAnimationFrame || function (f) { return setTimeout(f, 16); };
  var tieneIO = 'IntersectionObserver' in window;

  /* 0. Con «menos movimiento», los pictogramas SMIL se quedan quietos */
  if (reduce) {
    Array.prototype.forEach.call(document.querySelectorAll('svg'), function (s) {
      if (s.pauseAnimations) s.pauseAnimations();
    });
  }

  /* 1. Titular letra a letra (las palabras no se parten) */
  var h1 = document.getElementById('titulo');
  if (h1) {
    var texto = h1.textContent.trim();
    h1.setAttribute('aria-label', texto);
    var frag = document.createDocumentFragment();
    var i = 0;
    texto.split(' ').forEach(function (palabra, idx, todas) {
      var p = document.createElement('span');
      p.className = 'palabra';
      p.setAttribute('aria-hidden', 'true');
      palabra.split('').forEach(function (c) {
        var s = document.createElement('span');
        s.className = 'letra';
        s.textContent = c;
        s.style.setProperty('--i', i++);
        p.appendChild(s);
      });
      frag.appendChild(p);
      if (idx < todas.length - 1) frag.appendChild(document.createTextNode(' '));
    });
    h1.textContent = '';
    h1.appendChild(frag);
  }

  /* 2. Aparecer al hacer scroll, escalonado entre hermanos */
  var revelables = document.querySelectorAll('.revela');
  if (!tieneIO || reduce) {
    Array.prototype.forEach.call(revelables, function (e) { e.classList.add('visto'); });
  } else {
    var io = new IntersectionObserver(function (entradas) {
      entradas.forEach(function (en) {
        if (!en.isIntersecting) return;
        en.target.classList.add('visto');
        io.unobserve(en.target);
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    Array.prototype.forEach.call(revelables, function (e) {
      var padre = e.parentElement;
      var hermanos = padre ? Array.prototype.filter.call(padre.children, function (h) { return h.classList.contains('revela'); }) : [];
      var pos = Math.max(0, hermanos.indexOf(e));
      e.style.transitionDelay = (Math.min(pos, 6) * 70) + 'ms';
      io.observe(e);
    });
  }

  /* 3. Contadores */
  var contadores = document.querySelectorAll('[data-contar]');
  function cuenta(el) {
    var fin = parseInt(el.getAttribute('data-contar'), 10), t0 = null, dur = 1400;
    function paso(t) {
      if (t0 === null) t0 = t;
      var p = Math.min(1, (t - t0) / dur);
      var e = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(fin * e);
      if (p < 1) raf(paso);
    }
    raf(paso);
  }
  if (contadores.length) {
    if (reduce || !tieneIO) {
      Array.prototype.forEach.call(contadores, function (el) { el.textContent = el.getAttribute('data-contar'); });
    } else {
      var ioC = new IntersectionObserver(function (ens) {
        ens.forEach(function (en) { if (en.isIntersecting) { cuenta(en.target); ioC.unobserve(en.target); } });
      }, { threshold: 0.5 });
      Array.prototype.forEach.call(contadores, function (el) { ioC.observe(el); });
    }
  }

  /* 4. Barra de progreso de lectura y botón de volver arriba */
  var barra = document.getElementById('progreso-barra');
  var arriba = document.getElementById('arriba');
  if (barra || arriba) {
    var pendiente = false;
    function progreso() {
      pendiente = false;
      var h = document.documentElement;
      var max = h.scrollHeight - h.clientHeight;
      if (barra) barra.style.width = (max > 0 ? (h.scrollTop / max) * 100 : 0) + '%';
      if (arriba) arriba.classList.toggle('visible', h.scrollTop > h.clientHeight * 0.9);
    }
    window.addEventListener('scroll', function () { if (!pendiente) { pendiente = true; raf(progreso); } }, { passive: true });
    progreso();
    if (arriba) arriba.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' });
      var marca = document.querySelector('.marca');
      if (marca) marca.focus({ preventScroll: true });
    });
  }

  /* 4b. Visor de capturas */
  var visor = document.getElementById('visor');
  if (visor && typeof visor.showModal === 'function') {
    var visorImg = document.getElementById('visor-img'), visorPie = document.getElementById('visor-pie');
    Array.prototype.forEach.call(document.querySelectorAll('[data-visor]'), function (enlace) {
      enlace.addEventListener('click', function (ev) {
        ev.preventDefault();
        var img = enlace.querySelector('img'), pie = enlace.querySelector('span');
        visorImg.src = (img && img.currentSrc) || enlace.getAttribute('href');
        visorImg.alt = img ? img.alt : '';
        visorPie.textContent = pie ? pie.textContent : '';
        visor.showModal();
      });
    });
    document.getElementById('visor-cerrar').addEventListener('click', function () { visor.close(); });
    visor.addEventListener('click', function (ev) { if (ev.target === visor) visor.close(); });
    visor.addEventListener('close', function () { visorImg.removeAttribute('src'); });
  }

  /* 5. Barra de navegación: oscura sobre el hero, enlace activo por sección */
  var nav = document.getElementById('nav'), hero = document.getElementById('inicio');
  if (nav && hero && tieneIO) {
    var enlaces = Array.prototype.slice.call(document.querySelectorAll('.nav-lista a'));
    new IntersectionObserver(function (ens) {
      nav.classList.toggle('sobre-hero', ens[0].isIntersecting);
      // En el hero no hay sección activa
      if (ens[0].isIntersecting) enlaces.forEach(function (a) { a.classList.remove('activo'); a.removeAttribute('aria-current'); });
    }, { rootMargin: '-70px 0px 0px 0px', threshold: 0 }).observe(hero);

    var ioS = new IntersectionObserver(function (ens) {
      ens.forEach(function (en) {
        if (!en.isIntersecting) return;
        enlaces.forEach(function (a) {
          var activo = a.getAttribute('href') === '#' + en.target.id;
          a.classList.toggle('activo', activo);
          if (activo) a.setAttribute('aria-current', 'true'); else a.removeAttribute('aria-current');
        });
      });
    }, { rootMargin: '-40% 0px -55% 0px', threshold: 0 });
    enlaces.forEach(function (a) {
      var sec = document.querySelector(a.getAttribute('href'));
      if (sec) ioS.observe(sec);
    });
  }

  /* 6. La nariz: un cursor que sigue al puntero dentro del hero, con un poco de retraso */
  var nariz = document.getElementById('nariz');
  if (nariz && hero && !reduce && window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
    var nx = 0, ny = 0, tx = 0, ty = 0, dentro = false, animando = false;
    function sigue() {
      nx += (tx - nx) * 0.16;
      ny += (ty - ny) * 0.16;
      nariz.style.transform = 'translate(' + nx + 'px,' + ny + 'px) translate(-50%,-50%)';
      if (dentro && (Math.abs(tx - nx) > 0.3 || Math.abs(ty - ny) > 0.3)) raf(sigue); else animando = false;
    }
    hero.addEventListener('pointermove', function (ev) {
      if (ev.pointerType !== 'mouse') return;
      var r = hero.getBoundingClientRect();
      tx = ev.clientX - r.left; ty = ev.clientY - r.top;
      if (!dentro) { dentro = true; nx = tx; ny = ty; hero.classList.add('con-nariz'); }
      if (!animando) { animando = true; raf(sigue); }
    });
    hero.addEventListener('pointerleave', function () { dentro = false; hero.classList.remove('con-nariz'); });
  }

  /* 6b. Matriz: 74 puntos que se encienden uno tras otro */
  var matriz = document.getElementById('matriz-puntos');
  if (matriz) {
    var total = parseInt(matriz.getAttribute('data-n'), 10) || 74;
    var puntos = document.createDocumentFragment();
    for (var k = 0; k < total; k++) {
      var punto = document.createElement('i');
      punto.style.transitionDelay = (reduce ? 0 : 200 + k * 12) + 'ms';
      puntos.appendChild(punto);
    }
    matriz.appendChild(puntos);
  }

  /* 6c. Pictogramas que siguen al puntero; solos, respiran o pasean */
  function pictoInteractivo(idTarjeta, pinta, paseo) {
    var tarjeta = document.getElementById(idTarjeta);
    if (!tarjeta) return;
    var manual = false, ultimo = 0, t = 0, px = 0.5, py = 0.5;
    tarjeta.addEventListener('pointermove', function (ev) {
      var r = tarjeta.getBoundingClientRect();
      px = Math.min(1, Math.max(0, (ev.clientX - r.left) / r.width));
      py = Math.min(1, Math.max(0, (ev.clientY - r.top) / r.height));
      manual = true; ultimo = performance.now();
      tarjeta.classList.add('activo');
      if (reduce) pinta(px, py);
    });
    tarjeta.addEventListener('pointerleave', function () { tarjeta.classList.remove('activo'); });
    if (reduce) { pinta(0.5, 0.5); return; }
    function paso(ts) {
      if (manual && ts - ultimo > 2500) manual = false;
      if (!manual) { t += 1 / 60; var p = paseo(t); px += (p[0] - px) * 0.08; py += (p[1] - py) * 0.08; }
      pinta(px, py);
      raf(paso);
    }
    raf(paso);
  }
  var aireCore = document.getElementById('aire-core'), aireHalo = document.getElementById('aire-halo'), aireNivel = document.getElementById('aire-nivel');
  if (aireCore && aireHalo && aireNivel) {
    pictoInteractivo('canal-aire', function (x, y) {
      var f = 1 - y; // arriba = soplar fuerte
      aireCore.setAttribute('r', 18 + 12 * f);
      aireHalo.setAttribute('r', 40 + 16 * f);
      aireHalo.setAttribute('opacity', 0.12 + 0.3 * f);
      var h = 30 + 62 * f;
      aireNivel.setAttribute('height', h);
      aireNivel.setAttribute('y', 122 - h);
    }, function (t) { return [0.5, 0.5 - 0.5 * Math.sin(t * 2 * Math.PI / 5)]; });
  }
  var narizPunto = document.getElementById('nariz-punto'), narizCursor = document.getElementById('nariz-cursor');
  if (narizPunto && narizCursor) {
    pictoInteractivo('canal-nariz', function (x, y) {
      narizPunto.setAttribute('cx', 54 + 16 * x);
      narizPunto.setAttribute('cy', 68 + 14 * y);
      narizCursor.setAttribute('transform', 'translate(' + (150 + 52 * x) + ' ' + (36 + 30 * y) + ')');
    }, function (t) { return [0.5 + 0.5 * Math.sin(t * 0.7), 0.5 + 0.5 * Math.sin(t * 1.1 + 1)]; });
  }

  /* 7. Traza de presión: respira sola; si tocas, mandas tú */
  var canvas = document.getElementById('traza'), rango = document.getElementById('presion');
  if (canvas && canvas.getContext && rango) {
    var ctx = canvas.getContext('2d');
    var N = 260, datos = new Float32Array(N);
    var TOPE = 5, UMBRAL = 1.5;
    var objetivo = 0, actual = 0, manual = reduce, ultimoToque = 0, t = 0;
    var kpaEl = document.getElementById('kpa'), estadoEl = document.getElementById('estado');
    var lamp = document.getElementById('lamp'), lampEstado = document.getElementById('lamp-estado'), modoEl = document.getElementById('modo');
    var estilos = getComputedStyle(document.documentElement);
    var cSoplo = estilos.getPropertyValue('--hero-soplo').trim() || '#F2B134';
    var cSuccion = estilos.getPropertyValue('--hero-succion').trim() || '#5EA2E8';
    var cLinea = 'rgba(242,247,247,.16)';
    var dpr = 1;

    function ajustaTamano() {
      dpr = Math.min(2, window.devicePixelRatio || 1);
      var ancho = canvas.getBoundingClientRect().width || 720;
      canvas.width = Math.round(ancho * dpr);
      canvas.height = Math.round(ancho * (320 / 720) * dpr);
      dibuja();
    }

    function formatea(k) {
      var s = Math.abs(k).toFixed(1).replace('.', ',');
      return (k > 0.05 ? '+' : (k < -0.05 ? '−' : '')) + s;
    }

    function pintaLecturas(k) {
      kpaEl.textContent = formatea(k);
      var est = k > 0.05 ? 'soplando' : (k < -0.05 ? 'aspirando' : 'en reposo');
      estadoEl.textContent = est;
      var on = k >= UMBRAL;
      lamp.classList.toggle('on', on);
      lampEstado.textContent = on ? 'encendido' : 'apagado';
      rango.setAttribute('aria-valuetext', formatea(k) + ' kPa, ' + est);
    }

    function yDe(k) {
      var mid = canvas.height / 2, margen = canvas.height * 0.08;
      return mid - (Math.max(-TOPE, Math.min(TOPE, k)) / TOPE) * (mid - margen);
    }

    function dibuja() {
      var w = canvas.width, h = canvas.height;
      ctx.clearRect(0, 0, w, h);

      // Rejilla: +5, 0, −5 y el umbral del pulsador
      ctx.lineWidth = 1 * dpr;
      ctx.strokeStyle = cLinea;
      [TOPE, 0, -TOPE].forEach(function (k) {
        var y = yDe(k);
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke();
      });
      ctx.setLineDash([4 * dpr, 4 * dpr]);
      ctx.strokeStyle = 'rgba(242,177,52,.45)';
      ctx.beginPath(); ctx.moveTo(0, yDe(UMBRAL)); ctx.lineTo(w, yDe(UMBRAL)); ctx.stroke();
      ctx.setLineDash([]);

      ctx.font = (11 * dpr) + 'px ' + (estilos.getPropertyValue('--font') || 'sans-serif');
      ctx.fillStyle = 'rgba(157,183,188,.9)';
      ctx.fillText('+5 kPa  soplar', 8 * dpr, yDe(TOPE) + 13 * dpr);
      ctx.fillText('0', 8 * dpr, yDe(0) - 5 * dpr);
      ctx.fillText('−5 kPa  aspirar', 8 * dpr, yDe(-TOPE) - 5 * dpr);
      ctx.fillStyle = 'rgba(242,177,52,.8)';
      ctx.fillText('umbral del pulsador', w - 130 * dpr, yDe(UMBRAL) - 5 * dpr);

      // Traza coloreada por signo
      ctx.lineWidth = 2.4 * dpr; ctx.lineJoin = 'round'; ctx.lineCap = 'round';
      var paso = w / (N - 1);
      for (var j = 1; j < N; j++) {
        ctx.strokeStyle = datos[j] >= 0 ? cSoplo : cSuccion;
        ctx.beginPath();
        ctx.moveTo((j - 1) * paso, yDe(datos[j - 1]));
        ctx.lineTo(j * paso, yDe(datos[j]));
        ctx.stroke();
      }

      // Punta con brillo
      var ultimo = datos[N - 1];
      ctx.shadowBlur = 14 * dpr; ctx.shadowColor = ultimo >= 0 ? cSoplo : cSuccion;
      ctx.fillStyle = ultimo >= 0 ? cSoplo : cSuccion;
      ctx.beginPath(); ctx.arc(w - 2 * dpr, yDe(ultimo), 4 * dpr, 0, Math.PI * 2); ctx.fill();
      ctx.shadowBlur = 0;
    }

    function empuja(valor) {
      datos.copyWithin(0, 1);
      datos[N - 1] = valor;
    }

    function tomaElMando() {
      manual = true;
      ultimoToque = performance.now();
      modoEl.textContent = 'tú mandas';
    }

    function desdePuntero(ev) {
      var caja = canvas.getBoundingClientRect();
      if (!caja.height) return;
      var f = Math.min(1, Math.max(0, (ev.clientY - caja.top) / caja.height));
      var k = (0.5 - f) * 2 * TOPE;
      rango.value = Math.round(k * 10);
      objetivo = k;
      tomaElMando();
      if (reduce) { actual = objetivo; empuja(actual); dibuja(); pintaLecturas(actual); }
    }
    canvas.addEventListener('pointermove', function (ev) { if (ev.pointerType === 'mouse' || ev.buttons > 0) desdePuntero(ev); });
    canvas.addEventListener('pointerdown', function (ev) { desdePuntero(ev); if (canvas.setPointerCapture) canvas.setPointerCapture(ev.pointerId); });
    rango.addEventListener('input', function () {
      objetivo = Number(rango.value) / 10;
      tomaElMando();
      if (reduce) { actual = objetivo; empuja(actual); dibuja(); pintaLecturas(actual); }
    });

    function bucle(ts) {
      if (manual && !reduce && ts - ultimoToque > 6000) {
        manual = false;
        modoEl.textContent = 'respiración tranquila, simulada';
      }
      if (!manual) {
        t += 1 / 60;
        objetivo = 1.6 * Math.sin(t * 2 * Math.PI / 5) + 0.12 * Math.sin(t * 7.3);
        rango.value = Math.round(objetivo * 10);
      }
      actual += (objetivo - actual) * 0.14;
      empuja(actual);
      dibuja();
      pintaLecturas(actual);
      raf(bucle);
    }

    window.addEventListener('resize', ajustaTamano);
    ajustaTamano();
    pintaLecturas(0);
    if (reduce) { modoEl.textContent = 'tú mandas'; } else { raf(bucle); }
  }
})();
