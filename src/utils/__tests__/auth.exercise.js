// Testing Pure Functions

// 💣 remove this todo test (it's only here so you don't get an error about missing tests)

// 🐨 import the function that we're testing
import cases from 'jest-in-case';
import {isPasswordAllowed} from '../auth';
// 💰 import {isPasswordAllowed} from '../auth'

// 🐨 write tests for valid and invalid passwords
function casify(obj) {
  return Object.entries(obj).map(([name, password]) => ({
    name: `${password} - ${name}`,
    password,
  }));
}
cases(
  'isPasswordAllowed: valid pw',
  ({password}) => {
    expect(isPasswordAllowed(password)).toBe(true);
  },
  casify({'valid password': '!aBc123'}),
);

describe('isAllowed test', () => {
  const validPWs = ['!aBc123'];
  const invalidPWs = [
    'a2c!',
    '123456!',
    'ABCdef!',
    'abc123!',
    'ABC123!',
    'ABCdef123',
  ];
  validPWs.forEach((pw) => {
    test(`valid pw test: ${pw}`, () => {
      expect(isPasswordAllowed(pw)).toBe(true);
    });
  });
  invalidPWs.forEach((pw) => {
    test(`invalid pw test ${pw}`, () => {
      expect(isPasswordAllowed(pw)).toBe(false);
    });
  });
});

// 💰 here are some you can use:
//
// valid:
// - !aBc123
//
// invalid:
