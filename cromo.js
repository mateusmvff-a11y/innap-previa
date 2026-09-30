/* ============================================================
   INNAP · cromo
   Topo, menu do celular e pedido de orientação.
   Vale para todas as páginas, da Home à última do mapa.
   ============================================================ */
(function () {
  'use strict';

  /* ---------------------------------------------------------- topo */
  var hdr = document.getElementById('hdr');
  if (hdr) {
    var marca = function () { hdr.classList.toggle('scrolled', scrollY > 24); };
    marca();
    addEventListener('scroll', marca, { passive: true });
  }

  /* ---------------------------------------------------------- menu móvel
     Abaixo de 960px o CSS esconde a navegação, então o painel é
     a única forma de navegar. */
  (function menu() {
    var painel = document.querySelector('[data-mob]');
    var abrir = document.querySelector('[data-menu]');
    if (!painel || !abrir) return;
    var fechar = painel.querySelector('[data-menu-fechar]');
    function estado(aberto) {
      painel.hidden = !aberto;
      document.body.classList.toggle('menu-aberto', aberto);
      abrir.setAttribute('aria-expanded', String(aberto));
      if (aberto && fechar) fechar.focus();
      else if (!aberto) abrir.focus();
    }
    abrir.addEventListener('click', function () { estado(true); });
    if (fechar) fechar.addEventListener('click', function () { estado(false); });
    painel.addEventListener('click', function (e) {
      if (e.target.tagName === 'A') estado(false);
    });
    addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && !painel.hidden) estado(false);
    });
  })();

  /* ---------------------------------------------------------- pedido de orientação */
  (function lead() {
    var caixa = document.getElementById('lead');
    if (!caixa) return;
    var form = caixa.querySelector('[data-lead-form]');
    var ok = caixa.querySelector('.lead__ok');
    function abrir() {
      if (caixa.showModal) caixa.showModal();
      else caixa.setAttribute('open', '');
    }
    [].forEach.call(document.querySelectorAll('[data-abrir-lead]'), function (b) {
      b.addEventListener('click', abrir);
    });
    /* o evento 'close' do <dialog> não é confiável em todo navegador,
       então quem fecha também devolve o formulário ao estado inicial */
    function limpar() {
      if (form) { form.hidden = false; form.reset(); }
      if (ok) ok.hidden = true;
    }
    function fechar() {
      if (caixa.close && caixa.open) caixa.close();
      else caixa.removeAttribute('open');
      limpar();
    }
    [].forEach.call(caixa.querySelectorAll('[data-fechar-lead]'), function (b) {
      b.addEventListener('click', fechar);
    });
    caixa.addEventListener('cancel', limpar);
    caixa.addEventListener('close', limpar);
    if (form) {
      form.addEventListener('submit', function (e) {
        e.preventDefault();
        // a confirmação só aparece se o formulário estiver válido; a
        // validação em linha, mais abaixo, é quem aponta o que falta
        if (!form.checkValidity()) return;
        form.hidden = true;
        if (ok) ok.hidden = false;
      });
    }
  })();
})();

/* ============================================================
   Comparar formações
   Seleciona até três no catálogo e abre a tabela lado a lado.
   Os dados são os mesmos do protótipo v0.12.
   ============================================================ */
