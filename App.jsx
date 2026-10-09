import React from 'react';
import {GestureHandlerRootView} from 'react-native-gesture-handler';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import {Provider} from 'react-redux';
import {store} from './src/store';
import RootNavigator from './src/navigation/RootNavigator';

const App = () => (
  <GestureHandlerRootView style={{flex: 1}}>
    <SafeAreaProvider>
      <Provider store={store}>
        <RootNavigator />
      </Provider>
    </SafeAreaProvider>
  </GestureHandlerRootView>
);

export default App;
