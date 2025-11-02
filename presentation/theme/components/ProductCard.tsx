import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import {
    Image,
    Pressable,
    StyleSheet,
    Text,
    TextInput,
    View,
} from 'react-native';
import { useThemeColor } from '../hooks/useThemeColor';

interface ProductCardProps {
    name: string;
    sku: string;
    price: string;
    stock: number;
    stockStatus: 'available' | 'low' | 'medium';
    expiration: string;
    warehouse: string;
    initialQuantity?: number;
    imageUrl?: string;
    onAddToOrder?: (productSku: string, quantity: number) => void;
}

export default function ProductCard({
    name,
    sku,
    price,
    stock,
    stockStatus,
    expiration,
    warehouse,
    initialQuantity = 0,
    imageUrl,
    onAddToOrder,
}: ProductCardProps) {
    const [quantity, setQuantity] = useState(initialQuantity);
    const [isAdded, setIsAdded] = useState(initialQuantity > 0);

    const primaryColor = useThemeColor({}, 'primary');
    const textColor = useThemeColor({}, 'text');
    const backgroundColor = useThemeColor({}, 'background');

    // Colores para los badges de stock
    const stockBadgeStyles = {
        available: { bg: '#D4EDDA', text: '#155724' },
        low: { bg: '#F8D7DA', text: '#721C24' },
        medium: { bg: '#FFF3CD', text: '#856404' },
    };

    const stockBadgeText = {
        available: 'Disponible',
        low: 'Stock bajo',
        medium: 'Stock medio',
    };

    // Colores para los botones según el estado del stock
    const buttonColors = {
        available: '#28a745',
        low: '#ffc107',
        medium: primaryColor,
    };

    const handleQuantityChange = (text: string) => {
        const value = parseInt(text) || 0;
        setQuantity(Math.max(0, Math.min(stock, value)));
    };

    const handleAddToOrder = () => {
        if (quantity > 0) {
            setIsAdded(true);
            onAddToOrder?.(sku, quantity);
        }
    };

    return (
        <View
            style={[
                styles.card,
                { backgroundColor: primaryColor + '0D', borderColor: primaryColor + '80' },
            ]}
        >
            {/* Sección superior: Imagen y datos principales */}
            <View style={styles.topSection}>
                <View style={[styles.imageContainer, { backgroundColor: '#f0f0f0' }]}>
                    {imageUrl ? (
                        <Image source={{ uri: imageUrl }} style={styles.image} />
                    ) : (
                        <Ionicons name="cube-outline" size={40} color="#999" />
                    )}
                </View>

                <View style={styles.mainInfo}>
                    <Text style={[styles.productName, { color: textColor }]} numberOfLines={2}>
                        {name}
                    </Text>
                    <Text style={[styles.sku, { color: textColor }]}>{sku}</Text>
                    <Text style={[styles.price, { color: textColor }]}>{price}</Text>
                </View>
            </View>

            {/* Sección inferior: Información detallada y controles */}
            <View style={styles.bottomSection}>
                {/* Columna izquierda: Información del producto */}
                <View style={styles.infoColumn}>
                    <View style={styles.infoRow}>
                        <Ionicons name="cube" size={20} color={textColor} />
                        <Text style={[styles.infoText, { color: textColor }]}>
                            Stock: {stock} unidades
                        </Text>
                        <View
                            style={[
                                styles.badge,
                                { backgroundColor: stockBadgeStyles[stockStatus].bg },
                            ]}
                        >
                            <Text
                                style={[
                                    styles.badgeText,
                                    { color: stockBadgeStyles[stockStatus].text },
                                ]}
                            >
                                {stockBadgeText[stockStatus]}
                            </Text>
                        </View>
                    </View>

                    <View style={styles.infoRow}>
                        <Ionicons name="calendar" size={20} color={textColor} />
                        <Text style={[styles.infoText, { color: textColor }]}>
                            {expiration}
                        </Text>
                    </View>

                    <View style={styles.infoRow}>
                        <Ionicons name="time" size={20} color={textColor} />
                        <Text style={[styles.infoText, { color: textColor }]}>
                            {warehouse}
                        </Text>
                    </View>
                </View>

                {/* Columna derecha: Controles de cantidad */}
                <View style={styles.controlsColumn}>
                    <Text style={[styles.quantityLabel, { color: textColor }]}>
                        Inserta Cantidad
                    </Text>
                    <TextInput
                        value={quantity.toString()}
                        onChangeText={handleQuantityChange}
                        keyboardType="numeric"
                        maxLength={4}
                        style={[
                            styles.quantityInput,
                            { color: textColor, backgroundColor, borderColor: textColor },
                        ]}
                    />
                    <Pressable
                        onPress={handleAddToOrder}
                        disabled={quantity === 0}
                        style={({ pressed }) => [
                            styles.addButton,
                            {
                                backgroundColor: isAdded
                                    ? '#28a745'
                                    : buttonColors[stockStatus],
                                opacity: pressed ? 0.7 : quantity === 0 ? 0.5 : 1,
                            },
                        ]}
                    >
                        <Text style={styles.buttonText}>
                            {isAdded ? 'Agregado' : 'Agregar'}
                        </Text>
                    </Pressable>
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    card: {
        width: '100%',
        borderRadius: 10,
        borderWidth: 1,
        overflow: 'hidden',
        marginBottom: 12,
    },
    topSection: {
        flexDirection: 'row',
        padding: 6,
        paddingBottom: 4,
        gap: 8,
    },
    imageContainer: {
        width: 65,
        height: 65,
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
        overflow: 'hidden',
    },
    image: {
        width: '100%',
        height: '100%',
        resizeMode: 'cover',
    },
    mainInfo: {
        flex: 1,
        justifyContent: 'center',
    },
    productName: {
        fontSize: 20,
        fontWeight: 'bold',
        lineHeight: 22,
        marginBottom: 2,
    },
    sku: {
        fontSize: 16,
        marginBottom: 2,
    },
    price: {
        fontSize: 24,
        fontWeight: '900',
    },
    bottomSection: {
        flexDirection: 'row',
        paddingHorizontal: 6,
        paddingBottom: 6,
        gap: 8,
    },
    infoColumn: {
        flex: 1,
        gap: 4,
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    infoText: {
        fontSize: 16,
        flex: 1,
    },
    badge: {
        paddingHorizontal: 15,
        paddingVertical: 2,
        borderRadius: 15,
        height: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    badgeText: {
        fontSize: 10,
        fontWeight: '600',
    },
    controlsColumn: {
        alignItems: 'flex-end',
        justifyContent: 'flex-start',
        gap: 8,
        minWidth: 118,
    },
    quantityLabel: {
        fontSize: 12,
        fontWeight: 'bold',
        textAlign: 'right',
    },
    quantityInput: {
        width: 118,
        height: 42,
        borderRadius: 5,
        borderWidth: 1,
        textAlign: 'center',
        fontSize: 30,
        fontWeight: 'bold',
    },
    addButton: {
        width: 118,
        height: 32,
        borderRadius: 5,
        justifyContent: 'center',
        alignItems: 'center',
    },
    buttonText: {
        color: '#FFFFFF',
        fontSize: 15,
        fontWeight: '600',
    },
});
