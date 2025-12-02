/**
 * Logger utility for MakarovFlow
 * Provides safe logging that respects environment
 */

const isDev = import.meta.env.DEV;
const isProduction = import.meta.env.PROD;

/**
 * Logging levels
 */
const LOG_LEVELS = {
  DEBUG: 0,
  LOG: 1,
  INFO: 2,
  WARN: 3,
  ERROR: 4,
};

/**
 * Current log level (can be configured)
 * In production, only show WARN and ERROR
 * In development, show everything
 */
const currentLogLevel = isProduction ? LOG_LEVELS.WARN : LOG_LEVELS.DEBUG;

/**
 * Safe console logger
 */
export const logger = {
  /**
   * Debug logs (development only)
   */
  debug: (...args) => {
    if (currentLogLevel <= LOG_LEVELS.DEBUG && isDev) {
      console.debug('[DEBUG]', ...args);
    }
  },

  /**
   * General logs (development only)
   */
  log: (...args) => {
    if (currentLogLevel <= LOG_LEVELS.LOG && isDev) {
      console.log('[LOG]', ...args);
    }
  },

  /**
   * Info logs (development only)
   */
  info: (...args) => {
    if (currentLogLevel <= LOG_LEVELS.INFO && isDev) {
      console.info('[INFO]', ...args);
    }
  },

  /**
   * Warning logs (always shown)
   */
  warn: (...args) => {
    if (currentLogLevel <= LOG_LEVELS.WARN) {
      console.warn('[WARN]', ...args);
    }
  },

  /**
   * Error logs (always shown)
   */
  error: (...args) => {
    if (currentLogLevel <= LOG_LEVELS.ERROR) {
      console.error('[ERROR]', ...args);
    }

    // In production, could send to error tracking service
    if (isProduction) {
      // TODO: Send to Sentry or similar service
      // Example: Sentry.captureException(args[0]);
    }
  },

  /**
   * Group logs (development only)
   */
  group: (label) => {
    if (isDev) {
      console.group(label);
    }
  },

  /**
   * Group end (development only)
   */
  groupEnd: () => {
    if (isDev) {
      console.groupEnd();
    }
  },

  /**
   * Table logs (development only)
   */
  table: (data) => {
    if (isDev) {
      console.table(data);
    }
  },

  /**
   * Time tracking (development only)
   */
  time: (label) => {
    if (isDev) {
      console.time(label);
    }
  },

  /**
   * Time end (development only)
   */
  timeEnd: (label) => {
    if (isDev) {
      console.timeEnd(label);
    }
  },
};

/**
 * Assert function for development
 */
export const assert = (condition, message) => {
  if (isDev && !condition) {
    console.assert(condition, message);
    throw new Error(`Assertion failed: ${message}`);
  }
};

export default logger;
