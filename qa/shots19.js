const puppeteer=require('puppeteer');
const OUT='/home/user/ekran/';
(async()=>{
  const browser=await puppeteer.launch({headless:'new',args:['--no-sandbox','--disable-dev-shm-usage','--window-size=1440,1000']});
  const page=await browser.newPage();
  await page.setViewport({width:1440,height:1000});
  await page.goto('file:///home/user/ne-yapsam.html',{waitUntil:'load'});
  await page.waitForFunction('window.POOL_TOTAL&&window.POOL_TOTAL()>67900',{timeout:60000});
  const sleep=ms=>new Promise(r=>setTimeout(r,ms));
  const closeModal=()=>page.evaluate(()=>{ try{ document.querySelector('#overlay').classList.remove('open'); document.querySelector('#modal').innerHTML=''; }catch(e){} });
  await page.waitForFunction("!!document.querySelector('#overlay.open')",{timeout:20000});
  await page.evaluate(()=>{ const o=document.querySelector('#overlay.open'); const b=[...o.querySelectorAll('button')].find(x=>/Başlayalım/.test(x.textContent)); if(b) b.click(); });
  await page.waitForFunction("!document.querySelector('#overlay.open')",{timeout:10000});
  await sleep(400);

  // 1) AVATAR (kuşanılmış parçalarla, modal yok)
  await page.evaluate(()=>{
    S.points=980; S.user.eye='#3b82f6'; S.user.hair='#7a5230';
    ['hat_buyucu','glass_gunes','pet_kedi','out_hoodie','hair_dalgali','bg_sakura'].forEach(id=>{ if(S.owned.indexOf(id)<0) S.owned.push(id); });
    S.equipped={hat:'hat_buyucu', glass:'glass_gunes', glasses:'glass_gunes', pet:'pet_kedi', outfit:'out_hoodie', hair:'hair_dalgali', bg:'bg_sakura'};
    save(); App.go('avatar');
  });
  await sleep(700); await page.screenshot({path:OUT+'11-avatar-yeni.png'}); console.log('• 11-avatar-yeni.png');

  // 2) AVATAR — gözlük mağazası (önizleme kartları)
  await page.evaluate(()=>{ Shop.cat='glass'; App.repaintCurrent(); window.scrollTo(0,520); });
  await sleep(600); await page.screenshot({path:OUT+'12-avatar-magaza.png'}); console.log('• 12-avatar-magaza.png');

  // 3) OYUN + FİYAT + BAŞKA NEREDE
  await closeModal();
  await page.evaluate(()=>{
    Media.filters.games.p='all'; Media.filters.games.g='all';
    const real=GAMES.filter(x=>!x.gen && x.n==='Baldur\'s Gate 3');
    const it=real[0]||GAMES.filter(x=>!x.gen)[0];
    Media.pick('games'); Media.last.games=it; Media.modalHtml('games',it); showModal(Media.modalHtml('games',it));
  });
  await sleep(7000);
  const st=await page.evaluate(()=>{ const b=document.getElementById('price19'); return b? b.innerText.split('\n')[0]:'yok'; });
  console.log('   fiyat satırı:', st);
  await page.evaluate(()=>{ Price19.toggle(); });
  await sleep(500); await page.screenshot({path:OUT+'9-oyun-fiyat-paneli.png', fullPage:false}); console.log('• 9-oyun-fiyat-paneli.png');

  // 4) MÜZİK — doğrudan şarkı
  await closeModal();
  await page.evaluate(()=>{ const real=MUSIC.filter(m=>!m.gen); Media.openMusic('Tarkan','Kuzu Kuzu'); });
  await sleep(600); await page.screenshot({path:OUT+'10-muzik-modal.png'}); console.log('• 10-muzik-modal.png');
  await browser.close(); console.log('bitti');
})();