(function comparar() {
  var caixas = [].slice.call(document.querySelectorAll('[data-comparar]'));
  if (!caixas.length) return;

  var dados = {
    naturopatia:     { nome: 'Naturopatia',           duracao: '20 meses',          carga: '900h',          formato: 'Ao vivo semanal',          modalidades: 'Extensão e Pós',        preco: 'A partir de R$ 7.182 à vista' },
    fitoterapia:     { nome: 'Fitoterapia',           duracao: '6 meses',           carga: '600h na Pós',   formato: 'Conteúdo gravado',         modalidades: 'Livre e Pós',           preco: 'A partir de R$ 1.566 à vista' },
    ortomolecular:   { nome: 'Terapia Ortomolecular', duracao: '12 meses',          carga: '400h',          formato: 'Gravado e encontro mensal', modalidades: 'Extensão e Pós',        preco: 'A partir de R$ 4.309,20 à vista' },
    iridologia:      { nome: 'Iridologia',            duracao: '2, 15 ou 18 meses', carga: '150h ou 900h',  formato: 'Gravado ou ao vivo',       modalidades: 'Livre, Extensão e Pós', preco: 'A partir de R$ 499 no Express' },
    florais:         { nome: 'Florais',               duracao: '7 meses',           carga: '70h',           formato: 'Conteúdo gravado',         modalidades: 'Curso Livre',           preco: 'A partir de R$ 1.650,60 à vista' },
    auriculoterapia: { nome: 'Auriculoterapia',       duracao: '6 meses',           carga: '60h',           formato: 'Conteúdo gravado',         modalidades: 'Curso Livre',           preco: 'A partir de R$ 1.528,20 à vista' },
    psicanalise:     { nome: 'Psicanálise',           duracao: '24 meses',          carga: '645h',          formato: 'Gravado e encontro mensal', modalidades: 'Extensão e Pós',        preco: 'Turma em formação' }
  };
  var linhas = [['Duração', 'duracao'], ['Carga horária', 'carga'], ['Formato', 'formato'], ['Modalidades', 'modalidades'], ['Investimento', 'preco']];
  var LIMITE = 3;

  var barra = document.createElement('div');
  barra.className = 'barra-comparar';
  barra.hidden = true;
  barra.innerHTML = '<div class="wrap"><p><b data-conta>0</b> <span data-rotulo>formações selecionadas</span></p>' +
    '<div><button type="button" class="btn btn-ghost pill-mini" data-limpar>Limpar</button>' +
    '<button type="button" class="btn btn-primary pill-mini" data-abrir>Comparar <span class="arw">&#8594;</span></button></div></div>';
  document.body.appendChild(barra);

  var caixaDlg = document.createElement('dialog');
  caixaDlg.className = 'lead comparar';
  caixaDlg.innerHTML = '<div class="lead__caixa"><button class="lead__x" type="button" aria-label="Fechar" data-fechar>' +
    '<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"><path d="M6 6l12 12M18 6 6 18"/></svg></button>' +
    '<div class="lead__copy"><p class="eyebrow">Comparar</p><h2>Lado a lado.</h2>' +
    '<p class="lead">Duração, carga horária, formato, modalidades e investimento das formações escolhidas.</p></div>' +
    '<div class="tabela-rolo"><table class="tabela" data-tabela></table></div></div>';
  document.body.appendChild(caixaDlg);

  var conta = barra.querySelector('[data-conta]');
  var rotulo = barra.querySelector('[data-rotulo]');
  var tabela = caixaDlg.querySelector('[data-tabela]');

  function escolhidas() {
    return caixas.filter(function (c) { return c.checked; }).map(function (c) { return c.value; })
      .filter(function (v) { return dados[v]; });
  }

  function atualizar() {
    var sel = escolhidas();
    barra.hidden = sel.length === 0;
    conta.textContent = sel.length;
    rotulo.textContent = sel.length === 1 ? 'formação selecionada' : 'formações selecionadas';
    caixas.forEach(function (c) {
      var bloqueia = !c.checked && sel.length >= LIMITE;
      c.disabled = bloqueia;
      var pai = c.closest('.curso__comparar');
      if (pai) pai.classList.toggle('is-off', bloqueia);
    });
  }

  function montar() {
    var sel = escolhidas();
    if (!sel.length) return;
    var h = '<thead><tr><th></th>';
    sel.forEach(function (k) { h += '<th>' + dados[k].nome + '</th>'; });
    h += '</tr></thead><tbody>';
    linhas.forEach(function (l) {
      h += '<tr><th scope="row">' + l[0] + '</th>';
      sel.forEach(function (k) { h += '<td data-rotulo="' + l[0] + '">' + dados[k][l[1]] + '</td>'; });
      h += '</tr>';
    });
    tabela.innerHTML = h + '</tbody>';
    if (caixaDlg.showModal) caixaDlg.showModal(); else caixaDlg.setAttribute('open', '');
  }

  caixas.forEach(function (c) { c.addEventListener('change', atualizar); });
  barra.querySelector('[data-abrir]').addEventListener('click', montar);
  barra.querySelector('[data-limpar]').addEventListener('click', function () {
    caixas.forEach(function (c) { c.checked = false; });
    atualizar();
  });
  caixaDlg.querySelector('[data-fechar]').addEventListener('click', function () {
    if (caixaDlg.close && caixaDlg.open) caixaDlg.close(); else caixaDlg.removeAttribute('open');
  });
  atualizar();
})();

