const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const environment = process.env.NODE_ENV || 'development';
const configuration = require('./knexfile')[environment];
const database = require('knex')(configuration);

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(__dirname + '/public'));

app.set('port', process.env.PORT || 3000);


//CLIENT-SIDE ENDPOINTS
app.get('/', (request, response) => {
  response.sendfile('index.html');
});


//API ENDPOINTS

//SCHOOL ENDPOINTS
app.get('/api/v1/schools', (request, response) => {
  let { grade_levels, type } = request.query;
  console.log('WORKING', grade_levels, type);
  const checkQuery = () => {
    if (grade_levels && type) {
      return database('schools').where('grade_levels', grade_levels).where('type', type).select();
    }
    if (grade_levels && !type) {
      return database('schools').where('grade_levels', grade_levels).select();
    }
    if (!grade_levels && type) {
      return database('schools').where('type', type).select();
    }
    if (!grade_levels && !type) {
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


//DISTRICT ENDPOINTS
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

//COUNTY ENDPOINTS
app.get('/api/v1/counties', (request, response) => {
  database('counties').select()
    .then((counties) => {
      response.status(200).json(counties);
    })
    .catch((error) => {
      response.status(500).json(error);
    });
});

app.get('/api/v1/grads', (request, response) => {
  database('school_graduation_completeion_ipst')
    .then( grads => {
      if (!grads.length) {
        return response.status(404).json({
          error: 'Could not find graduates'
        });
      } else return response.status(200).json(grads);
    })
    .catch( error => {
      response.status(500).json(error);
    });
});

app.get('/api/v1/grads/:id', (request, response) => {
  const id = request.params.id;

  database('school_graduation_completeion_ipst').where('id', id).select()
    .then( grads => {
      if (!grads.length) {
        return response.status(404).json({
          error: `Could not find graduates with id ${id}`
        });
      } else return response.status(200).json(school);
    })
    .catch( error => {
      response.status(500).json(error);
    });
});

app.get('/api/v1/gender-race/:id', (request, response) => {
  const { gender, race } = request.query;
  const id = request.params.id;

  const checkQuery = () => {
    return database('school_graduation_completion_gender_ethnicity').where('school_id', id)
      .then( data => {
        console.log({race});
        console.log({gender});
        
        if (gender && race) {
          const dataKeys = Object.keys(data[0]);
          const filteredData = dataKeys.filter( key => key.includes(gender) && key.includes(race));
          return filteredData.map( key => ({ [key]: data[0][key] }))
        }
        if (gender || race) {
          const dataKeys = Object.keys(data[0]);
          const filteredData = dataKeys.filter( key => key.includes(gender) || key.includes(race));
          return filteredData.map( key => ({ [key]: data[0][key] }))
        }
        return data
      })
      .catch( error => console.log({ error }));
  }

    checkQuery()
    .then( data => {
      return response.status(200).json(data);
    })
    .catch((error) => {
      response.status(500).json({error});
    });
  });

app.post('/api/v1/schools', (request, response) => {
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

app.listen(app.get('port'), () => {
  console.log(`CDoE Data API is running on ${app.get('port')}.`); // eslint-disable-line
});

module.exports = app;
