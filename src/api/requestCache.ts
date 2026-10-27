import AsyncStorage from '@react-native-async-storage/async-storage';
import {clearSessionValues} from '../utils/sessionStore';

const TOKEN_STORAGE_KEY = 'axnol_token';
const CACHE_KEY_SEPARATOR = '\u0000';
// Responses are kept for the whole app session: the memory cache dies when the
// app is closed, so a fresh launch fetches again. Entries are dropped earlier
// only by invalidateRequests (pull-to-refresh, cart/order changes, login/logout).
const SESSION_TTL = Infinity;

interface CacheEntry<T> {
  data: T;
  expiresAt: number;
  resource: string;
}

export interface CachedRequestOptions<T> {
  resource: string;
  params?: unknown;
  /** Milliseconds to keep the response; defaults to the whole app session. */
  ttl?: number;
  force?: boolean;
  request: () => Promise<T>;
}

const cache = new Map<string, CacheEntry<unknown>>();
const inFlight = new Map<string, Promise<unknown>>();
let cacheGeneration = 0;

const stableSerialize = (value: unknown): string => {
  if (value === undefined) {
    return '';
  }
  if (value === null || typeof value !== 'object') {
    return JSON.stringify(value);
  }
  if (Array.isArray(value)) {
    return `[${value.map(stableSerialize).join(',')}]`;
  }

  const record = value as Record<string, unknown>;
  return `{${Object.keys(record)
    .sort()
    .filter(key => record[key] !== undefined)
    .map(key => `${JSON.stringify(key)}:${stableSerialize(record[key])}`)
    .join(',')}}`;
};

const getTokenScope = async (): Promise<string> => {
  try {
    return (await AsyncStorage.getItem(TOKEN_STORAGE_KEY)) ?? 'anonymous';
  } catch {
    return 'anonymous';
  }
};

const buildCacheKey = async (
  resource: string,
  params?: unknown,
): Promise<string> => {
  const tokenScope = await getTokenScope();
  const serializedParams = stableSerialize(params);
  const key = serializedParams
    ? `${resource}?${serializedParams}`
    : resource;
  return `${tokenScope}${CACHE_KEY_SEPARATOR}${key}`;
};

const isMatchingResource = (entryResource: string, resource: string) =>
  entryResource === resource ||
  entryResource.startsWith(
    resource.endsWith('/') ? resource : `${resource}/`,
  );

export const cachedRequest = async <T>({
  resource,
  params,
  ttl = SESSION_TTL,
  force = false,
  request,
}: CachedRequestOptions<T>): Promise<T> => {
  const key = await buildCacheKey(resource, params);
  const generation = cacheGeneration;

  if (!force) {
    const cached = cache.get(key) as CacheEntry<T> | undefined;
    if (cached) {
      if (cached.expiresAt > Date.now()) {
        return cached.data;
      }
      cache.delete(key);
    }
  }

  const pending = inFlight.get(key) as Promise<T> | undefined;
  if (pending) {
    return pending;
  }

  const promise = request()
    .then(data => {
      if (cacheGeneration === generation) {
        cache.set(key, {
          data,
          expiresAt: Date.now() + ttl,
          resource,
        });
      }
      return data;
    })
    .finally(() => {
      if (inFlight.get(key) === promise) {
        inFlight.delete(key);
      }
    });

  inFlight.set(key, promise);
  return promise;
};

export const invalidateRequests = (resource?: string): void => {
  cacheGeneration += 1;

  if (!resource) {
    cache.clear();
    clearSessionValues();
    return;
  }

  cache.forEach((entry, key) => {
    if (isMatchingResource(entry.resource, resource)) {
      cache.delete(key);
    }
  });
};

export default cachedRequest;
