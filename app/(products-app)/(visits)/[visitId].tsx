/**
 * Pantalla de Detalle de Visita
 * HU-MOV-006: Ver visita con evidencias y agregar nuevas evidencias
 * 
 * @module app/(products-app)/(visits)/[visitId]
 */

import React, { useState, useEffect } from 'react';
import {
  ScrollView,
  StyleSheet,
  View,
  Pressable,
  ActivityIndicator,
  Image,
  Modal,
  Alert,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import * as Sharing from 'expo-sharing';
import { Ionicons } from '@expo/vector-icons';
import { ThemedText } from '@/presentation/theme/components/ThemedText';
import { ThemedView } from '@/presentation/theme/components/ThemedView';
import { useThemeColor } from '@/presentation/theme/hooks/useThemeColor';
import { useTranslation } from '@/presentation/i18n/hooks/useTranslation';
import { fetchVisitById } from '@/core/visits/actions/visits-actions';
import { Visit, formatVisitDateTime, isImageEvidence, isVideoEvidence } from '@/core/visits/interface/visit';
import EvidenceUploader from '@/presentation/visits/components/EvidenceUploader';
import VideoPlayer from '@/presentation/visits/components/VideoPlayer';

const VisitDetailScreen = () => {
  const { t, locale } = useTranslation();
  const router = useRouter();
  const { visitId, showUploader: showUploaderParam } = useLocalSearchParams<{ visitId: string; showUploader?: string }>();

  const primaryColor = useThemeColor({}, 'primary');
  const textColor = useThemeColor({}, 'text');
  const backgroundColor = useThemeColor({}, 'background');
  const borderColor = useThemeColor({}, 'border');

  const [visit, setVisit] = useState<Visit | null>(null);
  const [loading, setLoading] = useState(true);
  const [showUploader, setShowUploader] = useState(showUploaderParam === 'true');
  const [selectedEvidence, setSelectedEvidence] = useState<string | null>(null);
  const [selectedEvidenceType, setSelectedEvidenceType] = useState<'image' | 'video' | null>(null);

  useEffect(() => {
    if (visitId) {
      loadVisit();
    }
  }, [visitId]);

  // Si viene de crear visita, mostrar el uploader automáticamente después de cargar
  useEffect(() => {
    if (showUploaderParam === 'true' && visit && !loading) {
      // Pequeño delay para que la pantalla se cargue completamente
      setTimeout(() => {
        setShowUploader(true);
      }, 500);
    }
  }, [showUploaderParam, visit, loading]);

  const loadVisit = async () => {
    if (!visitId) return;

    try {
      setLoading(true);
      const visitData = await fetchVisitById(parseInt(visitId));
      setVisit(visitData);
    } catch (error) {
      console.error('Error al cargar visita:', error);
      Alert.alert(
        t('common.error'),
        error instanceof Error ? error.message : t('visits.errors.loadFailed'),
        [{ text: t('common.close'), onPress: () => router.back() }]
      );
    } finally {
      setLoading(false);
    }
  };

  const handleUploadSuccess = () => {
    setShowUploader(false);
    loadVisit(); // Reload visit to show new evidence
  };

  const handleShareRecommendations = async () => {
    if (!visit) return;

    try {
      const shareText = `
${t('visits.detail.title')} - ${formatVisitDateTime(visit.visit_datetime, locale)}

${t('visits.detail.contacto')}: ${visit.contacto_nombre || 'N/A'}
${t('visits.detail.tipo')}: ${visit.tipo_visita || 'N/A'}
${t('visits.detail.objetivo')}: ${visit.objetivo_visita || 'N/A'}

${t('visits.recommendations.title')}:
${t('visits.recommendations.processing')}
      `.trim();

      const isAvailable = await Sharing.isAvailableAsync();
      if (isAvailable) {
        await Sharing.shareAsync(shareText);
      } else {
        Alert.alert('Compartir no disponible', 'La función de compartir no está disponible en este dispositivo.');
      }
    } catch (error) {
      console.error('Error al compartir:', error);
      Alert.alert('Error', 'No se pudo compartir las recomendaciones.');
    }
  };

  const getEvidenceStatusText = () => {
    // Placeholder: Backend no implementa procesamiento aún
    return t('visits.detail.processing');
  };

  if (loading) {
    return (
      <ThemedView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={primaryColor} />
          <ThemedText style={styles.loadingText}>{t('common.loading')}</ThemedText>
        </View>
      </ThemedView>
    );
  }

  if (!visit) {
    return (
      <ThemedView style={styles.container}>
        <View style={styles.errorContainer}>
          <ThemedText style={styles.errorText}>Visita no encontrada</ThemedText>
          <Pressable onPress={() => router.back()} style={styles.backButton}>
            <ThemedText style={styles.backButtonText}>{t('common.close')}</ThemedText>
          </Pressable>
        </View>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <ThemedText style={styles.title}>{t('visits.detail.title')}</ThemedText>
          <ThemedText style={styles.subtitle}>
            {formatVisitDateTime(visit.visit_datetime, locale)}
          </ThemedText>
        </View>

        {/* Visit Information */}
        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>Información de la Visita</ThemedText>

          {visit.contacto_nombre && (
            <View style={styles.infoRow}>
              <Ionicons name="person" size={20} color={textColor} />
              <View style={styles.infoContent}>
                <ThemedText style={styles.infoLabel}>{t('visits.detail.contacto')}</ThemedText>
                <ThemedText style={styles.infoValue}>{visit.contacto_nombre}</ThemedText>
              </View>
            </View>
          )}

          {visit.tipo_visita && (
            <View style={styles.infoRow}>
              <Ionicons name="calendar" size={20} color={textColor} />
              <View style={styles.infoContent}>
                <ThemedText style={styles.infoLabel}>{t('visits.detail.tipo')}</ThemedText>
                <ThemedText style={styles.infoValue}>{visit.tipo_visita}</ThemedText>
              </View>
            </View>
          )}

          {visit.objetivo_visita && (
            <View style={styles.infoRow}>
              <Ionicons name="document-text" size={20} color={textColor} />
              <View style={styles.infoContent}>
                <ThemedText style={styles.infoLabel}>{t('visits.detail.objetivo')}</ThemedText>
                <ThemedText style={styles.infoValue}>{visit.objetivo_visita}</ThemedText>
              </View>
            </View>
          )}

          {visit.notes && (
            <View style={styles.infoRow}>
              <Ionicons name="chatbubble" size={20} color={textColor} />
              <View style={styles.infoContent}>
                <ThemedText style={styles.infoLabel}>{t('visits.detail.observaciones')}</ThemedText>
                <ThemedText style={styles.infoValue}>{visit.notes}</ThemedText>
              </View>
            </View>
          )}
        </View>

        {/* Evidences Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <ThemedText style={styles.sectionTitle}>{t('visits.detail.evidencias')}</ThemedText>
            <Pressable
              onPress={() => setShowUploader(true)}
              style={[styles.addButton, { backgroundColor: primaryColor }]}
            >
              <Ionicons name="add" size={20} color="#FFFFFF" />
              <ThemedText style={styles.addButtonText}>{t('visits.detail.addEvidence')}</ThemedText>
            </Pressable>
          </View>

          {visit.evidences.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Ionicons name="images-outline" size={48} color={textColor} style={{ opacity: 0.3 }} />
              <ThemedText style={styles.emptyText}>{t('visits.detail.noEvidences')}</ThemedText>
            </View>
          ) : (
            <View style={styles.evidencesGrid}>
              {visit.evidences.map((evidence) => (
                <Pressable
                  key={evidence.id}
                  onPress={() => {
                    setSelectedEvidence(evidence.url);
                    setSelectedEvidenceType(isImageEvidence(evidence) ? 'image' : 'video');
                  }}
                  style={[styles.evidenceCard, { backgroundColor, borderColor }]}
                >
                  {isImageEvidence(evidence) ? (
                    <Image source={{ uri: evidence.url }} style={styles.evidenceImage} />
                  ) : (
                    <View style={styles.videoThumbnail}>
                      <Ionicons name="videocam" size={32} color={primaryColor} />
                    </View>
                  )}
                  <View style={styles.evidenceFooter}>
                    <ThemedText style={styles.evidenceType}>
                      {isImageEvidence(evidence) ? 'Foto' : 'Video'}
                    </ThemedText>
                    <ThemedText style={styles.evidenceStatus}>
                      {getEvidenceStatusText()}
                    </ThemedText>
                  </View>
                </Pressable>
              ))}
            </View>
          )}
        </View>

        {/* Recommendations Section (Placeholder) */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <ThemedText style={styles.sectionTitle}>{t('visits.recommendations.title')}</ThemedText>
            <Pressable
              onPress={handleShareRecommendations}
              style={[styles.shareButton, { borderColor }]}
            >
              <Ionicons name="share-outline" size={20} color={textColor} />
              <ThemedText style={[styles.shareButtonText, { color: textColor }]}>
                {t('visits.recommendations.share')}
              </ThemedText>
            </Pressable>
          </View>
          <View style={styles.recommendationsPlaceholder}>
            <ThemedText style={styles.placeholderText}>
              {t('visits.recommendations.processing')}
            </ThemedText>
          </View>
        </View>
      </ScrollView>

      {/* Evidence Uploader Modal */}
      <Modal
        visible={showUploader}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowUploader(false)}
      >
        <ThemedView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <ThemedText style={styles.modalTitle}>{t('visits.evidence.title')}</ThemedText>
            <Pressable onPress={() => setShowUploader(false)}>
              <Ionicons name="close" size={24} color={textColor} />
            </Pressable>
          </View>
          <ScrollView>
            <EvidenceUploader
              visitId={parseInt(visitId || '0')}
              onUploadSuccess={handleUploadSuccess}
              onCancel={() => setShowUploader(false)}
            />
          </ScrollView>
        </ThemedView>
      </Modal>

      {/* Evidence Viewer Modal */}
      {selectedEvidenceType === 'video' ? (
        <VideoPlayer
          uri={selectedEvidence || ''}
          visible={selectedEvidence !== null}
          onClose={() => {
            setSelectedEvidence(null);
            setSelectedEvidenceType(null);
          }}
        />
      ) : (
        <Modal
          visible={selectedEvidence !== null && selectedEvidenceType === 'image'}
          transparent
          animationType="fade"
          onRequestClose={() => {
            setSelectedEvidence(null);
            setSelectedEvidenceType(null);
          }}
        >
          <View style={styles.imageViewerOverlay}>
            <Pressable
              style={styles.imageViewerClose}
              onPress={() => {
                setSelectedEvidence(null);
                setSelectedEvidenceType(null);
              }}
            >
              <Ionicons name="close" size={32} color="#FFFFFF" />
            </Pressable>
            {selectedEvidence && (
              <Image source={{ uri: selectedEvidence }} style={styles.fullImage} resizeMode="contain" />
            )}
          </View>
        </Modal>
      )}
    </ThemedView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: '#FF3B30',
    marginBottom: 16,
  },
  backButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: '#007AFF',
    borderRadius: 8,
  },
  backButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  header: {
    padding: 20,
    paddingTop: 16,
    paddingBottom: 12,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    opacity: 0.7,
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
    gap: 12,
  },
  infoContent: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 14,
    opacity: 0.7,
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 16,
    fontWeight: '500',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  addButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 16,
    opacity: 0.6,
    marginTop: 12,
  },
  evidencesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  evidenceCard: {
    width: '48%',
    borderRadius: 12,
    borderWidth: 1,
    overflow: 'hidden',
  },
  evidenceImage: {
    width: '100%',
    height: 150,
    resizeMode: 'cover',
  },
  videoThumbnail: {
    width: '100%',
    height: 150,
    backgroundColor: '#F0F0F0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  evidenceFooter: {
    padding: 8,
  },
  evidenceType: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 4,
  },
  evidenceStatus: {
    fontSize: 11,
    opacity: 0.6,
  },
  recommendationsPlaceholder: {
    padding: 20,
    borderRadius: 12,
    backgroundColor: '#F0F0F0',
    alignItems: 'center',
  },
  placeholderText: {
    fontSize: 14,
    opacity: 0.7,
  },
  shareButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
  },
  shareButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  modalContainer: {
    flex: 1,
    paddingTop: 60,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  imageViewerOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageViewerClose: {
    position: 'absolute',
    top: 50,
    right: 20,
    zIndex: 1,
  },
  fullImage: {
    width: '100%',
    height: '100%',
  },
});

export default VisitDetailScreen;

