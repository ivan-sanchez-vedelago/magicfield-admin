import React, { useEffect } from 'react';
import { View, SafeAreaView, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { RootNavigator } from '@navigation/RootNavigator';
import { navigationRef, navigateToOrder } from '@navigation/navigationRef';
import {
  registerForPushNotifications,
  subscribeToOrderNotifications,
  getInitialOrderIdFromNotification,
} from '@services/pushNotifications';

export default function App() {
  useEffect(() => {
    registerForPushNotifications();

    // App abierta o en segundo plano: se toca la notificación en caliente.
    const unsubscribe = subscribeToOrderNotifications(navigateToOrder);
    return unsubscribe;
  }, []);

  return (
    <GestureHandlerRootView style={styles.root}>
      <SafeAreaView style={styles.safeArea}>
        <NavigationContainer
          ref={navigationRef}
          onReady={() => {
            // Cold-start: la app estaba cerrada del todo y se abrió tocando la notificación.
            // Recién acá el navigationRef ya está listo para navegar -- antes de onReady,
            // navigateToOrder() sería un no-op silencioso (ver isReady() en navigationRef.ts).
            getInitialOrderIdFromNotification().then((orderId) => {
              if (orderId) navigateToOrder(orderId);
            });
          }}
        >
          <RootNavigator />
        </NavigationContainer>
      </SafeAreaView>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
  },
});
