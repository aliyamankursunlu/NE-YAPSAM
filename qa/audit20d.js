const puppeteer=require('puppeteer');
const SEL='#main [onclick]';
const TABS=['home','sikildim','oyun_yok','izle','dinle','yesem','gezi','test','ogren','bahce','notlar','avatar','ozet','ayarlar'];
const ATLA=/Sıfırla|Temizle|Verileri|verileri sil|Sil$|çıkış|Çıkış/i;
(async()=>{
  const b=await puppeteer.launch({headless:'new',args:['--no-sandbox','--disable-dev-shm-usage','--window-size=1440,1000']});
  const p=await b.newPage(); await p.setViewport({width:1440,height:1000});
  const ERR=[]; p.on('pageerror',e=>ERR.push(e.message.slice(0,110)));
  await p.goto('file:///home/user/ne-yapsam.html',{waitUntil:'load'});
  await p.waitForFunction('window.POOL_TOTAL&&window.POOL_TOTAL()>67900',{timeout:60000});
  const sleep=ms=>new Promise(r=>setTimeout(r,ms));
  await p.waitForFunction("!!document.querySelector('#overlay.open')",{timeout:20000});
  await sleep(250);
  const bb=await p.evaluate(()=>{const o=document.querySelector('#overlay.open'); const t=[...o.querySelectorAll('button')].find(x=>/Başlayalım/.test(x.textContent)); if(!t) return null; const r=t.getBoundingClientRect(); return {x:r.left+r.width/2,y:r.top+r.height/2};});
  if(bb) await p.mouse.click(bb.x,bb.y);
  await p.waitForFunction("!document.querySelector('#overlay.open')",{timeout:10000});
  await sleep(500);
  await p.evaluate(()=>{ S.points=9000; save(); });
  const engelTurleri={};
  const gercek=[];
  for(const tab of TABS){
    await p.evaluate(t=>{ try{closeModal();}catch(e){} App.go(t); },tab);
    await sleep(420);
    const synt=await p.evaluate((Q)=>[...document.querySelectorAll(Q)].filter(el=>{try{new Function(el.getAttribute('onclick'));return false;}catch(e){return true;}}).length,SEL);
    const toplam=await p.evaluate((Q)=>Math.min(document.querySelectorAll(Q).length,60),SEL);
    let calisan=0, atlanan=0, sorun=0;
    for(let i=0;i<toplam;i++){
      const h=await p.evaluate((Q,idx,atla)=>{
        const el=[...document.querySelectorAll(Q)][idx]; if(!el) return null;
        const txt=(el.textContent||'').trim().slice(0,24);
        if(new RegExp(atla,'i').test(txt)) return {atla:true};
        el.scrollIntoView({block:'center'});
        const r=el.getBoundingClientRect(); if(!r.width||!r.height) return {atla:true};
        const cx=r.left+r.width/2, cy=r.top+r.height/2;
        // engelleyici varsa: toast ise temizle, overlay ise bildir
        let top=document.elementFromPoint(cx,cy), temizlendi='';
        if(top && !(top===el||el.contains(top)||top.contains(el))){
          if(top.closest('#toasts')){ document.querySelectorAll('#toasts .toast').forEach(x=>x.remove()); temizlendi='toast-temizlendi'; top=document.elementFromPoint(cx,cy); }
        }
        const engel = top && !(top===el||el.contains(top)||top.contains(el));
        const snap=JSON.stringify({eq:S.equipped,owned:(S.owned||[]).length,pts:S.points,tab:App.tab,cat:Shop&&Shop.cat,pose:S.user&&S.user.pose,anim:S.user.anim,theme:document.documentElement.getAttribute('data-theme'),plan:(S.plan||[]).length,notes:(S.notes||[]).length,fav:(S.fav||[]).length,watch:(S.watch||[]).length,liste:(S.list||[]).length,dob:document.querySelectorAll('#toasts .toast').length,html:document.querySelector('#main').innerHTML.length,modal:!!document.querySelector('#overlay.open')});
        return {snap:snap,x:cx,y:cy,txt:txt,oc:(el.getAttribute('onclick')||'').slice(0,58),engel:!!engel,temizlendi:temizlendi,
                zincir: engel? [...document.elementsFromPoint(cx,cy)].slice(0,4).map(e=>(e.id?'#'+e.id:'')+e.tagName+'.'+(e.className||'').toString().split(' ')[0]).join(' > ') : ''};
      },SEL,i,ATLA.source);
      if(!h||h.atla){ if(h&&h.atla) atlanan++; continue; }
      if(h.engel){ sorun++; engelTurleri[h.zincir.slice(0,60)]=(engelTurleri[h.zincir.slice(0,60)]||0)+1; gercek.push({tab, txt:h.txt, tip:'ENGELLİ', zincir:h.zincir, oc:h.oc}); continue; }
      await p.mouse.click(h.x,h.y);
      await sleep(220);
      const a=await p.evaluate(()=>JSON.stringify({eq:S.equipped,owned:(S.owned||[]).length,pts:S.points,tab:App.tab,cat:Shop&&Shop.cat,pose:S.user&&S.user.pose,anim:S.user.anim,theme:document.documentElement.getAttribute('data-theme'),plan:(S.plan||[]).length,notes:(S.notes||[]).length,fav:(S.fav||[]).length,watch:(S.watch||[]).length,liste:(S.list||[]).length,dob:document.querySelectorAll('#toasts .toast').length,html:document.querySelector('#main').innerHTML.length,modal:!!document.querySelector('#overlay.open')}));
      if(a===h.snap){ sorun++; gercek.push({tab,txt:h.txt,tip:'TEPKİ YOK',oc:h.oc}); } else calisan++;
      await p.evaluate(()=>{ if(document.querySelector('#overlay.open')){ try{closeModal();}catch(e){} } document.querySelectorAll('#toasts .toast').forEach(x=>x.remove()); });
      await sleep(50);
    }
    console.log('•', tab.padEnd(9), '| çalıştı:', String(calisan).padStart(2), '| atlanan:', atlanan, '| bozuk handler:', synt, '| sorun:', sorun);
    gercek.filter(x=>x.tab===tab).slice(0,8).forEach(s=>console.log('     ❌', s.txt, '→', s.tip, s.zincir?('| engel: '+s.zincir):'', '|', s.oc));
  }
  console.log('\n=== TOPLAM: gerçek sorunlu tuş', gercek.length, '| JS hatası', ERR.length, '===');
  Object.entries(engelTurleri).forEach(([k,v])=>console.log('   engel türü x'+v+':', k));
  await b.close();
})();
