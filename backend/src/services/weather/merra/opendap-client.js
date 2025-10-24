import { getText as _getText, curlAscii as _curlAscii } from '../http.js';
import { log } from '../logger.js';

export async function getText(url) {
  log.debug?.(`[OPeNDAP] GET ${url} [cookies]`);
  try {
    const res = await _getText(url);
    if (res && typeof res === 'string') return res;
    return String(res ?? '');
  } catch (e) {
    if (e?.status === 404) log.debug?.(`[OPeNDAP] 404 404 for ${url}`);
    throw e;
  }
}

export async function curlAscii(baseUrl, projection) {
  const url = `${baseUrl}.ascii?${projection}`;
  log.debug?.(`[OPeNDAP] GET ${url} [cookies]`);
  const txt = await _curlAscii(baseUrl, projection);
  return txt;
}