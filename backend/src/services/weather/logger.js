import { LOG_LEVEL } from './config.js';

const LEVELS = { silent: 0, error: 1, warn: 2, info: 3, debug: 4 };
const CUR = LEVELS[LOG_LEVEL] ?? LEVELS.info;

export const log = {
  error: (...a) => CUR >= LEVELS.error && console.error(...a),
  warn:  (...a) => CUR >= LEVELS.warn  && console.warn(...a),
  info:  (...a) => CUR >= LEVELS.info  && console.log(...a),
  debug: (...a) => CUR >= LEVELS.debug && console.log(...a),
};
