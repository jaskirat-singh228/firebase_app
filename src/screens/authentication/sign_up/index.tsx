import {useNetInfo} from '@react-native-community/netinfo';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import BaseTextInput from 'components/base_components/base_text_input';
import FullScreenContainer from 'components/hoc/full_screen_container';
import AnimatedLoaderButton from 'components/molecules/animated_loader_button';
import {BackWithTitleHeader} from 'components/molecules/back_with_title_view';
import React from 'react';
import {Controller, useForm} from 'react-hook-form';
import {KeyboardAvoidingView, ScrollView, StyleSheet} from 'react-native';
import {TextInput, useTheme} from 'react-native-paper';
import {AuthenticationStackParamList} from 'types/navigation_types';
import {ms, vs} from 'utilities/scale_utils';
import {useFirebaseSignUp} from '../../../hooks/firebase/authentication/useFirebseSignUp';
import {TFormData} from '../login';

type SignUpScreenProps = NativeStackScreenProps<
  AuthenticationStackParamList,
  'SignUpScreen'
>;

const SignUpScreen: React.FC<SignUpScreenProps> = props => {
  const theme = useTheme();
  const {isConnected} = useNetInfo();
  const {firebaseSignUp, isSignUpLoading} = useFirebaseSignUp(isConnected);
  const [showPassword, setShowPassword] = React.useState<boolean>(false);

  const {
    control,
    reset,
    handleSubmit,
    setValue,
    setError,
    formState: {errors},
  } = useForm<TFormData>();

  return (
    <FullScreenContainer>
      <BackWithTitleHeader title="Sign up" />
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
            isLoading={isSignUpLoading}
            title={'Sign Up'}
            onPress={handleSubmit(firebaseSignUp)}
          />
        </KeyboardAvoidingView>
      </ScrollView>
    </FullScreenContainer>
  );
};

export default SignUpScreen;

const style = StyleSheet.create({
  scrollContentContainer: {
    flex: 1,
    justifyContent: 'center',
    gap: vs(20),
  },
});
