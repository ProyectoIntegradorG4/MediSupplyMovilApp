/**
 * Componente para subir evidencias (fotos/videos) a una visita
 * HU-MOV-006: Cargar evidencia con comentario
 * 
 * @module presentation/visits/components/EvidenceUploader
 */

import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  Pressable,
  TextInput,
  Alert,
  ActivityIndicator,
  Image,
  Platform,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { ThemedText } from '@/presentation/theme/components/ThemedText';
import { useThemeColor } from '@/presentation/theme/hooks/useThemeColor';
import { useTranslation } from '@/presentation/i18n/hooks/useTranslation';
import { uploadVisitEvidence } from '@/core/visits/actions/visits-actions';

interface EvidenceUploaderProps {
  visitId: number;
  onUploadSuccess?: () => void;
  onCancel?: () => void;
}

interface SelectedFile {
  uri: string;
  type: string;
  name: string;
}

const EvidenceUploader: React.FC<EvidenceUploaderProps> = ({
  visitId,
  onUploadSuccess,
  onCancel,
}) => {
  const { t } = useTranslation();
  const primaryColor = useThemeColor({}, 'primary');
  const textColor = useThemeColor({}, 'text');
  const backgroundColor = useThemeColor({}, 'background');
  const borderColor = useThemeColor({}, 'border');

  const [selectedFile, setSelectedFile] = useState<SelectedFile | null>(null);
  const [comment, setComment] = useState('');
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const requestPermissions = async () => {
    if (Platform.OS !== 'web') {
      const { status: cameraStatus } = await ImagePicker.requestCameraPermissionsAsync();
      const { status: mediaStatus } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (cameraStatus !== 'granted' || mediaStatus !== 'granted') {
        Alert.alert(
          'Permisos requeridos',
          'Necesitamos permisos de cámara y galería para subir evidencias.',
          [{ text: 'OK' }]
        );
        return false;
      }
    }
    return true;
  };

  const handleTakePhoto = async () => {
    const hasPermission = await requestPermissions();
    if (!hasPermission) return;

    try {
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.All,
        allowsEditing: true,
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        const asset = result.assets[0];
        setSelectedFile({
          uri: asset.uri,
          type: asset.type || 'image/jpeg',
          name: asset.fileName || `photo_${Date.now()}.jpg`,
        });
        setError(null);
      }
    } catch (err) {
      console.error('Error al tomar foto:', err);
      Alert.alert('Error', 'No se pudo tomar la foto. Por favor intenta de nuevo.');
    }
  };

  const handleRecordVideo = async () => {
    const hasPermission = await requestPermissions();
    if (!hasPermission) return;

    try {
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Videos,
        allowsEditing: true,
        quality: 0.5, // Calidad reducida para videos (0.0 a 1.0)
        videoQuality: 0, // 0 = Low (baja resolución), 1 = Medium, 2 = High
        videoMaxDuration: 60, // Máximo 60 segundos para mantener el tamaño bajo
      });

      if (!result.canceled && result.assets[0]) {
        const asset = result.assets[0];
        
        // Verificar tamaño del video si está disponible
        if (asset.fileSize) {
          const sizeMB = asset.fileSize / (1024 * 1024);
          if (sizeMB > 15) {
            Alert.alert(
              'Video muy grande',
              `El video pesa ${sizeMB.toFixed(2)}MB. El límite es 15MB. Por favor graba un video más corto o de menor calidad.`,
              [{ text: 'OK' }]
            );
            return;
          }
        }
        
        setSelectedFile({
          uri: asset.uri,
          type: asset.type || 'video/mp4',
          name: asset.fileName || `video_${Date.now()}.mp4`,
        });
        setError(null);
      }
    } catch (err) {
      console.error('Error al grabar video:', err);
      Alert.alert('Error', 'No se pudo grabar el video. Por favor intenta de nuevo.');
    }
  };

  const handleChooseFromGallery = async () => {
    const hasPermission = await requestPermissions();
    if (!hasPermission) return;

    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.All,
        allowsEditing: true,
        quality: 0.7, // Calidad media para balance entre calidad y tamaño
        videoQuality: 1, // 0 = Low, 1 = Medium, 2 = High (calidad media para videos seleccionados)
        videoMaxDuration: 120, // Máximo 2 minutos para videos de galería
      });

      if (!result.canceled && result.assets[0]) {
        const asset = result.assets[0];
        
        // Verificar tamaño del archivo si está disponible
        if (asset.fileSize) {
          const sizeMB = asset.fileSize / (1024 * 1024);
          if (sizeMB > 15) {
            const fileType = asset.type?.startsWith('video/') ? 'video' : 'archivo';
            Alert.alert(
              `${fileType === 'video' ? 'Video' : 'Archivo'} muy grande`,
              `El ${fileType} pesa ${sizeMB.toFixed(2)}MB. El límite es 15MB. Por favor selecciona un ${fileType} más pequeño.`,
              [{ text: 'OK' }]
            );
            return;
          }
        }
        
        setSelectedFile({
          uri: asset.uri,
          type: asset.type || 'image/jpeg',
          name: asset.fileName || `file_${Date.now()}.jpg`,
        });
        setError(null);
      }
    } catch (err) {
      console.error('Error al elegir de galería:', err);
      Alert.alert('Error', 'No se pudo acceder a la galería. Por favor intenta de nuevo.');
    }
  };

  const validateAndUpload = async () => {
    if (!selectedFile) {
      setError(t('visits.evidence.fileRequired'));
      return;
    }

    if (!comment.trim()) {
      setError(t('visits.evidence.commentRequired'));
      return;
    }

    // Validar tamaño (15MB máximo) - en todas las plataformas cuando sea posible
    try {
      let sizeMB = 0;
      
      if (Platform.OS === 'web') {
        // En web, podemos obtener el tamaño del blob
        const response = await fetch(selectedFile.uri);
        const blob = await response.blob();
        sizeMB = blob.size / (1024 * 1024);
      } else {
        // En móvil, intentar obtener el tamaño del archivo usando FileSystem
        // Nota: expo-image-picker puede proporcionar fileSize en algunos casos
        // Por ahora, validamos solo en web y confiamos en las configuraciones de calidad
        // para mantener los archivos pequeños
      }
      
      if (sizeMB > 15) {
        setError(t('visits.evidence.fileTooLarge'));
        Alert.alert(
          'Archivo muy grande',
          `El archivo pesa ${sizeMB.toFixed(2)}MB. El límite es 15MB. Por favor selecciona un archivo más pequeño o graba un video más corto.`,
          [{ text: 'OK' }]
        );
        return;
      }
    } catch (err) {
      console.warn('No se pudo verificar el tamaño del archivo:', err);
      // Continuar con el upload si no podemos verificar el tamaño
    }

    try {
      setUploading(true);
      setError(null);

      await uploadVisitEvidence(visitId, selectedFile, comment.trim());

      Alert.alert(
        t('visits.evidence.uploadSuccess'),
        '',
        [
          {
            text: t('common.close'),
            onPress: () => {
              setSelectedFile(null);
              setComment('');
              onUploadSuccess?.();
            },
          },
        ]
      );
    } catch (err) {
      console.error('Error al subir evidencia:', err);
      const errorMessage = err instanceof Error ? err.message : t('visits.evidence.uploadFailed');
      setError(errorMessage);
      Alert.alert(t('common.error'), errorMessage);
    } finally {
      setUploading(false);
    }
  };

  return (
    <View style={styles.container}>
      <ThemedText style={styles.title}>{t('visits.evidence.title')}</ThemedText>

      {/* Action Buttons */}
      {!selectedFile && (
        <View style={styles.actionButtons}>
          <Pressable
            onPress={handleTakePhoto}
            style={[styles.actionButton, { backgroundColor, borderColor }]}
          >
            <Ionicons name="camera" size={24} color={primaryColor} />
            <ThemedText style={[styles.actionButtonText, { color: textColor }]}>
              {t('visits.evidence.takePhoto')}
            </ThemedText>
          </Pressable>

          <Pressable
            onPress={handleRecordVideo}
            style={[styles.actionButton, { backgroundColor, borderColor }]}
          >
            <Ionicons name="videocam" size={24} color={primaryColor} />
            <ThemedText style={[styles.actionButtonText, { color: textColor }]}>
              {t('visits.evidence.recordVideo')}
            </ThemedText>
          </Pressable>

          <Pressable
            onPress={handleChooseFromGallery}
            style={[styles.actionButton, { backgroundColor, borderColor }]}
          >
            <Ionicons name="images" size={24} color={primaryColor} />
            <ThemedText style={[styles.actionButtonText, { color: textColor }]}>
              {t('visits.evidence.chooseFromGallery')}
            </ThemedText>
          </Pressable>
        </View>
      )}

      {/* Preview */}
      {selectedFile && (
        <View style={styles.previewContainer}>
          {selectedFile.type.startsWith('image/') ? (
            <Image source={{ uri: selectedFile.uri }} style={styles.previewImage} />
          ) : (
            <View style={styles.videoPreview}>
              <Ionicons name="videocam" size={48} color={primaryColor} />
              <ThemedText style={styles.videoPreviewText}>Video seleccionado</ThemedText>
            </View>
          )}
          <Pressable
            onPress={() => setSelectedFile(null)}
            style={styles.removeButton}
          >
            <Ionicons name="close-circle" size={24} color="#FF3B30" />
          </Pressable>
        </View>
      )}

      {/* Comment Field */}
      <View style={styles.commentContainer}>
        <ThemedText style={styles.label}>{t('visits.evidence.comment')} *</ThemedText>
        <TextInput
          style={[
            styles.commentInput,
            { backgroundColor, borderColor, color: textColor },
            error && !comment.trim() && styles.inputError,
          ]}
          value={comment}
          onChangeText={(text) => {
            setComment(text);
            if (error) setError(null);
          }}
          placeholder={t('visits.evidence.commentPlaceholder')}
          placeholderTextColor="#999"
          multiline
          numberOfLines={4}
          textAlignVertical="top"
        />
      </View>

      {/* Error Message */}
      {error && (
        <ThemedText style={styles.errorText}>{error}</ThemedText>
      )}

      {/* Upload Button */}
      {selectedFile && (
        <Pressable
          onPress={validateAndUpload}
          disabled={uploading || !comment.trim()}
          style={[
            styles.uploadButton,
            { backgroundColor: primaryColor },
            (uploading || !comment.trim()) && styles.uploadButtonDisabled,
          ]}
        >
          {uploading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <>
              <ThemedText style={styles.uploadButtonText}>
                {t('visits.evidence.upload')}
              </ThemedText>
              <Ionicons name="cloud-upload-outline" size={20} color="#FFFFFF" />
            </>
          )}
        </Pressable>
      )}

      {/* Cancel Button */}
      {onCancel && (
        <Pressable
          onPress={onCancel}
          style={[styles.cancelButton, { borderColor }]}
        >
          <ThemedText style={[styles.cancelButtonText, { color: textColor }]}>
            {t('common.cancel')}
          </ThemedText>
        </Pressable>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  actionButtons: {
    gap: 12,
    marginBottom: 20,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: '500',
  },
  previewContainer: {
    position: 'relative',
    marginBottom: 20,
    borderRadius: 12,
    overflow: 'hidden',
  },
  previewImage: {
    width: '100%',
    height: 200,
    resizeMode: 'cover',
  },
  videoPreview: {
    width: '100%',
    height: 200,
    backgroundColor: '#F0F0F0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  videoPreviewText: {
    marginTop: 8,
    fontSize: 14,
    opacity: 0.7,
  },
  removeButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 12,
  },
  commentContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  commentInput: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    minHeight: 100,
  },
  inputError: {
    borderColor: '#FF3B30',
  },
  errorText: {
    fontSize: 14,
    color: '#FF3B30',
    marginBottom: 12,
  },
  uploadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  uploadButtonDisabled: {
    opacity: 0.6,
  },
  uploadButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
  cancelButton: {
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '500',
  },
});

export default EvidenceUploader;

