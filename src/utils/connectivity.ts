import type { NetworkErrorKind } from './apiError';

/**
 * Tiny global connectivity store, driven by API results (no native module).
 * A failed request because of the network raises the banner; any successful
 * response, or a successful retry, clears it and tells screens to reload.
 */
type Listener = () => void;

const PROBE_URL = 'https://axnol.tambimotors.com/api';
const PROBE_TIMEOUT_MS = 6000;

let kind: NetworkErrorKind = null;
const stateListeners = new Set<Listener>();
const reconnectListeners = new Set<Listener>();

const notifyState = () => stateListeners.forEach(listener => listener());

export const getConnectivityIssue = (): NetworkErrorKind => kind;

export const subscribeConnectivity = (listener: Listener) => {
  stateListeners.add(listener);
  return () => {
    stateListeners.delete(listener);
  };
};

/** Run `listener` whenever the connection comes back after a failure. */
export const onReconnect = (listener: Listener) => {
  reconnectListeners.add(listener);
  return () => {
    reconnectListeners.delete(listener);
  };
};

export const reportNetworkError = (next: NetworkErrorKind) => {
  if (next && next !== kind) {
    kind = next;
    notifyState();
  }
};

export const reportNetworkOk = () => {
  if (kind) {
    kind = null;
    notifyState();
    reconnectListeners.forEach(listener => listener());
  }
};

/** Any HTTP answer (even 401/404) proves the network works. */
export const probeConnection = async (): Promise<boolean> => {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), PROBE_TIMEOUT_MS);
  try {
    await fetch(PROBE_URL, { method: 'GET', signal: controller.signal });
    return true;
  } catch {
    return false;
  } finally {
    clearTimeout(timer);
  }
};

/** Used by the banner's Retry button. Resolves true when back online. */
export const retryConnection = async (): Promise<boolean> => {
  const online = await probeConnection();
  if (online) {
    reportNetworkOk();
  }
  return online;
};

/**
 * Listen to the phone's own network state so the banner shows the moment the
 * connection drops, not only after a request fails. Needs the NetInfo native
 * module; on an app build that predates it, this quietly does nothing and the
 * banner falls back to reacting to failed requests.
 */
let monitorStarted = false;

export const startNetworkMonitor = (): (() => void) => {
  if (monitorStarted) {
    return () => {};
  }
  try {
    // Required lazily: importing it throws when the native module is missing.
    const NetInfo = require('@react-native-community/netinfo').default;

    NetInfo.configure({
      // Judge "reachable" against our own server, and count any HTTP answer.
      reachabilityUrl: PROBE_URL,
      reachabilityMethod: 'GET',
      reachabilityTest: async (response: { status: number }) =>
        response.status > 0,
      reachabilityShortTimeout: 4 * 1000,
      reachabilityLongTimeout: 10 * 1000,
      reachabilityRequestTimeout: 8 * 1000,
    });

    const unsubscribe = NetInfo.addEventListener(
      (state: {
        isConnected: boolean | null;
        isInternetReachable: boolean | null;
      }) => {
        // null means "not known yet"; only an explicit false is offline.
        const offline =
          state.isConnected === false || state.isInternetReachable === false;
        if (offline) {
          reportNetworkError('offline');
        } else {
          reportNetworkOk();
        }
      },
    );
    monitorStarted = true;
    return () => {
      monitorStarted = false;
      unsubscribe();
    };
  } catch {
    return () => {};
  }
};
