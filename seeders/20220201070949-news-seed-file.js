'use strict'
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
      Array.from({ length: 27 }, () => ({
        title: faker.lorem.sentence(),
        description: faker.lorem.paragraphs(),
        author: faker.company.companyName(),
        url: faker.internet.url(),
        url_to_image: faker.image.imageUrl(),
        total_likes: 0,
        total_comments: 0,
        is_seed: true,
        published_at: faker.date.past(),
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
    await queryInterface.bulkDelete('News', { is_seed: true }, {})
  }
}
