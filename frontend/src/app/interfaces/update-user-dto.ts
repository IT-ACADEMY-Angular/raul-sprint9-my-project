export interface UpdateUserDto {
  id: number;
  name: string;
  lastName: string;
  email: string;
  phone: string;
  password?: string;
}
