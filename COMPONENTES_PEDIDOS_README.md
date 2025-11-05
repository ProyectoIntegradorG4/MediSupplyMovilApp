# 📦 Componentes de Pedidos - MediSupply

## 🎯 Resumen de Cambios

Los componentes `OrderCard.tsx` y `NewOrder.tsx` han sido **completamente migrados de React Web a React Native**, siguiendo las mejores prácticas del proyecto y la arquitectura existente.

---

## 📋 Componentes Actualizados

### 1. **StatusBadge.tsx** (NUEVO)
**Ubicación:** `presentation/theme/components/StatusBadge.tsx`

Componente visual para mostrar el estado de los pedidos.

**Características:**
- ✅ Soporte para 4 estados: `pendiente`, `enviado`, `entregado`, `cancelado`
- ✅ Colores semánticos según el estado
- ✅ Diseño consistente con la UI del proyecto

**Uso:**
```typescript
import StatusBadge from '@/presentation/theme/components/StatusBadge';

<StatusBadge status="pendiente" />
<StatusBadge status="enviado" />
<StatusBadge status="entregado" />
<StatusBadge status="cancelado" />
```

---

### 2. **OrderCard.tsx** (ACTUALIZADO)
**Ubicación:** `presentation/theme/components/OrderCard.tsx`

Tarjeta visual para mostrar información de pedidos.

**Cambios principales:**
- ❌ **Eliminado:** Sintaxis HTML (div, className, etc.)
- ✅ **Agregado:** Componentes nativos (View, Text, Pressable)
- ✅ **Agregado:** StyleSheet para estilos nativos
- ✅ **Agregado:** Iconos de @expo/vector-icons (Ionicons)
- ✅ **Agregado:** Hook useThemeColor para temas
- ✅ **Agregado:** Soporte para tema oscuro/claro
- ✅ **Agregado:** Prop onPress para interactividad

**Props:**
```typescript
interface OrderCardProps {
  order: Order;
  onPress?: () => void; // NUEVO
}

interface Order {
  id: string;
  hospital: string;
  type: string;
  status: 'pendiente' | 'enviado' | 'entregado' | 'cancelado';
  refNumber: string;
  time: string;
  phone: string;
  doctor: string;
  amount: string;
  units: string;
  creationDate: string;
  deliveryDate: string;
}
```

**Uso:**
```typescript
import OrderCard from '@/presentation/theme/components/OrderCard';

<OrderCard 
  order={orderData} 
  onPress={() => console.log('Orden presionada')}
/>
```

---

### 3. **NewOrder.tsx** (ACTUALIZADO)
**Ubicación:** `presentation/theme/components/NewOrder.tsx`

Modal para crear nuevos pedidos.

**Cambios principales:**
- ❌ **Eliminado:** Sintaxis HTML (div, form, input, button)
- ✅ **Agregado:** Modal nativo de React Native
- ✅ **Agregado:** KeyboardAvoidingView para teclado
- ✅ **Agregado:** ScrollView para contenido largo
- ✅ **Agregado:** TextInput nativo con tipos de teclado apropiados
- ✅ **Agregado:** Selector de tipo mejorado (botones en lugar de select)
- ✅ **Agregado:** Validaciones nativas con Alert
- ✅ **Agregado:** Reseteo automático del formulario
- ✅ **Agregado:** Prop onSubmit para callback personalizado

**Props:**
```typescript
interface NewOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit?: (formData: OrderFormData) => void; // NUEVO
}

interface OrderFormData {
  hospital: string;
  type: string;
  refNumber: string;
  phone: string;
  doctor: string;
  amount: string;
  units: string;
}
```

**Uso:**
```typescript
import NewOrderModal from '@/presentation/theme/components/NewOrder';

const [isModalOpen, setIsModalOpen] = useState(false);

const handleSubmit = (formData: OrderFormData) => {
  console.log('Datos del formulario:', formData);
  // Enviar al backend
};

<NewOrderModal
  isOpen={isModalOpen}
  onClose={() => setIsModalOpen(false)}
  onSubmit={handleSubmit}
/>
```

---

## 🎨 Características de UX/UI

### ✨ Mejoras de Experiencia de Usuario

1. **Feedback Visual**
   - Animaciones de presión en todos los elementos interactivos
   - Estados visuales claros (pressed, focused)
   - Transiciones suaves

