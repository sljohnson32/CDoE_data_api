const schoolData = require('../../data/ALL_schools_data');
const countyData = require('../../data/ALL_counties_data');
const districtData = require('../../data/ALL_districts_data');
const studentTeacherRatioData = require('../../data/school_metrics/student_teacher_ratio');

const createCounty = (knex, county) => {
  return knex('counties').insert({
    name: county.county_name,
    county_code: county.county_code
  }, 'id')
    .then(countyID => {
      let districtPromises = [];

      let districts = districtData.filter(obj => {
        return obj.county_code == county.county_code;
      });

      districts.forEach(district => {
        district.county_id = countyID[0];
        districtPromises.push(createDistrict(knex, district));
      });

      return Promise.all(districtPromises);
    })
    .catch(error => console.log(`Error seeding data: ${error}`));
};

const createDistrict = (knex, district) => {
  return knex('districts').insert({
    name: district.district_name,
    district_code: district.district_code,
    county_id: district.county_id
  }, 'id')
    .then(districtID => {
      let schoolPromises = [];

      let schools = schoolData.filter(obj => {
        return obj.district_code == district.district_code;
      });

      schools.forEach(school => {
        school.district_id = districtID[0];
        schoolPromises.push(createSchool(knex, school));
      });

      return Promise.all(schoolPromises);
    })
    .catch(error => console.log(`Error seeding district data: ${error}`));
};

const createSchool = (knex, school) => {

  return knex('schools').insert({
    name: school.name,
    school_code: school.school_code,
    dps_school_code: school.dps_school_code,
    address: school.school_address,
    phone: school.school_phone ,
    principal_name: school.school_principal_name,
    grade_levels: school.school_grade_levels,
    grade_display: school.school_grade_display,
    website: school.school_website,
    type: school.school_type,
    location: school.school_location,
    district_id: school.district_id
  }, 'id').then(schoolID => {
    let metricPromises = [];

    let metrics = studentTeacherRatioData.filter(obj => {
      return obj.school_code == school.school_code;
    });

    metrics.forEach(metric => {
      metric.school_id = schoolID[0];
      metricPromises.push(createSTRMetric(knex, metric))
    });

    return Promise.all(metricPromises);
  })
  .catch(error => console.log(`Error seeding school data: ${error}`));
};

const createSTRMetric = (knex, metric) => {

  return knex('student_teacher_ratios').insert({
    school_id: metric.school_id,
    school_year: metric.school_year,
    student_count: metric.student_count,
    teacher_count: metric.teacher_count,
    ratio: metric.student_teacher_ratio
  })
  .catch(error => console.log(`Error seeding school data: ${error}`));
};

exports.seed = function(knex, Promise) {
  return knex('student_teacher_ratios').del()
    .then(() => knex('schools').del())
    .then(() => knex('districts').del())
    .then(() => knex('counties').del())
    .then(() => {
      let countiesPromises = [];

      countyData.forEach(county => {
        countiesPromises.push(createCounty(knex, county));
      });

      return Promise.all(countiesPromises);
    })
    .catch(error => console.log(`Error seeding data: ${error}`));
};
