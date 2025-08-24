import { ValidateUser } from '.';

declare namespace Express {
  export interface Request {
    user?: ValidateUser;
  }
}
