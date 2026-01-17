document.addEventListener('DOMContentLoaded', () => {
  const $ = id => document.getElementById(id);
  const HISTORY_KEY = 'financeHistory';

  let receitas = [];
  let despesas = [];
  let grafico = null;

  // Tema
  if (localStorage.getItem('theme') === 'dark') {
    document.body.classList.add('dark');
  }

  $('toggleTheme').onclick = () => {
    document.body.classList.toggle('dark');
    localStorage.setItem(
      'theme',
      document.body.classList.contains('dark') ? 'dark' : 'light'
    );
  };

  // Histórico
  $('btnHistorico').onclick = () => {
    window.location.href = 'historico.html';
  };

  // Adicionar receita
  $('btnAddReceita').onclick = () => {
    if (!$('valorReceita').value || !$('fonteReceita').value || !$('dataReceita').value) {
      alert('Preencha todos os campos da entrada');
      return;
    }

    receitas.push({
      valor: Number($('valorReceita').value),
      fonte: $('fonteReceita').value,
      data: $('dataReceita').value
    });

    limparInputsReceita();
    render();
  };

  // Adicionar despesa
  $('btnAddDespesa').onclick = () => {
    if (!$('valorDespesa').value || !$('categoriaDespesa').value || !$('dataDespesa').value) {
      alert('Preencha os campos obrigatórios da despesa');
      return;
    }

    despesas.push({
      valor: Number($('valorDespesa').value),
      categoria: $('categoriaDespesa').value,
      descricao: $('descricaoDespesa').value,
      data: $('dataDespesa').value
    });

    limparInputsDespesa();
    render();
  };

  // Salvar mês
  $('btnSalvarMes').onclick = () => {
    if (!$('mesSelecionado').value) {
      alert('Selecione o mês');
      return;
    }

    const hist = JSON.parse(localStorage.getItem(HISTORY_KEY)) || {};
    hist[$('mesSelecionado').value] = {
      receitas,
      despesas,
      guardado: Number($('dinheiroGuardado').value || 0),
      salvoEm: new Date().toISOString()
    };

    localStorage.setItem(HISTORY_KEY, JSON.stringify(hist));
    alert('Mês salvo com sucesso!');
    receitas = [];
    despesas = [];
    render();
  };

  // Visualização
  $('tipoVisualizacao').onchange = render;

  function render() {
    // Tabelas
    $('tabelaReceitas').querySelector('tbody').innerHTML =
      receitas.map(r =>
        `<tr><td>${r.valor}</td><td>${r.fonte}</td><td>${r.data}</td></tr>`
      ).join('');

    $('tabelaDespesas').querySelector('tbody').innerHTML =
      despesas.map(d =>
        `<tr><td>${d.valor}</td><td>${d.categoria}</td><td>${d.descricao || '-'}</td><td>${d.data}</td></tr>`
      ).join('');

    // Gráfico
    if (grafico) grafico.destroy();

    const canvas = $('grafico');
    if ($('tipoVisualizacao').value === 'tabela') {
      canvas.style.display = 'none';
      return;
    }

    canvas.style.display = 'block';

    if ($('tipoVisualizacao').value === 'pizza') {
      const categorias = {};
      despesas.forEach(d => {
        categorias[d.categoria] = (categorias[d.categoria] || 0) + d.valor;
      });

      grafico = new Chart(canvas, {
        type: 'pie',
        data: {
          labels: Object.keys(categorias),
          datasets: [{ data: Object.values(categorias) }]
        }
      });
    }

    if ($('tipoVisualizacao').value === 'barras') {
      grafico = new Chart(canvas, {
        type: 'bar',
        data: {
          labels: ['Entradas', 'Despesas'],
          datasets: [{
            data: [
              receitas.reduce((a, r) => a + r.valor, 0),
              despesas.reduce((a, d) => a + d.valor, 0)
            ]
          }]
        }
      });
    }
  }

  function limparInputsReceita() {
    $('valorReceita').value = '';
    $('fonteReceita').value = '';
    $('dataReceita').value = '';
  }

  function limparInputsDespesa() {
    $('valorDespesa').value = '';
    $('categoriaDespesa').value = '';
    $('descricaoDespesa').value = '';
    $('dataDespesa').value = '';
  }

  render();
});
