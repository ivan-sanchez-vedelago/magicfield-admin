import React from 'react';
import {
  DrawerNavigationProp,
  createDrawerNavigator,
  DrawerContentScrollView,
  DrawerItemList,
  DrawerItem,
} from '@react-navigation/drawer';
import { NativeStackNavigationProp, createNativeStackNavigator } from '@react-navigation/native-stack';
import {
  ProductsScreen,
  CreateProductScreen,
  EditProductScreen,
  ProductDetailScreen,
  DashboardScreen,
  SettingsScreen,
  BannersScreen,
  OrdersScreen,
} from '@screens/index';
import { Text, View, StyleSheet } from 'react-native';
import type { RootStackParamList, DrawerStackParamList } from './types';

const Stack = createNativeStackNavigator<RootStackParamList>();
const Drawer = createDrawerNavigator<DrawerStackParamList>();

// Custom Drawer Content
const CustomDrawerContent = (props: any) => (
  <DrawerContentScrollView {...props} contentContainerStyle={styles.drawerContent}>
    <View style={styles.drawerHeader}>
      <Text style={styles.drawerTitle}>MagicField Admin</Text>
      <Text style={styles.drawerSubtitle}>v1.0.0</Text>
    </View>

    <DrawerItemList {...props} />

    <View style={styles.drawerFooter}>
      <Text style={styles.drawerFooterText}>Herramienta de Administración</Text>
    </View>
  </DrawerContentScrollView>
);

// Products Stack
const ProductsStackNavigator = () => (
  <Stack.Navigator
    screenOptions={{
      headerShown: false,
    }}
  >
    <Stack.Screen
      name="Products"
      component={ProductsScreen}
      options={{ title: 'Productos' }}
    />
    <Stack.Screen
      name="ProductDetail"
      component={ProductDetailScreen}
      options={{ title: 'Detalle del Producto' }}
    />
    <Stack.Screen
      name="EditProduct"
      component={EditProductScreen}
      options={{ title: 'Editar Producto' }}
    />
  </Stack.Navigator>
);

// Dashboard Stack
const DashboardStackNavigator = () => (
  <Stack.Navigator
    screenOptions={{
      headerShown: false,
    }}
  >
    <Stack.Screen
      name="Dashboard"
      component={DashboardScreen}
      options={{ title: 'Dashboard' }}
    />
  </Stack.Navigator>
);

// Create Product Stack
const CreateProductStackNavigator = () => (
  <Stack.Navigator
    screenOptions={{
      headerShown: false,
    }}
  >
    <Stack.Screen
      name="CreateProduct"
      component={CreateProductScreen}
      options={{ title: 'Crear Producto' }}
    />
  </Stack.Navigator>
);

// Settings Stack
const SettingsStackNavigator = () => (
  <Stack.Navigator
    screenOptions={{
      headerShown: false,
    }}
  >
    <Stack.Screen
      name="Settings"
      component={SettingsScreen}
      options={{ title: 'Configuración' }}
    />
  </Stack.Navigator>
);

// Banners Stack
const BannersStackNavigator = () => (
  <Stack.Navigator
    screenOptions={{
      headerShown: false,
    }}
  >
    <Stack.Screen
      name="Banners"
      component={BannersScreen}
      options={{ title: 'Banners' }}
    />
  </Stack.Navigator>
);

// Orders Stack
const OrdersStackNavigator = () => (
  <Stack.Navigator
    screenOptions={{
      headerShown: false,
    }}
  >
    <Stack.Screen
      name="Orders"
      component={OrdersScreen}
      options={{ title: 'Pedidos' }}
    />
  </Stack.Navigator>
);

// Main Drawer Navigation
const DrawerNavigator = () => (
  <Drawer.Navigator
    screenOptions={{
      headerShown: true,
      headerStyle: {
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#e5e7eb',
      },
      headerTintColor: '#3b82f6',
      headerTitleStyle: {
        fontWeight: '700',
        fontSize: 18,
        color: '#1f2937',
      },
      drawerActiveTintColor: '#3b82f6',
      drawerActiveBackgroundColor: '#eff6ff',
      drawerInactiveTintColor: '#6b7280',
      drawerLabelStyle: {
        marginLeft: -16,
        fontSize: 14,
        fontWeight: '500',
      },
    }}
    drawerContent={CustomDrawerContent}
  >
    <Drawer.Screen
      name="ProductsStack"
      component={ProductsStackNavigator}
      options={{
        drawerLabel: 'Productos',
        title: 'Productos',
        drawerIcon: ({ color, size }) => (
          <Text style={{ fontSize: size, color }}>📦  </Text>
        ),
      }}
    />

    <Drawer.Screen
      name="DashboardStack"
      component={DashboardStackNavigator}
      options={{
        drawerLabel: 'Dashboard',
        title: 'Dashboard',
        drawerIcon: ({ color, size }) => (
          <Text style={{ fontSize: size, color }}>📊  </Text>
        ),
      }}
    />

    <Drawer.Screen
      name="CreateProductStack"
      component={CreateProductStackNavigator}
      options={{
        drawerLabel: 'Crear Producto',
        title: 'Crear Producto',
        drawerIcon: ({ color, size }) => (
          <Text style={{ fontSize: size, color }}>➕  </Text>
        ),
      }}
    />

    <Drawer.Screen
      name="BannersStack"
      component={BannersStackNavigator}
      options={{
        drawerLabel: 'Banners',
        title: 'Banners',
        drawerIcon: ({ color, size }) => (
          <Text style={{ fontSize: size, color }}>🖼️  </Text>
        ),
      }}
    />

    <Drawer.Screen
      name="OrdersStack"
      component={OrdersStackNavigator}
      options={{
        drawerLabel: 'Pedidos',
        title: 'Pedidos',
        drawerIcon: ({ color, size }) => (
          <Text style={{ fontSize: size, color }}>🛒  </Text>
        ),
      }}
    />

    <Drawer.Screen
      name="SettingsStack"
      component={SettingsStackNavigator}
      options={{
        drawerLabel: 'Configuración',
        title: 'Configuración',
        drawerIcon: ({ color, size }) => (
          <Text style={{ fontSize: size, color }}>⚙️  </Text>
        ),
      }}
    />
  </Drawer.Navigator>
);

// Root Navigator
export const RootNavigator = () => (
  <Stack.Navigator
    screenOptions={{
      headerShown: false,
    }}
  >
    <Stack.Screen
      name="MainDrawer"
      component={DrawerNavigator}
      options={{ title: 'MagicField Admin' }}
    />
  </Stack.Navigator>
);

const styles = StyleSheet.create({
  drawerContent: {
    flex: 1,
  },
  drawerHeader: {
    paddingHorizontal: 16,
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    marginBottom: 16,
  },
  drawerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 4,
  },
  drawerSubtitle: {
    fontSize: 12,
    color: '#9ca3af',
    fontWeight: '500',
  },
  drawerFooter: {
    flex: 1,
    justifyContent: 'flex-end',
    paddingHorizontal: 16,
    paddingBottom: 16,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    paddingTop: 16,
  },
  drawerFooterText: {
    fontSize: 12,
    color: '#9ca3af',
    textAlign: 'center',
    fontWeight: '500',
  },
});
