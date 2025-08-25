import * as users from './users';
import * as sessions from './sessions';
import * as profiles from './profiles';
import * as habits from './habits';
import * as habitLogs from './habitLogs';

export * from './users';
export * from './sessions';
export * from './profiles';
export * from './habits';
export * from './habitLogs';

export const schema = {
  ...users,
  ...sessions,
  ...profiles,
  ...habits,
  ...habitLogs,
};

export type Schema = typeof schema;

export default schema;
