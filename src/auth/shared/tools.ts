import { genSaltSync, hashSync } from 'bcryptjs';

export const getHashPassword = (password) => {
  const salt = genSaltSync(10);
  const hash = hashSync(password, salt);

  return hash;
};