/* ============================================================
   Filtro dos conteúdos
   As pastilhas filtram os cartões pela tarja de categoria.
   "Todos" mostra tudo; o que não casa com nenhuma pastilha
   continua aparecendo só em "Todos".
   ============================================================ */
(function filtroConteudos() {
  var barra = document.querySelector('.pilulas');
  var grade = document.querySelector('.arts');
  if (!barra || !grade) return;
  var botoes = [].slice.call(barra.querySelectorAll('.pilula'));
  var cartoes = [].slice.call(grade.querySelectorAll('.art'));
  if (botoes.length < 2 || !cartoes.length) return;

  function normal(s) {
    return (s || '').trim().toLowerCase()
      .normalize('NFD').replace(/[̀-ͯ]/g, '');
  }
  function categoria(c) {
    var k = c.querySelector('.kicker');
    return normal(k ? k.textContent : '');
  }

  function aplicar(alvo) {
    var todos = normal(alvo) === 'todos';
    var n = 0;
    cartoes.forEach(function (c) {
      var mostra = todos || categoria(c) === normal(alvo);
      c.hidden = !mostra;
      if (mostra) n++;
    });
    botoes.forEach(function (b) {
      var on = normal(b.textContent) === normal(alvo);
      b.classList.toggle('is-on', on);
      b.setAttribute('aria-pressed', String(on));
    });
    grade.setAttribute('data-vazio', String(n === 0));
  }

  botoes.forEach(function (b) {
    b.setAttribute('type', 'button');
    b.addEventListener('click', function () { aplicar(b.textContent); });
  });
  aplicar(botoes[0].textContent);
})();

/* formulários fora do diálogo: mesma resposta ao enviar */
(function formularioSolto() {
  [].forEach.call(document.querySelectorAll('.orienta [data-lead-form]'), function (f) {
    var ok = f.parentElement.querySelector('.lead__ok');
    f.addEventListener('submit', function (e) {
      e.preventDefault();
      if (!f.checkValidity()) return;
      f.hidden = true;
      if (ok) { ok.hidden = false; ok.scrollIntoView({ block: 'center', behavior: 'smooth' }); }
    });
  });
})();

/* ============================================================
   Carrossel de fotos
   Setas, pontos, teclado e avanço automático que pausa no hover.
   ============================================================ */
