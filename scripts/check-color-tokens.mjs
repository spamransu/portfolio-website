import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import process from 'node:process';

const allowedFiles = new Set(['src/styles/tokens.scss']);
const colorLiteralPattern = /#[0-9a-fA-F]{3,8}\b|\b(?:rgba?|hsla?)\([^)]*\)|\b(?:black|white|transparent)\b|\b(?:color-mix|linear-gradient)\(/g;
const colorVarPattern = /var\(--color-[^)]+\)/g;
const colorCustomPropertyNamePattern = /--color-[\w-]+/g;
const sassTokenPattern = /#\{tokens\.color\([^)]+\)\}/g;
const propertyAllowList = /\bwhite-space\s*:/;

function collectScssFiles(dir) {
  const entries = readdirSync(dir);
  const files = [];

  for (const entry of entries) {
    const path = join(dir, entry);
    const stats = statSync(path);

    if (stats.isDirectory()) {
      files.push(...collectScssFiles(path));
    } else if (entry.endsWith('.scss')) {
      files.push(path);
    }
  }

  return files;
}

const violations = [];

for (const file of collectScssFiles('src')) {
  const normalized = relative(process.cwd(), file).replaceAll('\\\\', '/');

  if (allowedFiles.has(normalized)) {
    continue;
  }

  const lines = readFileSync(file, 'utf8').split('\n');

  lines.forEach((line, index) => {
    if (propertyAllowList.test(line)) {
      return;
    }

    const sanitized = line.replace(colorVarPattern, '').replace(colorCustomPropertyNamePattern, '').replace(sassTokenPattern, '');
    const matches = [...sanitized.matchAll(colorLiteralPattern)].map((match) => match[0]);

    if (matches.length > 0) {
      violations.push(`${normalized}:${index + 1}: ${matches.join(', ')} -> ${line.trim()}`);
    }
  });
}

if (violations.length > 0) {
  console.error('Raw color literals must be defined in src/styles/tokens.scss and consumed through color tokens.');
  console.error(violations.join('\n'));
  process.exit(1);
}
