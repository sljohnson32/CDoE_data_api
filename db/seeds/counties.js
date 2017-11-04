const schoolData = require('../../data/ALL_schools_data');
const countyData = require('../../data/ALL_counties_data');
const districtData = require('../../data/ALL_districts_data');
const studentTeacherRatioData = require('../../data/school_metrics/student_teacher_ratio');
const gradGEData = require('../../data/school_metrics/school_graduation_completion_gender_ethnicity');
const gradIPSTData = require('../../data/school_metrics/school_graduation_completion_ipst');
const elaMathData = require('../../data/school_metrics/school_cmas_ela_math');
const scienceData = require('../../data/school_metrics/school_cmas_science');
const satPSATData = require('../../data/school_metrics/school_sat_psat');
const rflData = require('../../data/school_metrics/school_free_reduced_lunch');
const attendanceData = require('../../data/school_metrics/school_attendance');
const populationData = require('../../data/school_metrics/school_student_population');

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
    location_lat: school.school_lat,
    location_lng: school.school_lng,
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

    //Generate Promises for CMAS ELA and Math scores
    let ELAMathMetrics = elaMathData.filter(obj => {
      return obj.school_code == school.school_code;
    });

    ELAMathMetrics.forEach(metric => {
      metric.school_id = schoolID[0];
      metricPromises.push(createELAMathScoreMetric(knex, metric))
    });

    //Generate Promises for CMAS Science scores
    let scienceMetrics = scienceData.filter(obj => {
      return obj.school_code == school.school_code;
    });

    scienceMetrics.forEach(metric => {
      metric.school_id = schoolID[0];
      metricPromises.push(createScienceScoreMetric(knex, metric))
    });

    //Generate Promises for SAT and PSAT scores
    let satPSATMetrics = satPSATData.filter(obj => {
      return obj.school_code == school.school_code;
    });

    satPSATMetrics.forEach(metric => {
      metric.school_id = schoolID[0];
      metricPromises.push(createSATPSATMetric(knex, metric))
    });

    //Generate Promises for attendance rates
    let frlMetrics = rflData.filter(obj => {
      return obj.school_code == school.school_code;
    });

    frlMetrics.forEach(metric => {
      metric.school_id = schoolID[0];
      metricPromises.push(createFRLMetric(knex, metric))
    });

    //Generate Promises for attendance rates
    let attendanceMetrics = attendanceData.filter(obj => {
      return obj.school_code == school.school_code;
    });

    attendanceMetrics.forEach(metric => {
      metric.school_id = schoolID[0];
      metricPromises.push(createAttendanceMetric(knex, metric))
    });

    //Generate Promises for student population overview data
    let populationMetrics = populationData.filter(obj => {
      return obj.school_code == school.school_code;
    });

    populationMetrics.forEach(metric => {
      metric.school_id = schoolID[0];
      metricPromises.push(createPopulationOverviewMetric(knex, metric))
    });

    return Promise.all(metricPromises);
  })
  .catch(error => console.log(`Error seeding school data: ${error}`));
};

