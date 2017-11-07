const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const environment = process.env.NODE_ENV || 'development';
const configuration = require('./knexfile')[environment];
const database = require('knex')(configuration);

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(__dirname + '/public'));

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

app.set('port', process.env.PORT || 3002);


//CLIENT-SIDE ENDPOINTS
app.get('/', (request, response) => {
  response.sendfile('index.html');
});


//API ENDPOINTS

//SCHOOL ENDPOINTS
app.get('/api/v1/schools', (request, response) => {
  let { grade_levels, type, stRatio } = request.query;

  const checkQuery = () => {

    //Parsing for specific CMAS and Student Teacher Ratio

    if (grade_levels && type && stRatio) {
      if (grade_levels == '1') {
        return database('schools')
          .join('school_student_teacher_ratios', 'schools.id', '=', 'school_student_teacher_ratios.school_id')
          .where('schools.type', type).where('school_student_teacher_ratios.ratio', '<', stRatio).where(function() {
            this.where('schools.grade_levels', grade_levels).orWhere('schools.grade_levels', 'like', `%${grade_levels}`).orWhere('schools.grade_levels', 'like', `%${grade_levels}%`).orWhere('schools.grade_levels', 'like', `${grade_levels}%`)
          })
          .select();
      }

      if (grade_levels == '2') {
        return database('schools')
          .join('school_student_teacher_ratios', 'schools.id', '=', 'school_student_teacher_ratios.school_id')
          .where('type', type).where('school_student_teacher_ratios.ratio', '<', stRatio).where(function() {
            this.where('grade_levels', grade_levels).orWhere('grade_levels', 'like', `%${grade_levels}`).orWhere('grade_levels', 'like', `%${grade_levels}%`).orWhere('grade_levels', 'like', `${grade_levels}%`)
          })
        .select();
      }

      if (grade_levels == '3') {
        return database('schools')
          .join('school_student_teacher_ratios', 'schools.id', '=', 'school_student_teacher_ratios.school_id')
          .where('type', type).where('school_student_teacher_ratios.ratio', '<', stRatio).where(function() {
            this.where('grade_levels', grade_levels).orWhere('grade_levels', 'like', `%${grade_levels}`).orWhere('grade_levels', 'like', `%${grade_levels}%`).orWhere('grade_levels', 'like', `${grade_levels}%`)
          })
        .select();
      }

      if (grade_levels == '4') {
        return database('schools')
          .join('school_student_teacher_ratios', 'schools.id', '=', 'school_student_teacher_ratios.school_id')
          .where('type', type).where('school_student_teacher_ratios.ratio', '<', stRatio).where(function() {
            this.where('grade_levels', grade_levels).orWhere('grade_levels', 'like', `%${grade_levels}`).orWhere('grade_levels', 'like', `%${grade_levels}%`).orWhere('grade_levels', 'like', `${grade_levels}%`)
          })
        .select();
      }
    }

    //DB Queries for Basic GET requests with Grade Level and Type params

    if (grade_levels && type) {
      return database('schools').where('type', type).where(function() {
        this.where('grade_levels', grade_levels).orWhere('grade_levels', 'like', `%${grade_levels}`).orWhere('grade_levels', 'like', `%${grade_levels}%`).orWhere('grade_levels', 'like', `${grade_levels}%`)
      }).select();
    }
    if (grade_levels && !type) {
      return database('schools').where('grade_levels', grade_levels).orWhere('grade_levels', 'like', `%${grade_levels}`).orWhere('grade_levels', 'like', `%${grade_levels}%`).orWhere('grade_levels', 'like', `${grade_levels}%`).select();
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
  database('school_graduation_completion_ipst')
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

  database('school_graduation_completion_ipst').where('school_id', id).select()
    .then( grads => {
      if (!grads.length) {
        return response.status(404).json({
          error: `Could not find graduates from school with id ${id}`
        });
      } else response.status(200).json(grads);
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

app.get('/api/v1/counties/:id', (request, response) => {
  const id = request.params.id;

  database('counties').where('id', id).select()
    .then(county => {
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
