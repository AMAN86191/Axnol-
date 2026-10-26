let sessionExpired = false;

/** Mark that the current session has expired (called from the axios interceptor). */
export const markSessionExpired = (): void => {
  sessionExpired = true;
};

/** Read and clear the session-expired flag (used to pick the initial auth screen). */
export const consumeSessionExpired = (): boolean => {
  const value = sessionExpired;
  sessionExpired = false;
  return value;
};
