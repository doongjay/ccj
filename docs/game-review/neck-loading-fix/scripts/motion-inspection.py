"""QA crops from actual browser rendering; integer nearest-neighbor scale only."""
from pathlib import Path
from PIL import Image, ImageDraw
import json
root=Path(__file__).resolve().parents[1]
poses=['down','left','right','up','posing','seated','down-blink','posing-blink','seated-blink']+[f'walk-{p}-{s}' for p in ['down','left','right','up'] for s in range(2)]+['clap-0','clap-1']
out=root/'after/inspection';out.mkdir(exist_ok=True)
for item in json.loads((root/'after/motion/index.json').read_text())['index']:
    ident=item['id'];sheet=Image.new('RGB',(960,720),'#fff9ef');draw=ImageDraw.Draw(sheet)
    for i,pose in enumerate(poses):
        tile=Image.open(root/'after/motion'/f'{ident}-{pose}-1x.png').convert('RGBA').crop((34,65,94,96)).resize((240,124),Image.Resampling.NEAREST)
        x=(i%4)*240;y=(i//4)*144;draw.text((x+4,y+3),pose,fill='black');sheet.paste(tile,(x,y+20),tile)
    sheet.save(out/f'motion-{ident}-neck-4x.png')