const createSTRMetric = (knex, metric) => {

  return knex('school_student_teacher_ratios').insert({
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
    all_eligible_total: metric.all_eligible_total,
    all_grad_total: metric.all_grad_total,
    all_grad_rate: metric.all_grad_rate,
    all_completers_total: metric.all_completers_total,
    all_completion_rate: metric.all_completion_rate,
    all_female_eligible_grad_total: metric.all_female_eligible_grad_total,
    all_females_grads_total: metric.all_females_grads_total,
    all_female_grad_rate: metric.all_female_grad_rate,
    all_female_completers_total: metric.all_female_completers_total,
    all_female_completion_rate: metric.all_female_completion_rate,
    all_male_eligible_grad_total: metric.all_male_eligible_grad_total,
    all_male_grad_total: metric.all_male_grad_total,
    all_male_grad_rate: metric.all_male_grad_rate,
    all_male_completers_total: metric.all_male_completers_total,
    all_male_completion_rate: metric.all_male_completion_rate,
    ai_an_all_eligible_total: metric.ai_an_all_eligible_total,
    ai_an_all_grad_total: metric.ai_an_all_grad_total,
    ai_an_all_grad_rate: metric.ai_an_all_grad_rate,
    ai_an_all_completers_total: metric.ai_an_all_completers_total,
    ai_an_all_completion_rate: metric.ai_an_all_completion_rate,
    ai_an_female_eligible_total: metric.ai_an_female_eligible_total,
    ai_an_female_grad_total: metric.ai_an_female_grad_total,
    ai_an_female_grad_rate: metric.ai_an_female_grad_rate,
    ai_an_female_completers_total: metric.ai_an_female_completers_total,
    ai_an_female_completion_rate: metric.ai_an_female_completion_rate,
    ai_an_male_eligible_total: metric.ai_an_male_eligible_total,
    ai_an_male_grad_total: metric.ai_an_male_grad_total,
    ai_an_male_grad_rate: metric.ai_an_male_grad_rate,
    ai_an_male_completers_total: metric.ai_an_male_completers_total,
    ai_an_male_completion_rate: metric.ai_an_male_completion_rate,
    asian_all_eligible_total: metric.asian_all_eligible_total,
    asian_all_grad_total: metric.asian_all_grad_total,
    asian_all_grad_rate: metric.asian_all_grad_rate,
    asian_all_completers_total: metric.asian_all_completers_total,
    asian_all_completion_rate: metric.asian_all_completion_rate,
    asian_female_eligible_total: metric.asian_female_eligible_total,
    asian_female_grad_total: metric.asian_female_grad_total,
    asian_female_grad_rate: metric.asian_female_grad_rate,
    asian_female_completers_total: metric.asian_female_completers_total,
    asian_female_completion_rate: metric.asian_female_completion_rate,
    asian_male_eligible_total: metric.asian_male_eligible_total,
    asian_male_grad_total: metric.asian_male_grad_total,
    asian_male_grad_rate: metric.asian_male_grad_rate,
    asian_male_completers_total: metric.asian_male_completers_total,
    asian_male_completion_rate: metric.asian_male_completion_rate,
    b_aa_all_eligible_total: metric.b_aa_all_eligible_total,
    b_aa_all_grad_total: metric.b_aa_all_grad_total,
    b_aa_all_grad_rate: metric.b_aa_all_grad_rate,
    b_aa_all_completers_total: metric.b_aa_all_completers_total,
    b_aa_all_completion_rate: metric.b_aa_all_completion_rate,
    b_aa_female_eligible_total: metric.b_aa_female_eligible_total,
    b_aa_female_grad_total: metric.b_aa_female_grad_total,
    b_aa_female_grad_rate: metric.b_aa_female_grad_rate,
    b_aa_female_completers_total: metric.b_aa_female_completers_total,
    b_aa_female_completion_rate: metric.b_aa_female_completion_rate,
    b_aa_male_eligible_total: metric.b_aa_male_eligible_total,
    b_aa_male_grad_total: metric.b_aa_male_grad_total,
    b_aa_male_grad_rate: metric.b_aa_male_grad_rate,
    b_aa_male_completers_total: metric.b_aa_male_completers_total,
    b_aa_male_completion_rate: metric.b_aa_male_completion_rate,
    l_h_all_eligible_total: metric.l_h_all_eligible_total,
    l_h_all_grad_total: metric.l_h_all_grad_total,
    l_h_all_grad_rate: metric.l_h_all_grad_rate,
    l_h_all_completers_total: metric.l_h_all_completers_total,
    l_h_all_completion_rate: metric.l_h_all_completion_rate,
    l_h_female_eligible_total: metric.l_h_female_eligible_total,
    l_h_female_grad_total: metric.l_h_female_grad_total,
    l_h_female_grad_rate: metric.l_h_female_grad_rate,
    l_h_female_completers_total: metric.l_h_female_completers_total,
    l_h_female_completion_rate: metric.l_h_female_completion_rate,
    l_h_male_eligible_total: metric.l_h_male_eligible_total,
    l_h_male_grad_total: metric.l_h_male_grad_total,
    l_h_male_grad_rate: metric.l_h_male_grad_rate,
    l_h_male_completers_total: metric.l_h_male_completers_total,
    l_h_male_completion_rate: metric.l_h_male_completion_rate,
    w_all_eligible_total: metric.w_all_eligible_total,
    w_all_grad_total: metric.w_all_grad_total,
    w_all_grad_rate: metric.w_all_grad_rate,
    w_all_completers_total: metric.w_all_completers_total,
    w_all_completion_rate: metric.w_all_completion_rate,
    w_female_eligible_total: metric.w_female_eligible_total,
    w_female_grad_total: metric.w_female_grad_total,
    w_female_grad_rate: metric.w_female_grad_rate,
    w_female_completers_total: metric.w_female_completers_total,
    w_female_completion_rate: metric.w_female_completion_rate,
    w_male_eligible_total: metric.w_male_eligible_total,
    w_male_grad_total: metric.w_male_grad_total,
    w_male_grad_rate: metric.w_male_grad_rate,
    w_male_completers_total: metric.w_male_completers_total,
    w_male_completion_rate: metric.w_male_completion_rate,
    nh_opi_all_eligible_total: metric.nh_opi_all_eligible_total,
    nh_opi_all_grad_total: metric.nh_opi_all_grad_total,
    nh_opi_all_grad_rate: metric.nh_opi_all_grad_rate,
    nh_opi_all_completers_total: metric.nh_opi_all_completers_total,
    nh_opi_all_completion_rate: metric.nh_opi_all_completion_rate,
    nh_opi_female_eligible_total: metric.nh_opi_female_eligible_total,
    nh_opi_female_grad_total: metric.nh_opi_female_grad_total,
    nh_opi_female_grad_rate: metric.nh_opi_female_grad_rate,
    nh_opi_female_completers_total: metric.nh_opi_female_completers_total,
    nh_opi_female_completion_rate: metric.nh_opi_female_completion_rate,
    nh_opi_male_eligible_total: metric.nh_opi_male_eligible_total,
    nh_opi_male_grad_total: metric.nh_opi_male_grad_total,
    nh_opi_male_grad_rate: metric.nh_opi_male_grad_rate,
    nh_opi_male_completers_total: metric.nh_opi_male_completers_total,
    nh_opi_male_completion_rate: metric.nh_opi_male_completion_rate,
    multi_racial_all_eligible_total: metric.multi_racial_all_eligible_total,
    multi_racial_all_grad_total: metric.multi_racial_all_grad_total,
    multi_racial_all_grad_rate: metric.multi_racial_all_grad_rate,
    multi_racial_all_completers_total: metric.multi_racial_all_completers_total,
    multi_racial_all_completion_rate: metric.multi_racial_all_completion_rate,
    multi_racial_female_eligible_total: metric.multi_racial_female_eligible_total,
    multi_racial_female_grad_total: metric.multi_racial_female_grad_total,
    multi_racial_female_grad_rate: metric.multi_racial_female_grad_rate,
    multi_racial_female_completers_total: metric.multi_racial_female_completers_total,
    multi_racial_female_completion_rate: metric.multi_racial_female_completion_rate,
    multi_racial_male_eligible_total: metric.multi_racial_male_eligible_total,
    multi_racial_male_grad_total: metric.multi_racial_male_grad_total,
    multi_racial_male_grad_rate: metric.multi_racial_male_grad_rate,
    multi_racial_male_completers_total: metric.multi_racial_male_completers_total,
    multi_racial_male_completion_rate: metric.multi_racial_male_completion_rate
  })
  .catch(error => console.log(`Error seeding grad by ethnicity and gender data: ${error}`));
};

