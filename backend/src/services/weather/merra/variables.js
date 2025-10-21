import { getText } from './opendap-client.js';

const _varsCache = new Map();

export async function listVarsFromDDS(fileBase) {
  if (_varsCache.has(fileBase)) return _varsCache.get(fileBase);
  const dds = await getText(`${fileBase}.dds`).catch(() => '');

  const vars = new Set();

  for (const m of dds.matchAll(/\b(?:Array|Grid)\b[\s\S]*?\b([A-Za-z_]\w*)\s*;/g)) {
    if (m[1]) vars.add(m[1]);
  }
  for (const m of dds.matchAll(/^[ \t]*[A-Za-z_]\w*[ \t]+([A-Za-z_]\w*)\s*\[[^\]]*\]\s*;/gmi)) {
    vars.add(m[1]);
  }
  for (const m of dds.matchAll(/^[ \t]*[A-Za-z_]\w*[ \t]+([A-Za-z_]\w*)\s*\([^)]+\)\s*;/gmi)) {
    vars.add(m[1]);
  }
  for (const m of dds.matchAll(/^[ \t]*(?:Group[^{]*\{[^\n]*\n)?[ \t]*[A-Za-z_]\w*[ \t]+([A-Za-z_]\w*)\s*\([^)]+\)\s*;/gmi)) {
    vars.add(m[1]);
  }

  _varsCache.set(fileBase, vars);
  return vars;
}
