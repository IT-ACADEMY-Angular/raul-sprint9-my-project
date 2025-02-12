export interface User {
  id: number;
  email: string;
  name: string;
  lastName: string;
  phone: string;
  photoUrl?: string;
}

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
