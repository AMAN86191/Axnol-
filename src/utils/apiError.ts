export type NetworkErrorKind = 'offline' | 'slow' | null;

const getMessage = (error: any): string =>
  String(
    error?.message ?? error?.response?.data?.message ?? '',
  ).toLowerCase();

const getCode = (error: any): string =>
  String(error?.code ?? error?.response?.data?.code ?? '').toUpperCase();

/** Detect whether a failed request was caused by the network being down or slow. */
export const getNetworkErrorKind = (error: any): NetworkErrorKind => {
  if (!error) {
    return null;
  }

  const message = getMessage(error);
  const code = getCode(error);

  if (
    code === 'ECONNABORTED' ||
    code === 'ETIMEDOUT' ||
    message.includes('timeout')
  ) {
    return 'slow';
  }

  if (
    code === 'ERR_NETWORK' ||
    message.includes('network error') ||
    message.includes('network request failed') ||
    message.includes('failed to fetch') ||
    message.includes('no internet')
  ) {
    return 'offline';
  }

  return null;
};

export const getNetworkErrorMessage = (kind: NetworkErrorKind): string => {
  if (kind === 'slow') {
    return 'Your internet connection is slow. Please try again.';
  }
  if (kind === 'offline') {
    return 'No internet connection. Please check your connection and try again.';
  }
  return '';
};

/** Message to show for a failed data load, with network-specific wording. */
export const getLoadErrorMessage = (error: any, subject: string): string => {
  const kind = getNetworkErrorKind(error);
  if (kind) {
    return getNetworkErrorMessage(kind);
  }
  if (error) {
    return `Unable to load ${subject}. Please try again.`;
  }
  return '';
};
