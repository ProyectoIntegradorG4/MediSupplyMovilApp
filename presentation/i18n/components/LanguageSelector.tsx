import React from 'react';
import { StyleSheet, View, TouchableOpacity } from 'react-native';
import { ThemedText } from '@/presentation/theme/components/ThemedText';
import { useLanguageStore } from '../store/useLanguageStore';
import { SupportedLocale, LOCALE_NAMES, SUPPORTED_LOCALES } from '@/core/i18n/types';
import { useTranslation } from '../hooks/useTranslation';

export function LanguageSelector() {
  const { locale, setLanguage } = useLanguageStore();
  const { t } = useTranslation();

  const handleLanguageChange = async (newLocale: SupportedLocale) => {
    if (newLocale !== locale) {
      await setLanguage(newLocale);
    }
  };

  return (
    <View style={styles.container}>
      <ThemedText style={styles.title}>
        🌐 {t('profile.language')}
      </ThemedText>
      <ThemedText style={styles.description}>
        {t('profile.languageDescription')}
      </ThemedText>
      
      <View style={styles.optionsContainer}>
        {SUPPORTED_LOCALES.map((lang) => (
          <TouchableOpacity
            key={lang}
            style={[
              styles.option,
              locale === lang && styles.optionSelected,
            ]}
            onPress={() => handleLanguageChange(lang)}
            activeOpacity={0.7}
          >
            <ThemedText
              style={[
                styles.optionText,
                locale === lang && styles.optionTextSelected,
              ]}
            >
              {LOCALE_NAMES[lang]}
            </ThemedText>
            {locale === lang && (
              <ThemedText style={styles.checkmark}>✓</ThemedText>
            )}
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  description: {
    fontSize: 14,
    opacity: 0.7,
    lineHeight: 20,
    marginBottom: 12,
  },
  optionsContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  option: {
    flex: 1,
    backgroundColor: 'rgba(142, 142, 147, 0.1)',
    padding: 12,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: 'transparent',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionSelected: {
    backgroundColor: 'rgba(0, 122, 255, 0.1)',
    borderColor: '#007AFF',
  },
  optionText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#000',
  },
  optionTextSelected: {
    fontWeight: 'bold',
    color: '#007AFF',
  },
  checkmark: {
    marginLeft: 6,
    fontSize: 16,
    color: '#007AFF',
    fontWeight: 'bold',
  },
});

