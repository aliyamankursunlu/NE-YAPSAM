const puppeteer=require('puppeteer');
(async()=>{
  const b=await puppeteer.launch({headless:'new',args:['--no-sandbox','--disable-dev-shm-usage']});
  const p=await b.newPage();
  await p.goto('file:///home/user/ne-yapsam.html',{waitUntil:'load'});
  await p.waitForFunction('window.POOL_TOTAL&&window.POOL_TOTAL()>67900',{timeout:60000});
  await p.evaluate(()=>{ const o=document.querySelector('#overlay.open'); if(o){ const btn=[...o.querySelectorAll('button')].find(x=>/Başlayalım/.test(x.textContent)); if(btn) btn.click(); } });
  await new Promise(r=>setTimeout(r,700));
  const info=await p.evaluate(()=>{
    App.go('avatar');
    return new Promise(res=>setTimeout(()=>{
      const ids=[...document.querySelectorAll('main,section,#app,#view,.view,.main,.content,#content,#root,body>div')].slice(0,14)
        .map(e=>({tag:e.tagName, id:e.id, cls:(e.className||'').toString().slice(0,40), n:e.querySelectorAll('[onclick]').length}));
      const all=document.querySelectorAll('[onclick]').length;
      const chips=document.querySelectorAll('.chip').length;
      return res({ids:ids, allOnclick:all, chips:chips, avatarMetin:(document.body.innerText.match(/Avatar & Mağaza/)||[]).length});
    },400));
  });
  console.log(JSON.stringify(info,null,1));
  await b.close();
})();
