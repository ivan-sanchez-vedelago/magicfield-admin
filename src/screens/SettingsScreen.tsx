import React, { useState } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  TextInput,
  Alert,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { apiService } from '@services/api';
import { API_CONFIG } from '@services/config';
import type { RootStackParamList } from '@navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'Settings'>;

export const SettingsScreen: React.FC<Props> = ({ navigation }) => {
  const [apiUrl, setApiUrl] = useState(API_CONFIG.BASE_URL);
  const [tempUrl, setTempUrl] = useState(apiUrl);
  const [isEditing, setIsEditing] = useState(false);

  const handleSaveApiUrl = async () => {
    if (!tempUrl.trim()) {
      Alert.alert('Error', 'La URL no puede estar vacía');
      return;
    }

    try {
      // Test connection
      apiService.updateBaseUrl(tempUrl);
      const isHealthy = await apiService.healthCheck();

      if (isHealthy) {
        setApiUrl(tempUrl);
        setIsEditing(false);
        Alert.alert('Éxito', 'Configuración guardada correctamente');
      } else {
        Alert.alert('Error', 'No se pudo conectar con el servidor');
        setTempUrl(apiUrl);
      }
    } catch (error) {
      Alert.alert('Error', 'No se pudo conectar con el servidor');
      setTempUrl(apiUrl);
    }
  };

  const handleCancel = () => {
    setTempUrl(apiUrl);
    setIsEditing(false);
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Configuración</Text>
      </View>

      {/* API Configuration */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Configuración de API</Text>

        <View style={styles.settingBox}>
          <Text style={styles.label}>URL del Backend</Text>

          {!isEditing ? (
            <>
              <View style={styles.displayBox}>
                <Text style={styles.displayText}>{apiUrl}</Text>
              </View>
              <TouchableOpacity
                style={styles.button}
                onPress={() => setIsEditing(true)}
              >
                <Text style={styles.buttonText}>Editar</Text>
              </TouchableOpacity>
            </>
          ) : (
            <>
              <TextInput
                style={styles.input}
                value={tempUrl}
                onChangeText={setTempUrl}
                placeholder="http://localhost:8080"
                placeholderTextColor="#9ca3af"
              />
              <View style={styles.editActions}>
                <TouchableOpacity
                  style={[styles.button, styles.saveButton]}
                  onPress={handleSaveApiUrl}
                >
                  <Text style={styles.buttonText}>Guardar</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.button, styles.cancelButton]}
                  onPress={handleCancel}
                >
                  <Text style={[styles.buttonText, styles.cancelButtonText]}>
                    Cancelar
                  </Text>
                </TouchableOpacity>
              </View>
            </>
          )}
        </View>

        <View style={styles.infoBox}>
          <Text style={styles.infoText}>
            💡 Asegúrate de que el servidor está ejecutándose en la URL especificada.
          </Text>
        </View>
      </View>

      {/* About Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Acerca de la App</Text>

        <View style={styles.aboutBox}>
          <InfoRow label="Aplicación" value="MagicField Admin" />
          <InfoRow label="Versión" value="1.0.0" />
          <InfoRow label="Estado" value="Beta" />
        </View>
      </View>

      {/* Developer Info */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Información del Desarrollador</Text>
        <View style={styles.devBox}>
          <Text style={styles.devText}>
            Esta es la versión beta de MagicField Admin, una herramienta para administrar productos y stock desde tu dispositivo móvil.
          </Text>
          <Text style={styles.devText}>
            Para reportar problemas o sugerencias, contacta con el equipo de desarrollo.
          </Text>
        </View>
      </View>
    </ScrollView>
  );
};

interface InfoRowProps {
  label: string;
  value: string;
}

const InfoRow: React.FC<InfoRowProps> = ({ label, value }) => (
  <View style={styles.infoRow}>
    <Text style={styles.infoLabel}>{label}</Text>
    <Text style={styles.infoValue}>{value}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1f2937',
  },
  section: {
    marginHorizontal: 16,
    marginVertical: 16,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 12,
  },
  settingBox: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  displayBox: {
    backgroundColor: '#f3f4f6',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  displayText: {
    fontSize: 13,
    color: '#6b7280',
    fontFamily: 'monospace',
  },
  input: {
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 13,
    color: '#1f2937',
    marginBottom: 12,
    backgroundColor: '#fff',
  },
  button: {
    backgroundColor: '#3b82f6',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 6,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 13,
  },
  editActions: {
    flexDirection: 'row',
    gap: 8,
  },
  saveButton: {
    flex: 1,
    backgroundColor: '#22c55e',
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#f3f4f6',
  },
  cancelButtonText: {
    color: '#6b7280',
  },
  infoBox: {
    backgroundColor: '#fef2f2',
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#f59e0b',
    padding: 12,
  },
  infoText: {
    fontSize: 12,
    color: '#92400e',
    lineHeight: 18,
  },
  aboutBox: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  infoLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6b7280',
  },
  infoValue: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1f2937',
  },
  devBox: {
    backgroundColor: '#eff6ff',
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#3b82f6',
    padding: 16,
  },
  devText: {
    fontSize: 12,
    color: '#1e40af',
    lineHeight: 18,
    marginBottom: 10,
  },
});
