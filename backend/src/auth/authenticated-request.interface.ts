import { Request } from 'express';
import { User } from '../users/users.entity';

export interface AuthenticatedRequest extends Request {
  user: Omit<User, 'password'>;
}
