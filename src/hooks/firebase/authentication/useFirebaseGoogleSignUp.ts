import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import {GoogleSignin} from '@react-native-google-signin/google-signin';
import React from 'react';
import {useDispatch} from 'react-redux';
import {
  TValidateLoginDetailData,
  TValidateLoginDetailResponse,
} from 'types/api_response_data_models';
import {loginUser, showToast} from 'utilities/utils';

export const useFirebaseGoogleSignUp = (isConnected: boolean | null) => {
  const [isSignUpLoading, setIsSignUpLoading] = React.useState<boolean>(false);
  const dispatch = useDispatch();

  const signInWithGoogle = async () => {
    try {
      if (isConnected) {
        // Sign in with Google
        await GoogleSignin.hasPlayServices();
        const {data, type} = await GoogleSignin.signIn();
        const idToken = data?.idToken ?? null;

        // Create a Firebase credential with the token
        const googleCredential = auth.GoogleAuthProvider.credential(idToken);
        // Sign-in the user with the credential
        setIsSignUpLoading(true);
        const userCredential =
          await auth().signInWithCredential(googleCredential);
        const token = (await userCredential.user.getIdToken()) ?? '';
        const userId = userCredential.user.uid;

        await firestore().collection('Users').doc(userId).set({
          userId: userId,
          email: userCredential.user.email,
          password: '',
          token: token,
          providerId: userCredential.additionalUserInfo?.providerId,
          createdAt: firestore.FieldValue.serverTimestamp(),
        });

        let responseData: TValidateLoginDetailData = {
          userId: userCredential.user.uid,
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
      } else {
        return showToast(
          'No internet available! Please check your internet connection.',
          'error',
        );
      }
    } catch (error: any) {
      if (error.code === 'auth/internal-error') return;
    } finally {
      setIsSignUpLoading(false);
    }
  };
  return {isSignUpLoading, signInWithGoogle};
};
