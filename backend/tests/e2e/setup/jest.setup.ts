import { TestApp } from './test-app';
import { TestContainers } from './test-containers';

beforeAll(async () => {
  await TestContainers.start();
  await TestApp.create();
}, 120000);

beforeEach(async () => {
  await TestApp.clearData();
}, 30000);

afterAll(async () => {
  await TestApp.close();
  await TestContainers.stop();
}, 30000);
