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
  await p.evaluate(()=>{ S.points=9000; save(); });
  const sayac={}; const gercek=[];
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
        let top=document.elementFromPoint(cx,cy), temiz='';
        if(top&&!(top===el||el.contains(top)||top.contains(el))&&top.closest('#toasts')){ document.querySelectorAll('#toasts .toast').forEach(x=>x.remove()); temiz='toast'; top=document.elementFromPoint(cx,cy); }
        const engel=top&&!(top===el||el.contains(top)||top.contains(el));
        // handler'ı enstrüman et
        window.__h={ran:0,err:null,dob:document.querySelectorAll('#toasts .toast').length,
          st:JSON.stringify({eq:S.equipped,owned:(S.owned||[]).length,pts:S.points,tab:App.tab,cat:Shop&&Shop.cat,pose:S.user&&S.user.pose,anim:S.user.anim,skin:S.user.skin,hair:S.user.hair,eye:S.user.eye,theme:document.documentElement.getAttribute('data-theme'),fl:JSON.stringify(S.fl||null),plan:(S.plan||[]).length,notes:(S.notes||[]).length,fav:(S.fav||[]).length,watch:(S.watch||[]).length,html:document.querySelector('#main').innerHTML.length})};
        const f=el.onclick;
        window.__h.var=(typeof f==='function');
        if(typeof f==='function') el.onclick=function(ev){ window.__h.ran++; try{ return f.call(this,ev); }catch(e){ window.__h.err=e.message; } };
        return {x:cx,y:cy,txt:txt||'(ikonlu)',oc:(el.getAttribute('onclick')||'').slice(0,52),engel:!!engel,temiz:temiz,
                zincir: engel? document.elementsFromPoint(cx,cy).slice(0,3).map(e=>(e.id?'#'+e.id:'')+e.tagName+'.'+(e.className||'').toString().split(' ')[0]).join(' > '):''};
      },SEL,i,ATLA.source);
      if(!h||h.atla) continue;
      if(h.engel){ gercek.push({tab,txt:h.txt,tip:'ENGELLİ',d:h.zincir,oc:h.oc}); sayac['ENGELLİ']=(sayac['ENGELLİ']||0)+1; continue; }
      await p.mouse.click(h.x,h.y);
      await sleep(240);
      const r2=await p.evaluate(()=>{ const st=JSON.stringify({eq:S.equipped,owned:(S.owned||[]).length,pts:S.points,tab:App.tab,cat:Shop&&Shop.cat,pose:S.user&&S.user.pose,anim:S.user.anim,skin:S.user.skin,hair:S.user.hair,eye:S.user.eye,theme:document.documentElement.getAttribute('data-theme'),fl:JSON.stringify(S.fl||null),plan:(S.plan||[]).length,notes:(S.notes||[]).length,fav:(S.fav||[]).length,watch:(S.watch||[]).length,html:document.querySelector('#main').innerHTML.length});
        return {ran:window.__h.ran,err:window.__h.err,var:window.__h.var,degisti:st!==window.__h.st,dob:document.querySelectorAll('#toasts .toast').length-window.__h.dob}; });
      let tip;
      if(r2.ran===0) tip='ÖLÜ (tıklama ulaşmadı)';
      else if(r2.err) tip='HATA: '+r2.err;
      else if(r2.degisti) tip='çalıştı (durum/ekran değişti)';
      else if(r2.dob>0) tip='çalıştı (bildirim gösterdi)';
      else tip='çalıştı ama etkisiz (zaten seçili/indirme/yazdırma)';
      sayac[tip.split(' ')[0]]=(sayac[tip.split(' ')[0]]||0)+1;
      if(r2.ran===0||r2.err) gercek.push({tab,txt:h.txt,tip:tip,oc:h.oc});
      await p.evaluate(()=>{ if(document.querySelector('#overlay.open')){try{closeModal();}catch(e){}} document.querySelectorAll('#toasts .toast').forEach(x=>x.remove()); });
    }
  }
  console.log('=== SONUÇ SINIFLARI ==='); Object.entries(sayac).forEach(([k,v])=>console.log('  ',k.padEnd(12),v));
  console.log('\n=== GERÇEK KUSURLAR ('+gercek.length+') ===');
  gercek.forEach(x=>console.log('  ❌',x.tab.padEnd(9),x.txt.padEnd(16),'→',x.tip,x.d?('| engel: '+x.d):'','|',x.oc));
  console.log('\nJS hatası (sayfa):',ERR.length,ERR.slice(0,5).join(' | '));
  await b.close();
})();
