document.addEventListener('DOMContentLoaded', () => {
  const tipoVisualizacao = document.getElementById('tipoVisualizacao');
  const areaTabela = document.getElementById('areaTabela');
  const areaGrafico = document.getElementById('areaGrafico');
  const ctx = document.getElementById('grafico').getContext('2d');

  let graficoAtual = null;

  const HISTORY_KEY = 'financeHistory';

  function getMesAtual() {
    const raw = localStorage.getItem(HISTORY_KEY);
    if (!raw) return null;
    const hist = JSON.parse(raw);
    const meses = Object.keys(hist);
    return meses.length ? hist[meses[meses.length - 1]] : null;
  }

  function renderGraficoPizza(despesas) {
    const categorias = {};
    despesas.forEach(d => {
      categorias[d.categoria] = (categorias[d.categoria] || 0) + d.valor;
    });

    return new Chart(ctx, {
      type: 'pie',
      data: {
        labels: Object.keys(categorias),
        datasets: [{
          data: Object.values(categorias)
        }]
      }
    });
  }

  function renderGraficoBarras(receitas, despesas) {
    const totalR = receitas.reduce((a, r) => a + r.valor, 0);
    const totalD = despesas.reduce((a, d) => a + d.valor, 0);

    return new Chart(ctx, {
      type: 'bar',
      data: {
        labels: ['Entradas', 'Despesas'],
        datasets: [{
          data: [totalR, totalD]
        }]
      }
    });
  }

  function atualizarVisualizacao() {
    const mes = getMesAtual();
    if (!mes) return;

    if (graficoAtual) {
      graficoAtual.destroy();
      graficoAtual = null;
    }

    const tipo = tipoVisualizacao.value;

    if (tipo === 'tabela') {
      areaTabela.style.display = 'block';
      areaGrafico.style.display = 'none';
      return;
    }

    areaTabela.style.display = 'none';
    areaGrafico.style.display = 'block';

    if (tipo === 'pizza') {
      graficoAtual = renderGraficoPizza(mes.despesas || []);
    }

    if (tipo === 'barras') {
      graficoAtual = renderGraficoBarras(
        mes.receitas || [],
        mes.despesas || []
      );
    }
  }

  tipoVisualizacao.addEventListener('change', atualizarVisualizacao);

  atualizarVisualizacao();
});
