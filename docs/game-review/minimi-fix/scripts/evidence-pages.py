"""Arrange existing evidence pixels without scaling, filtering or retouching."""
from pathlib import Path
import hashlib, json, struct, subprocess, zlib

root = Path(__file__).resolve().parents[1]
out = root / 'after' / 'inspection-pages'
out.mkdir(exist_ok=True)
records = []
def read(path):
    data = path.read_bytes()
    w,h = struct.unpack('>II', data[16:24])
    rgba = subprocess.check_output(['/opt/homebrew/bin/ffmpeg','-v','error','-i',str(path),'-f','rawvideo','-pix_fmt','rgba','-frames:v','1','-'])
    return w,h,rgba
def chunk(kind, data):
    return struct.pack('>I',len(data))+kind+data+struct.pack('>I',zlib.crc32(kind+data))
def page(name, paths, columns):
    images=[read(p) for p in paths]
    tw,th=images[0][:2]; w,h=tw*columns,th*((len(images)+columns-1)//columns)
    result=bytearray(w*h*4)
    for i,(iw,ih,rgba) in enumerate(images):
        assert (iw,ih)==(tw,th)
        for y in range(th):
            pos=(((i//columns)*th+y)*w+(i%columns)*tw)*4
            result[pos:pos+tw*4]=rgba[y*tw*4:(y+1)*tw*4]
    scan=b''.join(b'\0'+result[y*w*4:(y+1)*w*4] for y in range(h))
    data=b'\x89PNG\r\n\x1a\n'+chunk(b'IHDR',struct.pack('>IIBBBBB',w,h,8,6,0,0,0))+chunk(b'IDAT',zlib.compress(scan,9))+chunk(b'IEND',b'')
    (out/name).write_bytes(data)
    records.append({'file':name,'size':[w,h],'transform':'integer translation only; source RGBA unchanged','sources':[{'path':str(p.relative_to(root)),'sha256':hashlib.sha256(p.read_bytes()).hexdigest()} for p in paths]})
atlas=root/'after'/'atlas'
for gender in ['male','female']:
    for face in range(3):
        page(f'native-{gender}-face{face}.png',[atlas/f'page-{gender}-face{face}-outfit{i}-1x.png' for i in range(5)],1)
    for part,count in [('face',3),('hair',3),('outfit',5)]:
        for start in range(0,count,3):
            paths=[atlas/f'part-{gender}-{part}{i}-4x.png' for i in range(start,min(count,start+3))]
            page(f'parts-{gender}-{part}-{start}-4x.png',paths,3)
    for part,count in [('face',3),('hair',3),('outfit',5)]:
        page(f'parts-{gender}-{part}-1x.png',[atlas/f'part-{gender}-{part}{i}-1x.png' for i in range(count)],3)
for ident in ['01-face3-hair3-blue-shirt','02-face3-hair1-blue-shirt','03-face2-glasses-hair1-ivory-top']:
    name=ident+'-393x852-face-neck-4x.png'
    page(ident+'-BEFORE-left-AFTER-right.png',[root/'before'/name,root/'after'/name],2)
page('first-face-BEFORE-left-AFTER-right.png',[root/'before/atlas/part-male-face0-4x.png',root/'after/atlas/part-male-face0-4x.png'],2)
(out/'index.json').write_text(json.dumps(records,indent=2)+'\n')
print(json.dumps({'pages':len(records),'output':str(out)}))
