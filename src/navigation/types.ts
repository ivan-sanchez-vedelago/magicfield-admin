export type RootStackParamList = {
  MainDrawer: undefined;
  Products: undefined;
  ProductDetail: { productId: string };
  CreateProduct: undefined;
  EditProduct: { productId: string };
  Dashboard: undefined;
  Settings: undefined;
  Banners: undefined;
};

export type DrawerStackParamList = {
  ProductsStack: undefined;
  DashboardStack: undefined;
  CreateProductStack: undefined;
  BannersStack: undefined;
  SettingsStack: undefined;
};
