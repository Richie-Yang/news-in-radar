'use strict';
const bcrypt = require('bcryptjs')

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
   await queryInterface.bulkInsert('Users', [
     {
       name: 'root',
       email: 'root@example.com',
       password: bcrypt.hashSync('123', bcrypt.genSaltSync(10)),
       is_admin: true,
       total_followers: 0,
       total_followings: 0,
       created_at: new Date(),
       updated_at: new Date()
     },
     {
       name: 'user1',
       email: 'user1@example.com',
       password: bcrypt.hashSync('123', bcrypt.genSaltSync(10)),
       is_admin: false,
       total_followers: 0,
       total_followings: 0,
       created_at: new Date(),
       updated_at: new Date()
     },
     {
       name: 'user2',
       email: 'user2@example.com',
       password: bcrypt.hashSync('123', bcrypt.genSaltSync(10)),
       is_admin: false,
       total_followers: 0,
       total_followings: 0,
       created_at: new Date(),
       updated_at: new Date()
     }
   ], {})
  },

  async down (queryInterface, Sequelize) {
    /**
     * Add commands to revert seed here.
     *
     * Example:
     * await queryInterface.bulkDelete('People', null, {});
     */
    await queryInterface.bulkDelete('Users', null, {})
  }
};
