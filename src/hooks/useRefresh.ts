import { useCallback, useState } from 'react';

const MIN_SPINNER_MS = 600;

/**
 * State for a pull-to-refresh control. Runs every given refetch together and
 * keeps the spinner up for a short minimum so it never just blinks, which also
 * covers screens that only show static data.
 */
export const useRefresh = (...refetchers: Array<() => unknown>) => {
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await Promise.all([
        ...refetchers.map(refetch => Promise.resolve(refetch()).catch(() => {})),
        new Promise<void>(resolve => setTimeout(resolve, MIN_SPINNER_MS)),
      ]);
    } finally {
      setRefreshing(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, refetchers);

  return { refreshing, onRefresh };
};

export default useRefresh;
