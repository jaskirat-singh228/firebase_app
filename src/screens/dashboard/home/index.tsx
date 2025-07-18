import crashlytics from '@react-native-firebase/crashlytics';
import {useNavigation} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import BaseText from 'components/base_components/base_text';
import AnimatedLoaderButton from 'components/molecules/animated_loader_button';
import React from 'react';
import {ScrollView, StyleSheet, View} from 'react-native';
import {MaterialBottomTabScreenProps, useTheme} from 'react-native-paper';
import {
  AppStackParamList,
  DashbordBottomTabBarParamList,
} from 'types/navigation_types';
import {AnalyticEvent} from 'utilities/analytic_event';
import {ms, vs} from 'utilities/scale_utils';

type HomeScreenProps = MaterialBottomTabScreenProps<
  DashbordBottomTabBarParamList,
  'HomeScreen'
>;

const HomeScreen: React.FC<HomeScreenProps> = props => {
  const theme = useTheme();
  const appStackParamList =
    useNavigation<NativeStackNavigationProp<AppStackParamList>>();
  const [enabled, setEnabled] = React.useState(false);

  const toggleCrashlytics = async () => {
    await crashlytics()
      .setCrashlyticsCollectionEnabled(!enabled)
      .then(() => setEnabled(crashlytics().isCrashlyticsCollectionEnabled));
  };

  React.useEffect(() => {
    crashlytics().log('Testing crash');

    AnalyticEvent({
      eventName: 'AccountScreenRender',
      eventPayload: {
        name: 'Account Screen Render',
      },
    });
  }, []);

  return (
    <ScrollView style={style.mainContainer}>
      <View style={style.container}>
        <AnimatedLoaderButton
          title="Analytic Button"
          alignSelfCenter
          onPress={() => {
            AnalyticEvent({
              eventName: 'analyticButtonPress',
              eventPayload: {
                name: 'Jaskirat Singh',
                email: 'jaskirat.singh@weexcel.in',
              },
            });
          }}
        />
        <BaseText
          children={`Crashlytics is currently ${enabled ? 'enabled' : 'disabled'}`}
          style={theme.fonts.displayMedium}
        />
        <AnimatedLoaderButton
          title="Toggle Crashlytics"
          onPress={toggleCrashlytics}
        />
        <AnimatedLoaderButton
          title="Crash"
          onPress={() => crashlytics().crash()}
        />
        {/* other crash */}
        {/* <Button
            children={'Test Crash'}
            onPress={() => {
              reff?.current?.present();
            }}
          /> */}
        <AnimatedLoaderButton
          title="Todo List"
          onPress={() => appStackParamList.navigate('TodoScreen')}
        />
      </View>
    </ScrollView>
  );
};

export default HomeScreen;

const style = StyleSheet.create({
  mainContainer: {
    flex: 1,
    width: '100%',
    padding: ms(15),
  },
  container: {
    height: '100%',
    width: '100%',
    gap: vs(10),
    alignItems: 'center',
  },
});
