// Small helper so every controller derives "today" and "yesterday" the same way.
// Dates are stored as local calendar-day strings (YYYY-MM-DD), not full timestamps,
// since missions/timeline/journal are day-scoped by design.

function toDateKey(d = new Date()) {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function todayKey() {
  return toDateKey(new Date());
}

function yesterdayKey() {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return toDateKey(d);
}

function dateKeyDaysAgo(n) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return toDateKey(d);
}

module.exports = { toDateKey, todayKey, yesterdayKey, dateKeyDaysAgo };
