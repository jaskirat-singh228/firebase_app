import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import BaseTextInput from 'components/base_components/base_text_input';
import AnimatedLoaderButton from 'components/molecules/animated_loader_button';
import React from 'react';
import {Controller, SubmitHandler, useForm} from 'react-hook-form';
import {KeyboardAvoidingView, SafeAreaView} from 'react-native';
import {TextInput, useTheme} from 'react-native-paper';
import {useDispatch} from 'react-redux';
import {
  TValidateLoginDetailData,
  TValidateLoginDetailResponse,
} from 'types/api_response_data_models';
import {AuthenticationStackParamList} from 'types/navigation_types';
import {ms, vs} from 'utilities/scale_utils';
import {loginUser, showToast} from 'utilities/utils';

type SignUpScreenProps = NativeStackScreenProps<
  AuthenticationStackParamList,
  'SignUpScreen'
>;

type TFormData = {
  email: string;
  password: string;
};

const SignUpScreen: React.FC<SignUpScreenProps> = props => {
  const theme = useTheme();
  const [isLoading, setIsLoading] = React.useState<boolean>(false);
  const [showPassword, setShowPassword] = React.useState<boolean>(false);

  const {
    control,
    reset,
    handleSubmit,
    setValue,
    setError,
    formState: {errors},
  } = useForm<TFormData>();

  const dispatch = useDispatch();

  const submitClickHandler: SubmitHandler<TFormData> = React.useCallback(
    async values => {
      setIsLoading(true);
      try {
        const res = await auth().createUserWithEmailAndPassword(
          values.email,
          values.password,
        );

        showToast('User signed up successfully!', 'success');

        let data: TValidateLoginDetailData = {
          userEmail: values.email,
          userPassword: values.password,
          token: (await res.user?.getIdToken()) ?? '',
        };

        let response: TValidateLoginDetailResponse = {
          success: true,
          message: 'User logged in successfully!',
          responseData: data,
        };
        loginUser(dispatch, response);

        const userId = res.user.uid;
        await firestore().collection('Users').doc(userId).set({
          email: values.email,
          password: values.password,
          createdAt: firestore.FieldValue.serverTimestamp(),
        });
      } catch (error: any) {
        if (error.code === 'auth/invalid-email') {
          showToast('The email address is badly formatted!', 'error');
        } else if (error.code === 'auth/weak-password') {
          showToast('The given password is invalid!', 'error');
        } else if (error.code === 'auth/email-already-in-use') {
          showToast(
            'The email address is already in use by another account!',
            'error',
          );
        } else {
          console.log(error, 'Unhandled signup error');
          showToast('Something went wrong. Try again!', 'error');
        }
      } finally {
        setIsLoading(false);
      }
    },
    [],
  );

  return (
    <SafeAreaView
      style={{
        flex: 1,
        backgroundColor: theme.colors.background,
        justifyContent: 'center',
        alignItems: 'center',
      }}>
      <KeyboardAvoidingView
        behavior={'padding'}
        keyboardVerticalOffset={vs(30)}
        style={{
          width: '100%',
          paddingHorizontal: ms(15),
          gap: ms(10),
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
          isLoading={isLoading}
          title={'Sign Up'}
          onPress={handleSubmit(submitClickHandler)}
        />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default SignUpScreen;
