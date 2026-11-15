const fs=require('fs');
let c=fs.readFileSync('app.js','utf8');
// Replace literal HTML entity TEXT with actual characters
c=c.replace(/&/g,'&')
   .replace(/</g,'<')
   .replace(/>/g,'>')
   .replace(/"/g,'"')
   .replace(/'/g,"'");
fs.writeFileSync('app.js',c);
console.log('Fixed');