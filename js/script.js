document.addEventListener('DOMContentLoaded', () => {
  // ====== CONSTANTES ======
  const HISTORY_KEY = 'financeHistory';
  const EDIT_KEY = 'mesParaEdicao';

  // ====== ELEMENTOS ======
  const mesSelecionado = document.getElementById('mesSelecionado');
  const dinheiroGuardado = document.getElementById('dinheiroGuardado');

  const valorReceita = document.getElementById('valorReceita');
  const fonteReceita = document.getElementById('fonteReceita');
  const dataReceita = document.getElementById('dataReceita');
  const btnAddReceita = document.getElementById('btnAddReceita');

  const valorDespesa = document.getElementById('valorDespesa');
  const categoriaDespesa = document.getElementById('categoriaDespesa');
  const descricaoDespesa = document.getElementById('descricaoDespesa');
  const dataDespesa = document.getElementById('dataDespesa');
  const btnAddDespesa = document.getElementById('btnAddDespesa');

  const tabelaReceitas = document.querySelector('#tabelaReceitas tbody');
  const tabelaDespesas = document.querySelector('#tabelaDespesas tbody');

  const totalReceitasEl = document.getElementById('totalReceitas');
  const totalDespesasEl = document.getElementById('totalDespesas');
  const saldoRestanteEl = document.getElementById('saldoRestante');
  const saldoGuardadoEl = document.getElementById('saldoGuardado');

  const btnSalvarMes = document.getElementById('btnSalvarMes');
  const btnHistorico = document.getElementById('btnHistorico');
  const btnLimparAtual = document.getElementById('btnLimparAtual');
  const toggleTheme = document.getElementById('toggleTheme');

  // ====== ESTADO ======
  let receitas = [];
  let despesas = [];
  let modoEdicao = false;

  // ====== UTIL ======
  const brl = n =>
    (n || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

  const dataPT = v =>
    v ? new Date(v + 'T00:00:00').toLocaleDateString('pt-BR') : '';

  // ====== RENDER ======
  function renderReceitas() {
    tabelaReceitas.innerHTML = receitas.map((r, i) => `
      <tr>
        <td>${brl(r.valor)}</td>
        <td>${r.fonte}</td>
        <td>${dataPT(r.data)}</td>
        <td><button data-i="${i}" class="rem-receita">🗑️</button></td>
      </tr>
    `).join('');
  }

  function renderDespesas() {
    tabelaDespesas.innerHTML = despesas.map((d, i) => `
      <tr>
        <td>${brl(d.valor)}</td>
        <td>${d.categoria}</td>
        <td>${d.descricao || '-'}</td>
        <td>${dataPT(d.data)}</td>
        <td><button data-i="${i}" class="rem-despesa">🗑️</button></td>
      </tr>
    `).join('');
  }

  function renderResumo() {
    const totalR = receitas.reduce((a, r) => a + r.valor, 0);
    const totalD = despesas.reduce((a, d) => a + d.valor, 0);
    const guardado = Number(dinheiroGuardado.value) || 0;

    totalReceitasEl.textContent = brl(totalR);
    totalDespesasEl.textContent = brl(totalD);
    saldoRestanteEl.textContent = brl(totalR - totalD);
    saldoGuardadoEl.textContent = brl(guardado);
  }

  function renderTudo() {
    renderReceitas();
    renderDespesas();
    renderResumo();
  }

  // ====== AÇÕES ======
  btnAddReceita.onclick = () => {
    const valor = Number(valorReceita.value);
    if (!valor || !fonteReceita.value || !dataReceita.value) return;

    receitas.push({
      valor,
      fonte: fonteReceita.value,
      data: dataReceita.value,
    });

    valorReceita.value = fonteReceita.value = dataReceita.value = '';
    renderTudo();
  };

  btnAddDespesa.onclick = () => {
    const valor = Number(valorDespesa.value);
    if (!valor || !categoriaDespesa.value || !dataDespesa.value) return;

    despesas.push({
      valor,
      categoria: categoriaDespesa.value,
      descricao: descricaoDespesa.value,
      data: dataDespesa.value,
    });

    valorDespesa.value = categoriaDespesa.value =
      descricaoDespesa.value = dataDespesa.value = '';
    renderTudo();
  };

  tabelaReceitas.onclick = e => {
    const btn = e.target.closest('.rem-receita');
    if (!btn) return;
    receitas.splice(btn.dataset.i, 1);
    renderTudo();
  };

  tabelaDespesas.onclick = e => {
    const btn = e.target.closest('.rem-despesa');
    if (!btn) return;
    despesas.splice(btn.dataset.i, 1);
    renderTudo();
  };

  // ====== SALVAR ======
  btnSalvarMes.onclick = () => {
    if (!mesSelecionado.value) {
      alert('Selecione um mês');
      return;
    }

    const hist = JSON.parse(localStorage.getItem(HISTORY_KEY)) || {};

    hist[mesSelecionado.value] = {
      receitas,
      despesas,
      guardado: Number(dinheiroGuardado.value) || 0,
      salvoEm: new Date().toISOString(),
    };

    localStorage.setItem(HISTORY_KEY, JSON.stringify(hist));
    location.href = 'historico.html';
  };

  // ====== LIMPAR ======
  btnLimparAtual.onclick = () => {
    if (!confirm('Limpar dados do mês atual?')) return;
    receitas = [];
    despesas = [];
    dinheiroGuardado.value = '';
    renderTudo();
  };

  // ====== EDITAR MÊS ======
  const mesEditar = localStorage.getItem(EDIT_KEY);
  if (mesEditar) {
    const hist = JSON.parse(localStorage.getItem(HISTORY_KEY)) || {};
    const dados = hist[mesEditar];

    if (dados) {
      mesSelecionado.value = mesEditar;
      dinheiroGuardado.value = dados.guardado || 0;
      receitas = dados.receitas || [];
      despesas = dados.despesas || [];
      modoEdicao = true;
      renderTudo();
    }

    localStorage.removeItem(EDIT_KEY);
  }

  // ====== NAVEGAÇÃO ======
  btnHistorico.onclick = () => location.href = 'historico.html';

  // ====== TEMA ======
  const savedTheme = localStorage.getItem('theme');
  if (savedTheme === 'dark') document.body.classList.add('dark');

  toggleTheme.onclick = () => {
    document.body.classList.toggle('dark');
    localStorage.setItem(
      'theme',
      document.body.classList.contains('dark') ? 'dark' : 'light'
    );
  };

  dinheiroGuardado.oninput = renderResumo;

  // ====== INIT ======
  const hoje = new Date();
  mesSelecionado.value =
    hoje.getFullYear() + '-' + String(hoje.getMonth() + 1).padStart(2, '0');

  renderTudo();
});
