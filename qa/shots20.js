const puppeteer=require('puppeteer'),fs=require('fs');
(async()=>{
  const b=await puppeteer.launch({headless:'new',args:['--no-sandbox','--disable-dev-shm-usage','--window-size=1440,1100']});
  const p=await b.newPage(); await p.setViewport({width:1440,height:1100});
  await p.goto('file:///home/user/ne-yapsam.html',{waitUntil:'load'});
  await p.waitForFunction('window.POOL_TOTAL&&window.POOL_TOTAL()>67900',{timeout:60000});
  const sleep=ms=>new Promise(r=>setTimeout(r,ms));
  await p.waitForFunction("!!document.querySelector('#overlay.open')",{timeout:20000});
  await sleep(250);
  const bb=await p.evaluate(()=>{const o=document.querySelector('#overlay.open');const t=[...o.querySelectorAll('button')].find(x=>/Başlayalım/.test(x.textContent));const r=t.getBoundingClientRect();return{x:r.left+r.width/2,y:r.top+r.height/2};});
  await p.mouse.click(bb.x,bb.y);
  await p.waitForFunction("!document.querySelector('#overlay.open')",{timeout:10000});
  await sleep(500);
  await p.evaluate(()=>{ S.points=6000; S.user.skin=1; S.user.hair='#241a12'; S.user.eye='#3b2a20'; S.user.pose='ayakta'; save(); App.go('avatar'); });
  await sleep(900);
  const kutu=await p.evaluate(()=>{ const el=document.querySelector('#main .card, #main'); const r=el.getBoundingClientRect();
    // avatar alanı: kartın ilk görsel bloğu
    const av=document.querySelector('#main svg'); const ra=av?av.getBoundingClientRect():r;
    return {x:Math.max(0,Math.round(ra.left-10)), y:Math.max(0,Math.round(ra.top-10)), w:Math.round(Math.min(ra.width+20,700)), h:Math.max(220,Math.round(ra.height+20))}; });
  // görünür alana kırp
  const kw=Math.min(kutu.w,1440-kutu.x), kh=Math.min(kutu.h,1100-kutu.y);
  const kirp={x:Math.max(0,kutu.x), y:Math.max(0,kutu.y), width:Math.max(50,Math.round(kw)), height:Math.max(50,Math.round(kh))};
  console.log('kırpma alanı:',JSON.stringify(kirp));
  const on=await p.screenshot({clip:kirp});
  fs.writeFileSync('/home/user/ekran/15-avatar-tus-once.png',on);
  // tuşlara tıkla: ten rengi 3, saç rengi, göz, poz: zafer
  const tiklama=async(re,idx)=>{ const c=await p.evaluate((re,idx)=>{ const el=[...document.querySelectorAll('#main [onclick]')].filter(e=>new RegExp(re).test(e.getAttribute('onclick')||''))[idx];
      if(!el) return null; el.scrollIntoView({block:'center'}); const r=el.getBoundingClientRect(); return {x:r.left+r.width/2,y:r.top+r.height/2, oc:el.getAttribute('onclick').slice(0,40)}; },re,idx);
    if(!c) return 'bulunamadı: '+re;
    await p.mouse.click(c.x,c.y); await sleep(320); return c.oc; };
  const log=[];
  log.push('ten: '+await tiklama("S\\.user\\.skin=3",0));
  log.push('saç: '+await tiklama("S\\.user\\.hair='#",1));
  log.push('göz: '+await tiklama("S\\.user\\.eye='#",2));
  log.push('poz: '+await tiklama("setPose\\('zafer'\\)",0));
  await p.evaluate(()=>document.querySelectorAll('#toasts .toast').forEach(x=>x.remove()));
  await sleep(400);
  const son=await p.screenshot({clip:kirp});
  fs.writeFileSync('/home/user/ekran/15-avatar-tus-sonra.png',son);
  // piksel farkı (sayfa içi canvas ile)
  const fark=await p.evaluate(async(a,b2)=>{
    const yuk=src=>new Promise(r=>{const i=new Image();i.onload=()=>r(i);i.src=src;});
    const [i1,i2]=await Promise.all([yuk('data:image/png;base64,'+a),yuk('data:image/png;base64,'+b2)]);
    const c=document.createElement('canvas'); c.width=i1.width; c.height=i1.height; const x=c.getContext('2d');
    x.drawImage(i1,0,0); const d1=x.getImageData(0,0,c.width,c.height).data;
    x.clearRect(0,0,c.width,c.height); x.drawImage(i2,0,0); const d2=x.getImageData(0,0,c.width,c.height).data;
    let n=0; for(let i=0;i<d1.length;i+=4){ if(Math.abs(d1[i]-d2[i])+Math.abs(d1[i+1]-d2[i+1])+Math.abs(d1[i+2]-d2[i+2])>24) n++; }
    return {farkliPiksel:n, toplam:c.width*c.height};
  },on.toString('base64'),son.toString('base64'));
  const durum=await p.evaluate(()=>({skin:S.user.skin,hair:S.user.hair,eye:S.user.eye,pose:S.user.pose,puan:S.points}));
  console.log('tıklanan tuşlar:', log.join(' | '));
  console.log('avatar durumu:', JSON.stringify(durum));
  console.log('görsel fark:', fark.farkliPiksel, '/', fark.toplam, 'piksel ('+ (100*fark.farkliPiksel/fark.toplam).toFixed(1) +'%)');
  console.log('dosyalar: ekran/15-avatar-tus-once.png', on.length, 'bayt | 15-avatar-tus-sonra.png', son.length, 'bayt');
  await b.close();
})();
