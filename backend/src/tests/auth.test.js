import request from 'supertest';
import app from '../app.js';
import { seed } from '../seeders/seed.js';
import { sequelize } from '../models/index.js';

beforeAll(async () => {
  await seed();
});

afterAll(async () => {
  await sequelize.close();
});

describe('Auth', () => {
  it('logs in seeded user', async () => {
    const res = await request(app).post('/api/auth/login').send({ email: 'ananya.sharma@example.com', password: 'password' });
    expect(res.status).toBe(200);
    expect(res.body.token).toBeDefined();
    expect(res.body.user.passwordHash).toBeUndefined();
  });

  it('rejects bad credentials', async () => {
    const res = await request(app).post('/api/auth/login').send({ email: 'bad@example.com', password: 'nope' });
    expect(res.status).toBe(401);
  });
});
