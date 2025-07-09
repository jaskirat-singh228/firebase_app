import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {useThemeContext} from 'context/theme_provider';
import AppNavigator from 'navigation/app_navigator';
import AuthenticationNavigator from 'navigation/auth_navigator';
import React from 'react';
import {useTheme} from 'react-native-paper';
import {useSelector} from 'react-redux';
import {RootState} from 'store';

const RootStack = createNativeStackNavigator();

const RootNavigator: React.FC = () => {
  const userLoginStatus = useSelector((state: RootState) => state.loginData);
  const {isDarkTheme} = useThemeContext();
  const theme = useTheme();

  return (
    <NavigationContainer
      theme={{
        dark: isDarkTheme,
        colors: {
          primary: theme.colors.primary,
          background: theme.colors.background,
          card: theme.colors.background,
          text: theme.colors.textColor.regular,
          border: theme.colors.primary,
          notification: theme.colors.background,
        },
        fonts: {
          regular: {
            fontFamily: theme.fonts.regular.fontFamily,
            fontWeight: 'normal',
          },
          medium: {
            fontFamily: theme.fonts.semiBold.fontFamily,
            fontWeight: 'normal',
          },
          bold: {
            fontFamily: theme.fonts.bold.fontFamily,
            fontWeight: 'bold',
          },
          heavy: {
            fontFamily: theme.fonts.bold.fontFamily,
            fontWeight: 'bold',
          },
        },
      }}>
      <RootStack.Navigator
        screenOptions={{
          headerShown: false,
          statusBarStyle: isDarkTheme ? 'light' : 'dark',
          statusBarTranslucent: false,
          statusBarBackgroundColor: theme.colors.statusBar.backgroundColor,
        }}>
        {userLoginStatus.isUserLoggedIn ? (
          <RootStack.Screen name={'AppNavigator'} component={AppNavigator} />
        ) : (
          <RootStack.Screen
            name={'AuthenticationNavigator'}
            component={AuthenticationNavigator}
          />
        )}
      </RootStack.Navigator>
    </NavigationContainer>
  );
};

export default RootNavigator;
