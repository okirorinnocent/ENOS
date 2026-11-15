const fs=require('fs');
let c=fs.readFileSync('app.js','utf8');
const lines=c.split('\n');
lines[3]='const esc=s=>String(s??\"\").replace(/[&<>\"\\\']/g,c=>({"&":"&","<":"<",">":">","\\"":"\\"","\\'":"\\'"}[c]));';
fs.writeFileSync('app.js',lines.join('\n'));
console.log('Fixed line 4');