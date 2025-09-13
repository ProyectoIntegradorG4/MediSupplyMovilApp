import { Ionicons } from '@expo/vector-icons';
import { useRef, useState } from 'react';
import {
  StyleSheet,
  Text,
  TextInput,
  TextInputProps,
  View,
} from 'react-native';
import { useThemeColor } from '../hooks/useThemeColor';

interface Props extends TextInputProps {
  icon?: keyof typeof Ionicons.glyphMap;
  error?: string;
}

const ThemedTextInput = ({ icon, error, ...rest }: Props) => {
  const primaryColor = useThemeColor({}, 'primary');
  const textColor = useThemeColor({}, 'text');

  const [isActive, setIsActive] = useState(false);
  const inputRef = useRef<TextInput>(null);

  // Color del borde: rojo si hay error, color primario si está activo, gris si no
  const borderColor = error ? '#e74c3c' : (isActive ? primaryColor : '#ccc');

  return (
    <View style={{ marginBottom: 10 }}>
      <View
        style={{
          ...styles.border,
          borderColor: borderColor,
        }}
        onTouchStart={() => inputRef.current?.focus()}
      >
        {icon && (
          <Ionicons
            name={icon}
            size={24}
            color={error ? '#e74c3c' : textColor}
            style={{ marginRight: 10 }}
          />
        )}

        <TextInput
          ref={inputRef}
          placeholderTextColor="#5c5c5c"
          onFocus={() => setIsActive(true)}
          onBlur={() => setIsActive(false)}
          style={{
            color: textColor,
            marginRight: 10,
            flex: 1,
          }}
          {...rest}
        />
      </View>

      {/* Mostrar mensaje de error */}
      {error ? (
        <Text style={styles.errorText}>
          {error}
        </Text>
      ) : null}
    </View>
  );
};
export default ThemedTextInput;

const styles = StyleSheet.create({
  border: {
    borderWidth: 1,
    borderRadius: 5,
    padding: 5,
    flexDirection: 'row',
    alignItems: 'center',
  },
  errorText: {
    color: '#e74c3c',
    fontSize: 12,
    marginTop: 4,
    marginLeft: 5,
  },
});
