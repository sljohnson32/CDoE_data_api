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
      return database('schools').where('grade_levels', '=', grade_levels).where('type', '=', type).select();
    }
    if (grade_levels && !type) {
      return database('schools').where('grade_lelel', '=', grade_levels).select();
    }
    if (!grade_levels && type) {
      return database('schools').where('type', '=', type).select();
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
