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
import { Fonts, BorderRadius, Spacing, FontSizes } from '@/constants/theme';

interface Props extends TextInputProps {
  icon?: keyof typeof Ionicons.glyphMap;
  error?: string;
}

const ThemedTextInput = ({ icon, error, ...rest }: Props) => {
  const primaryColor = useThemeColor({}, 'primary');
  const textColor = useThemeColor({}, 'text');
  const borderColor = useThemeColor({}, 'border');
  const borderActiveColor = useThemeColor({}, 'borderActive');
  const errorColor = useThemeColor({}, 'error');
  const placeholderColor = useThemeColor({}, 'placeholder');
  const errorTextColor = useThemeColor({}, 'errorText');

  const [isActive, setIsActive] = useState(false);
  const inputRef = useRef<TextInput>(null);

  // Color del borde: rojo si hay error, color primario si está activo, color de borde por defecto
  const currentBorderColor = error ? errorColor : (isActive ? borderActiveColor : borderColor);

  return (
    <View style={{ marginBottom: Spacing.lg }}>
      <View
        style={{
          ...styles.border,
          borderColor: currentBorderColor,
        }}
        onTouchStart={() => inputRef.current?.focus()}
      >
        {icon && (
          <Ionicons
            name={icon}
            size={24}
            color={error ? errorColor : textColor}
            style={{ marginRight: Spacing.lg }}
          />
        )}

        <TextInput
          ref={inputRef}
          placeholderTextColor={placeholderColor}
          onFocus={() => setIsActive(true)}
          onBlur={() => setIsActive(false)}
          style={[
            styles.input,
            {
              color: textColor,
              marginRight: Spacing.lg,
            },
          ]}
          {...rest}
        />
      </View>

      {/* Mostrar mensaje de error */}
      {error ? (
        <Text style={[styles.errorText, { color: errorTextColor }]}>
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
    borderRadius: BorderRadius.sm,
    padding: Spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    fontFamily: Fonts.regular,
    fontSize: FontSizes.base,
  },
  errorText: {
    fontSize: FontSizes.xs,
    marginTop: Spacing.xs,
    marginLeft: Spacing.sm,
    fontFamily: Fonts.regular,
  },
});
