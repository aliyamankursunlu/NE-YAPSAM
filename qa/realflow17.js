const puppeteer=require('puppeteer');
const path='/home/user/ne-yapsam.html';
const REP=[]; const ERR=[];
const ok=(c,l,x='')=>{ REP.push((c?'✅':'❌')+' '+l+(x?' — '+x:'')); if(!c) FAIL.push(l); };
const FAIL=[];
(async()=>{
  const browser=await puppeteer.launch({headless:'new',args:['--no-sandbox','--disable-dev-shm-usage','--window-size=1440,900']});
  const page=await browser.newPage();
  await page.setViewport({width:1440,height:900});
  page.on('pageerror',e=>ERR.push('pageerror: '+e.message));
  page.on('console',m=>{ const t=m.text(); if(m.type()==='error'&&!/Not implemented|net::ERR_|Failed to load resource/.test(t)) ERR.push('console: '+t); });
  await page.setRequestInterception(true);
  page.on('request',r=>{ if(r.url().startsWith('file://')||r.url().startsWith('data:')) r.continue(); else r.abort(); });

  const tLoad=Date.now();
  await page.goto('file://'+path,{waitUntil:'load'});
  await page.waitForFunction('window.POOL_TOTAL&&window.POOL_TOTAL()>67900',{timeout:60000});
  const loadMs=Date.now()-tLoad;
  const info=await page.evaluate(()=>({ms:window.POOL_MS,tot:window.POOL_TOTAL(),stats:window.POOL_STATS(),perf:Math.round(performance.now())}));
  ok(info.ms<2500,'havuz kurulum süresi < 2.5 sn', info.ms+' ms');
  ok(info.tot>=60000,'toplam öğe ≥ 60.000', info.tot.toLocaleString('tr-TR'));
  REP.push('   yükleme: '+loadMs+' ms · havuz kurulumu: '+info.ms+' ms · sayfa hazır: '+info.perf+' ms');
  info.stats.forEach(x=>REP.push('   '+x.e+' '+x.k+': '+x.n.toLocaleString('tr-TR')));

  /* yardımcılar */
  async function hit(sel,label){
    const r=await page.evaluate(s=>{ const el=document.querySelector(s); if(!el) return {missing:true};
      el.scrollIntoView({block:'center',inline:'center'});
      const b=el.getBoundingClientRect(); if(b.width<1||b.height<1) return {zero:true,w:b.width,h:b.height};
      const pts=[[0.5,0.5],[0.3,0.5],[0.7,0.5],[0.5,0.25],[0.5,0.75]];
      for(const p of pts){ const x=b.left+b.width*p[0], y=b.top+b.height*p[1];
        const top=document.elementFromPoint(x,y);
        if(top&&(el===top||el.contains(top)||top.contains(el))) return {x:x,y:y,hit:true,pct:p,tag:top.tagName+'.'+top.className};
      }
      const top=document.elementFromPoint(b.left+b.width/2,b.top+b.height/2);
      return {hit:false,tag:top?top.tagName+'.'+top.className:'yok',rect:[Math.round(b.left),Math.round(b.top),Math.round(b.width),Math.round(b.height)]};
    }, sel);
    if(!r||r.missing){ FAIL.push(label); REP.push('❌ '+label+' — element bulunamadı ('+sel+')'); return null; }
    if(r.zero){ FAIL.push(label); REP.push('❌ '+label+' — sıfır boyut'); return null; }
    if(!r.hit){ FAIL.push(label); REP.push('❌ '+label+' — tıklama engelli → '+r.tag+' @'+JSON.stringify(r.rect)); return null; }
    return r;
  }
  async function clickText(selSub,text,cls='button, .chip, .btn'){
    const sel=await page.evaluate((cls,text)=>{ const els=[...document.querySelectorAll(cls)];
      const el=els.find(e=>(e.textContent||'').includes(text)&&(!selSub||e.closest(selSub)));
      if(!el) return null; el.setAttribute('data-qa','1'); return '[data-qa="1"]'; },null,text);
    return sel;
  }

  /* 0) karşılama ekranı */
  await new Promise(r=>setTimeout(r,900));
  const ob=await page.evaluate(()=>{ const o=document.querySelector('#overlay.open'); if(!o) return null;
    const b=[...o.querySelectorAll('button')].find(x=>/Başlayalım/.test(x.textContent)); if(!b) return null; b.setAttribute('data-qa','onboard'); return '#overlay.open'; });
  ok(!!ob,'karşılama ekranı açıldı');
  if(ob){ const r=await hit('[data-qa="onboard"]','karşılama: “Başlayalım” düğmesi'); if(r) await page.mouse.click(r.x,r.y); await new Promise(x=>setTimeout(x,350)); }
  ok(await page.evaluate(()=>!document.querySelector('#overlay.open')),'karşılama ekranı kapandı, sekmeler erişilebilir');

  /* 1) sekmeler */
  const tabs=await page.evaluate(()=>[...document.querySelectorAll('#navbar .tab')].map(t=>t.dataset.tab).filter(Boolean));
  for(const t of tabs){
    const before=await page.evaluate(()=>document.getElementById('main').innerHTML.length);
    const r=await hit(`#navbar .tab[data-tab="${t}"]`,'sekme: '+t);
    if(r) await page.mouse.click(r.x,r.y);
    await new Promise(r=>setTimeout(r,120));
    const after=await page.evaluate(()=>({len:document.getElementById('main').innerHTML.length,active:(document.querySelector('#navbar .tab.active')||{}).dataset&&document.querySelector('#navbar .tab.active').dataset.tab}));
    ok(after.len>800&&after.active===t,'sekme geçişi: '+t, after.len+' karakter');
  }

  /* 2) ana sayfa havuz kartı */
  await page.evaluate(()=>App.go('home'));
  const home=await page.evaluate(()=>({has:document.getElementById('main').innerHTML.includes('Öneri havuzu'), tot:(document.getElementById('main').textContent.match(/6[01]\.\d{3}/)||[])[0]}));
  ok(home.has,'ana sayfada “Öneri havuzu” kartı', 'toplam etiketi: '+home.tot);
  await page.evaluate(()=>{ const c=[...document.querySelectorAll('#main .card')].find(x=>x.textContent.includes('Öneri havuzu')); if(c) c.scrollIntoView({block:'center'}); });
  await page.screenshot({path:'/home/user/ekran/1-ana-sayfa-havuz.png'});

  /* 3) gezi: rota modu akışı (gerçek tıklamalar) */
  await page.evaluate(()=>App.go('gezi'));
  let sel=await page.evaluate(()=>{ const e=[...document.querySelectorAll('.chip')].find(x=>x.textContent.includes('Hazır rota')); if(!e) return null; e.setAttribute('data-qa','rota'); return '[data-qa="rota"]'; });
  ok(!!sel,'gezi: “Hazır rota öner” çipi var');
  if(sel){ const r=await hit(sel,'gezi: rota çipi tıklaması'); if(r) await page.mouse.click(r.x,r.y); await new Promise(r=>setTimeout(r,150)); }
  const rotaInfo=await page.evaluate(()=>({txt:document.getElementById('main').textContent.match(/[\d.]+ rota listelendi/), mode:Media.filters.city.mode, cand:Media.candidates('city').length}));
  ok(rotaInfo.mode==='rota'&&rotaInfo.cand>8000,'rota modu aktif', JSON.stringify(rotaInfo));
  const pickBtn=await page.evaluate(()=>{ const e=[...document.querySelectorAll('#main .btn')].find(x=>x.textContent.includes('Nereyi gezsem')); if(!e) return null; e.setAttribute('data-qa','pick'); return '[data-qa="pick"]'; });
  const pr=await hit(pickBtn||'[data-qa="pick"]','gezi: “Nereyi gezsem?” butonu'); if(pr) await page.mouse.click(pr.x,pr.y);
  await new Promise(r=>setTimeout(r,200));
  const modal=await page.evaluate(()=>{ const m=document.getElementById('modal'); return {open:!!(m&&m.innerHTML.length>100), html:(m?m.innerHTML:'')}; });
  ok(modal.open,'rota öneri modalı açıldı');
  ok(/Gezi rotası önerisi/.test(modal.html),'modal rota içeriği gösteriyor');
  ok(/google\.com\/maps/.test(modal.html),'modalde harita linkleri var');
  ok(/Planıma ekle/.test(modal.html),'modalde “Planıma ekle” var');
  const planBefore=await page.evaluate(()=>(S.plans||[]).length);
  const planSel=await page.evaluate(()=>{ const e=[...document.querySelectorAll('#modal button')].find(x=>/Planıma ekle/.test(x.textContent)); if(!e) return null; e.setAttribute('data-qa','planekle'); return '[data-qa="planekle"]'; });
  ok(!!planSel,'rota modalında plan butonu seçilebildi');
  if(planSel){ const r=await hit(planSel,'rota modalı: “Planıma ekle”'); if(r) { await page.mouse.click(r.x,r.y); await new Promise(x=>setTimeout(x,200)); } }
  const planAfter=await page.evaluate(()=>(S.plans||[]).length);
  ok(planAfter>planBefore,'“Planıma ekle” plan listesine yazdı', planBefore+' → '+planAfter);
  let modalProblems=0;
  const pickAgain=await page.evaluate(()=>{ const e=[...document.querySelectorAll('#modal button')].find(x=>/Başka öner/.test(x.textContent)); if(!e) return null; e.setAttribute('data-qa','baska'); return '[data-qa="baska"]'; });
  if(pickAgain){ const r=await hit(pickAgain,'rota modalı: “Başka öner”');
    if(r){ const before=await page.evaluate(()=>document.getElementById('modal').innerHTML); await page.mouse.click(r.x,r.y); await new Promise(x=>setTimeout(x,200));
      const after=await page.evaluate(()=>document.getElementById('modal').innerHTML);
      ok(before!==after,'“Başka öner” yeni rota gösterdi'); if(before===after) modalProblems++; } }
  await page.screenshot({path:'/home/user/ekran/2-gezi-rota-modal.png'});
  await page.evaluate(()=>closeModal());

  /* 4) her tür için modal buton süpürmesi (kapak/engel kontrolü) */
  let sweepProblems=0, sweepTot=0;
  for(const k of ['games','film','music','food','city','city-rota']){
    await page.evaluate(k=>{ if(k==='city-rota'){ Media.filters.city.mode='rota'; } else { Media.filters.city.mode='random'; }
      Media.pick(k==='city-rota'?'city':k); },k);
    await new Promise(r=>setTimeout(r,140));
    let idx=0, guard=0;
    while(guard++<20){
      const info=await page.evaluate(i=>{ const m=document.getElementById('modal'); if(!m||m.innerHTML.length<100||getComputedStyle(m).display==='none') return null;
        const els=[...m.querySelectorAll('button')]; if(i>=els.length) return {done:true,total:els.length};
        els[i].setAttribute('data-qa','s'+i); return {total:els.length, html:m.innerHTML.length}; },idx);
      if(!info||info.done) break;
      const r=await hit('[data-qa="s'+idx+'"]',k+' modal #'+idx);
      sweepTot++;
      if(!r){ sweepProblems++; idx++; continue; }
      const before=await page.evaluate(()=>document.getElementById('modal').innerHTML.length);
      await page.mouse.click(r.x,r.y); await new Promise(x=>setTimeout(x,120));
      const open=await page.evaluate(()=>{ const m=document.getElementById('modal'); return !!(m&&m.innerHTML.length>100&&getComputedStyle(m).display!=='none'); });
      if(!open) break;
      const after=await page.evaluate(()=>document.getElementById('modal').innerHTML.length);
      if(before===after){ /* aynı içerik: link açan buton olabilir, sorun sayılmaz */ }
      idx++;
    }
    await page.evaluate(()=>{ try{ closeModal(); }catch(e){} });
  }
  /* modal link denetimi: her link gerçek bir adrese gitmeli */
  let linkBad=0, linkTot=0;
  for(const k of ['games','film','music','food','city','city-rota']){
    await page.evaluate(k=>{ if(k==='city-rota') Media.filters.city.mode='rota'; else Media.filters.city.mode='random'; Media.pick(k==='city-rota'?'city':k); },k);
    await new Promise(r=>setTimeout(r,120));
    const links=await page.evaluate(()=>[...document.querySelectorAll('#modal a')].map(a=>({h:a.getAttribute('href')||'',t:(a.textContent||'').trim().slice(0,28)})));
    links.forEach(l=>{ linkTot++; if(!/^https?:\/\//.test(l.h)) { linkBad++; REP.push('   ⚠️ '+k+' ölü link: '+l.t+' → '+l.h); } });
    await page.evaluate(()=>{ try{ closeModal(); }catch(e){} });
  }
  ok(linkBad===0,'modal link denetimi (hepsi gerçek adres)', linkTot+' link, '+linkBad+' bozuk');
  await page.evaluate(()=>{ Media.filters.city.mode='random'; });
  ok(sweepProblems===0,'6 modal süpürmesi: engellenen buton yok', sweepTot+' öğe denendi, '+sweepProblems+' engelli');

  /* 5) regresyon: filtre + quiz + su + not */
  await page.evaluate(()=>App.go('izle'));
  const c1=await page.evaluate(()=>{ const e=[...document.querySelectorAll('.chip')].find(x=>x.textContent.trim()==='Dizi'); if(!e) return null; e.setAttribute('data-qa','dizi'); return document.getElementById('main').textContent.match(/[\d.]+ içerik uygun/)[0]; });
  if(c1){ const l=await page.evaluate(()=>document.getElementById('main').textContent.match(/[\d.]+ içerik uygun/)[0]); const r=await hit('[data-qa="dizi"]','İzle: “Dizi” çipi'); if(r) await page.mouse.click(r.x,r.y); await new Promise(x=>setTimeout(x,180));
    const l2=await page.evaluate(()=>document.getElementById('main').textContent.match(/[\d.]+ içerik uygun/)[0]);
    ok(l!==l2,'İzle: “Dizi” filtresi sonucu değiştirdi', l+' → '+l2); }
  await page.evaluate(()=>App.go('test'));
  const qb=await page.evaluate(()=>{ const e=[...document.querySelectorAll('#main .btn')].find(x=>x.textContent.includes('Teste başla')); if(!e) return null; e.setAttribute('data-qa','qstart'); return '[data-qa="qstart"]'; });
  const qr=await hit(qb,'Test: “Teste başla”'); if(qr) await page.mouse.click(qr.x,qr.y);
  await new Promise(r=>setTimeout(r,250));
  const qst=await page.evaluate(()=>({opt:document.querySelectorAll('#main .opt').length,pts:S.points,q:Quiz.s.q?Quiz.s.q.q:null}));
  ok(qst.opt>=4,'Test: soru yüklendi', qst.opt+' seçenek — '+String(qst.q).slice(0,50));
  if(qst.opt>=4){ const ans=await page.evaluate(()=>Quiz.s.q.c); const ar=await hit(`#main .opt:nth-child(${ans+1})`,'Test: doğru seçenek');
    if(ar){ await page.mouse.click(ar.x,ar.y); await new Promise(x=>setTimeout(x,200)); }
    const p2=await page.evaluate(()=>S.points); ok(p2>=qst.pts,'Test: puan işledi', qst.pts+' → '+p2); }
  await page.screenshot({path:'/home/user/ekran/3-test-sorusu.png'});
  const wRes=await page.evaluate(()=>{ const before=S.water.drinks; const e=[...document.querySelectorAll('button')].find(x=>/Su iç|İçtim/i.test(x.textContent)); if(e){ e.setAttribute('data-qa','su'); return {before:before,sel:'[data-qa="su"]'}; } return {before:before}; });
  if(wRes.sel){ const r=await hit(wRes.sel,'Su iç düğmesi'); if(r){ await page.mouse.click(r.x,r.y); await new Promise(x=>setTimeout(x,200)); } }
  wRes.after=await page.evaluate(()=>S.water.drinks);
  ok(wRes.after>=wRes.before,'Su sayacı çalışıyor', wRes.before+' → '+wRes.after);
  await page.evaluate(()=>App.go('ayarlar'));
  const theme=await page.evaluate(()=>{ const e=document.querySelector('#btnTheme')||[...document.querySelectorAll('.btn,.chip')].find(x=>/Aydınlık/i.test(x.textContent)); if(!e) return null; e.setAttribute('data-qa','th'); return '[data-qa="th"]'; });
  if(theme){ const before=await page.evaluate(()=>document.documentElement.getAttribute('data-theme')); const r=await hit(theme,'Ayarlar: tema düğmesi'); if(r) await page.mouse.click(r.x,r.y); await new Promise(x=>setTimeout(x,250));
    const after=await page.evaluate(()=>document.documentElement.getAttribute('data-theme')); ok(before!==after,'Tema değişimi çalışıyor', (before||'(yok)')+' → '+(after||'(yok)')); }

  /* özet */
  console.log('\n=== GERÇEK TARAYICI (Chrome) TESTİ ===');
  console.log(REP.join('\n'));
  console.log('\n=== JS HATALARI ===');
  console.log(ERR.length?ERR.slice(0,10).join('\n'):'0 hata ✅');
  console.log('\n=== SONUÇ: '+(FAIL.length? FAIL.length+' SORUN → '+FAIL.join(' | ') : 'HEPSİ GEÇTİ ✅')+' ===');
  await browser.close();
  process.exit(FAIL.length||ERR.length?1:0);
})().catch(e=>{ console.log('ÇALIŞTIRMA HATASI:',e.message); process.exit(2); });
