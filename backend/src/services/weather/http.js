import fetch from 'node-fetch';
import { promisify } from 'node:util';
import { execFile } from 'node:child_process';
import { NETRC_PATH } from './config.js';
import { isGesdiscHost, buildAuthHeader, getCookieHeader, ensureAsciiSession } from './auth.js';
import { log } from './logger.js';
const execFileAsync = promisify(execFile);

const COOKIE_TMP = '/tmp/urs_cookies.tmp';
const UA = 'curl/8.14.1';

export async function headOk(url) {
  const headers = {};
  const auth   = buildAuthHeader(url);
  const cookie = getCookieHeader();
  if (auth)   headers.Authorization = auth;
  if (cookie) headers.Cookie        = cookie;

  let res;
  try {
    res = await fetch(url, { method: 'HEAD', redirect: 'follow', headers });
  } catch {}
  if (!res || !res.ok) {
    res = await fetch(url, { method: 'GET', redirect: 'follow', headers });
  }
  log.debug('[HEAD]', res.status, res.statusText, url);
  return res.ok;
}

export async function getText(url) {
  const encodedURL = encodeURI(url);
  const needAscii  = isGesdiscHost(encodedURL) && /\.ascii(\?|$)/.test(encodedURL);
  if (needAscii) await ensureAsciiSession(encodedURL);

  const headers = {};
  const auth   = buildAuthHeader(encodedURL);
  const cookie = getCookieHeader();
  if (auth)   headers.Authorization = auth;
  if (cookie) headers.Cookie        = cookie;

  log.debug('[OPeNDAP] GET', encodedURL, cookie ? '[cookies]' : '');
  let res  = await fetch(encodedURL, { redirect: 'follow', headers });
  let body = await res.text().catch(() => '');

  const looksLogin = /Earthdata Login|<form[^>]+id=["']eds_login|<title>.*Login/i.test(body);
  if ((!res.ok || looksLogin) && needAscii) {
    log.debug('[OPeNDAP] 401/login → re-auth');
    await ensureAsciiSession(encodedURL);
    const headers2 = {};
    const auth2   = buildAuthHeader(encodedURL);
    const cookie2 = getCookieHeader();
    if (auth2)   headers2.Authorization = auth2;
    if (cookie2) headers2.Cookie        = cookie2;
    res  = await fetch(encodedURL, { redirect: 'follow', headers: headers2 });
    body = await res.text().catch(() => '');
  }

  if (!res.ok || /Earthdata Login|<form[^>]+id=["']eds_login|<title>.*Login/i.test(body)) {
    log.error('[OPeNDAP]', res.status, res.statusText, 'for', encodedURL);
    throw new Error(`${res.status} ${res.statusText}: ${body.slice(0, 300)}`);
  }
  log.debug('[OPeNDAP] OK', res.status);
  return body;
}

export async function curlAscii(url, constraint) {
  const asciiUrl = `${url}.ascii?${constraint}`;
  const args = [
    '-L','--globoff',
    '--cookie', COOKIE_TMP,
    '--cookie-jar', COOKIE_TMP,
    '--netrc-file', NETRC_PATH,
    '--dump-header','/tmp/urs_login_headers.txt',
    '--user-agent', UA,
    '--output','-',
    asciiUrl,
  ];
  try {
    const { stdout } = await execFileAsync('curl', args, { maxBuffer: 10 * 1024 * 1024 });
    return stdout;
  } catch (e) {
    throw new Error(`curlAscii fail ${e?.code ?? ''}: ${e?.message ?? 'error'}`);
  }
}
