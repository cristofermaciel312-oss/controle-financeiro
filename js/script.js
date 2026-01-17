document.addEventListener('DOMContentLoaded', () => {
  const HISTORY_KEY = 'financeHistory';
  const EDIT_KEY = 'mesParaEdicao';

  const el = id => document.getElementById(id);

  const mesSelecionado = el('mesSelecionado');
  const dinheiroGuardado = el('dinheiroGuardado');

  const valorReceita = el('valorReceita');
  const fonteReceita = el('fonteReceita');
  const dataReceita = el('dataReceita');
  const btnAddReceita = el('btnAddReceita');

  const valorDespesa = el('valorDespesa');
  const categoriaDespesa = el('categoriaDespesa');
  const descricaoDespesa = el('descricaoDespesa');
  const dataDespesa = el('dataDespesa');
  const btnAddDespesa = el('btnAddDespesa');

  const tbodyReceitas = el('tbodyReceitas');
  const tbodyDespesas = el('tbodyDespesas');

  const btnSalvarMes = el('btnSalvarMes');
  const btnLimparAtual = el('btnLimparAtual');
  const btnHistorico = el('btnHistorico');
  const toggleTheme = el('toggleTheme');

  let receitas = [];
  let despesas = [];

  const brl = n => (n || 0).toLocaleString('pt-BR',{style:'currency',currency:'BRL'});
  const dataPT = d => new Date(d+'T00:00:00').toLocaleDateString('pt-BR');

  function render() {
    tbodyReceitas.innerHTML = receitas.map((r,i)=>`
      <tr>
        <td>${brl(r.valor)}</td>
        <td>${r.fonte}</td>
        <td>${dataPT(r.data)}</td>
        <td><button data-i="${i}" class="remR">🗑️</button></td>
      </tr>
    `).join('');

    tbodyDespesas.innerHTML = despesas.map((d,i)=>`
      <tr>
        <td>${brl(d.valor)}</td>
        <td>${d.categoria}</td>
        <td>${d.descricao || '-'}</td>
        <td>${dataPT(d.data)}</td>
        <td><button data-i="${i}" class="remD">🗑️</button></td>
      </tr>
    `).join('');
  }

  btnAddReceita.onclick = () => {
    if(!valorReceita.value || !fonteReceita.value || !dataReceita.value) return;
    receitas.push({valor:+valorReceita.value,fonte:fonteReceita.value,data:dataReceita.value});
    valorReceita.value = fonteReceita.value = dataReceita.value = '';
    render();
  };

  btnAddDespesa.onclick = () => {
    if(!valorDespesa.value || !categoriaDespesa.value || !dataDespesa.value) return;
    despesas.push({
      valor:+valorDespesa.value,
      categoria:categoriaDespesa.value,
      descricao:descricaoDespesa.value,
      data:dataDespesa.value
    });
    valorDespesa.value = categoriaDespesa.value = descricaoDespesa.value = dataDespesa.value = '';
    render();
  };

  tbodyReceitas.onclick = e => {
    if(e.target.classList.contains('remR')){
      receitas.splice(e.target.dataset.i,1);
      render();
    }
  };

  tbodyDespesas.onclick = e => {
    if(e.target.classList.contains('remD')){
      despesas.splice(e.target.dataset.i,1);
      render();
    }
  };

  btnSalvarMes.onclick = () => {
    if(!mesSelecionado.value) return alert('Selecione um mês');
    const hist = JSON.parse(localStorage.getItem(HISTORY_KEY)) || {};
    hist[mesSelecionado.value] = {
      receitas,
      despesas,
      guardado:+dinheiroGuardado.value || 0,
      salvoEm:new Date().toISOString()
    };
    localStorage.setItem(HISTORY_KEY, JSON.stringify(hist));
    location.href='historico.html';
  };

  btnLimparAtual.onclick = () => {
    if(!confirm('Limpar mês atual?')) return;
    receitas = [];
    despesas = [];
    dinheiroGuardado.value = '';
    render();
  };

  btnHistorico.onclick = () => location.href='historico.html';

  const theme = localStorage.getItem('theme');
  if(theme==='dark') document.body.classList.add('dark');
  toggleTheme.onclick = () => {
    document.body.classList.toggle('dark');
    localStorage.setItem('theme',document.body.classList.contains('dark')?'dark':'light');
  };

  const editMes = localStorage.getItem(EDIT_KEY);
  if(editMes){
    const hist = JSON.parse(localStorage.getItem(HISTORY_KEY))||{};
    const d = hist[editMes];
    if(d){
      mesSelecionado.value = editMes;
      dinheiroGuardado.value = d.guardado || 0;
      receitas = d.receitas || [];
      despesas = d.despesas || [];
      render();
    }
    localStorage.removeItem(EDIT_KEY);
  } else {
    const hoje = new Date();
    mesSelecionado.value = `${hoje.getFullYear()}-${String(hoje.getMonth()+1).padStart(2,'0')}`;
  }
});
