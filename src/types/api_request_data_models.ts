export type TRefreshTokenRequest = {
  refreshToken: string;
};

export type TAddTodoRequest = {
  todo: string;
  completed: boolean;
  userId: number;
};
