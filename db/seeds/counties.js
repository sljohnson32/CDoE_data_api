const schoolData = require('../../data/BYOB_schools_data');
const countyData = require('../../data/BYOB_counties_data');
const districtData = require('../../data/BYOB_districts_data');

const createCounty = (knex, county) => {
  return knex('counties').insert({
    name: county.name,
    county_code: county.code
  }, 'id')
    .then(countyID => {
      let districtPromises = [];

      let districts = districtData.filter(obj => {
        return obj.county_code == county.code;
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

  let student_c = parseFloat(school.student_count);
  let teacher_c = parseFloat(school.teacher_count);
  let student_teacher_r = parseFloat(school.pupil_teacher_ratio);

  return knex('schools').insert({
    name: school.school_name,
    school_code: school.school_code,
    student_count: student_c,
    teacher_count: teacher_c,
    student_teacher_ratio: student_teacher_r,
    district_id: school.district_id
  })
    .catch(error => console.log(`Error seeding school data: ${error}`));
};

exports.seed = function(knex, Promise) {
  return knex('schools').del()
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
