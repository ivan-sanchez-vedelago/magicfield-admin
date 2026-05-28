'use client';

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Device, Browser, OS } from '@hooks/useDashboardStats';

interface DeviceBreakdownProps {
  devices: Device[];
  browsers: Browser[];
  operatingSystems: OS[];
}

export const DeviceBreakdown: React.FC<DeviceBreakdownProps> = ({
  devices,
  browsers,
  operatingSystems,
}) => {
  const renderList = (items: any[], label: string) => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{label}</Text>
      {items.length === 0 ? (
        <Text style={styles.emptyText}>Sin datos</Text>
      ) : (
        items.slice(0, 5).map((item, index) => (
          <View key={index} style={styles.item}>
            <Text style={styles.itemName} numberOfLines={1}>
              {item.device || item.browser || item.os}
            </Text>
            <View style={styles.barContainer}>
              <View
                style={[
                  styles.bar,
                  {
                    width: `${Math.min(100, (item.count / items[0].count) * 100)}%`,
                  },
                ]}
              />
            </View>
            <Text style={styles.count}>{item.count}</Text>
          </View>
        ))
      )}
    </View>
  );

  return (
    <View style={styles.card}>
      <Text style={styles.title}>Disposit ivos, Navegadores y SO</Text>
      <View style={styles.grid}>
        <View style={styles.gridItem}>{renderList(devices, 'Dispositivos')}</View>
        <View style={styles.gridItem}>{renderList(browsers, 'Navegadores')}</View>
        <View style={styles.gridItem}>
          {renderList(operatingSystems, 'Sistema Operativo')}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 16,
  },
  grid: {
    gap: 16,
  },
  gridItem: {
    flex: 1,
  },
  section: {
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6b7280',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  item: {
    marginBottom: 10,
  },
  itemName: {
    fontSize: 12,
    fontWeight: '500',
    color: '#1f2937',
    marginBottom: 4,
  },
  barContainer: {
    height: 6,
    backgroundColor: '#f3f4f6',
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 4,
  },
  bar: {
    height: '100%',
    backgroundColor: '#3b82f6',
  },
  count: {
    fontSize: 11,
    color: '#9ca3af',
    textAlign: 'right',
  },
  emptyText: {
    color: '#9ca3af',
    fontSize: 12,
    textAlign: 'center',
    paddingVertical: 12,
  },
});
