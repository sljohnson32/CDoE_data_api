const countyData = [
  {
    "id": "1",
    "name": "DENVER",
    "county_code": "16",
  },
  {
    "id": "2",
    "name": "ALAMOSA",
    "county_code": "02",
  }
];
const districtData = [
  {
    "id": "1",
    "name": "DENVER COUNTY 1",
    "district_code": "0880",
    "county_id": "1"
  },
  {
    "id": "2",
    "name": "CUSTER COUNTY SCHOOL DISTRICT C-1",
    "district_code": "0860",
    "county_id": "1",

  },
  {
    "id": "3",
    "name": "DELTA COUNTY 50(J)",
    "district_code": "0870",
    "county_id": "2"
  }
];
const schoolData = [
  {
    "id": "1",
    "school_code": "0010",
    "name": "Abraham Lincoln High School",
    "dps_school_code": "450",
    "school_address": "2285 S. Federal Blvd.",
    "school_phone": "720-423-5000",
    "school_principal_name": "Larry Irvin",
    "school_grade_levels": "4",
    "school_grade_display": "Grade 9 - Grade 12",
    "school_website": "http://lincolnlancers.org/",
    "school_type": "Charter",
    "school_lat": "39.6760184",
    "school_lng": "-105.0257204",
    "district_id": "1",
    "county_id": "1"
  },
  {
    "id": "2",
    "school_code": "0040",
    "name": "Ridge View Academy Charter School",
    "dps_school_code": "478",
    "school_address": "28101 E. Quincy Ave., Watkins, CO",
    "school_phone": "303-214-1136",
    "school_principal_name": "Ed Cope",
    "school_grade_levels": "4",
    "school_grade_display": "Grade 7 - Grade 12",
    "school_website": "http://www.ridgeviewacademy.com",
    "school_type": "Charter",
    "school_lat": "39.638409",
    "school_lng": "-104.66251",
    "district_id": "1",
    "county_id": "1"
  },
  {
    "id": "3",
    "school_code": "0067",
    "name": "Academy of Urban Learning",
    "dps_school_code": "488",
    "school_address": "2417 W. 29th Ave.",
    "school_phone": "303-282-0900",
    "school_principal_name": "Michelle Kennard",
    "school_grade_levels": "4",
    "school_grade_display": "Grade 9 - Grade 12",
    "school_website": "http://www.auldenver.org/",
    "school_type": "Charter",
    "school_lat": "39.758861",
    "school_lng": "-105.016829",
    "district_id": "2",
    "county_id": "1"
  },
  {
    "id": "4",
    "school_code": "0099",
    "name": "Academy 360",
    "dps_school_code": "181",
    "school_address": "12000 E. 47th Ave.",
    "school_phone": "303-574-1360",
    "school_principal_name": "Eric Brucz",
    "school_grade_levels": "1 2",
    "school_grade_display": "ECE - Grade 5",
    "school_website": "http://www.academy-360.org/",
    "school_type": "Charter",
    "school_lat": "39.781989",
    "school_lng": "-104.8503679",
    "district_id": "3",
    "county_id": "2"
  }
];

const createCounty = (knex, county) => {
  return knex('counties').insert({
    name: county.name,
    county_code: county.county_code,
    id: county.id
  }, 'id')
    .then(countyID => {
      let districtPromises = [];

      let districts = districtData.filter(obj => {
        return obj.county_id == countyID[0];
      });

      districts.forEach(district => {
        districtPromises.push(createDistrict(knex, district));
      });

      return Promise.all(districtPromises);
    })
    .catch(error => console.log(`Error seeding data: ${error}`));
};

const createDistrict = (knex, district) => {
  return knex('districts').insert({
    id: district.id,
    name: district.name,
    district_code: district.district_code,
    county_id: district.county_id
  }, 'id')
    .then(districtID => {
      let schoolPromises = [];

      let schools = schoolData.filter(obj => {
        return obj.district_id == districtID[0];
      });

      schools.forEach(school => {
        schoolPromises.push(createSchool(knex, school));
      });

      return Promise.all(schoolPromises);
    })
    .catch(error => console.log(`Error seeding district data: ${error}`));
};

const createSchool = (knex, school) => {

  return knex('schools').insert({
    id: school.id,
    name: school.name,
    school_code: school.school_code,
    dps_school_code: school.dps_school_code,
    address: school.school_address,
    phone: school.school_phone,
    principal_name: school.school_principal_name,
    grade_levels: school.school_grade_levels,
    grade_display: school.school_grade_display,
    website: school.school_website,
    type: school.school_type,
    location_lat: school.school_lat,
    location_lng: school.school_lng,
    district_id: school.district_id,
    county_id: school.county_id
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
