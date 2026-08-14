/* ============================================================================
   DETALZ — DESIGN SYSTEM / 05 · MOTION ENGINE
   ----------------------------------------------------------------------------
   GSAP + ScrollTrigger + Lenis.

   Contrato: o HTML declara a intenção por atributo, o JS resolve.

     data-reveal          sobe e aparece
     data-split="lines"   quebra em linhas mascaradas e desliza
     data-stagger         filhos entram em cascata
     data-clip            revela por clip-path
     data-line            régua que se desenha
     data-parallax        parallax dentro do próprio quadro
     data-parallax-img    imagem que se desloca dentro do recorte
     data-count           contador numérico
     data-num             contador com zero à esquerda
     data-type            máquina de escrever (não empurra o layout)
     data-words           palavras em cascata
     data-scrub-words     texto que acende palavra a palavra na rolagem
     data-marquee         faixa infinita (data-speed, data-velocity)
     data-stack-card      cartão que encolhe sob o próximo
     data-magnetic        atração ao cursor
     data-cursor="Texto"  rótulo no cursor

   Se o GSAP não carregar ou o usuário pedir menos movimento, tudo isso vira
   uma página estática e completa — nunca uma página vazia.
   ========================================================================== */

(function () {
  'use strict';

  var hasGSAP = typeof window.gsap !== 'undefined' && typeof window.ScrollTrigger !== 'undefined';
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if ('scrollRestoration' in history) history.scrollRestoration = 'manual';

  /* ======================================================================
     COMPORTAMENTO SEM MOVIMENTO (também é o caminho de fallback)
     ====================================================================== */

  function initMenu() {
    var toggle = document.getElementById('menuToggle');
    var menu = document.getElementById('mobileMenu');
    if (!toggle || !menu) return;

    toggle.addEventListener('click', function () {
      var open = menu.classList.toggle('is-open');
      toggle.setAttribute('aria-expanded', String(open));
      if (open && window.gsap) {
        gsap.fromTo(menu, { y: -12, opacity: 0 }, { y: 0, opacity: 1, duration: 0.45, ease: 'power3.out' });
        gsap.fromTo(menu.querySelectorAll('a'), { y: 10, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.45, ease: 'power3.out', stagger: 0.05, delay: 0.04 });
      }
    });

    menu.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', function () {
        menu.classList.remove('is-open');
        toggle.setAttribute('aria-expanded', 'false');
      });
    });
  }

  function initFAQ() {
    document.querySelectorAll('.faq-item').forEach(function (item) {
      var head = item.querySelector('.faq-head');
      var body = item.querySelector('.faq-body');
      if (!head || !body) return;

      if (item.classList.contains('is-open')) body.style.height = 'auto';

      head.addEventListener('click', function () {
        var open = item.classList.contains('is-open');

        item.parentElement.querySelectorAll('.faq-item.is-open').forEach(function (other) {
          if (other === item) return;
          other.classList.remove('is-open');
          other.querySelector('.faq-head').setAttribute('aria-expanded', 'false');
          var ob = other.querySelector('.faq-body');
          if (window.gsap) gsap.to(ob, { height: 0, duration: 0.45, ease: 'power3.inOut' });
          else ob.style.height = '0px';
        });

        item.classList.toggle('is-open', !open);
        head.setAttribute('aria-expanded', String(!open));

        if (window.gsap) {
          gsap.to(body, {
            height: open ? 0 : body.firstElementChild.offsetHeight,
            duration: 0.5,
            ease: 'power3.inOut',
            onComplete: function () {
              if (!open) body.style.height = 'auto';
              if (window.ScrollTrigger) window.ScrollTrigger.refresh();
            },
          });
        } else {
          body.style.height = open ? '0px' : 'auto';
        }
      });
    });
  }

  function initForm() {
    var form = document.getElementById('leadForm');
    if (!form) return;
    var msg = document.getElementById('leadMsg');

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var input = form.querySelector('input');
      if (!input.value || !input.checkValidity()) {
        if (window.gsap) gsap.fromTo(form, { x: -7 }, { x: 0, duration: 0.5, ease: 'elastic.out(1,0.35)' });
        return;
      }
      input.value = '';
      input.placeholder = 'Recebido — falamos com você em breve';
      if (msg) {
        if (window.gsap) gsap.to(msg, { opacity: 1, duration: 0.4 });
        else msg.style.opacity = '1';
      }
    });
  }

  if (window.lucide) lucide.createIcons();

  if (!hasGSAP || reduced) {
    document.documentElement.classList.remove('js');
    ['dz-preloader', 'pl-panel'].forEach(function (id) {
      var el = document.getElementById(id);
      if (el) el.remove();
    });
    document.documentElement.classList.remove('is-loading');
    initMenu();
    initFAQ();
    initForm();
    return;
  }

  gsap.registerPlugin(ScrollTrigger);
  gsap.config({ nullTargetWarn: false });
  // O refresh automático no `load` dispara quando as imagens da página
  // terminam — em geral já com o herói visível — e o fromTo volta ao
  // estado inicial por um frame. Medimos de novo nós, ainda cobertos.
  ScrollTrigger.config({ autoRefreshEvents: 'visibilitychange,resize' });
  // O pin grava width em px. Se a primeira medida foi sem a barra vertical,
  // esse número fica 15px maior que a área útil e a página rola para o lado.
  // Limpamos antes de cada recálculo para o GSAP medir o clientWidth atual.
  ScrollTrigger.addEventListener('refreshInit', function () {
    document.querySelectorAll('.pin-spacer, #hScroll, #flowPin').forEach(function (el) {
      el.style.removeProperty('width');
      el.style.removeProperty('max-width');
    });
  });

  var EASE = 'expo.out';
  var isTouch = window.matchMedia('(hover: none), (pointer: coarse)').matches;

  /* ======================================================================
     1 · ROLAGEM SUAVE
     ====================================================================== */

  var lenis = new Lenis({
    duration: 1.15,
    easing: function (t) { return Math.min(1, 1.001 - Math.pow(2, -10 * t)); },
    smoothWheel: true,
    touchMultiplier: 1.6,
  });

  lenis.on('scroll', ScrollTrigger.update);
  function fitScrollPins() {
    var w = document.documentElement.clientWidth + 'px';
    document.querySelectorAll('#hScroll, #flowPin, .pin-spacer').forEach(function (el) {
      el.style.setProperty('width', w, 'important');
      el.style.setProperty('max-width', w, 'important');
    });
  }
  // Pins alteram a altura do documento depois que o Lenis já cacheou o limite;
  // sem isso, âncoras profundas param antes do alvo.
  ScrollTrigger.addEventListener('refresh', function () {
    fitScrollPins();
    lenis.resize();
  });
  gsap.ticker.add(function (time) { lenis.raf(time * 1000); });
  gsap.ticker.lagSmoothing(0);
  lenis.stop();

  document.querySelectorAll('a[href^="#"]').forEach(function (a) {
    a.addEventListener('click', function (e) {
      var id = a.getAttribute('href');
      if (!id || id === '#') return;
      var target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      lenis.scrollTo(target, { offset: -60, duration: 1.4 });
    });
  });

  /* ======================================================================
     2 · DIVISÃO DE TEXTO
     ====================================================================== */

  function splitWords(el) {
    var walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT, null);
    var nodes = [];
    while (walker.nextNode()) nodes.push(walker.currentNode);

    nodes.forEach(function (node) {
      if (!node.nodeValue.trim()) return;
      var frag = document.createDocumentFragment();
      node.nodeValue.split(/(\s+)/).forEach(function (chunk) {
        if (!chunk) return;
        if (/^\s+$/.test(chunk)) { frag.appendChild(document.createTextNode(chunk)); return; }
        var s = document.createElement('span');
        s.className = 'word';
        s.textContent = chunk;
        frag.appendChild(s);
      });
      node.parentNode.replaceChild(frag, node);
    });

    return Array.prototype.slice.call(el.querySelectorAll('.word'));
  }

  // Agrupa palavras em linhas medindo o offsetTop real. Re-executável: o texto
  // original fica guardado para reprocessar quando a largura muda.
  function splitLines(el, force) {
    if (el.dataset.splitDone && !force) {
      return Array.prototype.slice.call(el.querySelectorAll('.line-inner'));
    }
    if (!el.dataset.origText) el.dataset.origText = el.textContent.replace(/\s+/g, ' ').trim();
    if (force) {
      el.innerHTML = el.dataset.origText;
      delete el.dataset.splitDone;
    }

    var words = splitWords(el);
    if (!words.length) return [];

    var lines = [];
    var current = null;
    var lastTop = null;

    words.forEach(function (w) {
      var top = Math.round(w.offsetTop);
      if (lastTop === null || Math.abs(top - lastTop) > 4) {
        current = [];
        lines.push(current);
        lastTop = top;
      }
      current.push(w);
    });

    el.innerHTML = '';
    var inners = [];
    lines.forEach(function (group) {
      var mask = document.createElement('span');
      mask.className = 'line-mask';
      var inner = document.createElement('span');
      inner.className = 'line-inner';
      inner.textContent = group.map(function (w) { return w.textContent; }).join(' ');
      mask.appendChild(inner);
      el.appendChild(mask);
      inners.push(inner);
    });

    el.dataset.splitDone = '1';
    // Não forçar opacity aqui: o herói precisa continuar escondido até o
    // gsap.set das linhas; os demais splits o fromTo do ScrollTrigger cobre.
    return inners;
  }

  /* ======================================================================
     3 · PRELOADER
     Quatro batidas de abertura da apresentação — não de um projeto em curso.
     ====================================================================== */

  function preload() {
    var pre = document.getElementById('dz-preloader');
    var panel = document.getElementById('pl-panel');

    function clearChrome() {
      document.documentElement.classList.remove('is-loading');
      if (pre && pre.parentNode) pre.remove();
      if (panel && panel.parentNode) panel.remove();
    }

    prepareHero();

    if (!pre) { revealHero(); return; }

    // O timeline roda no ticker do GSAP, que é rAF: numa aba em segundo plano
    // ele congela e o preloader ficaria eternamente na tela com o scroll
    // travado. Sai direto se a aba não estiver visível, e mantém um watchdog
    // para o caso de a aba ser escondida no meio da animação.
    if (document.visibilityState === 'hidden') {
      clearChrome();
      revealHero();
      return;
    }

    setTimeout(function () {
      if (!document.getElementById('dz-preloader')) return;
      clearChrome();
      revealHero();
    }, 6000);

    var num = document.getElementById('plNum');
    var fill = document.getElementById('plFill');
    var word = document.getElementById('plWord');
    var packet = document.getElementById('plPacket');
    var nodes = pre.querySelectorAll('[data-pl-node]');
    var phases = ['Abrindo a plataforma', 'Montando o fluxo', 'Conectando as etapas', 'Pronto para ver'];
    var counter = { v: 0 };
    var lit = -1;

    if (nodes[0]) nodes[0].classList.add('is-on');

    gsap.timeline()
      .to(counter, {
        v: 100,
        duration: 2.2,
        ease: 'power2.inOut',
        onUpdate: function () {
          var p = Math.round(counter.v);
          if (num) num.textContent = (p < 10 ? '0' : '') + p;
          if (fill) gsap.set(fill, { scaleX: p / 100 });
          if (packet) packet.style.left = p + '%';
          var idx = Math.min(phases.length - 1, Math.floor(p / 26));
          if (word && word.textContent !== phases[idx]) word.textContent = phases[idx];
          if (idx !== lit) {
            lit = idx;
            if (nodes[idx]) nodes[idx].classList.add('is-on');
          }
        },
      })
      .add(function () { ScrollTrigger.refresh(); })
      .to('#dz-preloader [data-pl-el]', { opacity: 0, y: -8, duration: 0.35, ease: 'power2.in' }, '+=0.18')
      .to(pre, { yPercent: -100, duration: 0.9, ease: 'expo.inOut' }, '-=0.1')
      .add(function () {
        document.documentElement.classList.remove('is-loading');
        revealHero();
      }, '<')
      .to(panel, { scaleY: 0, transformOrigin: 'top center', duration: 1.0, ease: 'expo.inOut' }, '<+=0.15')
      .add(function () {
        if (pre && pre.parentNode) pre.remove();
        if (panel && panel.parentNode) panel.remove();
      });
  }

  /* ======================================================================
     4 · ENTRADA DO HERÓI
     ====================================================================== */

  var heroRevealed = false;
  var heroPrepared = false;
  var heroLines = [];

  // Estados iniciais aplicados ainda sob o preloader. Sem isso o fromTo do
  // herói esconde o conteúdo no primeiro frame depois da cortina — a piscada.
  function prepareHero() {
    if (heroPrepared) return heroLines;
    heroPrepared = true;
    var h1 = document.querySelector('[data-hero-title]');
    heroLines = h1 ? splitLines(h1) : [];
    gsap.set('[data-hero-field]', { scale: 1.25, opacity: 0 });
    gsap.set('[data-hero-rule]', { scaleX: 0 });
    gsap.set(heroLines, { y: 0, yPercent: 118 });
    if (h1) gsap.set(h1, { opacity: 1 });
    gsap.set('[data-hero-el]', { y: 26, opacity: 0 });
    gsap.set('.site-header', { y: -28, opacity: 0 });
    return heroLines;
  }

  function revealHero() {
    if (heroRevealed) return;
    heroRevealed = true;
    prepareHero();
    lenis.start();

    var lines = document.querySelectorAll('[data-hero-title] .line-inner');
    if (!lines.length) lines = heroLines;

    // `lenis.stop()` aplica overflow:hidden no html e some com a barra.
    // Só depois de `start()` a área útil é a real — e os pins cabem nela.
    gsap.delayedCall(0.08, function () {
      ScrollTrigger.refresh();
      fitScrollPins();
    });

    gsap.timeline({ onComplete: heroScroll })
      .to('[data-hero-field]', { scale: 1, opacity: 1, duration: 1.9, ease: 'expo.out', overwrite: true }, 0)
      .to('[data-hero-rule]', { scaleX: 1, duration: 1.0, ease: EASE, overwrite: true }, 0.2)
      .fromTo(lines, { y: 0, yPercent: 118 }, {
        y: 0, yPercent: 0, duration: 1.35, ease: EASE, stagger: 0.09, overwrite: true,
      }, 0.28)
      .to('[data-hero-el]', { y: 0, opacity: 1, duration: 1.0, ease: EASE, stagger: 0.08, overwrite: true }, 0.55)
      .to('.site-header', { y: 0, opacity: 1, duration: 1.0, ease: EASE, overwrite: true }, 0.4);

    gsap.to('[data-scroll-arrow]', { y: 5, duration: 0.9, ease: 'sine.inOut', repeat: -1, yoyo: true });
  }

  function heroScroll() {
    var hero = document.querySelector('.hero');
    if (!hero) return;

    gsap.timeline({
      scrollTrigger: { trigger: hero, start: 'top top', end: 'bottom top', scrub: true },
    })
      .to('[data-hero-field]', { yPercent: 14, scale: 1.14, ease: 'none' }, 0)
      .to('[data-hero-copy]', { yPercent: -20, opacity: 0, ease: 'none' }, 0)
      .to('.hero__veil', { opacity: 0.7, ease: 'none' }, 0);
  }

  /* ======================================================================
     5 · CABEÇALHO
     O tema do header não é decidido no scroll: ele copia o data-surface da
     seção que está passando por baixo, e os tokens fazem o resto.
     ====================================================================== */

  function header() {
    var el = document.querySelector('.site-header');
    if (!el) return;

    var bar = el.querySelector('.site-header__bar');
    var surfaces = Array.prototype.slice.call(document.querySelectorAll('[data-surface]'))
      .filter(function (s) { return !el.contains(s); });
    var last = 0;
    var currentSurface = null;

    ScrollTrigger.create({
      trigger: document.body,
      start: 'top top',
      end: 'bottom bottom',
      onUpdate: function () {
        var probe = 40;
        var found = 'dark';
        surfaces.forEach(function (sec) {
          var r = sec.getBoundingClientRect();
          if (r.top <= probe && r.bottom >= probe) found = sec.dataset.surface || 'dark';
        });
        if (found === currentSurface) return;
        currentSurface = found;
        el.setAttribute('data-surface', found);
      },
    });

    ScrollTrigger.create({
      start: 'top -80',
      onUpdate: function (self) {
        var y = self.scroll();
        var down = y > last && y > 320;
        last = y;
        gsap.to(el, { y: down ? -160 : 0, duration: 0.6, ease: 'power3.out', overwrite: true });
      },
      onToggle: function (self) {
        el.classList.toggle('is-condensed', self.isActive);
        gsap.to(bar, {
          maxWidth: self.isActive ? 1060 : 1280,
          paddingTop: self.isActive ? 10 : 16,
          paddingBottom: self.isActive ? 10 : 16,
          duration: 0.55,
          ease: 'power3.out',
        });
      },
    });
  }

  /* ======================================================================
     6 · CURSOR E MAGNETISMO
     ====================================================================== */

  function cursor() {
    if (isTouch) return;
    var ring = document.getElementById('dz-cursor');
    var dot = document.getElementById('dz-cursor-dot');
    if (!ring || !dot) return;

    var label = ring.querySelector('.cursor-label');
    var rx = gsap.quickTo(ring, 'x', { duration: 0.55, ease: 'power3' });
    var ry = gsap.quickTo(ring, 'y', { duration: 0.55, ease: 'power3' });
    var dx = gsap.quickTo(dot, 'x', { duration: 0.12, ease: 'power3' });
    var dy = gsap.quickTo(dot, 'y', { duration: 0.12, ease: 'power3' });

    // Só aparece depois do primeiro movimento — senão pisca no canto 0,0.
    var awake = false;
    window.addEventListener('mousemove', function (e) {
      if (!awake) {
        awake = true;
        gsap.set([ring, dot], { x: e.clientX, y: e.clientY });
        gsap.to([ring, dot], { opacity: 1, duration: 0.4 });
      }
      rx(e.clientX); ry(e.clientY); dx(e.clientX); dy(e.clientY);
    });

    document.querySelectorAll('a, button, [data-cursor]').forEach(function (el) {
      var text = el.getAttribute('data-cursor');
      el.addEventListener('mouseenter', function () {
        gsap.to(ring, { scale: text ? 1.9 : 1.5, duration: 0.4, ease: 'power3.out' });
        gsap.to(dot, { scale: 0, duration: 0.3 });
        if (text && label) {
          label.textContent = text;
          gsap.to(label, { opacity: 1, duration: 0.3 });
        }
      });
      el.addEventListener('mouseleave', function () {
        gsap.to(ring, { scale: 1, duration: 0.4, ease: 'power3.out' });
        gsap.to(dot, { scale: 1, duration: 0.3 });
        if (label) gsap.to(label, { opacity: 0, duration: 0.2 });
      });
    });

    document.querySelectorAll('[data-magnetic]').forEach(function (el) {
      var qx = gsap.quickTo(el, 'x', { duration: 0.5, ease: 'power3' });
      var qy = gsap.quickTo(el, 'y', { duration: 0.5, ease: 'power3' });
      el.addEventListener('mousemove', function (e) {
        var r = el.getBoundingClientRect();
        qx((e.clientX - (r.left + r.width / 2)) * 0.32);
        qy((e.clientY - (r.top + r.height / 2)) * 0.42);
      });
      el.addEventListener('mouseleave', function () { qx(0); qy(0); });
    });
  }

  /* ======================================================================
     7 · REVELAÇÕES GENÉRICAS
     ====================================================================== */

  // Um elemento dentro de um ancestral sticky se move fora do fluxo, então o
  // start calculado pode cair depois do fim da página e nunca disparar.
  // Nesses casos, dispara pela seção que o contém.
  function triggerFor(el) {
    var node = el;
    while (node && node !== document.body) {
      if (getComputedStyle(node).position === 'sticky') return el.closest('section') || el;
      node = node.parentElement;
    }
    return el;
  }

  function reveals() {
    document.querySelectorAll('[data-split="lines"]').forEach(function (el) {
      var lines = splitLines(el);
      gsap.set(el, { opacity: 1 });
      gsap.fromTo(lines, { yPercent: 112 }, {
        yPercent: 0, duration: 1.25, ease: EASE, stagger: 0.08,
        scrollTrigger: { trigger: triggerFor(el), start: 'top 88%' },
      });
    });

    document.querySelectorAll('[data-reveal]').forEach(function (el) {
      var delay = parseFloat(el.getAttribute('data-reveal')) || 0;
      gsap.fromTo(el, { y: 24, opacity: 0 }, {
        y: 0, opacity: 1, duration: 1.0, ease: EASE, delay: delay,
        scrollTrigger: { trigger: triggerFor(el), start: 'top 90%' },
      });
    });

    document.querySelectorAll('[data-stagger]').forEach(function (el) {
      gsap.fromTo(el.children, { y: 30, opacity: 0 }, {
        y: 0, opacity: 1, duration: 0.95, ease: EASE, stagger: 0.07,
        scrollTrigger: { trigger: el, start: 'top 88%' },
      });
    });

    document.querySelectorAll('[data-clip]').forEach(function (el) {
      gsap.fromTo(el, { clipPath: 'inset(0 0 100% 0)' }, {
        clipPath: 'inset(0 0 0% 0)', duration: 1.5, ease: 'expo.out',
        scrollTrigger: { trigger: el, start: 'top 86%' },
      });
    });

    document.querySelectorAll('[data-line]').forEach(function (el) {
      gsap.fromTo(el, { scaleX: 0 }, {
        scaleX: 1, duration: 1.6, ease: 'expo.out',
        scrollTrigger: { trigger: triggerFor(el), start: 'top 92%' },
      });
    });

    document.querySelectorAll('[data-parallax]').forEach(function (el) {
      var amount = parseFloat(el.getAttribute('data-parallax')) || 6;
      gsap.fromTo(el, { yPercent: -amount }, {
        yPercent: amount, ease: 'none',
        scrollTrigger: { trigger: el.parentElement, start: 'top bottom', end: 'bottom top', scrub: true },
      });
    });

    document.querySelectorAll('[data-parallax-img]').forEach(function (img) {
      gsap.fromTo(img, { yPercent: -6 }, {
        yPercent: 6, ease: 'none',
        scrollTrigger: { trigger: img.parentElement, start: 'top bottom', end: 'bottom top', scrub: true },
      });
    });

    document.querySelectorAll('[data-story]').forEach(function (card, i) {
      var fromLeft = i % 2 === 0;
      gsap.fromTo(card, { x: fromLeft ? -100 : 100, opacity: 0 }, {
        x: 0, opacity: 1, duration: 1.4, ease: 'expo.out',
        scrollTrigger: { trigger: card, start: 'top 82%' },
      });
    });
  }

  /* ======================================================================
     8 · TEXTO VIVO — digitação, palavras, contadores
     ====================================================================== */

  /* As primitivas de texto se dividem em dois grupos, e a diferença importa
     para o replay: as de tween próprio (`data-words`, `data-scrub-words`) ficam
     penduradas num ScrollTrigger que guarda a animação e pode ser reiniciada;
     as de disparo único (`data-type`, `data-count`, `data-num`) só existem
     dentro de um `onEnter`, então precisam ser mortas e recriadas. */

  function onceFX(root) {
    var scope = root || document;

    scope.querySelectorAll('[data-type]').forEach(function (el) {
      // Na segunda passada (replay) o conteúdo já é a marcação da máquina de
      // escrever; o texto de verdade está no aria-label posto na primeira.
      var full = (el.getAttribute('aria-label') || el.textContent).replace(/\s+/g, ' ').trim();
      if (!full) return;

      el.setAttribute('aria-label', full);
      el.innerHTML =
        '<span class="type-ghost" aria-hidden="true">' + full + '</span>' +
        '<span class="type-live" aria-hidden="true">' +
          '<span class="type-line"></span><span class="caret"></span>' +
        '</span>';

      var live = el.lastElementChild;
      var out = live.firstElementChild;
      var caret = live.lastElementChild;
      var o = { i: 0 };
      var delay = parseFloat(el.getAttribute('data-type')) || 0;

      ScrollTrigger.create({
        trigger: el, start: 'top 88%', once: true,
        onEnter: function () {
          gsap.delayedCall(delay, function () {
            caret.classList.add('is-live');
            gsap.to(o, {
              i: full.length,
              duration: Math.max(0.6, Math.min(1.9, full.length * 0.028)),
              ease: 'none',
              onUpdate: function () { out.textContent = full.slice(0, Math.round(o.i)); },
              onComplete: function () {
                out.textContent = full;
                // o blink é CSS e vence opacity inline — remover a classe primeiro
                gsap.delayedCall(0.7, function () {
                  caret.classList.remove('is-live');
                  gsap.fromTo(caret, { opacity: 0.9 }, { opacity: 0, duration: 0.45 });
                });
              },
            });
          });
        },
      });
    });

    scope.querySelectorAll('[data-count]').forEach(function (el) {
      var end = parseFloat(el.getAttribute('data-count'));
      var suffix = el.getAttribute('data-suffix') || '';
      var decimals = parseInt(el.getAttribute('data-decimals') || '0', 10);
      var o = { v: 0 };
      ScrollTrigger.create({
        trigger: el, start: 'top 92%', once: true,
        onEnter: function () {
          gsap.to(o, {
            v: end, duration: 1.7, ease: 'power3.out',
            onUpdate: function () {
              el.textContent = o.v.toFixed(decimals).replace('.', ',') + suffix;
            },
          });
        },
      });
    });

    scope.querySelectorAll('[data-num]').forEach(function (el) {
      // O replay lê o valor já contado; o alvo original fica guardado na
      // primeira passada para o número não virar o zero da animação anterior.
      if (!el.dataset.numTarget) el.dataset.numTarget = el.textContent.trim();
      var end = parseInt(el.dataset.numTarget, 10);
      if (isNaN(end)) return;
      var o = { v: 0 };
      ScrollTrigger.create({
        trigger: el, start: 'top 92%', once: true,
        onEnter: function () {
          gsap.to(o, {
            v: end, duration: 1.1, ease: 'power2.out',
            onUpdate: function () {
              var n = Math.round(o.v);
              el.textContent = (n < 10 ? '0' : '') + n;
            },
          });
        },
      });
    });
  }

  function wordsFX(root) {
    var scope = root || document;

    scope.querySelectorAll('[data-words]').forEach(function (el) {
      var words = splitWords(el);
      if (!words.length) return;
      gsap.fromTo(words, { yPercent: 55, opacity: 0 }, {
        yPercent: 0, opacity: 1, duration: 0.9, ease: 'power3.out', stagger: 0.014,
        scrollTrigger: { trigger: el, start: 'top 90%' },
      });
    });

    // Manifesto: cada palavra acende conforme a página rola.
    scope.querySelectorAll('[data-scrub-words]').forEach(function (el) {
      var words = splitWords(el);
      if (!words.length) return;
      gsap.set(words, { opacity: 0.14 });
      gsap.to(words, {
        opacity: 1, ease: 'none', stagger: 1,
        scrollTrigger: { trigger: el, start: 'top 78%', end: 'bottom 55%', scrub: 0.6 },
      });
    });
  }

  function textFX() {
    onceFX();
    wordsFX();
  }

  /* ======================================================================
     9 · CARTÕES EMPILHÁVEIS
     ====================================================================== */

  function stack() {
    var cards = document.querySelectorAll('[data-stack-card]');
    cards.forEach(function (card, i) {
      if (i === cards.length - 1) return;
      var next = cards[i + 1];
      var inner = card.firstElementChild;

      gsap.to(inner, {
        scale: 0.94,
        yPercent: -2,
        '--stack-veil': 0.42,
        ease: 'none',
        scrollTrigger: {
          trigger: next,
          start: function () {
            // O véu só começa quando o próximo cartão encosta no atual —
            // enquanto o cartão da frente ainda é o da leitura, ele fica intacto.
            var top = parseFloat(getComputedStyle(card).top) || 0;
            var px = Math.min(top + card.offsetHeight - 24, window.innerHeight * 0.88);
            return 'top ' + Math.round(Math.max(px, window.innerHeight * 0.42)) + 'px';
          },
          end: function () {
            return 'top ' + (getComputedStyle(next).top || '18vh');
          },
          scrub: true,
          invalidateOnRefresh: true,
        },
      });
    });
  }

  /* ======================================================================
     10 · MARQUEES sensíveis à velocidade de rolagem
     ====================================================================== */

  function marquees() {
    var scrollVel = 0;
    lenis.on('scroll', function (e) { scrollVel = e.velocity || 0; });

    document.querySelectorAll('[data-marquee]').forEach(function (track) {
      var base = parseFloat(track.getAttribute('data-speed')) || 0.4;
      var reactive = track.hasAttribute('data-velocity');
      var half = 0;
      var x = 0;

      function measure() { half = track.scrollWidth / 2; }
      measure();
      window.addEventListener('resize', measure);

      if (base > 0) x = -half;

      gsap.ticker.add(function (time, deltaTime) {
        if (!half) return;
        // normalizado a 60fps para não correr em dobro num monitor de 120Hz
        var f = Math.min(deltaTime, 50) / 16.667;
        var boost = reactive ? Math.min(Math.abs(scrollVel) * 0.26, 20) * (base < 0 ? -1 : 1) : 0;
        x += (base + boost) * f;
        if (x <= -half) x += half;
        if (x >= 0 && base > 0) x -= half;
        track.style.transform = 'translate3d(' + x + 'px,0,0)';
      });
    });
  }

  /* ======================================================================
     11 · GALERIA HORIZONTAL FIXADA
     ====================================================================== */

  function horizontal() {
    var section = document.getElementById('hScroll');
    var track = document.getElementById('hTrack');
    if (!section || !track) return;

    var bar = section.querySelector('.hscroll__bar span');

    function distance() {
      return Math.max(0, track.scrollWidth - document.documentElement.clientWidth);
    }

    gsap.to(track, {
      x: function () { return -distance(); },
      ease: 'none',
      scrollTrigger: {
        trigger: section,
        start: 'top top',
        end: function () { return '+=' + distance(); },
        pin: true,
        scrub: 0.8,
        anticipatePin: 1,
        invalidateOnRefresh: true,
        // Triggers com pin são criados depois dos reveals que vêm abaixo na
        // página. Sem prioridade maior eles medem por último e todo start
        // seguinte sai curto pela distância deste pin.
        refreshPriority: 2,
        onUpdate: function (self) {
          if (bar) bar.style.width = (self.progress * 100).toFixed(1) + '%';
        },
      },
    });
  }

  /* ======================================================================
     12 · SET-PIECE DO FLUXO — "o detalhe não se perde no caminho"
     ----------------------------------------------------------------------
     Um pacote de informação percorre Projeto → Orçamento → Engenharia →
     Produção. A cada nó ele acumula atributos (medida, material, espessura,
     ferragem, usinagem, custo) e nenhum cai fora. É a tese da marca
     transformada em movimento — e a única peça que não veio da referência.
     ====================================================================== */

  function flow() {
    var pin = document.getElementById('flowPin');
    var path = document.getElementById('flowPath');
    if (!pin || !path) return;

    var packet = document.getElementById('flowPacket');
    var wire = document.getElementById('flowWire');
    var nodes = Array.prototype.slice.call(pin.querySelectorAll('[data-flow-node]'));
    var attrs = Array.prototype.slice.call(pin.querySelectorAll('[data-flow-attr]'));
    var counterEl = document.getElementById('flowCount');
    var stageEl = document.getElementById('flowStage');
    var lossEl = document.getElementById('flowLoss');

    var len = path.getTotalLength();
    wire.style.strokeDasharray = len;
    wire.style.strokeDashoffset = len;

    gsap.set(nodes, { opacity: 0.28 });
    gsap.set(attrs, { opacity: 0, y: 6 });

    var lit = new Set();

    function update(p) {
      wire.style.strokeDashoffset = len * (1 - p);

      var pt = path.getPointAtLength(len * p);
      packet.setAttribute('transform', 'translate(' + pt.x.toFixed(2) + ' ' + pt.y.toFixed(2) + ')');

      nodes.forEach(function (node, i) {
        var at = parseFloat(node.getAttribute('data-flow-node'));
        var on = p >= at - 0.02;
        var key = 'n' + i;
        if (on && !lit.has(key)) {
          lit.add(key);
          gsap.to(node, { opacity: 1, duration: 0.45, ease: 'power3.out' });
          gsap.fromTo(node.querySelector('[data-flow-ring]'),
            { scale: 0.4, opacity: 0.9 },
            { scale: 1.9, opacity: 0, duration: 1.1, ease: 'power2.out', transformOrigin: '50% 50%' });
          if (stageEl) stageEl.textContent = node.getAttribute('data-flow-label');
        } else if (!on && lit.has(key)) {
          lit.delete(key);
          gsap.to(node, { opacity: 0.28, duration: 0.3 });
        }
      });

      var kept = 0;
      attrs.forEach(function (attr, i) {
        var at = parseFloat(attr.getAttribute('data-flow-attr'));
        var on = p >= at;
        if (on) kept++;
        var key = 'a' + i;
        if (on && !lit.has(key)) {
          lit.add(key);
          gsap.to(attr, { opacity: 1, y: 0, duration: 0.4, ease: 'power3.out' });
        } else if (!on && lit.has(key)) {
          lit.delete(key);
          gsap.to(attr, { opacity: 0, y: 6, duration: 0.25 });
        }
      });

      if (counterEl) counterEl.textContent = String(kept).padStart(2, '0');
      if (lossEl) lossEl.textContent = '00';
    }

    update(0);

    gsap.timeline({
      scrollTrigger: {
        trigger: pin,
        start: 'top top',
        end: '+=200%',
        pin: true,
        scrub: 0.7,
        anticipatePin: 1,
        invalidateOnRefresh: true,
        refreshPriority: 1,
        onUpdate: function (self) { update(self.progress); },
      },
    })
      .fromTo('.flow-chip', { opacity: 0, y: 18, scale: 0.94 },
        { opacity: 1, y: 0, scale: 1, duration: 0.3, ease: 'power3.out', stagger: 0.05 }, 0.05)
      .to('[data-flow-outro]', { opacity: 1, y: 0, duration: 0.25, ease: 'power3.out' }, 0.82);
  }

  /* ======================================================================
     13 · DECLARAÇÃO, RODAPÉ, PROGRESSO, GRÃO
     ====================================================================== */

  function statement() {
    var el = document.querySelector('[data-statement]');
    if (!el) return;
    var lines = el.querySelectorAll('.line-inner');
    gsap.fromTo(lines, { yPercent: 108, rotate: 2.5 }, {
      yPercent: 0, rotate: 0, duration: 1.4, ease: 'expo.out', stagger: 0.1,
      scrollTrigger: { trigger: el, start: 'top 86%' },
    });
    gsap.to(el, {
      yPercent: -8, ease: 'none',
      scrollTrigger: { trigger: el.parentElement, start: 'top bottom', end: 'bottom top', scrub: true },
    });
  }

  function footerMark() {
    var word = document.querySelector('.footer-wordmark');
    if (!word) return;
    gsap.fromTo(word, { yPercent: 45, opacity: 0 }, {
      yPercent: 0, opacity: 1, ease: 'none',
      scrollTrigger: { trigger: word, start: 'top bottom', end: 'bottom bottom', scrub: true },
    });
  }

  function progress() {
    gsap.to('#dz-progress', {
      scaleX: 1, ease: 'none',
      scrollTrigger: { trigger: document.body, start: 'top top', end: 'bottom bottom', scrub: 0.3 },
    });
  }

  function grain() {
    var el = document.getElementById('dz-grain');
    if (!el) return;
    gsap.to(el, {
      duration: 0.35, repeat: -1, yoyo: true, ease: 'none', repeatRefresh: true,
      modifiers: {
        x: function () { return (Math.random() * 24 - 12) + 'px'; },
        y: function () { return (Math.random() * 24 - 12) + 'px'; },
      },
      x: 12, y: -14,
    });
  }

  /* ======================================================================
     14 · PORTÃO DE BOOT
     Fontes precisam estar prontas antes de medir quebra de linha e distância
     de pin — senão tudo é calculado sobre a métrica da fonte de fallback.
     Timer, nunca rAF: aba em segundo plano congela rAF e a página não sobe.
     ====================================================================== */

  function whenReady(cb) {
    var fonts = (document.fonts && document.fonts.ready) ? document.fonts.ready : Promise.resolve();
    var settled = false;
    function go() {
      if (settled) return;
      settled = true;
      setTimeout(cb, 30);
    }
    fonts.then(go);
    setTimeout(go, 2500);
  }

  function watchResize() {
    var w = window.innerWidth;
    var t;
    window.addEventListener('resize', function () {
      if (window.innerWidth === w) return;
      w = window.innerWidth;
      clearTimeout(t);
      t = setTimeout(function () {
        document.querySelectorAll('[data-split="lines"]').forEach(function (el) {
          var lines = splitLines(el, true);
          gsap.set(lines, { yPercent: 0 });
        });
        ScrollTrigger.refresh();
      }, 220);
    });
  }

  /* Reexecuta as primitivas declaradas dentro de um escopo.
     Existe para a página de documentação: uma animação de entrada dispara uma
     vez por carregamento, e documentação que só pode ser vista uma vez não
     documenta nada. Nada na landing chama isto. */
  function replay(scope) {
    if (!scope) return;

    ScrollTrigger.getAll().forEach(function (st) {
      if (!st.trigger || !scope.contains(st.trigger)) return;

      // Preso à rolagem (parallax, palavras que acendem): o estado é a posição
      // da página, não um tempo. Reiniciar não significaria nada.
      if (st.vars.scrub) return;

      if (st.animation) st.animation.invalidate().restart();
      else st.kill();
    });

    // Os gatilhos mortos acima eram os de disparo único; recriá-los já dispara,
    // porque o elemento está em tela.
    onceFX(scope);
  }

  window.Detalz = {
    lenis: lenis,
    EASE: EASE,
    splitWords: splitWords,
    splitLines: splitLines,
    replay: replay,
  };

  whenReady(function () {
    window.scrollTo(0, 0);
    prepareHero();
    header();
    cursor();
    reveals();
    textFX();
    stack();
    marquees();
    horizontal();
    flow();
    statement();
    footerMark();
    progress();
    grain();
    initMenu();
    initFAQ();
    initForm();
    watchResize();

    ScrollTrigger.refresh();
    preload();

    // Segunda medição só enquanto o preloader ainda cobre. Depois da
    // entrada do herói, um refresh rebobina fromTo visíveis e pisca.
    function refreshWhileCovered() {
      if (!heroRevealed && document.getElementById('dz-preloader')) {
        ScrollTrigger.refresh();
      }
    }
    if (document.readyState === 'complete') gsap.delayedCall(0.6, refreshWhileCovered);
    else window.addEventListener('load', function () { gsap.delayedCall(0.4, refreshWhileCovered); });
  });
})();
