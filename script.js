document.addEventListener('DOMContentLoaded', () => {
  // ===============================
  // CONFIG / STORAGE KEYS
  // ===============================
  const CURRENT_KEY = 'financeCurrent';
  const HISTORY_KEY = 'financeHistory';

  // ===============================
  // ELEMENTOS
  // ===============================
  const el = {
    toggleTheme: document.getElementById('toggleTheme'),
    btnHistorico: document.getElementById('btnHistorico'),
    mesSelecionado: document.getElementById('mesSelecionado'),
    dinheiroGuardado: document.getElementById('dinheiroGuardado'),

    // Receita
    valorReceita: document.getElementById('valorReceita'),
    fonteReceita: document.getElementById('fonteReceita'),
    dataReceita: document.getElementById('dataReceita'),
    btnAddReceita: document.getElementById('btnAddReceita'),
    tabelaReceitasBody: document
      .getElementById('tabelaReceitas')
      .querySelector('tbody'),

    // Despesa
    valorDespesa: document.getElementById('valorDespesa'),
    categoriaDespesa: document.getElementById('categoriaDespesa'),
    descricaoDespesa: document.getElementById('descricaoDespesa'),
    dataDespesa: document.getElementById('dataDespesa'),
    btnAddDespesa: document.getElementById('btnAddDespesa'),
    tabelaDespesasBody: document
      .getElementById('tabelaDespesas')
      .querySelector('tbody'),

    // Resumo
    totalReceitas: document.getElementById('totalReceitas'),
    totalDespesas: document.getElementById('totalDespesas'),
    saldoRestante: document.getElementById('saldoRestante'),
    saldoGuardado: document.getElementById('saldoGuardado'),

    // Ações
    btnSalvarMes: document.getElementById('btnSalvarMes'),
    btnLimparAtual: document.getElementById('btnLimparAtual'),
  };

  // ===============================
  // ESTADO
  // ===============================
  let receitas = [];
  let despesas = [];
  let nextId = 1;

  // ===============================
  // UTILITÁRIOS
  // ===============================
  const brl = (n) =>
    (n || 0).toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    });

  const formatDate = (value) => {
    if (!value) return '';
    const d = new Date(value + 'T00:00:00');
    return d.toLocaleDateString('pt-BR');
  };

  const monthKey = (inputMonth) => {
    if (!inputMonth) return '';
    const [y, m] = inputMonth.split('-');
    const nomes = [
      'Janeiro','Fevereiro','Março','Abril','Maio','Junho',
      'Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'
    ];
    return `${nomes[Number(m) - 1]} ${y}`;
  };

  // ===============================
  // RENDER
  // ===============================
  function renderReceitas() {
    el.tabelaReceitasBody.innerHTML = receitas.map(r => `
      <tr>
        <td>${brl(r.valor)}</td>
        <td>${r.fonte}</td>
        <td>${formatDate(r.data)}</td>
        <td><button class="rem-receita" data-id="${r.id}">🗑️</button></td>
      </tr>
    `).join('');
  }

  function renderDespesas() {
    el.tabelaDespesasBody.innerHTML = despesas.map(d => `
      <tr>
        <td>${brl(d.valor)}</td>
        <td>${d.categoria}</td>
        <td>${d.descricao || '-'}</td>
        <td>${formatDate(d.data)}</td>
        <td><button class="rem-despesa" data-id="${d.id}">🗑️</button></td>
      </tr>
    `).join('');
  }

  function resumo() {
    const totalR = receitas.reduce((a, r) => a + r.valor, 0);
    const totalD = despesas.reduce((a, d) => a + d.valor, 0);
    const guardado = parseFloat(el.dinheiroGuardado.value) || 0;

    el.totalReceitas.textContent = brl(totalR);
    el.totalDespesas.textContent = brl(totalD);
    el.saldoRestante.textContent = brl(totalR - totalD);
    el.saldoGuardado.textContent = brl(guardado);
  }

  // ===============================
  // STORAGE (MÊS ATUAL)
  // ===============================
  function salvarEstadoAtual() {
    const estado = {
      mes: el.mesSelecionado.value,
      guardado: el.dinheiroGuardado.value,
      receitas,
      despesas,
      nextId,
    };
    localStorage.setItem(CURRENT_KEY, JSON.stringify(estado));
  }

  function carregarEstadoAtual() {
    const raw = localStorage.getItem(CURRENT_KEY);
    if (!raw) return;

    const estado = JSON.parse(raw);
    el.mesSelecionado.value = estado.mes || '';
    el.dinheiroGuardado.value = estado.guardado || '';
    receitas = estado.receitas || [];
    despesas = estado.despesas || [];
    nextId = estado.nextId || 1;

    renderReceitas();
    renderDespesas();
    resumo();
  }

  function limparPagina() {
    receitas = [];
    despesas = [];
    nextId = 1;
    el.dinheiroGuardado.value = '';
    localStorage.removeItem(CURRENT_KEY);
    renderReceitas();
    renderDespesas();
    resumo();
  }

  // ===============================
  // EVENTOS
  // ===============================
  el.btnAddReceita.addEventListener('click', () => {
    const valor = parseFloat(el.valorReceita.value);
    const fonte = el.fonteReceita.value.trim();
    const data = el.dataReceita.value;

    if (!valor || !fonte || !data) return alert('Preencha todos os campos.');

    receitas.push({ id: nextId++, valor, fonte, data });
    renderReceitas();
    resumo();
    salvarEstadoAtual();

    el.valorReceita.value = '';
    el.fonteReceita.value = '';
    el.dataReceita.value = '';
  });

  el.btnAddDespesa.addEventListener('click', () => {
    const valor = parseFloat(el.valorDespesa.value);
    const categoria = el.categoriaDespesa.value.trim();
    const descricao = el.descricaoDespesa.value.trim();
    const data = el.dataDespesa.value;

    if (!valor || !categoria || !data) return alert('Preencha todos os campos.');

    despesas.push({ id: nextId++, valor, categoria, descricao, data });
    renderDespesas();
    resumo();
    salvarEstadoAtual();

    el.valorDespesa.value = '';
    el.categoriaDespesa.value = '';
    el.descricaoDespesa.value = '';
    el.dataDespesa.value = '';
  });

  el.tabelaReceitasBody.addEventListener('click', e => {
    const btn = e.target.closest('.rem-receita');
    if (!btn) return;
    const id = Number(btn.dataset.id);
    receitas = receitas.filter(r => r.id !== id);
    renderReceitas();
    resumo();
    salvarEstadoAtual();
  });

  el.tabelaDespesasBody.addEventListener('click', e => {
    const btn = e.target.closest('.rem-despesa');
    if (!btn) return;
    const id = Number(btn.dataset.id);
    despesas = despesas.filter(d => d.id !== id);
    renderDespesas();
    resumo();
    salvarEstadoAtual();
  });

  el.btnSalvarMes.addEventListener('click', () => {
    const key = monthKey(el.mesSelecionado.value);
    if (!key) return alert('Selecione o mês.');

    const hist = JSON.parse(localStorage.getItem(HISTORY_KEY)) || {};
    hist[key] = {
      receitas,
      despesas,
      guardado: el.dinheiroGuardado.value,
      salvoEm: new Date().toISOString(),
    };

    localStorage.setItem(HISTORY_KEY, JSON.stringify(hist));
    limparPagina();
    window.location.href = 'historico.html';
  });

  el.btnLimparAtual.addEventListener('click', limparPagina);

  el.btnHistorico.addEventListener('click', () => {
    window.location.href = 'historico.html';
  });

  el.dinheiroGuardado.addEventListener('input', () => {
    resumo();
    salvarEstadoAtual();
  });

  // ===============================
  // THEME
  // ===============================
  const savedTheme = localStorage.getItem('theme');
  if (savedTheme === 'dark') document.body.classList.add('dark');

  el.toggleTheme.addEventListener('click', () => {
    document.body.classList.toggle('dark');
    localStorage.setItem(
      'theme',
      document.body.classList.contains('dark') ? 'dark' : 'light'
    );
  });

  // ===============================
  // INIT
  // ===============================
  const today = new Date();
  el.mesSelecionado.value = `${today.getFullYear()}-${String(
    today.getMonth() + 1
  ).padStart(2, '0')}`;

  carregarEstadoAtual();
});
