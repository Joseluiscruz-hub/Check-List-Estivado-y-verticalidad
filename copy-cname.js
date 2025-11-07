import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Copiar CNAME a dist
const source = path.join(__dirname, 'CNAME');
const dest = path.join(__dirname, 'dist', 'CNAME');

if (fs.existsSync(source)) {
  fs.copyFileSync(source, dest);
  console.log('CNAME copied to dist/');
}
