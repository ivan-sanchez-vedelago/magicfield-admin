import React, { useState } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import { useImportSinglesCsv } from '@hooks';
import { CsvImportResult } from '@types';

export const ImportSinglesScreen: React.FC = () => {
  const [pickedFile, setPickedFile] = useState<{ uri: string; name: string } | null>(null);
  const [result, setResult] = useState<CsvImportResult | null>(null);
  const { execute: importCsv, loading } = useImportSinglesCsv((res) => {
    setResult(res);
  });

  const handlePickFile = async () => {
    setResult(null);
    try {
      const doc = await DocumentPicker.getDocumentAsync({
        type: ['text/csv', 'text/comma-separated-values', 'application/vnd.ms-excel', '*/*'],
        copyToCacheDirectory: true,
      });
      if (doc.canceled || !doc.assets?.[0]) return;
      const asset = doc.assets[0];
      setPickedFile({ uri: asset.uri, name: asset.name ?? 'archivo.csv' });
    } catch (err) {
      Alert.alert('Error', 'No se pudo abrir el selector de archivos');
    }
  };

  const handleImport = async () => {
    if (!pickedFile) return;
    try {
      await importCsv({ uri: pickedFile.uri, name: pickedFile.name });
    } catch (err) {
      Alert.alert(
        'Error',
        'No se pudo importar el archivo: ' +
          (err instanceof Error ? err.message : 'Error desconocido')
      );
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.infoBanner}>
        <Text style={styles.infoBannerText}>
          Importá un CSV exportado de ManaBox para cargar múltiples singles de una. Cada fila
          debe traer el Scryfall ID de la carta — no se verifica contra Scryfall, así que la
          identificación depende de que ese dato venga correcto en el archivo.
        </Text>
      </View>

      <View style={styles.section}>
        <TouchableOpacity style={styles.pickButton} onPress={handlePickFile} disabled={loading}>
          <Text style={styles.pickButtonText}>
            {pickedFile ? 'Cambiar archivo' : '📄 Seleccionar archivo CSV'}
          </Text>
        </TouchableOpacity>

        {pickedFile && (
          <View style={styles.fileBox}>
            <Text style={styles.fileName} numberOfLines={1}>{pickedFile.name}</Text>
          </View>
        )}

        {pickedFile && (
          <TouchableOpacity
            style={[styles.importButton, loading && styles.disabled]}
            onPress={handleImport}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <Text style={styles.importButtonText}>Importar</Text>
            )}
          </TouchableOpacity>
        )}
      </View>

      {result && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Resultado</Text>

          <View style={styles.summaryRow}>
            <SummaryStat label="Filas leídas" value={result.totalRows} color="#6b7280" />
            <SummaryStat label="Creados" value={result.created} color="#22c55e" />
            <SummaryStat label="Stock sumado" value={result.updatedExisting} color="#3b82f6" />
            <SummaryStat label="Errores" value={result.errors.length} color="#ef4444" />
          </View>

          {result.errors.length > 0 && (
            <View style={styles.errorsBox}>
              <Text style={styles.errorsTitle}>Filas con problemas</Text>
              {result.errors.map((e, i) => (
                <View key={i} style={styles.errorRow}>
                  <Text style={styles.errorRowTitle}>
                    Fila {e.row}{e.cardName ? ` — ${e.cardName}` : ''}
                  </Text>
                  <Text style={styles.errorRowReason}>{e.reason}</Text>
                </View>
              ))}
            </View>
          )}
        </View>
      )}
    </ScrollView>
  );
};

const SummaryStat: React.FC<{ label: string; value: number; color: string }> = ({ label, value, color }) => (
  <View style={[styles.statCard, { borderLeftColor: color }]}>
    <Text style={styles.statValue}>{value}</Text>
    <Text style={styles.statLabel}>{label}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  infoBanner: {
    backgroundColor: '#eff6ff',
    margin: 16,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#dbeafe',
  },
  infoBannerText: {
    fontSize: 12,
    color: '#1e40af',
    lineHeight: 18,
  },
  section: {
    marginHorizontal: 16,
    marginVertical: 12,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 12,
  },
  pickButton: {
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: '#3b82f6',
    borderRadius: 8,
    paddingVertical: 20,
    alignItems: 'center',
    backgroundColor: '#eff6ff',
  },
  pickButtonText: {
    color: '#3b82f6',
    fontWeight: '600',
    fontSize: 14,
  },
  fileBox: {
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    padding: 12,
    marginTop: 12,
  },
  fileName: {
    fontSize: 13,
    color: '#374151',
    fontWeight: '600',
  },
  importButton: {
    backgroundColor: '#22c55e',
    paddingVertical: 14,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 12,
  },
  importButtonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 14,
  },
  disabled: {
    opacity: 0.6,
  },
  summaryRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  statCard: {
    flexGrow: 1,
    minWidth: '45%',
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 12,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  statValue: {
    fontSize: 20,
    fontWeight: '800',
    color: '#1f2937',
  },
  statLabel: {
    fontSize: 11,
    color: '#6b7280',
    fontWeight: '600',
    marginTop: 2,
  },
  errorsBox: {
    marginTop: 12,
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: '#fecaca',
  },
  errorsTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#991b1b',
    marginBottom: 8,
  },
  errorRow: {
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  errorRowTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#374151',
  },
  errorRowReason: {
    fontSize: 12,
    color: '#ef4444',
    marginTop: 2,
  },
});
