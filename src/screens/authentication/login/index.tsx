import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import {GoogleSignin} from '@react-native-google-signin/google-signin';
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

type TFirebaseUserData = {
  email: string;
  password: string;
  providerId: string;
  createdAt: string;
  key?: string;
};

const LoginScreen: React.FC<LoginScreenProps> = props => {
  const theme = useTheme();
  const dispatch = useDispatch();
  const [isLoading, setIsLoading] = React.useState<boolean>(false);
  const [isLoginLoading, setIsLoginLoading] = React.useState<boolean>(false);
  const [showPassword, setShowPassword] = React.useState<boolean>(false);
  const [userList, setUserList] = React.useState<TFirebaseUserData[]>([]);

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

  const signInWithGoogle = async () => {
    try {
      // Sign in with Google
      await GoogleSignin.hasPlayServices();
      const {data, type} = await GoogleSignin.signIn();
      const idToken = data?.idToken ?? null;

      // Create a Firebase credential with the token
      const googleCredential = auth.GoogleAuthProvider.credential(idToken);
      // Sign-in the user with the credential
      setIsLoading(true);
      const userCredential =
        await auth().signInWithCredential(googleCredential);
      const token = (await userCredential.user.getIdToken()) ?? '';
      const userId = userCredential.user.uid;

      await firestore().collection('Users').doc(userId).set({
        email: userCredential.user.email,
        password: '',
        token: token,
        providerId: userCredential.additionalUserInfo?.providerId,
        createdAt: firestore.FieldValue.serverTimestamp(),
      });

      let responseData: TValidateLoginDetailData = {
        userEmail: userCredential.user.email ?? '',
        token: token,
        providerId: userCredential.user.providerId,
      };

      let response: TValidateLoginDetailResponse = {
        success: true,
        message: 'User logged in successfully!',
        responseData: responseData,
      };
      if (type === 'success') {
        loginUser(dispatch, response);
        showToast(response.message, 'success');
      } else return;
    } catch (error: any) {
      if (error.code === 'auth/internal-error') return;
    } finally {
      setIsLoading(false);
    }
  };

  const submitClickHandler: SubmitHandler<TFormData> = async values => {
    setIsLoginLoading(true);
    try {
      try {
        const isUserPresent = await firestore()
          .collection('Users')
          .where('email', '==', values?.email ?? '')
          .get();
        const isPassword = isUserPresent.docs[0].data().password;
        if (isPassword === '') return showToast('Login with google.', 'error');
      } catch (error) {
        console.log(error, '===>ERROR');
      }
      const res = await auth().signInWithEmailAndPassword(
        values.email,
        values.password,
      );
      const token = (await res.user?.getIdToken()) ?? '';
      const providerId = res.additionalUserInfo?.providerId ?? '';
      let data: TValidateLoginDetailData = {
        userEmail: values.email,
        userPassword: values.password,
        token: token,
        providerId: providerId,
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
      } else if (error.code === 'auth/invalid-credential') {
        showToast('Invalid credentials!', 'error');
      } else if (error.code === 'auth/too-many-requests') {
        showToast(
          'We have blocked all requests from this device due to unusual activity. Try again later.',
          'error',
        );
      }
    } finally {
      setIsLoginLoading(false);
    }
  };

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
          isLoading={isLoginLoading}
          title={'Login'}
          onPress={handleSubmit(submitClickHandler)}
        />
        <AnimatedLoaderButton
          title={'Sign In'}
          onPress={() => props.navigation.navigate('SignUpScreen')}
        />
        <AnimatedLoaderButton
          isLoading={isLoading}
          title={'Login with google'}
          onPress={signInWithGoogle}
        />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default LoginScreen;
