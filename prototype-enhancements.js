/* Conviva prototype demo data and simulated agreement review/signing flow.
   No digital signature is legally authenticated and no CEJUSC service is contacted. */
(() => {
  if (typeof S === 'undefined' || typeof render !== 'function') return;

  const DEMO_CONDO = {
    nome: 'Condomínio Residencial Jardim das Mangueiras',
    cnpj: '12.345.678/0001-90',
    endereco: 'Rua das Mangueiras, 120, Boa Viagem, Recife',
    unidades: '64', sindico: 'Ana Beatriz Souza',
    email: 'sindico@jardimdasmangueiras.example', telefone: '(81) 99999-0000',
    ata: 'ata-exemplo-demo.pdf', dataAta: '2026-10-30', dataAdesao: isoOf(hoje())
  };
  const DEMO_PERSONAS = [
    { nome: 'Ana Beatriz Souza', funcao: 'Síndico(a)' },
    { nome: 'Carlos Eduardo Lima', funcao: 'Comissão de convivência' }
  ];
  const DEMO_CPF_1 = '111.111.111-11';
  const DEMO_CPF_2 = '222.222.222-22';

  function loadDemo() {
    const h = hoje();
    const v = new Date(h); v.setFullYear(v.getFullYear() + CONFIG.seloAnos);
    S.perfil = 'condominio'; S.view = 'inicio'; S.condo = { ...DEMO_CONDO };
    S.cap = { turma: 't3', pessoas: DEMO_PERSONAS.map(x => ({ ...x })) };
    S.selo = { numero: `CONVIVA-${h.getFullYear()}-0049`, emissao: isoOf(h), validade: isoOf(v) };
    S.sim = {
      step: 0, sit: 'barulho', r: {
        papel: 'afetado', tentou: 'conversa', conversa: 'sim', violencia: 'nao',
        p1nome: 'Mariana Oliveira', p1cpf: DEMO_CPF_1, p1uni: 'Bloco A, 302',
        p2nome: 'Rafael Santos', p2cpf: DEMO_CPF_2, p2uni: 'Bloco A, 402',
        mediador: DEMO_PERSONAS[1].nome,
        resumo: 'As partes conversaram sobre ruídos no período noturno e querem combinar horários de silêncio.',
        acomp: isoOf(new Date(h.getTime() + 30 * 864e5)),
        comp: [
          { t: 'Evitar música alta após as 22h.', q: 'Parte 2 · unidade 402', p: 'A partir de hoje' },
          { t: 'Avisar com antecedência sobre reuniões com convidados.', q: 'Parte 2 · unidade 402', p: 'Quando necessário' },
          { t: 'Conversar novamente se o combinado precisar de ajuste.', q: 'Ambas as partes', p: 'Em 30 dias' }
        ], t1: 'Joana Ribeiro', t2: 'Pedro Costa', assinaturas: {}
      }
    };
    S.cons = { step: 0, sit: null, r: {} };
    S.seq = Math.max(S.seq || 0, 1);
    S.atend = [{
      id: 'demo-atendimento-001', numero: `000/${h.getFullYear()}`, data: isoOf(h), sit: 'barulho', caminho: 'termo',
      p1nome: 'Mariana Oliveira', p1cpf: DEMO_CPF_1, p1uni: 'Bloco A, 302',
      p2nome: 'Rafael Santos', p2cpf: DEMO_CPF_2, p2uni: 'Bloco A, 402',
      mediador: DEMO_PERSONAS[1].nome, resumo: 'Acordo demonstrativo sobre ruídos no período noturno.',
      comp: [{ t: 'Evitar música alta após as 22h.', q: 'Unidade 402', p: 'A partir de hoje' }],
      acomp: isoOf(new Date(h.getTime() + 30 * 864e5)), t1: 'Joana Ribeiro', t2: 'Pedro Costa',
      pessoas: [], risco: false, status: 'Em acompanhamento', assinaturas: {}, enviadoCejusc: null
    }];
    S.ultimo = null; S.capDraft = null; S.vendo = null;
    save(); render();
  }

  const originalViewSimulador = viewSimulador;
  const originalViewTermoForm = viewTermoForm;
  const originalViewTermoEmitido = viewTermoEmitido;

  function demoBanner() {
    return `<aside class="notice warn" data-demo-banner><strong>Modo demonstração</strong><span>Dados fictícios para testar telas. Não use informações reais. Assinaturas e envio ao CEJUSC são apenas simulações locais.</span><button class="btn ghost small" type="button" data-load-demo>Carregar dados fictícios</button></aside>`;
  }

  viewTermoForm = function () {
    return originalViewTermoForm().replace('<button class="btn" type="submit">Emitir termo</button>', '<button class="btn" type="button" data-review-termo>Revisar termo</button>');
  };

  function currentDraft() {
    const r = sim().r;
    return {
      id: 'rascunho', numero: `RASCUNHO/${hoje().getFullYear()}`, data: isoOf(hoje()),
      sit: sim().sit, outroTxt: r.outroTxt, caminho: 'termo',
      p1nome: r.p1nome, p1cpf: r.p1cpf, p1uni: r.p1uni,
      p2nome: r.p2nome, p2cpf: r.p2cpf, p2uni: r.p2uni,
      mediador: r.mediador, resumo: r.resumo || '', comp: r.comp || [],
      risco: r.violencia === 'sim', pessoas: r.pessoas || [], acomp: r.acomp || isoOf(hoje()), t1: r.t1, t2: r.t2
    };
  }

  function reviewView() {
    const draft = currentDraft();
    return `${subSteps(3)}<h1>Revise o termo antes de assinar</h1>
      <p class="lead">Confira os nomes, unidades, compromissos e prazos com as partes. Ainda não há assinatura registrada nem encaminhamento.</p>
      <div class="notice warn"><strong>Exemplo fictício</strong><span>Este fluxo demonstra a revisão e a coleta de aceite. Não é assinatura eletrônica juridicamente validada e não envia dados ao TJPE.</span></div>
      ${termoHtml(draft)}
      <div class="actions"><button class="btn ghost" type="button" data-review-back>Voltar e editar</button><button class="btn" type="button" data-to-sign>Continuar para assinaturas</button></div>`;
  }

  function signaturesView() {
    const r = sim().r, signs = r.assinaturas || {};
    const people = [
      ['p1', r.p1nome || 'Parte 1'], ['p2', r.p2nome || 'Parte 2'],
      ['t1', r.t1 || 'Testemunha 1'], ['t2', r.t2 || 'Testemunha 2']
    ];
    const rows = people.map(([key, name]) => `<div class="pessoa"><div class="pessoa-top"><strong>${esc(name)}</strong>${signs[key] ? '<span class="pill acordo">Assinatura registrada</span>' : '<span class="pill warn">Pendente</span>'}</div>
      ${signs[key] ? `<p class="hint">Aceite demonstrativo registrado em ${esc(signs[key])}.</p>` : `<button class="btn small" type="button" data-sign="${key}">Assinar como ${esc(name)}</button>`}</div>`).join('');
    const allSigned = people.every(([key]) => signs[key]);
    return `${subSteps(3)}<h1>Registro de assinaturas</h1>
      <p class="lead">Cada pessoa registra seu aceite nesta tela. No protótipo, o registro é local e não comprova identidade.</p>
      <div class="notice warn"><strong>Assinatura simulada</strong><span>Não desenhe nem informe assinatura real. Este protótipo apenas registra nome e horário no navegador.</span></div>
      <div class="stack">${rows}</div>
      <div class="actions"><button class="btn ghost" type="button" data-back-review>Voltar à revisão</button><button class="btn" type="button" data-send-cejusc ${allSigned ? '' : 'disabled'}>Enviar termo ao CEJUSC</button></div>
      <p class="hint">O botão de envio apenas atualiza o estado de demonstração; não há integração ou transmissão ao CEJUSC.</p>`;
  }

  function sentView() {
    const a = S.atend.find(x => x.id === S.ultimo);
    if (!a) return originalViewTermoEmitido();
    const names = [a.p1nome, a.p2nome, a.t1, a.t2].filter(Boolean);
    return `<div class="notice ok"><p><strong>Fluxo demonstrativo concluído</strong></p><p>Termo ${esc(a.numero)} assinado no protótipo e marcado como enviado ao CEJUSC em ${fmt(dt(a.enviadoCejusc || a.data))}.</p></div>
      <div class="confirma" role="status">ENVIO SIMULADO — NENHUM DOCUMENTO FOI TRANSMITIDO AO CEJUSC</div>
      <p><strong>Assinaturas registradas:</strong> ${names.map(esc).join(', ')}</p>
      ${termoHtml(a)}
      <div class="actions"><button class="btn" type="button" id="copiar-termo">Copiar termo</button><span class="toast" id="copiar-msg" hidden>Termo copiado.</span><button class="btn ghost" data-go="acordos">Ver atendimentos</button><button class="btn ghost" type="button" id="novo-at">Novo atendimento</button></div>`;
  }

  viewSimulador = function () {
    const step = sim().step;
    if (!consulta() && step === 6) return reviewView();
    if (!consulta() && step === 7) return signaturesView();
    if (!consulta() && step === 8) return sentView();
    return originalViewSimulador();
  };
  viewTermoEmitido = function () { return sim().step === 8 ? sentView() : originalViewTermoEmitido(); };

  const originalRender = render;
  render = function () {
    originalRender();
    const banner = app.querySelector('[data-demo-banner]');
    if (!banner) app.insertAdjacentHTML('afterbegin', demoBanner());
    app.querySelectorAll('[data-load-demo]').forEach(button => button.addEventListener('click', loadDemo));
    const review = app.querySelector('[data-review-termo]');
    if (review) review.addEventListener('click', () => {
      const form = document.getElementById('f-termo');
      const get = id => document.getElementById(id)?.value.trim() || '';
      const r = sim().r;
      ['p1nome','p1cpf','p1uni','p2nome','p2cpf','p2uni','mediador','acomp','resumo','t1','t2'].forEach(key => r[key] = get(key));
      r.comp = [0,1,2].map(i => ({ t: get(`c${i}t`), q: get(`c${i}q`), p: get(`c${i}p`) }));
      if (!r.p1nome || !r.p2nome || !r.comp.some(x => x.t)) { const err = document.getElementById('t-err'); err.textContent = 'Informe os nomes das duas partes e pelo menos um compromisso.'; err.hidden = false; return; }
      if ([r.p1cpf, r.p2cpf].some(c => (c || '').replace(/\\D/g, '').length !== 11)) { const err = document.getElementById('t-err'); err.textContent = 'Informe 11 dígitos de CPF fictício para cada parte.'; err.hidden = false; return; }
      r.assinaturas = {}; save(); sim().step = 6; render(); window.scrollTo({ top: 0, behavior: 'smooth' });
    });
    app.querySelectorAll('[data-review-back]').forEach(b => b.addEventListener('click', () => { sim().step = 4; save(); render(); }));
    app.querySelectorAll('[data-to-sign]').forEach(b => b.addEventListener('click', () => { sim().step = 7; save(); render(); }));
    app.querySelectorAll('[data-back-review]').forEach(b => b.addEventListener('click', () => { sim().step = 6; save(); render(); }));
    app.querySelectorAll('[data-sign]').forEach(b => b.addEventListener('click', () => {
      const r = sim().r; r.assinaturas = r.assinaturas || {}; r.assinaturas[b.dataset.sign] = new Date().toLocaleString('pt-BR'); save(); render();
    }));
    app.querySelectorAll('[data-send-cejusc]').forEach(b => b.addEventListener('click', () => {
      const r = sim().r;
      if (!r.assinaturas || !['p1','p2','t1','t2'].every(k => r.assinaturas[k])) return;
      registrar('termo');
      const agreement = S.atend.find(x => x.id === S.ultimo);
      agreement.assinaturas = { ...r.assinaturas };
      agreement.enviadoCejusc = isoOf(hoje());
      agreement.status = 'Assinado · envio demonstrativo ao CEJUSC';
      S.sim.step = 8; save(); render(); window.scrollTo({ top: 0, behavior: 'smooth' });
    }));
  };

  // Add a visible example-data control even on pages rendered before this script loaded.
  render();
})();
