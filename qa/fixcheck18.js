const fs=require('fs'); const {JSDOM}=require('jsdom');
const dom=new JSDOM(fs.readFileSync('/home/user/ne-yapsam.html','utf8'),{runScripts:'dangerously',pretendToBeVisual:true,url:'https://local.test/'});
const w=dom.window;
setTimeout(()=>{ try{ console.log(JSON.stringify(w.eval('window.POOL_FIX()'),null,0)); }catch(e){ console.log('HATA',e.message); } process.exit(0); },6000);
