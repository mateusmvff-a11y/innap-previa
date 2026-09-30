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
  var raiz = document.querySelector('[data-carrossel]');
  if (!raiz) return;
  var itens = [].slice.call(raiz.querySelectorAll('.carrossel__item'));
  var pontos = [].slice.call(raiz.querySelectorAll('.carrossel__ponto'));
  if (itens.length < 2) return;
  var atual = 0, relogio = null;
  var pouco = matchMedia('(prefers-reduced-motion: reduce)').matches;

  function mostrar(i) {
    atual = (i + itens.length) % itens.length;
    itens.forEach(function (f, j) {
      if (j === atual) f.setAttribute('data-atual', ''); else f.removeAttribute('data-atual');
    });
    pontos.forEach(function (p, j) { p.classList.toggle('is-on', j === atual); });
  }
  function andar() { if (!pouco) relogio = setInterval(function () { mostrar(atual + 1); }, 5000); }
  function parar() { if (relogio) { clearInterval(relogio); relogio = null; } }
  function irPara(i) { parar(); mostrar(i); andar(); }

  raiz.querySelector('[data-antes]').addEventListener('click', function () { irPara(atual - 1); });
  raiz.querySelector('[data-depois]').addEventListener('click', function () { irPara(atual + 1); });
  pontos.forEach(function (p, i) { p.addEventListener('click', function () { irPara(i); }); });
  raiz.addEventListener('mouseenter', parar);
  raiz.addEventListener('mouseleave', andar);
  raiz.addEventListener('keydown', function (e) {
    if (e.key === 'ArrowLeft') { e.preventDefault(); irPara(atual - 1); }
    if (e.key === 'ArrowRight') { e.preventDefault(); irPara(atual + 1); }
  });
  mostrar(0);
  andar();
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
