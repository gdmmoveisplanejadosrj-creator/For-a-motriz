const $ = id=>document.getElementById(id)
let MODO=1

// LOGIN
$('btnEntrar').onclick=()=>$('pw').value==='2026'?($('login').classList.add('oculto'),$('app').classList.remove('oculto')):alert('Senha errada')
$('pw').addEventListener('keydown',e=>e.key==='Enter'&&$('btnEntrar').click())

// SELECIONA MOTOR
document.querySelectorAll('.modos button').forEach(b=>{
  b.onclick=()=>{
    document.querySelectorAll('.modos button').forEach(x=>x.classList.remove('ativo'))
    b.classList.add('ativo'); MODO=+b.dataset.m
  }
})

// GERA CÓDIGO
$('gerar').onclick=async()=>{
  const p=$('prompt').value.trim()
  if(!p) return alert('Escreva o que quer criar')
  const kG=$('kG').value.trim(), kZ=$('kZ').value.trim()
  const s=$('saida'); s.classList.remove('oculto'); s.textContent='⏳ Gerando…'
  $('zip').classList.add('oculto')

  const TOKENS=[600,2000,4000][MODO-1]
  const INSTRUCAO=`Crie completo, limpo, em pastas organizadas: ${p}. Responda sempre separando cada arquivo com --- nome.ext --- e logo abaixo seu conteúdo.`

  try{
    let texto=''
    if(MODO===2 && kG){
      const r=await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${kG}`,{
        method:'POST',headers:{'Content-Type':'application/json'},
        body:JSON.stringify({generationConfig:{maxOutputTokens:TOKENS},contents:[{parts:[{text:INSTRUCAO}]}]})
      })
      const d=await r.json()
      texto=d.candidates?.[0]?.content?.parts?.[0]?.text || '⚠️ Sem retorno, verifique a chave'
    }else if(MODO===3 && kZ){
      texto='✅ GLM‑5.2 pronto — use a chave ZhipuAI para chamada real'
    }else{
      texto=`// MODO RÁPIDO / ESTRUTURA PARA: ${p}
// Arquivos sugeridos:
// ├── index.html
// ├── app.js
// └── style.css
// Para código completo use MODO GEMINI com chave configurada.`
    }
    s.textContent=texto
    window._ULTIMO_TEXTO=texto
    $('zip').classList.remove('oculto')
  }catch(e){ s.textContent='❌ Erro: '+e.message }
}

// GERA ZIP NA HORA
$('zip').onclick=async()=>{
  const t=window._ULTIMO_TEXTO||$('saida').textContent
  const zip=new JSZip(), pasta=zip.folder('projeto')
  const rx=/---\s*([^\n]+\.[a-z0-9]+)\s*---/gi
  let m, ultimo=0, partes=[]
  while((m=rx.exec(t))!==null){
    if(ultimo) partes.push({nome:partes.pop().nome,conteudo:t.slice(ultimo,m.index).trim()})
    partes.push({nome:m[1].trim()}); ultimo=m.index+m[0].length
  }
  if(partes.length && ultimo) partes[partes.length-1].conteudo=t.slice(ultimo).trim()
  if(!partes.length) pasta.file('saida.txt',t)
  else partes.forEach(p=>pasta.file(p.nome,p.conteudo||''))

  $('zip').textContent='📦 EMPACOTANDO…'
  const blob=await zip.generateAsync({type:'blob'})
  const a=document.createElement('a')
  a.href=URL.createObjectURL(blob); a.download='projeto-gerado.zip'; a.click()
  URL.revokeObjectURL(a.href)
  setTimeout(()=>$('zip').textContent='📦 BAIXAR PROJETO .ZIP',1400)
}
