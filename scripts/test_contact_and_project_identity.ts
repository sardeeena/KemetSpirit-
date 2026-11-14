import fs from 'node:fs';
import path from 'node:path';

const roots = ['src', 'public', 'server.ts', 'server.js', 'index.html'];
const extensions = new Set(['.ts','.tsx','.js','.jsx','.html','.css','.json','.svg','.txt','.webmanifest']);
const failures: string[] = [];

function collect(entry: string): string[] {
  const absolute = path.resolve(entry);
  if (!fs.existsSync(absolute)) return [];
  const stat = fs.statSync(absolute);
  if (stat.isFile()) return [absolute];
  return fs.readdirSync(absolute,{withFileTypes:true}).flatMap((item) => {
    if (['node_modules','.git','dist'].includes(item.name)) return [];
    const child = path.join(absolute,item.name);
    return item.isDirectory() ? collect(path.relative(process.cwd(),child)) : [child];
  });
}

for (const file of [...new Set(roots.flatMap(collect))]) {
  if (!extensions.has(path.extname(file).toLowerCase())) continue;
  const text = fs.readFileSync(file,'utf8');
  const digits = text.replace(/\D/g,'');
  if (digits.includes('201515212741') || digits.includes('01515212741') || digits.includes('1515212741')) {
    failures.push(`${path.relative(process.cwd(),file)} contains the retired KemetSpirit phone number`);
  }
  if (/cyifhjqqvtiguitrziqs/i.test(text)) {
    failures.push(`${path.relative(process.cwd(),file)} contains the retired Supabase project reference`);
  }
}

const packageJson = JSON.parse(fs.readFileSync(path.resolve('package.json'),'utf8'));
if (fs.existsSync(path.resolve('scripts/migrate_legacy_tour_media.ts'))) {
  failures.push('Prohibited legacy Tour storage migration script must not exist');
}
if (packageJson.scripts?.['migrate:tour-media'] || packageJson.scripts?.['build:with-media-migration']) {
  failures.push('Prohibited legacy Tour storage migration commands must not exist');
}

if (failures.length) {
  console.error(failures.join('\n'));
  process.exitCode = 1;
} else {
  console.log('Contact and Supabase project identity check passed.');
}
