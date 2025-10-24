import { log } from '../logger.js';
import { getText } from './opendap-client.js';

export function nearestIndex(arr, value) {
  let lo = 0, hi = arr.length - 1;
  while (hi - lo > 1) {
    const mid = (lo + hi) >> 1;
    if (arr[mid] < value) lo = mid; else hi = mid;
  }
  return (Math.abs(arr[lo] - value) <= Math.abs(arr[hi] - value)) ? lo : hi;
}

export async function getDimsFromDDSorDMR(fileBase) {
  let dds = '';
  try { dds = await getText(`${fileBase}.dds`); } catch { }
  const findDimDDS = (names) => {
    for (const n of names) {
      let m = dds.match(new RegExp(`\\b${n}\\s*\\[\\s*[^\\]=]+\\s*=\\s*(\\d+)\\s*\\];`, 'i'));
      if (m) return { name: n, size: Number(m[1]) };
      m = dds.match(new RegExp(`\\b${n}\\s*\\[\\s*(\\d+)\\s*\\];`, 'i'));
      if (m) return { name: n, size: Number(m[1]) };
    }
    return null;
  };
  let lat = findDimDDS(['lat', 'latitude', 'LAT', 'Latitude']);
  let lon = findDimDDS(['lon', 'longitude', 'LON', 'Longitude']);

  if (!lat || !lon) {
    let dmr = '';
    try { dmr = await getText(`${fileBase}.dmr.txt`); } catch { }
    const findDimDMR = (names) => {
      for (const n of names) {
        let m = dmr.match(new RegExp(`<Dim(?:ension)?\\s+name="(${n})"\\s+size="(\\d+)"`, 'i'));
        if (m) return { name: m[1], size: Number(m[2]) };
        m = dmr.match(new RegExp(`<Array\\s+name="(${n})"[\\s\\S]*?<Dim[^>]*size="(\\d+)"`, 'i'));
        if (m) return { name: m[1], size: Number(m[2]) };
      }
      return null;
    };
    lat = lat || findDimDMR(['lat', 'latitude', 'LAT', 'Latitude']);
    lon = lon || findDimDMR(['lon', 'longitude', 'LON', 'Longitude']);
  }

  if (!lat || !lon) {
    log.error('[MERRA] DMR/DDS sin lat/lon');
    throw new Error('No encontré variables lat/lon');
  }
  return { latName: lat.name, lonName: lon.name, latLen: lat.size, lonLen: lon.size };
}

export async function getFirstTwoCoordsAscii(fileBase, latName, lonName) {
  const url = `${fileBase}.ascii?${latName}[0:1:1],${lonName}[0:1:1]`;
  const txt = await getText(url);

  function parseTwo(name) {
    let m = txt.match(new RegExp(`^\\s*${name}\\s*,\\s*([-+0-9.eE]+)\\s*,\\s*([-+0-9.eE]+)\\s*$`, 'mi'));
    if (m) {
      const v0 = Number(m[1]), v1 = Number(m[2]);
      const step = v1 - v0, asc = v1 > v0;
      return { v0, v1, step, asc };
    }
    m = txt.match(new RegExp(`${name}\\s*(?:\\[[^\\]]*\\])?\\s*(?:=)?\\s*\\{\\s*([^}]+?)\\s*\\}`, 'mi'));
    if (m) {
      const vals = m[1].split(',').map(s => Number(s.trim())).filter(v => !Number.isNaN(v));
      const [v0, v1] = vals;
      const step = v1 - v0, asc = v1 > v0;
      return { v0, v1, step, asc };
    }
    throw new Error(`No pude leer ${name} primeros 2 valores`);
  }

  return { lat: parseTwo(latName), lon: parseTwo(lonName) };
}

export const normalizeLon = (L, lon0) => {
  const uses360 = (lon0 >= 0 && lon0 <= 360);
  let x = L;
  if (uses360 && x < 0) x = (x % 360 + 360) % 360;
  if (!uses360 && x > 180) x = x - 360;
  return x;
};

export const toIndex = (target, v0, step, n, asc) =>
  Math.max(0, Math.min(n - 1, asc ? Math.round((target - v0) / step)
    : Math.round((v0 - target) / Math.abs(step))));

export async function getNearestTimeIndex(fileBase) {
  let txt = '';
  try { txt = await getText(`${fileBase}.ascii?time`); } catch { return 0; }
  const mBrace = txt.match(/time\[(\d+)\]\s*\{\s*([^}]+)\s*\}/i);
  if (mBrace) {
    const N = Number(mBrace[1]);
    if (Number.isFinite(N) && N > 0) return Math.min(Math.round(N / 2), N - 1);
  }
  const mCsv = txt.match(/(?:^|\n)\s*time\s*,\s*([^\n]+)$/i);
  if (mCsv) {
    const N = mCsv[1].split(',').length;
    if (N > 0) return Math.min(Math.round(N / 2), N - 1);
  }
  return 0;
}
