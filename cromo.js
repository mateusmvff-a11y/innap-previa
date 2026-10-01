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

/* ============================================================
   Encontre sua formação
   Cinco perguntas, uma por vez, e uma primeira orientação no fim.
   Perguntas, opções e regras do resultado são as do protótipo
   v0.12, uma a uma. O que muda é só o desenho.
   ============================================================ */
(function orientador() {
  var raiz = document.querySelector('[data-orientador]');
  if (!raiz) return;
  var caixa = raiz.querySelector('[data-oc-caixa]');
  var passo = raiz.querySelector('[data-oc-passo]');
  var barra = raiz.querySelector('.orientador__progresso');
  var barraI = barra.querySelector('i');
  var resultado = raiz.querySelector('[data-oc-resultado]');

  var PASSOS = [
    { chave: 'school', titulo: 'Qual é sua escolaridade?', opcoes: [
      ['fundamental_incompleto', 'Ainda não concluí o Ensino Fundamental'],
      ['fundamental', 'Ensino Fundamental concluído'],
      ['medio_curso', 'Ensino Médio em curso'],
      ['medio', 'Ensino Médio completo'],
      ['graduacao_curso', 'Graduação em curso'],
      ['graduacao', 'Graduação concluída']
    ] },
    { chave: 'profile', titulo: 'Qual situação mais se aproxima da sua?', opcoes: [
      ['saude', 'Sou profissional da saúde'],
      ['terapeuta', 'Já atuo como terapeuta'],
      ['inicio', 'Quero iniciar uma nova área'],
      ['pessoal', 'Busco conhecimento pessoal']
    ] },
    { chave: 'goal', titulo: 'O que você quer encontrar agora?', dinamica: true },
    { chave: 'moment', titulo: 'Quando você imagina começar?', opcoes: [
      ['agora', 'Assim que possível'],
      ['meses', 'Nos próximos meses'],
      ['comparando', 'Estou comparando opções'],
      ['pesquisando', 'Estou apenas pesquisando'],
      ['ano', 'Talvez no próximo ano']
    ] },
    { chave: 'contact', titulo: 'Para receber calendário, investimento e orientação', contato: true }
  ];

  var respostas = {};
  var idx = 0;

  /* o terceiro passo depende da situação escolhida no segundo */
  function objetivos() {
    var p = respostas.profile;
    if (p === 'saude') return [
      ['orto', 'Estudar Terapia Ortomolecular'],
      ['nat', 'Fazer uma formação ampla em Naturopatia'],
      ['fito', 'Estudar Fitoterapia'],
      ['ampliar', 'Ampliar repertório de cuidado']
    ];
    if (p === 'terapeuta') return [
      ['nat', 'Organizar e ampliar minha formação com Naturopatia'],
      ['psi', 'Receber notícias da próxima turma de Psicanálise'],
      ['fito', 'Aprofundar Fitoterapia'],
      ['especifica', 'Conhecer outra área']
    ];
    return [
      ['florais', 'Começar por Florais'],
      ['irido', 'Conhecer Iridologia'],
      ['auriculo', 'Conhecer Auriculoterapia'],
      ['amplo', 'Construir um percurso mais amplo']
    ];
  }

  function el(tag, classe, texto) {
    var e = document.createElement(tag);
    if (classe) e.className = classe;
    if (texto) e.textContent = texto;
    return e;
  }

  function rolarAte(alvo) {
    var calmo = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
    var topo = alvo.getBoundingClientRect().top;
    if (topo < 80 || topo > innerHeight * 0.6) {
      alvo.scrollIntoView({ block: 'start', behavior: calmo ? 'auto' : 'smooth' });
    }
  }

  /* ---------------------------------------------------------- contato */
  function campo(rotulo, nome, atributos, opcional) {
    var l = el('label');
    var r = el('span', 'lead__rot', rotulo);
    if (opcional) {
      r.appendChild(document.createTextNode(' '));
      r.appendChild(el('span', 'lead__op', 'opcional'));
    }
    var i = el('input');
    i.name = nome;
    for (var a in atributos) { i.setAttribute(a, atributos[a]); }
    if (!opcional) i.required = true;
    l.appendChild(r);
    l.appendChild(i);
    return { rotulo: l, campo: i };
  }

  function formularioContato() {
    var f = el('form', 'lead__form orientador__contato');
    f.setAttribute('data-lead-form', '');
    f.noValidate = true;
    var nome = campo('Nome', 'nome', { type: 'text', autocomplete: 'name' }, false);
    var zap = campo('WhatsApp', 'whatsapp', { type: 'tel', inputmode: 'tel', autocomplete: 'tel' }, false);
    var mail = campo('E-mail', 'email', { type: 'email', autocomplete: 'email', inputmode: 'email' }, false);
    var prof = campo('Profissão', 'profissao', { type: 'text', autocomplete: 'organization-title' }, true);
    var cidade = campo('Cidade e estado', 'cidade', { type: 'text', autocomplete: 'address-level2' }, true);
    [nome, zap, mail, prof, cidade].forEach(function (c) { f.appendChild(c.rotulo); });

    /* telefone com DDD: dez a treze dígitos, em qualquer formatação */
    function conferirFone() {
      var n = zap.campo.value.split('').filter(function (c) { return c >= '0' && c <= '9'; }).length;
      zap.campo.setCustomValidity(zap.campo.value && (n < 10 || n > 13) ? 'Informe um telefone com DDD.' : '');
    }
    zap.campo.addEventListener('input', conferirFone);
    zap.campo.addEventListener('change', conferirFone);

    var enviar = el('button', 'btn btn-primary lead__enviar', 'Ver resultado');
    enviar.type = 'submit';
    f.appendChild(enviar);
    f.appendChild(el('p', 'lead__nota', 'Seus dados serão usados para responder a esta solicitação.'));

    if (window.innapLigarValidacao) window.innapLigarValidacao(f);
    f.addEventListener('submit', function (e) {
      e.preventDefault();
      conferirFone();
      if (!f.checkValidity()) return;
      concluir();
    });
    return f;
  }

  /* ---------------------------------------------------------- perguntas */
  function desenhar(comFoco) {
    var p = PASSOS[idx];
    var pct = Math.round((idx + 1) / PASSOS.length * 100);
    barraI.style.setProperty('--p', pct + '%');
    barra.setAttribute('aria-valuenow', String(pct));
    passo.textContent = '';
    var titulo = el('h2', 'orientador__titulo', p.titulo);
    titulo.tabIndex = -1;
    passo.appendChild(titulo);
    if (p.contato) {
      passo.appendChild(formularioContato());
    } else {
      var lista = el('div', 'orientador__opcoes');
      (p.dinamica ? objetivos() : p.opcoes).forEach(function (o) {
        var b = el('button', 'orientador__opcao', o[1]);
        b.type = 'button';
        b.addEventListener('click', function () {
          respostas[p.chave] = o[0];
          idx++;
          desenhar(true);
        });
        lista.appendChild(b);
      });
      passo.appendChild(lista);
    }
    if (comFoco) {
      titulo.focus({ preventScroll: true });
      /* a pergunta nova pode ser mais curta que a anterior: se o topo da
         caixa ficou escondido sob o cabeçalho, traz de volta */
      rolarAte(caixa);
    }
  }

  /* ---------------------------------------------------------- resultado */
  function concluir() {
    var r = respostas;
    var principal = 'Naturopatia';
    var outras = ['Fitoterapia', 'Iridologia'];
    var nota = 'A equipe confirmará a modalidade adequada à sua escolaridade.';
    if (r.school === 'fundamental_incompleto') {
      principal = 'Lista de espera'; outras = ['Conteúdos do INNAP'];
      nota = 'No momento, o cadastro será mantido para futuras formações adequadas ao seu momento.';
    } else if (r.goal === 'orto') {
      principal = 'Terapia Ortomolecular'; outras = ['Naturopatia', 'Fitoterapia'];
    } else if (r.goal === 'fito') {
      principal = 'Fitoterapia'; outras = ['Naturopatia', 'Terapia Ortomolecular'];
    } else if (r.goal === 'psi') {
      principal = 'Psicanálise'; outras = ['Naturopatia'];
      nota = 'A Psicanálise está com nova turma em planejamento. Seu contato entra na lista de interesse.';
    } else if (r.goal === 'florais') {
      principal = 'Florais'; outras = ['Iridologia', 'Auriculoterapia'];
    } else if (r.goal === 'irido') {
      principal = 'Iridologia'; outras = ['Florais', 'Auriculoterapia'];
    } else if (r.goal === 'auriculo') {
      principal = 'Auriculoterapia'; outras = ['Florais', 'Iridologia'];
    } else if (r.profile === 'saude') {
      principal = 'Terapia Ortomolecular'; outras = ['Naturopatia', 'Fitoterapia'];
    } else if (r.profile === 'terapeuta') {
      principal = 'Naturopatia'; outras = ['Psicanálise'];
    } else {
      principal = 'Florais'; outras = ['Iridologia'];
    }

    resultado.textContent = '';
    resultado.appendChild(el('span', 'orientador__selo', 'Primeira orientação'));
    var h = el('h2', 'orientador__titulo orientador__titulo--resultado', principal);
    h.tabIndex = -1;
    resultado.appendChild(h);
    resultado.appendChild(el('p', '', nota));

    var linha1 = el('p');
    linha1.appendChild(el('strong', '', 'Outras opções para comparar:'));
    linha1.appendChild(document.createTextNode(' ' + outras.join(', ')));
    resultado.appendChild(linha1);

    var linha2 = el('p');
    linha2.appendChild(el('strong', '', 'Taxa de inscrição:'));
    linha2.appendChild(document.createTextNode(' R$ 200 nas matrículas abertas.'));
    resultado.appendChild(linha2);

    var cta = el('div', 'orientador__cta');
    var a = el('a', 'btn btn-primary', 'Conversar com o comercial');
    a.href = 'contato.html';
    cta.appendChild(a);
    resultado.appendChild(cta);
    resultado.appendChild(el('p', 'orientador__nota', 'Durante o horário de atendimento, a equipe comercial trabalha com prazo de resposta de até 15 minutos. O horário ainda será confirmado para publicação.'));

    caixa.hidden = true;
    resultado.hidden = false;
    h.focus({ preventScroll: true });
    rolarAte(resultado);
  }

  desenhar(false);
})();

