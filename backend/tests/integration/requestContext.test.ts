import request from 'supertest';
import { describe, expect, it } from 'vitest';
import { app } from '../../src/app';
import { REQUEST_ID_HEADER } from '../../src/constants/requestContext.constants';
import {
  TestApiPaths,
  TEST_INVALID_REQUEST_IDS,
  TEST_REQUEST_ID,
  TEST_UUID_PATTERN,
} from '../helpers/test.constants';

describe('request id', () => {
  it('generates one when the caller sends none', async () => {
    const response = await request(app).get(TestApiPaths.health());

    expect(response.get(REQUEST_ID_HEADER)).toMatch(TEST_UUID_PATTERN);
  });

  it('gives every request its own id', async () => {
    const first = await request(app).get(TestApiPaths.health());
    const second = await request(app).get(TestApiPaths.health());

    expect(first.get(REQUEST_ID_HEADER)).not.toBe(second.get(REQUEST_ID_HEADER));
  });

  it.each([TEST_REQUEST_ID, ...TEST_INVALID_REQUEST_IDS])(
    'uses its own id whatever the caller sends: %s',
    async (callerId) => {
      const response = await request(app)
        .get(TestApiPaths.health())
        .set(REQUEST_ID_HEADER, callerId);

      expect(response.get(REQUEST_ID_HEADER)).toMatch(TEST_UUID_PATTERN);
      expect(response.get(REQUEST_ID_HEADER)).not.toBe(callerId);
    },
  );

  it('puts the same id in an error response body as in the header', async () => {
    const response = await request(app)
      .get(TestApiPaths.videos())
      .set(REQUEST_ID_HEADER, TEST_REQUEST_ID);

    expect(response.status).toBe(401);
    expect(response.body.requestId).toBe(response.get(REQUEST_ID_HEADER));
    expect(response.body.requestId).not.toBe(TEST_REQUEST_ID);
  });
});
