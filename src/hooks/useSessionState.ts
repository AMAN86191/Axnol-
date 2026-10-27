import { useCallback, useState } from 'react';
import { getSessionValue, setSessionValue } from '../utils/sessionStore';

/**
 * Like useState, but the value is remembered while the app stays open. A screen
 * that mounts again starts from the last value instead of empty, so it can show
 * its data straight away and skip the loading skeleton.
 */
export const useSessionState = <T,>(key: string, initial: T) => {
  const [value, setValue] = useState<T>(
    () => getSessionValue<T>(key) ?? initial,
  );

  const set = useCallback(
    (next: T) => {
      setSessionValue(key, next);
      setValue(next);
    },
    [key],
  );

  return [value, set] as const;
};

export default useSessionState;
