/**
 * Pantalla de Registro de Visita
 * HU-MOV-004: Formulario para registrar una visita a un cliente
 * 
 * @module app/(products-app)/(clientes)/register-visit
 */

import React, { useState, useEffect } from 'react';
import {
  ScrollView,
  StyleSheet,
  View,
  TextInput,
  Pressable,
  ActivityIndicator,
  Alert,
  Platform,
  Modal,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { ThemedText } from '@/presentation/theme/components/ThemedText';
import { ThemedView } from '@/presentation/theme/components/ThemedView';
import { useThemeColor } from '@/presentation/theme/hooks/useThemeColor';
import { useTranslation } from '@/presentation/i18n/hooks/useTranslation';
import { createVisit } from '@/core/visits/actions/visits-actions';
import { fetchClienteDetail } from '@/core/clientes/actions/clientes-actions';
import { Cliente } from '@/core/clientes/interface/cliente';
import { TipoVisita } from '@/core/visits/interface/visit';

const RegisterVisitScreen = () => {
  const { t } = useTranslation();
  const router = useRouter();
  const { clienteId } = useLocalSearchParams<{ clienteId: string }>();
  
  const primaryColor = useThemeColor({}, 'primary');
  const textColor = useThemeColor({}, 'text');
  const backgroundColor = useThemeColor({}, 'background');
  const borderColor = useThemeColor({}, 'border');

  const [cliente, setCliente] = useState<Cliente | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  // Form fields
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [contactoNombre, setContactoNombre] = useState('');
  const [tipoVisita, setTipoVisita] = useState<TipoVisita | ''>('');
  const [objetivoVisita, setObjetivoVisita] = useState('');
  const [observaciones, setObservaciones] = useState('');

  // Validation errors
  const [errors, setErrors] = useState<{
    contactoNombre?: string;
    tipoVisita?: string;
    objetivoVisita?: string;
    date?: string;
    time?: string;
  }>({});

  // Modal state
  const [showTipoVisitaModal, setShowTipoVisitaModal] = useState(false);

  const tiposVisitaOptions: TipoVisita[] = [
    'Seguimiento',
    'Presentación',
    'Soporte técnico',
    'Reunión comercial',
    'Capacitación',
    'Otro',
  ];

  // Initialize date/time with current values
  useEffect(() => {
    const now = new Date();
    const dateStr = now.toISOString().split('T')[0]; // YYYY-MM-DD
    const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`; // HH:MM
    setDate(dateStr);
    setTime(timeStr);
  }, []);

  // Load cliente data
  useEffect(() => {
    if (clienteId) {
      loadCliente();
    }
  }, [clienteId]);

  const loadCliente = async () => {
    if (!clienteId) return;
    
    try {
      setLoading(true);
      const clienteData = await fetchClienteDetail(parseInt(clienteId));
      setCliente(clienteData);
    } catch (error) {
      console.error('Error al cargar cliente:', error);
      Alert.alert(
        t('common.error'),
        error instanceof Error ? error.message : t('clients.error.loadFailed'),
        [{ text: t('common.close'), onPress: () => router.back() }]
      );
    } finally {
      setLoading(false);
    }
  };

  const validateForm = (): boolean => {
    const newErrors: typeof errors = {};

    if (!contactoNombre.trim()) {
      newErrors.contactoNombre = t('visits.errors.contactoNombreRequired');
    }
    if (!tipoVisita) {
      newErrors.tipoVisita = t('visits.errors.tipoVisitaRequired');
    }
    if (!objetivoVisita.trim()) {
      newErrors.objetivoVisita = t('visits.errors.objetivoVisitaRequired');
    }
    if (!date) {
      newErrors.date = 'La fecha es obligatoria';
    }
    if (!time) {
      newErrors.time = 'La hora es obligatoria';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm() || !clienteId) return;

    try {
      setSaving(true);
      
      const visitData = {
        client_id: parseInt(clienteId),
        date,
        time,
        contacto_nombre: contactoNombre.trim(),
        tipo_visita: tipoVisita,
        objetivo_visita: objetivoVisita.trim(),
        observaciones: observaciones.trim() || undefined,
      };

      const response = await createVisit(visitData);
      
      // Después de crear la visita, preguntar si quiere agregar evidencia
      Alert.alert(
        t('visits.success.visitCreated'),
        t('visits.success.visitCreatedMessage'),
        [
          {
            text: t('visits.form.addEvidence'),
            onPress: () => {
              // Navegar al detalle de la visita y mostrar el uploader automáticamente
              router.push({
                pathname: `/(products-app)/(visits)/${response.id}`,
                params: { showUploader: 'true' },
              });
            },
          },
          {
            text: t('common.close'),
            style: 'cancel',
            onPress: () => {
              router.back();
            },
          },
        ]
      );
    } catch (error) {
      console.error('Error al crear visita:', error);
      Alert.alert(
        t('visits.errors.createFailed'),
        error instanceof Error ? error.message : t('visits.errors.networkError')
      );
    } finally {
      setSaving(false);
    }
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

  if (!cliente) {
    return (
      <ThemedView style={styles.container}>
        <View style={styles.errorContainer}>
          <ThemedText style={styles.errorText}>Cliente no encontrado</ThemedText>
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
          <ThemedText style={styles.title}>{t('visits.form.title')}</ThemedText>
          <ThemedText style={styles.subtitle}>{cliente.nombre_comercial}</ThemedText>
        </View>

        {/* Form Fields */}
        <View style={styles.formContainer}>
          {/* Cliente (readonly) */}
          <View style={styles.fieldContainer}>
            <ThemedText style={styles.label}>{t('visits.form.client')}</ThemedText>
            <View style={[styles.readonlyField, { backgroundColor, borderColor }]}>
              <ThemedText style={styles.readonlyText}>{cliente.nombre_comercial}</ThemedText>
            </View>
          </View>

          {/* Date and Time Row */}
          <View style={styles.row}>
            <View style={[styles.fieldContainer, styles.halfWidth]}>
              <ThemedText style={styles.label}>{t('visits.form.date')} *</ThemedText>
              <TextInput
                style={[
                  styles.input,
                  { backgroundColor, borderColor, color: textColor },
                  errors.date && styles.inputError,
                ]}
                value={date}
                onChangeText={setDate}
                placeholder="YYYY-MM-DD"
                placeholderTextColor="#999"
              />
              {errors.date && (
                <ThemedText style={styles.errorText}>{errors.date}</ThemedText>
              )}
            </View>

            <View style={[styles.fieldContainer, styles.halfWidth]}>
              <ThemedText style={styles.label}>{t('visits.form.time')} *</ThemedText>
              <TextInput
                style={[
                  styles.input,
                  { backgroundColor, borderColor, color: textColor },
                  errors.time && styles.inputError,
                ]}
                value={time}
                onChangeText={setTime}
                placeholder="HH:MM"
                placeholderTextColor="#999"
              />
              {errors.time && (
                <ThemedText style={styles.errorText}>{errors.time}</ThemedText>
              )}
            </View>
          </View>

          {/* Persona contactada */}
          <View style={styles.fieldContainer}>
            <ThemedText style={styles.label}>{t('visits.form.contactoNombre')} *</ThemedText>
            <TextInput
              style={[
                styles.input,
                { backgroundColor, borderColor, color: textColor },
                errors.contactoNombre && styles.inputError,
              ]}
              value={contactoNombre}
              onChangeText={(text) => {
                setContactoNombre(text);
                if (errors.contactoNombre) {
                  setErrors({ ...errors, contactoNombre: undefined });
                }
              }}
              placeholder={t('visits.form.contactoNombrePlaceholder')}
              placeholderTextColor="#999"
            />
            {errors.contactoNombre && (
              <ThemedText style={styles.errorText}>{errors.contactoNombre}</ThemedText>
            )}
          </View>

          {/* Tipo de Visita */}
          <View style={styles.fieldContainer}>
            <ThemedText style={styles.label}>{t('visits.form.tipoVisita')} *</ThemedText>
            <Pressable
              onPress={() => setShowTipoVisitaModal(true)}
              style={[
                styles.pickerButton,
                { backgroundColor, borderColor },
                errors.tipoVisita && styles.inputError,
              ]}
            >
              <ThemedText style={[styles.pickerButtonText, { color: tipoVisita ? textColor : '#999' }]}>
                {tipoVisita ? t(`visits.form.tipos.${tipoVisita}`) : t('visits.form.tipoVisitaPlaceholder')}
              </ThemedText>
              <Ionicons name="chevron-down" size={20} color={textColor} />
            </Pressable>
            {errors.tipoVisita && (
              <ThemedText style={styles.errorText}>{errors.tipoVisita}</ThemedText>
            )}
          </View>

          {/* Tipo Visita Modal */}
          <Modal
            visible={showTipoVisitaModal}
            transparent
            animationType="slide"
            onRequestClose={() => setShowTipoVisitaModal(false)}
          >
            <View style={styles.modalOverlay}>
              <View style={[styles.modalContent, { backgroundColor }]}>
                <View style={styles.modalHeader}>
                  <ThemedText style={styles.modalTitle}>{t('visits.form.tipoVisita')}</ThemedText>
                  <Pressable onPress={() => setShowTipoVisitaModal(false)}>
                    <Ionicons name="close" size={24} color={textColor} />
                  </Pressable>
                </View>
                <ScrollView>
                  {tiposVisitaOptions.map((tipo) => (
                    <Pressable
                      key={tipo}
                      onPress={() => {
                        setTipoVisita(tipo);
                        setShowTipoVisitaModal(false);
                        if (errors.tipoVisita) {
                          setErrors({ ...errors, tipoVisita: undefined });
                        }
                      }}
                      style={[
                        styles.modalOption,
                        tipoVisita === tipo && { backgroundColor: primaryColor + '20' },
                      ]}
                    >
                      <ThemedText style={styles.modalOptionText}>
                        {t(`visits.form.tipos.${tipo}`)}
                      </ThemedText>
                      {tipoVisita === tipo && (
                        <Ionicons name="checkmark" size={20} color={primaryColor} />
                      )}
                    </Pressable>
                  ))}
                </ScrollView>
              </View>
            </View>
          </Modal>

          {/* Propósito de la Visita */}
          <View style={styles.fieldContainer}>
            <ThemedText style={styles.label}>{t('visits.form.objetivoVisita')} *</ThemedText>
            <TextInput
              style={[
                styles.textArea,
                { backgroundColor, borderColor, color: textColor },
                errors.objetivoVisita && styles.inputError,
              ]}
              value={objetivoVisita}
              onChangeText={(text) => {
                setObjetivoVisita(text);
                if (errors.objetivoVisita) {
                  setErrors({ ...errors, objetivoVisita: undefined });
                }
              }}
              placeholder={t('visits.form.objetivoVisitaPlaceholder')}
              placeholderTextColor="#999"
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
            {errors.objetivoVisita && (
              <ThemedText style={styles.errorText}>{errors.objetivoVisita}</ThemedText>
            )}
          </View>

          {/* Observaciones y Comentarios */}
          <View style={styles.fieldContainer}>
            <ThemedText style={styles.label}>{t('visits.form.observaciones')}</ThemedText>
            <TextInput
              style={[
                styles.textArea,
                { backgroundColor, borderColor, color: textColor },
              ]}
              value={observaciones}
              onChangeText={setObservaciones}
              placeholder={t('visits.form.observacionesPlaceholder')}
              placeholderTextColor="#999"
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          </View>
        </View>

        {/* Save Button */}
        <Pressable
          onPress={handleSave}
          disabled={saving}
          style={[
            styles.saveButton,
            { backgroundColor: primaryColor },
            saving && styles.saveButtonDisabled,
          ]}
        >
          {saving ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <>
              <ThemedText style={styles.saveButtonText}>{t('visits.form.save')}</ThemedText>
              <Ionicons name="save-outline" size={20} color="#FFFFFF" />
            </>
          )}
        </Pressable>
      </ScrollView>
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
    fontSize: 14,
    color: '#FF3B30',
    marginTop: 4,
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
  formContainer: {
    paddingHorizontal: 20,
  },
  fieldContainer: {
    marginBottom: 20,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  halfWidth: {
    flex: 1,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    minHeight: 45,
  },
  textArea: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    minHeight: 100,
  },
  readonlyField: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    minHeight: 45,
    justifyContent: 'center',
  },
  readonlyText: {
    fontSize: 16,
  },
  pickerButton: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    minHeight: 45,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  pickerButtonText: {
    fontSize: 16,
    flex: 1,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '70%',
    paddingBottom: 40,
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
  modalOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  modalOptionText: {
    fontSize: 16,
  },
  inputError: {
    borderColor: '#FF3B30',
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    marginHorizontal: 20,
    marginTop: 20,
    marginBottom: 40,
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
  backButton: {
    marginTop: 16,
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
});

export default RegisterVisitScreen;

