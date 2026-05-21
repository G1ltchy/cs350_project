import axios from "axios";
import type {
  ForgotPasswordRequestBody,
  LoginResponse,
  MessageResponse,
  RegisterRequestBody
} from "../types/auth";

const API_BASE_URL = "http://localhost:3000/api";

export async function login(
  username: string,
  password: string
): Promise<string> {
  const response = await axios.post<LoginResponse>(
    `${API_BASE_URL}/auth/login`,
    { username, password }
  );

  return response.data.token;
}

export async function registerRequest(
  body: RegisterRequestBody
): Promise<MessageResponse> {
  const response = await axios.post<MessageResponse>(
    `${API_BASE_URL}/auth/register-request`,
    body
  );

  return response.data;
}

export async function forgotPasswordRequest(
  body: ForgotPasswordRequestBody
): Promise<MessageResponse> {
  const response = await axios.post<MessageResponse>(
    `${API_BASE_URL}/auth/forgot-password-request`,
    body
  );

  return response.data;
}
