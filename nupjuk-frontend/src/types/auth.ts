export type LoginResponse = {
  token: string;
};

export type MessageResponse = {
  message: string;
};

export type RegisterRequestBody = {
  username: string;
  email: string;
  password: string;
  message?: string;
};

export type ForgotPasswordRequestBody = {
  username: string;
  email: string;
};

export type ForgotPasswordResponse = {
  message: string;
  tempPasswordAssigned: boolean;
};
