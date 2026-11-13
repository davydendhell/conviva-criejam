/* Conviva prototype demo helpers. Required-field checks are bypassed only in this local demo flow. */
(() => {
  if (typeof S === 'undefined' || typeof render !== 'function') return;

  const DEMO_CONDO = {
    nome: 'Condomínio Residencial Jardim das Mangueiras',
    cnpj: '12.345.678/0001-90',
    endereco: 'Rua das Mangueiras, 120, Boa Viagem, Recife',
    unidades: '64', sindico: 'Ana Beatriz Souza',
    email: 'sindico@jardimdasmangueiras.example', telefone: '(81) 99999-0000',
    ata: 'ata-exemplo-demo.pdf', dataAta: '2026-10-30'
  };
  const DEMO_PEOPLE = [
    { nome: 'Ana Beatriz Souza', funcao: 'Síndico(a)' },
    { nome: 'Carlos Eduardo Lima', funcao: 'Comissão de convivência' }
  ];
  const demoResponse = () => ({
    papel: 'afetado', tentou: 'conversa', conversa: 'sim', violencia: 'nao', reporterType: 'terceiro',
    p1nome: 'Mariana Oliveira', p1cpf: '111.111.111-11', p1uni: 'Bloco A, 302',
    p2nome: 'Rafael Santos', p2cpf: '222.222.222-22', p2uni: 'Bloco A, 402',
    mediador: DEMO_PEOPLE[1].nome,
    resumo: 'As partes conversaram sobre ruídos no período noturno e querem combinar horários de silêncio.',
    acomp: isoOf(new Date(hoje().getTime() + 30 * 864e5)),
    comp: [
      { t: 'Evitar música alta após as 22h.', q: 'Parte 2 · unidade 402', p: 'A partir de hoje' },
      { t: 'Avisar com antecedência sobre reuniões com convidados.', q: 'Parte 2 · unidade 402', p: 'Quando necessário' },
      { t: 'Conversar novamente se o combinado precisar de ajuste.', q: 'Ambas as partes', p: 'Em 30 dias' }
    ], t1: 'Joana Ribeiro', t2: 'Pedro Costa', pessoas: [], assinaturas: {}
  });

  function seedCondo() {
    const today = hoje(), expiry = new Date(today);
    expiry.setFullYear(expiry.getFullYear() + CONFIG.seloAnos);
    S.condo ||= { ...DEMO_CONDO, dataAdesao: isoOf(today) };
    S.cap ||= { turma: 't3', pessoas: DEMO_PEOPLE.map(person => ({ ...person })) };
    S.selo ||= { numero: `CONVIVA-${today.getFullYear()}-0049`, emissao: isoOf(today), validade: isoOf(expiry) };
    S.atend ||= [];
    S.seq ||= 0;
  }
  function setValue(id, value) {
    const element = document.getElementById(id);
    if (!element) return;
    element.value = value ?? '';
    element.dispatchEvent(new Event('input', { bubbles: true }));
    element.dispatchEvent(new Event('change', { bubbles: true }));
  }
  function fillScreen() {
    if (!S.perfil) return; // Keep the original Condomínio/Morador entry screen unchanged.
    if (S.view === 'adesao') {
      Object.entries({ 'a-nome': DEMO_CONDO.nome, 'a-cnpj': DEMO_CONDO.cnpj, 'a-end': DEMO_CONDO.endereco,
        'a-uni': DEMO_CONDO.unidades, 'a-sin': DEMO_CONDO.sindico, 'a-email': DEMO_CONDO.email,
        'a-tel': DEMO_CONDO.telefone, 'a-data': DEMO_CONDO.dataAta }).forEach(([id, value]) => setValue(id, value));
      const consent = document.getElementById('a-ok'); if (consent) consent.checked = true;
      const form = document.getElementById('f-adesao'); if (form) form.dataset.demoAttachment = 'true';
    } else if (S.view === 'capacitacao') {
      const radio = document.getElementById('tu-t3'); if (radio) radio.checked = true;
      S.capDraft = { turma: 't3', n: 2, pessoas: DEMO_PEOPLE.map(person => ({ ...person })) };
      setValue('c-n', 2);
      const holder = document.getElementById('c-pessoas'); if (holder) holder.innerHTML = pessoasFields(2);
      DEMO_PEOPLE.forEach((person, i) => { setValue(`p-n${i}`, person.nome); setValue(`p-f${i}`, person.funcao); });
    } else if (S.perfil === 'morador') {
      S.cons ||= { step: 0, sit: null, r: {} };
      S.cons.sit ||= 'barulho'; S.cons.r = { ...demoResponse(), ...(S.cons.r || {}) };
      if (S.cons.step === 0) S.cons.step = 1;
    } else if (S.view === 'simulador') {
      seedCondo();
      S.sim ||= { step: 0, sit: null, r: {} };
      if (!S.sim.step) S.sim.step = 1;
      S.sim.sit ||= 'barulho'; S.sim.r = { ...demoResponse(), ...(S.sim.r || {}) };
    } else {
      seedCondo();
    }
    save(); render();
  }

  // Keep the entry/profile-choice screen as-is; downstream screens stay reachable for the demo.
  const originalRenderChrome = renderChrome;
  renderChrome = function () {
    originalRenderChrome();
    document.querySelectorAll('#tabs [data-tab] .lock').forEach(lock => lock.remove());
  };
  const originalViewCapacitacao = viewCapacitacao;
  viewCapacitacao = function () { if (S.perfil === 'condominio' && S.view === 'capacitacao' && !S.condo) S.condo = { ...DEMO_CONDO, dataAdesao: isoOf(hoje()) }; return originalViewCapacitacao(); };
  const originalViewSelo = viewSelo;
  viewSelo = function () { if (S.perfil === 'condominio') seedCondo(); return originalViewSelo(); };
  const originalViewSimulador = viewSimulador;
  viewSimulador = function () { if (S.perfil === 'condominio') seedCondo(); return originalViewSimulador(); };
  const originalViewAcordos = viewAcordos;
  viewAcordos = function () { if (S.perfil === 'condominio') seedCondo(); return originalViewAcordos(); };
  const originalViewPainel = viewPainel;
  viewPainel = function () { seedCondo(); return originalViewPainel(); };

  // Demo progression: pressing a screen's existing confirm/continue button advances without required fields.
  // Substitute fictional examples only where the form would otherwise block the presentation.
  document.addEventListener('submit', event => {
    const form = event.target;
    if (!form || !['f-adesao', 'f-cap', 'f-at', 'f-termo'].includes(form.id)) return;
    event.preventDefault();
    event.stopImmediatePropagation();

    if (form.id === 'f-adesao') {
      const value = id => document.getElementById(id)?.value.trim() || '';
      S.condo = {
        nome: value('a-nome') || DEMO_CONDO.nome,
        cnpj: value('a-cnpj') || DEMO_CONDO.cnpj,
        endereco: value('a-end') || DEMO_CONDO.endereco,
        unidades: value('a-uni') || DEMO_CONDO.unidades,
        sindico: value('a-sin') || DEMO_CONDO.sindico,
        email: value('a-email') || DEMO_CONDO.email,
        telefone: value('a-tel') || DEMO_CONDO.telefone,
        ata: DEMO_CONDO.ata,
        dataAta: value('a-data') || DEMO_CONDO.dataAta,
        dataAdesao: isoOf(hoje())
      };
      S.view = 'capacitacao';
    } else if (form.id === 'f-cap') {
      const selected = form.querySelector('input[name="turma"]:checked')?.value || 't3';
      const count = Math.max(1, Math.min(CONFIG.maxTreinandos, Number(document.getElementById('c-n')?.value) || 2));
      const people = Array.from({ length: count }, (_, i) => ({
        nome: document.getElementById(`p-n${i}`)?.value.trim() || DEMO_PEOPLE[i % DEMO_PEOPLE.length].nome,
        funcao: document.getElementById(`p-f${i}`)?.value || DEMO_PEOPLE[i % DEMO_PEOPLE.length].funcao
      }));
      S.cap = { turma: selected, pessoas: people };
      S.capDraft = null;
      seedCondo();
    } else if (form.id === 'f-at') {
      const target = S.perfil === 'morador' ? S.cons : S.sim;
      target.r = { ...demoResponse(), ...(target.r || {}) };
      target.sit ||= 'barulho';
      target.step = 2;
      if (S.perfil === 'condominio') seedCondo();
    } else if (form.id === 'f-termo') {
      if (S.perfil === 'condominio') seedCondo();
      const target = S.sim;
      target.r = { ...demoResponse(), ...(target.r || {}) };
      target.sit ||= 'barulho';
      registrar('termo');
      target.step = 5;
    }
    save(); render();
  }, true);

  const originalRender = render;
  render = function () {
    originalRender();
    // No controls are added to the initial profile-choice screen.
    if (!S.perfil || app.querySelector('[data-demo-fill-control]')) return;
    app.insertAdjacentHTML('afterbegin', `<aside class="notice" data-demo-fill-control><div><strong>Demonstração</strong><p class="hint">Preenche esta etapa com dados fictícios. Também é possível avançar sem preencher.</p></div><button class="btn ghost small" type="button" data-fill-demo>Preencher com exemplo</button></aside>`);
    app.querySelector('[data-fill-demo]')?.addEventListener('click', fillScreen);
  };

  render();
})();