const createGradIPSTMetric = (knex, metric) => {

  return knex('school_graduation_completion_ipst').insert({
    school_id: metric.school_id,
    school_year: metric.school_year,
    disabled_eligible_total: metric.disabled_eligible_total,
    disabled_grad_total: metric.disabled_grad_total,
    disabled_grad_rate: metric.disabled_grad_rate,
    disabled_completers_total: metric.disabled_completers_total,
    disabled_completion_rate: metric.disabled_completion_rate,
    limited_english_proficient_eligible_total: metric.limited_english_proficient_eligible_total,
    limited_english_proficient_grad_total: metric.limited_english_proficient_grad_total,
    limited_english_proficient_grad_rate: metric.limited_english_proficient_grad_rate,
    limited_english_proficient_completers_total: metric.limited_english_proficient_completers_total,
    limited_english_proficient_completion_rate: metric.limited_english_proficient_completion_rate,
    econ_disadvant_eligible_total: metric.econ_disadvant_eligible_total,
    econ_disadvant_grad_total: metric.econ_disadvant_grad_total,
    econ_disadvant_grad_rate: metric.econ_disadvant_grad_rate,
    econ_disadvant_completers_total: metric.econ_disadvant_completers_total,
    econ_disadvant_completion_rate: metric.econ_disadvant_completion_rate,
    migrant_eligible_total: metric.migrant_eligible_total,
    migrant_grad_total: metric.migrant_grad_total,
    migrant_grad_rate: metric.migrant_grad_rate,
    migrant_completers_total: metric.migrant_completers_total,
    migrant_completion_rate: metric.migrant_completion_rate,
    title_one_eligible_total: metric.title_one_eligible_total,
    title_one_grad_total: metric.title_one_grad_total,
    title_one_grad_rate: metric.title_one_grad_rate,
    title_one_completers_total: metric.title_one_completers_total,
    title_one_completion_rate: metric.title_one_completion_rate,
    homeless_eligible_total: metric.homeless_eligible_total,
    homeless_grad_total: metric.homeless_grad_total,
    homeless_grad_rate: metric.homeless_grad_rate,
    homeless_completers_total: metric.homeless_completers_total,
    homeless_completion_rate: metric.homeless_completion_rate,
    gifted_talented_eligible_total: metric.gifted_talented_eligible_total,
    gifted_talented_grad_total: metric.gifted_talented_grad_total,
    gifted_talented_grad_rate: metric.gifted_talented_grad_rate,
    gifted_talented_completers_total: metric.gifted_talented_completers_total,
    gifted_talented_completion_rate: metric.gifted_talented_completion_rate
  })
  .catch(error => console.log(`Error seeding grad by IPST data: ${error}`));
};

