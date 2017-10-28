const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const environment = process.env.NODE_ENV || 'development';
const configuration = require('./knexfile')[environment];
const database = require('knex')(configuration);
const jwt = require('jsonwebtoken');
const secretKey = process.env.secretKey || require('./secretKey');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(__dirname + '/public'));

app.set('port', process.env.PORT || 3000);

const checkAuth = (request, response, next) => {
  let bodyToken = request.body.token;
  let headerToken = request.get('authorization');
  let paramToken = request.param.token;
  let token = bodyToken || headerToken || paramToken;
  let allowedAppName = 'byob';

  if(!token) {
    return response.status(403).json({ error: 'Invalid Token' });
  }

  jwt.verify(token, secretKey, (error, decoded) => {
    if (error) {
      return response.status(403).json(error);
    } else if (!decoded.admin) {
      return response.status(403).json({ error: 'Admin priviledges are required to complete this action.' });
    } else if (decoded.appName !== allowedAppName){
      return response.status(403).json({ error: 'Invalid App' });
    } else next();
  });
};

//Client-side endpoint
app.get('/', (request, response) => {
  response.sendfile('index.html');
});

//Authentication endpoint
app.post('/api/v1/authentication', (request, response) => {
  let payload = request.body;
  let options = { expiresIn: '1h' };

  for (let requiredParameter of ['email', 'appName']) {
    if (!request.body[requiredParameter]) {
      return response
        .status(422)
        .send({ error: `Expected format: { email: <String>, appName: <String> }. You're missing a '${requiredParameter}' property.` });
    }
  }
  if (payload.email.endsWith('@turing.io')) { payload.admin = true; }

  let token = jwt.sign(payload, secretKey, options);
  return response.status(201).json(token);
});

//API endpoints
app.get('/api/v1/schools', (request, response) => {
  let ratioMin = request.query.ratioMin;
  let ratioMax = request.query.ratioMax;

  const checkQuery = () => {
    if (ratioMin && ratioMax) {
      return database('schools').where('student_teacher_ratio', '>=', ratioMin).where('student_teacher_ratio', '<=', ratioMax).select();
    }
    if (ratioMin && !ratioMax) {
      return database('schools').where('student_teacher_ratio', '>=', ratioMin).select();
    }
    if (!ratioMin && ratioMax) {
      return database('schools').where('student_teacher_ratio', '<=', ratioMax).select();
    }
    if (!ratioMin && !ratioMax) {
      return database('schools').select();
    }
  };

  checkQuery()
    .then((schools) => {
      return response.status(200).json(schools);
    })
    .catch((error) => {
      response.status(500).json({error});
    });
});

app.get('/api/v1/districts', (request, response) => {
  let { countyID } = request.query;

  const checkQuery = () => {
    if (countyID) {
      return database('districts').where('county_id', countyID).select();
    } else {
      return database('districts').select();
    }
  };

  checkQuery()
    .then((districts) => {
      response.status(200).json(districts);
    })
    .catch((error) => {
      response.status(500).json({error});
    });
});

app.get('/api/v1/counties', (request, response) => {
  database('counties').select()
    .then((counties) => {
      response.status(200).json(counties);
    })
    .catch((error) => {
      response.status(500).json({ error });
    });
});

app.get('/api/v1/counties/:id', (request, response) => {
  const id = request.params.id;

  database('counties').where('id', id).select()
    .then((county) => {
      if (county.length == 0) {
        return response.status(404).json({
          error: `Could not find county with id ${id}`
        });
      } else return response.status(200).json(county);
    })
    .catch((error) => {
      response.status(500).json(error);
    });
});

app.get('/api/v1/districts/:id', (request, response) => {
  const id = request.params.id;

  database('districts').where('id', id).select()
    .then((district) => {
      if (district.length == 0) {
        return response.status(404).json({
          error: `Could not find district with id ${id}`
        });
      } else return response.status(200).json(district);
    })
    .catch((error) => {
      response.status(500).json(error);
    });
});

app.get('/api/v1/schools/:id', (request, response) => {
  const id = request.params.id;

  database('schools').where('id', id).select()
    .then((school) => {
      if (school.length == 0) {
        return response.status(404).json({
          error: `Could not find school with id ${id}`
        });
      } else return response.status(200).json(school);
    })
    .catch((error) => {
      response.status(500).json(error);
    });
});

app.post('/api/v1/schools', checkAuth, (request, response) => {
  const school = request.body;

  for (let requiredParameter of ['name', 'school_code', 'student_count', 'teacher_count', 'student_teacher_ratio', 'district_id']) {
    if (!school[requiredParameter]) {
      return response
        .status(422)
        .send({ error: `Expected format: { name: <String>, school_code: <String>, student_count: <String>, techer_count: <String>, studetn_teacher_ratio: <String> }. You're missing a '${requiredParameter}' property.` });
    }
  }

  database('schools').insert(school, 'id')
    .then(school => {
      response.status(201).json({ id: school[0] });
    })
    .catch(error => {
      response.status(500).json({ error });
    });
});

app.post('/api/v1/districts', checkAuth, (request, response) => {
  const district = request.body;

  for (let requiredParameter of ['name', 'district_code', 'county_id']) {
    if (!district[requiredParameter]) {
      return response.status(422)
        .json({ error: `Expected format: { name: <String>, district_code: <String>, county_id: <String> }. You're missing a '${requiredParameter}' property.` });
    }
  }

  database('districts').insert(district, 'id')
    .then(school => {
      response.status(201).json({ id: school[0] });
    })
    .catch(error => {
      response.status(500).json({ error });
    });
});

//put & patch schools
app.put('/api/v1/schools/:id', checkAuth, (request, response) => {
  let { id } = request.params;
  let school = request.body;

  for (let requiredParameter of ['name', 'school_code', 'student_count', 'teacher_count', 'student_teacher_ratio', 'district_id']) {
    if (!school[requiredParameter]) {
      return response
        .status(422)
        .json({ error: `Expected format: { name: <String>, school_code: <String>, student_count: <Integer>, teacher_count: <Integer>, student_teacher_ratio: <Integer>, district_id: <Integer> }. You're missing a '${requiredParameter}' property.` });
    }
  }

  database('schools').where({ id }).update(school, 'id')
    .then(() => {
      response.status(201).json({ id });
    })
    .catch(error => {
      response.status(500).json(error);
    });
});

app.patch('/api/v1/schools/:id', checkAuth, (request, response) => {
  let { id } = request.params;
  let schoolPatch = request.body;

  database('schools').where('id', id).update(schoolPatch, '*')
    .then(() => {
      response.status(201).json(`School with id:${id} was updated.`);
    })
    .catch(error => {
      response.status(500).json(error);
    });
});

//delete
app.delete('/api/v1/schools/:id', checkAuth, (request, response) => {
  const { id } = request.params;

  database('schools').where({ id }).del()
    .then(school => {
      if (school) {
        return response.status(202).json(`School ${id} was deleted from database`);
      } else return response.status(422).json({ error: 'Not Found' });
    })
    .catch(error => {
      response.status(500).json({ error });
    });
});

app.delete('/api/v1/districts/:id', checkAuth, (request, response) => {
  const { id } = request.params;

  database('districts').where({ id }).del()
    .then(district => {
      if (district) {
        return response.status(202).json(`District ${id} was deleted from database`);
      } else return response.status(422).json({ error: 'Not Found' });
    })
    .catch(error => {
      response.status(500).json({ error });
    });
});

app.listen(app.get('port'), () => {
  console.log(`BYOB is running on ${app.get('port')}.`); // eslint-disable-line
});

module.exports = app;
