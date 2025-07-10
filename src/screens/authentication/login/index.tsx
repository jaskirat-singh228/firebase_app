import auth from '@react-native-firebase/auth';
import {
  GoogleSignin,
  isErrorWithCode,
  statusCodes,
} from '@react-native-google-signin/google-signin';
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

type LoginScreenProps = NativeStackScreenProps<
  AuthenticationStackParamList,
  'LoginScreen'
>;

type TFormData = {
  email: string;
  password: string;
};

const LoginScreen: React.FC<LoginScreenProps> = props => {
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

  React.useEffect(() => {
    GoogleSignin.configure({
      webClientId:
        '980590160503-hnfoo8vc0r66gbqpuciomj4bd5dd22ta.apps.googleusercontent.com',
      iosClientId:
        '980590160503-5hkbjoa71pah8s9eoqe9lehm2n74oaqi.apps.googleusercontent.com',
    });
  }, []);

  // const signInWithGoogle = async () => {
  //   try {
  //     // Sign in with Google
  //     await GoogleSignin.hasPlayServices();
  //     const googleSignInResult = await GoogleSignin.signIn();

  //     console.log(googleSignInResult, '<<<<<<<<=====googleSignInResult');
  //     const idToken = googleSignInResult.data?.idToken ?? null;

  //     // Create a Firebase credential with the token
  //     const googleCredential = auth.GoogleAuthProvider.credential(idToken);

  //     // Sign-in the user with the credential
  //     const userCredential =
  //       await auth().signInWithCredential(googleCredential);

  //     console.log('User signed in with Google:', userCredential.user);
  //     return auth().signInWithCredential(googleCredential);
  //   } catch (error: any) {
  //     if (error.code === 'auth/internal-error') {
  //       showToast('An internal error has occurred, please try again!', 'error');
  //     }
  //     console.error('Google Sign-In Error:', error);
  //   }
  // };

  // Somewhere in your code
  const signInWithGoogle = async () => {
    try {
      const value = await GoogleSignin.hasPlayServices();
      console.log('hasPlayServices ==> ', value);

      GoogleSignin.hasPlayServices()
        .then(hasPlayService => {
          if (hasPlayService) {
            GoogleSignin.signIn()
              .then(userInfo => {
                console.log(JSON.stringify(userInfo));
              })
              .catch(e => {
                console.log('ERROR IS: ' + JSON.stringify(e));
              });
          }
        })
        .catch(e => {
          console.log('ERROR IS: ' + JSON.stringify(e));
        });
    } catch (error) {
      console.log(
        'Google Sign in error ===> ',
        JSON.stringify(error, null, ' '),
      );
      if (isErrorWithCode(error)) {
        switch (error.code) {
          case statusCodes.IN_PROGRESS:
            // operation (eg. sign in) already in progress
            break;
          case statusCodes.PLAY_SERVICES_NOT_AVAILABLE:
            // Android only, play services not available or outdated
            break;
          default:
          // some other error happened
        }
      } else {
        // an error that's not related to google sign in occurred
      }
    }
  };

  const submitClickHandler: SubmitHandler<TFormData> = React.useCallback(
    async values => {
      setIsLoading(true);
      try {
        const res = await auth().signInWithEmailAndPassword(
          values.email,
          values.password,
        );

        console.log('Response ==> ', JSON.stringify(res));

        const token = (await res.user?.getIdToken()) ?? '';

        let data: TValidateLoginDetailData = {
          userEmail: values.email,
          userPassword: values.password,
          token: token,
        };

        let response: TValidateLoginDetailResponse = {
          success: true,
          message: 'User logged in successfully!',
          responseData: data,
        };
        loginUser(dispatch, response);
        showToast(response.message, 'success');
      } catch (error: any) {
        console.log(error);

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
          title={'Login'}
          onPress={handleSubmit(submitClickHandler)}
        />
        <AnimatedLoaderButton
          title={'Sign In'}
          onPress={() => props.navigation.navigate('SignUpScreen')}
        />
        <AnimatedLoaderButton
          title={'Login with google'}
          onPress={signInWithGoogle}
        />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default LoginScreen;
