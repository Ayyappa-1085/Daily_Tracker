const STORAGE_KEY = "ascend_daily_quote";

export const DAILY_QUOTES = [
  "Discipline creates the life motivation only dreams about.",
  "Small progress every day becomes extraordinary results.",
  "Success belongs to those who keep showing up.",
  "Consistency beats intensity.",
  "Hard work compounds.",
  "Focus turns effort into momentum.",
  "Growth begins where comfort ends.",
  "Persistence turns ordinary days into remarkable outcomes.",
  "Daily effort builds lasting strength.",
  "The strongest habit is showing up again.",
  "Progress is built one deliberate day at a time.",
  "Steady work outlasts sudden bursts.",
  "Great results come from quiet consistency.",
  "Stay focused and the path becomes clear.",
  "Discipline is the bridge to mastery.",
  "Keep going and the results will follow.",
  "Every small win compounds into confidence.",
  "Success is repeated effort in motion.",
  "Learning daily sharpens the mind and spirit.",
  "Mastery is earned through patient repetition.",
];

function readStoredQuote(storage) {
  if (!storage) return null;

  try {
    const raw = storage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function writeStoredQuote(storage, value) {
  if (!storage) return;

  try {
    storage.setItem(STORAGE_KEY, JSON.stringify(value));
  } catch {
    // ignore storage write failures
  }
}

export function getQuoteDateKey(now = new Date()) {
  const localNow = new Date(now);
  const resetHour = 4;

  if (localNow.getHours() < resetHour) {
    localNow.setDate(localNow.getDate() - 1);
  }

  localNow.setHours(0, 0, 0, 0);

  const year = localNow.getFullYear();
  const month = String(localNow.getMonth() + 1).padStart(2, "0");
  const day = String(localNow.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

export function getNextQuoteResetTime(now = new Date()) {
  const nextReset = new Date(now);
  nextReset.setHours(4, 0, 0, 0);

  if (nextReset <= now) {
    nextReset.setDate(nextReset.getDate() + 1);
  }

  return nextReset;
}

function getSeededIndex(dateKey, previousIndex, quotes) {
  const seed = [...dateKey].reduce((sum, char) => sum + char.charCodeAt(0), 0);
  const availableQuotes = previousIndex == null
    ? quotes
    : quotes.filter((_, index) => index !== previousIndex);

  const safeIndex = Math.abs(seed) % availableQuotes.length;
  return quotes.indexOf(availableQuotes[safeIndex]);
}

export function resolveDailyQuote({
  now = new Date(),
  fallbackQuote = "",
  storage = typeof window !== "undefined" ? window.localStorage : null,
  quotes = DAILY_QUOTES,
} = {}) {
  if (!quotes.length) {
    return { quote: fallbackQuote, quoteIndex: -1, dateKey: getQuoteDateKey(now) };
  }

  const dateKey = getQuoteDateKey(now);
  const savedQuote = readStoredQuote(storage);

  if (savedQuote?.dateKey === dateKey && savedQuote?.quote) {
    return {
      quote: savedQuote.quote,
      quoteIndex: savedQuote.quoteIndex ?? -1,
      dateKey,
    };
  }

  const quoteIndex = getSeededIndex(dateKey, savedQuote?.quoteIndex, quotes);
  const quote = quotes[quoteIndex] || quotes[0];

  writeStoredQuote(storage, { dateKey, quote, quoteIndex });

  return { quote, quoteIndex, dateKey };
}
