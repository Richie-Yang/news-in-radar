'use strict'

module.exports = {
  async up (queryInterface, Sequelize) {
    /**
     * Add altering commands here.
     *
     * Example:
     * await queryInterface.createTable('users', { id: Sequelize.INTEGER });
     */
    await Promise.all([
      queryInterface.addColumn('Users', 'is_active', {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      }, {}),
      queryInterface.addColumn('Users', 'validation_code', {
        type: Sequelize.STRING,
        allowNull: true
      }, {}),
      queryInterface.addColumn('Users', 'validation_time', {
        type: Sequelize.DATE,
        allowNull: true
      }, {})
    ])
  },

  async down (queryInterface, Sequelize) {
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */
    await Promise.all([
      queryInterface.removeColumn('Users', 'is_active', {}),
      queryInterface.removeColumn('Users', 'validation_code', {}),
      queryInterface.removeColumn('Users', 'validation_time', {})
    ])
  }
}
