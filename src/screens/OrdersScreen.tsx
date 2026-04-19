import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { apiService } from '@services/index';
import type { RootStackParamList } from '@navigation/types';

const SEEN_ORDERS_KEY = 'seen_order_ids';

interface SalesAudit {
  id: string;
  orderId: string;
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
  customerName: string;
  customerLastName: string;
  customerEmail: string;
  customerPhone: string;
  saleDate: string;
  status: string;
  notes: string | null;
}

interface GroupedOrder {
  orderId: string;
  saleDate: string;
  customerName: string;
  customerLastName: string;
  customerEmail: string;
  customerPhone: string;
  total: number;
  items: SalesAudit[];
  isNew: boolean;
}

type Props = NativeStackScreenProps<RootStackParamList, 'Orders'>;

export const OrdersScreen: React.FC<Props> = ({ navigation }) => {
  const [audits, setAudits] = useState<SalesAudit[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [seenOrderIds, setSeenOrderIds] = useState<Set<string>>(new Set());
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);

  const loadSeenOrders = async (): Promise<Set<string>> => {
    try {
      const stored = await AsyncStorage.getItem(SEEN_ORDERS_KEY);
      return stored ? new Set(JSON.parse(stored)) : new Set();
    } catch {
      return new Set();
    }
  };

  const markOrderAsSeen = async (orderId: string) => {
    const updated = new Set(seenOrderIds);
    updated.add(orderId);
    setSeenOrderIds(updated);
    try {
      await AsyncStorage.setItem(SEEN_ORDERS_KEY, JSON.stringify([...updated]));
    } catch {}
  };

  const fetchAudits = useCallback(async () => {
    try {
      const data = await apiService.getAllSalesAudits();
      setAudits(data);
    } catch (error) {
      console.error('Error al cargar pedidos:', error);
    }
  }, []);

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      const seen = await loadSeenOrders();
      setSeenOrderIds(seen);
      await fetchAudits();
      setLoading(false);
    };
    init();
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchAudits();
    setRefreshing(false);
  }, [fetchAudits]);

  const groupOrders = (): GroupedOrder[] => {
    const grouped: { [key: string]: SalesAudit[] } = {};
    audits.forEach((audit) => {
      if (!grouped[audit.orderId]) grouped[audit.orderId] = [];
      grouped[audit.orderId].push(audit);
    });

    return Object.entries(grouped)
      .map(([orderId, items]) => ({
        orderId,
        saleDate: items[0].saleDate,
        customerName: items[0].customerName,
        customerLastName: items[0].customerLastName,
        customerEmail: items[0].customerEmail,
        customerPhone: items[0].customerPhone,
        total: items.reduce((sum, item) => sum + item.subtotal, 0),
        items,
        isNew: !seenOrderIds.has(orderId),
      }))
      .sort((a, b) => new Date(b.saleDate).getTime() - new Date(a.saleDate).getTime());
  };

  const handleToggleOrder = (orderId: string) => {
    if (expandedOrder !== orderId) {
      markOrderAsSeen(orderId);
      setExpandedOrder(orderId);
    } else {
      setExpandedOrder(null);
    }
  };

  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });

  const formatPrice = (value: number) =>
    `ARS$ ${value.toLocaleString('es-ES')}`;

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#3b82f6" />
      </View>
    );
  }

  const grouped = groupOrders();
  const newCount = grouped.filter((o) => o.isNew).length;

  return (
    <ScrollView
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      <View style={styles.header}>
        <Text style={styles.title}>Pedidos</Text>
        {newCount > 0 && (
          <View style={styles.newBadge}>
            <Text style={styles.newBadgeText}>{newCount} nuevos</Text>
          </View>
        )}
      </View>

      {grouped.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No hay pedidos aún</Text>
        </View>
      ) : (
        <View style={styles.list}>
          {grouped.map((order) => {
            const isExpanded = expandedOrder === order.orderId;
            return (
              <View
                key={order.orderId}
                style={[styles.card, order.isNew && styles.cardNew]}
              >
                {/* Header de la tarjeta */}
                <TouchableOpacity
                  style={styles.cardHeader}
                  onPress={() => handleToggleOrder(order.orderId)}
                  activeOpacity={0.7}
                >
                  <View style={styles.cardHeaderLeft}>
                    {order.isNew && (
                      <View style={styles.dot} />
                    )}
                    <View>
                      <Text style={styles.customerName}>
                        {order.customerName} {order.customerLastName}
                      </Text>
                      <Text style={styles.orderDate}>{formatDate(order.saleDate)}</Text>
                    </View>
                  </View>
                  <View style={styles.cardHeaderRight}>
                    <Text style={styles.orderTotal}>{formatPrice(order.total)}</Text>
                    <Text style={styles.chevron}>{isExpanded ? '▲' : '▼'}</Text>
                  </View>
                </TouchableOpacity>

                {/* Contenido expandible */}
                {isExpanded && (
                  <View style={styles.cardBody}>
                    {/* Datos del cliente */}
                    <View style={styles.customerSection}>
                      <Text style={styles.sectionLabel}>DATOS DEL CLIENTE</Text>
                      <Text style={styles.detailText}>{order.customerEmail}</Text>
                      <Text style={styles.detailText}>{order.customerPhone}</Text>
                    </View>

                    {/* Productos */}
                    <View style={styles.productsSection}>
                      <Text style={styles.sectionLabel}>PRODUCTOS</Text>
                      {order.items.map((item) => (
                        <View key={item.id} style={styles.productRow}>
                          <View style={styles.productInfo}>
                            <Text style={styles.productName}>{item.productName}</Text>
                            <Text style={styles.productQty}>x{item.quantity}</Text>
                          </View>
                          <Text style={styles.productPrice}>
                            {formatPrice(item.unitPrice)}
                          </Text>
                        </View>
                      ))}
                    </View>

                    {/* Total */}
                    <View style={styles.totalRow}>
                      <Text style={styles.totalLabel}>Total</Text>
                      <Text style={styles.totalValue}>{formatPrice(order.total)}</Text>
                    </View>
                  </View>
                )}
              </View>
            );
          })}
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1f2937',
  },
  newBadge: {
    backgroundColor: '#ef4444',
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 3,
  },
  newBadgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    paddingTop: 60,
  },
  emptyText: {
    fontSize: 16,
    color: '#9ca3af',
  },
  list: {
    paddingHorizontal: 16,
    paddingBottom: 24,
    gap: 12,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    overflow: 'hidden',
  },
  cardNew: {
    borderColor: '#3b82f6',
    borderWidth: 1.5,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  cardHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#3b82f6',
  },
  customerName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1f2937',
  },
  orderDate: {
    fontSize: 12,
    color: '#9ca3af',
    marginTop: 2,
  },
  cardHeaderRight: {
    alignItems: 'flex-end',
    gap: 4,
  },
  orderTotal: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1f2937',
  },
  chevron: {
    fontSize: 10,
    color: '#9ca3af',
  },
  cardBody: {
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
    padding: 16,
    gap: 16,
  },
  customerSection: {
    gap: 4,
  },
  sectionLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#9ca3af',
    letterSpacing: 1,
    marginBottom: 6,
  },
  detailText: {
    fontSize: 14,
    color: '#4b5563',
  },
  productsSection: {
    gap: 4,
  },
  productRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  productInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  productName: {
    fontSize: 14,
    color: '#1f2937',
    flex: 1,
  },
  productQty: {
    fontSize: 13,
    color: '#6b7280',
    fontWeight: '600',
  },
  productPrice: {
    fontSize: 14,
    color: '#4b5563',
    fontWeight: '500',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 8,
  },
  totalLabel: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1f2937',
  },
  totalValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1f2937',
  },
});
