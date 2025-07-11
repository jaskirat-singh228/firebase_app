export type TValidateLoginDetailResponse = {
  success: boolean;
  message: string;
  responseData: TValidateLoginDetailData;
};

export type TValidateLoginDetailData = {
  userEmail: string;
  userPassword?: string;
  token: string;
  providerId: string;
  // refreshToken: string;
};
