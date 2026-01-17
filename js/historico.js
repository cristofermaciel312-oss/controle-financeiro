document.addEventListener('DOMContentLoaded', () => {
  const lista = document.getElementById('lista');
  const vazio = document.getElementById('vazio');

  const HISTORY_KEY = 'financeHistory';
  const EDIT_KEY = 'mesParaEdicao';

  const brl = n =>
    (n || 0).toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    });

  const dataPT = v =>
    v ? new Date(v + 'T00:00:00').toLocaleDateString('pt-BR') : '';

  function carregarHistorico() {
    const hist = JSON.parse(localStorage.getItem(HISTORY_KEY)) || {};
    const meses = Object.keys(hist);

    if (meses.length === 0) {
      lista.innerHTML = '';
      vazio.style.display = 'block';
      return;
    }

    vazio.style.display = 'none';

    lista.innerHTML = meses.map(m => {
      const d = hist[m];
      const totalR = (d.receitas || []).reduce((a, r) => a + r.valor, 0);
      const totalD = (d.despesas || []).reduce((a, d) => a + d.valor, 0);

      return `
        <div class="card">
          <h2>${m}</h2>

          <button class="edit-btn" data-mes="${m}">✏️ Editar mês</button>
          <button class="danger-btn btnExcluirMes" data-mes="${m}">
            🗑️ Excluir mês
          </button>

          <div class="summary">
            <div><strong>Entradas</strong><br>${brl(totalR)}</div>
            <div><strong>Despesas</strong><br>${brl(totalD)}</div>
            <div><strong>Saldo</strong><br>${brl(totalR - totalD)}</div>
            <div><strong>Guardado</strong><br>${brl(d.guardado)}</div>
          </div>
        </div>
      `;
    }).join('');
  }

  lista.addEventListener('click', e => {
    // EDITAR
    const edit = e.target.closest('.edit-btn');
    if (edit) {
      localStorage.setItem(EDIT_KEY, edit.dataset.mes);
      window.location.href = 'index.html';
      return;
    }

    // EXCLUIR
    const del = e.target.closest('.btnExcluirMes');
    if (!del) return;

    const mes = del.dataset.mes;
    if (!confirm(`Excluir o mês "${mes}"?`)) return;

    const hist = JSON.parse(localStorage.getItem(HISTORY_KEY)) || {};
    delete hist[mes];
    localStorage.setItem(HISTORY_KEY, JSON.stringify(hist));
    carregarHistorico();
  });

  carregarHistorico();
});
