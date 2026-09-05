import { 
  getMessaging,
  getToken, 
  onMessage, 
  onNotificationOpenedApp as onFirebaseNotificationOpenedApp, 
  onTokenRefresh, 
  requestPermission as requestFirebasePermission,
  getInitialNotification as getFirebaseInitialNotification, 
  setBackgroundMessageHandler as setFirebaseBackgroundMessageHandler
} from '@react-native-firebase/messaging';
import notifee, { AndroidImportance, AndroidStyle, EventType } from '@notifee/react-native';
import { Platform, PermissionsAndroid, Alert, Linking } from 'react-native';
import i18n from '../i18n';
import { zustandStorage } from './asyncstorage';

/**
 * Firebase Push Notification Utility with Notifee
 * Handles: permission, token management, foreground/background/quit-state notifications.
 * Uses @notifee/react-native to display rich local notifications.
 */

// ─── Notifee Channel Setup ──────────────────────────────────────────────────────

const CHANNEL_ID = 'gaumata_default';
const CHANNEL_NAME = 'Gau Mata Trust';

/**
 * Create the default Android notification channel.
 * Must be called before displaying any notification.
 */
const createNotificationChannel = async () => {
  await notifee.createChannel({
    id: CHANNEL_ID,
    name: CHANNEL_NAME,
    importance: AndroidImportance.HIGH,
    vibration: true,
    sound: 'default',
  });
};

// ─── Display Notification ────────────────────────────────────────────────────────

/**
 * Display a local notification using Notifee.
 * Works in foreground, background, and can be called from anywhere.
 */
export const displayNotification = async (
  title: string,
  body: string,
  data?: Record<string, string>,
  imageUrl?: string,
) => {
  try {
    await createNotificationChannel();

    const notificationConfig: any = {
      title,
      body,
      data: data || {},
      android: {
        channelId: CHANNEL_ID,
        importance: AndroidImportance.HIGH,
        pressAction: { id: 'default' },
        smallIcon: 'ic_launcher', // uses your app icon
        sound: 'default',
      },
      ios: {
        sound: 'default',
      },
    };

    // If there's an image, show BigPicture style on Android
    if (imageUrl) {
      notificationConfig.android.style = {
        type: AndroidStyle.BIGPICTURE,
        picture: imageUrl,
      };
      notificationConfig.android.largeIcon = imageUrl;
      // iOS attachment
      notificationConfig.ios.attachments = [{ url: imageUrl }];
    }

    await notifee.displayNotification(notificationConfig);
  } catch (error) {
    console.log('[Notification] Error displaying notification:', error);
  }
};

// ─── Permission ────────────────────────────────────────────────────────────────

/**
 * Request notification permission from the user.
 * On Android 13+ (API 33) we need POST_NOTIFICATIONS runtime permission.
 * On iOS we use Firebase messaging's requestPermission().
 * Returns true if permission was granted.
 */
export const requestNotificationPermission = async (): Promise<boolean> => {
  try {
    if (Platform.OS === 'android') {
      // Android 13+ needs POST_NOTIFICATIONS runtime permission
      if (Platform.Version >= 33) {
        const result = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
        );
        if (result === PermissionsAndroid.RESULTS.GRANTED) {
          console.log('[Notification] Android permission granted');
          return true;
        } else if (result === PermissionsAndroid.RESULTS.NEVER_ASK_AGAIN) {
          Alert.alert(
            i18n.t('notificationsDisabled.title'),
            i18n.t('notificationsDisabled.message'),
            [
              { text: i18n.t('common.cancel'), style: 'cancel' },
              { text: i18n.t('notificationsDisabled.openSettings'), onPress: () => Linking.openSettings() },
            ],
          );
          return false;
        }
        console.log('[Notification] Android permission denied');
        return false;
      }
      // Below Android 13, notification permission is granted by default
      return true;
    }

    // iOS - request via both Firebase and Notifee
    const authStatus = await requestFirebasePermission(getMessaging());
    await notifee.requestPermission();
    // Use raw values since static AuthorizationStatus might be deprecated too
    const AUTHORIZED = 1; 
    const PROVISIONAL = 2;
    const enabled = authStatus === AUTHORIZED || authStatus === PROVISIONAL;
    console.log('[Notification] iOS permission:', enabled ? 'granted' : 'denied');
    return enabled;
  } catch (error) {
    console.log('[Notification] Permission error:', error);
    return false;
  }
};

