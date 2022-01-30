'use strict';

module.exports = {
  async up (queryInterface, Sequelize) {
    /**
     * Add altering commands here.
     *
     * Example:
     * await queryInterface.createTable('users', { id: Sequelize.INTEGER });
     */
    await Promise.all([
      queryInterface.addColumn('Comments', 'news_id', {
        type: Sequelize.INTEGER,
        allowNull: false,
        reference: {
          model: 'News',
          key: 'id'
        }
      }, {}),

      queryInterface.addColumn('Comments', 'user_id', {
        type: Sequelize.INTEGER,
        allowNull: false,
        reference: {
          model: 'Users',
          key: 'id'
        }
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
      queryInterface.removeColumn('Comments', 'news_id', {}),
      queryInterface.removeColumn('Comments', 'user_id', {})
    ])
  }
};
