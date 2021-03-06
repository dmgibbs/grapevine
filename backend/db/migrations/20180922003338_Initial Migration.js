
exports.up = (knex, Promise) => {
  return Promise.all([
    knex.schema.createTable('users', function (table) {
      table.increments('id');
      table.string('first_name');
      table.string('last_name');
      table.string('username');
      table.string('email');
      table.string('password');
      table.float('average_rating');
      table.integer('default_location_id');
      table.string('avatar_image_url');
      table.string('phone_number')
      table.timestamp('created_at', true).defaultTo(knex.fn.now());
    }),
    knex.schema.createTable('foods', function (table) {
      table.increments('id');
      table.string('name');
    }),
    knex.schema.createTable('wishlist_items', function (table) { //user_foods
      table.integer('user_id');
      table.integer('food_id');
      table.timestamp('created_at', true).defaultTo(knex.fn.now());
    }),
    knex.schema.createTable('posts', function (table) {
      table.increments('id');
      table.integer('user_id');
      table.integer('food_id');
      table.string('food_picture_url');
      table.text('description');
      table.string('status'); //available, pending, complete, delisted
      table.integer('location_id'); //location they set as their location for this post
      table.timestamp('created_at', true).defaultTo(knex.fn.now());
    }),
    knex.schema.createTable('trades', function (table) {
      table.increments('id');
      table.integer('post_id'); // what is the post that sparked this trade?
      table.date('closing_date');
      table.integer('suggested_location_id');
      table.integer('actual_location_id');
      table.jsonb('edges'); // format = [{from: username, to: username, foods: [food_names]},...]
      table.timestamp('created_at', true).defaultTo(knex.fn.now());
    }),
    knex.schema.createTable('trade_users', function (table) { //participants of a trade
      table.integer('trade_id');
      table.integer('user_id');
      table.boolean('confirmed'); //agreed to what items will be traded
      table.date('availability_start');
      table.date('availability_end');
      table.integer('location_id'); //location they set as their location for this trade
    }),
    knex.schema.createTable('locations', function (table) {
      table.increments('id');
      table.string('street_address');
      table.string('city');
      table.string('province');
      table.string('postal_code');
      table.float('latitude');
      table.float('longitude');
      table.timestamp('created_at', true).defaultTo(knex.fn.now());
    }),
    knex.schema.createTable('messages', function (table) {
      table.increments('id');
      table.integer('user_id');
      table.integer('trade_id');
      table.string('content');
      table.timestamp('created_at', true).defaultTo(knex.fn.now());
    }),
    knex.schema.createTable('reviews', function (table) {
      table.integer('user_id');
      table.integer('reviewer_id');
      table.integer('rating');
      table.text('content');
      table.timestamp('created_at', true).defaultTo(knex.fn.now());
    }),
    knex.schema.createTable('potential_trades', function (table) { //edges: from_user has(posts) a food that to_user wants(is on wishlist)
      table.increments('id');
      table.integer('from_user_id');
      table.integer('to_user_id');
      table.integer('food_id');
      table.timestamp('created_at', true).defaultTo(knex.fn.now());
    })
  ])
};

exports.down = (knex, Promise) => {
  return Promise.all([
    knex.schema.dropTable('users'),
    knex.schema.dropTable('foods'),
    knex.schema.dropTable('wishlist_items'),
    knex.schema.dropTable('posts'),
    knex.schema.dropTable('trades'),
    knex.schema.dropTable('trade_users'),
    knex.schema.dropTable('locations'),
    knex.schema.dropTable('messages'),
    knex.schema.dropTable('reviews'),
    knex.schema.dropTable('potential_trades')
  ])
};
