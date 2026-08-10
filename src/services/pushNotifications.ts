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
