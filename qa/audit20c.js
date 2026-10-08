const puppeteer=require('puppeteer');
const SEL='#main [onclick]';
const TABS=['home','sikildim','oyun_yok','izle','dinle','yesem','gezi','test','ogren','bahce','notlar','avatar','ozet','ayarlar'];
const ATLA=/Sıfırla|Temizle|Verileri|verileri sil|Sil$|çıkış|Çıkış/i;
(async()=>{
  const b=await puppeteer.launch({headless:'new',args:['--no-sandbox','--disable-dev-shm-usage','--window-size=1440,1000']});
  const p=await b.newPage();
  await p.setViewport({width:1440,height:1000});
  const ERR=[];
  p.on('pageerror',e=>ERR.push(e.message.slice(0,100)));
  await p.goto('file:///home/user/ne-yapsam.html',{waitUntil:'load'});
  await p.waitForFunction('window.POOL_TOTAL&&window.POOL_TOTAL()>67900',{timeout:60000});
  const sleep=ms=>new Promise(r=>setTimeout(r,ms));
  await p.waitForFunction("!!document.querySelector('#overlay.open')",{timeout:20000});
  await p.evaluate(()=>{ const o=document.querySelector('#overlay.open'); const btn=[...o.querySelectorAll('button')].find(x=>/Başlayalım/.test(x.textContent)); if(btn) btn.click(); });
  await p.waitForFunction("!document.querySelector('#overlay.open')",{timeout:10000});
  await sleep(400);
  await p.evaluate(()=>{ S.points=9000; save(); });

  const rapor=[];
  for(const tab of TABS){
    await p.evaluate(t=>{ try{ closeModal(); }catch(e){} App.go(t); },tab);
    await sleep(450);
    // sözdizimi bozuk handler taraması
    const synt=await p.evaluate((Q)=>document.querySelectorAll(Q).length - [...document.querySelectorAll(Q)].filter(el=>{ try{ new Function(el.getAttribute('onclick')); return true; }catch(e){ return false; } }).length, SEL);
    const toplam=await p.evaluate((Q)=>Math.min(document.querySelectorAll(Q).length,60),SEL);
    const sorun=[];
    let calisan=0, atlanan=0;
    for(let i=0;i<toplam;i++){
      const h=await p.evaluate((Q,idx,atla)=>{
        const el=[...document.querySelectorAll(Q)][idx]; if(!el) return null;
        const txt=(el.textContent||'').trim().slice(0,26);
        if(new RegExp(atla,'i').test(txt)) return {atla:true};
        el.scrollIntoView({block:'center'});
        const r=el.getBoundingClientRect(); if(!r.width||!r.height) return {atla:true};
        const cx=r.left+r.width/2, cy=r.top+r.height/2, top=document.elementFromPoint(cx,cy);
        const dob=()=>document.querySelectorAll('#toasts .toast').length;
        window.__snap={st:JSON.stringify({eq:S.equipped,owned:(S.owned||[]).length,pts:S.points,tab:App.tab,cat:Shop&&Shop.cat,pose:S.user&&S.user.pose,theme:document.documentElement.getAttribute('data-theme'),plan:(S.plan||[]).length,notes:(S.notes||[]).length,fav:(S.fav||[]).length,watch:(S.watch||[]).length,dob:dob(),html:document.querySelector('#main').innerHTML.length,modal:!!document.querySelector('#overlay.open')})};
        return {x:cx,y:cy,txt:txt,oc:(el.getAttribute('onclick')||'').slice(0,60),
                engel: !top || !(top===el||el.contains(top)||top.contains(el)),
                ustte: top? (top.tagName+'.'+(top.className||'').toString().slice(0,24)) : 'yok'};
      },SEL,i,ATLA.source);
      if(!h) continue;
      if(h.atla){ atlanan++; continue; }
      if(h.engel){ sorun.push({txt:h.txt, tip:'ENGELLİ', ustte:h.ustte, oc:h.oc}); continue; }
      await p.mouse.click(h.x,h.y);
      await sleep(230);
      const a=await p.evaluate(()=>JSON.stringify({eq:S.equipped,owned:(S.owned||[]).length,pts:S.points,tab:App.tab,cat:Shop&&Shop.cat,pose:S.user&&S.user.pose,theme:document.documentElement.getAttribute('data-theme'),plan:(S.plan||[]).length,notes:(S.notes||[]).length,fav:(S.fav||[]).length,watch:(S.watch||[]).length,dob:document.querySelectorAll('#toasts .toast').length,html:document.querySelector('#main').innerHTML.length,modal:!!document.querySelector('#overlay.open')}));
      if(a!==await p.evaluate(()=>JSON.stringify(window.__snap.st))){ calisan++; } else { sorun.push({txt:h.txt, tip:'TEPKİ YOK', oc:h.oc}); }
      // modal açıldıysa kapat
      await p.evaluate(()=>{ if(document.querySelector('#overlay.open')){ try{ closeModal(); }catch(e){} } });
      await sleep(60);
    }
    rapor.push({tab:tab, toplam:toplam, calisan:calisan, atlanan:atlanan, sozdizimi:synt, sorun:sorun});
    console.log('•', tab.padEnd(9), '| test:', String(calisan).padStart(2), 'çalıştı /', toplam, '| atlanan:', atlanan, '| bozuk handler:', synt, '| sorun:', sorun.length);
    sorun.slice(0,6).forEach(s=>console.log('     ❌', s.txt, '→', s.tip, s.ustte?('(üstte: '+s.ustte+')'):'', '|', s.oc));
  }
  const tS=rapor.reduce((s,r)=>s+r.sozdizimi,0), tS2=rapor.reduce((s,r)=>s+r.sorun.length,0);
  console.log('\n=== TOPLAM ===');
  console.log('bozuk handler:', tS, '| sorunlu tuş:', tS2, '| JS hatası:', ERR.length, '| sekme:', rapor.length);
  await b.close();
})();
