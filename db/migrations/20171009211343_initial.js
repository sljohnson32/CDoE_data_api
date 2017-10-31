exports.up = function(knex, Promise) {
  return Promise.all([
    knex.schema.createTable('counties', function(table) {
      table.increments('id').primary();
      table.string('name', 30).unique();
      table.string('county_code', 4).unique();

      table.timestamps(true, true);
    }),
    knex.schema.createTable('districts', function(table) {
      table.increments('id').primary();
      table.string('name', 50).unique();
      table.string('district_code', 4).unique();
      table.integer('county_id').unsigned();
      table.foreign('county_id').references('counties.id');

      table.timestamps(true, true);
    }),
    knex.schema.createTable('schools', function(table) {
      table.increments('id').primary();
      table.string('name');
      table.string('school_code', 4);
      table.string('dps_school_code', 4);
      table.string('address', 150);
      table.string('phone', 12);
      table.string('principal_name', 150);
      table.string('grade_levels', 10);
      table.string('grade_display', 30);
      table.string('website', 150);
      table.string('type', 20);
      table.string('location', 60);
      table.integer('county_id').unsigned();
      table.foreign('county_id').references('counties.id');
      table.integer('district_id').unsigned();
      table.foreign('district_id').references('districts.id');

      table.timestamps(true, true);
    })
  ]);
};

exports.down = function(knex, Promise) {
  return Promise.all([
    knex.schema.dropTable('schools'),
    knex.schema.dropTable('districts'),
    knex.schema.dropTable('counties')
  ]);
};
