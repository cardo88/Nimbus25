import { log } from '../logger.js';

export function parseAsciiArray(body) {
  let payload;
  const m = body.match(/^\s*Data:\s*([\s\S]*)$/mi);
  if (m) {
    payload = m[1];
  } else {
    payload = body;
    const idxBrace = payload.indexOf('{');
    const idxNum = payload.search(/[-+]?\d+(?:\.\d+)?(?:[eE][-+]?\d+)?/);
    let cut = 0;
    if (idxBrace >= 0 && (idxNum < 0 || idxBrace < idxNum)) cut = idxBrace;
    else if (idxNum >= 0) cut = idxNum;
    payload = payload.slice(cut);
  }

  return payload
    .replace(/[{}]/g, ' ')
    .split(/[\s,]+/)
    .filter(Boolean)
    .map(Number)
    .filter(Number.isFinite);
}

export async function readPointASCII(getText, fileBase, varName, ti, yi, xi) {
  const url = `${fileBase}.ascii?${varName}[${ti}:${ti}][${yi}:${yi}][${xi}:${xi}]`;
  const txtFull = await getText(url);
  const txt = txtFull.replace(/^[\s\S]*?\bData:\s*/i, '').trim();
  const num = String.raw`[-+]?(?:\d+(?:\.\d*)?|\.\d+)(?:[eE][-+]?\d+)?`;

  let re = new RegExp(String.raw`(?:^|\n)\s*(?:[\w]+\.)?${varName}\s*(?:\[[^\]]*\]\s*){0,4}=\s*\{\s*(${num})`, 'i');
  let m = txt.match(re);
  if (m) return Number(m[1]);

  re = new RegExp(String.raw`(?:^|\n)\s*(?:[\w]+\.)?${varName}(?:\s*\[[^\]]*\]\s*){0,4}\s*,\s*(${num})\s*$`, 'i');
  m = txt.match(re);
  if (m) return Number(m[1]);

  re = new RegExp(String.raw`(?:^|\n)\s*(?:[\w]+\.)?${varName}\s*=\s*(${num})\s*$`, 'i');
  m = txt.match(re);
  if (m) return Number(m[1]);

  re = new RegExp(String.raw`(?:^|\n)\s*(?:[\w]+\.)?${varName}[^\n]*?(${num})`, 'i');
  m = txt.match(re);
  if (m) return Number(m[1]);

  log.error('[MERRA ASCII head]', txt.split('\n').slice(0, 15).join('\n'));
  throw new Error(`No pude parsear ${varName} de ${url}`);
}
