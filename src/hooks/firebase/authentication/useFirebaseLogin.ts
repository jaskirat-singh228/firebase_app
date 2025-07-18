import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import React from 'react';
import {SubmitHandler} from 'react-hook-form';
import {useDispatch} from 'react-redux';
import {TFormData} from 'screens/authentication/login';
import {
  TValidateLoginDetailData,
  TValidateLoginDetailResponse,
} from 'types/api_response_data_models';
import {loginUser, showToast} from 'utilities/utils';

export const useFirebaseLogin = (isConnected: boolean | null) => {
  const [isLoginLoading, setIsLoginLoading] = React.useState<boolean>(false);
  const dispatch = useDispatch();

  const firebaseLogin: SubmitHandler<TFormData> = async values => {
    setIsLoginLoading(true);
    try {
      if (isConnected) {
        try {
          const isUserPresent = await firestore()
            .collection('Users')
            .where('email', '==', values?.email ?? '')
            .get();
          const isPassword = isUserPresent.docs[0].data().password;
          if (isPassword === '')
            return showToast('Login with google.', 'error');
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
          userId: res.user.uid,
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
        if (isConnected) {
          loginUser(dispatch, response);
          showToast(response.message, 'success');
        } else
          return showToast(
            'No internet available! Please check your internet connection.',
            'error',
          );
      }
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

  return {isLoginLoading, firebaseLogin};
};
