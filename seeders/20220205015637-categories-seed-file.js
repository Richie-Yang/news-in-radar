'use strict'

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
    const categoryArray = [
      {
        name: 'tw',
        displayName: '台灣'
      },
      {
        name: 'us',
        displayName: '美國'
      },
      {
        name: 'gb',
        displayName: '英國'
      }
    ]

    await queryInterface.bulkInsert('Categories',
      Array.from({ length: categoryArray.length }, (_, index) => ({
        name: categoryArray[index].name,
        display_name: categoryArray[index].displayName,
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
    await queryInterface.bulkDelete('Categories', null, {})
  }
}
