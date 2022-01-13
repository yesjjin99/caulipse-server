export type RequestWithParams = {
  parameters: Record<string, string>;
};

export const isRequestWithParams = (arg: unknown): arg is RequestWithParams => {
  if (typeof arg !== 'object') return false;
  if (Object.prototype.hasOwnProperty.call(arg, 'parameters')) return false;
  return true;
};
