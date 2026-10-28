import React, {useEffect} from 'react';
import {Alert, AppState} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import notifee, {EventType} from '@notifee/react-native';
import {GestureHandlerRootView} from 'react-native-gesture-handler';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import {Provider} from 'react-redux';
import {store} from './src/redux/store';
import RootNavigator from './src/navigation/RootNavigator';
import {ToastProvider} from './src/components/ui/ToastProvider';
// import NetworkBanner from './src/components/ui/NetworkBanner';
import {openInvoice} from './src/utils/invoiceGenerator';

const PENDING_INVOICE_KEY = 'pendingInvoicePath';

const App = () => {
  useEffect(() => {
    let openingPath = '';

    const openPath = async (path: string) => {
      if (openingPath === path) {
        return;
      }
      openingPath = path;
      try {
        await openInvoice(path);
      } catch (error: any) {
        openingPath = '';
        Alert.alert(
          'Unable to open invoice',
          error?.message || 'Please install a PDF viewer and try again.',
        );
      }
    };

    const openPendingInvoice = async () => {
      const path = await AsyncStorage.getItem(PENDING_INVOICE_KEY);
      if (path) {
        await AsyncStorage.removeItem(PENDING_INVOICE_KEY);
        await openPath(path);
      }
    };

    const handleNotificationPress = async () => {
      const initialNotification = await notifee.getInitialNotification();
      const path = initialNotification?.notification.data?.invoicePath;
      if (path) {
        await AsyncStorage.removeItem(PENDING_INVOICE_KEY);
        await openPath(String(path));
      } else {
        await openPendingInvoice();
      }
    };

    handleNotificationPress();

    const unsubscribe = notifee.onForegroundEvent(({type, detail}) => {
      if (type === EventType.PRESS || type === EventType.ACTION_PRESS) {
        const path = detail.notification?.data?.invoicePath;
        if (path) {
          AsyncStorage.removeItem(PENDING_INVOICE_KEY);
          openPath(String(path));
        }
      }
    });

    const appStateSubscription = AppState.addEventListener('change', state => {
      if (state === 'active') {
        openPendingInvoice();
      }
    });

    return () => {
      unsubscribe();
      appStateSubscription.remove();
    };
  }, []);

  return (
    <GestureHandlerRootView style={{flex: 1}}>
      <SafeAreaProvider>
        <Provider store={store}>
          <ToastProvider>
            <RootNavigator />
            {/* <NetworkBanner /> */}
          </ToastProvider>
        </Provider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
};

export default App;
