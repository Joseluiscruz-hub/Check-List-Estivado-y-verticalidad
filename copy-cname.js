const fs = require('fs');
const path = require('path');

// Copiar CNAME a dist
const source = path.join(__dirname, 'CNAME');
const dest = path.join(__dirname, 'dist', 'CNAME');

if (fs.existsSync(source)) {
  fs.copyFileSync(source, dest);
  console.log('CNAME copied to dist/');
}
