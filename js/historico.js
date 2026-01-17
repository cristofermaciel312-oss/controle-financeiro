document.addEventListener('DOMContentLoaded', () => {
  const lista = document.getElementById('lista');
  const vazio = document.getElementById('vazio');

  const HISTORY_KEY = 'financeHistory';

  const brl = n =>
    (n || 0).toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    });

  const dataPT = v =>
    v ? new Date(v + 'T00:00:00').toLocaleDateString('pt-BR') : '';

  function carregarHistorico() {
    const raw = localStorage.getItem(HISTORY_KEY);
    const hist = raw ? JSON.parse(raw) : {};
    const meses = Object.keys(hist);

    if (meses.length === 0) {
      lista.innerHTML = '';
      vazio.style.display = 'block';
      return;
    }

    vazio.style.display = 'none';

    meses.sort((a, b) => {
      const sa = hist[a].salvoEm ? new Date(hist[a].salvoEm).getTime() : 0;
      const sb = hist[b].salvoEm ? new Date(hist[b].salvoEm).getTime() : 0;
      return sb - sa;
    });

    lista.innerHTML = meses.map(m => {
      const d = hist[m];
      const totalR = (d.receitas || []).reduce((a, r) => a + Number(r.valor || 0), 0);
      const totalD = (d.despesas || []).reduce((a, r) => a + Number(r.valor || 0), 0);
      const saldo = totalR - totalD;

      return `
        <div class="card">
          <h2>${m}</h2>
          <button class="danger-btn btnExcluirMes" data-mes="${m}">
            🗑️ Excluir mês
          </button>
          <button class="link-btn btnEditarMes" data-mes="${m}">
            ✏️ Editar mês
          </button>

          <div class="summary">
            <div><strong>Entradas</strong><br>${brl(totalR)}</div>
            <div><strong>Despesas</strong><br>${brl(totalD)}</div>
            <div><strong>Saldo</strong><br>${brl(saldo)}</div>
            <div><strong>Guardado</strong><br>${brl(d.guardado)}</div>
          </div>

          <h3>Entradas</h3>
          <table>
            <thead>
              <tr><th>Valor</th><th>Fonte</th><th>Data</th></tr>
            </thead>
            <tbody>
              ${(d.receitas || []).map(r => `
                <tr>
                  <td>${brl(r.valor)}</td>
                  <td>${r.fonte}</td>
                  <td>${dataPT(r.data)}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>

          <h3 style="margin-top:12px">Despesas</h3>
          <table>
            <thead>
              <tr><th>Valor</th><th>Categoria</th><th>Descrição</th><th>Data</th></tr>
            </thead>
            <tbody>
              ${(d.despesas || []).map(r => `
                <tr>
                  <td>${brl(r.valor)}</td>
                  <td>${r.categoria}</td>
                  <td>${r.descricao || '-'}</td>
                  <td>${dataPT(r.data)}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      `;
    }).join('');
  }

  // Excluir mês
  lista.addEventListener('click', e => {
    const btn = e.target.closest('.btnExcluirMes');
    if (!btn) return;

    const mes = btn.dataset.mes;
    if (!confirm(`Excluir o mês "${mes}"?`)) return;

    const hist = JSON.parse(localStorage.getItem(HISTORY_KEY)) || {};
    delete hist[mes];
    localStorage.setItem(HISTORY_KEY, JSON.stringify(hist));
    carregarHistorico();
  });

  
  // Editar mês
lista.addEventListener('click', e => {
  const btn = e.target.closest('.btnEditarMes');
  if (!btn) return;

  const mes = btn.dataset.mes;

  // salva qual mês será editado
  localStorage.setItem('editingMonth', mes);

  // vai para a tela principal
  window.location.href = 'index.html';
});

  
  // Limpar tudo
  document.getElementById('btnLimparTudo').addEventListener('click', () => {
    if (!confirm('Isso apagará TODO o histórico. Deseja continuar?')) return;
    localStorage.removeItem(HISTORY_KEY);
    carregarHistorico();
  });

  // Voltar
  document.getElementById('btnVoltar').addEventListener('click', () => {
    window.location.href = 'index.html';
  });

  // Tema
  const savedTheme = localStorage.getItem('theme');
  if (savedTheme === 'dark') document.body.classList.add('dark');

  document.getElementById('toggleTheme').addEventListener('click', () => {
    document.body.classList.toggle('dark');
    localStorage.setItem(
      'theme',
      document.body.classList.contains('dark') ? 'dark' : 'light'
    );
  });

  carregarHistorico();
});
