/* A reporting-person selector for reports made on behalf of another resident. It stores only the relationship/category, not disability or health details. */
(() => {
  if (typeof S === 'undefined' || typeof render !== 'function') return;

  const REPORTER_OPTIONS = [
    ['propria', 'A própria pessoa'],
    ['terceiro', 'Outra pessoa adulta, com autorização'],
    ['filho', 'Filho(a), familiar ou responsável por menor'],
    ['idoso', 'Pessoa idosa ou alguém que a apoia'],
    ['deficiencia', 'Pessoa com deficiência ou representante'],
    ['representante', 'Representante de condomínio, filial ou entidade']
  ];
  const reporterLabel = value => REPORTER_OPTIONS.find(option => option[0] === value)?.[1] || '';

  const originalViewAtendimento = viewAtendimento;
  viewAtendimento = function () {
    let html = originalViewAtendimento();
    const selected = sim().r.reporterType || 'propria';
    const field = `<fieldset class="reporter-field"><legend>Quem está apresentando este relato?</legend><p class="hint">Pode relatar a própria pessoa ou alguém autorizado. Informe apenas o necessário; não inclua detalhes de saúde ou deficiência.</p><div class="field"><label for="reporterType">Relação com a pessoa atendida</label><select id="reporterType" name="reporterType">${REPORTER_OPTIONS.map(([value, label]) => `<option value="${value}" ${selected === value ? 'selected' : ''}>${label}</option>`).join('')}</select></div></fieldset>`;
    return html.replace('<h3>Adicionar pessoas (opcional)</h3>', `${field}<h3>Adicionar pessoas (opcional)</h3>`);
  };

  const originalRegistrar = registrar;
  registrar = function (caminho) {
    originalRegistrar(caminho);
    const record = S.atend.find(item => item.id === S.ultimo);
    if (record) {
      record.reporterType = sim().r.reporterType || 'propria';
      save();
    }
  };

  const originalTermoHtml = termoHtml;
  termoHtml = function (record) {
    const html = originalTermoHtml(record);
    if (!record?.reporterType) return html;
    return html.replace('<h3>3. Mediação</h3>', `<h3>Relato apresentado por</h3><p>${reporterLabel(record.reporterType)}</p><h3>3. Mediação</h3>`);
  };

  const originalRender = render;
  render = function () {
    originalRender();
    const control = app.querySelector('#reporterType');
    if (control) {
      control.addEventListener('change', () => {
        sim().r.reporterType = control.value;
        save();
      });
    }
  };
  render();
})();
