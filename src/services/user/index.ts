import bcrypt from 'bcrypt';
import { getRepository } from 'typeorm';
import User, { UserRoleEnum } from '../../entity/UserEntity';
import { makeSignUpToken } from '../../utils/auth';

interface SaveUserDTO {
  id: string;
  email: string;
  password: string;
}

export const saveUser = async ({ id, email, password }: SaveUserDTO) => {
  return await getRepository(User)
    .createQueryBuilder()
    .insert()
    .values({
      id,
      email,
      password: bcrypt.hashSync(password, 10),
      isLogout: false,
      role: UserRoleEnum.GUEST,
      token: makeSignUpToken(id),
    })
    .execute();
};

export const changeUserRoleById = async (id: string) => {
  return await getRepository(User)
    .createQueryBuilder()
    .update()
    .set({
      role: UserRoleEnum.USER,
    })
    .where('id = :id', { id })
    .andWhere(`role = 'GUEST'`)
    .execute();
};

export const findUserByEmail = async (email: string) => {
  return await getRepository(User)
    .createQueryBuilder()
    .select()
    .where('email = :email', { email })
    .getOne();
};
