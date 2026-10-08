# part17.js = tüm parçaların sırayla birleşimi (tur 6)
# !!! KALICI ANAHTAR neyapsam_v1 SABİT KALMALI — qa/key20.js bekçi testi vardır !!!
order = ['p17a.js','p17b.js','p17c.js','p17d.js','p17e.js','p17f.js','p17f2.js','p18.js','p17g.js','p19a.js','p19b.js','p19c.js','p20.js','p21.js']
out = '\n'.join(open(f, encoding='utf-8').read() for f in order)
open('part17.js','w',encoding='utf-8').write(out)
print('part17.js:', len(out), 'karakter |', len(order), 'parça')
