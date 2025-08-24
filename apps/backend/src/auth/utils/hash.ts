import * as argon2 from 'argon2';

export const hashValue = async (password: string) => {
  return argon2.hash(password, {
    type: argon2.argon2id,
    memoryCost: 2 ** 8,
    timeCost: 5,
    parallelism: 1,
  });
};

export const validateValue = async (
  plainPassword: string,
  hashedPassword: string,
) => {
  try {
    return argon2.verify(hashedPassword, plainPassword);
  } catch (e) {
    console.error(e);
    return false;
  }
};
