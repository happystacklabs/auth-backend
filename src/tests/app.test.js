import request from 'supertest';
import app from '../app.js';


describe('GET /404', () => {
  it('should render 404 for non existing urls', async () => {
    await request(app).get('/404').expect(404);
    await request(app).get('/not-found').expect(404);
  });
});
