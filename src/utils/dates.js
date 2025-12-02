/**
 * Date utilities for MakarovFlow
 * Provides timezone-safe date operations
 */

/**
 * Get local date in YYYY-MM-DD format (timezone-safe)
 * @returns {string} Date string in YYYY-MM-DD format
 */
export const getLocalDate = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

/**
 * Get local date for a specific Date object
 * @param {Date} date - Date object to convert
 * @returns {string} Date string in YYYY-MM-DD format
 */
export const formatLocalDate = (date) => {
  if (!(date instanceof Date)) {
    date = new Date(date);
  }
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

/**
 * Get date N days ago from today
 * @param {number} daysAgo - Number of days to subtract
 * @returns {string} Date string in YYYY-MM-DD format
 */
export const getDateDaysAgo = (daysAgo) => {
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  return formatLocalDate(date);
};

/**
 * Check if two date strings represent the same day
 * @param {string} date1 - First date string (YYYY-MM-DD)
 * @param {string} date2 - Second date string (YYYY-MM-DD)
 * @returns {boolean} True if dates are the same
 */
export const isSameDay = (date1, date2) => {
  return date1 === date2;
};

/**
 * Get difference in days between two dates
 * @param {string} date1 - First date string (YYYY-MM-DD)
 * @param {string} date2 - Second date string (YYYY-MM-DD)
 * @returns {number} Number of days difference
 */
export const getDaysDifference = (date1, date2) => {
  const d1 = new Date(date1);
  const d2 = new Date(date2);
  const diffTime = Math.abs(d2 - d1);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
};

/**
 * Check if date is today
 * @param {string} dateString - Date string to check (YYYY-MM-DD)
 * @returns {boolean} True if date is today
 */
export const isToday = (dateString) => {
  return dateString === getLocalDate();
};

/**
 * Check if date is in the past
 * @param {string} dateString - Date string to check (YYYY-MM-DD)
 * @returns {boolean} True if date is in the past
 */
export const isPast = (dateString) => {
  return dateString < getLocalDate();
};

/**
 * Check if date is in the future
 * @param {string} dateString - Date string to check (YYYY-MM-DD)
 * @returns {boolean} True if date is in the future
 */
export const isFuture = (dateString) => {
  return dateString > getLocalDate();
};
