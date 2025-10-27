import { useAuthStore } from '@/presentation/auth/store/useAuthStore';
import ClientCard from '@/presentation/theme/components/ClientCard';
import SearchBar from '@/presentation/theme/components/SearchBar';
import { ThemedText } from '@/presentation/theme/components/ThemedText';
import { ThemedView } from '@/presentation/theme/components/ThemedView';
import React, { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

// Datos simulados de clientes
const mockClientes = [
  {
    id: '1',
    name: 'Hospital San Rafael',
    address: 'Calle 45 #23-67, Bogotá',
    phone: '+57 310 456 7890',
    doctor: 'Dr. Carlos Méndez',
    lastVisit: '15/10/2025',
    type: 'Hospital' as const,
  },
  {
    id: '2',
    name: 'Farmacia Santa María',
    address: 'Av. El Dorado #89-23, Bogotá',
    phone: '+57 320 123 4567',
    doctor: 'Dra. Ana Rodríguez',
    lastVisit: '18/10/2025',
    type: 'Farmacia' as const,
  },
  {
    id: '3',
    name: 'Clínica Los Andes',
    address: 'Carrera 15 #123-45, Medellín',
    phone: '+57 315 789 0123',
    doctor: 'Dr. Luis García',
    lastVisit: '20/10/2025',
    type: 'Clinica' as const,
  },
  {
    id: '4',
    name: 'Hospital Universitario del Valle',
    address: 'Calle 5 #36-08, Cali',
    phone: '+57 318 234 5678',
    doctor: 'Dra. María Fernández',
    lastVisit: '22/10/2025',
    type: 'Hospital' as const,
  },
  {
    id: '5',
    name: 'Farmacia Vida Sana',
    address: 'Calle 72 #10-34, Bogotá',
    phone: '+57 312 345 6789',
    doctor: 'Dr. Pedro Ramírez',
    lastVisit: '23/10/2025',
    type: 'Farmacia' as const,
  },
  {
    id: '6',
    name: 'Clínica del Country',
    address: 'Carrera 16 #82-57, Bogotá',
    phone: '+57 317 890 1234',
    doctor: 'Dra. Laura Martínez',
    lastVisit: '25/10/2025',
    type: 'Clinica' as const,
  },
];

const ClientesScreen = () => {
  const { user } = useAuthStore();
  const [searchText, setSearchText] = useState('');

  // Filtrar clientes basado en la búsqueda
  const filteredClientes = mockClientes.filter(
    (cliente) =>
      cliente.name.toLowerCase().includes(searchText.toLowerCase()) ||
      cliente.address.toLowerCase().includes(searchText.toLowerCase()) ||
      cliente.doctor.toLowerCase().includes(searchText.toLowerCase()) ||
      cliente.type.toLowerCase().includes(searchText.toLowerCase())
  );

  const handleRegisterVisit = (clientName: string) => {
    console.log(`Registrar visita para: ${clientName}`);
    // Aquí puedes agregar la navegación o lógica para registrar visita
  };

  return (
    <ThemedView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <ThemedText style={styles.title}>Clientes</ThemedText>
          <ThemedText style={styles.subtitle}>
            {user?.fullName || user?.email}
          </ThemedText>
        </View>

        {/* Barra de búsqueda */}
        <View style={styles.searchContainer}>
          <SearchBar
            placeholder="Buscar cliente, dirección, doctor..."
            value={searchText}
            onChangeText={setSearchText}
            onSearch={setSearchText}
          />
        </View>

        {/* Contador de resultados */}
        <View style={styles.resultCountContainer}>
          <ThemedText style={styles.resultCount}>
            {filteredClientes.length} {filteredClientes.length === 1 ? 'cliente encontrado' : 'clientes encontrados'}
          </ThemedText>
        </View>

        {/* Lista de clientes */}
        <View style={styles.clientList}>
          {filteredClientes.length > 0 ? (
            filteredClientes.map((cliente) => (
              <ClientCard
                key={cliente.id}
                name={cliente.name}
                address={cliente.address}
                phone={cliente.phone}
                doctor={cliente.doctor}
                lastVisit={cliente.lastVisit}
                type={cliente.type}
                onRegisterVisit={() => handleRegisterVisit(cliente.name)}
              />
            ))
          ) : (
            <View style={styles.emptyContainer}>
              <ThemedText style={styles.emptyText}>
                No se encontraron clientes
              </ThemedText>
              <ThemedText style={styles.emptySubtext}>
                Intenta con otra búsqueda
              </ThemedText>
            </View>
          )}
        </View>
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
    paddingBottom: 100, // Espacio para el BottomNav
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
  searchContainer: {
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  resultCountContainer: {
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  resultCount: {
    fontSize: 14,
    opacity: 0.6,
    fontWeight: '500',
  },
  clientList: {
    paddingHorizontal: 20,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
    opacity: 0.6,
  },
  emptySubtext: {
    fontSize: 14,
    opacity: 0.4,
  },
});

export default ClientesScreen;
