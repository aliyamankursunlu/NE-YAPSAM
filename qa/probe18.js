const fs=require('fs');
const {JSDOM}=require('jsdom');
const html=fs.readFileSync('/home/user/ne-yapsam.html','utf8');
const dom=new JSDOM(html,{runScripts:'dangerously',pretendToBeVisual:true,url:'https://local.test/'});
const w=dom.window;
setTimeout(()=>{
  try{
    const r=JSON.parse(w.eval(`JSON.stringify({
      ms:window.POOL_MS, total:window.POOL_TOTAL(), stats:window.POOL_STATS(),
      ruArr:window.GEZI_ROUTES.length, real:window.POOL_REAL(), ders:window.POOL_DERS()
    })`));
    console.log('POOL_MS:', r.ms, '| TOPLAM:', r.total, '| RU dizi:', r.ruArr);
    console.log('HAVUZLAR:', r.stats.map(x=>x.k+'='+x.n).join(' | '));
    console.log('GERÇEK/ÜRETİLMİŞ:', JSON.stringify(r.real));
    const d=Object.entries(r.ders).sort((a,b)=>b[1]-a[1]);
    console.log('DERS SAYISI:', d.length);
    console.log('DERS DAĞILIMI:', d.map(x=>x[0]+':'+x[1]).join(', '));
  }catch(e){ console.log('PROBE HATASI:', e.message); }
  process.exit(0);
}, 6000);
