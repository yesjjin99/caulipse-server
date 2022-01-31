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

export const findUserById = async (id: string) => {
  const user = await getRepository(User)
    .createQueryBuilder('user')
    .where('user.id = :id', { id })
    .getOne();

  if (!user) throw new Error('데이터베이스에 일치하는 요청값이 없습니다');
  // status 404

  return user;
};

interface UpdateUserDTO {
  email: string;
  password: string;
  isLogout: boolean;
  token: string;
  role: UserRoleEnum;
}

export const updateUserById = async (id: string, data: UpdateUserDTO) => {
  const { email, password, isLogout, token, role } = data;
  return await getRepository(User)
    .createQueryBuilder()
    .update()
    .set({ email, password, isLogout, token, role })
    .where('id = :id', { id })
    .execute();
};

export const deleteUserById = async (id: string) => {
  return await getRepository(User)
    .createQueryBuilder()
    .delete()
    .where('id = :id', { id })
    .execute();
};