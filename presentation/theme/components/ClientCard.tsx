import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useThemeColor } from '../hooks/useThemeColor';
import { Cliente, TipoInstitucion } from '@/core/clientes/interface/cliente';

interface ClientCardProps {
    cliente: Cliente;
    onRegisterVisit?: () => void;
}

export default function ClientCard({
    cliente,
    onRegisterVisit,
}: ClientCardProps) {
    const primaryColor = useThemeColor({}, 'primary');
    const textColor = useThemeColor({}, 'text');
    const backgroundColor = useThemeColor({}, 'background');
    const borderColor = useThemeColor({}, 'border');

    // Construir dirección completa
    const fullAddress = [
        cliente.direccion,
        cliente.ciudad,
        cliente.departamento
    ].filter(Boolean).join(', ') || 'Sin dirección';

    // Formatear última actualización
    const lastUpdate = cliente.fecha_actualizacion 
        ? new Date(cliente.fecha_actualizacion).toLocaleDateString('es-ES', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
          })
        : 'Sin fecha';

    return (
        <View style={[styles.card, { backgroundColor: primaryColor + '0D' }]}>
            {/* Header con nombre y tipo */}
            <View style={styles.header}>
                <Text style={[styles.title, { color: textColor }]} numberOfLines={2}>
                    {cliente.nombre_comercial}
                </Text>
                <View
                    style={[
                        styles.typeBadge,
                        { backgroundColor, borderColor },
                    ]}
                >
                    <Text style={[styles.typeText, { color: primaryColor }]}>
                        {cliente.tipo_institucion}
                    </Text>
                </View>
            </View>

            {/* Información del cliente */}
            <View style={styles.infoContainer}>
                <View style={styles.infoRow}>
                    <Ionicons
                        name="location"
                        size={20}
                        color={textColor}
                        style={styles.icon}
                    />
                    <Text style={[styles.infoText, { color: textColor }]} numberOfLines={2}>
                        {fullAddress}
                    </Text>
                </View>

                {cliente.telefono && (
                    <View style={styles.infoRow}>
                        <Ionicons
                            name="call"
                            size={20}
                            color={textColor}
                            style={styles.icon}
                        />
                        <Text style={[styles.infoText, { color: textColor }]}>
                            {cliente.telefono}
                        </Text>
                    </View>
                )}

                {cliente.contacto_principal && (
                    <View style={styles.infoRow}>
                        <Ionicons
                            name="person"
                            size={20}
                            color={textColor}
                            style={styles.icon}
                        />
                        <Text style={[styles.infoText, { color: textColor }]} numberOfLines={1}>
                            {cliente.contacto_principal}
                            {cliente.cargo_contacto && ` - ${cliente.cargo_contacto}`}
                        </Text>
                    </View>
                )}

                {cliente.email && (
                    <View style={styles.infoRow}>
                        <Ionicons
                            name="mail"
                            size={20}
                            color={textColor}
                            style={styles.icon}
                        />
                        <Text style={[styles.infoText, { color: textColor }]} numberOfLines={1}>
                            {cliente.email}
                        </Text>
                    </View>
                )}

                <View style={styles.infoRow}>
                    <Ionicons
                        name="calendar"
                        size={20}
                        color={textColor}
                        style={styles.icon}
                    />
                    <Text style={[styles.infoText, { color: textColor }]}>
                        Actualizado: {lastUpdate}
                    </Text>
                </View>
            </View>

            {/* Botón de registrar visita */}
            <Pressable
                onPress={onRegisterVisit}
                style={({ pressed }) => [
                    styles.button,
                    {
                        backgroundColor,
                        borderColor,
                        opacity: pressed ? 0.7 : 1,
                    },
                ]}
            >
                <Text style={[styles.buttonText, { color: textColor }]}>
                    Registrar Visita
                </Text>
                <Ionicons
                    name="chevron-forward"
                    size={20}
                    color={textColor}
                />
            </Pressable>
        </View>
    );
}

const styles = StyleSheet.create({
    card: {
        width: '100%',
        borderRadius: 15,
        padding: 12,
        marginBottom: 12,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        marginBottom: 12,
        gap: 8,
    },
    title: {
        fontSize: 20,
        fontWeight: '900',
        lineHeight: 24,
        flex: 1,
    },
    typeBadge: {
        paddingHorizontal: 24,
        paddingVertical: 2,
        borderRadius: 15,
        borderWidth: 1,
    },
    typeText: {
        fontSize: 16,
        fontWeight: '500',
        lineHeight: 24,
    },
    infoContainer: {
        gap: 10,
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16,
    },
    icon: {
        width: 20,
        height: 20,
    },
    infoText: {
        fontSize: 16,
        lineHeight: 22,
        flex: 1,
    },
    button: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 10,
        paddingHorizontal: 16,
        paddingVertical: 6,
        borderRadius: 15,
        borderWidth: 1,
        alignSelf: 'flex-end',
        marginTop: 12,
    },
    buttonText: {
        fontSize: 16,
        fontWeight: '500',
        lineHeight: 24,
    },
});
