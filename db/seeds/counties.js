const schoolData = require('../../data/ALL_schools_data');
const countyData = require('../../data/ALL_counties_data');
const districtData = require('../../data/ALL_districts_data');
const studentTeacherRatioData = require('../../data/school_metrics/student_teacher_ratio');
const gradGEData = require('../../data/school_metrics/school_graduation_completion_gender_ethnicity');
const gradIPSTData = require('../../data/school_metrics/school_graduation_completion_ipst');

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

    //Generate Promises for studentTeacherRatio
    let studentTeacherRatioMetrics = studentTeacherRatioData.filter(obj => {
      return obj.school_code == school.school_code;
    });

    studentTeacherRatioMetrics.forEach(metric => {
      metric.school_id = schoolID[0];
      metricPromises.push(createSTRMetric(knex, metric))
    });

    //Generate Promises for grad rates by Gender and Ethnicity
    let gradGEMetrics = gradGEData.filter(obj => {
      return obj.school_code == school.school_code;
    });

    gradGEMetrics.forEach(metric => {
      metric.school_id = schoolID[0];
      metricPromises.push(createGradGEMetric(knex, metric))
    });

    //Generate Promises for grad rates by IPST
    let gradIPSTMetrics = gradIPSTData.filter(obj => {
      return obj.school_code == school.school_code;
    });

    gradIPSTMetrics.forEach(metric => {
      metric.school_id = schoolID[0];
      metricPromises.push(createGradIPSTMetric(knex, metric))
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
  .catch(error => console.log(`Error seeding student teacher ratio data: ${error}`));
};

const createGradGEMetric = (knex, metric) => {

  return knex('school_graduation_completion_gender_ethnicity').insert({
    school_id: metric.school_id,
    school_year: metric.school_year,
    all_eligible_total: metric.all_eligible_total.replace(/,/g, ''),
    all_grad_total: metric.all_grad_total.replace(/,/g, ''),
    all_grad_rate: metric.all_grad_rate,
    all_completers_total: metric.all_completers_total.replace(/,/g, ''),
    all_completion_rate: metric.all_completion_rate,
    all_female_eligible_grad_total: metric.all_female_eligible_grad_total.replace(/,/g, ''),
    all_females_grads_total: metric.all_females_grads_total.replace(/,/g, ''),
    all_female_grad_rate: metric.all_female_grad_rate,
    all_female_completers_total: metric.all_female_completers_total.replace(/,/g, ''),
    all_female_completion_rate: metric.all_female_completion_rate,
    all_male_eligible_grad_total: metric.all_male_eligible_grad_total.replace(/,/g, ''),
    all_male_grad_total: metric.all_male_grad_total.replace(/,/g, ''),
    all_male_grad_rate: metric.all_male_grad_rate,
    all_male_completers_total: metric.all_male_completers_total.replace(/,/g, ''),
    all_male_completion_rate: metric.all_male_completion_rate,
    ai_an_all_eligible_total: metric.ai_an_all_eligible_total.replace(/,/g, ''),
    ai_an_all_grad_total: metric.ai_an_all_grad_total.replace(/,/g, ''),
    ai_an_all_grad_rate: metric.ai_an_all_grad_rate,
    ai_an_all_completers_total: metric.ai_an_all_completers_total.replace(/,/g, ''),
    ai_an_all_completion_rate: metric.ai_an_all_completion_rate,
    ai_an_female_eligible_total: metric.ai_an_female_eligible_total.replace(/,/g, ''),
    ai_an_female_grad_total: metric.ai_an_female_grad_total.replace(/,/g, ''),
    ai_an_female_grad_rate: metric.ai_an_female_grad_rate,
    ai_an_female_completers_total: metric.ai_an_female_completers_total.replace(/,/g, ''),
    ai_an_female_completion_rate: metric.ai_an_female_completion_rate,
    ai_an_male_eligible_total: metric.ai_an_male_eligible_total.replace(/,/g, ''),
    ai_an_male_grad_total: metric.ai_an_male_grad_total.replace(/,/g, ''),
    ai_an_male_grad_rate: metric.ai_an_male_grad_rate,
    ai_an_male_completers_total: metric.ai_an_male_completers_total.replace(/,/g, ''),
    ai_an_male_completion_rate: metric.ai_an_male_completion_rate,
    asian_all_eligible_total: metric.asian_all_eligible_total.replace(/,/g, ''),
    asian_all_grad_total: metric.asian_all_grad_total.replace(/,/g, ''),
    asian_all_grad_rate: metric.asian_all_grad_rate,
    asian_all_completers_total: metric.asian_all_completers_total.replace(/,/g, ''),
    asian_all_completion_rate: metric.asian_all_completion_rate,
    asian_female_eligible_total: metric.asian_female_eligible_total.replace(/,/g, ''),
    asian_female_grad_total: metric.asian_female_grad_total.replace(/,/g, ''),
    asian_female_grad_rate: metric.asian_female_grad_rate,
    asian_female_completers_total: metric.asian_female_completers_total.replace(/,/g, ''),
    asian_female_completion_rate: metric.asian_female_completion_rate,
    asian_male_eligible_total: metric.asian_male_eligible_total.replace(/,/g, ''),
    asian_male_grad_total: metric.asian_male_grad_total.replace(/,/g, ''),
    asian_male_grad_rate: metric.asian_male_grad_rate,
    asian_male_completers_total: metric.asian_male_completers_total.replace(/,/g, ''),
    asian_male_completion_rate: metric.asian_male_completion_rate,
    b_aa_all_eligible_total: metric.b_aa_all_eligible_total.replace(/,/g, ''),
    b_aa_all_grad_total: metric.b_aa_all_grad_total.replace(/,/g, ''),
    b_aa_all_grad_rate: metric.b_aa_all_grad_rate,
    b_aa_all_completers_total: metric.b_aa_all_completers_total.replace(/,/g, ''),
    b_aa_all_completion_rate: metric.b_aa_all_completion_rate,
    b_aa_female_eligible_total: metric.b_aa_female_eligible_total.replace(/,/g, ''),
    b_aa_female_grad_total: metric.b_aa_female_grad_total.replace(/,/g, ''),
    b_aa_female_grad_rate: metric.b_aa_female_grad_rate,
    b_aa_female_completers_total: metric.b_aa_female_completers_total.replace(/,/g, ''),
    b_aa_female_completion_rate: metric.b_aa_female_completion_rate,
    b_aa_male_eligible_total: metric.b_aa_male_eligible_total.replace(/,/g, ''),
    b_aa_male_grad_total: metric.b_aa_male_grad_total.replace(/,/g, ''),
    b_aa_male_grad_rate: metric.b_aa_male_grad_rate,
    b_aa_male_completers_total: metric.b_aa_male_completers_total.replace(/,/g, ''),
    b_aa_male_completion_rate: metric.b_aa_male_completion_rate,
    l_h_all_eligible_total: metric.l_h_all_eligible_total.replace(/,/g, ''),
    l_h_all_grad_total: metric.l_h_all_grad_total.replace(/,/g, ''),
    l_h_all_grad_rate: metric.l_h_all_grad_rate,
    l_h_all_completers_total: metric.l_h_all_completers_total.replace(/,/g, ''),
    l_h_all_completion_rate: metric.l_h_all_completion_rate,
    l_h_female_eligible_total: metric.l_h_female_eligible_total.replace(/,/g, ''),
    l_h_female_grad_total: metric.l_h_female_grad_total.replace(/,/g, ''),
    l_h_female_grad_rate: metric.l_h_female_grad_rate,
    l_h_female_completers_total: metric.l_h_female_completers_total.replace(/,/g, ''),
    l_h_female_completion_rate: metric.l_h_female_completion_rate,
    l_h_male_eligible_total: metric.l_h_male_eligible_total.replace(/,/g, ''),
    l_h_male_grad_total: metric.l_h_male_grad_total.replace(/,/g, ''),
    l_h_male_grad_rate: metric.l_h_male_grad_rate,
    l_h_male_completers_total: metric.l_h_male_completers_total.replace(/,/g, ''),
    l_h_male_completion_rate: metric.l_h_male_completion_rate,
    w_all_eligible_total: metric.w_all_eligible_total.replace(/,/g, ''),
    w_all_grad_total: metric.w_all_grad_total.replace(/,/g, ''),
    w_all_grad_rate: metric.w_all_grad_rate,
    w_all_completers_total: metric.w_all_completers_total.replace(/,/g, ''),
    w_all_completion_rate: metric.w_all_completion_rate,
    w_female_eligible_total: metric.w_female_eligible_total.replace(/,/g, ''),
    w_female_grad_total: metric.w_female_grad_total.replace(/,/g, ''),
    w_female_grad_rate: metric.w_female_grad_rate,
    w_female_completers_total: metric.w_female_completers_total.replace(/,/g, ''),
    w_female_completion_rate: metric.w_female_completion_rate,
    w_male_eligible_total: metric.w_male_eligible_total.replace(/,/g, ''),
    w_male_grad_total: metric.w_male_grad_total.replace(/,/g, ''),
    w_male_grad_rate: metric.w_male_grad_rate,
    w_male_completers_total: metric.w_male_completers_total.replace(/,/g, ''),
    w_male_completion_rate: metric.w_male_completion_rate,
    nh_opi_all_eligible_total: metric.nh_opi_all_eligible_total.replace(/,/g, ''),
    nh_opi_all_grad_total: metric.nh_opi_all_grad_total.replace(/,/g, ''),
    nh_opi_all_grad_rate: metric.nh_opi_all_grad_rate,
    nh_opi_all_completers_total: metric.nh_opi_all_completers_total.replace(/,/g, ''),
    nh_opi_all_completion_rate: metric.nh_opi_all_completion_rate,
    nh_opi_female_eligible_total: metric.nh_opi_female_eligible_total.replace(/,/g, ''),
    nh_opi_female_grad_total: metric.nh_opi_female_grad_total.replace(/,/g, ''),
    nh_opi_female_grad_rate: metric.nh_opi_female_grad_rate,
    nh_opi_female_completers_total: metric.nh_opi_female_completers_total.replace(/,/g, ''),
    nh_opi_female_completion_rate: metric.nh_opi_female_completion_rate,
    nh_opi_male_eligible_total: metric.nh_opi_male_eligible_total.replace(/,/g, ''),
    nh_opi_male_grad_total: metric.nh_opi_male_grad_total.replace(/,/g, ''),
    nh_opi_male_grad_rate: metric.nh_opi_male_grad_rate,
    nh_opi_male_completers_total: metric.nh_opi_male_completers_total.replace(/,/g, ''),
    nh_opi_male_completion_rate: metric.nh_opi_male_completion_rate,
    multi_racial_all_eligible_total: metric.multi_racial_all_eligible_total.replace(/,/g, ''),
    multi_racial_all_grad_total: metric.multi_racial_all_grad_total.replace(/,/g, ''),
    multi_racial_all_grad_rate: metric.multi_racial_all_grad_rate,
    multi_racial_all_completers_total: metric.multi_racial_all_completers_total.replace(/,/g, ''),
    multi_racial_all_completion_rate: metric.multi_racial_all_completion_rate,
    multi_racial_female_eligible_total: metric.multi_racial_female_eligible_total.replace(/,/g, ''),
    multi_racial_female_grad_total: metric.multi_racial_female_grad_total.replace(/,/g, ''),
    multi_racial_female_grad_rate: metric.multi_racial_female_grad_rate,
    multi_racial_female_completers_total: metric.multi_racial_female_completers_total.replace(/,/g, ''),
    multi_racial_female_completion_rate: metric.multi_racial_female_completion_rate,
    multi_racial_male_eligible_total: metric.multi_racial_male_eligible_total.replace(/,/g, ''),
    multi_racial_male_grad_total: metric.multi_racial_male_grad_total.replace(/,/g, ''),
    multi_racial_male_grad_rate: metric.multi_racial_male_grad_rate,
    multi_racial_male_completers_total: metric.multi_racial_male_completers_total.replace(/,/g, ''),
    multi_racial_male_completion_rate: metric.multi_racial_male_completion_rate
  })
  .catch(error => console.log(`Error seeding grad by ethnicity and gender data: ${error}`));
};

const createGradIPSTMetric = (knex, metric) => {

  return knex('school_graduation_completion_ipst').insert({
    school_id: metric.school_id,
    school_year: metric.school_year,
    disabled_eligible_total: metric.disabled_eligible_total.replace(/,/g, ''),
    disabled_grad_total: metric.disabled_grad_total.replace(/,/g, ''),
    disabled_grad_rate: metric.disabled_grad_rate,
    disabled_completers_total: metric.disabled_completers_total.replace(/,/g, ''),
    disabled_completion_rate: metric.disabled_completion_rate,
    limited_english_proficient_eligible_total: metric.limited_english_proficient_eligible_total.replace(/,/g, ''),
    limited_english_proficient_grad_total: metric.limited_english_proficient_grad_total.replace(/,/g, ''),
    limited_english_proficient_grad_rate: metric.limited_english_proficient_grad_rate,
    limited_english_proficient_completers_total: metric.limited_english_proficient_completers_total.replace(/,/g, ''),
    limited_english_proficient_completion_rate: metric.limited_english_proficient_completion_rate,
    econ_disadvant_eligible_total: metric.econ_disadvant_eligible_total.replace(/,/g, ''),
    econ_disadvant_grad_total: metric.econ_disadvant_grad_total.replace(/,/g, ''),
    econ_disadvant_grad_rate: metric.econ_disadvant_grad_rate,
    econ_disadvant_completers_total: metric.econ_disadvant_completers_total.replace(/,/g, ''),
    econ_disadvant_completion_rate: metric.econ_disadvant_completion_rate,
    migrant_eligible_total: metric.migrant_eligible_total.replace(/,/g, ''),
    migrant_grad_total: metric.migrant_grad_total.replace(/,/g, ''),
    migrant_grad_rate: metric.migrant_grad_rate,
    migrant_completers_total: metric.migrant_completers_total.replace(/,/g, ''),
    migrant_completion_rate: metric.migrant_completion_rate,
    title_one_eligible_total: metric.title_one_eligible_total.replace(/,/g, ''),
    title_one_grad_total: metric.title_one_grad_total.replace(/,/g, ''),
    title_one_grad_rate: metric.title_one_grad_rate,
    title_one_completers_total: metric.title_one_completers_total.replace(/,/g, ''),
    title_one_completion_rate: metric.title_one_completion_rate,
    homeless_eligible_total: metric.homeless_eligible_total.replace(/,/g, ''),
    homeless_grad_total: metric.homeless_grad_total.replace(/,/g, ''),
    homeless_grad_rate: metric.homeless_grad_rate,
    homeless_completers_total: metric.homeless_completers_total.replace(/,/g, ''),
    homeless_completion_rate: metric.homeless_completion_rate,
    gifted_talented_eligible_total: metric.gifted_talented_eligible_total.replace(/,/g, ''),
    gifted_talented_grad_total: metric.gifted_talented_grad_total.replace(/,/g, ''),
    gifted_talented_grad_rate: metric.gifted_talented_grad_rate,
    gifted_talented_completers_total: metric.gifted_talented_completers_total.replace(/,/g, ''),
    gifted_talented_completion_rate: metric.gifted_talented_completion_rate,
  })
  .catch(error => console.log(`Error seeding grad by IPST data: ${error}`));
};

exports.seed = function(knex, Promise) {
  return knex('school_graduation_completion_gender_ethnicity').del()
    .then(() => knex('student_teacher_ratios').del())
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
