// Move files from backend/uploads to frontend/public/uploads, preserving structure
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const legacyRoot = path.join(__dirname, '../../uploads');
const newRoot = path.join(__dirname, '../../../frontend/public/uploads');

function copyRecursive(srcDir, destDir) {
  if (!fs.existsSync(srcDir)) return;
  if (!fs.existsSync(destDir)) fs.mkdirSync(destDir, { recursive: true });
  for (const entry of fs.readdirSync(srcDir)) {
    const src = path.join(srcDir, entry);
    const dst = path.join(destDir, entry);
    const stat = fs.statSync(src);
    if (stat.isDirectory()) {
      copyRecursive(src, dst);
    } else if (stat.isFile()) {
      // Only copy if destination missing to avoid overwriting
      if (!fs.existsSync(dst)) {
        fs.copyFileSync(src, dst);
        console.log(`Copied: ${path.relative(legacyRoot, src)} -> ${path.relative(newRoot, dst)}`);
      }
    }
  }
}

copyRecursive(legacyRoot, newRoot);
console.log('Migration complete.');
