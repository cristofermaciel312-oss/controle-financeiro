document.addEventListener('DOMContentLoaded',()=>{

const $ = id => document.getElementById(id);
const HISTORY_KEY = 'financeHistory';

let receitas = [];
let despesas = [];
let chart = null;

// ===== THEME =====
if(localStorage.getItem('theme')==='dark') document.body.classList.add('dark');
$('toggleTheme').onclick=()=>{
  document.body.classList.toggle('dark');
  localStorage.setItem('theme',document.body.classList.contains('dark')?'dark':'light');
};

// ===== DATA =====
const today = new Date();
$('mesSelecionado').value =
`${today.getFullYear()}-${String(today.getMonth()+1).padStart(2,'0')}`;

// ===== HELPERS =====
const brl = n => (n||0).toLocaleString('pt-BR',{style:'currency',currency:'BRL'});

// ===== RENDER =====
function render(){
  $('tbodyReceitas').innerHTML = receitas.map(r=>`
  <tr><td>${brl(r.valor)}</td><td>${r.fonte}</td><td>${r.data}</td></tr>`).join('');

  $('tbodyDespesas').innerHTML = despesas.map(d=>`
  <tr><td>${brl(d.valor)}</td><td>${d.categoria}</td><td>${d.descricao||'-'}</td><td>${d.data}</td></tr>`).join('');

  renderGrafico();
}

// ===== ADD =====
$('btnAddReceita').onclick=()=>{
  receitas.push({
    valor:+$('valorReceita').value,
    fonte:$('fonteReceita').value,
    data:$('dataReceita').value
  });
  render();
};

$('btnAddDespesa').onclick=()=>{
  despesas.push({
    valor:+$('valorDespesa').value,
    categoria:$('categoriaDespesa').value,
    descricao:$('descricaoDespesa').value,
    data:$('dataDespesa').value
  });
  render();
};

// ===== SAVE =====
$('btnSalvarMes').onclick=()=>{
  const mes = $('mesSelecionado').value;
  const hist = JSON.parse(localStorage.getItem(HISTORY_KEY)||'{}');

  hist[mes]={
    receitas:[...(hist[mes]?.receitas||[]),...receitas],
    despesas:[...(hist[mes]?.despesas||[]),...despesas],
    guardado:+$('dinheiroGuardado').value||0,
    salvoEm:new Date().toISOString()
  };

  localStorage.setItem(HISTORY_KEY,JSON.stringify(hist));
  receitas=[]; despesas=[];
  render();
};

// ===== GRAPH =====
$('tipoGrafico').onchange=renderGrafico;

function renderGrafico(){
  const tipo = $('tipoGrafico').value;
  const ctx = $('grafico');
  if(chart) chart.destroy();
  if(tipo==='nenhum') return;

  const hist = JSON.parse(localStorage.getItem(HISTORY_KEY)||'{}');
  const meses = Object.keys(hist);

  if(tipo==='resumo'){
    chart=new Chart(ctx,{
      type:'bar',
      data:{
        labels:meses,
        datasets:[
          {label:'Entradas',data:meses.map(m=>hist[m].receitas.reduce((a,r)=>a+r.valor,0))},
          {label:'Despesas',data:meses.map(m=>hist[m].despesas.reduce((a,d)=>a+d.valor,0))},
        ]
      }
    });
  }

  if(tipo==='pizza'){
    const categorias={};
    despesas.forEach(d=>categorias[d.categoria]=(categorias[d.categoria]||0)+d.valor);
    chart=new Chart(ctx,{
      type:'pie',
      data:{labels:Object.keys(categorias),datasets:[{data:Object.values(categorias)}]}
    });
  }

  if(tipo==='linha'){
    chart=new Chart(ctx,{
      type:'line',
      data:{
        labels:meses,
        datasets:[{
          label:'Saldo',
          data:meses.map(m=>
            hist[m].receitas.reduce((a,r)=>a+r.valor,0)-
            hist[m].despesas.reduce((a,d)=>a+d.valor,0)
          )
        }]
      }
    });
  }
}

// ===== NAV =====
$('btnHistorico').onclick=()=>location.href='historico.html';
$('btnLimpar').onclick=()=>{receitas=[];despesas=[];render();};

});
