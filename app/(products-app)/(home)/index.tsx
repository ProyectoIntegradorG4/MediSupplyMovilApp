import { ThemedText } from '@/presentation/theme/components/ThemedText';
import { useThemeColor } from '@/presentation/theme/hooks/useThemeColor';
import { Fonts } from '@/constants/theme';
import { View } from 'react-native';
const HomeScreen = () => {
  const primary = useThemeColor({}, 'primary');

  return (
    <View style={{ paddingTop: 100, paddingHorizontal: 20 }}>
      <ThemedText style={{ fontFamily: Fonts.bold, color: primary }}>
        HomeScreen
      </ThemedText>
      <ThemedText style={{ fontFamily: Fonts.regular }}>HomeScreen</ThemedText>
      <ThemedText style={{ fontFamily: Fonts.thin }}>HomeScreen</ThemedText>
      <ThemedText>HomeScreen</ThemedText>
    </View>
  );
};
export default HomeScreen;
