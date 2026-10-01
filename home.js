/* ============================================================
   INNAP · Home
   GSAP vem de vendor/, não de CDN: assim a animação roda mesmo
   abrindo o arquivo direto, sem internet.
   Sem GSAP a página continua inteira e o que é clicável, clica.
   ============================================================ */
(function () {
  'use strict';

  var doc = document.documentElement;
  var pouco = matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* topo, menu do celular e diálogo saíram para cromo.js */

  /* ---------------------------------------------------------- abas de perfil
     Lista vertical à esquerda, painel à direita. Sem GSAP também troca. */
  (function abas() {
    var raiz = document.querySelector('[data-abas]');
    if (!raiz) return;
    var botoes = [].slice.call(raiz.querySelectorAll('.abas__aba'));
    var paineis = [].slice.call(raiz.querySelectorAll('.abas__painel'));
    function mostrar(i) {
      botoes.forEach(function (b, j) {
        b.classList.toggle('is-on', j === i);
        b.setAttribute('aria-selected', String(j === i));
      });
      paineis.forEach(function (p, j) {
        p.hidden = j !== i;
        p.classList.toggle('is-on', j === i);
      });
    }
    botoes.forEach(function (b, i) {
      b.addEventListener('click', function () { mostrar(i); });
      b.addEventListener('keydown', function (e) {
        var d = e.key === 'ArrowDown' || e.key === 'ArrowRight' ? 1
              : e.key === 'ArrowUp' || e.key === 'ArrowLeft' ? -1 : 0;
        if (!d) return;
        e.preventDefault();
        var n = (i + d + botoes.length) % botoes.length;
        botoes[n].focus(); mostrar(n);
      });
    });
    mostrar(0);
  })();

  /* ---------------------------------------------------------- sanfona antiga
     Só roda se alguma página ainda usar o formato de blocos que abrem. */
  (function jornada() {
    var raiz = document.querySelector('[data-jornada]');
    if (!raiz) return;
    var blocos = [].slice.call(raiz.querySelectorAll('.jornada__bloco'));

    function altura(bloco) {
      var dentro = bloco.querySelector('.jornada__dentro');
      return dentro ? dentro.getBoundingClientRect().height : 0;
    }
    function aplicar(ativo, animar) {
      blocos.forEach(function (b) {
        var painel = b.querySelector('.jornada__painel');
        var botao = b.querySelector('.jornada__linha');
        var abre = b === ativo;
        b.classList.toggle('is-active', abre);
        botao.setAttribute('aria-expanded', abre ? 'true' : 'false');
        var alvo = abre ? altura(b) : 0;
        if (animar && window.gsap && !pouco) {
          gsap.to(painel, { height: alvo, duration: .5, ease: 'power3.inOut' });
        } else {
          painel.style.height = alvo + 'px';
        }
      });
    }
    blocos.forEach(function (b) {
      b.querySelector('.jornada__linha').addEventListener('click', function () { aplicar(b, true); });
    });
    aplicar(blocos[0], false);
    addEventListener('resize', function () {
      var ativo = raiz.querySelector('.jornada__bloco.is-active');
      if (ativo) aplicar(ativo, false);
    }, { passive: true });
  })();

  /* ---------------------------------------------------------- trilho */
  function geometria(xs, ys, r, W) {
    var d = 'M0 ' + ys[0] + ' L' + xs[0] + ' ' + ys[0];
    for (var i = 0; i < xs.length - 1; i++) {
      var x1 = xs[i], y1 = ys[i], x2 = xs[i + 1], y2 = ys[i + 1];
      var mx = (x1 + x2) / 2, s = y2 > y1 ? 1 : -1;
      d += (y1 === y2) ? (' L' + x2 + ' ' + y2)
        : (' L' + (mx - r) + ' ' + y1 + ' Q' + mx + ' ' + y1 + ' ' + mx + ' ' + (y1 + s * r) +
           ' L' + mx + ' ' + (y2 - s * r) + ' Q' + mx + ' ' + y2 + ' ' + (mx + r) + ' ' + y2 + ' L' + x2 + ' ' + y2);
    }
    return d + ' L' + W + ' ' + ys[ys.length - 1];
  }
  var NS = 'http://www.w3.org/2000/svg';
  /* Os nós são criados uma vez só e guardados no próprio elemento.
     Antes, cada remedição apagava o SVG e criava bolinhas novas; os
     gatilhos de scroll continuavam apontando para as antigas, já fora
     da página, e por isso nada acendia na tela. */
  function montarTrilhos() {
    var feitos = [];
    [].forEach.call(document.querySelectorAll('[data-proc]'), function (p) {
      var svg = p.querySelector('.proc-rail');
      var cols = [].slice.call(p.querySelectorAll('.pcol'));
      var W = p.clientWidth, H = 70, n = cols.length;
      if (!svg || !W || !n) return;
      svg.setAttribute('viewBox', '0 0 ' + W + ' ' + H);
      svg.setAttribute('width', W); svg.setAttribute('height', H);

      var t = p.trilhoINNAP;
      if (!t || t.nos.length !== n) {
        while (svg.firstChild) svg.removeChild(svg.firstChild);
        var fundo = document.createElementNS(NS, 'path');
        fundo.setAttribute('class', 'p-bg'); svg.appendChild(fundo);
        var frente = document.createElementNS(NS, 'path');
        frente.setAttribute('class', 'p-fg'); svg.appendChild(frente);
        var nos = [], halos = [], pontos = [];
        for (var j = 0; j < n; j++) {
          var g = document.createElementNS(NS, 'g');
          var halo = document.createElementNS(NS, 'circle');
          halo.setAttribute('class', 'p-halo'); halo.setAttribute('r', 14);
          var ponto = document.createElementNS(NS, 'circle');
          ponto.setAttribute('class', 'p-dot'); ponto.setAttribute('r', 6);
          g.appendChild(halo); g.appendChild(ponto); svg.appendChild(g);
          nos.push(g); halos.push(halo); pontos.push(ponto);
        }
        t = p.trilhoINNAP = { proc: p, fundo: fundo, frente: frente, nos: nos, halos: halos, pontos: pontos };
      }
      t.cols = cols;

      // O halo tem raio 14. Com o nó a 10px da borda esquerda do SVG,
      // ele saía 4px fora da caixa e aparecia cortado na primeira
      // coluna. Cada nó fica agora a pelo menos um raio da borda.
      var caixa = svg.getBoundingClientRect(), base = H / 2, amp = 11, raio = 15, xs = [], ys = [];
      for (var i = 0; i < n; i++) {
        var cb = cols[i].getBoundingClientRect();
        var x = Math.round(cb.left - caixa.left + 10);
        xs.push(Math.min(W - raio, Math.max(raio, x)));
        ys.push(base + (i % 2 === 0 ? -amp : amp));
      }
      var d = geometria(xs, ys, 12, W);
      t.fundo.setAttribute('d', d);
      t.frente.setAttribute('d', d);
      for (var k = 0; k < n; k++) {
        t.halos[k].setAttribute('cx', xs[k]); t.halos[k].setAttribute('cy', ys[k]);
        t.pontos[k].setAttribute('cx', xs[k]); t.pontos[k].setAttribute('cy', ys[k]);
      }
      t.comp = t.frente.getTotalLength();
      feitos.push(t);
    });
    return feitos;
  }

  /* ---------------------------------------------------------- palavras */
  function emPalavras(el) {
    if (!el || el.dataset.quebrado) return el ? el.querySelectorAll('.palavra__i') : [];
    var frag = document.createDocumentFragment();
    function quebrar(texto, alvo) {
      texto.split(/(\s+)/).forEach(function (p) {
        if (!p.trim()) { alvo.appendChild(document.createTextNode(p)); return; }
        var fora = document.createElement('span'); fora.className = 'palavra';
        var dentro = document.createElement('span'); dentro.className = 'palavra__i';
        dentro.textContent = p; fora.appendChild(dentro); alvo.appendChild(fora);
      });
    }
    [].forEach.call(el.childNodes, function (no) {
      if (no.nodeType === 3) { quebrar(no.nodeValue, frag); return; }
      var copia = no.cloneNode(false);
      quebrar(no.textContent, copia);
      frag.appendChild(copia);
    });
    el.textContent = '';
    el.appendChild(frag);
    el.dataset.quebrado = '1';
    return el.querySelectorAll('.palavra__i');
  }

  function tudoVisivel() {
    [].forEach.call(document.querySelectorAll('[data-reveal]'), function (e) { e.classList.add('in'); });
    [].forEach.call(document.querySelectorAll('.pcol'), function (e) { e.classList.add('on'); });
    [].forEach.call(document.querySelectorAll('.proc-rail .p-fg'), function (e) { e.style.strokeDashoffset = 0; });
    [].forEach.call(document.querySelectorAll('.proc-rail g'), function (e) { e.classList.add('on'); });
    [].forEach.call(document.querySelectorAll('.tempo__item'), function (e) { e.classList.add('on'); });
  }
  /* A captura do Figma (captura.js) chama isto para medir a página no
     estado final, com tudo já revelado. Fica exposto só por isso. */
  window.innapTudoVisivel = tudoVisivel;

  /* ---------------------------------------------------------- animação */
  function iniciar(gsap, ST) {
    gsap.registerPlugin(ST);
    doc.classList.add('anim');

    /* Na primeira passada o trilho às vezes ainda não tem largura, e aí
       não dava para criar o gatilho. Por isso ele é criado na hora em que
       o trilho aparece, e a remedição posterior aproveita o mesmo. */
    /* janela curta e limiar baixo: o quinto nó precisa acender com o
       bloco ainda no meio da tela, não quando já passou */
    var janela = function () { return '+=' + Math.round(innerHeight * .55); };
    function ligarTrilho(t2) {
      if (t2.ligado) return;
      t2.ligado = true;
      t2.frente.style.strokeDasharray = t2.comp;
      t2.frente.style.strokeDashoffset = t2.comp;
      /* um gatilho só para a linha e para os nós: a bolinha acende no
         instante em que o traço chega nela, sem dessincronizar */
      ST.create({
        trigger: t2.proc, start: 'top 88%', end: janela, scrub: .25,
        onUpdate: function (self) {
          t2.frente.style.strokeDasharray = t2.comp;
          t2.frente.style.strokeDashoffset = t2.comp * (1 - self.progress);
          var n = t2.nos.length;
          t2.nos.forEach(function (g, i) {
            var limite = n > 1 ? (i / (n - 1)) * .66 : 0;
            var passou = self.progress >= limite;
            if (passou === g.classList.contains('on')) return;
            g.classList.toggle('on', passou);
            if (t2.cols[i]) t2.cols[i].classList.toggle('on', passou);
          });
        }
      });
    }
    var medir = function () { montarTrilhos().forEach(ligarTrilho); };
    var recalcular = function () { medir(); ST.refresh(); };
    addEventListener('resize', recalcular, { passive: true });

    if (pouco) { montarTrilhos(); tudoVisivel(); return; }
    medir();
    var suave = 'power3.out';

    /* hero */
    var hero = document.querySelector('[data-hero]');
    if (hero) {
      var foto = hero.querySelector('.hslide img');
      var t = gsap.timeline({ defaults: { ease: suave } });
      if (foto) t.fromTo(foto, { scale: 1.14 }, { scale: 1, duration: 1.6, ease: 'power2.out' }, 0);
      t.fromTo(hero.querySelector('.hero-eyebrow'), { y: 16, opacity: 0 }, { y: 0, opacity: 1, duration: .7 }, .2);
      t.fromTo(emPalavras(hero.querySelector('h1')), { yPercent: 118, opacity: 0 }, { yPercent: 0, opacity: 1, duration: .95, stagger: .06 }, .3);
      t.fromTo(hero.querySelector('.hero-sub'), { y: 20, opacity: 0 }, { y: 0, opacity: 1, duration: .8 }, .62);
      t.fromTo(hero.querySelectorAll('.hero-cta > *'), { y: 18, opacity: 0 }, { y: 0, opacity: 1, duration: .7, stagger: .09 }, .76);
      if (foto) gsap.to(foto, { yPercent: 10, ease: 'none', scrollTrigger: { trigger: hero, start: 'top top', end: 'bottom top', scrub: true } });
    }

    /* hero das páginas internas: mesma entrada, só mais curta */
    var phero = document.querySelector('.phero');
    if (phero) {
      var tp = gsap.timeline({ defaults: { ease: suave } });
      var fp = phero.querySelector('.phero__fundo-img, .phero__img');
      if (fp) tp.fromTo(fp, { scale: 1.1 }, { scale: 1, duration: 1.4, ease: 'power2.out' }, 0);
      var olho = phero.querySelector('.eyebrow');
      if (olho) tp.fromTo(olho, { y: 14, opacity: 0 }, { y: 0, opacity: 1, duration: .6 }, .15);
      var t1 = phero.querySelector('h1');
      if (t1) tp.fromTo(emPalavras(t1), { yPercent: 116, opacity: 0 }, { yPercent: 0, opacity: 1, duration: .85, stagger: .05 }, .24);
      var resto = phero.querySelectorAll('h1 ~ p, .acoes, .pilulas, .instglass--pagina');
      if (resto.length) tp.fromTo(resto, { y: 18, opacity: 0 }, { y: 0, opacity: 1, duration: .7, stagger: .08, clearProps: 'transform,translate,rotate,scale' }, .52);
    }

    /* três pilares se revezam sobre a foto */
    var flut = document.querySelector('[data-flut]');
    if (flut && innerWidth > 1100) {
      var itens = [].slice.call(flut.children);
      var ciclo = gsap.timeline({ repeat: -1, delay: 1.5 });
      itens.forEach(function (it) {
        ciclo.fromTo(it, { opacity: 0, y: 16, scale: .97 }, { opacity: 1, y: 0, scale: 1, duration: .75, ease: suave })
             .to(it, { opacity: 0, y: -12, duration: .55, ease: 'power2.in' }, '+=2.6');
      });
      ScrollTrigger.create({
        trigger: hero, start: 'top top', end: 'bottom 30%',
        onLeave: function () { ciclo.pause(); }, onEnterBack: function () { ciclo.play(); }
      });
    }

    /* barra de vidro */
    var glass = document.querySelector('.instglass');
    if (glass) {
      gsap.fromTo(glass, { y: 36, opacity: 0 }, { y: 0, opacity: 1, duration: .9, ease: suave, delay: .9 });
      gsap.fromTo(glass.querySelectorAll('.instcell'), { opacity: 0 }, { opacity: 1, duration: .6, stagger: .08, delay: 1.1 });
    }

    /* blocos
       clearProps é essencial: sem ele o GSAP deixa um transform inline
       no elemento, e transform inline ganha do :hover da folha. Era por
       isso que os cartões não reagiam ao mouse. */
    [].forEach.call(document.querySelectorAll('[data-reveal]'), function (el) {
      gsap.fromTo(el, { y: 40, opacity: 0 }, {
        y: 0, opacity: 1, duration: .9, ease: suave, clearProps: 'transform,translate,rotate,scale',
        scrollTrigger: { trigger: el, start: 'top 86%', once: true },
        onStart: function () { el.classList.add('in'); }
      });
    });

    /* grades */
    [].forEach.call(document.querySelectorAll('.flist, .mods, .profs, .arts, .exp-grid, .turmas, .cursos, .fichas, .jornada__bloco'), function (g) {
      if (g.children.length < 2) return;
      /* as células vazias só existem para fechar os fios da grade:
         se entrarem na animação, ficam deslocadas e tortam a moldura */
      var itens = [].filter.call(g.children, function (c) {
        return !c.classList.contains('fitem--vazio');
      });
      if (itens.length < 2) return;
      gsap.fromTo(itens, { y: 26, opacity: 0 }, {
        y: 0, opacity: 1, duration: .7, ease: suave, stagger: .07, clearProps: 'transform,translate,rotate,scale',
        scrollTrigger: { trigger: g, start: 'top 90%', once: true }
      });
    });

    /* números do destaque */
    [].forEach.call(document.querySelectorAll('.destaque__nums b'), function (b) {
      var m = b.textContent.trim().match(/^(\d+)(\D*)$/);
      if (!m) return;
      var alvo = parseInt(m[1], 10), sufixo = m[2], o = { v: 0 };
      gsap.to(o, {
        v: alvo, duration: 1.3, ease: 'power2.out',
        scrollTrigger: { trigger: b, start: 'top 90%', once: true },
        onUpdate: function () { b.textContent = Math.round(o.v) + sufixo; }
      });
    });

    /* linha do tempo: a linha cresce e os pontos acendem */
    var lista = document.querySelector('[data-tempo]');
    if (lista) {
      var prog = lista.querySelector('.tempo__prog');
      var itensT = [].slice.call(lista.querySelectorAll('.tempo__item'));
      /* a régua cresce; cada marco acende quando ela passa por ele,
         e é o CSS que revela o texto na sequência */
      ST.create({
        trigger: lista, start: 'top 74%', end: 'bottom 78%', scrub: .5,
        onUpdate: function (self) {
          if (prog) prog.style.height = (self.progress * 100) + '%';
          var n = itensT.length;
          itensT.forEach(function (it, i) {
            var limite = n > 1 ? (i / (n - 1)) * .8 : 0;
            it.classList.toggle('on', self.progress >= limite);
          });
        }
      });
    }

    setTimeout(recalcular, 400);

    /* Rede de segurança: se o navegador suspender o relógio de animação
       (aba em segundo plano, economia de bateria), o conteúdo ficaria
       invisível. Passados três segundos, o que já está na tela aparece. */
    setTimeout(function () {
      [].forEach.call(document.querySelectorAll('[data-reveal]:not(.in)'), function (e) {
        var r = e.getBoundingClientRect();
        if (r.top < innerHeight && r.bottom > 0) {
          e.classList.add('in');
          gsap.set(e, { opacity: 1, y: 0, clearProps: 'transform,translate,rotate,scale' });
        }
      });
    }, 3000);
  }

  function carregar(src) {
    return new Promise(function (ok, erro) {
      var s = document.createElement('script');
      s.src = src; s.async = false; s.onload = ok; s.onerror = erro;
      document.head.appendChild(s);
    });
  }

  carregar('vendor/gsap.min.js')
    .then(function () { return carregar('vendor/ScrollTrigger.min.js'); })
    .then(function () {
      if (window.gsap && window.ScrollTrigger) iniciar(window.gsap, window.ScrollTrigger);
      else { montarTrilhos(); tudoVisivel(); }
    })
    .catch(function () { montarTrilhos(); tudoVisivel(); });
})();
