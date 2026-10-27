import React from 'react';
import {GestureHandlerRootView} from 'react-native-gesture-handler';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import {Provider} from 'react-redux';
import {store} from './src/redux/store';
import RootNavigator from './src/navigation/RootNavigator';
import {ToastProvider} from './src/components/ui/ToastProvider';
import NetworkBanner from './src/components/ui/NetworkBanner';

const App = () => (
  <GestureHandlerRootView style={{flex: 1}}>
    <SafeAreaProvider>
      <Provider store={store}>
        <ToastProvider>
          <RootNavigator />
          <NetworkBanner />
        </ToastProvider>
      </Provider>
    </SafeAreaProvider>
  </GestureHandlerRootView>
);

export default App;
