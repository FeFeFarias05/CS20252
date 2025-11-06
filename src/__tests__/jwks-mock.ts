export { getToken, startJwksMock, stopJwksMock } from '../testUtils/jwks-mock';

// Keep a tiny placeholder test so Jest doesn't treat this file as an empty suite
test('jwks-mock helper (placeholder)', () => {
  expect(true).toBe(true);
});
