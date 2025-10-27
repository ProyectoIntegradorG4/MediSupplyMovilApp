import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useThemeColor } from '../hooks/useThemeColor';

interface ClientCardProps {
    name: string;
    address: string;
    phone: string;
    doctor: string;
    lastVisit: string;
    type: 'Hospital' | 'Farmacia' | 'Clinica';
    onRegisterVisit?: () => void;
}

export default function ClientCard({
    name,
    address,
    phone,
    doctor,
    lastVisit,
    type,
    onRegisterVisit,
}: ClientCardProps) {
    const primaryColor = useThemeColor({}, 'primary');
    const textColor = useThemeColor({}, 'text');
    const backgroundColor = useThemeColor({}, 'background');

    return (
        <View style={[styles.card, { backgroundColor: primaryColor + '0D' }]}>
            {/* Header con nombre y tipo */}
            <View style={styles.header}>
                <Text style={[styles.title, { color: textColor }]} numberOfLines={2}>
                    {name}
                </Text>
                <View
                    style={[
                        styles.typeBadge,
                        { backgroundColor, borderColor: '#ccc' },
                    ]}
                >
                    <Text style={[styles.typeText, { color: primaryColor }]}>
                        {type}
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
                        {address}
                    </Text>
                </View>

                <View style={styles.infoRow}>
                    <Ionicons
                        name="call"
                        size={20}
                        color={textColor}
                        style={styles.icon}
                    />
                    <Text style={[styles.infoText, { color: textColor }]}>
                        {phone}
                    </Text>
                </View>

                <View style={styles.infoRow}>
                    <Ionicons
                        name="person"
                        size={20}
                        color={textColor}
                        style={styles.icon}
                    />
                    <Text style={[styles.infoText, { color: textColor }]} numberOfLines={1}>
                        {doctor}
                    </Text>
                </View>

                <View style={styles.infoRow}>
                    <Ionicons
                        name="calendar"
                        size={20}
                        color={textColor}
                        style={styles.icon}
                    />
                    <Text style={[styles.infoText, { color: textColor }]}>
                        Última Visita: {lastVisit}
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
                        borderColor: '#ccc',
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
