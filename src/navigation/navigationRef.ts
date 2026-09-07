import { createNavigationContainerRef } from '@react-navigation/native';
import type { RootStackParamList } from './types';

export const navigationRef = createNavigationContainerRef<RootStackParamList>();

/** Navega a Pedidos (dentro del drawer) con un pedido puntual para dejar abierto. */
export function navigateToOrder(orderId: string): void {
  if (!navigationRef.isReady()) return;
  navigationRef.navigate('MainDrawer', {
    screen: 'OrdersStack',
    params: {
      screen: 'Orders',
      params: { orderId },
    },
  });
}
