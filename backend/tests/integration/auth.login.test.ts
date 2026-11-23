import request from 'supertest';
import bcrypt from 'bcryptjs';
import { describe, expect, it } from 'vitest';
import { app } from '../../src/app';
import { verifyAuthToken } from '../../src/lib/jwt';
import { ErrorMessages } from '../../src/constants/errorMessages.constants';
import { resetDatabaseBeforeEachTest } from '../setup/resetDatabaseBeforeEachTest';
import { createUser } from '../helpers/factories';
import {
  TestApiPaths,
  TEST_BCRYPT_ROUNDS,
  TEST_PASSWORD,
  TEST_UNKNOWN_EMAIL,
  TEST_WRONG_PASSWORD,
} from '../helpers/test.constants';

/**
 * @description A user who can log in with TEST_PASSWORD.
 */
const createUserWithPassword = async () =>
  createUser({ passwordHash: await bcrypt.hash(TEST_PASSWORD, TEST_BCRYPT_ROUNDS) });

/**
 * @description Posts a login attempt.
 */
const login = (email: string, password: string) =>
  request(app).post(TestApiPaths.login()).send({ email, password });

describe('POST /auth/login', () => {
  resetDatabaseBeforeEachTest();

  it('issues an access token for the right email and password', async () => {
    const user = await createUserWithPassword();

    const response = await login(user.email, TEST_PASSWORD).expect(200);

    expect(verifyAuthToken(response.body.data.accessToken).userId).toBe(user.id);
  });

  // Every failure gets the same 401 and message, so a caller can't tell which part was wrong.
  describe('rejects with the same 401', () => {
    it('for a wrong password', async () => {
      const user = await createUserWithPassword();

      const response = await login(user.email, TEST_WRONG_PASSWORD).expect(401);

      expect(response.body.message).toBe(ErrorMessages.INVALID_CREDENTIALS);
    });

    it('for an email no user has', async () => {
      const response = await login(TEST_UNKNOWN_EMAIL, TEST_PASSWORD).expect(401);

      expect(response.body.message).toBe(ErrorMessages.INVALID_CREDENTIALS);
    });

    it('for a user who has no password, such as one who joined with Google', async () => {
      const user = await createUser({ passwordHash: null });

      const response = await login(user.email, TEST_PASSWORD).expect(401);

      expect(response.body.message).toBe(ErrorMessages.INVALID_CREDENTIALS);
    });
  });
});
