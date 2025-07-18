import {useNetInfo} from '@react-native-community/netinfo';
import {GoogleSignin} from '@react-native-google-signin/google-signin';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import BaseTextInput from 'components/base_components/base_text_input';
import AnimatedLoaderButton from 'components/molecules/animated_loader_button';
import React from 'react';
import {Controller, useForm} from 'react-hook-form';
import {KeyboardAvoidingView, ScrollView, StyleSheet} from 'react-native';
import {TextInput, useTheme} from 'react-native-paper';
import {AuthenticationStackParamList} from 'types/navigation_types';
import {ms, vs} from 'utilities/scale_utils';
import {useFirebaseGoogleSignUp} from '../../../hooks/firebase/authentication/useFirebaseGoogleSignUp';
import {useFirebaseLogin} from '../../../hooks/firebase/authentication/useFirebaseLogin';

type LoginScreenProps = NativeStackScreenProps<
  AuthenticationStackParamList,
  'LoginScreen'
>;

export type TFormData = {
  email: string;
  password: string;
};

const LoginScreen: React.FC<LoginScreenProps> = props => {
  const theme = useTheme();
  const {isConnected} = useNetInfo();
  const {isSignUpLoading, signInWithGoogle} = useFirebaseGoogleSignUp(
    isConnected ?? false,
  );
  const {isLoginLoading, firebaseLogin} = useFirebaseLogin(
    isConnected ?? false,
  );
  const [showPassword, setShowPassword] = React.useState<boolean>(false);

  const {
    control,
    reset,
    handleSubmit,
    setValue,
    setError,
    formState: {errors},
  } = useForm<TFormData>();

  React.useEffect(() => {
    GoogleSignin.configure({
      webClientId:
        '355681824510-0n8rtf91fflsf28a0tfqp1a5vfp6jvdf.apps.googleusercontent.com',
    });
  }, []);

  return (
    <ScrollView contentContainerStyle={style.scrollContentContainer}>
      <KeyboardAvoidingView
        behavior={'padding'}
        keyboardVerticalOffset={vs(30)}
        style={{
          width: '100%',
          paddingHorizontal: ms(15),
          justifyContent: 'center',
          alignItems: 'center',
        }}>
        <Controller
          control={control}
          name={'email'}
          rules={{required: 'Email cannot be empty!'}}
          render={({field: {onBlur, value}}) => (
            <BaseTextInput
              value={value}
              onChangeText={text => {
                setValue('email', text);
                setError('email', {message: ''});
              }}
              onBlur={onBlur}
              outlineColor={theme.colors.borderColor.regular}
              labelValue={'Email'}
              placeholder={'Enter Email...'}
              errorValue={errors?.email?.message ?? ''}
            />
          )}
        />
        <Controller
          control={control}
          name={'password'}
          rules={{required: 'Password cannot be empty!'}}
          render={({field: {onBlur, value}}) => (
            <BaseTextInput
              value={value}
              onChangeText={text => {
                setValue('password', text);
                setError('password', {message: ''});
              }}
              onBlur={onBlur}
              outlineColor={theme.colors.borderColor.regular}
              labelValue={'Password'}
              placeholder={'Enter Password...'}
              secureTextEntry={!showPassword}
              right={
                <TextInput.Icon
                  icon={showPassword ? 'eye-off' : 'eye'}
                  onPress={() => setShowPassword(prev => !prev)}
                />
              }
              errorValue={errors?.password?.message ?? ''}
            />
          )}
        />

        <AnimatedLoaderButton
          isLoading={isLoginLoading}
          title={'Login'}
          onPress={handleSubmit(firebaseLogin)}
        />
        <AnimatedLoaderButton
          title={'Sign In'}
          onPress={() => props.navigation.navigate('SignUpScreen')}
        />
        <AnimatedLoaderButton
          isLoading={isSignUpLoading}
          title={'Login with google'}
          onPress={signInWithGoogle}
        />
      </KeyboardAvoidingView>
    </ScrollView>
  );
};

export default LoginScreen;

const style = StyleSheet.create({
  scrollContentContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    height: '100%',
    width: '100%',
  },
});
