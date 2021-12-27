import jwt from 'jsonwebtoken';

/**
 * 회원가입시 사용될 토큰을 생성하는 함수
 * 생성된 사용자 id를 받아 하루가 지나면 expire 하는 jwt를 생성
 */
export const makeSignUpToken = (id: string) => {
  if (!process.env.SIGNUP_TOKEN_SECRET)
    throw new Error('There is no secret key for signup token');

  return jwt.sign({ id }, process.env.SIGNUP_TOKEN_SECRET, {
    algorithm: 'HS256',
    expiresIn: '1d', // 이메일 만료시간 1일
  });
};