// ─── FCM Token ─────────────────────────────────────────────────────────────────

/**
 * Get the FCM device token.
 * Stores it locally via zustandStorage so it can be sent to your backend.
 */
export const getFCMToken = async (): Promise<string | null> => {
  try {
    // Note: registerDeviceForRemoteMessages is omitted as it's often not strictly needed on RNFirebase unless auto-init is false
    const token = await getToken(getMessaging());
    if (token) {
      console.log('[Notification] FCM Token:', token);
      // Persist locally so we can send it to backend later
      await zustandStorage.setItem('fcm_token', token);
      return token;
    }
    return null;
  } catch (error) {
    console.log('[Notification] Error getting FCM token:', error);
    return null;
  }
};

// ─── Foreground Notification Handler ────────────────────────────────────────────

/**
 * Listen for notifications while the app is in the **foreground**.
 * Uses Notifee to display a proper notification banner instead of just an Alert.
 * Returns the unsubscribe function.
 */
export const onForegroundNotification = (
  callback?: (notification: { title?: string; body?: string; data?: any }) => void,
) => {
  return onMessage(getMessaging(), async (remoteMessage) => {
    console.log('[Notification] Foreground message:', JSON.stringify(remoteMessage));

    const title = remoteMessage.notification?.title || 'Gau Mata Trust';
    const body = remoteMessage.notification?.body || '';
    const data = (remoteMessage.data || {}) as Record<string, string>;
    const imageUrl = remoteMessage.notification?.android?.imageUrl
      || (remoteMessage.notification?.ios as any)?.imageUrl
      || (remoteMessage.data?.image as string)
      || undefined;

    // Display notification using Notifee (shows actual notification banner)
    await displayNotification(title, body, data, imageUrl);

    // Also call the custom callback if provided
    if (callback) {
      callback({ title, body, data });
    }
  });
};

// ─── Notifee Foreground Event Handler ────────────────────────────────────────────

/**
 * Handle Notifee notification events in the foreground (tap, dismiss, etc.).
 * Call this inside a useEffect in your root component.
 * Returns the unsubscribe function.
 */
export const onNotifeeForegoundEvent = (
  onPress?: (data: any) => void,
) => {
  return notifee.onForegroundEvent(({ type, detail }) => {
    switch (type) {
      case EventType.PRESS:
        console.log('[Notification] Notifee notification pressed:', detail.notification);
        if (onPress && detail.notification?.data) {
          onPress(detail.notification.data);
        }
        break;
      case EventType.DISMISSED:
        console.log('[Notification] Notifee notification dismissed');
        break;
    }
  });
};

// ─── Background & Quit-State Handlers ───────────────────────────────────────────

/**
 * Register the background message handler for Firebase.
 * MUST be called at the top level (index.js), outside of any component.
 */
export const setBackgroundMessageHandler = () => {
  setFirebaseBackgroundMessageHandler(getMessaging(), async (remoteMessage) => {
    console.log('[Notification] Background message:', JSON.stringify(remoteMessage));
    // The OS shows the notification automatically via Firebase.
  });
};

/**
 * Register Notifee background event handler.
 * MUST be called at the top level (index.js), outside of any component.
 */
export const setNotifeeBackgroundEventHandler = () => {
  notifee.onBackgroundEvent(async ({ type, detail }) => {
    console.log('[Notification] Notifee background event:', type, detail);
    if (type === EventType.PRESS) {
      // Handle notification tap from background
      console.log('[Notification] Background notification pressed:', detail.notification?.data);
    }
  });
};

