const puppeteer=require('puppeteer');
(async()=>{
  const b=await puppeteer.launch({headless:'new',args:['--no-sandbox','--disable-dev-shm-usage']});
  const p=await b.newPage(); await p.setViewport({width:1440,height:1000});
  await p.goto('file:///home/user/ne-yapsam.html',{waitUntil:'load'});
  await p.waitForFunction('window.POOL_TOTAL&&window.POOL_TOTAL()>67900',{timeout:60000});
  await p.evaluate(()=>{const o=document.querySelector('#overlay.open'); if(o){const t=[...o.querySelectorAll('button')].find(x=>/Başlayalım/.test(x.textContent)); if(t)t.click();}});
  await new Promise(r=>setTimeout(r,900));
  const r=await p.evaluate(()=>{
    S.points=5000; App.go('avatar');
    return new Promise(res=>setTimeout(()=>{
      // bildirim çıkar ve hemen ölç
      Shop.cat='pet'; App.repaintCurrent(); toast('🧪','deneme bildirimi','uzun bir açıklama satırı','',9000);
      setTimeout(()=>{
        const t=document.querySelector('#toasts .toast');
        const muted=t&&t.querySelector('.muted');
        const info=[];
        info.push('toast var mı: '+(!!t));
        if(t){
          info.push('toast sınıfı: '+t.className);
          info.push('toast computed pointer-events: '+getComputedStyle(t).pointerEvents);
          const st=getComputedStyle(t.parentElement);
          info.push('#toasts computed pointer-events: '+st.pointerEvents+' | pozisyon: '+st.position+' | z: '+st.zIndex);
          const rc=t.getBoundingClientRect();
          info.push('toast kutusu: '+[Math.round(rc.left),Math.round(rc.top),Math.round(rc.width),Math.round(rc.height)].join(','));
          if(muted){ info.push('muted computed pointer-events: '+getComputedStyle(muted).pointerEvents); const rm=muted.getBoundingClientRect(); info.push('muted kutusu: '+[Math.round(rm.left),Math.round(rm.top),Math.round(rm.width),Math.round(rm.height)].join(',')); }
        }
        const chip=[...document.querySelectorAll('#main .chip')].find(x=>/Arka Plan|Evcil/.test(x.textContent));
        if(chip){ chip.scrollIntoView({block:'center'}); const c=chip.getBoundingClientRect(); const cx=c.left+c.width/2, cy=c.top+c.height/2;
          const top=document.elementFromPoint(cx,cy);
          info.push('çip merkezi: '+Math.round(cx)+','+Math.round(cy));
          info.push('üstteki: '+(top? top.tagName+'.'+top.className+' / içinde #toasts: '+!!top.closest('#toasts') : 'yok'));
          const stack=document.elementsFromPoint(cx,cy).slice(0,5).map(e=>e.tagName+'.'+(e.className||'').toString().split(' ')[0]+(e.closest('#toasts')?'[TOAST]':''));
          info.push('üst üste: '+stack.join(' > '));
        }
        res(info.join('\n'));
      },350);
    },400));
  });
  console.log(r);
  await b.close();
})();
