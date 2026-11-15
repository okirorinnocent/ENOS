const fs=require('fs');
let c=fs.readFileSync('app.js','utf8');
// The file contains literal HTML entity TEXT like & < etc, need actual chars
c=c.replace(/&/g,'&')
   .replace(/</g,'<')
   .replace(/>/g,'>')
   .replace(/"/g,'"')
   .replace(/'/g,"'");
fs.writeFileSync('app.js',c);
console.log('Fixed');