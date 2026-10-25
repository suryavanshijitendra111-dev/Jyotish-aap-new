import fs from 'fs';
import path from 'path';
import { t, LOCALES, LanguageCode } from '../src/i18n/index';

function scanDir(dir: string, fileList: string[] = []): string[] {
  const files = fs.readdirSync(dir);
  for (const f of files) {
    const full = path.join(dir, f);
    if (fs.statSync(full).isDirectory()) {
      scanDir(full, fileList);
    } else if (f.endsWith('.tsx') || f.endsWith('.ts')) {
      fileList.push(full);
    }
  }
  return fileList;
}

const allFiles = scanDir(path.join(process.cwd(), 'src'));

// Find all t('key') or t("key") calls
const keyRegex = /\bt\(\s*['"]([a-zA-Z0-9_.]+)['"]/g;
const usedKeys = new Set<string>();
const keyUsageLocations: Record<string, string[]> = {};

for (const file of allFiles) {
  if (file.includes('src/i18n/locales')) continue;
  const content = fs.readFileSync(file, 'utf-8');
  let match;
  while ((match = keyRegex.exec(content)) !== null) {
    const key = match[1];
    usedKeys.add(key);
    if (!keyUsageLocations[key]) keyUsageLocations[key] = [];
    keyUsageLocations[key].push(path.relative(process.cwd(), file));
  }
}

console.log(`Auditing ${usedKeys.size} distinct i18n keys across all 13 supported languages...`);

const allLangs = Object.keys(LOCALES) as LanguageCode[];
let totalErrors = 0;

for (const lang of allLangs) {
  const unresolved: string[] = [];
  for (const k of usedKeys) {
    const val = t(k, undefined, lang);
    if (!val || val === k) {
      unresolved.push(k);
    }
  }
  if (unresolved.length > 0) {
    console.log(`Lang [${lang}]: ${unresolved.length} unresolved keys:`, unresolved);
    totalErrors += unresolved.length;
  } else {
    console.log(`Lang [${lang}]: 100% of used keys resolved successfully!`);
  }
}

console.log(`Audit complete. Total unresolved keys across all languages: ${totalErrors}`);

