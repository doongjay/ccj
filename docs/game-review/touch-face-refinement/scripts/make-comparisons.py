from pathlib import Path
from PIL import Image
import json
root=Path(__file__).resolve().parents[1]
atlas=root/'after/atlas'
old=root.parent/'minimi-silhouette-fix/after/atlas'
out=root/'comparison';out.mkdir(exist_ok=True)
changes=[]
for gender in ['male','female']:
 sheet=Image.new('RGBA',(1152,1152),'#fff9ef')
 for outfit in range(6):
  for face in range(3):
   for hair in range(3):
    name=f'{gender}-face{face}-hair{hair}-outfit{outfit}-1x.png'
    im=Image.open(atlas/name).convert('RGBA');sheet.alpha_composite(im,((face*3+hair)*128,outfit*192))
    prev=Image.open(old/name).convert('RGBA')
    diff=[(i%128,i//128) for i,(p,q) in enumerate(zip(prev.getdata(),im.getdata())) if p!=q]
    changes.append({'id':name,'changedPixels':len(diff),'bounds':[min(x for x,y in diff),min(y for x,y in diff),max(x for x,y in diff),max(y for x,y in diff)] if diff else None})
 sheet.convert('RGB').save(out/f'{gender}-all54-front-native.png')
for gender in ['male','female']:
 for face in [0,1]:
  pair=Image.new('RGBA',(1024,768),'#fff9ef')
  for i,source in enumerate([old,atlas]):pair.alpha_composite(Image.open(source/f'part-{gender}-face{face}-4x.png').convert('RGBA'),(i*512,0))
  pair.convert('RGB').save(out/f'{gender}-face{face+1}-before-after-4x.png')
for row in range(6):
 pair=Image.new('RGBA',(1024,768),'#fff9ef')
 for i,source in enumerate([old,atlas]):pair.alpha_composite(Image.open(source/f'layer-female-outfit5-row{row}-4x.png').convert('RGBA'),(i*512,0))
 pair.convert('RGB').save(out/f'female-sixth-pose{row}-before-after-4x.png')
for p in (root/'before').glob('*.png'):
 after=root/'after'/p.name
 if not after.exists():continue
 a=Image.open(p).convert('RGBA');b=Image.open(after).convert('RGBA')
 if a.size!=b.size:continue
 pair=Image.new('RGBA',(a.width*2,a.height),'#fff9ef');pair.alpha_composite(a);pair.alpha_composite(b,(a.width,0))
 pair.convert('RGB').save(out/p.name)
(root/'after/full-front-pixel-diff.json').write_text(json.dumps(changes,indent=2))
print(json.dumps({'count':len(changes),'changed':sum(x['changedPixels']>0 for x in changes),'maleUnchanged':sum(x['changedPixels']==0 and x['id'].startswith('male') for x in changes)}))
