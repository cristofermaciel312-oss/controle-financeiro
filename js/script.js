document.addEventListener('DOMContentLoaded', () => {
  const $ = id => document.getElementById(id);

  const receitas = [];
  const despesas = [];

  const ctx = $('grafico').getContext('2d');
  let chart = null;

  const brl = v => (v||0).toLocaleString('pt-BR',{style:'currency',currency:'BRL'});

  // Tema
  if(localStorage.getItem('theme')==='dark') document.body.classList.add('dark');
  $('toggleTheme').onclick=()=>{
    document.body.classList.toggle('dark');
    localStorage.setItem('theme',document.body.classList.contains('dark')?'dark':'light');
  };

  // Mês automático
  const hoje = new Date();
  $('mesSelecionado').value =
    `${hoje.getFullYear()}-${String(hoje.getMonth()+1).padStart(2,'0')}`;

  function renderTabelas(){
    $('tbodyReceitas').innerHTML = receitas.map(r =>
      `<tr><td>${brl(r.valor)}</td><td>${r.fonte}</td><td>${r.data}</td></tr>`
    ).join('');

    $('tbodyDespesas').innerHTML = despesas.map(d =>
      `<tr><td>${brl(d.valor)}</td><td>${d.categoria}</td><td>${d.descricao||'-'}</td><td>${d.data}</td></tr>`
    ).join('');
    
    // -------- EDITAR MÊS --------
const EDIT_KEY = 'mesParaEdicao';
const editMes = localStorage.getItem(EDIT_KEY);

if (editMes) {
  const hist = JSON.parse(localStorage.getItem('financeHistory')) || {};
  const dados = hist[editMes];

  if (dados) {
    document.getElementById('mesSelecionado').value = editMes;
    document.getElementById('dinheiroGuardado').value = dados.guardado || 0;

    receitas = dados.receitas || [];
    despesas = dados.despesas || [];

    renderTabelas();
  }
}
  localStorage.removeItem(EDIT_KEY);
  }

  function renderGrafico(){
    if(chart) chart.destroy();
    const tipo = $('tipoGrafico').value;
    if(tipo==='nenhum') return;

    if(tipo==='pizza'){
      chart = new Chart(ctx,{
        type:'pie',
        data:{
          labels:despesas.map(d=>d.categoria),
          datasets:[{data:despesas.map(d=>d.valor)}]
        }
      });
    }

    if(tipo==='barra'){
      const totalR = receitas.reduce((a,b)=>a+b.valor,0);
      const totalD = despesas.reduce((a,b)=>a+b.valor,0);
      chart = new Chart(ctx,{
        type:'bar',
        data:{
          labels:['Entradas','Despesas'],
          datasets:[{data:[totalR,totalD]}]
        }
      });
    }
  }

  $('btnAddReceita').onclick=()=>{
    receitas.push({
      valor:+$('valorReceita').value,
      fonte:$('fonteReceita').value,
      data:$('dataReceita').value
    });
    renderTabelas(); renderGrafico();
  };

  $('btnAddDespesa').onclick=()=>{
    despesas.push({
      valor:+$('valorDespesa').value,
      categoria:$('categoriaDespesa').value,
      descricao:$('descricaoDespesa').value,
      data:$('dataDespesa').value
    });
    renderTabelas(); renderGrafico();
  };

  $('tipoGrafico').onchange=renderGrafico;

  $('btnSalvarMes').onclick=()=>{
    const key = $('mesSelecionado').value;
    const hist = JSON.parse(localStorage.getItem('financeHistory')||'{}');
    hist[key] = { receitas, despesas, guardado:+$('dinheiroGuardado').value };
    localStorage.setItem('financeHistory',JSON.stringify(hist));
    location.href='historico.html';
  };

  $('btnHistorico').onclick=()=>location.href='historico.html';
});
