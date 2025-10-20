# Guía de Pruebas Unitarias con Jest para MediSupply Mobile App

## Configuración del Entorno

### Dependencias Necesarias
```bash
yarn add --dev jest @testing-library/react-native @testing-library/jest-native jest-expo jest-environment-jsdom @types/jest ts-jest react-test-renderer
```

### Estructura de Directorios
```
__tests__/
├── __mocks__/           # Mocks de componentes y servicios
├── presentation/        # Pruebas de componentes de presentación
│   ├── theme/
│   │   ├── components/
│   │   └── hooks/
├── core/               # Pruebas de lógica de negocio
│   ├── auth/
│   └── api/
└── helpers/           # Pruebas de utilidades
```

## Tipos de Pruebas

### 1. Pruebas de Componentes UI

```typescript
import { render, fireEvent } from '@testing-library/react-native';

describe('MyComponent', () => {
  it('should render correctly', () => {
    const { getByText } = render(<MyComponent />);
    expect(getByText('Some Text')).toBeTruthy();
  });

  it('should handle user interactions', () => {
    const onPress = jest.fn();
    const { getByTestId } = render(
      <MyComponent onPress={onPress} />
    );
    
    fireEvent.press(getByTestId('button'));
    expect(onPress).toHaveBeenCalled();
  });
});
```

### 2. Pruebas de Hooks

```typescript
import { renderHook, act } from '@testing-library/react-hooks';

describe('useMyHook', () => {
  it('should manage state correctly', () => {
    const { result } = renderHook(() => useMyHook());
    
    act(() => {
      result.current.someFunction();
    });
    
    expect(result.current.value).toBe(expectedValue);
  });
});
```

### 3. Pruebas de API

```typescript
describe('API Client', () => {
  it('should fetch data successfully', async () => {
    const mockData = { id: 1, name: 'Test' };
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockData)
    });

    const result = await apiClient.getData();
    expect(result).toEqual(mockData);
  });

  it('should handle errors', async () => {
    global.fetch = jest.fn().mockRejectedValue(new Error('Network error'));
    
    await expect(apiClient.getData()).rejects.toThrow('Network error');
  });
});
```

### 4. Pruebas de Store (Zustand)

```typescript
describe('Auth Store', () => {
  it('should update user state', () => {
    const store = useAuthStore.getState();
    const user = { id: 1, name: 'Test User' };
    
    store.setUser(user);
    expect(store.user).toEqual(user);
  });
});
```

## Mocking

### Mocking de Módulos

```typescript
jest.mock('@expo/vector-icons', () => ({
  Ionicons: 'Ionicons'
}));

jest.mock('expo-secure-store', () => ({
  getItemAsync: jest.fn(),
  setItemAsync: jest.fn(),
  deleteItemAsync: jest.fn()
}));
```

### Mocking de Componentes

```typescript
// __mocks__/ThemedButton.tsx
import React from 'react';
import { Pressable, Text } from 'react-native';

const MockThemedButton = ({ children, onPress }) => (
  <Pressable onPress={onPress}>
    <Text>{children}</Text>
  </Pressable>
);

export default MockThemedButton;
```

## Mejores Prácticas

### 1. Organización de Pruebas
- Usa `describe` para agrupar pruebas relacionadas
- Usa nombres descriptivos para tus pruebas
- Sigue el patrón AAA (Arrange, Act, Assert)

```typescript
describe('Component', () => {
  // Arrange
  beforeEach(() => {
    // Setup
  });

  it('should do something', () => {
    // Act
    const result = doSomething();
    
    // Assert
    expect(result).toBe(expected);
  });
});
```

### 2. Testing Asíncrono
```typescript
it('should load data async', async () => {
  const data = await fetchData();
  expect(data).toBeDefined();
});

// O con done callback
it('should handle callbacks', (done) => {
  fetchData().then(data => {
    expect(data).toBeDefined();
    done();
  });
});
```

### 3. Snapshots
```typescript
it('should match snapshot', () => {
  const { toJSON } = render(<MyComponent />);
  expect(toJSON()).toMatchSnapshot();
});
```

## Comandos Útiles

```bash
# Ejecutar todas las pruebas
yarn test

# Ejecutar pruebas en modo watch
yarn test --watch

# Ejecutar pruebas con coverage
yarn test --coverage

# Ejecutar pruebas específicas
yarn test MyComponent.test.tsx

# Actualizar snapshots
yarn test -u
```

## Depuración

### Usando console.log
```typescript
it('should debug values', () => {
  const result = someFunction();
  console.log('Result:', result); // Visible en la salida de Jest
  expect(result).toBeDefined();
});
```

### Usando debugger
```typescript
it('should debug with breakpoint', () => {
  debugger; // El debugger se detendrá aquí si las devtools están abiertas
  expect(someFunction()).toBeDefined();
});
```

## Recursos Adicionales

- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [React Native Testing Library](https://callstack.github.io/react-native-testing-library/)
- [Testing Library Queries](https://testing-library.com/docs/queries/about)
- [Jest Expo Documentation](https://docs.expo.dev/guides/testing-with-jest/)