import fs from 'fs';
import path from 'path';

function scanDir(dir: string, fileList: string[] = []): string[] {
  const files = fs.readdirSync(dir);
  for (const f of files) {
    const full = path.join(dir, f);
    if (fs.statSync(full).isDirectory()) {
      scanDir(full, fileList);
    } else if (f.endsWith('.tsx')) {
      fileList.push(full);
    }
  }
  return fileList;
}

const tsxFiles = scanDir(path.join(process.cwd(), 'src/components'));
tsxFiles.push(path.join(process.cwd(), 'src/App.tsx'));

const results: Array<{ file: string; line: number; text: string }> = [];

for (const file of tsxFiles) {
  const content = fs.readFileSync(file, 'utf-8');
  const lines = content.split('\n');
  
  lines.forEach((line, idx) => {
    // Check for raw text inside JSX tags: >Some English Text<
    const jsxTextMatches = line.match(/>([^<>{}]*[a-zA-Z]{3,}[^<>{}]*)</g);
    if (jsxTextMatches) {
      for (const m of jsxTextMatches) {
        const text = m.slice(1, -1).trim();
        // Ignore imports, CSS classes, URLs, numbers, technical symbols, etc.
        if (text && !text.startsWith('http') && !text.includes('className') && !text.includes('svg') && !text.includes('px')) {
          results.push({ file: path.relative(process.cwd(), file), line: idx + 1, text });
        }
      }
    }

    // Check for hardcoded English placeholder, title, or aria-label
    const attrMatches = line.match(/\b(placeholder|title|aria-label)=["']([^"'{}]*[a-zA-Z]{3,}[^"'{}]*)["']/g);
    if (attrMatches) {
      for (const m of attrMatches) {
        results.push({ file: path.relative(process.cwd(), file), line: idx + 1, text: m });
      }
    }
  });
}

console.log(`Found ${results.length} potential hard-coded strings across components:`);
const byFile: Record<string, typeof results> = {};
for (const r of results) {
  if (!byFile[r.file]) byFile[r.file] = [];
  byFile[r.file].push(r);
}

for (const [f, items] of Object.entries(byFile)) {
  console.log(`\n--- ${f} (${items.length} items) ---`);
  items.slice(0, 15).forEach(i => console.log(`  L${i.line}: ${i.text}`));
  if (items.length > 15) {
    console.log(`  ... and ${items.length - 15} more`);
  }
}
