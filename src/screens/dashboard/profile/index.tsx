import crashlytics from '@react-native-firebase/crashlytics';
import {useNavigation} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import BaseImageView from 'components/base_components/base_image_view';
import BaseText from 'components/base_components/base_text';
import AnimatedLoaderButton from 'components/molecules/animated_loader_button';
import React from 'react';

import {View} from 'react-native';
import {
  Button,
  MaterialBottomTabScreenProps,
  useTheme,
} from 'react-native-paper';
import {SafeAreaProvider, SafeAreaView} from 'react-native-safe-area-context';
import {
  AppStackParamList,
  DashbordBottomTabBarParamList,
} from 'types/navigation_types';
import {AnalyticEvent} from 'utilities/analytic_event';
import {SCREEN_HEIGHT, SCREEN_WIDTH} from 'utilities/constants';
import {globalStyle} from 'utilities/global_styles';

type ProfileScreenProps = MaterialBottomTabScreenProps<
  DashbordBottomTabBarParamList,
  'ProfileScreen'
>;

const DemoOne: React.FC = () => {
  return (
    <View
      style={{
        flex: 1,
        backgroundColor: 'red',
        justifyContent: 'center',
        alignItems: 'center',
      }}>
      <BaseImageView
        height={SCREEN_HEIGHT * 0.5}
        width={SCREEN_WIDTH * 0.5}
        source={{
          uri: 'https://upload.wikimedia.org/wikipedia/commons/e/e6/Clocktower_Panorama_20080622_20mb.jpg',
        }}
        borderRadius={14}
      />
    </View>
  );
};

const DemoTwo: React.FC = () => {
  const navigation =
    useNavigation<NativeStackNavigationProp<AppStackParamList>>();
  return (
    <View style={{flex: 1, backgroundColor: 'green'}}>
      <Button
        children={'Recepies Screen'}
        onPress={() => {
          navigation.navigate('RecipesScreen');
        }}
      />
    </View>
  );
};

const DemoThree: React.FC = () => {
  return <View style={{flex: 1, backgroundColor: 'blue'}}></View>;
};

const ProfileScreen: React.FC<ProfileScreenProps> = props => {
  const theme = useTheme();
  const [enabled, setEnabled] = React.useState(
    crashlytics().isCrashlyticsCollectionEnabled,
  );

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
    <SafeAreaProvider>
      <SafeAreaView style={globalStyle.screenContainer}>
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
        <View>
          <Button children="Toggle Crashlytics" onPress={toggleCrashlytics} />
          <Button children="Crash" onPress={() => crashlytics().crash()} />
          {/* <Button
            children={'Test Crash'}
            onPress={() => {
              reff?.current?.present();
            }}
          /> */}
          <BaseText
            children={`Crashlytics is currently ${enabled ? 'enabled' : 'disabled'}`}
          />
        </View>
      </SafeAreaView>
    </SafeAreaProvider>
  );
};

export default ProfileScreen;
