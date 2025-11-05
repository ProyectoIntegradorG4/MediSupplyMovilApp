import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Pressable, PressableProps, StyleSheet, Text } from 'react-native';
import { useThemeColor } from '../hooks/useThemeColor';
import { Fonts, BorderRadius, Spacing } from '@/constants/theme';

interface Props extends PressableProps {
  children: string;
  icon?: keyof typeof Ionicons.glyphMap;
}

const ThemedButton = ({ children, icon, ...rest }: Props) => {
  const primaryColor = useThemeColor({}, 'primary');
  const textOnPrimary = useThemeColor({}, 'textOnPrimary');

  return (
    <Pressable
      style={({ pressed }) => [
        {
          backgroundColor: pressed ? primaryColor + '90' : primaryColor,
        },
        styles.button,
      ]}
      {...rest}
    >
      <Text style={[styles.buttonText, { color: textOnPrimary }]}>{children}</Text>

      {icon && (
        <Ionicons
          testID="button-icon"
          name={icon}
          size={24}
          color={textOnPrimary}
          style={{ marginHorizontal: Spacing.sm }}
        />
      )}
    </Pressable>
  );
};
export default ThemedButton;

const styles = StyleSheet.create({
  button: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.lg,
    borderRadius: BorderRadius.sm,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  buttonText: {
    fontFamily: Fonts.regular,
    fontSize: 16,
  },
});
