"""Conventional photo processing only: crop, median smoothing, color quantization and edge ink.
No generative model, face replacement, age synthesis or inferred attributes are used.
"""
from pathlib import Path
import json,re
from PIL import Image,ImageOps,ImageFilter,ImageEnhance,ImageChops,ImageDraw
root=Path(__file__).resolve().parents[1]/'dist'
out=root/'assets'/'portraits'/'illustrated'
out.mkdir(exist_ok=True)
preview=[]
for ledger in ('commons-manifest.json','official-manifest.json'):
    path=root/'assets'/'portraits'/ledger
    records=json.loads(path.read_text(encoding='utf-8-sig'))
    for p in records:
        photo_file=p.get('photoFile',p['file'])
        photo=ImageOps.exif_transpose(Image.open(root/photo_file)).convert('RGB')
        if p.get('crop'):
            left,top,right,bottom=p['crop']
            photo=photo.crop((round(left*photo.width),round(top*photo.height),round(right*photo.width),round(bottom*photo.height)))
        values=re.findall(r'([\d.]+)%',p.get('position','50% 25%'))
        center=tuple(float(v)/100 for v in values[:2]) if len(values)>=2 else (.5,.25)
        crop=ImageOps.fit(photo,(300,400),Image.Resampling.LANCZOS,centering=center)
        smooth=crop.filter(ImageFilter.MedianFilter(3)).filter(ImageFilter.SMOOTH_MORE)
        colors=ImageOps.posterize(ImageEnhance.Color(ImageEnhance.Contrast(smooth).enhance(1.08)).enhance(.72),3)
        edges=ImageOps.grayscale(smooth).filter(ImageFilter.FIND_EDGES)
        ink=edges.point(lambda v: 100 if v>48 else 255).filter(ImageFilter.GaussianBlur(.35)).convert('RGB')
        result=Image.blend(colors,ImageChops.multiply(colors,ink),.45)
        result=ImageEnhance.Sharpness(result).enhance(1.15)
        filename=Path(photo_file).stem+'.png'
        result.quantize(colors=256).save(out/filename,optimize=True)
        p['photoFile']=photo_file;p['file']='assets/portraits/illustrated/'+filename
        p['treatment']='Non-generative crop, median smoothing, limited-palette color quantization and edge-ink processing of the identified source photograph.'
        p['adaptation']='Illustration treatment and portrait crop by deterministic image processing. Original source attribution and license remain applicable.'
        if p['name'] in ('Gary King','Bruce Desmarais','Dino Christenson','W. E. B. Du Bois'):
            preview.append((p['name'],result))
    path.write_text(json.dumps(records,ensure_ascii=False,indent=2),encoding='utf-8')
sheet=Image.new('RGB',(len(preview)*220,322),'#e8d9b7');draw=ImageDraw.Draw(sheet)
for i,(name,photo) in enumerate(preview):
    sheet.paste(photo.resize((210,280)),(i*220,0));draw.text((i*220+6,290),name,fill='#302719')
sheet.save(Path(__file__).parent/'portrait-treatment-preview.png')
print('Processed 27 identified portrait photographs with deterministic filters.')
