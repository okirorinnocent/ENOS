const fs=require('fs');
let c=fs.readFileSync('app.js','utf8');
// Replace literal HTML entity TEXT with actual characters using unicode escapes
c=c.replace(/\u0026amp;/g,'&')
   .replace(/\u0026lt;/g,'<')
   .replace(/\u0026gt;/g,'>')
   .replace(/\u0026quot;/g,'"')
   .replace(/\u0026#39;/g,"'");
fs.writeFileSync('app.js',c);
console.log('Fixed');