const puppeteer=require('puppeteer');
(async()=>{
  const browser=await puppeteer.launch({headless:'new',args:['--no-sandbox','--disable-dev-shm-usage']});
  const page=await browser.newPage();
  const test=async(label,url,wait=6000)=>{
    try{
      await page.goto(url,{waitUntil:'domcontentloaded',timeout:20000});
      await new Promise(r=>setTimeout(r,wait));
      const fin=page.url();
      const title=await page.title();
      console.log(label,'→',fin.slice(0,120),'|',title.slice(0,60));
    }catch(e){ console.log(label,'HATA:',e.message.slice(0,80)); }
  };
  const q=encodeURIComponent('site:open.spotify.com/track Mor ve Ötesi Bir Derdim Var');
  await test('btnI-spotify','https://www.google.com/search?btnI=I%27m+Feeling+Lucky&q='+q);
  await test('btnI-spotify2',"https://www.google.com/search?btnI=1&q="+encodeURIComponent('open.spotify.com track Kendrick Lamar HUMBLE'));
  await test('ddg-bang','https://duckduckgo.com/?q='+encodeURIComponent('\\Mor ve Ötesi Bir Derdim Var'));
  await test('itad','https://isthereanydeal.com/search/?q='+encodeURIComponent('Baldurs Gate 3'));
  await test('cheapshark-page','https://www.cheapshark.com/search?q='+encodeURIComponent('Baldurs Gate 3'));
  await browser.close();
})();
