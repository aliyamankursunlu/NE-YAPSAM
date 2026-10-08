
  /* =====================================================================
     7b) GARANTİLİ DOLDURMA — her havuz tam 10.000 öğeye çıkarılır
     (yukarıdaki akıllı stratejiler yetmezse sayaçlı paketlerle tamamlanır)
     ===================================================================== */
  var REALM=MOVIES.filter(function(x){ return !x.gen; });
  var fgi=0;
  while(GAMES.length<TARGET && fgi<400000){
    var c=gc[fgi%gc.length], k2=Math.floor(fgi/gc.length)+1; fgi++;
    var arrG=gRealByG[c.g]||[], exf=[];
    if(arrG.length){ var sg=((fgi*3)%arrG.length); exf=arrG.slice(sg,sg+3); }
    if(exf.length<3) exf=arrG.slice(0,3);
    if(exf.length<3){ var sgr=(fgi*5)%Math.max(1,REALG.length-3); exf=REALG.slice(sgr,sgr+3); }
    if(exf.length<3) exf=[{n:'benzer türler'}];
    addG({ n:P_LBL[c.p]+' · '+c.g+' · '+S_LBL[c.s]+' · '+c.m+' · '+k2+'. paket', p:c.p, g:c.g, s:c.s, m:[c.m], f:c.free?1:0,
      r:+(4+((fgi%9)/10)).toFixed(1), d:'Bu pakete uyan örnekler: '+exf.map(function(x){ return x.n; }).join(', ')+'.',
      lq:exf[0].n, freeOnly:c.free?1:0 });
  }
  var fmi2=0;
  while(MOVIES.length<TARGET && fmi2<400000){
    var cm=mc[fmi2%mc.length], k4=Math.floor(fmi2/mc.length)+1; fmi2++;
    var arrM=mSrc(cm.t,cm.g), ex4=[];
    if(arrM.length){ var sm=((fmi2*3)%arrM.length); ex4=arrM.slice(sm,sm+3); }
    if(ex4.length<3) ex4=arrM.slice(0,3);
    if(ex4.length<3){ var arrA=mSrc('all','all'); ex4=arrA.slice(0,3); }
    if(ex4.length<3) ex4=[{n:'benzer yapımlar',y:2000}];
    addM({ n:'🎬 '+T_LBL[cm.t]+' · '+cm.g+' · '+lLbl(cm.l)+' · '+cm.m+' · '+k4+'. seçki', t:cm.t, g:[cm.g], y:1985+((fmi2*3)%40),
      l:cm.l, r:4.4, pl:PL_PICK(fmi2), m:[cm.m], d:'Öneriler: '+ex4.map(function(x){ return x.n+' ('+(x.y||'')+')'; }).join(', ')+'.', lq:ex4[0].n });
  }
  var fmi=0;
  while(MUSIC.length<TARGET && fmi<400000){
    var ar=artists[fmi%artists.length], k3=Math.floor(fmi/artists.length)+1, tp=MU_TMPL[fmi%MU_TMPL.length]; fmi++;
    addMu({ a:ar.a, s:tp+' · '+k3+'. seçki', g:ar.g, y:1975+(fmi%50), m:ar.m.slice(0,2) });
  }
  var ffi=0;
  while(FOODS.length<TARGET && ffi<400000){
    var ing3=ING[ffi%ING.length], st4=FSTYLE[Math.floor(ffi/ING.length)%FSTYLE.length], k6=Math.floor(ffi/(ING.length*FSTYLE.length))+1; ffi++;
    addF({ n:ing3.charAt(0).toUpperCase()+ing3.slice(1)+' ile '+st4.n+' — '+k6+'. fikir', k:[MEALS[ffi%MEALS.length]], t:st4.t,
      dk:st4.dk, z:st4.z, mal:[ing3,'tuz','zeytinyağı'], v:st4.v, lq:ing3+' tarifi',
      d:'Kilerinde '+ing3+' varsa '+st4.n.toLowerCase()+' için '+k6+'. öneri paketi.' });
  }
  var fri=0;
  while(RU.length<TARGET && fri<400000){
    var rc=CITIES[fri%CITIES.length], tm=TEMA[Math.floor(fri/CITIES.length)%TEMA.length], k5=Math.floor(fri/(CITIES.length*TEMA.length))+1; fri++;
    addR({ n:rc.n+' · '+tm[0]+' · '+k5+'. rota paketi', city:rc.n, lq:rc.n+' '+tm[1], s:spots(rc.n,tm[1]),
      d:rc.n+' için '+tm[0]+' odaklı '+k5+'. rota paketi; başlıkları haritada açabilirsin.' });
  }
  /* 20 şablonlu hızlı doldurma: her soru benzersiz parametrelerle üretilir */
  var FILLQ=[
    function(xa,yb){ return ['orta','Matematik',2, xa+' sayısının '+yb+' eksiği kaçtır?', xa-yb, xa+'−'+yb+'='+(xa-yb)+'.']; },
    function(xa,yb,zd){ return ['ilk','Matematik',2, yb+' × '+zd+' kaçtır?', yb*zd, yb+'×'+zd+'='+(yb*zd)+'.']; },
    function(xa,yb){ return ['lise','Matematik',3, xa+' ÷ '+yb+' işleminde bölüm kaçtır?', Math.floor(xa/yb), xa+' ÷ '+yb+' ≈ '+Math.floor(xa/yb)+'.']; },
    function(xa){ return ['her','Matematik',1, xa+' sayısından sonra gelen sayı kaçtır?', xa+1, xa+'+1='+(xa+1)+'.']; },
    function(xa){ return ['ilk','Matematik',1, xa+' + 100 kaçtır?', xa+100, xa+'+100='+(xa+100)+'.']; },
    function(xa){ return ['orta','Matematik',2, xa+' sayısının iki katı kaçtır?', xa*2, '2×'+xa+'='+(xa*2)+'.']; },
    function(xa){ return ['orta','Matematik',2, xa+' sayısının çeyreği (1/4) kaçtır?', Math.floor(xa/4), xa+'÷4='+Math.floor(xa/4)+'.']; },
    function(xa){ return ['lise','Matematik',3, xa+' sayısının %25 fazlası kaçtır?', Math.round(xa*1.25), xa+'×1,25='+Math.round(xa*1.25)+'.']; },
    function(xa,yb){ return ['ilk','Matematik',1, yb+' × 3 kaçtır?', yb*3, yb+'×3='+(yb*3)+'.']; },
    function(xa){ return ['orta','Matematik',2, xa+' ÷ 10 işleminde tam kısım kaçtır?', Math.floor(xa/10), xa+'÷10='+Math.floor(xa/10)+'.']; },
    function(xa,yb){ return ['ilk','Fen',2, yb+' kg kaç gramdır?', yb*1000, '1 kg = 1000 g → '+yb+'×1000='+(yb*1000)+'.']; },
    function(xa,yb){ return ['orta','Hayat Bilgisi',2, yb+' dakika kaç saniyedir?', yb*60, '1 dk = 60 sn → '+yb+'×60='+(yb*60)+'.']; },
    function(xa,yb){ return ['orta','Hayat Bilgisi',2, (yb+1)+' saat kaç dakikadır?', (yb+1)*60, '1 saat = 60 dk → '+(yb+1)+'×60='+((yb+1)*60)+'.']; },
    function(xa,yb){ return ['orta','Matematik',2, 'Kenar uzunluğu '+yb+' cm olan karenin çevresi kaç cm?', yb*4, 'Çevre = 4×'+yb+' = '+(yb*4)+' cm.']; },
    function(xa,yb){ return ['lise','Matematik',3, 'Uzun kenarı '+yb+' cm, kısa kenarı 3 cm olan dikdörtgenin çevresi?', 2*(yb+3), '2×('+yb+'+3)='+(2*(yb+3))+' cm.']; },
    function(xa){ return ['ilk','Matematik',1, xa+' sayısının yarısı kaçtır?', Math.floor(xa/2), xa+'÷2='+Math.floor(xa/2)+'.']; },
    function(xa){ return ['lise','Matematik',3, xa+' sayısının %10\'u kaçtır?', Math.round(xa/10), xa+'×10/100='+Math.round(xa/10)+'.']; },
    function(xa,yb){ return ['orta','Matematik',2, xa+' + '+yb+' + 50 kaçtır?', xa+yb+50, 'Toplam: '+(xa+yb+50)+'.']; },
    function(xa,yb){ return ['lise','Matematik',3, '('+xa+' + '+yb+') ÷ 2 kaçtır?', Math.round((xa+yb)/2), 'Toplam '+(xa+yb)+' ÷ 2 = '+Math.round((xa+yb)/2)+'.']; },
    function(xa){ return ['orta','Matematik',2, xa+' sayısının en yakın onluğa yuvarlanmış hali nedir?', Math.round(xa/10)*10, 'En yakın onluk: '+(Math.round(xa/10)*10)+'.']; }
  ];
  var fqi=0;
  while(QUIZ.length<TARGET && fqi<40000){
    var xa=137+((fqi*37)%8600), yb=1+((fqi*17)%96), zd=2+((fqi*7)%9);
    var ft=FILLQ[fqi%FILLQ.length]; fqi++;
    var fr=ft(xa,yb,zd);
    mkQ(fr[0],fr[1],fr[2],fr[3],fr[4],numFiller(fr[4]),fr[5]);
  }
  /* güvenlik: sayaç yetmezse son çare (asla sonsuz döngü olmaz) */

