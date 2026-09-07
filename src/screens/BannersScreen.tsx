import React, { useState, useCallback } from 'react';
import {
  View,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  Text,
  TouchableOpacity,
  Alert,
  RefreshControl,
  TextInput,
  Modal,
  Switch,
  Image,
  ScrollView,
} from 'react-native';
import DraggableFlatList, { RenderItemParams } from 'react-native-draggable-flatlist';
import { useFocusEffect } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import { apiService } from '@services/api';
import { Banner, BannerRequest } from '@types';

const EMPTY_FORM: BannerRequest = { title: '', subtitle: '', active: true };

export const BannersScreen: React.FC = () => {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Modal state
  const [modalVisible, setModalVisible] = useState(false);
  const [editing, setEditing] = useState<Banner | null>(null);
  const [form, setForm] = useState<BannerRequest>(EMPTY_FORM);
  const [pendingImage, setPendingImage] = useState<{ uri: string; name: string } | null>(null);
  const [saving, setSaving] = useState(false);

  // Modo "editar orden": reorderedBanners es una copia de trabajo separada de banners, para
  // poder arrastrar libremente y descartar todo con "Cancelar" sin haber tocado nada real
  // hasta que el admin confirma -- así no hace falta recalcular sortOrder en cada movimiento.
  const [reorderMode, setReorderMode] = useState(false);
  const [reorderedBanners, setReorderedBanners] = useState<Banner[]>([]);
  const [savingOrder, setSavingOrder] = useState(false);

  const loadBanners = async () => {
    try {
      const data = await apiService.getAllBanners();
      setBanners(data);
    } catch (e) {
      Alert.alert('Error', 'No se pudieron cargar los banners');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(useCallback(() => { loadBanners(); }, []));

  const onRefresh = () => { setRefreshing(true); loadBanners(); };

  const openCreate = () => {
    setEditing(null);
    setForm(EMPTY_FORM);
    setPendingImage(null);
    setModalVisible(true);
  };

  const openEdit = (banner: Banner) => {
    setEditing(banner);
    setForm({
      title: banner.title,
      subtitle: banner.subtitle ?? '',
      active: banner.active,
    });
    setPendingImage(null);
    setModalVisible(true);
  };

  const openReorder = () => {
    setReorderedBanners(banners);
    setReorderMode(true);
  };

  const cancelReorder = () => {
    setReorderMode(false);
    setReorderedBanners([]);
  };

  const confirmReorder = async () => {
    setSavingOrder(true);
    try {
      const updated = await apiService.reorderBanners(reorderedBanners.map((b) => b.id));
      setBanners(updated);
      setReorderMode(false);
      setReorderedBanners([]);
    } catch (e) {
      Alert.alert('Error', 'No se pudo guardar el nuevo orden');
    } finally {
      setSavingOrder(false);
    }
  };

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [11, 5],
      quality: 1,
    });
    if (!result.canceled) {
      const asset = result.assets[0];
      const name = asset.fileName ?? `banner-${Date.now()}.jpg`;
      setPendingImage({ uri: asset.uri, name });
    }
  };

  const handleSave = async () => {
    if (!form.title.trim()) {
      Alert.alert('Validación', 'El título es obligatorio');
      return;
    }
    setSaving(true);
    try {
      let banner: Banner;
      if (editing) {
        banner = await apiService.updateBanner(editing.id, form);
      } else {
        banner = await apiService.createBanner(form);
      }

      if (pendingImage) {
        banner = await apiService.uploadBannerImage(banner.id, pendingImage.uri, pendingImage.name);
      }

      setModalVisible(false);
      loadBanners();
    } catch (e) {
      Alert.alert('Error', 'No se pudo guardar el banner');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = (banner: Banner) => {
    Alert.alert(
      'Eliminar banner',
      `¿Eliminar "${banner.title}"? Esta acción no se puede deshacer.`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            try {
              await apiService.deleteBanner(banner.id);
              loadBanners();
            } catch {
              Alert.alert('Error', 'No se pudo eliminar el banner');
            }
          },
        },
      ]
    );
  };

  const renderItem = ({ item }: { item: Banner }) => (
    <View style={styles.card}>
      {item.imageUrl ? (
        <Image source={{ uri: item.imageUrl }} style={styles.cardImage} />
      ) : (
        <View style={styles.cardImagePlaceholder}>
          <Text style={styles.cardImagePlaceholderText}>Sin imagen</Text>
        </View>
      )}
      <View style={styles.cardBody}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle} numberOfLines={1}>{item.title}</Text>
          <View style={[styles.badge, item.active ? styles.badgeActive : styles.badgeInactive]}>
            <Text style={styles.badgeText}>{item.active ? 'Activo' : 'Inactivo'}</Text>
          </View>
        </View>
        {item.subtitle ? (
          <Text style={styles.cardSubtitle} numberOfLines={2}>{item.subtitle}</Text>
        ) : null}
        <View style={styles.cardActions}>
          <TouchableOpacity style={styles.btnEdit} onPress={() => openEdit(item)}>
            <Text style={styles.btnEditText}>Editar</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.btnDelete} onPress={() => handleDelete(item)}>
            <Text style={styles.btnDeleteText}>Eliminar</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  // Fila simplificada para el modo "editar orden": sin Editar/Eliminar (para no permitir
  // tocar el banner a mitad de un reordenamiento), mantener presionado el "☰" para agarrarla
  // y arrastrarla a la posición deseada.
  const renderReorderItem = ({ item, drag, isActive }: RenderItemParams<Banner>) => (
    <TouchableOpacity
      style={[styles.reorderRow, isActive && styles.reorderRowActive]}
      onLongPress={drag}
      disabled={isActive}
      activeOpacity={0.8}
    >
      {item.imageUrl ? (
        <Image source={{ uri: item.imageUrl }} style={styles.reorderThumb} />
      ) : (
        <View style={[styles.reorderThumb, styles.cardImagePlaceholder]} />
      )}
      <Text style={styles.reorderTitle} numberOfLines={1}>{item.title}</Text>
      <Text style={styles.reorderHandle}>☰</Text>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#3b82f6" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.topBar}>
        {reorderMode ? (
          <>
            <Text style={styles.count}>Arrastrá para reordenar</Text>
            <View style={styles.reorderActions}>
              <TouchableOpacity
                style={styles.btnCancelOrder}
                onPress={cancelReorder}
                disabled={savingOrder}
              >
                <Text style={styles.btnCancelOrderText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.btnConfirmOrder}
                onPress={confirmReorder}
                disabled={savingOrder}
              >
                {savingOrder ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <Text style={styles.btnConfirmOrderText}>Confirmar</Text>
                )}
              </TouchableOpacity>
            </View>
          </>
        ) : (
          <>
            <Text style={styles.count}>{banners.length} banner{banners.length !== 1 ? 's' : ''}</Text>
            <View style={styles.reorderActions}>
              {banners.length > 1 && (
                <TouchableOpacity style={styles.btnReorder} onPress={openReorder}>
                  <Text style={styles.btnReorderText}>Editar orden</Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity style={styles.btnCreate} onPress={openCreate}>
                <Text style={styles.btnCreateText}>+ Nuevo banner</Text>
              </TouchableOpacity>
            </View>
          </>
        )}
      </View>

      {reorderMode ? (
        <DraggableFlatList
          data={reorderedBanners}
          keyExtractor={(item) => String(item.id)}
          renderItem={renderReorderItem}
          onDragEnd={({ data }) => setReorderedBanners(data)}
          contentContainerStyle={styles.list}
        />
      ) : (
        <FlatList
          data={banners}
          keyExtractor={(item) => String(item.id)}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          ListEmptyComponent={
            <View style={styles.centered}>
              <Text style={styles.emptyText}>No hay banners. Creá el primero.</Text>
            </View>
          }
        />
      )}

      {/* Create / Edit Modal */}
      <Modal visible={modalVisible} animationType="slide" presentationStyle="pageSheet">
        <ScrollView contentContainerStyle={styles.modal}>
          <Text style={styles.modalTitle}>{editing ? 'Editar banner' : 'Nuevo banner'}</Text>

          <Text style={styles.label}>Título *</Text>
          <TextInput
            style={styles.input}
            value={form.title}
            onChangeText={(v) => setForm(f => ({ ...f, title: v }))}
            placeholder="Ej: Promoción de la semana"
          />

          <Text style={styles.label}>Subtítulo</Text>
          <TextInput
            style={styles.input}
            value={form.subtitle}
            onChangeText={(v) => setForm(f => ({ ...f, subtitle: v }))}
            placeholder="Ej: Hasta 30% de descuento"
          />

          <View style={styles.switchRow}>
            <Text style={styles.label}>Activo</Text>
            <Switch
              value={form.active}
              onValueChange={(v) => setForm(f => ({ ...f, active: v }))}
              trackColor={{ true: '#3b82f6', false: '#d1d5db' }}
            />
          </View>

          <Text style={styles.label}>Imagen</Text>
          {pendingImage ? (
            <Image source={{ uri: pendingImage.uri }} style={styles.previewImage} />
          ) : editing?.imageUrl ? (
            <Image source={{ uri: editing.imageUrl }} style={styles.previewImage} />
          ) : null}
          <TouchableOpacity style={styles.btnImage} onPress={pickImage}>
            <Text style={styles.btnImageText}>
              {pendingImage || editing?.imageUrl ? 'Cambiar imagen' : 'Seleccionar imagen'}
            </Text>
          </TouchableOpacity>

          <View style={styles.modalActions}>
            <TouchableOpacity
              style={styles.btnCancel}
              onPress={() => setModalVisible(false)}
              disabled={saving}
            >
              <Text style={styles.btnCancelText}>Cancelar</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.btnSave} onPress={handleSave} disabled={saving}>
              {saving ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.btnSaveText}>Guardar</Text>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb' },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  topBar: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 16, paddingVertical: 12, backgroundColor: '#fff',
    borderBottomWidth: 1, borderBottomColor: '#e5e7eb',
  },
  count: { fontSize: 14, color: '#6b7280' },
  reorderActions: { flexDirection: 'row', gap: 8 },
  btnCreate: {
    backgroundColor: '#3b82f6', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 8,
  },
  btnCreateText: { color: '#fff', fontWeight: '600', fontSize: 14 },
  btnReorder: {
    backgroundColor: '#eff6ff', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 8,
  },
  btnReorderText: { color: '#3b82f6', fontWeight: '600', fontSize: 14 },
  btnCancelOrder: {
    borderWidth: 1, borderColor: '#d1d5db', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 8,
  },
  btnCancelOrderText: { color: '#6b7280', fontWeight: '600', fontSize: 14 },
  btnConfirmOrder: {
    backgroundColor: '#22c55e', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 8, minWidth: 90, alignItems: 'center',
  },
  btnConfirmOrderText: { color: '#fff', fontWeight: '700', fontSize: 14 },
  list: { padding: 16, gap: 12 },
  emptyText: { color: '#9ca3af', fontSize: 15 },

  // Reorder mode row
  reorderRow: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: '#fff', borderRadius: 12, padding: 10,
    borderWidth: 1, borderColor: '#e5e7eb',
  },
  reorderRowActive: {
    borderColor: '#3b82f6', elevation: 4,
    shadowColor: '#000', shadowOpacity: 0.15, shadowRadius: 6, shadowOffset: { width: 0, height: 3 },
  },
  reorderThumb: { width: 48, height: 48, borderRadius: 8 },
  reorderTitle: { flex: 1, fontSize: 14, fontWeight: '600', color: '#1f2937' },
  reorderHandle: { fontSize: 18, color: '#9ca3af' },

  // Card
  card: {
    backgroundColor: '#fff', borderRadius: 12,
    overflow: 'hidden', elevation: 2,
    shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 4, shadowOffset: { width: 0, height: 2 },
  },
  cardImage: { width: '100%', height: 120 },
  cardImagePlaceholder: {
    width: '100%', height: 120, backgroundColor: '#e5e7eb',
    justifyContent: 'center', alignItems: 'center',
  },
  cardImagePlaceholderText: { color: '#9ca3af', fontSize: 13 },
  cardBody: { padding: 12 },
  cardHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 },
  cardTitle: { fontSize: 15, fontWeight: '600', color: '#1f2937', flex: 1, marginRight: 8 },
  badge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 12 },
  badgeActive: { backgroundColor: '#dcfce7' },
  badgeInactive: { backgroundColor: '#f3f4f6' },
  badgeText: { fontSize: 11, fontWeight: '600', color: '#374151' },
  cardSubtitle: { fontSize: 13, color: '#6b7280', marginBottom: 4 },
  cardActions: { flexDirection: 'row', gap: 8 },
  btnEdit: {
    flex: 1, paddingVertical: 8, borderRadius: 8,
    backgroundColor: '#eff6ff', alignItems: 'center',
  },
  btnEditText: { color: '#3b82f6', fontWeight: '600', fontSize: 13 },
  btnDelete: {
    flex: 1, paddingVertical: 8, borderRadius: 8,
    backgroundColor: '#fef2f2', alignItems: 'center',
  },
  btnDeleteText: { color: '#ef4444', fontWeight: '600', fontSize: 13 },

  // Modal
  modal: { padding: 24, paddingBottom: 48 },
  modalTitle: { fontSize: 20, fontWeight: '700', color: '#1f2937', marginBottom: 20 },
  label: { fontSize: 13, fontWeight: '600', color: '#374151', marginBottom: 6, marginTop: 12 },
  input: {
    borderWidth: 1, borderColor: '#d1d5db', borderRadius: 8,
    paddingHorizontal: 12, paddingVertical: 10, fontSize: 15, color: '#1f2937',
    backgroundColor: '#fff',
  },
  switchRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    marginTop: 12,
  },
  previewImage: {
    width: '100%', height: 140, borderRadius: 8,
    marginTop: 8, marginBottom: 8, resizeMode: 'cover',
  },
  btnImage: {
    borderWidth: 1, borderColor: '#3b82f6', borderRadius: 8,
    paddingVertical: 10, alignItems: 'center', marginTop: 4,
  },
  btnImageText: { color: '#3b82f6', fontWeight: '600', fontSize: 14 },
  modalActions: { flexDirection: 'row', gap: 12, marginTop: 28 },
  btnCancel: {
    flex: 1, paddingVertical: 12, borderRadius: 8,
    borderWidth: 1, borderColor: '#d1d5db', alignItems: 'center',
  },
  btnCancelText: { color: '#6b7280', fontWeight: '600', fontSize: 15 },
  btnSave: {
    flex: 1, paddingVertical: 12, borderRadius: 8,
    backgroundColor: '#3b82f6', alignItems: 'center',
  },
  btnSaveText: { color: '#fff', fontWeight: '700', fontSize: 15 },
});
