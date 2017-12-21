import request from 'supertest';
import app from '../src/app.js';


describe('GET /', () => {
  it('should render 200', async () => {
    await request(app).get('/').expect(200);
  });
});

describe('GET /404', () => {
  it('should render 404 for non existing urls', async () => {
    await request(app).get('/404').expect(404);
    await request(app).get('/not-found').expect(404);
  });
});
