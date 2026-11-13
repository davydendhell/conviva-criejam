/* Per-screen fictional sample data for fast prototype walkthroughs.
   The welcome screen is unchanged; sample records are not real personal data. */
(() => {
  if (typeof S === 'undefined' || typeof render !== 'function') return;

  const DEMO_CONDO = {
    nome: 'Condomínio Residencial Jardim das Mangueiras',
    cnpj: '12.345.678/0001-90',
    endereco: 'Rua das Mangueiras, 120, Boa Viagem, Recife',
    unidades: '64',
    sindico: 'Ana Beatriz Souza',
    email: 'sindico@jardimdasmangueiras.example',
    telefone: '(81) 99999-0000',
    ata: 'ata-exemplo-demo.pdf',
    dataAta: '2026-10-30'
  };
  const DEMO_PEOPLE = [
    { nome: 'Ana Beatriz Souza', funcao: 'Síndico(a)' },
    { nome: 'Carlos Eduardo Lima', funcao: 'Comissão de convivência' }
  ];
  const demoResponse = () => ({
    papel: 'afetado', tentou: 'conversa', conversa: 'sim', violencia: 'nao',
    reporterType: 'terceiro',
    p1nome: 'Mariana Oliveira', p1cpf: '111.111.111-11', p1uni: 'Bloco A, 302',
    p2nome: 'Rafael Santos', p2cpf: '222.222.222-22', p2uni: 'Bloco A, 402',
    mediador: DEMO_PEOPLE[1].nome,
    resumo: 'As partes conversaram sobre ruídos no período noturno e querem combinar horários de silêncio.',
    acomp: isoOf(new Date(hoje().getTime() + 30 * 864e5)),
    comp: [
      { t: 'Evitar música alta após as 22h.', q: 'Parte 2 · unidade 402', p: 'A partir de hoje' },
      { t: 'Avisar com antecedência sobre reuniões com convidados.', q: 'Parte 2 · unidade 402', p: 'Quando necessário' },
      { t: 'Conversar novamente se o combinado precisar de ajuste.', q: 'Ambas as partes', p: 'Em 30 dias' }
    ],
    t1: 'Joana Ribeiro', t2: 'Pedro Costa', pessoas: [], assinaturas: {}
  });

  function seedDemoData() {
    const today = hoje();
    const expiry = new Date(today);
    expiry.setFullYear(expiry.getFullYear() + CONFIG.seloAnos);
    S.condo ||= { ...DEMO_CONDO, dataAdesao: isoOf(today) };
    S.cap ||= { turma: 't3', pessoas: DEMO_PEOPLE.map(person => ({ ...person })) };
    S.selo ||= {
      numero: `CONVIVA-${today.getFullYear()}-0049`,
      emissao: isoOf(today),
      validade: isoOf(expiry)
    };
    S.atend ||= [];
    if (!S.atend.length) {
      const sample = demoResponse();
      S.atend.push({
        id: 'demo-atendimento-001', numero: `001/${today.getFullYear()}`,
        data: isoOf(today), sit: 'barulho', caminho: 'termo',
        ...sample,
        risco: false,
        status: 'Em acompanhamento'
      });
    }
    S.seq = Math.max(Number(S.seq) || 0, S.atend.length);
  }

  function seedPrerequisitesFor(view) {
    if (S.perfil !== 'condominio') return;
    if (view === 'capacitacao') {
      S.condo ||= { ...DEMO_CONDO, dataAdesao: isoOf(hoje()) };
      return;
    }
    if (['selo', 'simulador', 'acordos', 'painel'].includes(view)) seedDemoData();
  }

  function setValue(id, value) {
    const input = document.getElementById(id);
    if (!input) return;
    input.value = value ?? '';
    input.dispatchEvent(new Event('input', { bubbles: true }));
    input.dispatchEvent(new Event('change', { bubbles: true }));
  }
  function setRadio(name, value) {
    document.querySelectorAll(`input[type="radio"][name="${name}"]`).forEach(input => {
      input.checked = input.value === value;
      if (input.checked) input.dispatchEvent(new Event('change', { bubbles: true }));
    });
  }

  function fillScreenWithDemoData() {
    const view = S.perfil === 'morador' ? 'morador' : S.view;

    if (!S.perfil) return; // Do not change the original profile chooser.

    if (view === 'adesao') {
      const form = document.getElementById('f-adesao');
      if (!form) { seedDemoData(); save(); render(); return; }
      Object.entries({
        'a-nome': DEMO_CONDO.nome, 'a-cnpj': DEMO_CONDO.cnpj,
        'a-end': DEMO_CONDO.endereco, 'a-uni': DEMO_CONDO.unidades,
        'a-sin': DEMO_CONDO.sindico, 'a-email': DEMO_CONDO.email,
        'a-tel': DEMO_CONDO.telefone, 'a-data': DEMO_CONDO.dataAta
      }).forEach(([id, value]) => setValue(id, value));
      const consent = document.getElementById('a-ok');
      if (consent) consent.checked = true;
      form.dataset.demoAttachment = 'true';
      return;
    }

    if (view === 'capacitacao') {
      seedPrerequisitesFor('capacitacao');
      const form = document.getElementById('f-cap');
      if (!form) { S.cap = { turma: 't3', pessoas: DEMO_PEOPLE.map(person => ({ ...person })) }; save(); render(); return; }
      const radio = document.getElementById('tu-t3');
      if (radio) radio.checked = true;
      S.capDraft = { turma: 't3', n: 2, pessoas: DEMO_PEOPLE.map(person => ({ ...person })) };
      setValue('c-n', 2);
      const holder = document.getElementById('c-pessoas');
      if (holder) holder.innerHTML = pessoasFields(2);
      DEMO_PEOPLE.forEach((person, index) => {
        setValue(`p-n${index}`, person.nome);
        setValue(`p-f${index}`, person.funcao);
      });
      return;
    }

    if (view === 'morador') {
      if (S.cons.step === 0) {
        S.cons = { step: 1, sit: 'barulho', r: demoResponse() };
        save(); render();
        return;
      }
      S.cons.sit ||= 'barulho';
      S.cons.r = { ...demoResponse(), ...(S.cons.r || {}) };
      ['papel', 'tentou', 'conversa', 'violencia'].forEach(key => setRadio(key, S.cons.r[key]));
      const reporter = document.getElementById('reporterType');
      if (reporter) reporter.value = S.cons.r.reporterType;
      save(); render();
      return;
    }

    if (view === 'simulador') {
      seedPrerequisitesFor('simulador');
      S.sim ||= { step: 0, sit: null, r: {} };
      if (S.sim.step === 0) S.sim.step = 1;
      S.sim.sit ||= 'barulho';
      S.sim.r = { ...demoResponse(), ...(S.sim.r || {}) };
      ['papel', 'tentou', 'conversa', 'violencia'].forEach(key => setRadio(key, S.sim.r[key]));
      ['reporterType'].forEach(key => setValue(key, S.sim.r[key]));
      save(); render();
      return;
    }

    if (['inicio', 'selo', 'acordos', 'painel'].includes(view)) {
      seedDemoData();
      save(); render();
      return;
    }

    if (view === 'adesao' || view === 'capacitacao') return;
    seedDemoData();
    save(); render();
  }

  // Make downstream screens directly reachable for prototype walkthroughs.
  const originalRenderChrome = renderChrome;
  renderChrome = function () {
    originalRenderChrome();
    document.querySelectorAll('#tabs [data-tab] .lock').forEach(lock => lock.remove());
  };

  const originalViewCapacitacao = viewCapacitacao;
  viewCapacitacao = function () {
    seedPrerequisitesFor('capacitacao');
    return originalViewCapacitacao();
  };
  const originalViewSelo = viewSelo;
  viewSelo = function () {
    seedPrerequisitesFor('selo');
    return originalViewSelo();
  };
  const originalViewSimulador = viewSimulador;
  viewSimulador = function () {
    if (!consulta()) seedPrerequisitesFor('simulador');
    return originalViewSimulador();
  };
  const originalViewAcordos = viewAcordos;
  viewAcordos = function () {
    seedPrerequisitesFor('acordos');
    return originalViewAcordos();
  };
  const originalViewPainel = viewPainel;
  viewPainel = function () {
    seedDemoData();
    return originalViewPainel();
  };

  // Allow the sample-only attachment to pass the mock enrollment form without uploading a real file.
  if (!window.__convivaDemoSubmitHandler) {
    window.__convivaDemoSubmitHandler = event => {
      const form = event.target;
      if (form?.id !== 'f-adesao' || form.dataset.demoAttachment !== 'true') return;
      event.preventDefault();
      event.stopImmediatePropagation();
      const value = id => document.getElementById(id)?.value.trim() || '';
      S.condo = {
        nome: value('a-nome'), cnpj: value('a-cnpj'), endereco: value('a-end'),
        unidades: value('a-uni'), sindico: value('a-sin'), email: value('a-email'),
        telefone: value('a-tel'), ata: DEMO_CONDO.ata, dataAta: value('a-data'), dataAdesao: isoOf(hoje())
      };
      save(); go('capacitacao');
    };
    document.addEventListener('submit', window.__convivaDemoSubmitHandler, true);
  }

  const originalRender = render;
  render = function () {
    originalRender();
    // Preserve the entry screen exactly; show one quick-fill control on each screen after profile selection.
    if (!S.perfil || app.querySelector('[data-demo-fill-control]')) return;
    app.insertAdjacentHTML('afterbegin', `<aside class="notice" data-demo-fill-control><div><strong>Modo de demonstração</strong><p class="hint">Preenche esta etapa com dados de exemplo para agilizar a apresentação. Os dados são fictícios.</p></div><button class="btn ghost small" type="button" data-fill-demo>Preencher esta tela</button></aside>`);
    app.querySelector('[data-fill-demo]')?.addEventListener('click', fillScreenWithDemoData);
  };

  // Save the reporter selection inside the current draft.
  const originalBind = bind;
  bind = function () {
    originalBind();
    const reporter = app.querySelector('#reporterType');
    if (reporter) reporter.addEventListener('change', () => { sim().r.reporterType = reporter.value; save(); });
  };

  render();
})();
