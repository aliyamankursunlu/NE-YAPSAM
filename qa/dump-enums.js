const fs=require('fs');const {JSDOM}=require('jsdom');
const dom=new JSDOM(fs.readFileSync('/home/user/ne-yapsam.html','utf8'),{runScripts:'dangerously',pretendToBeVisual:true,url:'http://localhost/'});
const w=dom.window;
setTimeout(()=>{
 const code=`(function(){
  function cnt(arr,fn){ var o={}; arr.forEach(function(x){ (fn?fn(x):[x]).forEach(function(v){ o[v]=(o[v]||0)+1; }); }); return o; }
  function keys(o){ return Object.keys(o).sort(); }
  return JSON.stringify({
   oyun_tur:keys(cnt(GAMES,function(x){return [x.g];})),
   oyun_sure:keys(cnt(GAMES,function(x){return [x.s];})),
   oyun_platform:keys(cnt(GAMES,function(x){return [x.p];})),
   oyun_ruh:keys(cnt(GAMES.reduce(function(a,x){return a.concat(x.m||[]);},[]))),
   film_tur:keys(cnt(MOVIES,function(x){return x.g;})),
   film_tip:keys(cnt(MOVIES,function(x){return [x.t];})),
   film_uzunluk:keys(cnt(MOVIES,function(x){return [x.l];})),
   film_platform:keys(cnt(MOVIES,function(x){return [x.pl];})),
   film_ruh:keys(cnt(MOVIES.reduce(function(a,x){return a.concat(x.m||[]);},[]))),
   muzik_tur:keys(cnt(MUSIC,function(x){return [x.g];})),
   muzik_ruh:keys(cnt(MUSIC.reduce(function(a,x){return a.concat(x.m||[]);},[]))),
   yemek_ogun:keys(cnt(FOODS,function(x){return x.k;})),
   yemek_tip:keys(cnt(FOODS,function(x){return [x.t];})),
   bolgeler:keys(REGIONS),
   test_sinif:keys(cnt(QUIZ,function(x){return [x.k];})),
   test_ders:keys(cnt(QUIZ,function(x){return [x.d];}))
  },null,1);
 })()`;
 const r=JSON.parse(w.eval(code));
 for(const k in r){ console.log('=== '+k+' ('+r[k].length+') ==='); console.log(r[k].join(' | ')); }
 process.exit(0);
},3000);
