import { Text, type TextProps, StyleSheet } from 'react-native';

import { useThemeColor } from '@/presentation/theme/hooks/useThemeColor';
import { Fonts, FontSizes } from '@/constants/theme';

export type ThemedTextProps = TextProps & {
  lightColor?: string;
  darkColor?: string;
  type?: 'default' | 'title' | 'defaultSemiBold' | 'subtitle' | 'link';
};

export function ThemedText({
  style,
  lightColor,
  darkColor,
  type = 'default',
  ...rest
}: ThemedTextProps) {
  const color = useThemeColor({ light: lightColor, dark: darkColor }, 'text');
  const linkColor = useThemeColor({}, 'secondary');

  return (
    <Text
      style={[
        { color },
        type === 'default' ? styles.default : undefined,
        type === 'title' ? styles.title : undefined,
        type === 'defaultSemiBold' ? styles.defaultSemiBold : undefined,
        type === 'subtitle' ? styles.subtitle : undefined,
        type === 'link' ? [styles.link, { color: linkColor }] : undefined,
        style,
      ]}
      {...rest}
    />
  );
}

const styles = StyleSheet.create({
  default: {
    fontSize: FontSizes.base,
    lineHeight: 24,
    fontFamily: Fonts.regular,
  },
  defaultSemiBold: {
    fontSize: FontSizes.base,
    lineHeight: 24,
    fontWeight: '600',
    fontFamily: Fonts.regular,
  },
  title: {
    fontSize: FontSizes['4xl'],
    fontWeight: 'bold',
    fontFamily: Fonts.bold,
    lineHeight: 32,
  },
  subtitle: {
    fontSize: FontSizes.xl,
    fontWeight: 'bold',
    fontFamily: Fonts.bold,
  },
  link: {
    lineHeight: 30,
    fontSize: FontSizes.base,
    fontFamily: Fonts.regular,
  },
});
