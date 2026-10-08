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
  // bol puan ver ki satın alma yolu da test edilsin
  await p.evaluate(()=>{ S.points=9000; S.user.skin=3; S.user.hair='#8b3a3a'; S.user.eye='#a16207'; save(); App.go('avatar'); });
  await sleep(700);

  const toplam=await p.evaluate((Q)=>document.querySelectorAll(Q).length,SEL);
  const sonuc=[];
  for(let i=0;i<toplam;i++){
    const hazir=await p.evaluate((Q,idx)=>{
      const el=[...document.querySelectorAll(Q)][idx]; if(!el) return null;
      el.scrollIntoView({block:'center'});
      const r=el.getBoundingClientRect(); if(!r.width||!r.height) return {atla:true};
      const cx=r.left+r.width/2, cy=r.top+r.height/2, top=document.elementFromPoint(cx,cy);
      const dob=()=>[...document.querySelectorAll('#toasts *')].length;
      window.__b={st:JSON.stringify({eq:S.equipped,owned:(S.owned||[]).length,pts:S.points,cat:Shop.cat,pose:S.user.pose,anim:S.user.anim,skin:S.user.skin,hair:S.user.hair,eye:S.user.eye}), dob:dob(), html:document.querySelector('#main').innerHTML.length};
      return {x:cx,y:cy, txt:(el.textContent||'').trim().slice(0,26), oc:(el.getAttribute('onclick')||'').slice(0,70),
              engel: !top || !(top===el||el.contains(top)||top.contains(el))};
    },SEL,i);
    if(!hazir||hazir.atla) continue;
    if(hazir.engel){ sonuc.push({txt:hazir.txt, durum:'ENGELLİ (üstte başka öğe)', oc:hazir.oc}); continue; }
    await p.mouse.click(hazir.x, hazir.y);
    await sleep(300);
    const r=await p.evaluate(()=>{
      const st=JSON.stringify({eq:S.equipped,owned:(S.owned||[]).length,pts:S.points,cat:Shop.cat,pose:S.user.pose,anim:S.user.anim,skin:S.user.skin,hair:S.user.hair,eye:S.user.eye});
      return {st:st, dob:[...document.querySelectorAll('#toasts *')].length, html:document.querySelector('#main').innerHTML.length};
    });
    const changed = (r.st!==hazir.st) || (r.dob>hazir.dob) || (r.html!==hazir.html);
    sonuc.push({txt:hazir.txt, durum: changed?'çalıştı':'TEPKİ YOK', oc:hazir.oc,
                detay: (r.st!==hazir.st?'durum':(r.dob>hazir.dob?'bildirim':'yeniden çizim'))});
  }
  const olu=sonuc.filter(x=>x.durum!=='çalıştı');
  console.log('AVATAR TUŞ TESTİ (puan: 9000) — toplam:', sonuc.length, '| çalışan:', sonuc.length-olu.length, '| sorunlu:', olu.length);
  olu.forEach(x=>console.log('   ❌', x.txt, '→', x.durum, '|', x.oc));
  const ornek=sonuc.filter(x=>x.durum==='çalıştı').slice(0,6).map(x=>x.txt+'('+x.detay+')');
  console.log('   örnek çalışanlar:', ornek.join(', '));
  console.log('\nJS HATALARI:', ERR.length? ('\n'+ERR.slice(0,6).join('\n')) : '0 ✅');
  await b.close();
})();
