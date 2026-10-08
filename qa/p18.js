
  /* =====================================================================
     BÖLÜM 18) ROTA HAVUZUNU TAM SAYIYA TAMAMLA (tur 5: +1.000 öğe)
     ===================================================================== */
  var T18=[["kültür mirası turu","kültür mirası"],["doğa kaçamağı","doğa manzarası"],["fotoğraf rotası 🇸","fotoğraf noktaları"],["bisiklet turu","bisiklet parkuru"],["yürüyüş parkuru","yürüyüş rotası"],["kamp ve doğa","kamp alanları"],["tarih gezisi","tarihi mekânlar"],["yerel mutfak turu","yerel yemekler"],["müze ve sanat","müzeler"],["mağara ve kanyon","kanyon ve mağara"],["göl ve nehir","göl kenarı"],["kuş gözlem","kuş gözlem noktaları"]];
  var RU_TARGET=12824, r18=0;
  while(RU.length<RU_TARGET && r18<300000){
    var rc18=CITIES[r18%CITIES.length], tm18=T18[Math.floor(r18/CITIES.length)%T18.length], k18=Math.floor(r18/(CITIES.length*T18.length))+1; r18++;
    addR({ n:'🧭 '+rc18.n+' · '+tm18[0]+' · '+k18+'. paket', city:rc18.n, lq:rc18.n+' '+tm18[1],
      s:spots(rc18.n,tm18[1]), d:rc18.n+' için '+tm18[0]+' ('+k18+'. paket): harita ve vlog bağlantılarıyla hemen planla.' });
  }
  try{ console.log('🧭 Bölüm 18: rota havuzu '+RU.length+' öğe (hedef '+RU_TARGET+')'); }catch(e){}

  /* --- Bölüm 18 teşhis kancaları (gerçek/üretilmiş içerik sayıları) --- */
  window.POOL_REAL=function(){ return {
    games:GAMES.filter(function(x){ return !x.gen; }).length, gamesAll:GAMES.length,
    film:MOVIES.filter(function(x){ return !x.gen; }).length, filmAll:MOVIES.length,
    music:MUSIC.filter(function(x){ return !x.gen; }).length, musicAll:MUSIC.length,
    food:FOODS.filter(function(x){ return !x.gen; }).length, foodAll:FOODS.length,
    rota:RU.filter(function(x){ return !x.gen; }).length, rotaAll:RU.length,
    quiz:QUIZ.filter(function(x){ return !x.gen; }).length, quizAll:QUIZ.length
  }; };
  window.POOL_DERS=function(){ var by={}; QUIZ.forEach(function(q){ var k=q.d||'?'; by[k]=(by[k]||0)+1; }); return by; };

  /* --- Bölüm 18 teşhis: havuzda 'undefined' / 'NaN' sızıntısı var mı? --- */
  window.POOL_FIX=function(){ var bad=[], pools=[['oyun',GAMES],['film',MOVIES],['müzik',MUSIC],['yemek',FOODS],['rota',RU],['soru',QUIZ]];
    pools.forEach(function(p){ p[1].forEach(function(x){
      var t=String((x.n||'')+' '+(x.a||'')+' '+(x.s||'')+' '+(x.q||'')+' '+(x.d&&typeof x.d==='string'?x.d:''));
      if(/undefined|NaN|\[object/.test(t)) bad.push(p[0]+': '+t.slice(0,90));
    }); });
    return { kotu: bad.length, ornek: bad.slice(0,5), mUzunluk: M_LL.length, mGenel: M_LL.join('|') }; };
