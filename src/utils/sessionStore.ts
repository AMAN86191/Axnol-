/**
 * Values that should survive a screen being closed and reopened, but not an
 * app restart (plain memory). Wiped on logout / session expiry.
 */
const store = new Map<string, unknown>();

export const getSessionValue = <T>(key: string): T | undefined =>
  store.get(key) as T | undefined;

export const setSessionValue = <T>(key: string, value: T): void => {
  store.set(key, value);
};

export const clearSessionValues = (): void => {
  store.clear();
};