(function carrossel() {
  [].forEach.call(document.querySelectorAll('[data-carrossel]'), montar);

  function montar(raiz) {
  var trilho = raiz.querySelector('[data-trilho]');
  var itens = [].slice.call(raiz.querySelectorAll('.carrossel__item'));
  var pontos = [].slice.call(raiz.querySelectorAll('[data-ir]'));
  var antes = raiz.querySelector('[data-antes]');
  var depois = raiz.querySelector('[data-depois]');
  var conta = raiz.querySelector('[data-conta]');
  if (!trilho || itens.length < 2) return;
  var suave = matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth';

  // qual foto está no centro do trilho agora
  function atual() {
    var meio = trilho.scrollLeft + trilho.clientWidth / 2;
    var melhor = 0, menor = Infinity;
    itens.forEach(function (it, i) {
      var c = it.offsetLeft + it.offsetWidth / 2;
      var d = Math.abs(c - meio);
      if (d < menor) { menor = d; melhor = i; }
    });
    return melhor;
  }

  function ir(i) {
    var alvo = itens[Math.max(0, Math.min(itens.length - 1, i))];
    trilho.scrollTo({ left: alvo.offsetLeft - trilho.offsetLeft, behavior: suave });
  }

  function marcar() {
    var i = atual();
    pontos.forEach(function (p, j) {
      if (j === i) p.setAttribute('aria-current', 'true'); else p.removeAttribute('aria-current');
    });
    if (conta) conta.textContent = i + 1;
    // nas pontas a seta desliga em vez de virar a volta: o trilho tem
    // começo e fim visíveis, dar a volta confunde
    if (antes) antes.disabled = trilho.scrollLeft < 4;
    if (depois) depois.disabled = trilho.scrollLeft + trilho.clientWidth >= trilho.scrollWidth - 4;
  }

  // sem requestAnimationFrame: em aba de fundo ele não roda e o estado
  // dos pontos ficava parado na primeira foto
  var espera = 0;
  trilho.addEventListener('scroll', function () {
    if (espera) clearTimeout(espera);
    espera = setTimeout(marcar, 60);
  }, { passive: true });

  if (antes) antes.addEventListener('click', function () { ir(atual() - 1); });
  if (depois) depois.addEventListener('click', function () { ir(atual() + 1); });
  pontos.forEach(function (p, i) { p.addEventListener('click', function () { ir(i); }); });
  trilho.addEventListener('keydown', function (e) {
    if (e.key === 'ArrowLeft') { e.preventDefault(); ir(atual() - 1); }
    if (e.key === 'ArrowRight') { e.preventDefault(); ir(atual() + 1); }
    if (e.key === 'Home') { e.preventDefault(); ir(0); }
    if (e.key === 'End') { e.preventDefault(); ir(itens.length - 1); }
  });
  // Arrastar com o mouse, como já acontece no toque e no trackpad.
  // O scroll-snap é desligado durante o arrasto: com ele ligado o
  // navegador puxa de volta para o encaixe a cada quadro e o trilho
  // treme na mão. Ao soltar, o snap volta e a foto mais próxima assume.
  var arrastando = false, partiuX = 0, partiuScroll = 0, andou = 0;

  trilho.addEventListener('pointerdown', function (e) {
    if (e.pointerType === 'touch' || e.button !== 0) return;
    arrastando = true; andou = 0;
    partiuX = e.clientX; partiuScroll = trilho.scrollLeft;
    trilho.style.scrollSnapType = 'none';
    trilho.classList.add('esta-arrastando');
    trilho.setPointerCapture(e.pointerId);
  });

  trilho.addEventListener('pointermove', function (e) {
    if (!arrastando) return;
    var d = e.clientX - partiuX;
    if (Math.abs(d) > 3) andou = Math.abs(d);
    trilho.scrollLeft = partiuScroll - d;
  });

  function soltar(e) {
    if (!arrastando) return;
    arrastando = false;
    trilho.classList.remove('esta-arrastando');
    if (e && e.pointerId != null && trilho.hasPointerCapture(e.pointerId)) {
      trilho.releasePointerCapture(e.pointerId);
    }
    trilho.style.scrollSnapType = '';
    ir(atual());
    marcar();
  }
  trilho.addEventListener('pointerup', soltar);
  trilho.addEventListener('pointercancel', soltar);
  trilho.addEventListener('pointerleave', soltar);
  // depois de arrastar, o clique que vem junto não deve abrir nada
  trilho.addEventListener('click', function (e) {
    if (andou > 3) { e.preventDefault(); e.stopPropagation(); andou = 0; }
  }, true);
  // o navegador tenta arrastar a imagem como arquivo; isso atrapalha
  [].forEach.call(trilho.querySelectorAll('img'), function (im) {
    im.addEventListener('dragstart', function (e) { e.preventDefault(); });
  });

  addEventListener('resize', marcar);
  marcar();
  }
})();

/* ------------------------------------------------------------------
   Filtro de perfil do catálogo de formações.
   As pastilhas já existiam no protótipo mas não faziam nada. Cada
   cartão carrega os perfis que atende em data-perfil; aqui só se
   mostra o que bate, e a contagem acompanha.
   ------------------------------------------------------------------ */
