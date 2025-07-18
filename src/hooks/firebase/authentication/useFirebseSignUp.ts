import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import {useNavigation} from '@react-navigation/native';
import React from 'react';
import {SubmitHandler} from 'react-hook-form';
import {TFormData} from 'screens/authentication/login';
import {showToast} from 'utilities/utils';

export const useFirebaseSignUp = (isConnected: boolean | null) => {
  const navigation = useNavigation();
  const [isSignUpLoading, setIsSignUpLoading] = React.useState<boolean>(false);

  const firebaseSignUp: SubmitHandler<TFormData> = React.useCallback(
    async values => {
      setIsSignUpLoading(true);
      try {
        if (isConnected) {
          const res = await auth().createUserWithEmailAndPassword(
            values.email,
            values.password,
          );

          const userId = res.user.uid;
          await firestore().collection('Users').doc(userId).set({
            userId: userId,
            email: values.email,
            password: values.password,
            providerId: res.additionalUserInfo?.providerId,
            createdAt: firestore.FieldValue.serverTimestamp(),
          });

          navigation.goBack();
          showToast(
            'You are registered successfuly, login with same credentials!',
            'success',
          );
        }
      } catch (error: any) {
        if (error.code === 'auth/invalid-email') {
          showToast('The email address is badly formatted!', 'error');
        } else if (error.code === 'auth/weak-password') {
          showToast('The given password is too weak!', 'error');
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
        setIsSignUpLoading(false);
      }
    },
    [],
  );

  return {isSignUpLoading, firebaseSignUp};
};