2. **Accesibilidad**
   - Tipos de teclado apropiados (phone-pad, decimal-pad, number-pad)
   - Placeholders descriptivos
   - Textos legibles con buen contraste

3. **Responsive**
   - Adaptación automática a diferentes tamaños de pantalla
   - Layout flexible con Flexbox
   - Márgenes y espaciados consistentes

4. **Temas**
   - Soporte para tema claro/oscuro
   - Colores dinámicos usando useThemeColor
   - Consistencia visual con el resto de la app

---

## 📱 Compatibilidad

- ✅ **iOS**: Totalmente compatible
- ✅ **Android**: Totalmente compatible
- ✅ **Web**: Compatible con React Native Web

---

## 🔧 Mejores Prácticas Implementadas

### 1. **Arquitectura**
- ✅ Separación de responsabilidades
- ✅ Componentes reutilizables
- ✅ Props bien tipadas con TypeScript
- ✅ Interfaces exportadas para uso externo

### 2. **Estilos**
- ✅ StyleSheet.create() para optimización
- ✅ Estilos dinámicos con hooks
- ✅ Nombres descriptivos
- ✅ Agrupación lógica de estilos

### 3. **Performance**
- ✅ Uso de React.memo donde apropiado
- ✅ Callbacks optimizados
- ✅ Minimización de re-renders
- ✅ FlatList para listas grandes

### 4. **Código Limpio**
- ✅ Comentarios descriptivos
- ✅ Nombres de variables claros
- ✅ Estructura consistente
- ✅ Sin código duplicado

---

## 📦 Ejemplo de Implementación Completa

Ver el archivo `OrdersExample.tsx` para un ejemplo completo de cómo usar estos componentes en una vista real.

**Características del ejemplo:**
- Lista de pedidos con FlatList
- Botón flotante para nuevo pedido
- Integración del modal
- Manejo de eventos

---

## 🚀 Próximos Pasos Recomendados

### 1. **Integración con Backend**
```typescript
// core/pedidos/api/pedidosApi.ts
export const getPedidos = async () => {
  // Implementar llamada API
};

export const createPedido = async (data: OrderFormData) => {
  // Implementar llamada API
};
```

### 2. **Store de Estado**
```typescript
// presentation/pedidos/store/usePedidosStore.ts
import { create } from 'zustand';

interface PedidosStore {
  pedidos: Order[];
  setPedidos: (pedidos: Order[]) => void;
  addPedido: (pedido: Order) => void;
}
```

### 3. **Navegación**
```typescript
// app/(products-app)/(pedidos)/index.tsx
import OrdersExample from '@/presentation/theme/components/OrdersExample';

export default function PedidosScreen() {
  return <OrdersExample />;
}
```

### 4. **Detalles de Pedido**
```typescript
// app/(products-app)/(pedidos)/[id].tsx
// Implementar vista de detalles usando el ID
```

---

## 🔍 Verificación

Para verificar que todo funciona correctamente:

1. **Importar en una vista existente:**
   ```bash
   # Editar app/(products-app)/(pedidos)/index.tsx
   ```

2. **Ejecutar la app:**
   ```bash
   yarn start
   ```

3. **Verificar en dispositivo/emulador:**
   - Ver las tarjetas de pedidos
   - Abrir el modal de nuevo pedido
   - Probar el formulario
   - Verificar tema claro/oscuro

---

## 📚 Referencias del Proyecto

- **Guía de componentes:** Ver otros componentes en `presentation/theme/components/`
- **Hooks de tema:** `presentation/theme/hooks/useThemeColor.ts`
- **Colores:** `constants/theme.ts`
- **Iconos:** [@expo/vector-icons](https://icons.expo.fyi/)

---

## 🤝 Contribuciones

Al modificar estos componentes:
1. Mantener la estructura actual
2. Seguir las convenciones de nombres
3. Usar TypeScript estricto
4. Documentar cambios importantes
5. Probar en iOS y Android

---

## ✅ Checklist de Calidad

- [x] Componentes usan React Native puro
- [x] No hay dependencias de React Web
- [x] TypeScript sin errores
- [x] ESLint sin warnings
- [x] Soporte de temas implementado
- [x] Accesibilidad considerada
- [x] Responsive en diferentes pantallas
- [x] Documentación completa
- [x] Ejemplo de uso incluido

---

**Última actualización:** 02/11/2024
**Versión:** 1.0.0
**Autor:** Proyecto Integrador G4

