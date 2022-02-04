'use strict';
const faker = require('faker')

module.exports = {
  async up (queryInterface, Sequelize) {
    /**
     * Add seed commands here.
     *
     * Example:
     * await queryInterface.bulkInsert('People', [{
     *   name: 'John Doe',
     *   isBetaMember: false
     * }], {});
    */
   const [users, news] = await Promise.all([
     queryInterface.sequelize.query(
       'SELECT id FROM Users;',
       { type: queryInterface.sequelize.QueryTypes.SELECT }
     ),
     queryInterface.sequelize.query(
       'SELECT id FROM News;',
       { type: queryInterface.sequelize.QueryTypes.SELECT }
     ),
   ])

   await queryInterface.bulkInsert('Comments', 
    Array.from({ length: 100 }, () => ({
      content: faker.lorem.text(),
      user_id: Math.floor(Math.random() * users.length),
      news_id: Math.floor(Math.random() * news.length),
      is_seed: true,
      created_at: new Date(),
      updated_at: new Date()
    })), {}
   )
  },

  async down (queryInterface, Sequelize) {
    /**
     * Add commands to revert seed here.
     *
     * Example:
     * await queryInterface.bulkDelete('People', null, {});
     */
    await queryInterface.bulkDelete('Comments', { is_seed: true }, {})
  }
};
