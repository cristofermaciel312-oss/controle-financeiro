document.addEventListener('DOMContentLoaded', () => {
  const lista = document.getElementById('lista');
  const vazio = document.getElementById('vazio');

  const btnVoltar = document.getElementById('btnVoltar');
  const btnTema = document.getElementById('btnTema');
  const btnLimparTudo = document.getElementById('btnLimparTudo');

  const HISTORY_KEY = 'financeHistory';
  const EDIT_KEY = 'mesParaEdicao';
  const THEME_KEY = 'theme';

  const meses = [
    'Janeiro','Fevereiro','Março','Abril','Maio','Junho',
    'Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'
  ];

  const brl = v =>
    (v || 0).toLocaleString('pt-BR',{style:'currency',currency:'BRL'});

  const formatarMes = m => {
    const [a, mm] = m.split('-');
    return `${meses[Number(mm)-1]} de ${a}`;
  };

  // ---------- TEMA ----------
  if (localStorage.getItem(THEME_KEY) === 'dark') {
    document.body.classList.add('dark');
  }

  btnTema.onclick = () => {
    document.body.classList.toggle('dark');
    localStorage.setItem(
      THEME_KEY,
      document.body.classList.contains('dark') ? 'dark' : 'light'
    );
  };

  // ---------- VOLTAR ----------
  btnVoltar.onclick = () => {
    location.href = 'index.html';
  };

  // ---------- LIMPAR ----------
  btnLimparTudo.onclick = () => {
    if (!confirm('Deseja apagar TODO o histórico?')) return;
    localStorage.removeItem(HISTORY_KEY);
    carregar();
  };

  // ---------- HISTÓRICO ----------
  function carregar() {
    const hist = JSON.parse(localStorage.getItem(HISTORY_KEY)) || {};
    const mesesSalvos = Object.keys(hist);

    if (mesesSalvos.length === 0) {
      lista.innerHTML = '';
      vazio.style.display = 'block';
      return;
    }

    vazio.style.display = 'none';

    lista.innerHTML = mesesSalvos.map(m => {
      const d = hist[m];
      const r = (d.receitas||[]).reduce((a,x)=>a+x.valor,0);
      const dp = (d.despesas||[]).reduce((a,x)=>a+x.valor,0);

      return `
        <div class="card">
          <h2>${formatarMes(m)}</h2>

          <div style="display:flex;gap:8px;margin-bottom:10px">
            <button class="edit" data-mes="${m}">✏️ Editar</button>
            <button class="danger" data-del="${m}">🗑️ Excluir</button>
          </div>

          <div class="summary">
            <div><strong>Entradas</strong><br>${brl(r)}</div>
            <div><strong>Despesas</strong><br>${brl(dp)}</div>
            <div><strong>Saldo</strong><br>${brl(r-dp)}</div>
            <div><strong>Guardado</strong><br>${brl(d.guardado)}</div>
          </div>
        </div>
      `;
    }).join('');
  }

  // ---------- AÇÕES ----------
  lista.onclick = e => {
    const edit = e.target.closest('.edit');
    if (edit) {
      localStorage.setItem(EDIT_KEY, edit.dataset.mes);
      location.href = 'index.html';
      return;
    }

    const del = e.target.closest('[data-del]');
    if (!del) return;

    const hist = JSON.parse(localStorage.getItem(HISTORY_KEY)) || {};
    delete hist[del.dataset.del];
    localStorage.setItem(HISTORY_KEY, JSON.stringify(hist));
    carregar();
  };

  carregar();
});
