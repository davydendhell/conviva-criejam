/* Dados fictícios para facilitar a navegação no protótipo. Assinaturas/envio são demonstrativos. */
(() => {
  if (typeof S === 'undefined' || typeof render !== 'function') return;

  const DEMO_CONDO = {
    nome: 'Condomínio Residencial Jardim das Mangueiras', cnpj: '12.345.678/0001-90',
    endereco: 'Rua das Mangueiras, 120, Boa Viagem, Recife', unidades: '64',
    sindico: 'Ana Beatriz Souza', email: 'sindico@jardimdasmangueiras.example',
    telefone: '(81) 99999-0000', ata: 'ata-exemplo-demo.pdf', dataAta: '2026-10-30', dataAdesao: isoOf(hoje())
  };
  const DEMO_PEOPLE = [
    { nome: 'Ana Beatriz Souza', funcao: 'Síndico(a)' },
    { nome: 'Carlos Eduardo Lima', funcao: 'Comissão de convivência' }
  ];
  const demoResponse = () => ({
    papel: 'afetado', tentou: 'conversa', conversa: 'sim', violencia: 'nao',
    p1nome: 'Mariana Oliveira', p1cpf: '111.111.111-11', p1uni: 'Bloco A, 302',
    p2nome: 'Rafael Santos', p2cpf: '222.222.222-22', p2uni: 'Bloco A, 402',
    mediador: DEMO_PEOPLE[1].nome,
    resumo: 'As partes conversaram sobre ruídos no período noturno e querem combinar horários de silêncio.',
    acomp: isoOf(new Date(hoje().getTime() + 30 * 864e5)),
    comp: [
      { t: 'Evitar música alta após as 22h.', q: 'Parte 2 · unidade 402', p: 'A partir de hoje' },
      { t: 'Avisar com antecedência sobre reuniões com convidados.', q: 'Parte 2 · unidade 402', p: 'Quando necessário' },
      { t: 'Conversar novamente se o combinado precisar de ajuste.', q: 'Ambas as partes', p: 'Em 30 dias' }
    ], t1: 'Joana Ribeiro', t2: 'Pedro Costa', assinaturas: {}
  });

  function seedDemo() {
    const today = hoje(), expiry = new Date(today);
    expiry.setFullYear(expiry.getFullYear() + CONFIG.seloAnos);
    S.condo = { ...DEMO_CONDO };
    S.cap = { turma: 't3', pessoas: DEMO_PEOPLE.map(p => ({ ...p })) };
    S.selo = { numero: `CONVIVA-${today.getFullYear()}-0049`, emissao: isoOf(today), validade: isoOf(expiry) };
    S.sim ||= { step: 0, sit: null, r: {} };
    S.sim.sit ||= 'barulho';
    S.sim.r = { ...demoResponse(), ...(S.sim.r || {}) };
    S.cons ||= { step: 0, sit: null, r: {} };
    S.atend ||= [];
    if (!S.atend.length) {
      const r = demoResponse();
      S.atend.push({ id: 'demo-atendimento', numero: `001/${today.getFullYear()}`, data: isoOf(today), sit: 'barulho', caminho: 'termo',
        p1nome: r.p1nome, p1cpf: r.p1cpf, p1uni: r.p1uni, p2nome: r.p2nome, p2cpf: r.p2cpf, p2uni: r.p2uni,
        mediador: r.mediador, resumo: r.resumo, comp: r.comp, acomp: r.acomp, t1: r.t1, t2: r.t2, pessoas: [], risco: false,
        assinaturas: { p1: 'Demonstração', p2: 'Demonstração', t1: 'Demonstração', t2: 'Demonstração' },
        enviadoCejusc: isoOf(today), status: 'Envio demonstrativo concluído' });
    }
    S.seq = Math.max(Number(S.seq) || 0, S.atend.length);
  }

  function setValue(id, value) {
    const el = document.getElementById(id);
    if (el) { el.value = value; el.dispatchEvent(new Event('input', { bubbles: true })); el.dispatchEvent(new Event('change', { bubbles: true })); }
  }
  function fillScreen() {
    const route = S.view;
    seedDemo();
    if (!S.perfil) {
      // Preserve the existing welcome screen; this button is an optional shortcut into the example.
      S.perfil = 'condominio'; S.view = 'simulador'; S.sim.step = 1; S.sim.sit = 'barulho';
    } else if (route === 'adesao') {
      Object.entries({ 'a-nome': DEMO_CONDO.nome, 'a-cnpj': DEMO_CONDO.cnpj, 'a-end': DEMO_CONDO.endereco, 'a-uni': DEMO_CONDO.unidades,
        'a-sin': DEMO_CONDO.sindico, 'a-email': DEMO_CONDO.email, 'a-tel': DEMO_CONDO.telefone, 'a-data': DEMO_CONDO.dataAta }).forEach(([id, value]) => setValue(id, value));
      const consent = document.getElementById('a-ok'); if (consent) consent.checked = true;
    } else if (route === 'capacitacao') {
      const radio = document.getElementById('tu-t3'); if (radio) radio.checked = true;
      setValue('c-n', 2);
      S.capDraft = { turma: 't3', n: 2, pessoas: DEMO_PEOPLE.map(p => ({ ...p })) };
      const holder = document.getElementById('c-pessoas'); if (holder) holder.innerHTML = pessoasFields(2);
    } else if (route === 'simulador') {
      S.sim.step = Math.max(1, Number(S.sim.step) || 0); S.sim.sit ||= 'barulho';
    } else if (route === 'acordos') {
      // seedDemo provides an example record.
    } else if (route === 'inicio') {
      // Do not change the welcome screen or navigate automatically.
    }
    save(); render();
  }

  const originalViewTermoForm = viewTermoForm;
  const originalViewSim = viewSimulador;
  const originalViewAcordos = viewAcordos;
  const originalViewTermoEmitido = viewTermoEmitido;
  viewTermoForm = () => originalViewTermoForm().replace('<button class="btn" type="submit">Emitir termo</button>', '<button class="btn" type="button" data-demo-review>Revisar termo</button>');

  function agreementDraft() {
    const r = sim().r;
    return { id: 'draft', numero: `RASCUNHO/${hoje().getFullYear()}`, data: isoOf(hoje()), sit: sim().sit, outroTxt: r.outroTxt,
      p1nome: r.p1nome, p1cpf: r.p1cpf, p1uni: r.p1uni, p2nome: r.p2nome, p2cpf: r.p2cpf, p2uni: r.p2uni,
      mediador: r.mediador, resumo: r.resumo || '', comp: r.comp || [], risco: r.violencia === 'sim', pessoas: r.pessoas || [],
      acomp: r.acomp || isoOf(hoje()), t1: r.t1, t2: r.t2 };
  }
  function reviewScreen() {
    return `${subSteps(3)}<h1>Revisão do termo</h1><p class="lead">Confira os dados fictícios e os compromissos antes de avançar.</p>
      <div class="notice warn"><strong>Dados demonstrativos</strong><span>As assinaturas e o encaminhamento são simulações locais, sem validação jurídica ou transmissão.</span></div>
      ${termoHtml(agreementDraft())}<div class="actions"><button class="btn ghost" data-edit>Voltar e editar</button><button class="btn" data-sign-stage>Continuar para assinaturas</button></div>`;
  }
  function signatureScreen() {
    const r = sim().r; r.assinaturas ||= {};
    const people = [['p1', r.p1nome], ['p2', r.p2nome], ['t1', r.t1], ['t2', r.t2]];
    const allSigned = people.every(([key]) => r.assinaturas[key]);
    return `${subSteps(3)}<h1>Registro de assinaturas</h1><p class="lead">Registre o aceite fictício de cada participante para seguir a demonstração.</p>
      <div class="notice warn"><strong>Assinatura demonstrativa</strong><span>Não use dados reais. O protótipo não autentica assinaturas.</span></div>
      <div class="stack">${people.map(([key, name]) => `<div class="pessoa"><div class="pessoa-top"><strong>${esc(name || key)}</strong>${r.assinaturas[key] ? '<span class="pill acordo">Aceite demonstrativo registrado</span>' : '<span class="pill warn">Pendente</span>'}</div>${r.assinaturas[key] ? '' : `<button class="btn small" data-sign="${key}">Registrar aceite</button>`}</div>`).join('')}</div>
      <div class="actions"><button class="btn ghost" data-back-review>Voltar à revisão</button><button class="btn" data-send ${allSigned ? '' : 'disabled'}>Concluir envio demonstrativo ao CEJUSC</button></div>`;
  }
  function sentScreen() {
    const a = S.atend.find(item => item.id === S.ultimo) || S.atend[0];
    if (!a) return originalViewTermoEmitido();
    return `<div class="notice ok"><strong>Fluxo demonstrativo concluído</strong><span>Termo ${esc(a.numero)} marcado como enviado nesta demonstração.</span></div>
      <div class="confirma" role="status">ENVIO FICTÍCIO — NENHUM DOCUMENTO FOI TRANSMITIDO AO CEJUSC</div>${termoHtml(a)}
      <div class="actions"><button class="btn" id="copiar-termo">Copiar termo</button><span class="toast" id="copiar-msg" hidden>Termo copiado.</span><button class="btn ghost" data-go="acordos">Ver atendimentos</button><button class="btn ghost" id="novo-at">Novo atendimento</button></div>`;
  }
  viewSimulador = function () {
    if (!consulta()) {
      // The walkthrough fills prerequisite data so simulator/final screens are directly accessible.
      if (!seloValido()) seedDemo();
      if (sim().step === 6) return reviewScreen();
      if (sim().step === 7) return signatureScreen();
      if (sim().step === 8) return sentScreen();
    }
    return originalViewSim();
  };
  viewAcordos = function () { if (!seloValido()) seedDemo(); return originalViewAcordos(); };
  viewTermoEmitido = function () { return sim().step === 8 ? sentScreen() : originalViewTermoEmitido(); };

  const originalRender = render;
  render = function () {
    originalRender();
    const toolbar = `<aside class="notice warn" data-demo-toolbar><strong>Navegação com dados fictícios</strong><div class="actions"><button class="btn small" type="button" data-fill-screen>Preencher esta tela</button><button class="btn ghost small" type="button" data-fill-sim>Preencher dados do atendimento</button></div><span class="hint">Na tela inicial, a navegação original foi mantida. A assinatura/envio seguem sendo demonstrações.</span></aside>`;
    app.insertAdjacentHTML('afterbegin', toolbar);
    app.querySelector('[data-fill-screen]')?.addEventListener('click', fillScreen);
    app.querySelector('[data-fill-sim]')?.addEventListener('click', () => {
      seedDemo(); S.perfil = 'condominio'; S.view = 'simulador'; S.sim.step = 1; S.sim.sit = 'barulho';
      S.sim.r = demoResponse(); save(); render();
    });
    app.querySelector('[data-demo-review]')?.addEventListener('click', () => {
      const r = sim().r, get = id => document.getElementById(id)?.value.trim() || '';
      ['p1nome','p1cpf','p1uni','p2nome','p2cpf','p2uni','mediador','acomp','resumo','t1','t2'].forEach(key => r[key] = get(key));
      r.comp = [0,1,2].map(i => ({ t: get(`c${i}t`), q: get(`c${i}q`), p: get(`c${i}p`) }));
      const error = document.getElementById('t-err');
      if (!r.p1nome || !r.p2nome || !r.comp.some(x => x.t)) { error.textContent = 'Informe nomes das partes e pelo menos um compromisso.'; error.hidden = false; return; }
      if ([r.p1cpf, r.p2cpf].some(c => c.replace(/\D/g, '').length !== 11)) { error.textContent = 'Informe CPFs fictícios completos para as partes.'; error.hidden = false; return; }
      r.assinaturas = {}; sim().step = 6; save(); render();
    });
    app.querySelectorAll('[data-edit]').forEach(b => b.addEventListener('click', () => { sim().step = 4; save(); render(); }));
    app.querySelectorAll('[data-sign-stage]').forEach(b => b.addEventListener('click', () => { sim().step = 7; save(); render(); }));
    app.querySelectorAll('[data-back-review]').forEach(b => b.addEventListener('click', () => { sim().step = 6; save(); render(); }));
    app.querySelectorAll('[data-sign]').forEach(b => b.addEventListener('click', () => { const r = sim().r; r.assinaturas ||= {}; r.assinaturas[b.dataset.sign] = new Date().toLocaleString('pt-BR'); save(); render(); }));
    app.querySelectorAll('[data-send]').forEach(b => b.addEventListener('click', () => {
      const r = sim().r; if (!['p1','p2','t1','t2'].every(key => r.assinaturas?.[key])) return;
      registrar('termo'); const a = S.atend.find(item => item.id === S.ultimo);
      a.assinaturas = { ...r.assinaturas }; a.enviadoCejusc = isoOf(hoje()); a.status = 'Envio demonstrativo concluído';
      S.sim.step = 8; save(); render();
    }));
  };
  // Preserve the original entry/welcome view; demo data is inserted only when requested.
  render();
})();
