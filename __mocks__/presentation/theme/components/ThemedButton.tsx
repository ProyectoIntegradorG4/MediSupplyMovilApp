import React from 'react';
import { Pressable, PressableProps, StyleSheet, Text } from 'react-native';

interface Props extends PressableProps {
  children: string;
}

const ThemedButton = ({ children, ...rest }: Props) => {
  return (
    <Pressable
      style={styles.button}
      {...rest}
    >
      <Text style={{ color: 'white' }}>{children}</Text>
    </Pressable>
  );
};

export default ThemedButton;

const styles = StyleSheet.create({
  button: {
    backgroundColor: '#000',
    paddingHorizontal: 10,
    paddingVertical: 15,
    borderRadius: 5,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
  },
});