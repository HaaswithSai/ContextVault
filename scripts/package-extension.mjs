import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

const distDir = path.resolve('dist');
const zipFileName = 'context-vault-v1.0.0.zip';
const zipPath = path.resolve(zipFileName);

if (!fs.existsSync(distDir)) {
  console.error('❌ dist/ directory not found. Please run npm run build first.');
  process.exit(1);
}

const manifestPath = path.join(distDir, 'manifest.json');
if (!fs.existsSync(manifestPath)) {
  console.error('❌ manifest.json not found in dist/. Build may have failed.');
  process.exit(1);
}

console.log('📦 Compressing dist folder into zip package...');

try {
  // Remove existing zip if present
  if (fs.existsSync(zipPath)) {
    fs.unlinkSync(zipPath);
  }

  // Windows PowerShell Compress-Archive
  const psCmd = `powershell -Command "Compress-Archive -Path 'dist\\*' -DestinationPath '${zipFileName}' -Force"`;
  execSync(psCmd, { stdio: 'inherit' });

  const stats = fs.statSync(zipPath);
  console.log(`\n🎉 Successfully created: ${zipFileName}`);
  console.log(`📁 File size: ${(stats.size / 1024).toFixed(2)} KB`);
  console.log(`✅ manifest.json is at root of archive.`);
} catch (err) {
  console.error('Failed to create zip package:', err);
  process.exit(1);
}
