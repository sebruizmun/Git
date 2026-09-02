import { registerRootComponent } from 'expo';
import { Alert } from 'react-native';

import App from './App';

// Uncaught JS errors outside React's render tree (e.g. in an event handler
// or a native module callback) otherwise abort the process silently in a
// release build, with no on-screen trace of what happened.
const errorUtils = (globalThis as { ErrorUtils?: { setGlobalHandler: (h: (e: Error, isFatal?: boolean) => void) => void; getGlobalHandler: () => (e: Error, isFatal?: boolean) => void } }).ErrorUtils;
if (errorUtils) {
  const defaultHandler = errorUtils.getGlobalHandler();
  errorUtils.setGlobalHandler((error, isFatal) => {
    Alert.alert(
      isFatal ? 'Fatal Error' : 'Error',
      `${error.name}: ${error.message}\n\n${error.stack ?? ''}`,
      [{ text: 'OK', onPress: () => defaultHandler(error, isFatal) }]
    );
  });
}

// registerRootComponent calls AppRegistry.registerComponent('main', () => App);
// It also ensures that whether you load the app in Expo Go or in a native build,
// the environment is set up appropriately
registerRootComponent(App);