/* Dados de demonstração e fluxo de revisão/aceites. Este protótipo não autentica assinaturas nem transmite dados ao CEJUSC. */
(() => {
  if (typeof S === 'undefined' || typeof render !== 'function') return;
  const condoDemo = {
    nome: 'Condomínio Residencial Jardim das Mangueiras', cnpj: '12.345.678/0001-90',
    endereco: 'Rua das Mangueiras, 120, Boa Viagem, Recife', unidades: '64',
    sindico: 'Ana Beatriz Souza', email: 'sindico@jardimdasmangueiras.example',
    telefone: '(81) 99999-0000', ata: 'ata-exemplo-demo.pdf', dataAta: '2026-10-30', dataAdesao: isoOf(hoje())
  };
  const mediadoresDemo = [
    { nome: 'Ana Beatriz Souza', funcao: 'Síndico(a)' },
    { nome: 'Carlos Eduardo Lima', funcao: 'Comissão de convivência' }
  ];
  const fakeFile = () => {
    const input = document.getElementById('a-ata');
    if (!input || typeof DataTransfer === 'undefined') return;
    try {
      const transfer = new DataTransfer();
      transfer.items.add(new File(['Arquivo fictício para demonstração.'], 'ata-exemplo-demo.pdf', { type: 'application/pdf' }));
      input.files = transfer.files;
    } catch (_) {}
  };
  const sampleR = () => ({
    papel: 'afetado', tentou: 'conversa', conversa: 'sim', violencia: 'nao',
    p1nome: 'Mariana Oliveira', p1cpf: '111.111.111-11', p1uni: 'Bloco A, 302',
    p2nome: 'Rafael Santos', p2cpf: '222.222.222-22', p2uni: 'Bloco A, 402',
    mediador: mediadoresDemo[1].nome, resumo: 'As partes conversaram sobre ruídos no período noturno e querem combinar horários de silêncio.',
    acomp: isoOf(new Date(hoje().getTime() + 30 * 864e5)),
    comp: [
      { t: 'Evitar música alta após as 22h.', q: 'Parte 2 · unidade 402', p: 'A partir de hoje' },
      { t: 'Avisar com antecedência sobre reuniões com convidados.', q: 'Parte 2 · unidade 402', p: 'Quando necessário' },
      { t: 'Conversar novamente se o combinado precisar de ajuste.', q: 'Ambas as partes', p: 'Em 30 dias' }
    ], t1: 'Joana Ribeiro', t2: 'Pedro Costa', assinaturas: {}
  });

  function ensureBase() {
    S.perfil = 'condominio'; S.condo ||= { ...condoDemo };
    S.cap ||= { turma: 't3', pessoas: mediadoresDemo.map(p => ({ ...p })) };
    if (!S.selo) {
      const today = hoje(), expiry = new Date(today); expiry.setFullYear(expiry.getFullYear() + CONFIG.seloAnos);
      S.selo = { numero: `CONVIVA-${today.getFullYear()}-0049`, emissao: isoOf(today), validade: isoOf(expiry) };
    }
  }
  function loadJourney() {
    ensureBase(); S.view = 'simulador'; S.sim = { step: 0, sit: 'barulho', r: sampleR() };
    S.cons = { step: 0, sit: null, r: {} }; save(); render();
  }
  function fillCurrentScreen() {
    const formAd = document.getElementById('f-adesao');
    if (formAd) {
      const vals = { 'a-nome': condoDemo.nome, 'a-cnpj': condoDemo.cnpj, 'a-end': condoDemo.endereco, 'a-uni': condoDemo.unidades, 'a-sin': condoDemo.sindico, 'a-email': condoDemo.email, 'a-tel': condoDemo.telefone, 'a-data': condoDemo.dataAta };
      Object.entries(vals).forEach(([id, value]) => { const el = document.getElementById(id); if (el) el.value = value; });
      const consent = document.getElementById('a-ok'); if (consent) consent.checked = true;
      fakeFile(); return;
    }
    const formCap = document.getElementById('f-cap');
    if (formCap) {
      const radio = document.getElementById('tu-t3'); if (radio) radio.checked = true;
      const count = document.getElementById('c-n'); if (count) count.value = '2';
      S.capDraft = { turma: 't3', n: 2, pessoas: mediadoresDemo.map(p => ({ ...p })) };
      const holder = document.getElementById('c-pessoas'); if (holder) holder.innerHTML = pessoasFields(2);
      return;
    }
    if (S.perfil === 'morador') {
      S.cons = { step: 1, sit: 'barulho', r: sampleR() }; render(); return;
    }
    ensureBase();
    const r = sampleR();
    if (S.view === 'simulador' || !S.view) {
      const step = S.sim?.step ?? 0;
      S.sim = { step: step === 0 ? 1 : step, sit: S.sim?.sit || 'barulho', r: { ...r, ...(S.sim?.r || {}) } };
      render(); return;
    }
    if (S.view === 'adesao') { S.condo = { ...condoDemo }; render(); return; }
    if (S.view === 'capacitacao') {
      S.cap ||= { turma: 't3', pessoas: mediadoresDemo.map(p => ({ ...p })) }; render(); return;
    }
    if (S.view === 'selo') { render(); return; }
    if (S.view === 'acordos' && !S.atend.length) {
      const today = isoOf(hoje()); S.atend = [{ id: 'demo-atendimento', numero: `000/${hoje().getFullYear()}`, data: today, sit: 'barulho', caminho: 'termo', ...r, status: 'Em acompanhamento' }];
      save(); render(); return;
    }
    S.sim = { step: 1, sit: 'barulho', r }; S.view = 'simulador'; render();
  }

  const originalViewTermoForm = viewTermoForm;
  const originalViewTermoEmitido = viewTermoEmitido;
  viewTermoForm = () => originalViewTermoForm().replace('<button class="btn" type="submit">Emitir termo</button>', '<button class="btn" type="button" data-review-agreement>Revisar termo</button>');

  function draftAgreement() {
    const r = sim().r;
    return { id: 'rascunho', numero: `RASCUNHO/${hoje().getFullYear()}`, data: isoOf(hoje()), sit: sim().sit, outroTxt: r.outroTxt, caminho: 'termo',
      p1nome: r.p1nome, p1cpf: r.p1cpf, p1uni: r.p1uni, p2nome: r.p2nome, p2cpf: r.p2cpf, p2uni: r.p2uni,
      mediador: r.mediador, resumo: r.resumo || '', comp: r.comp || [], risco: r.violencia === 'sim', pessoas: r.pessoas || [],
      acomp: r.acomp || isoOf(hoje()), t1: r.t1, t2: r.t2 };
  }
  function reviewScreen() {
    return `${subSteps(3)}<h1>Revise o termo antes de assinar</h1><p class="lead">Confira os dados, compromissos e prazos com as partes.</p>
      <div class="notice warn"><strong>Fluxo demonstrativo</strong><span>As assinaturas e o encaminhamento abaixo são simulados. Nenhuma assinatura é validada e nenhum dado é transmitido.</span></div>
      ${termoHtml(draftAgreement())}<div class="actions"><button class="btn ghost" data-edit-agreement>Voltar e editar</button><button class="btn" data-continue-sign>Continuar para assinaturas</button></div>`;
  }
  function signatureScreen() {
    const r = sim().r, signatures = r.assinaturas || {};
    const people = [['p1', r.p1nome || 'Parte 1'], ['p2', r.p2nome || 'Parte 2'], ['t1', r.t1 || 'Testemunha 1'], ['t2', r.t2 || 'Testemunha 2']];
    const cards = people.map(([key, name]) => `<div class="pessoa"><div class="pessoa-top"><strong>${esc(name)}</strong>${signatures[key] ? '<span class="pill acordo">Aceite demonstrativo registrado</span>' : '<span class="pill warn">Pendente</span>'}</div>
      ${signatures[key] ? `<p class="hint">Registrado localmente em ${esc(signatures[key])}.</p>` : `<button class="btn small" type="button" data-sign-as="${key}">Assinar como ${esc(name)}</button>`}</div>`).join('');
    const signed = people.every(([key]) => signatures[key]);
    return `${subSteps(3)}<h1>Registro de assinaturas</h1><p class="lead">Cada pessoa pode registrar seu aceite demonstrativo.</p>
      <div class="notice warn"><strong>Não é assinatura eletrônica válida</strong><span>Não use dados ou assinaturas reais. O registro fica apenas neste navegador.</span></div>
      <div class="stack">${cards}</div><div class="actions"><button class="btn ghost" data-back-review>Voltar à revisão</button><button class="btn" data-send-cejusc ${signed ? '' : 'disabled'}>Enviar para o CEJUSC</button></div>`;
  }
  function sentScreen() {
    const a = S.atend.find(item => item.id === S.ultimo);
    if (!a) return originalViewTermoEmitido();
    return `<div class="notice ok"><strong>Etapa final demonstrativa concluída</strong><span>Termo ${esc(a.numero)} marcado como enviado ao CEJUSC no protótipo.</span></div>
      <div class="confirma" role="status">ENVIO SIMULADO — NENHUM DOCUMENTO FOI TRANSMITIDO</div>${termoHtml(a)}
      <div class="actions"><button class="btn" id="copiar-termo">Copiar termo</button><span class="toast" id="copiar-msg" hidden>Termo copiado.</span><button class="btn ghost" data-go="acordos">Ver atendimentos</button><button class="btn ghost" id="novo-at">Novo atendimento</button></div>`;
  }

  const originalViewSim = viewSimulador;
  viewSimulador = function () {
    if (!consulta()) {
      if (sim().step === 6) return reviewScreen();
      if (sim().step === 7) return signatureScreen();
      if (sim().step === 8) return sentScreen();
    }
    return originalViewSim();
  };
  viewTermoEmitido = function () { return sim().step === 8 ? sentScreen() : originalViewTermoEmitido(); };

  const originalRender = render;
  render = function () {
    originalRender();
    if (!app.querySelector('[data-demo-controls]')) app.insertAdjacentHTML('afterbegin', `<aside class="notice warn" data-demo-controls><strong>Dados fictícios para teste</strong><span>Use os botões para preencher automaticamente a tela atual ou carregar a jornada completa.</span><div class="actions"><button class="btn small" type="button" data-fill-screen>Preencher esta tela</button><button class="btn ghost small" type="button" data-load-journey>Carregar jornada completa</button></div></aside>`);
    app.querySelectorAll('[data-fill-screen]').forEach(button => button.addEventListener('click', fillCurrentScreen));
    app.querySelectorAll('[data-load-journey]').forEach(button => button.addEventListener('click', loadJourney));
    const review = app.querySelector('[data-review-agreement]');
    if (review) review.addEventListener('click', () => {
      const r = sim().r, get = id => document.getElementById(id)?.value.trim() || '';
      ['p1nome','p1cpf','p1uni','p2nome','p2cpf','p2uni','mediador','acomp','resumo','t1','t2'].forEach(key => r[key] = get(key));
      r.comp = [0,1,2].map(i => ({ t: get(`c${i}t`), q: get(`c${i}q`), p: get(`c${i}p`) }));
      const error = document.getElementById('t-err');
      if (!r.p1nome || !r.p2nome || !r.comp.some(x => x.t)) { error.textContent = 'Informe os nomes das partes e ao menos um compromisso.'; error.hidden = false; return; }
      if ([r.p1cpf, r.p2cpf].some(c => c.replace(/\\D/g, '').length !== 11)) { error.textContent = 'Informe CPFs fictícios com 11 dígitos para as duas partes.'; error.hidden = false; return; }
      r.assinaturas = {}; sim().step = 6; save(); render();
    });
    app.querySelectorAll('[data-edit-agreement]').forEach(b => b.addEventListener('click', () => { sim().step = 4; save(); render(); }));
    app.querySelectorAll('[data-continue-sign]').forEach(b => b.addEventListener('click', () => { sim().step = 7; save(); render(); }));
    app.querySelectorAll('[data-back-review]').forEach(b => b.addEventListener('click', () => { sim().step = 6; save(); render(); }));
    app.querySelectorAll('[data-sign-as]').forEach(b => b.addEventListener('click', () => { const r = sim().r; r.assinaturas ||= {}; r.assinaturas[b.dataset.signAs] = new Date().toLocaleString('pt-BR'); save(); render(); }));
    app.querySelectorAll('[data-send-cejusc]').forEach(b => b.addEventListener('click', () => {
      const r = sim().r;
      if (!['p1','p2','t1','t2'].every(key => r.assinaturas?.[key])) return;
      registrar('termo');
      const a = S.atend.find(item => item.id === S.ultimo);
      a.assinaturas = { ...r.assinaturas }; a.enviadoCejusc = isoOf(hoje()); a.status = 'Assinado · envio demonstrativo';
      S.sim.step = 8; save(); render();
    }));
    const demoEntry = app.querySelector('#demo');
    if (demoEntry) demoEntry.addEventListener('click', loadJourney);
    const adesao = document.getElementById('f-adesao');
    if (adesao && !adesao.dataset.demoGuard) {
      adesao.dataset.demoGuard = '1';
      adesao.addEventListener('submit', event => {
        if (document.getElementById('a-ata')?.files?.length) return;
        if (!adesao.dataset.demoFile) return;
        event.preventDefault();
        const get = id => document.getElementById(id).value.trim();
        S.condo = { nome: get('a-nome'), cnpj: get('a-cnpj'), endereco: get('a-end'), unidades: get('a-uni'), sindico: get('a-sin'), email: get('a-email'), telefone: get('a-tel'), ata: 'ata-exemplo-demo.pdf', dataAta: get('a-data'), dataAdesao: isoOf(hoje()) };
        save(); go('capacitacao');
      }, true);
    }
    app.querySelectorAll('[data-fill-screen]').forEach(button => button.addEventListener('click', () => { if (adesao) adesao.dataset.demoFile = 'true'; }));
  };
  render();
})();
