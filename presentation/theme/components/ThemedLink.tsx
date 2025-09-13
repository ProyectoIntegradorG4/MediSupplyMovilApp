import { Link, LinkProps } from 'expo-router';
import { useThemeColor } from '../hooks/useThemeColor';

// Especificar el tipo de LinkProps de manera más precisa
interface Props extends LinkProps {
  style?: object;
}

const ThemedLink = ({ style, ...rest }: Props) => {
  const primaryColor = useThemeColor({}, 'primary');

  return (
    <Link
      style={[
        {
          color: primaryColor,
        },
        style,
      ]}
      {...rest}
    />
  );
};

export default ThemedLink;