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
   await queryInterface.bulkInsert('News', 
      Array.from({ length: 100 }, () => ({
        title: faker.lorem.sentence(),
        content: faker.lorem.paragraphs(),
        author: faker.company.companyName(),
        image: faker.image.imageUrl(),
        total_likes: 0,
        total_comments: 0,
        created_at: faker.date.past(),
        updated_at: faker.date.recent()
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
    await queryInterface.bulkDelete('News', null, {})
  }
};
