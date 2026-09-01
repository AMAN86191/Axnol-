import { AppRegistry } from 'react-native';
import App from './App';
import { name as appName } from './app.json';
import { setBackgroundMessageHandler, setNotifeeBackgroundEventHandler } from './src/utils/notificationService';

// Register background/quit-state handlers BEFORE app mounts
// These MUST be at the top level, outside any component
setBackgroundMessageHandler();
setNotifeeBackgroundEventHandler();

AppRegistry.registerComponent(appName, () => App);
