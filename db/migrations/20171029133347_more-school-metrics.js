exports.up = function(knex, Promise) {
  return Promise.all([
    knex.schema.createTable('school_free_reduced_lunch', function(table) {
      table.increments('id').primary();
      table.string('school_year');
      table.decimal('student_count', 8, 2);
      table.decimal('teacher_count', 8, 2);
      table.decimal('ratio', 5, 2);
      table.integer('school_id').unsigned();
      table.foreign('school_id').references('schools.id');

      table.timestamps(true, true);
    }),
    knex.schema.createTable('school_graduation_completion_gender_ethnicity', function(table) {
      table.increments('id').primary();
      table.string('school_year');
      table.decimal('student_count', 8, 2);
      table.decimal('teacher_count', 8, 2);
      table.decimal('ratio', 5, 2);
      table.integer('school_id').unsigned();
      table.foreign('school_id').references('schools.id');

      table.timestamps(true, true);
    }),
    knex.schema.createTable('school_graduation_completion_ipst', function(table) {
      table.increments('id').primary();
      table.string('school_year');
      table.decimal('student_count', 8, 2);
      table.decimal('teacher_count', 8, 2);
      table.decimal('ratio', 5, 2);
      table.integer('school_id').unsigned();
      table.foreign('school_id').references('schools.id');

      table.timestamps(true, true);
    }),
    knex.schema.createTable('school_cmas_ela_math', function(table) {
      table.increments('id').primary();
      table.string('school_year');
      table.decimal('student_count', 8, 2);
      table.decimal('teacher_count', 8, 2);
      table.decimal('ratio', 5, 2);
      table.integer('school_id').unsigned();
      table.foreign('school_id').references('schools.id');

      table.timestamps(true, true);
    }),
    knex.schema.createTable('school_cmas_science', function(table) {
      table.increments('id').primary();
      table.string('school_year');
      table.decimal('student_count', 8, 2);
      table.decimal('teacher_count', 8, 2);
      table.decimal('ratio', 5, 2);
      table.integer('school_id').unsigned();
      table.foreign('school_id').references('schools.id');

      table.timestamps(true, true);
    }),
    knex.schema.createTable('school_sat_psat', function(table) {
      table.increments('id').primary();
      table.string('school_year');
      table.decimal('student_count', 8, 2);
      table.decimal('teacher_count', 8, 2);
      table.decimal('ratio', 5, 2);
      table.integer('school_id').unsigned();
      table.foreign('school_id').references('schools.id');

      table.timestamps(true, true);
    }),
    knex.schema.createTable('school_attendance', function(table) {
      table.increments('id').primary();
      table.string('school_year');
      table.decimal('student_count', 8, 2);
      table.decimal('teacher_count', 8, 2);
      table.decimal('ratio', 5, 2);
      table.integer('school_id').unsigned();
      table.foreign('school_id').references('schools.id');

      table.timestamps(true, true);
    }),
    knex.schema.createTable('school_student_population', function(table) {
      table.increments('id').primary();
      table.string('school_year');
      table.decimal('student_count', 8, 2);
      table.decimal('teacher_count', 8, 2);
      table.decimal('ratio', 5, 2);
      table.integer('school_id').unsigned();
      table.foreign('school_id').references('schools.id');

      table.timestamps(true, true);
    }),
  ]);
};

exports.down = function(knex, Promise) {
  return Promise.all([
    knex.schema.dropTable('school_student_population'),
    knex.schema.dropTable('school_attendance'),
    knex.schema.dropTable('school_sat_psat'),
    knex.schema.dropTable('school_cmas_science'),
    knex.schema.dropTable('school_cmas_ela_math'),
    knex.schema.dropTable('school_graduation_completion_ipst'),
    knex.schema.dropTable('school_graduation_completion_gender_ethnicity'),
    knex.schema.dropTable('school_free-reduced-lunch'),
  ]);
};
