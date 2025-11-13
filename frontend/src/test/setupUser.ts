import userEvent from '@testing-library/user-event';
import { act } from 'react';

type UserEventApi = ReturnType<typeof userEvent.setup>;

export const setupUser = () => {
  const user = userEvent.setup();
  return new Proxy(user, {
    get(target, property, receiver) {
      const value = Reflect.get(target, property, receiver) as unknown;
      if (typeof value !== 'function') {
        return value;
      }

      return async (...args: unknown[]) => {
        let result: unknown;
        await act(async () => {
          result = await (value as (...innerArgs: unknown[]) => unknown).apply(target, args);
        });
        return result;
      };
    },
  }) as UserEventApi;
};
