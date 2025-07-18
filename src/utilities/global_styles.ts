import {StyleSheet} from 'react-native';
import {MD3CustomTheme} from 'react-native-paper';

export const globalStyle = StyleSheet.create({
  screenContainer: {
    height: '100%',
    width: '100%',
  },
});

export const getTitleTextSize = (title: string, theme: MD3CustomTheme) => {
  if (title.length < 40) {
    return theme.fonts.titleMedium;
  }

  return theme.fonts.titleSmall;
};
