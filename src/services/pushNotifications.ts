import { Platform } from 'react-native';
import Constants, { ExecutionEnvironment } from 'expo-constants';
import { apiService } from './api';

// Desde el SDK 53, expo-notifications no soporta push remoto dentro de Expo Go (solo en
// dev builds/standalone armados con EAS). El warning lo tira el propio módulo apenas se
// carga (no al llamar una de sus funciones), así que la guarda tiene que estar en el
// import: por eso NO hay un `import * as Notifications from 'expo-notifications'` estático
// arriba -- eso ya alcanzaría para dispararlo -- sino un require() adentro del `if`, para
// que Expo Go ni siquiera llegue a cargar el módulo.
const isExpoGo = Constants.executionEnvironment === ExecutionEnvironment.StoreClient;

if (!isExpoGo) {
  const Notifications = require('expo-notifications');
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
    }),
  });
}

/**
 * Se suscribe a los taps sobre notificaciones push (recibidas mientras la app está abierta o en
 * segundo plano) y llama a `onOrderId` con el `orderId` que viaja en el `data` del mensaje.
 * No cubre el cold-start (app cerrada del todo, se abre tocando la notificación) -- para eso
 * hay que consultar `Notifications.getLastNotificationResponseAsync()` aparte (ver App.tsx).
 * No-op en Expo Go, misma guarda que el resto del archivo.
 */
export function subscribeToOrderNotifications(onOrderId: (orderId: string) => void): () => void {
  if (isExpoGo) {
    return () => {};
  }

  const Notifications = require('expo-notifications');
  const subscription = Notifications.addNotificationResponseReceivedListener(
    (response: any) => {
      const orderId = response?.notification?.request?.content?.data?.orderId;
      if (typeof orderId === 'string' && orderId) {
        onOrderId(orderId);
      }
    }
  );

  return () => subscription.remove();
}

/** Cold-start: si la app se abrió tocando una notificación, devuelve su orderId (o null). */
export async function getInitialOrderIdFromNotification(): Promise<string | null> {
  if (isExpoGo) {
    return null;
  }

  const Notifications = require('expo-notifications');
  const response = await Notifications.getLastNotificationResponseAsync();
  const orderId = response?.notification?.request?.content?.data?.orderId;
  return typeof orderId === 'string' && orderId ? orderId : null;
}

/** Pide permisos, obtiene el push token de Expo y lo registra en el backend. */
export async function registerForPushNotifications(): Promise<void> {
  if (isExpoGo) {
    console.log('Expo Go no soporta push remoto (SDK 53+): se omite el registro. Para probar notificaciones usá un dev build de EAS.');
    return;
  }

  const Device = require('expo-device');
  const Notifications = require('expo-notifications');

  if (!Device.isDevice) {
    console.log('Las notificaciones push requieren un dispositivo físico.');
    return;
  }

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.HIGH,
    });
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') {
    console.log('Permiso de notificaciones push denegado.');
    return;
  }

  const projectId =
    Constants.expoConfig?.extra?.eas?.projectId ??
    Constants.easConfig?.projectId;

  if (!projectId) {
    console.log('No se encontró projectId de EAS; no se puede obtener el push token.');
    return;
  }

  let token: string;
  try {
    token = (await Notifications.getExpoPushTokenAsync({ projectId })).data;
  } catch (error) {
    console.log('Error obteniendo el push token de Expo:', error);
    return;
  }

  try {
    await apiService.registerPushToken(token, Platform.OS);
  } catch (error) {
    console.log('Error registrando push token en el backend:', error);
  }
}
