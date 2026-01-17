document.addEventListener('DOMContentLoaded',()=>{
  const KEY='financeHistory';
  const lista=document.getElementById('lista');
  const vazio=document.getElementById('vazio');

  if(localStorage.getItem('theme')==='dark')
    document.body.classList.add('dark');

  document.getElementById('toggleTheme').onclick=()=>{
    document.body.classList.toggle('dark');
    localStorage.setItem('theme',
      document.body.classList.contains('dark')?'dark':'light');
  };

  document.getElementById('btnVoltar').onclick=()=>location.href='index.html';

  document.getElementById('btnLimparTudo').onclick=()=>{
    if(confirm('Apagar todo histórico?')){
      localStorage.removeItem(KEY);
      carregar();
    }
  };

  function carregar(){
    const hist=JSON.parse(localStorage.getItem(KEY))||{};
    const meses=Object.keys(hist);

    if(meses.length===0){
      lista.innerHTML='';
      vazio.style.display='block';
      return;
    }

    vazio.style.display='none';

    lista.innerHTML=meses.map(m=>{
      const d=hist[m];
      const r=d.receitas.reduce((a,r)=>a+r.valor,0);
      const s=d.despesas.reduce((a,d)=>a+d.valor,0);

      return `
      <div class="card">
        <h3>${m}</h3>
        <p>Entradas: R$ ${r}</p>
        <p>Despesas: R$ ${s}</p>
        <p>Guardado: R$ ${d.guardado}</p>
        <button onclick="excluir('${m}')">🗑 Excluir</button>
      </div>`;
    }).join('');
  }

  window.excluir = mes => {
    const hist=JSON.parse(localStorage.getItem(KEY));
    delete hist[mes];
    localStorage.setItem(KEY,JSON.stringify(hist));
    carregar();
  };

  carregar();
});
