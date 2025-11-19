import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useThemeColor } from '../hooks/useThemeColor';
import ClientCard from './ClientCard';
import { Cliente } from '@/core/clientes/interface/cliente';
import { useTranslation } from '@/presentation/i18n/hooks/useTranslation';

interface ClienteSelectorProps {
  clientes: Cliente[];
  selectedClienteId?: number;
  onSelectCliente: (cliente: Cliente) => void;
  isLoading?: boolean;
}

export default function ClienteSelector({
  clientes,
  selectedClienteId,
  onSelectCliente,
  isLoading = false,
}: ClienteSelectorProps) {
  const { t } = useTranslation();
  const primaryColor = useThemeColor({}, 'primary');
  const textColor = useThemeColor({}, 'text');
  const backgroundColor = useThemeColor({}, 'background');

  if (isLoading) {
    return (
      <View style={styles.container}>
        <Text style={[styles.title, { color: textColor }]}>{t('components.clientSelector.loading')}</Text>
      </View>
    );
  }

  if (clientes.length === 0) {
    return (
      <View style={styles.container}>
        <Ionicons name="people-outline" size={48} color={textColor + '60'} />
        <Text style={[styles.emptyText, { color: textColor }]}>
          {t('components.clientSelector.noClients')}
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={[styles.title, { color: textColor }]}>
        {t('components.clientSelector.title')}
      </Text>
      <Text style={[styles.subtitle, { color: textColor + '80' }]}>
        {t('components.clientSelector.subtitle')}
      </Text>

      <FlatList
        data={clientes}
        keyExtractor={(item) => item.cliente_id.toString()}
        renderItem={({ item }) => {
          const isSelected = selectedClienteId === item.cliente_id;

          return (
            <Pressable
              onPress={() => onSelectCliente(item)}
              style={({ pressed }) => [
                styles.cardWrapper,
                {
                  backgroundColor: isSelected ? primaryColor + '20' : 'transparent',
                  opacity: pressed ? 0.7 : 1,
                  borderColor: isSelected ? primaryColor : 'transparent',
                },
              ]}
            >
              <View style={styles.cardContainer}>
                <ClientCard
                  cliente={item}
                  onRegisterVisit={undefined}
                />
              </View>
              {isSelected && (
                <View style={[styles.selectedBadge, { backgroundColor: primaryColor }]}>
                  <Ionicons name="checkmark-circle" size={24} color="white" />
                  <Text style={styles.selectedText}>{t('components.clientSelector.selected')}</Text>
                </View>
              )}
            </Pressable>
          );
        }}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    marginBottom: 16,
  },
  listContent: {
    paddingBottom: 16,
  },
  cardWrapper: {
    marginBottom: 12,
    borderRadius: 12,
    borderWidth: 2,
    overflow: 'hidden',
  },
  cardContainer: {
    opacity: 1,
  },
  selectedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  selectedText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  emptyText: {
    fontSize: 16,
    textAlign: 'center',
    marginTop: 16,
    opacity: 0.7,
  },
});

