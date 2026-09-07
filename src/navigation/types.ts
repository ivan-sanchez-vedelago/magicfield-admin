import type { NavigatorScreenParams } from '@react-navigation/native';

// Tipo aparte para el único screen de OrdersStackNavigator: DrawerStackParamList necesita
// tipar sus params anidados sin depender de RootStackParamList entero (eso generaría una
// referencia circular RootStackParamList -> DrawerStackParamList -> RootStackParamList).
export type OrdersStackParamList = {
  Orders: { orderId?: string } | undefined;
};

export type RootStackParamList = {
  MainDrawer: NavigatorScreenParams<DrawerStackParamList> | undefined;
  Products: undefined;
  ProductDetail: { productId: string };
  CreateProduct: undefined;
  EditProduct: { productId: string };
  Dashboard: undefined;
  Settings: undefined;
  Banners: undefined;
  Orders: OrdersStackParamList['Orders'];
  RestoreProducts: undefined;
  RestoreProduct: { productId: string };
  ImportSingles: undefined;
};

export type DrawerStackParamList = {
  ProductsStack: undefined;
  DashboardStack: undefined;
  CreateProductStack: undefined;
  BannersStack: undefined;
  SettingsStack: undefined;
  OrdersStack: NavigatorScreenParams<OrdersStackParamList> | undefined;
  RestoreProductsStack: undefined;
  ImportSinglesStack: undefined;
};
