import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import {
  StyleSheet,
  TextInput,
  TextInputProps,
  View,
} from 'react-native';
import { useThemeColor } from '../hooks/useThemeColor';

interface SearchBarProps extends TextInputProps {
  onSearch?: (text: string) => void;
}

export default function SearchBar({ onSearch, value, onChangeText, ...rest }: SearchBarProps) {
  const primaryColor = useThemeColor({}, 'primary');
  const textColor = useThemeColor({}, 'text');
  const backgroundColor = useThemeColor({}, 'background');

  const [isActive, setIsActive] = useState(false);
  const [internalSearchText, setInternalSearchText] = useState('');

  // Usar valor controlado si se proporciona, sino usar estado interno
  const searchText = value !== undefined ? value : internalSearchText;

  const handleChangeText = (text: string) => {
    if (onChangeText) {
      onChangeText(text);
    } else {
      setInternalSearchText(text);
    }
    onSearch?.(text);
  };

  const borderColor = isActive ? primaryColor : '#ccc';

  return (
    <View style={[styles.container, { borderColor }]}>
      <Ionicons
        name="search"
        size={24}
        color={textColor}
        style={styles.icon}
      />
      <TextInput
        value={searchText}
        onChangeText={handleChangeText}
        placeholder="Buscar"
        placeholderTextColor="#5c5c5c"
        onFocus={() => setIsActive(true)}
        onBlur={() => setIsActive(false)}
        style={[
          styles.input,
          {
            color: textColor,
            backgroundColor: backgroundColor,
          },
        ]}
        {...rest}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 45,
    width: '100%',
  },
  icon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontSize: 15,
    height: '100%',
  },
});
