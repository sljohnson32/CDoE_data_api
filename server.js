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

//SERVER START
app.get('/api/v1/start', (request, response) => {
  database('counties').select()
    .then((counties) => {
      return response.status(204);
    })
    .catch(error => {
      response.status(500).json(error);
    });
});

//SCHOOL ENDPOINTS
app.get('/api/v1/schools', (request, response) => {
  let { grade_levels, type, stRatio, elaRate, mathRate, scienceRate, satRate } = request.query;

  const checkQuery = () => {

    //Parsing for specific CMAS and Student Teacher Ratio

    if (grade_levels && type && stRatio) {
      if (grade_levels == '1') {
        return database('schools')
          .join('school_student_teacher_ratios', 'schools.id', '=', 'school_student_teacher_ratios.school_id')
          .where('schools.type', type)
          .where('school_student_teacher_ratios.ratio', '<', stRatio)
          .where(function() {
            this.where('schools.grade_levels', grade_levels).orWhere('schools.grade_levels', 'like', `%${grade_levels}`).orWhere('schools.grade_levels', 'like', `%${grade_levels}%`).orWhere('schools.grade_levels', 'like', `${grade_levels}%`)
          })
          .select();
      }

      if (grade_levels == '2') {
        return database('schools')
        .where(function() {
          this.where('schools.grade_levels', grade_levels).orWhere('schools.grade_levels', 'like', `%${grade_levels}`).orWhere('schools.grade_levels', 'like', `%${grade_levels}%`).orWhere('schools.grade_levels', 'like', `${grade_levels}%`)
        })
        .where('schools.type', type)
        .join('school_student_teacher_ratios', 'schools.id', '=', 'school_student_teacher_ratios.school_id')
        .join('school_cmas_ela_math', function() {
          this.on('schools.id', '=', 'school_cmas_ela_math.school_id').onIn('school_cmas_ela_math.test_name', ['Math Grade 05'])
        })
        .join('school_cmas_science', 'schools.id', '=', 'school_cmas_science.school_id')
        .where('school_student_teacher_ratios.ratio', '<', stRatio)
        .where('school_cmas_ela_math.met_exceeded_expectations_rate', '>', mathRate)
        .where('school_cmas_science.met_exceeded_expectations_rate', '>', scienceRate)
        .select();
      }

      if (grade_levels == '3') {
        return database('schools')
        .where(function() {
          this.where('schools.grade_levels', grade_levels).orWhere('schools.grade_levels', 'like', `%${grade_levels}`).orWhere('schools.grade_levels', 'like', `%${grade_levels}%`).orWhere('schools.grade_levels', 'like', `${grade_levels}%`)
        })
        .where('schools.type', type)
        .join('school_student_teacher_ratios', 'schools.id', '=', 'school_student_teacher_ratios.school_id')
        .join('school_cmas_ela_math', function() {
          this.on('schools.id', '=', 'school_cmas_ela_math.school_id').onIn('school_cmas_ela_math.test_name', ['Math Grade 08'])
        })
        .join('school_cmas_science', 'schools.id', '=', 'school_cmas_science.school_id')
        .where('school_student_teacher_ratios.ratio', '<', stRatio)
        .where('school_cmas_ela_math.met_exceeded_expectations_rate', '>', mathRate)
        .where('school_cmas_science.met_exceeded_expectations_rate', '>', scienceRate)
        .select();
      }

      if (grade_levels == '4') {
        return database('schools')
        .where(function() {
          this.where('schools.grade_levels', grade_levels).orWhere('schools.grade_levels', 'like', `%${grade_levels}`).orWhere('schools.grade_levels', 'like', `%${grade_levels}%`).orWhere('schools.grade_levels', 'like', `${grade_levels}%`)
        })
        .where('schools.type', type)
        .join('school_student_teacher_ratios', 'schools.id', '=', 'school_student_teacher_ratios.school_id')
        .join('school_cmas_ela_math', function() {
          this.on('schools.id', '=', 'school_cmas_ela_math.school_id').onIn('school_cmas_ela_math.test_name', ['Geometry'])
        })
        .join('school_cmas_science', 'schools.id', '=', 'school_cmas_science.school_id')
        .join('school_sat_psat', function() {
          this.on('schools.id', '=', 'school_sat_psat.school_id').onIn('school_sat_psat.test_type', ['SAT'])
        })
        .where('school_student_teacher_ratios.ratio', '<', stRatio)
        .where('school_cmas_ela_math.met_exceeded_expectations_rate', '>', mathRate)
        .where('school_cmas_science.met_exceeded_expectations_rate', '>', scienceRate)
        .where('school_sat_psat.overall_mean_score', '>', satRate)
        .select();
      }
    }

    //DB Queries for Basic GET requests with Grade Level and Type params

    if (grade_levels && type) {
      return database('schools').where('type', type).where(function() {
        this.where('schools.grade_levels', grade_levels).orWhere('schools.grade_levels', 'like', `%${grade_levels}`).orWhere('schools.grade_levels', 'like', `%${grade_levels}%`).orWhere('schools.grade_levels', 'like', `${grade_levels}%`)
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
    .catch(error => {
      response.status(500).json({error});
    });
});

app.get('/api/v1/school/:id', (request, response) => {
  const schoolID = request.params.id;

  database('schools').where('id', schoolID).select()
    .then((school) => {
      if (school.length == 0) {
        return response.status(404).json({
          error: `Could not find school with id ${id}`
        });
      } else return response.status(200).json(school);
    })
    .catch(error => {
      response.status(500).json(error);
    });
});

app.get('/api/v1/school/:id/population', (request, response) => {
  const id = request.params.id;

  database('school_student_population').where('school_id', id).select()
    .then((data) => {
      if (data.length == 0) {
        return response.status(404).json({
          error: `Could not find school population data for school with id ${id}`
        });
      } else return response.status(200).json(data);
    })
    .catch(error => {
      response.status(500).json(error);
    });
});

app.get('/api/v1/school/:id/graduation/:type', (request, response) => {
  const { id, type } = request.params

  if (type == 'ge') {
    database('school_graduation_completion_gender_ethnicity').where('school_id', id).select()
      .then((data) => {
        if (data.length == 0) {
          return response.status(404).json({
            error: `Could not find gender and race graduation data for school with id ${id}`
          });
        } else return response.status(200).json(data);
      })
      .catch(error => {
        response.status(500).json(error);
      });
  } else if (type == 'ipst') {
    database('school_graduation_completion_ipst').where('school_id', id).select()
      .then((data) => {
        if (data.length == 0) {
          return response.status(404).json({
            error: `Could not find IPST graduation data for school with id ${id}`
          });
        } else return response.status(200).json(data);
      })
      .catch(error => {
        response.status(500).json(error);
      });
  }
});

app.get('/api/v1/school/:id/graduation', (request, response) => {
  const { gender, race } = request.query;
  const id = request.params.id;

  const checkQuery = () => {
    return database('school_graduation_completion_gender_ethnicity').where('school_id', id)
      .then(data => {
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
    .catch(error => {
      response.status(500).json({error});
    });
  }

  checkQuery()
    .then( data => {
      return response.status(200).json(data);
    })
  .catch(error => {
    response.status(500).json({error});
  });
});

//DISTRICT ENDPOINTS
app.get('/api/v1/districts', (request, response) => {
  database('districts').select()
    .then((districts) => {
      response.status(200).json(districts);
    })
    .catch(error => {
      response.status(500).json(error);
    });
});

app.get('/api/v1/district/:id', (request, response) => {
  const districtID = request.params.id;

  const checkQuery = () => {
    if (districtID) {
      return database('districts').where('id', districtID).select()
    } else {
      return response
        .status(422)
        .send({ error: `Please include a district id value as a request param to get data for a specific district.`
      });
    }
  };

  checkQuery()
    .then((district) => {
      if (district.length == 0) {
        return response.status(404).json({
          error: `Could not find district with id ${id}`
        });
      } else return response.status(200).json(district);
    })
    .catch(error => {
      response.status(500).json(error);
    });
});

//COUNTY ENDPOINTS
app.get('/api/v1/counties', (request, response) => {
  database('counties').select()
    .then((counties) => {
      response.status(200).json(counties);
    })
    .catch(error => {
      response.status(500).json(error);
    });
});

app.get('/api/v1/county/:id', (request, response) => {
  const countyID = request.params.id;

  const checkQuery = () => {
    if (countyID) {
      return database('counties').where('id', countyID).select()
    } else {
      return response
        .status(422)
        .send({ error: `Please include a county id value as a request param to get data for a specific county.`
      });
    }
  };

  checkQuery()
    .then((county) => {
      if (county.length == 0) {
        return response.status(404).json({
          error: `Could not find county with id ${id}`
        });
      } else return response.status(200).json(county);
    })
    .catch(error => {
      response.status(500).json(error);
    });
});

app.get('/api/v1/county/:id/districts', (request, response) => {
  const { id } = request.params;

  const checkQuery = () => {
    if (id) {
      return database('districts').where('county_id', id).select();
    } else {
      return database('districts').select();
    }
  };

  checkQuery()
    .then((districts) => {
      response.status(200).json(districts);
    })
    .catch(error => {
      response.status(500).json({error});
    });
});


//GLOBAL GETS FOR DATA IN DB

//GET ALL IPST GRAD DATA IN DB
app.get('/api/v1/graduation/ipst', (request, response) => {
  database('school_graduation_completion_ipst')
    .then( grads => {
      return response.status(200).json(grads);
    })
    .catch( error => {
      response.status(500).json(error);
    });
});

//GET ALL GENDER & ETHNICITY GRAD DATA IN DB
app.get('/api/v1/graduation/ge', (request, response) => {
  database('school_graduation_completion_gender_ethnicity')
    .then( grads => {
      return response.status(200).json(grads);
    })
    .catch( error => {
      response.status(500).json(error);
    });
});

// app.get('/api/v1/grads/:id', (request, response) => {
//   const id = request.params.id;
//
//   database('school_graduation_completion_ipst').where('school_id', id).select()
//     .then( grads => {
//       if (!grads.length) {
//         return response.status(404).json({
//           error: `Could not find graduates from school with id ${id}`
//         });
//       } else response.status(200).json(grads);
//     })
//     .catch( error => {
//       response.status(500).json(error);
//     });
// });

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
    .catch(error => {
      response.status(500).json(error);
    });
});

app.listen(app.get('port'), () => {
  console.log(`CDoE Data API is running on ${app.get('port')}.`); // eslint-disable-line
});

module.exports = app;
