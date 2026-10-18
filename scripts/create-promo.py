"""Render ONE OFF's existing wordmark, palette and rule as store graphics."""
from pathlib import Path
from PIL import Image,ImageDraw,ImageFont
root=Path(__file__).resolve().parents[1]
out=root/'release'/'assets';out.mkdir(parents=True,exist_ok=True)
font='/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf'
regular='/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf'
def make(size,banner=False):
 w,h=size;im=Image.new('RGB',size);px=im.load()
 for y in range(h):
  for x in range(w):
   k=max(0,1-(((x-w*.5)/(w*.9))**2+((y+h*.12)/(h*1.1))**2)**.5)
   px[x,y]=(int(9+24*k),int(11+28*k),int(16+40*k))
 d=ImageDraw.Draw(im);lime='#b8ff39';white='#f7f8fb';muted='#aeb5c4'
 def text(s,y,n,color=white,x=None,bold=True):
  f=ImageFont.truetype(font if bold else regular,n);box=d.textbbox((0,0),s,font=f);tw=box[2]-box[0]
  d.text(((w-tw)//2 if x is None else x,y),s,font=f,fill=color)
 if banner:
  text('ONE',48,80,x=70);text('OFF',48,80,lime,x=280)
  text('Miss perfectly.',160,52,x=70)
  text('Five rounds. Exactly one away.',248,23,muted,x=72,bold=False)
  d.rounded_rectangle((790,55,1188,305),28,fill='#151923',outline='#343b4c',width=2)
  text('TARGET',80,18,muted,x=945)
  text('73',108,72,x=932)
  text('WIN: 72 or 74',234,28,lime,x=883)
 else:
  one=ImageFont.truetype(font,78);a='ONE ';b='OFF';aw=d.textlength(a,font=one);bw=d.textlength(b,font=one);sx=(w-aw-bw)/2
  d.text((sx,42),a,font=one,fill=white);d.text((sx+aw,42),b,font=one,fill=lime)
  text('Miss perfectly.',144,40)
  d.rounded_rectangle((102,225,528,381),24,fill='#151923',outline='#343b4c',width=2)
  text('TARGET 73',245,28,muted)
  text('WIN: 72 or 74',304,34,lime)
  text('Five rounds. Exactly one away.',422,23,muted,bold=False)
 return im
make((630,500)).save(out/'one-off-cover-630x500.png')
make((1260,360),True).save(out/'one-off-banner-1260x360.png')
# Use unaltered browser captures as the source of the promotional crops.
shots=root/'release'/'screenshots';evidence=root/'qa'/'evidence';evidence.mkdir(parents=True,exist_ok=True)
for name in ['01-home-desktop.jpg','02-perfect-result-desktop.jpg']:
 p=shots/name
 if p.exists() and not (evidence/name).exists():p.rename(evidence/name)
 raw=evidence/name
 if raw.exists():
  im=Image.open(raw);left=round((im.width-480)/2)
  im.crop((left,0,left+480,im.height)).save(p,quality=95)
for original,target in [('mobile-home-full.jpg','03-home-mobile-360.jpg'),('mobile-pick-full.jpg','04-pick-one-mobile-360.jpg'),('mobile-quick-tap-full.jpg','05-quick-tap-mobile-360.jpg'),('mobile-result-full.jpg','06-perfect-result-mobile-360.jpg')]:
 p=shots/original
 if p.exists():p.rename(evidence/original)
 raw=evidence/original
 if raw.exists():Image.open(raw).crop((502,35,862,835)).save(shots/target,quality=95)
print('Store graphics and authentic browser screenshot crops ready.')
