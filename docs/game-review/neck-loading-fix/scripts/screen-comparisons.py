"""Side-by-side evidence. Original PNG pixels remain unchanged."""
from pathlib import Path
from PIL import Image, ImageDraw
root=Path(__file__).resolve().parents[1]
out=root/'after/inspection';out.mkdir(exist_ok=True)
profiles=['01-face3-hair3-blue-shirt','02-face3-hair1-blue-shirt','03-face2-glasses-hair1-ivory-top']
for profile in profiles:
    for screen in ['selection-A','lobby','walking','booth-result','bridal-result','reaction','group-photo']:
        paths=[root/phase/'flows'/profile/f'{screen}.png' for phase in ['before','after']]
        if not all(p.exists() for p in paths): continue
        a,b=[Image.open(p).convert('RGB') for p in paths]
        assert a.size==b.size
        c=Image.new('RGB',(a.width+b.width,a.height+24),'#fff9ef');d=ImageDraw.Draw(c)
        d.text((8,5),'BEFORE',fill='black');d.text((a.width+8,5),'AFTER',fill='black')
        c.paste(a,(0,24));c.paste(b,(a.width,24));c.save(out/f'{profile}-{screen}-before-after.png')