(function filtroPerfil() {
  var pastilhas = document.querySelectorAll('[data-perfil-filtro]');
  if (!pastilhas.length) return;
  var cartoes = document.querySelectorAll('[data-perfil]');
  if (!cartoes.length) return;
  var contagem = document.querySelector('.contagem b');
  var molde = contagem ? contagem.textContent.replace(/^\d+\s*/, '') : '';

  function aplicar(chave) {
    var vistos = 0;
    for (var i = 0; i < cartoes.length; i++) {
      var c = cartoes[i];
      var serve = chave === 'todas' || (' ' + c.getAttribute('data-perfil') + ' ').indexOf(' ' + chave + ' ') > -1;
      c.hidden = !serve;
      if (serve) vistos++;
    }
    for (var j = 0; j < pastilhas.length; j++) {
      var on = pastilhas[j].getAttribute('data-perfil-filtro') === chave;
      pastilhas[j].setAttribute('aria-pressed', on ? 'true' : 'false');
      pastilhas[j].classList.toggle('is-on', on);
    }
    if (contagem) {
      contagem.textContent = vistos + ' ' + (vistos === 1 ? molde.replace(/ões\b/, 'ão').replace(/s$/, '') : molde);
    }
  }

  for (var k = 0; k < pastilhas.length; k++) {
    pastilhas[k].addEventListener('click', function () {
      aplicar(this.getAttribute('data-perfil-filtro'));
    });
  }
  aplicar('todas');
})();

/* ------------------------------------------------------------------
   A trama da marca entra e sai em fade conforme a seção chega à dobra.
   Sem isto a trama fica parada na opacidade final, que é o estado que
   o CSS já descreve: aqui só se acrescenta o movimento.
   ------------------------------------------------------------------ */
(function circuito() {
  var alvos = document.querySelectorAll(
    '.anchor,.cta-final,.final,.tempo-sec,.destaque__visual,.abas__lista,' +
    '.faixa-escura,.phero:not(.phero--foto)'
  );
  if (!alvos.length || !window.IntersectionObserver) return;

  // A classe que apaga a trama é posta pelo próprio observador, nunca
  // antes dele. Se o observador não responder, por qualquer motivo, a
  // trama fica no estado que o CSS descreve e continua visível, em vez
  // de sumir do site inteiro por causa de um script.
  var olho = new IntersectionObserver(function (entradas) {
    entradas.forEach(function (e) {
      e.target.classList.add('tem-circuito');
      e.target.classList.toggle('circuito-on', e.isIntersecting);
    });
  }, { rootMargin: '-8% 0px -8% 0px', threshold: 0 });

  [].forEach.call(alvos, function (el) { olho.observe(el); });
})();

/* ------------------------------------------------------------------
   Validação em linha do formulário de orientação.
   O que a pesquisa de UX de formulário recomenda: não acusar erro
   enquanto a pessoa digita pela primeira vez, só ao sair do campo;
   depois que um campo já errou, corrigir em tempo real enquanto ela
   conserta; e, no envio, levar o foco ao primeiro campo com problema
   em vez de deixar a pessoa procurar.
   ------------------------------------------------------------------ */
