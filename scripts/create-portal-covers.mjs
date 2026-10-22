// Extend the existing code-native wordmark/palette. No third-party visual assets.
import {createRequire} from 'node:module';
import {mkdir,writeFile} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const require=createRequire(import.meta.url);
let sharp;try{sharp=require('sharp')}catch{sharp=require(path.join(process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES,'sharp'))}
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const out=path.join(root,'release','portal','covers');await mkdir(out,{recursive:true});
for(const [name,w,h] of [['landscape',1920,1080],['portrait',800,1200],['square',800,800]]){
 const portrait=h>w,scale=w/800,titleY=portrait?350:h*.42,titleSize=portrait?160:Math.min(w*.19,h*.30),cx=w*.5;
 const svg=`<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
 <defs><radialGradient id="bg" cx="50%" cy="0%" r="100%"><stop stop-color="#2c354b"/><stop offset="1" stop-color="#090b10"/></radialGradient><filter id="glow"><feGaussianBlur stdDeviation="${18*scale}"/></filter></defs>
 <rect width="100%" height="100%" fill="url(#bg)"/>
 <circle cx="${cx}" cy="${h*.7}" r="${w*.27}" fill="#b8ff39" opacity=".12" filter="url(#glow)"/>
 <g fill="none" stroke="#3b465c" stroke-width="${3*scale}" opacity=".6"><circle cx="${cx}" cy="${h*.69}" r="${Math.min(w,h)*.21}"/><circle cx="${cx}" cy="${h*.69}" r="${Math.min(w,h)*.30}"/></g>
 <g transform="translate(${cx},${h*.69}) rotate(-8)"><rect x="${-w*.18}" y="${-w*.105}" width="${w*.17}" height="${w*.17}" rx="${w*.032}" fill="#b8ff39"/><rect x="${w*.015}" y="${-w*.085}" width="${w*.17}" height="${w*.17}" rx="${w*.032}" fill="#202738" stroke="#526078" stroke-width="${3*scale}"/>
 <path d="M${-w*.135} ${-w*.025} l${w*.025} ${w*.027} l${w*.05} ${-w*.065}" fill="none" stroke="#0b0d12" stroke-width="${w*.012}" stroke-linecap="round" stroke-linejoin="round"/>
 <path d="M${w*.066} ${-w*.035} l${w*.068} ${w*.065} m0 ${-w*.065} l${-w*.068} ${w*.065}" fill="none" stroke="#ff6b82" stroke-width="${w*.009}" stroke-linecap="round"/></g>
 <text x="${cx}" y="${titleY}" text-anchor="middle" font-family="DejaVu Sans, sans-serif" font-size="${titleSize}" font-weight="bold" letter-spacing="${-titleSize*.065}" fill="#f7f8fb">ONE <tspan fill="#b8ff39">OFF</tspan></text></svg>`;
 await writeFile(path.join(out,name+'.svg'),svg);
 await sharp(Buffer.from(svg)).png().toFile(path.join(out,name+'.png'));
}
console.log('Three portal covers rendered in the required sizes.');
