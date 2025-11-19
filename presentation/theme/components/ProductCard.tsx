import { Fonts } from '@/constants/theme';
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
import { useTranslation } from '@/presentation/i18n/hooks/useTranslation';

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
    onAddToCart?: (productSku: string, quantity: number) => void; // Callback para carrito
    onStockValidationError?: (message: string) => void; // Callback para errores de stock
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
    onAddToCart,
    onStockValidationError,
}: ProductCardProps) {
    const { t } = useTranslation();
    const [quantity, setQuantity] = useState(initialQuantity);
    const [isAdded, setIsAdded] = useState(initialQuantity > 0);

    const primaryColor = useThemeColor({}, 'primary');
    const textColor = useThemeColor({}, 'text');
    const backgroundColor = useThemeColor({}, 'background');
    const cardBorderColor = useThemeColor({}, 'cardBorder');
    const imageBackground = useThemeColor({}, 'imageBackground');
    const iconMuted = useThemeColor({}, 'iconMuted');
    const stockAvailable = useThemeColor({}, 'stockAvailable');
    const stockLow = useThemeColor({}, 'stockLow');
    const stockMedium = useThemeColor({}, 'stockMedium');
    const stockUnavailable = useThemeColor({}, 'stockUnavailable');
    const successBackground = useThemeColor({}, 'successBackground');
    const successText = useThemeColor({}, 'successText');
    const errorBackground = useThemeColor({}, 'errorBackground');
    const errorText = useThemeColor({}, 'errorText');
    const warningBackground = useThemeColor({}, 'warningBackground');
    const warningText = useThemeColor({}, 'warningText');
    const textOnPrimary = useThemeColor({}, 'textOnPrimary');

    // Colores para los badges de stock usando el tema
    const stockBadgeStyles = {
        available: { bg: successBackground, text: successText },
        low: { bg: errorBackground, text: errorText },
        medium: { bg: warningBackground, text: warningText },
    };

    const stockBadgeText = {
        available: t('components.productCard.stockStatus.available'),
        low: t('components.productCard.stockStatus.low'),
        medium: t('components.productCard.stockStatus.medium'),
    };

    // Colores para los botones según el estado del stock usando el tema
    const buttonColors = {
        available: stockAvailable,
        low: stockLow,
        medium: stockMedium,
    };

    const handleQuantityChange = (text: string) => {
        const value = parseInt(text) || 0;
        // Limitar a stock disponible
        const limitedValue = Math.max(0, Math.min(stock, value));
        setQuantity(limitedValue);

        // Mostrar alerta si intenta exceder stock
        if (value > stock && onStockValidationError) {
            onStockValidationError(t('components.productCard.errors.insufficientStock', { stock }));
        }
    };

    const handleAddToOrder = () => {
        if (quantity === 0) return;

        // Validación de stock antes de agregar
        if (quantity > stock) {
            if (onStockValidationError) {
                onStockValidationError(t('components.productCard.errors.insufficientStock', { stock }));
            }
            setQuantity(stock); // Ajustar a stock máximo
            return;
        }

        if (stock === 0) {
            if (onStockValidationError) {
                onStockValidationError(t('components.productCard.errors.noStock'));
            }
            return;
        }

        setIsAdded(true);
        // Usar onAddToCart si está disponible, sino onAddToOrder (retrocompatibilidad)
        if (onAddToCart) {
            onAddToCart(sku, quantity);
        } else {
            onAddToOrder?.(sku, quantity);
        }
    };

    return (
        <View
            style={[
                styles.card,
                {
                    backgroundColor: primaryColor + '0D',
                    borderColor: cardBorderColor,
                },
            ]}
        >
            {/* Sección superior: Imagen y datos principales */}
            <View style={styles.topSection}>
                <View style={[styles.imageContainer, { backgroundColor: imageBackground }]}>
                    {imageUrl ? (
                        <Image source={{ uri: imageUrl }} style={styles.image} />
                    ) : (
                        <Ionicons name="cube-outline" size={40} color={iconMuted} />
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
                            {t('components.productCard.stock')} {stock} {t('components.productCard.units')}
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
                        {t('components.productCard.quantityLabel')}
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
                        disabled={quantity === 0 || stock === 0}
                        style={({ pressed }) => [
                            styles.addButton,
                            {
                                backgroundColor: isAdded
                                    ? stockAvailable
                                    : stock === 0
                                        ? stockUnavailable
                                        : buttonColors[stockStatus],
                                opacity: pressed ? 0.7 : quantity === 0 || stock === 0 ? 0.5 : 1,
                            },
                        ]}
                    >
                        <Text style={[styles.buttonText, { color: textOnPrimary }]}>
                            {stock === 0 ? t('components.productCard.buttons.noStock') : isAdded ? t('components.productCard.buttons.added') : t('components.productCard.buttons.add')}
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
        fontSize: 20,
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
        fontSize: 15,
        fontWeight: '600',
        fontFamily: Fonts.regular,
    },
});
