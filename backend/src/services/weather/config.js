import 'dotenv/config';

export const PROBABILITY_WINDOW_DAYS  = Number(process.env.PROBABILITY_WINDOW_DAYS ?? 5);
export const PROBABILITY_YEARS_BACK   = Number(process.env.PROBABILITY_YEARS_BACK ?? 3);
export const PROBABILITY_THRESHOLD_MM = Number(process.env.PROBABILITY_THRESHOLD_MM ?? 25);

export const COOKIE_PATH = process.env.URS_COOKIE_PATH;
export const NETRC_PATH  = process.env.URS_NETRC_PATH;

export const GPM_OPENDAP_BASE   = process.env.GPM_OPENDAP_BASE;
export const MERRA_OPENDAP_BASE = process.env.MERRA_OPENDAP_BASE;

export const MERRA_HOST = 'https://goldsmr4.gesdisc.eosdis.nasa.gov/opendap';
export const MERRA_PROD = 'MERRA2/M2T1NXSLV.5.12.4';

export const LOG_LEVEL = (process.env.LOG_LEVEL || 'info').toLowerCase();