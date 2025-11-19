/**
 * DateSelector Component
 * 
 * Componente para seleccionar una fecha usando el date picker nativo
 * de iOS y Android.
 * 
 * @module presentation/rutas/components/DateSelector
 */

import React, { useState } from 'react';
import { Platform, Pressable, StyleSheet, View } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { ThemedText } from '@/presentation/theme/components/ThemedText';
import { formatFechaLarga } from '@/core/rutas/interface/ruta';
import { useTranslation } from '@/presentation/i18n/hooks/useTranslation';

interface DateSelectorProps {
  selectedDate: Date;
  onDateChange: (date: Date) => void;
}

export const DateSelector: React.FC<DateSelectorProps> = ({
  selectedDate,
  onDateChange,
}) => {
  const { t, locale } = useTranslation();
  const [showPicker, setShowPicker] = useState(false);

  const handleDateChange = (event: any, date?: Date) => {
    // En Android, el picker se cierra automáticamente
    if (Platform.OS === 'android') {
      setShowPicker(false);
    }

    if (date) {
      onDateChange(date);
    }
  };

  const handlePress = () => {
    setShowPicker(true);
  };

  const handleClosePicker = () => {
    setShowPicker(false);
  };

  // Formatear la fecha para mostrar
  const year = selectedDate.getFullYear();
  const month = String(selectedDate.getMonth() + 1).padStart(2, '0');
  const day = String(selectedDate.getDate()).padStart(2, '0');
  const dateString = `${year}-${month}-${day}`;
  
  // Determinar locale para formato de fecha
  const dateLocale = locale === 'en' ? 'en-US' : 'es-ES';
  const formattedDate = formatFechaLarga(dateString, dateLocale);

  return (
    <View style={styles.container}>
      <ThemedText style={styles.label}>{t('routes.dateLabel')}</ThemedText>
      
      <Pressable 
        style={({ pressed }) => [
          styles.button,
          pressed && styles.buttonPressed
        ]}
        onPress={handlePress}
      >
        <View style={styles.buttonContent}>
          <ThemedText style={styles.icon}>📅</ThemedText>
          <ThemedText style={styles.dateText}>
            {formattedDate}
          </ThemedText>
        </View>
      </Pressable>

      {/* Date Picker nativo */}
      {showPicker && (
        <>
          {Platform.OS === 'ios' && (
            <View style={styles.iosPickerContainer}>
              <View style={styles.iosPickerHeader}>
                <Pressable onPress={handleClosePicker}>
                  <ThemedText style={styles.iosPickerButton}>
                    {locale === 'en' ? 'Done' : 'Listo'}
                  </ThemedText>
                </Pressable>
              </View>
              <DateTimePicker
                value={selectedDate}
                mode="date"
                display="spinner"
                onChange={handleDateChange}
                locale={dateLocale}
                style={styles.iosPicker}
              />
            </View>
          )}
          
          {Platform.OS === 'android' && (
            <DateTimePicker
              value={selectedDate}
              mode="date"
              display="default"
              onChange={handleDateChange}
              locale={dateLocale}
            />
          )}
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
    opacity: 0.7,
  },
  button: {
    backgroundColor: 'rgba(255, 149, 0, 0.1)',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#FF9500',
    padding: 16,
  },
  buttonPressed: {
    opacity: 0.7,
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    fontSize: 24,
    marginRight: 12,
  },
  dateText: {
    fontSize: 16,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  // iOS Picker Styles
  iosPickerContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -3,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
    zIndex: 1000,
  },
  iosPickerHeader: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  iosPickerButton: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FF9500',
  },
  iosPicker: {
    width: '100%',
    height: 200,
  },
});

