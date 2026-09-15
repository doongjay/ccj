"""QA only: arrange/crop actual rendered pixels, never rewrite production artwork."""
from pathlib import Path
from PIL import Image, ImageDraw
import json
root=Path(__file__).resolve().parents[1]
out=root/'after'/'inspection';out.mkdir(parents=True,exist_ok=True)
records=[]
for gender in ['male','female']:
    full=Image.new('RGB',(128*9,212*6),'#fff9ef'); neck=Image.new('RGB',(192*9,196*6),'#fff9ef')
    fd=ImageDraw.Draw(full);nd=ImageDraw.Draw(neck)
    for outfit in range(6):
        for face in range(3):
            for hair in range(3):
                col=face*3+hair;name=f'{gender}-face{face}-hair{hair}-outfit{outfit}'
                c=Image.open(root/'after/atlas'/f'{name}-1x.png').convert('RGBA')
                full.paste(c,(col*128,outfit*212+20),c);fd.text((col*128,outfit*212),f'F{face+1} H{hair+1} O{outfit+1}',fill='black')
                crop=c.crop((40,65,88,109)).resize((192,176),Image.Resampling.NEAREST)
                neck.paste(crop,(col*192,outfit*196+20),crop);nd.text((col*192,outfit*196),f'F{face+1} H{hair+1} O{outfit+1}',fill='black')
                records.append(name)
    full.save(out/f'{gender}-all-54-front-native.png');neck.save(out/f'{gender}-all-54-neck-4x.png')
for name in ['01-face3-hair3-blue-shirt','02-face3-hair1-blue-shirt','03-face2-glasses-hair1-ivory-top']:
    suffix='-393x852-face-neck-4x.png';a=Image.open(root/'before'/(name+suffix));b=Image.open(root/'after'/(name+suffix));c=Image.new('RGB',(a.width+b.width,a.height+24),'#fff9ef');d=ImageDraw.Draw(c);d.text((8,4),'BEFORE',fill='black');d.text((a.width+8,4),'AFTER',fill='black');c.paste(a,(0,24),a);c.paste(b,(a.width,24),b);c.save(out/f'{name}-before-after-4x.png')
(out/'index.json').write_text(json.dumps({'count':len(records),'order':'rows outfit 1..6; columns face1/hair1..3, face2/hair1..3, face3/hair1..3','profiles':records,'pixels':'native sprites; neck crop at 4x NEAREST; cream background for alpha inspection'},indent=2))
