import { useEffect, useState } from 'react';

/**
 * Returns `true` while a screen is "loading".
 *
 * The app currently renders static/mock data, so this hook simulates an
 * initial load to drive skeleton placeholders. When real data fetching
 * (RTK Query `isLoading`) is wired up, this can be dropped in favour of it.
 */
export const useSimulatedLoading = (duration = 900): boolean => {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), duration);
    return () => clearTimeout(timer);
  }, [duration]);

  return loading;
};

export default useSimulatedLoading;
