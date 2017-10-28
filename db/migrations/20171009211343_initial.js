exports.up = function(knex, Promise) {
  return Promise.all([
    knex.schema.createTable('counties', function(table) {
      table.increments('id').primary();
      table.string('name').unique();
      table.string('county_code').unique();

      table.timestamps(true, true);
    }),
    knex.schema.createTable('districts', function(table) {
      table.increments('id').primary();
      table.string('name').unique();
      table.string('district_code').unique();
      table.integer('county_id').unsigned();
      table.foreign('county_id').references('counties.id');

      table.timestamps(true, true);
    }),
    knex.schema.createTable('schools', function(table) {
      table.increments('id').primary();
      table.string('name');
      table.string('school_code').unique();
      table.float('student_count');
      table.float('teacher_count');
      table.float('student_teacher_ratio');
      table.integer('district_id').unsigned();
      table.foreign('district_id').references('districts.id');

      table.timestamps(true, true);
    }),
  ]);
};

exports.down = function(knex, Promise) {
  return Promise.all([
    knex.dropTable('schools'),
    knex.dropTable('districts'),
    knex.dropTable('counties')
  ]);
};
