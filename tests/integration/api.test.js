'use strict';

const request = require('supertest');
const createApp = require('../../backend/app');

describe('Events API (integration)', () => {
  let app;

  beforeEach(() => {
    app = createApp();
  });

  test('GET /api/health returns ok', async () => {
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
    expect(typeof res.body.events).toBe('number');
  });

  test('GET /api/events returns the seeded events as JSON', async () => {
    const res = await request(app).get('/api/events');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThan(0);
    expect(res.body[0]).toHaveProperty('id');
    expect(res.body[0]).toHaveProperty('title');
    expect(res.body[0]).toHaveProperty('date');
  });

  test('POST /api/events creates a new event', async () => {
    const before = (await request(app).get('/api/events')).body.length;

    const res = await request(app)
      .post('/api/events')
      .send({
        title: 'New Integration Event',
        date: '2026-08-15',
        location: 'Testing Hall',
        description: 'Created by an integration test.',
      });

    expect(res.status).toBe(201);
    expect(res.body).toMatchObject({
      title: 'New Integration Event',
      date: '2026-08-15',
      location: 'Testing Hall',
    });
    expect(res.body.id).toBeDefined();

    const after = (await request(app).get('/api/events')).body.length;
    expect(after).toBe(before + 1);
  });

  test('POST /api/events rejects an invalid payload with 400', async () => {
    const res = await request(app)
      .post('/api/events')
      .send({ title: '', date: 'nope' });
    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('error');
  });

  test('DELETE /api/events/:id removes an event, then 404s', async () => {
    const created = await request(app)
      .post('/api/events')
      .send({ title: 'To Be Deleted', date: '2026-09-09' });
    const id = created.body.id;

    const del = await request(app).delete(`/api/events/${id}`);
    expect(del.status).toBe(204);

    const delAgain = await request(app).delete(`/api/events/${id}`);
    expect(delAgain.status).toBe(404);
    expect(delAgain.body).toHaveProperty('error');
  });

  test('full create-read-delete lifecycle keeps counts consistent', async () => {
    const start = (await request(app).get('/api/events')).body.length;

    const created = await request(app)
      .post('/api/events')
      .send({ title: 'Lifecycle', date: '2026-10-10' });
    expect((await request(app).get('/api/events')).body.length).toBe(start + 1);

    await request(app).delete(`/api/events/${created.body.id}`);
    expect((await request(app).get('/api/events')).body.length).toBe(start);
  });

  test('GET / serves the static frontend', async () => {
    const res = await request(app).get('/');
    expect(res.status).toBe(200);
    expect(res.text).toContain('Campus Events Calendar');
  });
});
