
  /* =====================================================================
     7) HAVUZLARI 11.000'E DOLDUR
     ===================================================================== */
  var TARGET=11000;
  function rnd(a,b){ return a+Math.floor(R()*(b-a+1)); }

  /* ---------------- OYUNLAR ---------------- */
  var gNames={}; GAMES.forEach(function(x){ gNames[x.n]=1; });
  G_SEED.forEach(function(g){ if(!gNames[g.n]){ gNames[g.n]=1; GAMES.push(g); } });
  var G_GG=UNIQ(GAMES.map(function(x){ return x.g; }));
  var G_SS=UNIQ(GAMES.map(function(x){ return x.s; }));
  var G_MM=UNIQ(GAMES.reduce(function(a,x){ return a.concat(x.m||[]); },[]));
  var G_PP=['steam','epic','diger'];
  var P_LBL={steam:'Steam',epic:'Epic Games',diger:'Tarayıcı/Diğer'};
  var S_LBL={kısa:'Kısa (1-5 saat)',orta:'Orta (5-20 saat)',uzun:'Uzun (20+ saat)'};
  // gerçek oyun indeksi (tür + süre + ruh hali)
  var gByG={};
  GAMES.slice().forEach(function(x){ (gByG[x.g]=gByG[x.g]||[]).push(x); });
  function gEx(g,p,s,m,free,k){
    var out=[], src=gByG[g]||[], i;
    for(i=0;i<src.length&&out.length<k;i++){ var x=src[i]; if(x.gen) continue;
      if(p&&x.p!==p) continue; if(s&&x.s!==s) continue; if(m&&(x.m||[]).indexOf(m)<0) continue; if(free&&!x.f) continue;
      out.push(x); }
    if(out.length<3){ // kademeli gevşetme
      for(i=0;i<src.length&&out.length<k;i++){ var y=src[i]; if(y.gen) continue; if(s&&y.s!==s) continue;
        if(m&&(y.m||[]).indexOf(m)<0) continue; if(out.indexOf(y)<0) out.push(y); } }
    if(out.length<3){ for(i=0;i<src.length&&out.length<k;i++){ var z=src[i]; if(z.gen) continue; if(out.indexOf(z)<0) out.push(z); } }
    return out;
  }
  function addG(o){ if(gNames[o.n]) return false; gNames[o.n]=1; o.gen=1; GAMES.push(o); return true; }

  var gRealByG={}; GAMES.forEach(function(x){ if(!x.gen){ (gRealByG[x.g]=gRealByG[x.g]||[]).push(x); } });
  var gc=[]; G_PP.forEach(function(p){ G_GG.forEach(function(g){ G_SS.forEach(function(s){ G_MM.forEach(function(m){
    gc.push({p:p,g:g,s:s,m:m}); if(p!=='epic') gc.push({p:p,g:g,s:s,m:m,free:1}); }); }); }); });
  gc=SH(gc);
  var gi=0, G_BUDGET=Math.round((TARGET-64)*0.62);
  while(GAMES.length<64+G_BUDGET && gi<gc.length){
    var c=gc[gi++], ex=gEx(c.g,c.p,c.s,c.m,c.free,4);
    if(ex.length<3) continue;
    var nm=P_LBL[c.p]+' · '+c.g+' · '+S_LBL[c.s]+' · '+c.m+(c.free?' · ücretsiz':'');
    addG({ n:nm, p:c.p, g:c.g, s:c.s, m:[c.m], f:c.free?1:0, r:+(4+((gi%9)/10)).toFixed(1),
      d:'Bu pakete uyan örnekler: '+ex.map(function(x){ return x.n; }).join(', ')+'. Tek tıkla mağazada benzerlerine bak.',
      lq:ex[0].n, freeOnly:c.free?1:0 });
  }
  // "X benzeri" paketleri (gerçek oyunlar üzerinden)
  var REALG=GAMES.filter(function(x){ return !x.gen; });
  var GT=['%s benzeri oyunlar','%s alternatifleri','%s oynayanlar bunları da sever','%s gibi ama daha kısa'];
  var ti=0;
  while(GAMES.length<64+G_BUDGET+Math.round((TARGET-64)*0.3) && ti<REALG.length*GT.length){
    var src=REALG[ti%REALG.length], tpl=GT[Math.floor((ti/REALG.length)%GT.length)]; ti++;
    var rel=(gByG[src.g]||[]).filter(function(x){ return x.n!==src.n; }).slice(0,4);
    if(rel.length<2) continue;
    addG({ n:tpl.replace('%s',src.n), p:src.p, g:src.g, s:src.s, m:(src.m||[]).slice(0,1), r:src.r, f:0,
      d:'Örnekler: '+rel.map(function(x){ return x.n; }).join(', ')+'. '+src.g+' türünde, '+src.s+' uzunlukta öneriler.',
      lq:src.n });
  }
  // yıl / tema paketleri
  var GTHEME=['Türkçe dil desteği olan','düşük sistem gerektiren','klavye-mouse ile oynanan','gamepad ile oynanan','tek başına oynanacak','arkadaşlarla oynanacak','sabaha kadar oynanacak','15 dakikalık molalık','kış akşamı için','yağmurlu gün için','gizlilik modunda','öğrenmeye uygun','çocuklarla oynanabilir','rahatlatıcı','stres atmak için','rekabetçi','hikâye odaklı','açık dünya','retro hissi veren','piksel grafikli'];
  var yi=1998, gi2=0;
  while(GAMES.length<TARGET && gi2<GTHEME.length*G_GG.length){
    var th=GTHEME[gi2%GTHEME.length], gg=G_GG[Math.floor(gi2/GTHEME.length)%G_GG.length]; gi2++;
    var exx=gByG[gg]||[]; if(exx.length<3) continue;
    addG({ n:'🎮 '+th+' '+gg+' oyunları', p:P_PICK(gi2), g:gg, s:G_SS[gi2%3], m:[G_MM[gi2%G_MM.length]], r:4.5,
      d:'Seçkim: '+exx.slice(0,4).map(function(x){ return x.n; }).join(', ')+'.', lq:exx[0].n });
  }
  function P_PICK(i){ return G_PP[i%3]; }

  /* ---------------- FİLMLER ---------------- */
  var mNames={}; MOVIES.forEach(function(x){ mNames[x.n]=1; });
  M_SEED.forEach(function(m){ if(!mNames[m.n]){ mNames[m.n]=1; MOVIES.push(m); } });
  var M_TT=UNIQ(MOVIES.map(function(x){ return x.t; }));
  var M_GG=UNIQ(MOVIES.reduce(function(a,x){ return a.concat(x.g); },[]));
  var M_LL=UNIQ(MOVIES.map(function(x){ return x.l; })).filter(function(v){ return v==='kısa'||v==='orta'||v==='uzun'||v==='sezon'; });
  if(!M_LL.length) M_LL=['orta'];
  var M_MM=UNIQ(MOVIES.reduce(function(a,x){ return a.concat(x.m||[]); },[]));
  var mByG={}; MOVIES.slice().forEach(function(x){ x.g.forEach(function(g){ (mByG[g]=mByG[g]||[]).push(x); }); });
  var mByT={}; MOVIES.slice().forEach(function(x){ (mByT[x.t]=mByT[x.t]||[]).push(x); });
  /* türe göre gerçek içerik dizini — her çağrıda filtrelemek yerine bir kez hesaplanır */
  var mSrcCache={};
  function mSrc(t,g){ var key=t+'|'+g; if(mSrcCache[key]) return mSrcCache[key];
    var base=(g==='all')?MOVIES.slice():(mByG[g]||[]);
    var arr=base.filter(function(x){ return !x.gen && (t==='all'||x.t===t); });
    mSrcCache[key]=arr; return arr; }
  function mEx(t,g,l,m,k){
    var out=[], src=mSrc(t,g);
    for(var i=0;i<src.length&&out.length<k;i++){ var x=src[i]; if(x.gen) continue; if(l!=='all'&&x.l!==l) continue; if(m!=='all'&&(x.m||[]).indexOf(m)<0) continue; out.push(x); }
    if(out.length<3){ for(var j=0;j<src.length&&out.length<k;j++){ var y=src[j]; if(y.gen||out.indexOf(y)>=0) continue; out.push(y); } }
    return out;
  }
  function addM(o){ if(mNames[o.n]) return false; mNames[o.n]=1; o.gen=1; MOVIES.push(o); return true; }
  var T_LBL={film:'Film',dizi:'Dizi',anime:'Anime',belgesel:'Belgesel'};
  var L_LBL={kısa:'Kısa (90 dk-)',orta:'Orta',uzun:'Uzun (2.5 saat+)',sezon:'Dizi/Sezon'};
  function lLbl(l){ return L_LBL[l]||'Orta'; }   /* eksik uzunluk bilgisi olan kayıtlarda 'undefined' görünmesin */
  var PL_LIST=(function(){ var o=[], seen={}; MOVIES.forEach(function(x){ if(x.pl&&!seen[x.pl]){ seen[x.pl]=1; o.push(x.pl); } }); return o.length?o:['Netflix']; })();
  function PL_PICK(i){ return PL_LIST[(i%PL_LIST.length+PL_LIST.length)%PL_LIST.length]; }

  var mc=[]; M_TT.forEach(function(t){ M_GG.forEach(function(g){ M_LL.forEach(function(l){ M_MM.forEach(function(m){
    mc.push({t:t,g:g,l:l,m:m}); }); }); }); });
  mc=SH(mc);
  var mi=0, M_BUDGET=Math.round(TARGET*0.55);
  while(MOVIES.length<52+M_BUDGET && mi<mc.length){
    var c=mc[mi++], ex=mEx(c.t,c.g,c.l,c.m,4);
    if(ex.length<3) continue;
    addM({ n:'🎬 '+T_LBL[c.t]+' · '+c.g+' · '+lLbl(c.l)+' · '+c.m, t:c.t, g:[c.g], y:1990+(mi%36), l:c.l, r:4.4, pl:PL_PICK(mi), m:[c.m],
      d:'Öneriler: '+ex.map(function(x){ return x.n+' ('+x.y+')'; }).join(', ')+'.', lq:ex[0].n });
  }
  var CINEMA=['Türk sineması','Amerikan sineması','Kore sineması','Japon sineması','Fransız sineması','İtalyan sineması','İspanyol sineması','İngiliz sineması','Alman sineması','İskandinav sineması','İran sineması','Hint sineması','Rus sineması','Latin Amerika sineması','Balkan sineması','Avustralya sineması'];
  var M_THEME=['tek gecelik maraton','aile ile izlenecek','ilk randevu için','yağmurlu gün','yaz akşamı','kış gecesi','ağlatan','güldüren','düşündüren','korkutan','heyecanlandıran','rahatlatan','nostaljik','kafa yoran','ilham veren'];
  var mt=0;
  while(MOVIES.length<52+M_BUDGET+Math.round(TARGET*0.25) && mt<M_TT.length*CINEMA.length*2){
    var tt=M_TT[mt%CINEMA.length%M_TT.length], cin=CINEMA[mt%CINEMA.length]; mt++;
    var exm=mEx(tt,'all','all','all',4); if(exm.length<3) continue;
    var nm2='🌍 '+cin+' · '+T_LBL[tt]+' seçkisi';
    addM({ n:nm2, t:tt, g:[M_GG[mt%M_GG.length]], y:1980+(mt%46), l:M_LL[mt%M_LL.length], r:4.5, pl:PL_PICK(mt), m:[M_MM[mt%M_MM.length]],
      d:'Bu seçkide: '+exm.map(function(x){ return x.n; }).join(', ')+'.', lq:exm[0].n });
  }
  var mt2=0;
  while(MOVIES.length<TARGET && mt2<M_THEME.length*M_TT.length){
    var thm=M_THEME[mt2%M_THEME.length], t2=M_TT[Math.floor(mt2/M_THEME.length)%M_TT.length]; mt2++;
    var ex3=mEx(t2,'all','all',thm,4); if(ex3.length<3) ex3=mEx(t2,'all','all','all',4);
    if(ex3.length<3) continue;
    addM({ n:'🎬 '+thm.charAt(0).toUpperCase()+thm.slice(1)+' '+T_LBL[t2].toLowerCase()+'ler', t:t2, g:[M_GG[mt2%M_GG.length]], y:1995+(mt2%31), l:M_LL[mt2%4], r:4.4, pl:PL_PICK(mt2), m:[thm],
      d:'Seçkim: '+ex3.map(function(x){ return x.n; }).join(', ')+'.', lq:ex3[0].n });
  }

  /* ---------------- MÜZİK ---------------- */
  var MU_TMPL=['en iyileri','en iyi akustik kayıtları','konser performansları','sakin parçaları','enerjik parçaları','yol şarkıları','duygusal parçaları','çıkış dönemi şarkıları','düet ve coverları','derleme albümü','gece dinlemelik','odaklanma çalma listesi'];
  var muKeys={};
  MUSIC.forEach(function(x){ muKeys[(x.a+' — '+x.s).toLowerCase()]=1; });
  function addMu(o){ var k=(o.a+' — '+o.s).toLowerCase(); if(muKeys[k]) return false; muKeys[k]=1; o.gen=1; MUSIC.push(o); return true; }
  /* gerçek şarkılar: üretilmiş paketlerden farklı olarak "gerçek içerik" olarak işaretlenir */
  S_SONGS.forEach(function(s){ var mk=(s.a+' — '+s.s).toLowerCase(); if(muKeys[mk]) return; muKeys[mk]=1; s.gen=0; MUSIC.push(s); });
  var artists=AR_TR.concat(AR_INT), ai=0;
  while(MUSIC.length<TARGET*0.72 && ai<artists.length*MU_TMPL.length){
    var ar=artists[Math.floor(ai/MU_TMPL.length)%artists.length], tp=MU_TMPL[ai%MU_TMPL.length]; ai++;
    addMu({ a:ar.a, s:tp, g:ar.g, y:1975+(ai%50), m:ar.m.slice(0,2) });
  }
  var MU_MOOD=UNIQ(MUSIC.reduce(function(a,x){ return a.concat(x.m||[]); },[]));
  var MU_GG=UNIQ(MUSIC.map(function(x){ return x.g; }));
  var MD=['ders çalışırken','spor yaparken','yolculukta','uyumadan önce','sabah rutini','kahve molası','yağmurlu gün','parti gecesi','nostalji akşamı','odaklanma seansı','koşu temposu','kamp ateşi'];
  var mui=0;
  while(MUSIC.length<TARGET*0.9 && mui<MU_MOOD.length*MU_GG.length*2){
    var mo2=MU_MOOD[mui%MU_MOOD.length], gg2=MU_GG[Math.floor(mui/MU_MOOD.length)%MU_GG.length], dur=MD[mui%MD.length]; mui++;
    if(!addMu({ a:'🎧 '+dur+' · '+gg2, s:mo2+' seçkisi', g:gg2, y:1990+(mui%35), m:[mo2,dur.split(' ')[0]] })) continue;
  }
  var mui2=0;
  while(MUSIC.length<TARGET && mui2<MU_GG.length*8){
    var g3=MU_GG[mui2%MU_GG.length], dec=1970+(mui2%6)*10; mui2++;
    var mo3=MU_MOOD[(mui2*3)%MU_MOOD.length];
    if(!addMu({ a:'🎧 '+dec+'ler '+g3, s:mo3+' listesi', g:g3, y:dec, m:[mo3] })) continue;
  }
