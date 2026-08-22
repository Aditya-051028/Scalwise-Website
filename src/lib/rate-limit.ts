const WINDOW_MS = 60 * 60 * 1000; // 1 hour
const MAX_REQUESTS = 5;
const SWEEP_INTERVAL_MS = 60 * 60 * 1000;

type Entry = { count: number; resetAt: number };

const requests = new Map<string, Entry>();
let lastSweepAt = Date.now();

function sweepExpiredEntries(now: number) {
  if (now - lastSweepAt < SWEEP_INTERVAL_MS) return;
  lastSweepAt = now;
  for (const [ip, entry] of requests) {
    if (now > entry.resetAt) requests.delete(ip);
  }
}

export function isRateLimited(ip: string): boolean {
  const now = Date.now();
  sweepExpiredEntries(now);
  const entry = requests.get(ip);

  if (!entry || now > entry.resetAt) {
    requests.set(ip, { count: 1, resetAt: now + WINDOW_MS });
    return false;
  }

  if (entry.count >= MAX_REQUESTS) {
    return true;
  }

  entry.count += 1;
  return false;
}
