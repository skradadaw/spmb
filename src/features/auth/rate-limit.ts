interface AttemptRecord {
  count: number;
  lockedUntil: number | null;
}

const attempts = new Map<string, AttemptRecord>();

export function getAttemptRecord(key: string): AttemptRecord {
  return attempts.get(key) ?? { count: 0, lockedUntil: null };
}

export function setAttemptRecord(key: string, record: AttemptRecord): void {
  attempts.set(key, record);
}

export function clearAttemptRecord(key: string): void {
  attempts.delete(key);
}

// This module is not a Server Action. It is imported directly by unit tests only.
export function resetRateLimitForTesting(): void {
  attempts.clear();
}
