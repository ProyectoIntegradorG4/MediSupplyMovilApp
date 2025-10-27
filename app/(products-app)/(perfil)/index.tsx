import { useAuthStore } from '@/presentation/auth/store/useAuthStore';
import ThemedButton from '@/presentation/theme/components/ThemedButton';
import { ThemedText } from '@/presentation/theme/components/ThemedText';
import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

const PerfilScreen = () => {
  const { user, logout } = useAuthStore();

  return (
    <ScrollView 
      style={styles.container}
      contentContainerStyle={styles.scrollContent}
    >
      <View style={styles.header}>
        <ThemedText type="title" style={styles.nameText}>
          {user?.fullName || 'Usuario'}
        </ThemedText>
        <ThemedText style={styles.emailText}>
          {user?.email}
        </ThemedText>
        <View style={styles.roleBadge}>
          <ThemedText style={styles.roleText}>
            {user?.roles?.join(', ') || 'Sin rol'}
          </ThemedText>
        </View>
      </View>

      <View style={styles.content}>
        <ThemedText style={styles.sectionTitle}>Información Personal</ThemedText>
        
        <View style={styles.infoCard}>
          <ThemedText style={styles.infoLabel}>ID de Usuario</ThemedText>
          <ThemedText style={styles.infoValue}>{user?.id || 'N/A'}</ThemedText>
        </View>

        <View style={styles.infoCard}>
          <ThemedText style={styles.infoLabel}>Email</ThemedText>
          <ThemedText style={styles.infoValue}>{user?.email || 'N/A'}</ThemedText>
        </View>

        <View style={styles.infoCard}>
          <ThemedText style={styles.infoLabel}>Nombre Completo</ThemedText>
          <ThemedText style={styles.infoValue}>{user?.fullName || 'N/A'}</ThemedText>
        </View>

        <View style={styles.infoCard}>
          <ThemedText style={styles.infoLabel}>Roles</ThemedText>
          <ThemedText style={styles.infoValue}>
            {user?.roles?.join(', ') || 'N/A'}
          </ThemedText>
        </View>

        <ThemedText style={[styles.sectionTitle, { marginTop: 30 }]}>Configuración</ThemedText>

        <View style={styles.actionCard}>
          <ThemedText style={styles.actionTitle}>🔔 Notificaciones</ThemedText>
          <ThemedText style={styles.actionDescription}>
            Gestiona tus preferencias de notificaciones
          </ThemedText>
        </View>

        <View style={styles.actionCard}>
          <ThemedText style={styles.actionTitle}>🔒 Seguridad</ThemedText>
          <ThemedText style={styles.actionDescription}>
            Cambia tu contraseña y configura la seguridad
          </ThemedText>
        </View>

        <View style={styles.actionCard}>
          <ThemedText style={styles.actionTitle}>⚙️ Preferencias</ThemedText>
          <ThemedText style={styles.actionDescription}>
            Personaliza la aplicación según tus necesidades
          </ThemedText>
        </View>

        <View style={styles.logoutContainer}>
          <ThemedButton 
            onPress={logout}
            icon="log-out-outline"
          >
            Cerrar Sesión
          </ThemedButton>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100, // Espacio para el BottomNav
  },
  header: {
    padding: 20,
    paddingTop: 16,
    alignItems: 'center',
    backgroundColor: 'rgba(0, 122, 255, 0.05)',
  },
  nameText: {
    marginTop: 10,
  },
  emailText: {
    fontSize: 16,
    marginTop: 8,
    opacity: 0.7,
  },
  roleBadge: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
    marginTop: 12,
  },
  roleText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#FFF',
  },
  content: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  infoCard: {
    backgroundColor: 'rgba(0, 122, 255, 0.05)',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#007AFF',
  },
  infoLabel: {
    fontSize: 12,
    fontWeight: 'bold',
    opacity: 0.6,
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  infoValue: {
    fontSize: 16,
    fontWeight: '500',
  },
  actionCard: {
    backgroundColor: 'rgba(142, 142, 147, 0.05)',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  actionDescription: {
    fontSize: 14,
    opacity: 0.7,
    lineHeight: 20,
  },
  logoutContainer: {
    marginTop: 30,
    marginBottom: 20,
  },
});

export default PerfilScreen;

