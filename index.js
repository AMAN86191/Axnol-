import {AppRegistry} from 'react-native';
import App from './App';
import {name as appName} from './app.json';
import notifee, {EventType} from '@notifee/react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const PENDING_INVOICE_KEY = 'pendingInvoicePath';

notifee.onBackgroundEvent(async ({type, detail}) => {
  if (type === EventType.PRESS || type === EventType.ACTION_PRESS) {
    const path = detail?.notification?.data?.invoicePath;
    if (path) {
      await AsyncStorage.setItem(PENDING_INVOICE_KEY, String(path));
    }
  }
});

AppRegistry.registerComponent(appName, () => App);
