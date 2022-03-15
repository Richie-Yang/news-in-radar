'use strict'

module.exports = {
  async up (queryInterface, Sequelize) {
    /**
     * Add altering commands here.
     *
     * Example:
     * await queryInterface.createTable('users', { id: Sequelize.INTEGER });
     */
    await queryInterface.addColumn('News', 'category_id', {
      type: Sequelize.INTEGER,
      allowNull: false,
      defaultValue: 0,
      reference: {
        model: 'Category',
        key: 'id'
      }
    }, {})
  },

  async down (queryInterface, Sequelize) {
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */
    await queryInterface.removeColumn('News', 'category_id', {})
  }
}
