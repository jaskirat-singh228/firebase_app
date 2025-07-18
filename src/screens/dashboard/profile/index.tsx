import auth from '@react-native-firebase/auth';
import {GoogleSignin} from '@react-native-google-signin/google-signin';
import {useNavigation} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import BaseImageView from 'components/base_components/base_image_view';
import BaseText from 'components/base_components/base_text';
import AnimatedLoaderButton from 'components/molecules/animated_loader_button';
import {useDialog} from 'context/app_dialog_provider';
import React from 'react';

import {ScrollView, StyleSheet, View} from 'react-native';
import {
  Button,
  MaterialBottomTabScreenProps,
  useTheme,
} from 'react-native-paper';
import {useDispatch, useSelector} from 'react-redux';
import {RootState} from 'store';
import {
  AppStackParamList,
  DashbordBottomTabBarParamList,
} from 'types/navigation_types';
import {SCREEN_HEIGHT, SCREEN_WIDTH} from 'utilities/constants';
import {vs} from 'utilities/scale_utils';
import {logoutUser, showToast} from 'utilities/utils';

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
  const {showDialog, hideDialog} = useDialog();
  const dispatch = useDispatch();

  const userData = useSelector((state: RootState) => state.loginData.loginData);

  const handleLogoutClick = React.useCallback(() => {
    showDialog({
      message: 'Do you want to logout?',
      title: 'Logout',
      actionType: 'error',
      isConfirmDestructive: true,
      onConfirm: async () => {
        try {
          await auth().signOut();
          await GoogleSignin.signOut();
          logoutUser(dispatch);
          showToast('User logged out successfully!', 'success');
        } catch (error) {
          console.error('Firebase sign out error:', error);
          showToast('Failed to logout. Try again.', 'error');
        } finally {
          hideDialog();
        }
      },
      onDismiss: hideDialog,
    });
  }, []);

  return (
    <ScrollView contentContainerStyle={style.scrollContentContainer}>
      <View style={style.container}>
        <BaseText
          style={theme.fonts.displayMedium}
          children={`Email: ${userData?.userEmail ?? ''}`}
        />
        <AnimatedLoaderButton
          isLoading={false}
          title={'Logout'}
          onPress={handleLogoutClick}
        />
      </View>
    </ScrollView>
  );
};
export default ProfileScreen;

const style = StyleSheet.create({
  scrollContentContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  container: {
    height: '100%',
    width: '100%',
    gap: vs(20),
  },
});
