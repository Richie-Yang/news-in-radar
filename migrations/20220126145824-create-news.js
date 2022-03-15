'use strict'
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable('News', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      title: {
        allowNull: false,
        type: Sequelize.TEXT
      },
      description: {
        allowNull: false,
        type: Sequelize.TEXT
      },
      author: {
        type: Sequelize.STRING
      },
      url: {
        type: Sequelize.TEXT
      },
      url_to_image: {
        type: Sequelize.STRING
      },
      total_likes: {
        allowNull: false,
        defaultValue: 0,
        type: Sequelize.INTEGER
      },
      total_comments: {
        allowNull: false,
        defaultValue: 0,
        type: Sequelize.INTEGER
      },
      is_seed: {
        allowNull: false,
        defaultValue: false,
        type: Sequelize.BOOLEAN
      },
      published_at: {
        type: Sequelize.DATE
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updated_at: {
        allowNull: false,
        type: Sequelize.DATE
      }
    })
  },
  async down (queryInterface, Sequelize) {
    await queryInterface.dropTable('News')
  }
}
