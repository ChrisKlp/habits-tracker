import * as users from './users';
import * as sessions from './sessions';

export * from './users';
export * from './sessions';

export const schema = {
  ...users,
  ...sessions,
};

export type Schema = typeof schema;

export default schema;
