import request from 'supertest';
import { app } from '../../src/app';
import { TestApiPaths } from './test.constants';

/**
 * @description Sends a playback event to the public ingestion endpoint, as a viewer's player would.
 */
export const postEvent = (payload: object) => request(app).post(TestApiPaths.EVENTS).send(payload);