(function validacao() {
  var forms = document.querySelectorAll('[data-lead-form]');
  if (!forms.length) return;

  var RECADOS = {
    valueMissing: 'Preencha este campo para seguir.',
    typeMismatch: 'Confira o formato deste dado.',
    tooShort: 'Escreva um pouco mais.'
  };

  function recado(campo) {
    var v = campo.validity;
    if (campo.type === 'checkbox' && v.valueMissing) return 'Marque esta caixa para enviar o pedido.';
    if (campo.name === 'whatsapp' && !v.valid && !v.valueMissing) return 'Informe um telefone com DDD.';
    for (var k in RECADOS) { if (v[k]) return RECADOS[k]; }
    return campo.validationMessage || 'Confira este campo.';
  }

  function aviso(campo) {
    var rotulo = campo.closest('label');
    if (!rotulo) return null;
    var p = rotulo.querySelector('.lead__erro');
    if (!p) {
      p = document.createElement('p');
      p.className = 'lead__erro';
      p.id = 'erro-' + (campo.name || 'campo') + '-' + Math.random().toString(36).slice(2, 7);
      rotulo.appendChild(p);
    }
    return p;
  }

  function conferir(campo) {
    var bom = campo.checkValidity();
    var p = aviso(campo);
    campo.setAttribute('aria-invalid', bom ? 'false' : 'true');
    if (p) {
      p.textContent = bom ? '' : recado(campo);
      if (bom) campo.removeAttribute('aria-describedby');
      else campo.setAttribute('aria-describedby', p.id);
    }
    var rotulo = campo.closest('label');
    if (rotulo) rotulo.classList.toggle('tem-erro', !bom);
    return bom;
  }

  [].forEach.call(forms, function (form) {
    var campos = [].slice.call(form.querySelectorAll('input,select,textarea'));

    campos.forEach(function (campo) {
      campo.addEventListener('blur', function () {
        if (campo.value === '' && !campo.required && campo.type !== 'checkbox') return;
        campo.dataset.tocado = '1';
        conferir(campo);
      });
      // só corrige em tempo real depois que o campo já acusou erro
      campo.addEventListener('input', function () {
        if (campo.dataset.tocado) conferir(campo);
      });
      campo.addEventListener('change', function () {
        if (campo.dataset.tocado) conferir(campo);
      });
    });

    form.addEventListener('submit', function (e) {
      var primeiro = null;
      campos.forEach(function (campo) {
        campo.dataset.tocado = '1';
        if (!conferir(campo) && !primeiro) primeiro = campo;
      });
      if (primeiro) {
        e.preventDefault();
        e.stopImmediatePropagation();
        primeiro.focus();
        if (primeiro.scrollIntoView) primeiro.scrollIntoView({ block: 'center', behavior: 'smooth' });
      }
    }, true);
  });
})();

/* ------------------------------------------------------------------
   Menu de formações no cabeçalho.
   Só com :hover do CSS o menu fechava no meio do caminho: entre o
   gatilho e o painel há um vão, e ao atravessá-lo o ponteiro saía da
   área. Aqui o menu ganha um atraso curto ao sair, abre no clique
   para quem usa toque e fecha com Escape ou clique fora.
   ------------------------------------------------------------------ */
(function menuFormacoes() {
  var grupos = document.querySelectorAll('.has-menu');
  if (!grupos.length) return;

  [].forEach.call(grupos, function (g) {
    var gatilho = g.querySelector('a');
    var relogio = null;

    function abrir() {
      if (relogio) { clearTimeout(relogio); relogio = null; }
      g.classList.add('is-aberto');
      if (gatilho) gatilho.setAttribute('aria-expanded', 'true');
    }
    function fechar(atraso) {
      if (relogio) clearTimeout(relogio);
      relogio = setTimeout(function () {
        g.classList.remove('is-aberto');
        if (gatilho) gatilho.setAttribute('aria-expanded', 'false');
      }, atraso || 0);
    }

    if (gatilho) gatilho.setAttribute('aria-expanded', 'false');
    g.addEventListener('pointerenter', abrir);
    g.addEventListener('pointerleave', function () { fechar(260); });
    g.addEventListener('focusin', abrir);
    g.addEventListener('focusout', function (e) {
      if (!g.contains(e.relatedTarget)) fechar(0);
    });
    // no toque, o primeiro toque abre em vez de seguir o link
    if (gatilho) {
      gatilho.addEventListener('click', function (e) {
        if (!matchMedia('(hover: none)').matches) return;
        if (!g.classList.contains('is-aberto')) { e.preventDefault(); abrir(); }
      });
    }
    g.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') { fechar(0); if (gatilho) gatilho.focus(); }
    });
  });

  document.addEventListener('click', function (e) {
    [].forEach.call(grupos, function (g) {
      if (!g.contains(e.target)) g.classList.remove('is-aberto');
    });
  });
})();
