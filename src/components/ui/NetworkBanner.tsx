import React, { useCallback, useEffect, useState, useSyncExternalStore } from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Animated, {
  FadeInUp,
  FadeOutUp,
} from 'react-native-reanimated';
import { RefreshCw, WifiOff } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  getConnectivityIssue,
  retryConnection,
  startNetworkMonitor,
  subscribeConnectivity,
} from '../../utils/connectivity';
import { scale, spacing } from '../../theme';

const AUTO_RETRY_MS = 8000;

/**
 * Global banner shown at the top of every screen while the internet is down
 * or too slow. Mount once, above the navigator.
 */
export const NetworkBanner: React.FC = () => {
  const insets = useSafeAreaInsets();
  const issue = useSyncExternalStore(
    subscribeConnectivity,
    getConnectivityIssue,
    getConnectivityIssue,
  );
  const [retrying, setRetrying] = useState(false);
  const [failedOnce, setFailedOnce] = useState(false);

  const retry = useCallback(async () => {
    setRetrying(true);
    const online = await retryConnection();
    setRetrying(false);
    setFailedOnce(!online);
  }, []);

  // Show the banner the instant the phone loses its connection.
  useEffect(() => startNetworkMonitor(), []);

  // Quietly keep checking so the banner clears itself when the net returns.
  useEffect(() => {
    if (!issue) {
      setFailedOnce(false);
      return undefined;
    }
    const timer = setInterval(() => {
      retryConnection();
    }, AUTO_RETRY_MS);
    return () => clearInterval(timer);
  }, [issue]);

  if (!issue) {
    return null;
  }

  const slow = issue === 'slow';
  const title = slow ? 'Slow internet connection' : 'No internet connection';
  const subtitle = failedOnce
    ? 'Still not connected. Check your Wi-Fi or mobile data.'
    : slow
    ? 'Things may take longer than usual to load.'
    : 'Check your Wi-Fi or mobile data and try again.';

  return (
    <View
      pointerEvents="box-none"
      style={[styles.wrap, { top: insets.top + scale(6) }]}>
      <Animated.View
        entering={FadeInUp.duration(220)}
        exiting={FadeOutUp.duration(180)}
        style={[styles.banner, slow ? styles.bannerSlow : styles.bannerOffline]}
        accessibilityRole="alert"
        accessibilityLiveRegion="polite">
        <View style={styles.iconWrap}>
          <WifiOff size={scale(18)} color="#FFFFFF" strokeWidth={2.4} />
        </View>

        <View style={styles.textWrap}>
          <Text style={styles.title} numberOfLines={1}>
            {title}
          </Text>
          <Text style={styles.subtitle} numberOfLines={2}>
            {subtitle}
          </Text>
        </View>

        <TouchableOpacity
          style={styles.retryBtn}
          activeOpacity={0.85}
          disabled={retrying}
          onPress={retry}
          accessibilityRole="button"
          accessibilityLabel="Retry connection">
          {retrying ? (
            <ActivityIndicator size="small" color="#0F172A" />
          ) : (
            <>
              <RefreshCw size={scale(13)} color="#0F172A" strokeWidth={2.6} />
              <Text style={styles.retryText}>Retry</Text>
            </>
          )}
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrap: {
    position: 'absolute',
    left: 0,
    right: 0,
    paddingHorizontal: spacing.md,
    zIndex: 9999,
    elevation: 20,
  },
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: scale(10),
    paddingVertical: scale(10),
    paddingLeft: scale(12),
    paddingRight: scale(10),
    borderRadius: scale(14),
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 10,
  },
  bannerOffline: {
    backgroundColor: '#B42318',
  },
  bannerSlow: {
    backgroundColor: '#B54708',
  },
  iconWrap: {
    width: scale(32),
    height: scale(32),
    borderRadius: scale(16),
    backgroundColor: 'rgba(255,255,255,0.18)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  textWrap: {
    flex: 1,
  },
  title: {
    color: '#FFFFFF',
    fontSize: scale(13),
    fontWeight: '700',
  },
  subtitle: {
    color: 'rgba(255,255,255,0.88)',
    fontSize: scale(11),
    marginTop: scale(1),
    lineHeight: scale(14),
  },
  retryBtn: {
    minWidth: scale(70),
    height: scale(34),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: scale(5),
    paddingHorizontal: scale(12),
    borderRadius: scale(999),
    backgroundColor: '#FFFFFF',
  },
  retryText: {
    color: '#0F172A',
    fontSize: scale(12),
    fontWeight: '700',
  },
});

export default NetworkBanner;
