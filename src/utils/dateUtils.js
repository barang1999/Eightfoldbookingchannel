// dateUtils.js

export function normalizeDate(date) {
  const d = new Date(date);
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

export function calculateNights(startDate, endDate) {
  const start = normalizeDate(startDate);
  const end = normalizeDate(endDate);
  return Math.max(Math.floor((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)), 1);
}

export function toDateRangePayload(startDate, endDate) {
  return {
    startDate: normalizeDate(startDate),
    endDate: normalizeDate(endDate),
  };
}
export function parseLocalDateString(dateStr) {
  const [year, month, day] = dateStr.split('-').map(Number);
  return new Date(year, month - 1, day);
}