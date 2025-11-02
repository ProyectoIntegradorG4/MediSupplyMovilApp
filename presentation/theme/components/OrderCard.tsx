import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useThemeColor } from '../hooks/useThemeColor';

interface OrderCardProps {
    hospitalName: string;
    category: string;
    status: 'pending' | 'sent' | 'delivered' | 'cancelled';
    refNumber: string;
    time: string;
    phone: string;
    doctor: string;
    price: string;
    units: string;
    creationDate: string;
    deliveryDate: string;
}

const statusConfig = {
    pending: {
        label: 'Pendiente',
        textColor: '#F59E0B',
        bgColor: '#FEF3C7',
        borderColor: '#FCD34D',
    },
    sent: {
        label: 'Enviado',
        textColor: '#3B82F6',
        bgColor: '#DBEAFE',
        borderColor: '#93C5FD',
    },
    delivered: {
        label: 'Entregado',
        textColor: '#10B981',
        bgColor: '#D1FAE5',
        borderColor: '#6EE7B7',
    },
    cancelled: {
        label: 'Cancelado',
        textColor: '#EF4444',
        bgColor: '#FEE2E2',
        borderColor: '#FCA5A5',
    },
};

export function OrderCard({
    hospitalName,
    category,
    status,
    refNumber,
    time,
    phone,
    doctor,
    price,
    units,
    creationDate,
    deliveryDate,
}: OrderCardProps) {
    const primaryColor = useThemeColor({}, 'primary');
    const textColor = useThemeColor({}, 'text');
    const statusStyle = statusConfig[status];

    return (
        <View style={[styles.card, { backgroundColor: primaryColor + '0D' }]}>
            {/* Header con nombre del hospital y badges */}
            <View style={styles.header}>
                <Text style={[styles.hospitalName, { color: textColor }]} numberOfLines={2}>
                    {hospitalName}
                </Text>

                <View style={styles.badgesContainer}>
                    <View style={[styles.categoryBadge, { borderColor: '#ccc' }]}>
                        <Text style={[styles.categoryText, { color: primaryColor }]}>
                            {category}
                        </Text>
                    </View>

                    <View
                        style={[
                            styles.statusBadge,
                            {
                                backgroundColor: statusStyle.bgColor,
                                borderColor: statusStyle.borderColor,
                            },
                        ]}
                    >
                        <Text
                            style={[styles.statusText, { color: statusStyle.textColor }]}
                        >
                            {statusStyle.label}
                        </Text>
                    </View>
                </View>
            </View>

            {/* Información del pedido */}
            <View style={styles.infoSection}>
                {/* Referencia */}
                <View style={styles.infoRow}>
                    <Ionicons name="document-text" size={20} color={textColor} />
                    <Text style={[styles.infoTextBold, { color: textColor }]}>
                        {refNumber}
                    </Text>
                </View>

                {/* Hora y Fecha de creación */}
                <View style={styles.infoRow}>
                    <View style={styles.infoRowLeft}>
                        <Ionicons name="time" size={20} color={textColor} />
                        <Text style={[styles.infoText, { color: textColor }]}>{time}</Text>
                    </View>
                    <View style={styles.infoRowRight}>
                        <Ionicons name="calendar" size={20} color={textColor} />
                        <Text style={[styles.infoText, { color: textColor }]}>
                            {creationDate}
                        </Text>
                    </View>
                </View>

                {/* Teléfono y Fecha de entrega */}
                <View style={styles.infoRow}>
                    <View style={styles.infoRowLeft}>
                        <Ionicons name="call" size={20} color={textColor} />
                        <Text style={[styles.infoText, { color: textColor }]}>{phone}</Text>
                    </View>
                    <View style={styles.infoRowRight}>
                        <Ionicons name="time" size={20} color={textColor} />
                        <Text style={[styles.infoText, { color: textColor }]}>
                            {deliveryDate}
                        </Text>
                    </View>
                </View>

                {/* Doctor */}
                <View style={styles.infoRow}>
                    <Ionicons name="person" size={20} color={textColor} />
                    <Text style={[styles.infoText, { color: textColor }]}>{doctor}</Text>
                </View>
            </View>

            {/* Separador */}
            <View style={[styles.separator, { backgroundColor: textColor + '40' }]} />

            {/* Footer con precio y unidades */}
            <View style={styles.footer}>
                <View style={styles.footerItem}>
                    <Ionicons name="cash" size={20} color={textColor} />
                    <Text style={[styles.footerTextBold, { color: textColor }]}>
                        {price}
                    </Text>
                </View>

                <View style={styles.footerItem}>
                    <Ionicons name="cube" size={20} color={textColor} />
                    <Text style={[styles.footerTextBold, { color: textColor }]}>
                        {units}
                    </Text>
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    card: {
        width: '100%',
        borderRadius: 15,
        padding: 10,
        marginBottom: 12,
    },
    header: {
        marginBottom: 8,
    },
    hospitalName: {
        fontSize: 25,
        fontWeight: '400',
        lineHeight: 28,
        marginBottom: 8,
        paddingRight: 100,
    },
    badgesContainer: {
        position: 'absolute',
        top: 0,
        right: 0,
        alignItems: 'flex-end',
        gap: 8,
    },
    categoryBadge: {
        paddingHorizontal: 32,
        paddingVertical: 2,
        borderRadius: 15,
        borderWidth: 1,
        backgroundColor: '#FFFFFF',
    },
    categoryText: {
        fontSize: 16,
        fontWeight: '500',
    },
    statusBadge: {
        paddingHorizontal: 20,
        paddingVertical: 2,
        borderRadius: 15,
        borderWidth: 1,
    },
    statusText: {
        fontSize: 20,
        fontWeight: 'bold',
        lineHeight: 22,
    },
    infoSection: {
        marginTop: 8,
        gap: 6,
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    infoRowLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        flex: 1,
    },
    infoRowRight: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        flex: 1,
    },
    infoText: {
        fontSize: 16,
        lineHeight: 22,
    },
    infoTextBold: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    separator: {
        height: 1,
        width: '100%',
        marginVertical: 6,
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    footerItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    footerTextBold: {
        fontSize: 18,
        fontWeight: 'bold',
    },
});
