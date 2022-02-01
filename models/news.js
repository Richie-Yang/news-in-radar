'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class News extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      News.hasMany(models.Comment, { foreignKey: 'newsId' })
      News.belongsToMany(models.User, {
        through: models.Like,
        foreignKey: 'newsId',
        as: 'LikedUsersForNews'
      })
    }
  }
  News.init({
    title: DataTypes.STRING,
    content: DataTypes.TEXT,
    author: DataTypes.STRING,
    image: DataTypes.STRING,
    totalLikes: DataTypes.INTEGER,
    totalComments: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'News',
    tabletName: 'News',
    underscored: true,
  });
  return News;
};