import re
s=open('/home/user/ne-yapsam.html',encoding='utf-8').read()
# inline handler gövdelerini topla: onclick="..." / onchange="..." (kapanış tırnağına kadar)
bad=[]
for m in re.finditer(r'on(click|change)="([^"]{0,220})"', s):
    body=m.group(2)
    nxt=s[m.end():m.end()+2]
    # erken kapanma işareti: kapanıştan hemen sonra ')' veya ';' gibi kod artığı
    if '+' in body and re.search(r'\(\s*$', body) or body.endswith('(') or nxt.startswith(')') or nxt.startswith('"'):
        bad.append((m.group(1), body[:110], nxt))
print('şüpheli inline handler:', len(bad))
for b in bad[:15]:
    print(' •', b[0], '→', b[1], '| kuyruk:', repr(b[2]))
