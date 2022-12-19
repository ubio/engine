import { startServer } from '../server.js';
import { runtime } from './runtime.js';

before(() => startServer());
before(() => runtime.beforeAll());
after(() => runtime.afterAll());
beforeEach(() => runtime.beforeEach());
afterEach(() => runtime.afterEach());
