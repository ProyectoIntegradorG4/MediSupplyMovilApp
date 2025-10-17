import { fireEvent, render } from '@testing-library/react-native';
import React from 'react';
import ThemedButton from '../../../../__mocks__/presentation/theme/components/ThemedButton';

describe('ThemedButton', () => {
  it('should render correctly with children', () => {
    const { getByText } = render(
      <ThemedButton onPress={() => {}}>
        Test Button
      </ThemedButton>
    );
    expect(getByText('Test Button')).toBeTruthy();
  });

  it('should handle press events', () => {
    const onPressMock = jest.fn();
    const { getByText } = render(
      <ThemedButton onPress={onPressMock}>
        Test Button
      </ThemedButton>
    );
    
    fireEvent.press(getByText('Test Button'));
    expect(onPressMock).toHaveBeenCalledTimes(1);
  });
});