process.env.NODE_ENV = 'test';

const chai = require('chai');
const should = chai.should(); // eslint-disable-line
const chaiHttp = require('chai-http');
const server = require('../server');

const environment = process.env.NODE_ENV || 'development';
const configuration = require('../knexfile')[environment];
const database = require('knex')(configuration);

// let adminToken;
// let regToken;

chai.use(chaiHttp);

// //trying to figure out how to set JWT in the before
// const setJWTs = () => {
//   chai.request(server)
//     .post('/api/v1/authentication')
//     .send({ email: 'sam@turing.io', appName: 'byob' })
//     .end((error, response) => adminToken = JSON.parse(response.text));
//
//   chai.request(server)
//     .post('/api/v1/authentication')
//     .send({ email: 'sam@ricknmorty.com', appName: 'byob' })
//     .end((error, response) => regToken = JSON.parse(response.text));
// };

describe('Client Routes', () => {
  it('should return some text from our default page', (done) => {
    chai.request(server)
      .get('/')
      .end((error, response) => {
        response.should.have.status(200);
        response.should.be.html;
        response.res.text.should.include('CDoE Data API');
        done();
      });
  });

  it('should return a 404 for a route that does not exist', (done) => {
    chai.request(server)
      .get('/foobarbaz')
      .end((error, response) => {
        response.should.have.status(404);
        done();
      });
  });
});

describe('API Routes', () => {

  before((done) => {
    database.migrate.latest()
      .then(() => {
        done();
      })
      .catch((error) => {
        console.log('Before error: ', error); // eslint-disable-line
      });
  });

  beforeEach((done) => {
    database.seed.run()
      .then(() => {
        done();
      })
      .catch((error) => {
        console.log('Before each error: ', error);// eslint-disable-line
      });
  });

  it('should return all the counties!', (done) => {
    chai.request(server)
      .get('/api/v1/counties')
      .end((error, response) => {
        response.should.have.status(200);
        response.should.be.json;
        response.should.be.a('object');
        response.body.length.should.equal(2);
        done();
      });
  });

  it('should return all the districts!', (done) => {
    chai.request(server)
      .get('/api/v1/districts')
      .end((error, response) => {
        response.should.have.status(200);
        response.should.be.json;
        response.should.be.a('object');
        response.body.length.should.equal(3);
        done();
      });
  });

  it('should return all the schools!', (done) => {
    chai.request(server)
      .get('/api/v1/schools')
      .end((error, response) => {
        response.should.have.status(200);
        response.should.be.json;
        response.should.be.a('object');
        response.body.length.should.equal(4);
        done();
      });
  });
  // it('should return all the schools below the ratio max value entered in a query param', (done) => {
  //   chai.request(server)
  //     .get('/api/v1/schools')
  //     .query('ratioMax=19')
  //     .end((error, response) => {
  //       response.should.have.status(200);
  //       response.should.be.json;
  //       response.should.be.a('object');
  //       response.body.length.should.equal(1);
  //       response.body[0].student_teacher_ratio.should.equal(18.11);
  //       done();
  //     });
  // });
  // it('should return all the schools above the ratio min value entered in a query param', (done) => {
  //   chai.request(server)
  //     .get('/api/v1/schools')
  //     .query('ratioMin=19')
  //     .end((error, response) => {
  //       response.should.have.status(200);
  //       response.should.be.json;
  //       response.should.be.a('object');
  //       response.body.length.should.equal(1);
  //       response.body[0].student_teacher_ratio.should.equal(20.92);
  //       done();
  //     });
  // });

  it('should be able to return a county by the id', (done)=> {
    chai.request(server)
      .get('/api/v1/county/1')
      .end((error, response) => {
        response.should.have.status(200);
        response.should.be.json;
        response.should.be.a('object');
        response.body.length.should.equal(1);
        response.body[0].should.have.property('id');
        response.body[0].id.should.equal(1);
        response.body[0].should.have.property('name');
        response.body[0].name.should.equal('DENVER');
        response.body[0].should.have.property('county_code');
        response.body[0].county_code.should.equal('16');
        done();
      });
  });

  it('should be able to return a district by the id', (done)=> {
    chai.request(server)
      .get('/api/v1/district/1')
      .end((error, response) => {
        response.should.have.status(200);
        response.should.be.json;
        response.should.be.a('object');
        response.body.length.should.equal(1);
        response.body[0].should.have.property('id');
        response.body[0].id.should.equal(1);
        response.body[0].should.have.property('name');
        response.body[0].name.should.equal('DENVER COUNTY 1');
        response.body[0].should.have.property('district_code');
        response.body[0].district_code.should.equal('0880');
        response.body[0].should.have.property('county_id');
        response.body[0].county_id.should.equal(1);
        done();
      });
  });

  it('should be able to return a school by the id', (done)=> {
    chai.request(server)
      .get('/api/v1/school/2')
      .end((error, response) => {
        response.should.have.status(200);
        response.should.be.json;
        response.should.be.a('object');
        response.body.length.should.equal(1);
        response.body[0].should.have.property('id');
        response.body[0].id.should.equal(2);
        response.body[0].should.have.property('name');
        response.body[0].name.should.equal('Ridge View Academy Charter School');
        response.body[0].should.have.property('school_code');
        response.body[0].school_code.should.equal('0040');
        response.body[0].should.have.property('district_id');
        response.body[0].district_id.should.equal(1);
        done();
      });
  });

  it('should return a 404 for a route that does not exist', (done) => {
    chai.request(server)
      .get('/ap1/v1/foobarbaz')
      .end((error, response) => {
        response.should.have.status(404);
        done();
      });
  });

  it('should return a 404 for a school id that does not exist', (done) => {
    chai.request(server)
      .get('/ap1/v1/school/4590001')
      .end((error, response) => {
        response.should.have.status(404);
        done();
      });
  });

  it('should return a 404 for a district id that does not exist', (done) => {
    chai.request(server)
      .get('/ap1/v1/district/4598978971')
      .end((error, response) => {
        response.should.have.status(404);
        done();
      });
  });

  it('should return a 404 for a counties id that does not exist', (done) => {
    chai.request(server)
      .get('/ap1/v1/county/8937410892374')
      .end((error, response) => {
        response.should.have.status(404);
        done();
      });
  });

});
