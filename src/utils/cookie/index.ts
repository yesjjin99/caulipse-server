/**
 *
 * @param cookies 쿠키 하나에 대한 정보를 가지는 문자열
 * @returns 쿠키에 대한 정보를 가지는 객체 하나, name 프로퍼티에 쿠키의 이름,
 *   values 프로퍼티에 쿠키의 값이 저장되고 flags 프로퍼티에 배열의 형태로 기타 정보가 저장됨
 */
export const parseCookie = (cookies: string) => {
  const values = cookies.split('; ');
  const [name, value] = values[0].split('=');
  const flags = values.slice(1).map((str) => str.split('='));
  return { name, value, flags };
};