/* ============================================================
   Carrossel de fotos
   Setas, pontos, teclado e avanço automático que pausa no hover.
   ============================================================ */
(function carrossel() {
  [].forEach.call(document.querySelectorAll('[data-carrossel]'), montar);

  function montar(raiz) {
  // um trilho só se monta uma vez: montar duas vezes duplicaria de novo
  // a lista do trilho sem fim, e ela cresceria a cada chamada
  if (raiz.dataset.montado) return;
  raiz.dataset.montado = '1';
  var trilho = raiz.querySelector('[data-trilho]');
  var itens = [].slice.call(raiz.querySelectorAll('.carrossel__item'));
  var pontos = [].slice.call(raiz.querySelectorAll('[data-ir]'));
  var antes = raiz.querySelector('[data-antes]');
  var depois = raiz.querySelector('[data-depois]');
  var conta = raiz.querySelector('[data-conta]');
  if (!trilho || itens.length < 2) return;
  var suave = matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth';

  // ---------------------------------------------------------- sem fim
  // O trilho sem fim não tem ponta: a lista é duplicada e, quando a
  // rolagem passa da metade, volta a mesma distância para trás. Como as
  // duas metades são iguais, o olho não vê o salto e o começo aparece
  // logo depois do último cartão. O scroll-snap sai: ele brigaria com a
  // deriva contínua, puxando de volta para o encaixe a cada quadro.
  var semFim = raiz.hasAttribute('data-infinito');
  var clones = [];
  var volta = 0;
  if (semFim) {
    var copia = document.createDocumentFragment();
    itens.forEach(function (it) {
      var c = it.cloneNode(true);
      c.setAttribute('aria-hidden', 'true');
      [].forEach.call(c.querySelectorAll('a'), function (a) { a.setAttribute('tabindex', '-1'); });
      clones.push(c);
      copia.appendChild(c);
    });
    trilho.appendChild(copia);
    trilho.style.scrollSnapType = 'none';
    medirVolta();
  }

  // A distância da volta é a largura da lista original, medida do
  // primeiro item ao primeiro clone. Não dá para usar metade de
  // scrollWidth: o trilho tem recuo lateral, e esse recuo entra uma vez
  // só na largura total, então a metade cairia fora do encaixe e a volta
  // apareceria como um tranco.
  function medirVolta() {
    volta = clones.length ? clones[0].offsetLeft - itens[0].offsetLeft : 0;
  }
  // A volta para trás só vale enquanto a pessoa arrasta. Fora disso o
  // trilho parado no zero atendia a qualquer evento de rolagem saltando
  // 3199 pixels de uma vez, e esse era o "clique" que aparecia ao chegar
  // na seção. Para a frente a volta pode acontecer sempre: ela só é
  // alcançada por quem já andou até lá.
  function ajustarVolta() {
    if (!semFim || !volta || quadro) return;
    if (trilho.scrollLeft >= volta) trilho.scrollLeft -= volta;
    else if (arrastando && trilho.scrollLeft <= 0) trilho.scrollLeft = volta - 1;
  }
  // Qual item manda agora. Com um item por vez, é o que está no centro.
  // Com vários à vista ao mesmo tempo, como no trilho de professores, o
  // que manda é o primeiro da esquerda: senão o contador abriria em
  // "3 de 10" sem ninguém ter rolado nada.
  function umPorVez() {
    return itens[0].offsetWidth > trilho.clientWidth * 0.6;
  }
  // rolagem em que o item i assume. O trilho tem recuo lateral, então a
  // origem é o primeiro item, não zero.
  function posDe(i) {
    var base = itens[i].offsetLeft - itens[0].offsetLeft;
    if (!umPorVez()) return base;
    return base - (trilho.clientWidth - itens[i].offsetWidth) / 2;
  }
  function atual() {
    var melhor = 0, menor = Infinity;
    for (var i = 0; i < itens.length; i++) {
      var d = Math.abs(posDe(i) - trilho.scrollLeft);
      if (d < menor) { menor = d; melhor = i; }
    }
    return melhor;
  }

  function ir(i) {
    var j = Math.max(0, Math.min(itens.length - 1, i));
    trilho.scrollTo({ left: posDe(j), behavior: suave });
  }

  function marcar() {
    var i = atual();
    pontos.forEach(function (p, j) {
      if (j === i) p.setAttribute('aria-current', 'true'); else p.removeAttribute('aria-current');
    });
    if (conta) conta.textContent = i + 1;
    // nas pontas a seta desliga em vez de virar a volta: o trilho tem
    // começo e fim visíveis, dar a volta confunde
    if (antes) antes.disabled = !semFim && trilho.scrollLeft < 4;
    if (depois) depois.disabled = !semFim && trilho.scrollLeft + trilho.clientWidth >= trilho.scrollWidth - 4;
  }

  // No trilho sem fim não há ponto, contador nem seta para atualizar, e
  // a deriva escreve a rolagem a cada quadro: marcar ali seria medir o
  // layout sessenta vezes por segundo à toa.
  var temMarcador = pontos.length || conta || antes || depois;
  var espera = 0;
  trilho.addEventListener('scroll', function () {
    ajustarVolta();
    if (!temMarcador) return;
    if (espera) clearTimeout(espera);
    espera = setTimeout(marcar, 60);
  }, { passive: true });

  // Num trilho sem fim a seta anda a largura de um cartão, sem mirar
  // índice: o índice não quer dizer nada quando a lista se repete.
  function passoUmCartao(sentido) {
    parar();
    if (semFim) {
      var passo = itens[1] ? itens[1].offsetLeft - itens[0].offsetLeft : itens[0].offsetWidth;
      trilho.scrollBy({ left: sentido * passo, behavior: suave });
      setTimeout(andar, 900);
      return;
    }
    ir(atual() + sentido);
  }
  if (antes) antes.addEventListener('click', function () { passoUmCartao(-1); });
  if (depois) depois.addEventListener('click', function () { passoUmCartao(1); });
  pontos.forEach(function (p, i) { p.addEventListener('click', function () { parar(); ir(i); }); });
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
    parar();
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
    trilho.style.scrollSnapType = semFim ? 'none' : '';
    // num trilho sem fim não há encaixe: soltar não puxa para cartão nenhum
    if (!semFim) ir(atual());
    ajustarVolta();
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

  // Rolagem automática, quando o trilho pede (data-auto). Para no hover,
  // no foco do teclado, no arrasto e quando a seção sai da tela. Quem
  // pediu menos movimento no sistema não recebe rotação nenhuma.
  var relogio = null;
  var pouco = matchMedia('(prefers-reduced-motion: reduce)').matches;
  var querAuto = raiz.hasAttribute('data-auto') && !pouco;

  // Trilho sem fim: deriva contínua, um fio de pixel por quadro, em vez
  // de pular de cartão em cartão de tempos em tempos. O movimento nunca
  // encosta numa ponta, porque a lista é duplicada e a volta acontece na
  // metade, onde as duas cópias coincidem.
  // A posição é guardada aqui em ponto flutuante, e só depois escrita no
  // elemento. Somar direto em trilho.scrollLeft não funciona: o
  // navegador arredonda a cada leitura, e com 0,7 pixel por quadro o
  // arredondamento comia o avanço. Daí o trilho ou travava de vez ou
  // andava aos solavancos de um pixel.
  var porSegundo = 42;
  var quadro = null, ultimoQuadro = 0, pos = 0;

  function derivar(t) {
    if (!ultimoQuadro) ultimoQuadro = t;
    var dt = t - ultimoQuadro;
    ultimoQuadro = t;
    // um quadro perdido (aba em segundo plano, arrasto de janela) não
    // vira um salto: o passo máximo é o de uns quatro quadros
    if (dt > 64) dt = 64;
    pos += porSegundo * dt / 1000;
    if (volta && pos >= volta) pos -= volta;
    trilho.scrollLeft = pos;
    quadro = requestAnimationFrame(derivar);
  }
  function andar() {
    if (!querAuto) return;
    if (semFim) {
      if (quadro) return;
      // a deriva retoma de onde o trilho está agora, não de onde ela
      // parou: entre uma coisa e outra a pessoa pode ter arrastado
      pos = trilho.scrollLeft;
      ultimoQuadro = 0;
      quadro = requestAnimationFrame(derivar);
      return;
    }
    if (relogio) return;
    relogio = setInterval(function () {
      // A volta é decidida pela rolagem, não pelo índice: com vários
      // cartões à vista o último índice alcançável não é o último item.
      var noFim = trilho.scrollLeft + trilho.clientWidth >= trilho.scrollWidth - 8;
      ir(noFim ? 0 : atual() + 1);
    }, 3600);
  }
  function parar() {
    // uma retomada pendente não pode ressuscitar a deriva com o ponteiro
    // ainda em cima do trilho
    if (retomada) { clearTimeout(retomada); retomada = null; }
    if (relogio) { clearInterval(relogio); relogio = null; }
    if (quadro) { cancelAnimationFrame(quadro); quadro = null; }
  }
  // A deriva escreve a rolagem a cada quadro. Se a pessoa rolar o
  // trilho por fora do arrasto, com o trackpad ou com o dedo, a deriva
  // desfaria o gesto no quadro seguinte e o trilho brigaria com a mão.
  // Nesses dois casos ela sai do caminho e volta um instante depois.
  var retomada = null;
  function pausarUmPouco() {
    parar();
    if (retomada) clearTimeout(retomada);
    retomada = setTimeout(andar, 1200);
  }

  if (querAuto) {
    trilho.addEventListener('wheel', pausarUmPouco, { passive: true });
    trilho.addEventListener('touchstart', parar, { passive: true });
    trilho.addEventListener('touchend', pausarUmPouco, { passive: true });
    // Começa junto com a página e não para mais. Antes havia um
    // observador que pausava a rotação fora da tela: o resultado era
    // que o trilho ficava parado até a pessoa chegar nele, e só então
    // arrancava do zero. Fora da tela o próprio navegador já segura os
    // quadros, então não havia nada a economizar. O que sobra é o que
    // interessa: quando a pessoa chega na seção, o carrossel já está
    // andando há um tempo.
    andar();
    raiz.addEventListener('pointerenter', parar);
    raiz.addEventListener('pointerleave', andar);
    raiz.addEventListener('focusin', parar);
    raiz.addEventListener('focusout', function (e) {
      if (!raiz.contains(e.relatedTarget)) andar();
    });
  }

  addEventListener('resize', function () { medirVolta(); marcar(); });
  // as fotos entram depois do HTML: a medida da volta é refeita quando
  // tudo terminou de carregar, senão ela pode sair de um layout provisório
  addEventListener('load', medirVolta);
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
    '.anchor,.cta-final,.final,.tempo-sec,.abas__lista,' +
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

  /* Liga a validação a um formulário. O assistente de orientação cria o
     seu passo de contato depois que a página carrega, então ele chama
     esta mesma função em vez de ter uma validação própria. */
  function ligar(form) {
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
  }
  [].forEach.call(forms, ligar);
  window.innapLigarValidacao = ligar;
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
