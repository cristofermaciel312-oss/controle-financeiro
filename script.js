document.addEventListener('DOMContentLoaded', () => {
  const $ = id => document.getElementById(id);
  const HISTORY_KEY = 'financeHistory';

  let receitas = [];
  let despesas = [];
  let grafico = null;

  // Tema
  if (localStorage.getItem('theme') === 'dark') document.body.classList.add('dark');
  $('toggleTheme').onclick = () => {
    document.body.classList.toggle('dark');
    localStorage.setItem('theme', document.body.classList.contains('dark') ? 'dark' : 'light');
  };

  $('btnHistorico').onclick = () => location.href = 'historico.html';

  $('btnAddReceita').onclick = () => {
    receitas.push({
      valor: +$('valorReceita').value,
      fonte: $('fonteReceita').value,
      data: $('dataReceita').value
    });
    render();
  };

  $('btnAddDespesa').onclick = () => {
    despesas.push({
      valor: +$('valorDespesa').value,
      categoria: $('categoriaDespesa').value,
      descricao: $('descricaoDespesa').value,
      data: $('dataDespesa').value
    });
    render();
  };

  $('btnSalvarMes').onclick = () => {
    const mes = $('mesSelecionado').value;
    if (!mes) return alert('Selecione o mês');

    const hist = JSON.parse(localStorage.getItem(HISTORY_KEY)) || {};
    hist[mes] = {
      receitas,
      despesas,
      guardado: +$('dinheiroGuardado').value,
      salvoEm: new Date().toISOString()
    };
    localStorage.setItem(HISTORY_KEY, JSON.stringify(hist));
    alert('Mês salvo!');
    receitas = [];
    despesas = [];
    render();
  };

  $('tipoVisualizacao').onchange = render;

  function render() {
    $('tabelaReceitas').querySelector('tbody').innerHTML =
      receitas.map(r => `<tr><td>${r.valor}</td><td>${r.fonte}</td><td>${r.data}</td></tr>`).join('');

    $('tabelaDespesas').querySelector('tbody').innerHTML =
      despesas.map(d => `<tr><td>${d.valor}</td><td>${d.categoria}</td><td>${d.descricao}</td><td>${d.data}</td></tr>`).join('');

    if (grafico) grafico.destroy();

    if ($('tipoVisualizacao').value === 'tabela') {
      $('grafico').style.display = 'none';
      return;
    }

    $('grafico').style.display = 'block';

    const ctx = $('grafico');
    if ($('tipoVisualizacao').value === 'pizza') {
      const cats = {};
      despesas.forEach(d => cats[d.categoria] = (cats[d.categoria] || 0) + d.valor);
      grafico = new Chart(ctx, { type:'pie', data:{ labels:Object.keys(cats), datasets:[{ data:Object.values(cats) }] }});
    }

    if ($('tipoVisualizacao').value === 'barras') {
      grafico = new Chart(ctx, {
        type:'bar',
        data:{ labels:['Entradas','Despesas'],
        datasets:[{ data:[
          receitas.reduce((a,r)=>a+r.valor,0),
          despesas.reduce((a,d)=>a+d.valor,0)
        ]}]}
      });
    }
  };
});
