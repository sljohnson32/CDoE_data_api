exports.up = function(knex, Promise) {
  return Promise.all([
    knex.schema.createTable('school_student_teacher_ratios', function(table) {
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
    knex.schema.dropTable('school_student_teacher_ratios'),
  ]);
};
