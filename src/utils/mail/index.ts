export const validateCAU = (email: string): boolean => {
  const [, latter] = email.split('@');
  if (latter !== 'cau.ac.kr') return false;
  return true;
};