const createELAMathScoreMetric = (knex, metric) => {

  return knex('school_cmas_ela_math').insert({
    school_id: metric.school_id,
    school_year: metric.school_year,
    content_type: metric.content_type,
    test_name: metric.test_name,
    mean_scale_score: metric.mean_scale_score,
    number_met_exceeded_expectations_total: metric.number_met_exceeded_expectations_total,
    met_exceeded_expectations_rate: metric.met_exceeded_expectations_rate,
    change_met_exceeded_expectations_from_previous_sy: metric.change_met_exceeded_expectations_from_previous_sy
  })
  .catch(error => console.log(`Error seeding CMAS ELA and Math data: ${error}`));
};

const createScienceScoreMetric = (knex, metric) => {

  return knex('school_cmas_science').insert({
    school_id: metric.school_id,
    school_year: metric.school_year,
    content_type: metric.content_type,
    test_name: metric.test_name,
    mean_scale_score: metric.mean_scale_score,
    number_met_exceeded_expectations_total: metric.number_met_exceeded_expectations_total,
    met_exceeded_expectations_rate: metric.met_exceeded_expectations_rate,
    change_met_exceeded_expectations_from_previous_sy: metric.change_met_exceeded_expectations_from_previous_sy
  })
  .catch(error => console.log(`Error seeding CMAS science data: ${error}`));
};

