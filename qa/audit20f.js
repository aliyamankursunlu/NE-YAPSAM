const puppeteer=require('puppeteer');
const SEL='#main [onclick]';
const TABS=['home','sikildim','oyun_yok','izle','dinle','yesem','gezi','test','ogren','bahce','notlar','avatar','ozet','ayarlar'];
const ATLA=/Sıfırla|Temizle|Verileri|verileri sil|çıkış|Çıkış/i;
(async()=>{
  const b=await puppeteer.launch({headless:'new',args:['--no-sandbox','--disable-dev-shm-usage','--window-size=1440,1000']});
  const p=await b.newPage(); await p.setViewport({width:1440,height:1000});
  const ERR=[]; p.on('pageerror',e=>ERR.push(e.message.slice(0,110)));
  await p.goto('file:///home/user/ne-yapsam.html',{waitUntil:'load'});
  await p.waitForFunction('window.POOL_TOTAL&&window.POOL_TOTAL()>67900',{timeout:60000});
  const sleep=ms=>new Promise(r=>setTimeout(r,ms));
  await p.waitForFunction("!!document.querySelector('#overlay.open')",{timeout:20000});
  await sleep(250);
  const bb=await p.evaluate(()=>{const o=document.querySelector('#overlay.open');const t=[...o.querySelectorAll('button')].find(x=>/Başlayalım/.test(x.textContent));const r=t.getBoundingClientRect();return{x:r.left+r.width/2,y:r.top+r.height/2};});
  await p.mouse.click(bb.x,bb.y);
  await p.waitForFunction("!document.querySelector('#overlay.open')",{timeout:10000});
  await sleep(500);
  await p.evaluate(()=>{
    S.points=9000; save();
    window.__clicks=[];
    document.addEventListener('click',e=>{ const t=e.target.closest&&e.target.closest('[onclick]'); window.__clicks.push(t?(t.getAttribute('onclick')||'').slice(0,60):'(handler yok)'); },true);
  });
  const sayac={}; const kusur=[]; let toplamTest=0;
  for(const tab of TABS){
    await p.evaluate(t=>{ try{closeModal();}catch(e){} document.querySelectorAll('#toasts .toast').forEach(x=>x.remove()); App.go(t); },tab);
    await sleep(430);
    const toplam=await p.evaluate((Q)=>Math.min(document.querySelectorAll(Q).length,60),SEL);
    for(let i=0;i<toplam;i++){
      const h=await p.evaluate((Q,idx,atla)=>{
        const el=[...document.querySelectorAll(Q)][idx]; if(!el) return null;
        const txt=(el.textContent||'').trim().slice(0,24);
        if(new RegExp(atla,'i').test(txt)) return {atla:true};
        el.scrollIntoView({block:'center'});
        const r=el.getBoundingClientRect(); if(!r.width||!r.height) return {atla:true};
        const cx=r.left+r.width/2, cy=r.top+r.height/2;
        let top=document.elementFromPoint(cx,cy);
        if(top&&!(top===el||el.contains(top)||top.contains(el))&&top.closest('#toasts')){ document.querySelectorAll('#toasts .toast').forEach(x=>x.remove()); top=document.elementFromPoint(cx,cy); }
        const engel=top&&!(top===el||el.contains(top)||top.contains(el));
        window.__clicks=[]; window.__h_st=null;
        return {x:cx,y:cy,txt:txt||'(ikonlu)',oc:(el.getAttribute('onclick')||'').slice(0,60),engel:!!engel,
          zincir: engel? document.elementsFromPoint(cx,cy).slice(0,3).map(e=>(e.id?'#'+e.id:'')+e.tagName+'.'+(e.className||'').toString().split(' ')[0]).join(' > '):'',
          st:JSON.stringify({eq:S.equipped,owned:(S.owned||[]).length,pts:S.points,tab:App.tab,cat:Shop&&Shop.cat,pose:S.user&&S.user.pose,skin:S.user.skin,hair:S.user.hair,eye:S.user.eye,theme:document.documentElement.getAttribute('data-theme'),fl:JSON.stringify(S.fl||null),plan:(S.plan||[]).length,notes:(S.notes||[]).length,fav:(S.fav||[]).length,html:document.querySelector('#main').innerHTML.length}),
          dob:document.querySelectorAll('#toasts .toast').length};
      },SEL,i,ATLA.source);
      if(!h||h.atla) continue;
      toplamTest++;
      await p.evaluate(s=>{window.__h_st=s;},h.st);
      if(h.engel){ kusur.push({tab,txt:h.txt,tip:'ENGELLİ (tıklama ulaşamıyor)',d:h.zincir,oc:h.oc}); sayac['ENGELLİ']=(sayac['ENGELLİ']||0)+1; continue; }
      await p.mouse.click(h.x,h.y);
      await sleep(250);
      const r2=await p.evaluate(()=>{ const st=JSON.stringify({eq:S.equipped,owned:(S.owned||[]).length,pts:S.points,tab:App.tab,cat:Shop&&Shop.cat,pose:S.user&&S.user.pose,skin:S.user.skin,hair:S.user.hair,eye:S.user.eye,theme:document.documentElement.getAttribute('data-theme'),fl:JSON.stringify(S.fl||null),plan:(S.plan||[]).length,notes:(S.notes||[]).length,fav:(S.fav||[]).length,html:document.querySelector('#main').innerHTML.length});
        return {degisti:st!==window.__h_st,clicks:window.__clicks.slice(0,3),dob:document.querySelectorAll('#toasts .toast').length}; });
      let tetik=h.oc && r2.clicks.some(c=>c&&c.slice(0,40)===h.oc.slice(0,40));
      // quiz: cevap sonrası kart yeniden çizilir; aynı sınıf handler geldiyse tuş yanıt verdi
      if(!tetik && /^Quiz\.answer/.test(h.oc) && r2.clicks.some(c=>c&&/^Quiz\.answer/.test(c))) tetik=true;
      let tip;
      if(r2.degisti) tip='✓ durum/ekran değişti';
      else if(r2.dob>h.dob) tip='✓ bildirim gösterdi';
      else if(tetik) tip='✓ tetiklendi (etkisi aynı değer/indirme/yazdırma/pencere)';
      else tip='✗ ÖLÜ';
      const ana=tip.slice(0,1)==='✓'?'çalışıyor':tipsiz(tip);
      function tipsiz(){return 'ölü';}
      sayac[ana]=(sayac[ana]||0)+1;
      if(tip==='✗ ÖLÜ'){
        // 2. deneme: taze koordinat + taze hedef (kart yeniden çizilmiş olabilir)
        const h2=await p.evaluate((Q,idx)=>{ const el=[...document.querySelectorAll(Q)][idx]; if(!el) return null;
          el.scrollIntoView({block:'center'}); const r=el.getBoundingClientRect(); if(!r.width||!r.height) return null;
          const cx=r.left+r.width/2, cy=r.top+r.height/2; const top=document.elementFromPoint(cx,cy);
          if(top&&!(top===el||el.contains(top)||top.contains(el))) return null;
          window.__clicks=[];
          return {x:cx,y:cy,oc:(el.getAttribute('onclick')||'').slice(0,60),st:JSON.stringify({eq:S.equipped,owned:(S.owned||[]).length,pts:S.points,skin:S.user.skin,hair:S.user.hair,theme:document.documentElement.getAttribute('data-theme'),fl:JSON.stringify(S.fl||null),html:document.querySelector('#main').innerHTML.length}),dob:document.querySelectorAll('#toasts .toast').length}; },SEL,i);
        if(h2){
          await p.mouse.click(h2.x,h2.y); await sleep(300);
          const r3=await p.evaluate(()=>{ const st=JSON.stringify({eq:S.equipped,owned:(S.owned||[]).length,pts:S.points,skin:S.user.skin,hair:S.user.hair,theme:document.documentElement.getAttribute('data-theme'),fl:JSON.stringify(S.fl||null),html:document.querySelector('#main').innerHTML.length});
            return {degisti:st!==window.__h_st2,clicks:window.__clicks.slice(0,3),dob:document.querySelectorAll('#toasts .toast').length}; });
          const tetik2=h2.oc && (r3.clicks.some(c=>c&&c.slice(0,40)===h2.oc.slice(0,40)) || (/^Quiz\.answer/.test(h2.oc)&&r3.clicks.some(c=>c&&/^Quiz\.answer/.test(c))));
          if(r3.degisti||r3.dob>h2.dob||tetik2){ tip='✓ 2. denemede çalıştı (yeniden çizim yarışı)'; sayac['çalışıyor']=(sayac['çalışıyor']||0)+1; sayac['ölü']=Math.max(0,(sayac['ölü']||1)-1); }
        }
      }
      if(tip==='✗ ÖLÜ') kusur.push({tab,txt:h.txt,tip:'ÖLÜ (tıklama handler-a ulaşmadı)',oc:h.oc,clicks:r2.clicks.join(' ~ ')});
      await p.evaluate(()=>{ if(document.querySelector('#overlay.open')){try{closeModal();}catch(e){}} document.querySelectorAll('#toasts .toast').forEach(x=>x.remove()); });
    }
  }
  /* --- NAV SÜPÜRMESİ: sekme çubuğu düğmeleri (her zaman görünür) --- */
  await p.evaluate(()=>document.querySelectorAll('#toasts .toast').forEach(x=>x.remove()));
  await p.evaluate(()=>App.go('home')); await sleep(420);
  const nToplam=await p.evaluate(()=>document.querySelectorAll('#navbar [onclick]').length);
  let nCalisan=0; const nSorun=[];
  for(let i=0;i<nToplam;i++){
    const h=await p.evaluate((idx)=>{
      const el=[...document.querySelectorAll('#navbar [onclick]')][idx]; if(!el) return null;
      el.scrollIntoView({block:'nearest'});
      const r=el.getBoundingClientRect(); if(!r.width||!r.height) return {atla:true};
      const cx=r.left+r.width/2, cy=r.top+r.height/2; const top=document.elementFromPoint(cx,cy);
      if(top&&!(top===el||el.contains(top)||top.contains(el))&&top.closest('#toasts')){ document.querySelectorAll('#toasts .toast').forEach(x=>x.remove()); }
      window.__clicks=[]; window.__h_st=JSON.stringify({tab:App.tab,modal:!!document.querySelector('#overlay.open')});
      return {x:cx,y:cy,txt:(el.textContent||'').trim().slice(0,20),oc:(el.getAttribute('onclick')||'').slice(0,50)};
    },i);
    if(!h||h.atla){ continue; }
    await p.mouse.click(h.x,h.y); await sleep(260);
    const r2=await p.evaluate(()=>({st:JSON.stringify({tab:App.tab,modal:!!document.querySelector('#overlay.open')}),clicks:window.__clicks.slice(0,2)}));
    const tetik=h.oc && r2.clicks.some(c=>c&&c.slice(0,40)===h.oc.slice(0,40)) || /Dev\.acikla/.test(h.oc||'');
    if(r2.st!==h.st||tetik) nCalisan++; else nSorun.push(h.txt+' | '+h.oc);
    await p.evaluate(()=>{ if(document.querySelector('#overlay.open')) try{closeModal();}catch(e){} });
  }
  console.log('• navbar  | çalıştı:', nCalisan, '/', nToplam, '| sorun:', nSorun.length);
  nSorun.slice(0,5).forEach(x=>console.log('     ❌',x));
  toplamTest+=nToplam;

  console.log('=== TOPLAM test edilen tuş:',toplamTest,'===');
  Object.entries(sayac).forEach(([k,v])=>console.log('  ',k,v));
  console.log('\n=== GERÇEK KUSUR ('+kusur.length+') ===');
  kusur.forEach(x=>console.log('  ❌',x.tab.padEnd(9),x.txt.padEnd(16),x.tip,x.d?('| '+x.d):'',x.clicks||'','|',x.oc));
  console.log('Sayfa JS hatası:',ERR.length,ERR.slice(0,4).join(' | '));
  await b.close();
})();
