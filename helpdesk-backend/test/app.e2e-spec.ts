import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module.js';

describe('Helpdesk User Journey (e2e)', () => {
  let app: INestApplication;
  let accessToken: string;
  let ticketId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();

    app.useGlobalPipes(
      new ValidationPipe({ whitelist: true, transform: true }),
    );

    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('1. POST /auth/register - Create account and return JWT', async () => {
    // unique data for each test
    const timestamp = Date.now();
    const uniqueEmail = `test-${timestamp}@example.com`;
    const uniqueOrg = `Test Corp ${timestamp}`;

    const response = await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        email: uniqueEmail,
        password: 'Password123!',
        firstName: 'Robot',
        lastName: 'Vitest',
        organizationName: uniqueOrg,
      })
      .expect(201);

    expect(response.body.accessToken).toBeDefined();

    accessToken = response.body.accessToken;
  });

  it('2. POST /tickets - Create a ticket using the JWT', async () => {
    const response = await request(app.getHttpServer())
      .post('/tickets')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        title: 'Server down on production',
        description: 'Cannot access to main database.',
        priority: 'URGENT',
      })
      .expect(201);

    expect(response.body.id).toBeDefined();
    expect(response.body.status).toBe('OPEN');

    // Guardamos el ID generado
    ticketId = response.body.id;
  });

  it('3. GET /tickets/:id - Retrieve ticket recently created', async () => {
    const response = await request(app.getHttpServer())
      .get(`/tickets/${ticketId}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);

    expect(response.body.title).toBe('Server down on production');
    expect(response.body.creator.firstName).toBe('Robot');
  });
});