const createSATPSATMetric = (knex, metric) => {

  return knex('school_sat_psat').insert({
    school_id: metric.school_id,
    school_year: metric.school_year,
    test_type: metric.test_type,
    students_total: metric.students_total,
    valid_scores_total: metric.valid_scores_total,
    evidence_based_reading_writing_mean_score: metric.evidence_based_reading_writing_mean_score,
    math_mean_score: metric.math_mean_score,
    overall_mean_score: metric.overall_mean_score,
    participation_rate: metric.participation_rate,
    valid_scores_prev_year: metric.valid_scores_prev_year,
    evidence_based_reading_writing_mean_score_prev_year: metric.evidence_based_reading_writing_mean_score_prev_year,
    math_mean_score_prev_year: metric.math_mean_score_prev_year,
    overall_mean_score_prev_year: metric.overall_mean_score_prev_year,
    participation_rate_prev_year: metric.participation_rate_prev_year,
    mean_overall_score_change: metric.mean_overall_score_change
  })
  .catch(error => console.log(`Error seeding SAT PSAT data: ${error}`));
};

const createFRLMetric = (knex, metric) => {

  return knex('school_free_reduced_lunch').insert({
    school_id: metric.school_id,
    school_year: metric.school_year,
    frl_rate: metric.frl_rate,
    frl_range: metric.frl_range
  })
  .catch(error => console.log(`Error seeding FRL data: ${error}`));
};

const createAttendanceMetric = (knex, metric) => {

  return knex('school_attendance').insert({
    school_id: metric.school_id,
    school_year: metric.school_year,
    student_fall_enrollment: metric.student_fall_enrollment,
    days_in_sy: metric.days_in_sy,
    total_possible_attendance_days: metric.total_possible_attendance_days.replace(/,/g, ''),
    total_days_attended: metric.total_days_attended.replace(/,/g, ''),
    total_excused_absenses: metric.total_excused_absenses.replace(/,/g, ''),
    total_unexcused_abasense: metric.total_unexcused_abasense.replace(/,/g, ''),
    attendance_rate: metric.attendance_rate,
    truancy_rate: metric.truancy_rate
  })
  .catch(error => console.log(`Error seeding attendance data: ${error}`));
};

const createPopulationOverviewMetric = (knex, metric) => {
  return knex('school_student_population').insert({
    school_id: metric.school_id,
    school_year: metric.school_year,
    female_ai_an_count: metric.female_ai_an_count,
    male_ai_an_count: metric.male_ai_an_count,
    female_asian_count: metric.female_asian_count,
    male_asian_count: metric.male_asian_count,
    female_b_aa_count: metric.female_b_aa_count,
    male_b_aa_count: metric.male_b_aa_count,
    female_h_l_count: metric.female_h_l_count,
    male_h_l_count: metric.male_h_l_count,
    female_white_count: metric.female_white_count,
    male_white_count: metric.male_white_count,
    female_nh_opi_count: metric.female_nh_opi_count,
    male_nh_opi_count: metric.male_nh_opi_count,
    female_multi_racial_count: metric.female_multi_racial_count,
    male_multi_racial_count: metric.male_multi_racial_count,
    total_student_count: metric.total_student_count
  })
  .catch(error => console.log(`Error seeding population data: ${error}`));
};

exports.seed = function(knex, Promise) {
  return knex('school_student_population').del()
    .then(() => knex('school_attendance').del())
    .then(() => knex('school_free_reduced_lunch').del())
    .then(() => knex('school_sat_psat').del())
    .then(() => knex('school_cmas_science').del())
    .then(() => knex('school_cmas_ela_math').del())
    .then(() => knex('school_graduation_completion_ipst').del())
    .then(() => knex('school_graduation_completion_gender_ethnicity').del())
    .then(() => knex('school_student_teacher_ratios').del())
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
