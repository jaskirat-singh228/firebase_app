import {useNavigation} from '@react-navigation/native';
import BaseText from 'components/base_components/base_text';
import BounceView from 'components/molecules/bounce_view';
import React from 'react';
import {View} from 'react-native';
import {Icon, useTheme} from 'react-native-paper';
import {MaterialIcon, SCREEN_WIDTH} from 'utilities/constants';
import {getTitleTextSize} from 'utilities/global_styles';
import {ms} from 'utilities/scale_utils';
import {style} from './style';

type BackWithTitleCompProps = {
  title: string;
  onBackPress?: () => void;
  right?: React.ReactNode;
};

const BackWithTitleComp: React.FC<BackWithTitleCompProps> = props => {
  const {title} = props;
  const theme = useTheme();
  const viewStyle = style(theme);
  const navigation = useNavigation();

  return (
    <View style={viewStyle.mainContainer}>
      <BounceView
        style={{alignItems: 'center'}}
        onPress={props?.onBackPress ? props?.onBackPress : navigation.goBack}>
        <Icon
          source={MaterialIcon.CHEVRON_LEFT}
          size={ms(35)}
          color={theme.colors.iconColor.white}
        />
      </BounceView>
      <BounceView
        style={{}}
        onPress={props?.onBackPress ? props?.onBackPress : navigation.goBack}>
        <BaseText
          style={[
            {
              maxWidth: SCREEN_WIDTH * 0.7,
              color: theme.colors.textColor.white,
              fontWeight: 'bold',
            },
            getTitleTextSize(title, theme),
          ]}
          ellipsizeMode={'tail'}
          numberOfLines={1}
          children={title}
        />
      </BounceView>
      <View style={{flex: 1}} />
      {(props?.right && props?.right) ?? undefined}
    </View>
  );
};

export const BackWithTitleHeader = React.memo(BackWithTitleComp);
