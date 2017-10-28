const countyData = [
  {
    'id': '1',
    'code': '1',
    'name': 'ADAMS',
  },
  {
    'id': '2',
    'code': '2',
    'name': 'ALAMOSA'
  }
];
const districtData = [
  {
    'id': '1',
    'district_code': '10',
    'district_name': 'MAPLETON 1',
    'county_code': '1',
    'county_name': 'ADAMS'
  },
  {
    'id': '2',
    'district_code': '20',
    'district_name': 'ADAMS 12 FIVE STAR SCHOOLS',
    'county_code': '1',
    'county_name': 'ADAMS'
  },
  {
    'id': '3',
    'district_code': '100',
    'district_name': 'ALAMOSA RE-11J',
    'county_code': '2',
    'county_name': 'ALAMOSA'
  },
  {
    'id': '4',
    'district_code': '110',
    'district_name': 'SANGRE DE CRISTO RE-22J',
    'county_code': '2',
    'county_name': 'ALAMOSA'
  }
];
const schoolData = [
  {
    'id': '1',
    'county_code': '1',
    'county_name': 'ADAMS',
    'district_code': '10',
    'district_name': 'MAPLETON 1',
    'school_code': '187',
    'school_name': 'MAPLETON EXPEDITIONARY SCHOOL OF THE ARTS',
    'student_count': '638',
    'teacher_count': '30.50',
    'pupil_teacher_ratio': '20.92'
  },
  {
    'id': '2',
    'county_code': '2',
    'county_name': 'ALAMOSA',
    'district_code': '100',
    'district_name': 'ALAMOSA RE-11J',
    'school_code': '118',
    'school_name': 'ALAMOSA HIGH SCHOOL',
    'student_count': '598',
    'teacher_count': '33.02',
    'pupil_teacher_ratio': '18.11'
  }
];

const createCounty = (knex, county) => {
  return knex('counties').insert({
    name: county.name,
    county_code: county.code,
    id: county.id
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
    id: district.id,
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
    district_id: school.district_id,
    id: school.id
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