/**
 * Handle the notification that **opened** the app (from quit or background state).
 * Call this inside a useEffect in your root component.
 */
export const onNotificationOpenedApp = (
  onOpen?: (data: any) => void,
) => {
  // When app is opened from background via notification tap
  const unsubscribe = onFirebaseNotificationOpenedApp(getMessaging(), (remoteMessage) => {
    console.log('[Notification] App opened from background:', JSON.stringify(remoteMessage));
    if (onOpen && remoteMessage.data) {
      onOpen(remoteMessage.data);
    }
  });

  return unsubscribe;
};

/**
 * Check if the app was opened from a **quit state** via a notification tap.
 * Call this once on app boot (inside useEffect with []).
 */
export const getInitialNotification = async (
  onOpen?: (data: any) => void,
) => {
  // Check Firebase initial notification
  const remoteMessage = await getFirebaseInitialNotification(getMessaging());
  if (remoteMessage) {
    console.log('[Notification] App opened from quit state (Firebase):', JSON.stringify(remoteMessage));
    if (onOpen && remoteMessage.data) {
      onOpen(remoteMessage.data);
    }
    return;
  }

  // Check Notifee initial notification
  const initialNotification = await notifee.getInitialNotification();
  if (initialNotification) {
    console.log('[Notification] App opened from quit state (Notifee):', initialNotification.notification);
    if (onOpen && initialNotification.notification?.data) {
      onOpen(initialNotification.notification.data);
    }
  }
};

// ─── Token Refresh ──────────────────────────────────────────────────────────────

/**
 * Listen for FCM token refresh events.
 * When the token changes, you should send the new token to your backend.
 */
export const onTokenRefreshHandler = (
  callback?: (newToken: string) => void,
) => {
  return onTokenRefresh(getMessaging(), (newToken) => {
    console.log('[Notification] Token refreshed:', newToken);
    zustandStorage.setItem('fcm_token', newToken);
    if (callback) {
      callback(newToken);
    }
  });
};

// ─── Initialize Everything ──────────────────────────────────────────────────────

/**
 * Master setup function. Call this once from your root component's useEffect.
 * Handles: channel creation → permission → token → foreground listener →
 *          notifee events → open-app listener → quit-state check → token refresh.
 *
 * @param onNotificationReceived - optional callback for foreground notifications
 * @param onNotificationOpened   - optional callback when user taps a notification
 */
export const initializeNotifications = async (
  onNotificationReceived?: (notification: { title?: string; body?: string; data?: any }) => void,
  onNotificationOpened?: (data: any) => void,
) => {
  // 0. Create notification channel (required on Android 8+)
  await createNotificationChannel();

  // 1. Request permission
  const hasPermission = await requestNotificationPermission();
  if (!hasPermission) {
    console.log('[Notification] Permission not granted, skipping setup.');
    return {
      unsubscribeForeground: () => {},
      unsubscribeOpenedApp: () => {},
      unsubscribeTokenRefresh: () => {},
      unsubscribeNotifeeEvents: () => {},
    };
  }

  // 2. Get FCM Token
  const token = await getFCMToken();
  console.log('[Notification] Setup complete. Token:', token);

  // 3. Set up foreground listener (Firebase → Notifee display)
  const unsubscribeForeground = onForegroundNotification(onNotificationReceived);

  // 4. Set up Notifee foreground event handler (tap, dismiss)
  const unsubscribeNotifeeEvents = onNotifeeForegoundEvent(onNotificationOpened);

  // 5. Set up notification-opened-app listener (from background)
  const unsubscribeOpenedApp = onNotificationOpenedApp(onNotificationOpened);

  // 6. Check if app was opened from quit-state notification
  await getInitialNotification(onNotificationOpened);

  // 7. Listen for token refresh
  const unsubscribeTokenRefresh = onTokenRefreshHandler();

  return {
    unsubscribeForeground,
    unsubscribeOpenedApp,
    unsubscribeTokenRefresh,
    unsubscribeNotifeeEvents,
  };
};
