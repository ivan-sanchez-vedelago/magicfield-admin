import React, { useState, useEffect } from 'react';
import {
  View,
  TouchableOpacity,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  ActivityIndicator,
  Alert,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';

export interface ImageUploadResult {
  uri: string;
  name: string;
  type: string;
}

export interface ImageUploaderProps {
  onImagesSelected: (images: ImageUploadResult[]) => void;
  maxImages?: number;
  multiple?: boolean;
  selectedImages?: ImageUploadResult[];
  readonly?: boolean;
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({
  onImagesSelected,
  maxImages = 5,
  multiple = true,
  selectedImages: externalImages = [],
  readonly = false,
}) => {
  const [selectedImages, setSelectedImages] = useState<ImageUploadResult[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setSelectedImages(externalImages);
  }, [externalImages]);

  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [5, 7],
        quality: 0.8,
      });

      if (!result.canceled) {
        const newImages: ImageUploadResult[] = result.assets.map((asset) => ({
          uri: asset.uri,
          name: asset.fileName || `image_${Date.now()}.jpg`,
          type: 'image/jpeg',
        }));

        const combinedImages = [...selectedImages, ...newImages].slice(
          0,
          maxImages
        );
        setSelectedImages(combinedImages);
        onImagesSelected(combinedImages);

        if (combinedImages.length >= maxImages) {
          Alert.alert(
            'Límite alcanzado',
            `Se ha alcanzado el límite de ${maxImages} imágenes` 
          );
        }
      }
    } catch (error) {
      Alert.alert('Error', 'No se pudo acceder a la galería de imágenes');
      console.error('Image picker error:', error);
    }
  };

  const removeImage = (index: number) => {
    const updatedImages = selectedImages.filter((_, i) => i !== index);
    setSelectedImages(updatedImages);
    onImagesSelected(updatedImages);
  };

  const canAddMore = selectedImages.length < maxImages;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Imágenes del Producto</Text>
        <Text style={styles.counter}>
          {selectedImages.length}/{maxImages}
        </Text>
      </View>

      {selectedImages.length > 0 && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.imageList}
        >
          {selectedImages.map((image, index) => (
            <View key={index} style={styles.imageItem}>
              <Image
                source={{ uri: image.uri }}
                style={styles.image}
                resizeMode="cover"
              />
              {!readonly && (
                <TouchableOpacity
                  style={styles.removeButton}
                  onPress={() => removeImage(index)}
                >
                  <Text style={styles.removeButtonText}>✕</Text>
                </TouchableOpacity>
              )}
            </View>
          ))}
        </ScrollView>
      )}

      {canAddMore && !readonly && (
        <TouchableOpacity
          style={styles.uploadButton}
          onPress={pickImage}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#3b82f6" size="large" />
          ) : (
            <>
              <Text style={styles.uploadIcon}>📷</Text>
              <Text style={styles.uploadText}>
                {selectedImages.length === 0
                  ? 'Seleccionar Imágenes'
                  : 'Agregar Más'}
              </Text>
            </>
          )}
        </TouchableOpacity>
      )}

      {!canAddMore && (
        <View style={styles.maxReachedMessage}>
          <Text style={styles.maxReachedText}>
            Has alcanzado el límite de {maxImages} imágenes
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  title: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
  },
  counter: {
    fontSize: 12,
    color: '#9ca3af',
    fontWeight: '600',
  },
  imageList: {
    marginBottom: 12,
    height: 120,
  },
  imageItem: {
    marginRight: 12,
    borderRadius: 8,
    overflow: 'hidden',
    position: 'relative',
  },
  image: {
    width: 100,
    height: 100,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  removeButton: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#ef4444',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#fff',
  },
  removeButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  uploadButton: {
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: '#3b82f6',
    borderRadius: 8,
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#eff6ff',
  },
  uploadIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  uploadText: {
    color: '#3b82f6',
    fontWeight: '600',
    fontSize: 14,
  },
  maxReachedMessage: {
    backgroundColor: '#fef2f2',
    borderRadius: 8,
    padding: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#ef4444',
  },
  maxReachedText: {
    color: '#991b1b',
    fontSize: 13,
    fontWeight: '500',
  },
});
