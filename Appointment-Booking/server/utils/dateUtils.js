// utils/dateUtils.js
const moment = require('moment-timezone');

/**
 * Validate that a given timezone string is recognized by moment-timezone.
 * @param {string} tz - Timezone identifier (e.g. 'America/New_York')
 * @returns {boolean}
 */
function validateTimeZone(tz) {
  return !!moment.tz.zone(tz);
}

/**
 * Parse a date-only string in a specific timezone into a UTC Date at midnight.
 * @param {string} dateStr - Date string in 'YYYY-MM-DD' format
 * @param {string} tz - Timezone identifier
 * @returns {Date}
 */
function parseDateOnly(dateStr, tz) {
  if (!validateTimeZone(tz)) throw new Error(`Invalid timezone: ${tz}`);
  return moment.tz(dateStr, 'YYYY-MM-DD', tz).startOf('day').utc().toDate();
}

/**
 * Parse a full datetime string in a specific timezone into a UTC Date.
 * @param {string} dateTimeStr - Datetime string (ISO or custom) in specified timezone
 * @param {string} tz - Timezone identifier
 * @returns {Date}
 */
function parseDateTime(dateTimeStr, tz) {
  if (!validateTimeZone(tz)) throw new Error(`Invalid timezone: ${tz}`);
  return moment.tz(dateTimeStr, tz).toDate();
}

/**
 * Format a UTC Date into a string in the target timezone.
 * @param {Date|string|number} date - Date object or parsable date string/number
 * @param {string} tz - Timezone identifier
 * @param {string} [formatStr] - Moment.js format string (default ISO 8601)
 * @returns {string}
 */
function formatDateTime(date, tz, formatStr = 'YYYY-MM-DDTHH:mm:ssZ') {
  if (!validateTimeZone(tz)) throw new Error(`Invalid timezone: ${tz}`);
  return moment(date).tz(tz).format(formatStr);
}

/**
 * Format a UTC Date into a date-only string (YYYY-MM-DD) in the target timezone.
 * @param {Date|string|number} date - Date object or parsable date string/number
 * @param {string} [tz] - Timezone identifier (default UTC)
 * @returns {string}
 */
function formatDateOnly(date, tz = 'UTC') {
  if (!validateTimeZone(tz)) throw new Error(`Invalid timezone: ${tz}`);
  return moment(date).tz(tz).format('YYYY-MM-DD');
}

/**
 * Convert any Date into a formatted string in a specific timezone.
 * Alias for formatDateTime.
 */
const toTimeZone = formatDateTime;

/**
 * Check whether a new time slot conflicts with any existing slots.
 * Expects all times as Date objects or ISO strings.
 * @param {Array<{ startTime: Date|string, endTime: Date|string }>} existingSlots
 * @param {Date|string} newStart
 * @param {Date|string} newEnd
 * @returns {boolean}
 */
function hasTimeConflict(existingSlots, newStart, newEnd) {
  const start = moment(newStart);
  const end = moment(newEnd);
  return existingSlots.some(slot => {
    const s = moment(slot.startTime);
    const e = moment(slot.endTime);
    return start.isBefore(e) && end.isAfter(s);
  });
}

module.exports = {
  validateTimeZone,
  parseDateOnly,
  parseDateTime,
  formatDateTime,
  formatDateOnly,
  toTimeZone,
  hasTimeConflict,
};
