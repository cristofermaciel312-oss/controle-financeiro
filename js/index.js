document.addEventListener('DOMContentLoaded', () => {
  const $ = id => document.getElementById(id);
  const KEY = 'financeHistory';

  let receitas = [];
  let despesas = [];
  let grafico = null;

  // Tema
  if (localStorage.getItem('theme') === 'dark')
    document.body.classList.add('dark');

  $('toggleTheme').onclick = () => {
    document.body.classList.toggle('dark');
    localStorage.setItem('theme',
      document.body.classList.contains('dark') ? 'dark' : 'light');
  };

  $('btnHistorico').onclick = () => location.href = 'historico.html';

  $('btnAddReceita').onclick = () => {
    if (!$('valorReceita').value || !$('fonteReceita').value || !$('dataReceita').value) {
      alert('Preencha todos os campos da entrada');
      return;
    }
    receitas.push({
      valor:+$('valorReceita').value,
      fonte:$('fonteReceita').value,
      data:$('dataReceita').value
    });
    limparReceita(); render();
  };

  $('btnAddDespesa').onclick = () => {
    if (!$('valorDespesa').value || !$('categoriaDespesa').value || !$('dataDespesa').value) {
      alert('Preencha os campos obrigatórios da despesa');
      return;
    }
    despesas.push({
      valor:+$('valorDespesa').value,
      categoria:$('categoriaDespesa').value,
      descricao:$('descricaoDespesa').value,
      data:$('dataDespesa').value
    });
    limparDespesa(); render();
  };

  $('btnSalvarMes').onclick = () => {
    if (!$('mesSelecionado').value) {
      alert('Selecione o mês');
      return;
    }
    const hist = JSON.parse(localStorage.getItem(KEY)) || {};
    hist[$('mesSelecionado').value] = {
      receitas, despesas,
      guardado:+$('dinheiroGuardado').value || 0,
      salvoEm:new Date().toISOString()
    };
    localStorage.setItem(KEY, JSON.stringify(hist));
    alert('Mês salvo!');
    receitas=[]; despesas=[]; render();
  };

  $('btnLimparAtual').onclick = () => { receitas=[]; despesas=[]; render(); };
  $('tipoVisualizacao').onchange = render;

  function render() {
    $('tabelaReceitas').querySelector('tbody').innerHTML =
      receitas.map(r=>`<tr><td>${r.valor}</td><td>${r.fonte}</td><td>${r.data}</td></tr>`).join('');

    $('tabelaDespesas').querySelector('tbody').innerHTML =
      despesas.map(d=>`<tr><td>${d.valor}</td><td>${d.categoria}</td><td>${d.descricao||'-'}</td><td>${d.data}</td></tr>`).join('');

    if (grafico) grafico.destroy();
    const canvas = $('grafico');

    if ($('tipoVisualizacao').value === 'tabela') {
      canvas.style.display='none';
      return;
    }

    canvas.style.display='block';

    if ($('tipoVisualizacao').value === 'pizza') {
      const cat={};
      despesas.forEach(d=>cat[d.categoria]=(cat[d.categoria]||0)+d.valor);
      grafico=new Chart(canvas,{type:'pie',data:{labels:Object.keys(cat),datasets:[{data:Object.values(cat)}]}});
    }

    if ($('tipoVisualizacao').value === 'barras') {
      grafico=new Chart(canvas,{type:'bar',data:{labels:['Entradas','Despesas'],datasets:[{data:[
        receitas.reduce((a,r)=>a+r.valor,0),
        despesas.reduce((a,d)=>a+d.valor,0)
      ]}]}});
    }
  }

  function limparReceita(){ $('valorReceita').value=''; $('fonteReceita').value=''; $('dataReceita').value=''; }
  function limparDespesa(){ $('valorDespesa').value=''; $('categoriaDespesa').value=''; $('descricaoDespesa').value=''; $('dataDespesa').value=''; }

  render();
});
