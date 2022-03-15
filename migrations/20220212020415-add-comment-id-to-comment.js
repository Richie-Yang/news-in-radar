'use strict'

module.exports = {
  async up (queryInterface, Sequelize) {
    /**
     * Add altering commands here.
     *
     * Example:
     * await queryInterface.createTable('users', { id: Sequelize.INTEGER });
     */
    await queryInterface.addColumn('Comments', 'comment_id', {
      type: Sequelize.INTEGER,
      allowNull: true,
      reference: {
        model: 'Comment',
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
    await queryInterface.removeColumn('Comments', 'comment_id', {})
  }
}
