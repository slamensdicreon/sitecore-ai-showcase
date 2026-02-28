const fs = require('fs');
const path = require('path');

const filesToPatch = [
  'node_modules/@sitecore-content-sdk/nextjs/dist/cjs/editing/utils.js',
  'node_modules/@sitecore-content-sdk/nextjs/dist/esm/editing/utils.js',
];

const oldPattern = "return `${useHttps ? 'https' : 'http'}://${host}`;";
const newCode = "if (!host) return 'http://localhost:3000';\n    return `${useHttps ? 'https' : 'http'}://${host}`;";

let patched = 0;
for (const file of filesToPatch) {
  const filePath = path.resolve(__dirname, '..', file);
  if (!fs.existsSync(filePath)) {
    console.log(`Skipping ${file} (not found)`);
    continue;
  }
  let content = fs.readFileSync(filePath, 'utf8');
  if (content.includes("if (!host) return 'http://localhost:3000';")) {
    console.log(`Already patched: ${file}`);
    patched++;
    continue;
  }
  if (!content.includes(oldPattern)) {
    console.log(`Pattern not found in ${file}, skipping`);
    continue;
  }
  content = content.replace(oldPattern, newCode);
  fs.writeFileSync(filePath, content, 'utf8');
  console.log(`Patched: ${file}`);
  patched++;
}

if (patched > 0) {
  console.log(`Successfully patched ${patched} file(s) - resolveServerUrl now falls back to localhost:3000 when host header is missing`);
} else {
  console.log('Warning: No files were patched');
}
