import request from 'supertest';
import mongoose from 'mongoose';
import app from '../../../app';
import User from '../../../models/User';


// jest.mock('../../models/User');
// import User from '../../models/User';


describe('users', () => {
  beforeAll((done) => {
    mongoose.connect('mongodb://127.0.0.1:27017/happystack-test', { useMongoClient: true }, () => {
      mongoose.connection.db.dropDatabase(() => { done(); });
    });
  });

  afterAll((done) => {
    mongoose.connection.db.dropDatabase(() => {
      mongoose.disconnect(done);
    });
  });


  describe('POST: /users', () => {
    describe('success', () => {
      const payload = {
        user: {
          username: 'foobar',
          email: 'bar@bar.com',
          password: 'foobaz',
        },
      };

      afterEach(() => {
        User.collection.drop();
      });

      it('should save the user to database if request is valid', (done) => {
        User.count({}, (err, count) => {
          expect(count).toBe(0);
          request(app)
            .post('/api/users')
            .send(payload)
            .expect(200)
            .end(() => {
              User.count({}, (err, count) => {
                expect(count).toBe(1);
                done();
              });
            });
        });
      });

      it('should return a JSON user representation if request is valid', (done) => {
        request(app)
          .post('/api/users')
          .send(payload)
          .expect(200)
          .end((err, res) => {
            expect(res.body.user.username).toBe(payload.user.username);
            expect(res.body.user.email).toBe(payload.user.email);
            expect(res.body.user.token.length).toBeGreaterThan(1);
            done();
          });
      });
    });

    describe('username', () => {
      it('should return error if less than 5 characters', (done) => {
        const payload = {
          user: {
            username: 'foo',
            email: 'foo@bar.com',
            password: 'foobaz',
          },
        };
        request(app)
          .post('/api/users')
          .send(payload)
          .expect(422)
          .end((err, res) => {
            User.count({}, (err, count) => {
              expect(count).toBe(0);
              const data = JSON.parse(res.text);
              expect(data.errors.username).toBe('Must be at least 5 characters');
              done();
            });
          });
      });

      it('should return error if empty', (done) => {
        const payload = {
          user: {
            email: 'foo@bar.com',
            password: 'foobaz',
          },
        };
        request(app)
          .post('/api/users')
          .send(payload)
          .expect(422)
          .end((err, res) => {
            User.count({}, (err, count) => {
              expect(count).toBe(0);
              const data = JSON.parse(res.text);
              expect(data.errors.username).toBe('Can\'t be blank');
              done();
            });
          });
      });

      it('should return error if not alphanumeric', (done) => {
        const payload = {
          user: {
            username: '########',
            email: 'foo@bar.com',
            password: 'foobaz',
          },
        };
        request(app)
          .post('/api/users')
          .send(payload)
          .expect(422)
          .end((err, res) => {
            User.count({}, (err, count) => {
              expect(count).toBe(0);
              const data = JSON.parse(res.text);
              expect(data.errors.username).toBe('Is invalid');
              done();
            });
          });
      });
    });

    describe('email', () => {
      it('should return error if not an email format', (done) => {
        const payload = {
          user: {
            username: 'foobar',
            email: 'foobar',
            password: 'foobaz',
          },
        };
        request(app)
          .post('/api/users')
          .send(payload)
          .expect(422)
          .end((err, res) => {
            User.count({}, (err, count) => {
              expect(count).toBe(0);
              const data = JSON.parse(res.text);
              expect(data.errors.email).toBe('Is invalid');
              done();
            });
          });
      });

      it('should return error if empty', (done) => {
        const payload = {
          user: {
            username: 'foobar',
            password: 'foobaz',
          },
        };
        request(app)
          .post('/api/users')
          .send(payload)
          .expect(422)
          .end((err, res) => {
            User.count({}, (err, count) => {
              expect(count).toBe(0);
              const data = JSON.parse(res.text);
              expect(data.errors.email).toBe('Can\'t be blank');
              done();
            });
          });
      });
    });

    describe('email and username', () => {
      it('should return error if not unique', (done) => {
        const payload = {
          user: {
            username: 'foobar',
            email: 'foo@bar.com',
            password: 'foobaz',
          },
        };
        request(app)
          .post('/api/users')
          .send(payload)
          .expect(200)
          .end(() => {
            User.count({}, (err, count) => {
              expect(count).toBe(1);
              request(app)
                .post('/api/users')
                .send(payload)
                .expect(422)
                .end((err, res) => {
                  User.count({}, (err, count) => {
                    expect(count).toBe(1);
                    const data = JSON.parse(res.text);
                    expect(data.errors.username).toBe('Is already taken');
                    expect(data.errors.email).toBe('Is already taken');
                    User.collection.drop();
                    done();
                  });
                });
            });
          });
      });
    });

    describe('password', () => {
      it('should return error if less than 5 characters', (done) => {
        const payload = {
          user: {
            username: 'foobar',
            email: 'foo@bar.com',
            password: 'foo',
          },
        };
        request(app)
          .post('/api/users')
          .send(payload)
          .expect(422)
          .end((err, res) => {
            User.count({}, (err, count) => {
              expect(count).toBe(0);
              const data = JSON.parse(res.text);
              expect(data.errors.password).toBe('Must be at least 5 characters');
              done();
            });
          });
      });

      it('should return error if empty', (done) => {
        const payload = {
          user: {
            username: 'bob',
            email: 'bobette@hh.com',
          },
        };
        request(app)
          .post('/api/users')
          .send(payload)
          .expect(422)
          .end((err, res) => {
            User.count({}, (err, count) => {
              expect(count).toBe(0);
              const data = JSON.parse(res.text);
              expect(data.errors.password).toBe('Can\'t be blank');
              done();
            });
          });
      });
    });
  });


  describe('POST: /users/login', () => {
    beforeEach((done) => {
      const payload = {
        user: {
          username: 'foobar',
          email: 'foo@bar.com',
          password: 'foobaz',
        },
      };
      request(app)
        .post('/api/users')
        .send(payload)
        .expect(200)
        .end(() => {
          done();
        });
    });

    afterEach(() => {
      User.collection.drop();
    });

    it('should return a JSON user representation if request is valid', (done) => {
      const payload = {
        user: {
          username: 'foobar',
          email: 'foo@bar.com',
          password: 'foobaz',
        },
      };
      request(app)
        .post('/api/users/login')
        .send(payload)
        .expect(200)
        .end((err, res) => {
          expect(res.body.user.email).toBe(payload.user.email);
          expect(res.body.user.username).toBe(payload.user.username);
          expect(res.body.user.token.length).toBe(195);
          done();
        });
    });

    describe('email', () => {
      it('should return error if empty', (done) => {
        const payload = {
          user: {
            password: 'foobar',
          },
        };
        request(app)
          .post('/api/users/login')
          .send(payload)
          .expect(422)
          .end((err, res) => {
            const data = JSON.parse(res.text);
            expect(data.errors.email).toBe('Can\'t be blank');
            done();
          });
      });

      it('should return error if dont exist', (done) => {
        const payload = {
          user: {
            email: 'dont@exist.com',
            password: 'foobar',
          },
        };
        request(app)
          .post('/api/users/login')
          .send(payload)
          .expect(422)
          .end((err, res) => {
            const data = JSON.parse(res.text);
            expect(data.errors['email or password']).toBe('Is invalid');
            done();
          });
      });
    });

    describe('password', () => {
      it('should return error if empty', (done) => {
        const payload = {
          user: {
            email: 'foo@bar.com',
          },
        };
        request(app)
          .post('/api/users/login')
          .send(payload)
          .expect(422)
          .end((err, res) => {
            const data = JSON.parse(res.text);
            expect(data.errors.password).toBe('Can\'t be blank');
            done();
          });
      });

      it('should return error if password dont match', (done) => {
        const payload = {
          user: {
            email: 'foo@bar.com',
            password: 'fakepass',
          },
        };
        request(app)
          .post('/api/users/login')
          .send(payload)
          .expect(422)
          .end((err, res) => {
            const data = JSON.parse(res.text);
            expect(data.errors['email or password']).toBe('Is invalid');
            done();
          });
      });
    });
  });


  describe('GET: /user', () => {
    afterEach(() => {
      User.collection.drop();
    });

    it('should return the current JSON representation of the current user', (done) => {
      const payload = {
        user: {
          username: 'foobar',
          email: 'foo@bar.com',
          password: 'foobaz',
        },
      };
      request(app)
        .post('/api/users')
        .send(payload)
        .expect(200)
        .end((err, res) => {
          const token = `Token ${res.body.user.token}`;
          request(app)
            .get('/api/user')
            .set('Authorization', token)
            .expect(200)
            .end((err, res) => {
              expect(res.body.user.username).toBe(payload.user.username);
              expect(res.body.user.email).toBe(payload.user.email);
              expect(res.body.user.token.length).toBe(195);
              done();
            });
        });
    });

    it('should return error if no token passed in header', (done) => {
      const payload = {
        user: {
          username: 'foobar',
          email: 'foo@bar.com',
          password: 'foobaz',
        },
      };
      request(app)
        .post('/api/users')
        .send(payload)
        .expect(200)
        .end(() => {
          request(app)
            .get('/api/user')
            .expect(401)
            .end((err, res) => {
              const data = JSON.parse(res.text);
              expect(data.errors.message).toBe('No authorization token was found');
              done();
            });
        });
    });

    it('should return error if token is wrong', (done) => {
      const payload = {
        user: {
          username: 'foobar',
          email: 'foo@bar.com',
          password: 'foobaz',
        },
      };
      request(app)
        .post('/api/users')
        .send(payload)
        .expect(200)
        .end(() => {
          request(app)
            .get('/api/user')
            .set('Authorization', 'Token eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjVhNDM4MWU0NzY5ZDIxMjRhZjQ3NmFiMiIsInVzZXJuYW1lIjoiZm9vYmFyIiwiZXhwaXJhdGlvbiI6MCwiaWF0IjoxNTE0MzczNjA0fQ.UzDmWdo_F5uUQpvkado6oj99bhHHc1LSGgunWFkjRzI')
            .expect(401)
            .end((err, res) => {
              expect(res.text).toBe('Unauthorized');
              done();
            });
        });
    });
  });


  describe('PUT: /user', () => {
    const payload = {
      user: {
        username: 'foobar',
        email: 'foo@bar.com',
        password: 'foobaz',
      },
    };

    it('should modifiy the fields', (done) => {
      const update = {
        user: {
          username: 'foobaz',
          email: 'baz@bar.com',
          password: 'barfoo',
        },
      };
      request(app)
        .post('/api/users')
        .send(payload)
        .expect(200)
        .end((err, res) => {
          const token = `Token ${res.body.user.token}`;
          request(app)
            .put('/api/user')
            .set('Authorization', token)
            .send(update)
            .expect(200)
            .end((err, res) => {
              expect(res.body.user.username).toBe(update.user.username);
              expect(res.body.user.email).toBe(update.user.email);
              expect(res.body.user.token.length).toBe(195);
              done();
            });
        });
    });

    it('should return error if not loggued in', (done) => {
      request(app)
        .put('/api/user')
        .send(payload)
        .expect(200)
        .end(() => {
          request(app)
            .get('/api/user')
            .expect(401)
            .end((err, res) => {
              const data = JSON.parse(res.text);
              expect(data.errors.message).toBe('No authorization token was found');
              done();
            });
        });
    });

    it('should return errors if fields are not valid', (done) => {
      const update = {
        user: {
          username: 'foo',
          email: 'baz',
        },
      };
      request(app)
        .post('/api/users')
        .send(payload)
        .expect(200)
        .end((err, res) => {
          const token = `Token ${res.body.user.token}`;
          request(app)
            .put('/api/user')
            .set('Authorization', token)
            .send(update)
            .expect(200)
            .end((err, res) => {
              const data = JSON.parse(res.text);
              expect(data.errors.email).toBe('Is invalid');
              expect(data.errors.username).toBe('Must be at least 5 characters');
              User.collection.drop();
              done();
            });
        });
    });

    it('should return error if password is less than 5 characters', (done) => {
      const update = { user: { password: 'bar' } };
      request(app)
        .post('/api/users')
        .send(payload)
        .expect(200)
        .end((err, res) => {
          const token = `Token ${res.body.user.token}`;
          request(app)
            .put('/api/user')
            .set('Authorization', token)
            .send(update)
            .expect(200)
            .end((err, res) => {
              const data = JSON.parse(res.text);
              expect(data.errors.password).toBe('Must be at least 5 characters');
              done();
            });
        });
    });
  });
});
