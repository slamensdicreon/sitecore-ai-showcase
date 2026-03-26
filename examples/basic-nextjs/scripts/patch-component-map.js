const fs = require('fs');
const path = require('path');

const files = [
  path.join(__dirname, '..', '.sitecore', 'component-map.ts'),
  path.join(__dirname, '..', '.sitecore', 'component-map.client.ts'),
];

const SKIP_KEYS = new Set([
  'BYOCWrapper',
  'FEaaSWrapper',
  'FEaaS Wrapper',
  'Form',
  'Container',
]);

const EXTRA_ALIASES = {
  'PartialDesignDynamicPlaceholder': ['PartialDesign Dynamic Placeholder'],
};

function pascalToSpaced(name) {
  return name.replace(/([a-z0-9])([A-Z])/g, '$1 $2');
}

for (const file of files) {
  if (!fs.existsSync(file)) continue;

  let content = fs.readFileSync(file, 'utf8');

  const existingKeys = new Set();
  const keyRegex = /\['([^']+)'/g;
  let m;
  while ((m = keyRegex.exec(content)) !== null) {
    existingKeys.add(m[1]);
  }

  const insertions = [];
  const lineRegex = /^(\s*\[')([A-Z][a-zA-Z0-9]+)(',\s*.+\],?)$/gm;
  while ((m = lineRegex.exec(content)) !== null) {
    const name = m[2];
    if (SKIP_KEYS.has(name)) continue;
    const spaced = pascalToSpaced(name);
    if (spaced !== name && !existingKeys.has(spaced)) {
      insertions.push({ afterLine: m[0], newLine: m[0].replace(`'${name}'`, `'${spaced}'`) });
      existingKeys.add(spaced);
    }
    if (EXTRA_ALIASES[name]) {
      for (const alias of EXTRA_ALIASES[name]) {
        if (!existingKeys.has(alias)) {
          insertions.push({ afterLine: m[0], newLine: m[0].replace(`'${name}'`, `'${alias}'`) });
          existingKeys.add(alias);
        }
      }
    }
  }

  for (const ins of insertions) {
    content = content.replace(ins.afterLine, ins.afterLine + '\n' + ins.newLine);
  }

  if (insertions.length > 0) {
    fs.writeFileSync(file, content, 'utf8');
    console.log(`Patched ${path.basename(file)}: added ${insertions.length} spaced alias(es)`);
  } else {
    console.log(`${path.basename(file)}: no patches needed`);
  }
}
