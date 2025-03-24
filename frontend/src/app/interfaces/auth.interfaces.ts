import { User } from "./user.interface";

export interface LoginResponse {
  message: string;
  user: Omit<User, 'password'>;
}

export interface RegisterPayload {
  name: string;
  lastName: string;
  email: string;
  password: string;
  phone: string;
}
