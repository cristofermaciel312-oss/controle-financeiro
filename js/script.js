document.addEventListener('DOMContentLoaded', () => {

const HISTORY_KEY = 'financeHistory';

const mesInput = document.getElementById('mesSelecionado');
const guardadoInput = document.getElementById('dinheiroGuardado');

const tbodyReceitas = document.getElementById('tbodyReceitas');
const tbodyDespesas = document.getElementById('tbodyDespesas');

let receitas = [];
let despesas = [];
let grafico = null;

// mês padrão = atual
const hoje = new Date();
mesInput.value = hoje.toISOString().slice(0,7);

// tema
const theme = localStorage.getItem('theme');
if(theme === 'dark') document.body.classList.add('dark');

document.getElementById('toggleTheme').onclick = () => {
  document.body.classList.toggle('dark');
  localStorage.setItem('theme',
    document.body.classList.contains('dark') ? 'dark' : 'light'
  );
};

document.getElementById('btnHistorico').onclick = () => {
  window.location.href = 'historico.html';
};

function salvarTemp() {
  const hist = JSON.parse(localStorage.getItem(HISTORY_KEY)) || {};
  hist[mesInput.value] = {
    guardado:Number(guardadoInput.value||0),
    receitas,
    despesas,
    salvoEm:new Date().toISOString()
  };
  localStorage.setItem(HISTORY_KEY, JSON.stringify(hist));
}

function carregarMes() {
  const hist = JSON.parse(localStorage.getItem(HISTORY_KEY)) || {};
  const d = hist[mesInput.value];
  receitas = d?.receitas || [];
  despesas = d?.despesas || [];
  guardadoInput.value = d?.guardado || '';
  render();
}

mesInput.onchange = carregarMes;

document.getElementById('btnAddReceita').onclick = () => {
  receitas.push({
    valor:Number(valorReceita.value),
    fonte:fonteReceita.value,
    data:dataReceita.value
  });
  salvarTemp();
  render();
};

document.getElementById('btnAddDespesa').onclick = () => {
  despesas.push({
    valor:Number(valorDespesa.value),
    categoria:categoriaDespesa.value,
    descricao:descricaoDespesa.value,
    data:dataDespesa.value
  });
  salvarTemp();
  render();
};

document.getElementById('btnSalvarMes').onclick = () => {
  salvarTemp();
  alert('Mês salvo com sucesso!');
};

document.getElementById('btnLimpar').onclick = () => {
  receitas=[];
  despesas=[];
  salvarTemp();
  render();
};

function render(){
  tbodyReceitas.innerHTML = receitas.map(r=>`
<tr><td>R$ ${r.valor}</td><td>${r.fonte}</td><td>${r.data}</td></tr>`).join('');
  tbodyDespesas.innerHTML = despesas.map(d=>`
<tr><td>R$ ${d.valor}</td><td>${d.categoria}</td><td>${d.descricao||'-'}</td><td>${d.data}</td></tr>`).join('');
  renderGrafico();
}

function renderGrafico(){
  if(grafico) grafico.destroy();
  const tipo = tipoGrafico.value;
  if(tipo==='nenhum') return;

  const ctx = graficoCanvas.getContext('2d');

  if(tipo==='resumo'){
    const totalR = receitas.reduce((a,b)=>a+b.valor,0);
    const totalD = despesas.reduce((a,b)=>a+b.valor,0);
    grafico = new Chart(ctx,{
      type:'bar',
      data:{labels:['Entradas','Despesas'],datasets:[{data:[totalR,totalD]}]}
    });
  }

  if(tipo==='pizza'){
    const cats={};
    despesas.forEach(d=>cats[d.categoria]=(cats[d.categoria]||0)+d.valor);
    grafico = new Chart(ctx,{
      type:'pie',
      data:{labels:Object.keys(cats),datasets:[{data:Object.values(cats)}]}
    });
  }
}

tipoGrafico.onchange = renderGrafico;

carregarMes();

});
