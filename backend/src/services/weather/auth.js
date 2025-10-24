import fs from 'node:fs';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { COOKIE_PATH, NETRC_PATH } from './config.js';
import { log } from './logger.js';
const execFileAsync = promisify(execFile);

const COOKIE_TMP = '/tmp/urs_cookies.tmp';
const UA = 'curl/8.14.1';

export function isGesdiscHost(url) {
  try { return /gesdisc\.eosdis\.nasa\.gov$/i.test(new URL(url).hostname); }
  catch { return false; }
}

export function readNetrcCreds(path = NETRC_PATH) {
  try {
    const t = fs.readFileSync(path, 'utf8');
    const m = /machine\s+urs\.earthdata\.nasa\.gov\s+login\s+([^\s]+)\s+password\s+([^\s]+)/i.exec(t);
    return m ? { user: m[1], pass: m[2] } : null;
  } catch { return null; }
}

export function buildAuthHeader(url) {
  if (!isGesdiscHost(url)) return null;
  let { EARTHDATA_USER: user, EARTHDATA_PASS: pass } = process.env;
  if (!user || !pass) {
    const creds = readNetrcCreds();
    if (creds) ({ user, pass } = creds);
  }
  return (user && pass) ? 'Basic ' + Buffer.from(`${user}:${pass}`).toString('base64') : null;
}

export function buildCookieHeaderFromJar(file = COOKIE_PATH) {
  try {
    const txt = fs.readFileSync(file, 'utf8');
    const pairs = txt.split(/\r?\n/)
      .filter(l => l && !l.startsWith('#'))
      .map(l => l.split(/\t/))
      .filter(p => p.length >= 7)
      .map(p => `${p[5]}=${p[6]}`);
    return pairs.length ? pairs.join('; ') : null;
  } catch { return null; }
}

export const getCookieHeader = () => buildCookieHeaderFromJar();

export async function ensureAsciiSession(urlAsciiRaw) {
  try { fs.unlinkSync(COOKIE_TMP); } catch {}
  const cmd = [
    'curl','-L','--globoff',
    '--cookie', COOKIE_TMP, '--cookie-jar', COOKIE_TMP,
    '--netrc-file', NETRC_PATH,
    '--dump-header','/tmp/urs_login_headers.txt',
    '--user-agent', UA,
    '--output','/dev/null',
    urlAsciiRaw,
  ];
  try {
    log.debug('[AUTH] pre-auth curl:', cmd.join(' '));
    await execFileAsync(cmd[0], cmd.slice(1), { timeout: 45000 });
  } catch (e) {
    log.debug('[AUTH] pre-auth non-zero:', e?.message || e);
  }
  let size = 0;
  try { size = fs.statSync(COOKIE_TMP).size; } catch {}
  if (size > 0) {
    fs.copyFileSync(COOKIE_TMP, COOKIE_PATH);
    try { fs.chmodSync(COOKIE_PATH, 0o600); } catch {}
    log.info('[AUTH] Sesión URS/GES DISC (ascii) ok');
  } else {
    throw new Error('Cookie jar vacío tras pre-auth');
  }
}
