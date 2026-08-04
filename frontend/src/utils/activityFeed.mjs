const STORAGE_KEY = "ascend_activity_feed";
const MAX_ITEMS = 25;

function readActivities(storage) {
  if (!storage) return [];

  try {
    const raw = storage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeActivities(storage, activities) {
  if (!storage) return;

  try {
    storage.setItem(STORAGE_KEY, JSON.stringify(activities));
  } catch {
    // ignore storage write failures
  }
}

export function getStoredActivities(storage = typeof window !== "undefined" ? window.localStorage : null) {
  return readActivities(storage).sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
}

export function recordActivity(activity, storage = typeof window !== "undefined" ? window.localStorage : null) {
  const next = [
    {
      id: activity.id || `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      title: activity.title || "Activity recorded",
      description: activity.description || "",
      category: activity.category || "dashboard",
      timestamp: activity.timestamp || new Date().toISOString(),
      dedupKey: activity.dedupKey || null,
    },
    ...getStoredActivities(storage),
  ];

  const unique = [];
  const seen = new Set();

  next.forEach((item) => {
    const key = item.dedupKey || `${item.category}:${item.title}:${item.description}:${item.timestamp}`;
    if (seen.has(key)) return;
    seen.add(key);
    unique.push(item);
  });

  const trimmed = unique.slice(0, MAX_ITEMS);
  writeActivities(storage, trimmed);

  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("ascend-activity-feed-updated"));
  }

  return trimmed;
}

export function clearStoredActivities(storage = typeof window !== "undefined" ? window.localStorage : null) {
  if (!storage) return [];

  try {
    storage.removeItem(STORAGE_KEY);
  } catch {
    // ignore
  }

  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("ascend-activity-feed-updated"));
  }

  return [];
}
