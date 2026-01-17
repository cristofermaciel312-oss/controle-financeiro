document.addEventListener('DOMContentLoaded', () => {

  const lista = document.getElementById('lista');
  const tabelaMes = document.getElementById('tabelaMes');
  const tabelaGeral = document.getElementById('tabelaGeral');
  const modo = document.getElementById('modoVisualizacao');

  const HISTORY_KEY = 'financeHistory';

  const brl = v => (v || 0).toLocaleString('pt-BR', {
    style: 'currency', currency: 'BRL'
  });

  const mesPT = m => {
    const [ano, mes] = m.split('-');
    return new Date(ano, mes - 1).toLocaleString('pt-BR', {
      month: 'long',
      year: 'numeric'
    });
  };

  function getData() {
    return JSON.parse(localStorage.getItem(HISTORY_KEY)) || {};
  }

  function renderCards() {
    const hist = getData();
    lista.innerHTML = Object.keys(hist).map(m => {
      const d = hist[m];
      const totalR = d.receitas.reduce((a,r)=>a+Number(r.valor),0);
      const totalD = d.despesas.reduce((a,r)=>a+Number(r.valor),0);
      return `
        <div class="card">
          <h3>${mesPT(m)}</h3>
          <p>Entradas: ${brl(totalR)}</p>
          <p>Despesas: ${brl(totalD)}</p>
          <p>Saldo: ${brl(totalR-totalD)}</p>
          <p>Guardado: ${brl(d.guardado)}</p>
        </div>
      `;
    }).join('');
  }

  function renderTabelaMes() {
    const hist = getData();
    tabelaMes.innerHTML = `
      <h3>Resumo mensal</h3>
      <table>
        <thead>
          <tr>
            <th>Mês</th>
            <th>Entradas</th>
            <th>Despesas</th>
            <th>Saldo</th>
            <th>Guardado</th>
          </tr>
        </thead>
        <tbody>
          ${Object.keys(hist).map(m=>{
            const d = hist[m];
            const r = d.receitas.reduce((a,x)=>a+Number(x.valor),0);
            const e = d.despesas.reduce((a,x)=>a+Number(x.valor),0);
            return `
              <tr>
                <td>${mesPT(m)}</td>
                <td>${brl(r)}</td>
                <td>${brl(e)}</td>
                <td>${brl(r-e)}</td>
                <td>${brl(d.guardado)}</td>
              </tr>
            `;
          }).join('')}
        </tbody>
      </table>
    `;
  }

  function renderTabelaGeral() {
    const hist = getData();
    let linhas = '';

    Object.keys(hist).forEach(m => {
      hist[m].receitas.forEach(r => {
        linhas += `
          <tr>
            <td>${mesPT(m)}</td>
            <td>Entrada</td>
            <td>${r.fonte}</td>
            <td>${brl(r.valor)}</td>
          </tr>
        `;
      });

      hist[m].despesas.forEach(d => {
        linhas += `
          <tr>
            <td>${mesPT(m)}</td>
            <td>Despesa</td>
            <td>${d.categoria}</td>
            <td>${brl(d.valor)}</td>
          </tr>
        `;
      });
    });

    tabelaGeral.innerHTML = `
      <h3>Extrato geral</h3>
      <table>
        <thead>
          <tr>
            <th>Mês</th>
            <th>Tipo</th>
            <th>Descrição</th>
            <th>Valor</th>
          </tr>
        </thead>
        <tbody>${linhas}</tbody>
      </table>
    `;
  }

  function atualizar() {
    lista.classList.add('hidden');
    tabelaMes.classList.add('hidden');
    tabelaGeral.classList.add('hidden');

    if (modo.value === 'cards') {
      lista.classList.remove('hidden');
      renderCards();
    }

    if (modo.value === 'tabela-mes') {
      tabelaMes.classList.remove('hidden');
      renderTabelaMes();
    }

    if (modo.value === 'tabela-geral') {
      tabelaGeral.classList.remove('hidden');
      renderTabelaGeral();
    }
  }

  modo.addEventListener('change', atualizar);

  document.getElementById('btnVoltar').onclick = () => location.href = 'index.html';
  document.getElementById('btnLimparTudo').onclick = () => {
    if (confirm('Apagar todo o histórico?')) {
      localStorage.removeItem(HISTORY_KEY);
      atualizar();
    }
  };

  document.getElementById('toggleTheme').onclick = () => {
    document.body.classList.toggle('dark');
    localStorage.setItem('theme',
      document.body.classList.contains('dark') ? 'dark' : 'light'
    );
  };

  if (localStorage.getItem('theme') === 'dark') {
    document.body.classList.add('dark');
  }

  atualizar();
});
