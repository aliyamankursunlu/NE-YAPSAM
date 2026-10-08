const puppeteer=require('puppeteer');
const SEL='#main [onclick]';
(async()=>{
  const b=await puppeteer.launch({headless:'new',args:['--no-sandbox','--disable-dev-shm-usage','--window-size=1440,1000']});
  const p=await b.newPage();
  await p.setViewport({width:1440,height:1000});
  const ERR=[];
  p.on('pageerror',e=>ERR.push('pageerror: '+e.message));
  p.on('console',m=>{ if(m.type()==='error') ERR.push('console: '+m.text().slice(0,140)); });
  await p.goto('file:///home/user/ne-yapsam.html',{waitUntil:'load'});
  await p.waitForFunction('window.POOL_TOTAL&&window.POOL_TOTAL()>67900',{timeout:60000});
  const sleep=ms=>new Promise(r=>setTimeout(r,ms));
  await p.waitForFunction("!!document.querySelector('#overlay.open')",{timeout:20000});
  await p.evaluate(()=>{ const o=document.querySelector('#overlay.open'); const btn=[...o.querySelectorAll('button')].find(x=>/Başlayalım/.test(x.textContent)); if(btn) btn.click(); });
  await p.waitForFunction("!document.querySelector('#overlay.open')",{timeout:10000});
  await sleep(400);

  // avatar sekmesine geç
  await p.evaluate(()=>App.go('avatar'));
  await sleep(700);

  // 1) sözdizimi bozuk handler var mı?
  const synt=await p.evaluate((Q)=>{
    const bad=[];
    document.querySelectorAll(Q).forEach(el=>{
      const oc=el.getAttribute('onclick');
      try{ new Function(oc); }catch(e){ bad.push({txt:(el.textContent||'').trim().slice(0,26), oc:oc.slice(0,80), err:String(e.message).slice(0,70)}); }
    });
    return bad;
  },SEL);
  console.log('SÖZDİZİMİ BOZUK handler sayısı:', synt.length);
  synt.slice(0,10).forEach(x=>console.log('   ✗', x.txt, '|', x.oc, '|', x.err));

  // 2) her öğeyi tek tek tıkla, durum değişimini ölç
  const toplam=await p.evaluate((Q)=>document.querySelectorAll(Q).length,SEL);
  const sonuc=[];
  for(let i=0;i<toplam;i++){
    const info=await p.evaluate((Q,idx)=>{
      const els=[...document.querySelectorAll(Q)];
      const el=els[idx]; if(!el) return null;
      el.scrollIntoView({block:'center', inline:'center'});
      const r=el.getBoundingClientRect();
      if(!r.width||!r.height) return {atla:true, txt:(el.textContent||'').trim().slice(0,24)};
      const snap=()=>JSON.stringify({eq:S.equipped, owned:(S.owned||[]).length, pts:S.points, cat:Shop.cat, pose:S.user.pose, anim:S.user.anim, skin:S.user.skin, hair:S.user.hair, eye:S.user.eye});
      window.__snapBefore=snap();
      const cx=r.left+r.width/2, cy=r.top+r.height/2;
      const top=document.elementFromPoint(cx,cy);
      const engel = !top || !(top===el||el.contains(top)||top.contains(el));
      return {x:cx,y:cy, txt:(el.textContent||'').trim().slice(0,24), oc:(el.getAttribute('onclick')||'').slice(0,70),
              engel: engel, tag:el.tagName, cls:(el.className||'').toString().slice(0,24)};
    },SEL,i);
    if(!info||info.atla) continue;
    if(info.engel){ sonuc.push({txt:info.txt, durum:'ENGELLİ', oc:info.oc}); continue; }
    await p.mouse.click(info.x, info.y);
    await sleep(240);
    const degisti=await p.evaluate(()=>{
      const snap=()=>JSON.stringify({eq:S.equipped, owned:(S.owned||[]).length, pts:S.points, cat:Shop.cat, pose:S.user.pose, anim:S.user.anim, skin:S.user.skin, hair:S.user.hair, eye:S.user.eye});
      return snap()!==window.__snapBefore;
    });
    sonuc.push({txt:info.txt, durum: degisti?'çalıştı':'TEPKİ YOK', oc:info.oc, tag:info.tag});
  }
  const olu=sonuc.filter(x=>x.durum!=='çalıştı');
  console.log('\nAVATAR TUŞ TESTİ — toplam:', sonuc.length, '| çalışan:', sonuc.length-olu.length, '| sorunlu:', olu.length);
  olu.slice(0,30).forEach(x=>console.log('   ❌', '['+x.tag+']', x.txt, '→', x.durum, '| onclick:', x.oc));
  console.log('\nJS HATALARI:', ERR.length? ('\n'+ERR.slice(0,6).join('\n')) : '0 ✅');
  await b.close();
})();
