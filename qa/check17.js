const fs=require('fs'), acorn=require('acorn');
const html=fs.readFileSync('/home/user/ne-yapsam.html','utf8');
const blocks=[...html.matchAll(/<script>([\s\S]*?)<\/script>/g)].map(m=>m[1]);
let ok=0, bad=[];
blocks.forEach((b,i)=>{ try{ acorn.parse(b,{ecmaVersion:2022}); ok++; }catch(e){ bad.push('blok '+(i+1)+': '+e.message); } });
console.log('script blokları:', blocks.length, '| sözdizimi OK:', ok);
if(bad.length){ console.log('HATALAR:\n'+bad.join('\n')); process.exit(1); }
console.log('Part 17 var mı:', html.includes('Bölüm 17 — DEV ÖNERİ HAVUZU'));
