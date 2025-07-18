import {StyleSheet} from 'react-native';
import {MD3CustomTheme} from 'react-native-paper';
import {ms} from 'utilities/scale_utils';

export const style = (theme: MD3CustomTheme) =>
  StyleSheet.create({
    mainContainer: {
      width: '100%',
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.colors.statusBar.backgroundColor,
      padding: ms(10),
    },
    headerContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      width: '100%',
    },
  });
