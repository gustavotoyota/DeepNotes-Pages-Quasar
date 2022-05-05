import * as argon2Browser from 'argon2-browser';

declare global {
  // eslint-disable-next-line no-var
  var argon2: typeof argon2Browser;
}
