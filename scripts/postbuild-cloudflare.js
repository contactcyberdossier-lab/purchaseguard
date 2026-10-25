const fs = require('fs');
const path = require('path');

const targetDir = path.join(process.cwd(), '.vercel', 'output', 'static');
try {
  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
  }
  fs.writeFileSync(path.join(targetDir, '.assetsignore'), '_worker.js\n_routes.json\n');
  console.log('✓ Successfully created .vercel/output/static/.assetsignore');
} catch (err) {
  console.error('Failed to create .assetsignore:', err);
}
