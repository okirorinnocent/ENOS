const fs=require('fs');
let c=fs.readFileSync('app.js','utf8');
// Fix the corrupted esc function
// The file has literal: '"':""","'":"'"  
// Should be: '"':"\"","'":"'"
c=c.replace(/"'":\*"\*"\*,/g, '"\\"":"\\"",')
   .replace(/"'":"'"/g, '"\\'":"\\'",');
fs.writeFileSync('app.js',c);
console.log('Fixed esc function');