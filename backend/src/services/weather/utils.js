export const pad = (n, w = 2) => String(n).padStart(w, '0');
export const ym  = (s) => `${s.slice(0, 4)}/${s.slice(5, 7)}`;
export const ymd = (s) => s.replace(/-/g, '');

export function dayOfYear(dateISO) {
  const d = new Date(dateISO + 'T00:00:00Z');
  const start = Date.UTC(d.getUTCFullYear(), 0, 1);
  return Math.floor((d - start) / 86400000) + 1;
}

export function buildClimoDates(targetISO, windowDays, yearsBack) {
  const doy    = dayOfYear(targetISO);
  const target = new Date(targetISO + 'T00:00:00Z');
  const list = [];
  for (let y = 1; y <= yearsBack; y++) {
    const yPast = target.getUTCFullYear() - y;
    for (let d = -windowDays; d <= windowDays; d++) {
      const dt = new Date(Date.UTC(yPast, 0, 1));
      dt.setUTCDate(doy + d);
      const yyyy = dt.getUTCFullYear();
      const mm   = pad(dt.getUTCMonth() + 1);
      const dd   = pad(dt.getUTCDate());
      list.push(`${yyyy}-${mm}-${dd}`);
    }
  }
  return list;
}

export const clamp01 = (x) => Math.max(0, Math.min(1, x));
export const k2c = (k) => k - 273.15;
export function quantile(sortedAsc, q) {
  if (!sortedAsc.length) return null;
  const pos  = (sortedAsc.length - 1) * q;
  const b    = Math.floor(pos);
  const f    = pos - b;
  return sortedAsc[b + 1] !== undefined ? sortedAsc[b] + f * (sortedAsc[b + 1] - sortedAsc[b]) : sortedAsc[b];
}
