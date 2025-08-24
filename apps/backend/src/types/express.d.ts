import { TCurrentUser } from './jwt';

declare namespace Express {
  export interface Request {
    user?: TCurrentUser;
  }
}
