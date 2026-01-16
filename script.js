document.addEventListener('DOMContentLoaded', () => {
  const HISTORY_KEY = 'financeHistory';
  const EDIT_KEY = 'editingMonth';

  const el = {
    mesSelecionado: document.getElementById('mesSelecionado'),
    dinheiroGuardado: document.getElementById('dinheiroGuardado'),

    valorReceita: document.getElementById('valorReceita'),
    fonteReceita: document.getElementById('fonteReceita'),
    dataReceita: document.getElementById('dataReceita'),
    btnAddReceita: document.getElementById('btnAddReceita'),
    tabelaReceitasBody: document.querySelector('#tabelaReceitas tbody'),

    valorDespesa: document.getElementById('valorDespesa'),
    categoriaDespesa: document.getElementById('categoriaDespesa'),
    descricaoDespesa: document.getElementById('descricaoDespesa'),
    dataDespesa: document.getElementById('dataDespesa'),
    btnAddDespesa: document.getElementById('btnAddDespesa'),
    tabelaDespesasBody: document.querySelector('#tabelaDespesas tbody'),

    totalReceitas: document.getElementById('totalReceitas'),
    totalDespesas: document.getElementById('totalDespesas'),
    saldoRestante: document.getElementById('saldoRestante'),
    saldoGuardado: document.getElementById('saldoGuardado'),

    btnSalvarMes: document.getElementById('btnSalvarMes'),
    btnLimparAtual: document.getElementById('btnLimparAtual'),
  };

  let receitas = [];
  let despesas = [];
  let nextId = 1;

  const brl = n => (n || 0).toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  });

  const monthKey = input => {
    const [y, m] = input.split('-');
    const nomes = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'];
    return `${nomes[m - 1]} ${y}`;
  };

  function render() {
    el.tabelaReceitasBody.innerHTML = receitas.map(r => `
      <tr><td>${brl(r.valor)}</td><td>${r.fonte}</td><td>${r.data}</td></tr>
    `).join('');

    el.tabelaDespesasBody.innerHTML = despesas.map(d => `
      <tr><td>${brl(d.valor)}</td><td>${d.categoria}</td><td>${d.descricao || '-'}</td><td>${d.data}</td></tr>
    `).join('');

    const totalR = receitas.reduce((a,r)=>a+r.valor,0);
    const totalD = despesas.reduce((a,d)=>a+d.valor,0);
    const guardado = Number(el.dinheiroGuardado.value) || 0;

    el.totalReceitas.textContent = brl(totalR);
    el.totalDespesas.textContent = brl(totalD);
    el.saldoRestante.textContent = brl(totalR - totalD);
    el.saldoGuardado.textContent = brl(guardado);
  }

  // Adicionar receita
  el.btnAddReceita.onclick = () => {
    receitas.push({
      id: nextId++,
      valor: Number(el.valorReceita.value),
      fonte: el.fonteReceita.value,
      data: el.dataReceita.value
    });
    render();
  };

  // Adicionar despesa
  el.btnAddDespesa.onclick = () => {
    despesas.push({
      id: nextId++,
      valor: Number(el.valorDespesa.value),
      categoria: el.categoriaDespesa.value,
      descricao: el.descricaoDespesa.value,
      data: el.dataDespesa.value
    });
    render();
  };

  // SALVAR / ATUALIZAR MÊS
  el.btnSalvarMes.onclick = () => {
    const hist = JSON.parse(localStorage.getItem(HISTORY_KEY)) || {};
    const key = localStorage.getItem(EDIT_KEY) || monthKey(el.mesSelecionado.value);

    hist[key] = {
      receitas,
      despesas,
      guardado: Number(el.dinheiroGuardado.value) || 0,
      salvoEm: new Date().toISOString()
    };

    localStorage.setItem(HISTORY_KEY, JSON.stringify(hist));
    localStorage.removeItem(EDIT_KEY);
    window.location.href = 'historico.html';
  };

  // LIMPAR MÊS ATUAL
  el.btnLimparAtual.onclick = () => {
    receitas = [];
    despesas = [];
    el.dinheiroGuardado.value = '';
    render();
  };

  // 🔥 CARREGAR MÊS PARA EDIÇÃO
  const editing = localStorage.getItem(EDIT_KEY);
  if (editing) {
    const hist = JSON.parse(localStorage.getItem(HISTORY_KEY)) || {};
    const d = hist[editing];
    if (d) {
      receitas = d.receitas || [];
      despesas = d.despesas || [];
      el.dinheiroGuardado.value = d.guardado || 0;
      render();
    }
  }

  render();
});
